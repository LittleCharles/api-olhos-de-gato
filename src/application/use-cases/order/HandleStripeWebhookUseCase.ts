import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import type { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository.js";
import type { IStoreSettingsRepository } from "../../../domain/repositories/IStoreSettingsRepository.js";
import type { IMailProvider } from "../../interfaces/IMailProvider.js";
import { OrderStatus, PaymentStatus } from "../../../domain/enums/index.js";
import { prisma } from "../../../infrastructure/database/prisma/client.js";
import { buildPaymentConfirmedEmail } from "../../../infrastructure/providers/mail/templates/orderEmails.js";
import { sendGa4Purchase } from "../../../infrastructure/providers/analytics/Ga4MeasurementProtocol.js";

interface HandleStripeEventInput {
  eventType: string;
  orderId: string;
  // payment_status da sessão Stripe ("paid" | "unpaid" | "no_payment_required").
  // No PIX, o checkout.session.completed chega como "unpaid" (QR gerado, ainda não pago).
  paymentStatus?: string;
}

@injectable()
export class HandleStripeWebhookUseCase {
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

  async execute(input: HandleStripeEventInput): Promise<void> {
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) return;

    switch (input.eventType) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        // PIX e outros métodos assíncronos: o "completed" chega ANTES do pagamento
        // (payment_status "unpaid" — cliente só gerou o QR). Nesse caso aguardamos o
        // "async_payment_succeeded". Cartão chega "paid" já no próprio "completed".
        if (
          input.eventType === "checkout.session.completed" &&
          input.paymentStatus !== "paid"
        ) {
          return;
        }

        // Idempotency: skip if already paid
        if (order.paymentStatus === PaymentStatus.PAID) return;

        order.updatePaymentStatus(PaymentStatus.PAID);
        order.confirm();
        await this.orderRepository.update(order);
        await this.orderRepository.addStatusHistory(
          order.id,
          OrderStatus.CONFIRMED,
          "Pagamento confirmado via Stripe",
        );

        // Best-effort confirmation email (does not break webhook flow)
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
          console.error("[Stripe] Falha ao enviar email de pagamento confirmado:", err);
        }

        // Best-effort: purchase server-side pro GA4 (Measurement Protocol). Fonte de verdade
        // confiável; deduplicado pelo transaction_id com o evento client-side. Usa o client_id
        // real capturado no checkout (gaClientId) — no-op se ausente (sem consentimento de analytics).
        try {
          const attribution = await prisma.order.findUnique({
            where: { id: order.id },
            select: { gaClientId: true },
          });
          await sendGa4Purchase({
            clientId: attribution?.gaClientId,
            transactionId: order.id,
            value: order.total.getValue(),
            currency: "BRL",
            items: order.items.map((item) => ({
              itemId: item.productId,
              itemName: item.productName,
              quantity: item.quantity,
              price: item.unitPrice.getValue(),
            })),
          });
        } catch (err) {
          console.error("[GA4] Falha ao enviar purchase server-side:", err);
        }
        break;
      }

      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        // Idempotency: skip if already processed (prevents double stock restoration)
        if (order.paymentStatus === PaymentStatus.FAILED) return;

        const isExpired = input.eventType === "checkout.session.expired";
        const historyNote = isExpired
          ? "Sessão Stripe expirou — pedido cancelado e estoque restaurado"
          : "Pagamento falhou via Stripe — pedido cancelado e estoque restaurado";

        // Atomic: order cancellation + stock restoration + history log all-or-nothing
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: PaymentStatus.FAILED,
              status: OrderStatus.CANCELLED,
            },
          });

          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }

          // Devolve o uso do cupom (espelha a restauração de estoque) — evita queimar
          // vaga de cupom limitado em checkout abandonado. Guard usedCount > 0 = piso 0;
          // idempotência garantida pelo check paymentStatus === FAILED acima.
          if (order.couponId) {
            await tx.coupon.updateMany({
              where: { id: order.couponId, usedCount: { gt: 0 } },
              data: { usedCount: { decrement: 1 } },
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
        break;
      }
    }
  }
}
