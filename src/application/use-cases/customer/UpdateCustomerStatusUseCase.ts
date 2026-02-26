import { inject, injectable } from "tsyringe";
import type { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class UpdateCustomerStatusUseCase {
  constructor(
    @inject("CustomerRepository")
    private customerRepository: ICustomerRepository,
  ) {}

  async execute(id: string, status: "active" | "inactive"): Promise<void> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new AppError("Cliente não encontrado", 404);
    }

    const isActive = status === "active";
    await this.customerRepository.updateStatus(customer.userId, isActive);
  }
}
