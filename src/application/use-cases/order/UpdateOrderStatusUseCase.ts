import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { Order } from "../../../domain/entities/Order.js";
import { OrderStatus } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    @inject("OrderRepository")
    private orderRepository: IOrderRepository,
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) {}

  async execute(id: string, status: OrderStatus, notes?: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    const wasCancellable = order.canBeCancelled();

    order.updateStatus(status);

    const updated = await this.orderRepository.update(order);

    await this.orderRepository.addStatusHistory(id, status, notes);

    // Restore stock when order is cancelled
    if (status === OrderStatus.CANCELLED && wasCancellable) {
      for (const item of order.items) {
        await this.productRepository.updateStock(item.productId, item.quantity);
      }
    }

    return updated;
  }
}
