import { Order } from "../entities/Order.js";
import { OrderStatus } from "../enums/index.js";
import { PaginatedResult, PaginationParams } from "./IProductRepository.js";

export interface OrderFilters {
  customerId?: string;
  status?: OrderStatus;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByCustomer(
    customerId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Order>>;
  findAll(
    filters?: OrderFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Order>>;
  create(order: Order): Promise<Order>;
  update(order: Order): Promise<Order>;
  addStatusHistory(
    orderId: string,
    status: OrderStatus,
    notes?: string,
  ): Promise<void>;
  updateTrackingCode(id: string, trackingCode: string): Promise<void>;
  findByIdWithDetails(id: string): Promise<any>;
}
