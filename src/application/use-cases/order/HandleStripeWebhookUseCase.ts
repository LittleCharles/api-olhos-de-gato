import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import type { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository.js";
import type { IStoreSettingsRepository } from "../../../domain/repositories/IStoreSettingsRepository.js";
import type { IMailProvider } from "../../interfaces/IMailProvider.js";
import { OrderStatus, PaymentStatus } from "../../../domain/enums/index.js";
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
              { name: store.storeName, address: store.address },
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

        order.updatePaymentStatus(PaymentStatus.FAILED);
        await this.orderRepository.update(order);

        // Restore stock for all items since payment failed
        for (const item of order.items) {
          await this.productRepository.updateStock(item.productId, item.quantity);
        }
        await this.orderRepository.addStatusHistory(
          order.id,
          order.status,
          "Pagamento falhou via Stripe - estoque restaurado",
        );
        break;
      }
    }
  }
}
