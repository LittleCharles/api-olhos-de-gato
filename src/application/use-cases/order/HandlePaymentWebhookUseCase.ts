import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import type { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository.js";
import type { IStoreSettingsRepository } from "../../../domain/repositories/IStoreSettingsRepository.js";
import type { IMailProvider } from "../../interfaces/IMailProvider.js";
import { OrderStatus, PaymentStatus } from "../../../domain/enums/index.js";
import { prisma } from "../../../infrastructure/database/prisma/client.js";
import { buildPaymentConfirmedEmail } from "../../../infrastructure/providers/mail/templates/orderEmails.js";

interface HandlePaymentEventInput {
  // Evento do webhook v2 da AbacatePay:
  // "checkout.completed" (pago) | "checkout.lost" (abandono/expiração) |
  // "checkout.refunded" (reembolso) | "checkout.disputed" (disputa).
  event: string;
  orderId: string;
}

@injectable()
export class HandlePaymentWebhookUseCase {
  constructor(
    @inject("OrderRepository")
    private orderRepository: IOrderRepository,
    @inject("ProductRepository")
    private productRepository: IProductRepository,
    @inject("CustomerRepository")
    private customerRepository: ICustomerRepository,
    @inject("StoreSettingsRepository")
    private storeSettingsRepository: IStoreSettingsRepository,
    @inject("MailProvider")
    private mailProvider: IMailProvider,
  ) {}

  async execute(input: HandlePaymentEventInput): Promise<void> {
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) return;

    // Pagamento confirmado
    if (input.event === "checkout.completed") {
      // Idempotência: ignora se já está pago
      if (order.paymentStatus === PaymentStatus.PAID) return;

      order.updatePaymentStatus(PaymentStatus.PAID);
      order.confirm();
      await this.orderRepository.update(order);
      await this.orderRepository.addStatusHistory(
        order.id,
        OrderStatus.CONFIRMED,
        "Pagamento confirmado via AbacatePay",
      );

      // E-mail de confirmação (best-effort — não quebra o webhook)
      try {
        const customer = await this.customerRepository.findById(order.customerId);
        if (customer?.email) {
          const store = await this.storeSettingsRepository.get();
          const email = buildPaymentConfirmedEmail(
            order,
            { name: customer.name, email: customer.email },
            {
              name: store.storeName,
              address: store.address,
              email: store.email,
              socialInstagram: store.socialInstagram || undefined,
              socialFacebook: store.socialFacebook || undefined,
              socialTiktok: store.socialTiktok || undefined,
            },
          );
          await this.mailProvider.send({ to: customer.email, ...email });
        }
      } catch (err) {
        console.error("[AbacatePay] Falha ao enviar email de pagamento confirmado:", err);
      }
      return;
    }

    // Abandono/expiração (checkout.lost) ou reembolso (checkout.refunded) → cancela + restaura estoque
    if (input.event === "checkout.lost" || input.event === "checkout.refunded") {
      const isRefund = input.event === "checkout.refunded";
      const targetPaymentStatus = isRefund ? PaymentStatus.REFUNDED : PaymentStatus.FAILED;

      // Idempotência: ignora se já processado (evita restaurar estoque duas vezes)
      if (
        order.paymentStatus === targetPaymentStatus ||
        order.status === OrderStatus.CANCELLED
      ) {
        return;
      }

      const historyNote = isRefund
        ? "Pagamento reembolsado via AbacatePay — pedido cancelado e estoque restaurado"
        : "Cobrança não concluída (checkout.lost) — pedido cancelado e estoque restaurado";

      // Atômico: cancelamento + restauração de estoque + histórico, tudo ou nada
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: targetPaymentStatus,
            status: OrderStatus.CANCELLED,
          },
        });

        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: OrderStatus.CANCELLED,
            notes: historyNote,
          },
        });
      });
      return;
    }

    // checkout.disputed e outros eventos → sem ação automática.
  }
}
