import { inject, injectable } from "tsyringe";
import type { IAddressRepository } from "../../../domain/repositories/IAddressRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class DeleteAddressUseCase {
  constructor(
    @inject("AddressRepository")
    private addressRepository: IAddressRepository,
  ) {}

  async execute(addressId: string, customerId: string): Promise<void> {
    const address = await this.addressRepository.findById(addressId);

    if (!address) {
      throw new AppError("Endereço não encontrado", 404);
    }

    if (address.customerId !== customerId) {
      throw new AppError("Acesso negado", 403);
    }

    await this.addressRepository.delete(addressId);
  }
}
