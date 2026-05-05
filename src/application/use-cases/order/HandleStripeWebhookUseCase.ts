import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import type { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository.js";
import type { IStoreSettingsRepository } from "../../../domain/repositories/IStoreSettingsRepository.js";
import type { IMailProvider } from "../../interfaces/IMailProvider.js";
import { OrderStatus, PaymentStatus } from "../../../domain/enums/index.js";
import { prisma } from "../../../infrastructure/database/prisma/client.js";
import { buildPaymentConfirmedEmail } from "../../../infrastructure/providers/mail/templates/orderEmails.js";

interface HandleStripeEventInput {
  eventType: string;
  orderId: string;
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
        break;
      }

      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        // Idempotency: skip if already processed (prevents double stock restoration)
        if (order.paymentStatus === PaymentStatus.FAILED) return;

        // Atomic: payment status update + stock restoration + history log all-or-nothing
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { paymentStatus: PaymentStatus.FAILED },
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
              status: order.status,
              notes: "Pagamento falhou via Stripe - estoque restaurado",
            },
          });
        });
        break;
      }
    }
  }
}
