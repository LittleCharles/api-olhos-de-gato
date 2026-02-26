import { injectable } from "tsyringe";
import { prisma } from "../prisma/client.js";
import { IAddressRepository } from "../../../domain/repositories/IAddressRepository.js";
import { Address } from "../../../domain/entities/Address.js";

@injectable()
export class PrismaAddressRepository implements IAddressRepository {
  async findById(id: string): Promise<Address | null> {
    const address = await prisma.address.findUnique({ where: { id } });
    if (!address) return null;
    return this.mapToEntity(address);
  }

  async findByCustomerId(customerId: string): Promise<Address[]> {
    const addresses = await prisma.address.findMany({
      where: { customerId },
      orderBy: [{ isDefault: "desc" }, { street: "asc" }],
    });
    return addresses.map((a) => this.mapToEntity(a));
  }

  async create(address: Address): Promise<Address> {
    const created = await prisma.address.create({
      data: {
        id: address.id,
        customerId: address.customerId,
        street: address.street,
        number: address.number,
        complement: address.complement,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        isDefault: address.isDefault,
      },
    });
    return this.mapToEntity(created);
  }

  async update(address: Address): Promise<Address> {
    const updated = await prisma.address.update({
      where: { id: address.id },
      data: {
        street: address.street,
        number: address.number,
        complement: address.complement,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        isDefault: address.isDefault,
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.address.delete({ where: { id } });
  }

  async clearDefault(customerId: string): Promise<void> {
    await prisma.address.updateMany({
      where: { customerId, isDefault: true },
      data: { isDefault: false },
    });
  }

  private mapToEntity(data: any): Address {
    return new Address({
      id: data.id,
      customerId: data.customerId,
      street: data.street,
      number: data.number,
      complement: data.complement,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      isDefault: data.isDefault,
    });
  }
}
