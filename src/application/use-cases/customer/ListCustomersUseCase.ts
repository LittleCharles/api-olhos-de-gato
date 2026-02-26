import { inject, injectable } from "tsyringe";
import type { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository.js";
import type { PaginatedResult } from "../../../domain/repositories/IProductRepository.js";
import { Customer } from "../../../domain/entities/Customer.js";
import { CustomerFiltersDTO } from "../../dtos/CustomerDTO.js";

@injectable()
export class ListCustomersUseCase {
  constructor(
    @inject("CustomerRepository")
    private customerRepository: ICustomerRepository,
  ) {}

  async execute(filters: CustomerFiltersDTO): Promise<{
    data: Customer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: {
      totalCustomers: number;
      activeCustomers: number;
      avgTicket: number;
      newThisMonth: number;
    };
  }> {
    const { page, limit, status, ...rest } = filters;

    const customerFilters: { search?: string; isActive?: boolean } = {};

    if (rest.search) {
      customerFilters.search = rest.search;
    }

    if (status !== undefined) {
      customerFilters.isActive = status === "active";
    }

    const [paginatedResult, stats] = await Promise.all([
      this.customerRepository.findAll(customerFilters, { page, limit }),
      this.customerRepository.getStats(),
    ]);

    return {
      ...paginatedResult,
      stats,
    };
  }
}
