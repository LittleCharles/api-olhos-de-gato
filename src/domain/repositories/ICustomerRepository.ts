import { Customer } from "../entities/Customer.js";
import { PaginatedResult, PaginationParams } from "./IProductRepository.js";

export interface CustomerFilters {
  search?: string;
  isActive?: boolean;
}

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findAll(filters?: CustomerFilters, pagination?: PaginationParams): Promise<PaginatedResult<Customer>>;
  updateStatus(userId: string, isActive: boolean): Promise<void>;
  getStats(): Promise<{ totalCustomers: number; activeCustomers: number; avgTicket: number; newThisMonth: number }>;
}
