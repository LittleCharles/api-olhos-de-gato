import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";
import type { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository.js";
import type { IMailProvider } from "../../interfaces/IMailProvider.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { buildTrackingEmail } from "../../../infrastructure/providers/mail/templates/orderEmails.js";

@injectable()
export class UpdateTrackingCodeUseCase {
  constructor(
    @inject("OrderRepository")
    private orderRepository: IOrderRepository,
    @inject("CustomerRepository")
    private customerRepository: ICustomerRepository,
    @inject("MailProvider")
    private mailProvider: IMailProvider,
  ) {}

  async execute(id: string, trackingCode: string): Promise<void> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    await this.orderRepository.updateTrackingCode(id, trackingCode);

    // Tracking email só faz sentido para delivery
    if (order.isPickup) return;

    try {
      const customer = await this.customerRepository.findById(order.customerId);
      if (customer?.email) {
        const email = buildTrackingEmail(order, trackingCode, {
          name: customer.name,
          email: customer.email,
        });
        await this.mailProvider.send({ to: customer.email, ...email });
      }
    } catch (err) {
      console.error("[UpdateTracking] Falha ao enviar email de rastreio:", err);
    }
  }
}
