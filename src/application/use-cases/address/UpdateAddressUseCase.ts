import { inject, injectable } from "tsyringe";
import type { IAddressRepository } from "../../../domain/repositories/IAddressRepository.js";
import { Address } from "../../../domain/entities/Address.js";
import { UpdateAddressDTO } from "../../dtos/AddressDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class UpdateAddressUseCase {
  constructor(
    @inject("AddressRepository")
    private addressRepository: IAddressRepository,
  ) {}

  async execute(addressId: string, customerId: string, data: UpdateAddressDTO): Promise<Address> {
    const address = await this.addressRepository.findById(addressId);

    if (!address) {
      throw new AppError("Endereço não encontrado", 404);
    }

    if (address.customerId !== customerId) {
      throw new AppError("Acesso negado", 403);
    }

    if (data.isDefault) {
      await this.addressRepository.clearDefault(customerId);
    }

    address.update({
      street: data.street,
      number: data.number,
      complement: data.complement ?? null,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      isDefault: data.isDefault ?? false,
    });

    return this.addressRepository.update(address);
  }
}
