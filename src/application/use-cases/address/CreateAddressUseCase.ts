import { inject, injectable } from "tsyringe";
import { randomUUID } from "crypto";
import type { IAddressRepository } from "../../../domain/repositories/IAddressRepository.js";
import { Address } from "../../../domain/entities/Address.js";
import { CreateAddressDTO } from "../../dtos/AddressDTO.js";

@injectable()
export class CreateAddressUseCase {
  constructor(
    @inject("AddressRepository")
    private addressRepository: IAddressRepository,
  ) {}

  async execute(customerId: string, data: CreateAddressDTO): Promise<Address> {
    if (data.isDefault) {
      await this.addressRepository.clearDefault(customerId);
    }

    const address = new Address({
      id: randomUUID(),
      customerId,
      street: data.street,
      number: data.number,
      complement: data.complement ?? null,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      isDefault: data.isDefault ?? false,
    });

    return this.addressRepository.create(address);
  }
}
