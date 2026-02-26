import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";
import { Order } from "../../../domain/entities/Order.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class GetCustomerOrderUseCase {
  constructor(
    @inject("OrderRepository")
    private orderRepository: IOrderRepository,
  ) {}

  async execute(orderId: string, customerId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    if (order.customerId !== customerId) {
      throw new AppError("Acesso negado", 403);
    }

    return order;
  }
}
