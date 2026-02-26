import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";
import type { PaginatedResult } from "../../../domain/repositories/IProductRepository.js";
import { Order } from "../../../domain/entities/Order.js";
import { AdminOrderFiltersDTO } from "../../dtos/OrderDTO.js";

@injectable()
export class ListOrdersUseCase {
  constructor(
    @inject("OrderRepository")
    private orderRepository: IOrderRepository,
  ) {}

  async execute(filters: AdminOrderFiltersDTO): Promise<PaginatedResult<Order>> {
    const { page, limit, dateFrom, dateTo, ...rest } = filters;

    return this.orderRepository.findAll(
      {
        ...rest,
        startDate: dateFrom,
        endDate: dateTo,
      },
      { page, limit },
    );
  }
}
