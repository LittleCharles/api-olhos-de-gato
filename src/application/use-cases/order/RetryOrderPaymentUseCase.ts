import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";
import { Order } from "../../../domain/entities/Order.js";
import { OrderStatus, PaymentStatus } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";

interface RetryOrderPaymentInput {
  orderId: string;
  customerId: string;
}

@injectable()
export class RetryOrderPaymentUseCase {
  constructor(
    @inject("OrderRepository")
    private orderRepository: IOrderRepository,
  ) {}

  async execute(input: RetryOrderPaymentInput): Promise<Order> {
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    // Ownership: prevent IDOR — só o dono do pedido pode reabrir o pagamento
    if (order.customerId !== input.customerId) {
      throw new AppError("Pedido não encontrado", 404);
    }

    // Estado: só pedidos ainda aguardando pagamento podem regerar session
    if (order.status !== OrderStatus.PENDING || order.paymentStatus !== PaymentStatus.PENDING) {
      throw new AppError(
        "Esse pedido não pode mais ser pago. Refaça pra continuar a compra.",
        409,
      );
    }

    return order;
  }
}
