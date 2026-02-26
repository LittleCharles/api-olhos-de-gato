import { inject, injectable } from "tsyringe";
import type { IAddressRepository } from "../../../domain/repositories/IAddressRepository.js";
import { Address } from "../../../domain/entities/Address.js";

@injectable()
export class ListAddressesUseCase {
  constructor(
    @inject("AddressRepository")
    private addressRepository: IAddressRepository,
  ) {}

  async execute(customerId: string): Promise<Address[]> {
    return this.addressRepository.findByCustomerId(customerId);
  }
}
