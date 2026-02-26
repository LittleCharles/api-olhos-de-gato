import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";
import { Order } from "../../../domain/entities/Order.js";
import { PaginatedResult } from "../../../domain/repositories/IProductRepository.js";

@injectable()
export class ListCustomerOrdersUseCase {
  constructor(
    @inject("OrderRepository")
    private orderRepository: IOrderRepository,
  ) {}

  async execute(customerId: string, pagination?: { page: number; limit: number }): Promise<PaginatedResult<Order>> {
    return this.orderRepository.findByCustomer(customerId, pagination);
  }
}
