import { prisma } from "../prisma/client.js";
import { IBrandRepository } from "../../../domain/repositories/IBrandRepository.js";
import { Brand } from "../../../domain/entities/Brand.js";

export class PrismaBrandRepository implements IBrandRepository {
  async findAll(): Promise<Brand[]> {
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
    });
    return brands.map((b) => this.mapToEntity(b));
  }

  async findById(id: string): Promise<Brand | null> {
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) return null;
    return this.mapToEntity(brand);
  }

  async findByName(name: string): Promise<Brand | null> {
    const brand = await prisma.brand.findUnique({ where: { name } });
    if (!brand) return null;
    return this.mapToEntity(brand);
  }

  async create(brand: Brand): Promise<Brand> {
    const created = await prisma.brand.create({
      data: {
        id: brand.id,
        name: brand.name,
      },
    });
    return this.mapToEntity(created);
  }

  async update(brand: Brand): Promise<Brand> {
    const updated = await prisma.brand.update({
      where: { id: brand.id },
      data: { name: brand.name },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.brand.delete({ where: { id } });
  }

  async countProducts(id: string): Promise<number> {
    return prisma.product.count({ where: { brandId: id } });
  }

  private mapToEntity(data: any): Brand {
    return new Brand({
      id: data.id,
      name: data.name,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
