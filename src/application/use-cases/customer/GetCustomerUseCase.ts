import { inject, injectable } from "tsyringe";
import type { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository.js";
import { Customer } from "../../../domain/entities/Customer.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class GetCustomerUseCase {
  constructor(
    @inject("CustomerRepository")
    private customerRepository: ICustomerRepository,
  ) {}

  async execute(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new AppError("Cliente não encontrado", 404);
    }

    return customer;
  }
}
