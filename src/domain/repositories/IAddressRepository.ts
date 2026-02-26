import { Address } from "../entities/Address.js";

export interface IAddressRepository {
  findById(id: string): Promise<Address | null>;
  findByCustomerId(customerId: string): Promise<Address[]>;
  create(address: Address): Promise<Address>;
  update(address: Address): Promise<Address>;
  delete(id: string): Promise<void>;
  clearDefault(customerId: string): Promise<void>;
}
