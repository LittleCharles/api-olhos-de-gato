import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import type { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository.js";
import type { IStoreSettingsRepository } from "../../../domain/repositories/IStoreSettingsRepository.js";
import type { IMailProvider } from "../../interfaces/IMailProvider.js";
import { Order } from "../../../domain/entities/Order.js";
import { OrderStatus } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";
import {
  buildStatusChangeEmail,
  buildShippedEmail,
  buildPaymentConfirmedEmail,
} from "../../../infrastructure/providers/mail/templates/orderEmails.js";

@injectable()
export class UpdateOrderStatusUseCase {
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

  async execute(
    id: string,
    status: OrderStatus,
    notes?: string,
    trackingCode?: string,
  ): Promise<Order> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    const wasCancellable = order.canBeCancelled();

    // Envio exige código de rastreio — vai junto no mesmo passo (e no mesmo email).
    if (status === OrderStatus.SHIPPED) {
      if (!trackingCode) {
        throw new AppError(
          "Código de rastreio é obrigatório para marcar como enviado",
          400,
        );
      }
      order.updateTrackingCode(trackingCode);
    }

    order.updateStatus(status);

    const updated = await this.orderRepository.update(order);

    await this.orderRepository.addStatusHistory(id, status, notes);

    // Restore stock when order is cancelled
    if (status === OrderStatus.CANCELLED && wasCancellable) {
      for (const item of order.items) {
        await this.productRepository.updateStock(item.productId, item.quantity);
      }
    }

    // Email best-effort (não bloqueia a atualização). PENDING e PREPARING não disparam email.
    if (status !== OrderStatus.PENDING && status !== OrderStatus.PREPARING) {
      try {
        const customer = await this.customerRepository.findById(updated.customerId);
        if (customer?.email) {
          const store = await this.storeSettingsRepository.get();
          const storeInfo = {
            name: store.storeName,
            address: store.address,
            email: store.email,
            socialInstagram: store.socialInstagram || undefined,
            socialFacebook: store.socialFacebook || undefined,
            socialTiktok: store.socialTiktok || undefined,
          };
          const customerInfo = { name: customer.name, email: customer.email };

          let email: { subject: string; html: string } | null;
          if (status === OrderStatus.SHIPPED) {
            // Envio: email único com o código de rastreio (garantido acima).
            email = buildShippedEmail(updated, trackingCode!, customerInfo, storeInfo);
          } else if (status === OrderStatus.CONFIRMED) {
            // Confirmação manual (ex.: pagamento na retirada). Pedidos Stripe recebem via
            // webhook, que não passa por este use case — sem risco de email duplicado.
            email = buildPaymentConfirmedEmail(updated, customerInfo, storeInfo);
          } else {
            // READY (retirada), DELIVERED, CANCELLED
            email = buildStatusChangeEmail(updated, status, customerInfo, storeInfo, notes);
          }

          if (email) {
            await this.mailProvider.send({ to: customer.email, ...email });
          }
        }
      } catch (err) {
        console.error("[UpdateOrderStatus] Falha ao enviar email de status:", err);
      }
    }

    return updated;
  }
}
