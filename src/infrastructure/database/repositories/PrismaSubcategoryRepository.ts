import { prisma } from "../prisma/client.js";
import { ISubcategoryRepository } from "../../../domain/repositories/ISubcategoryRepository.js";
import { Subcategory } from "../../../domain/entities/Subcategory.js";
import { AnimalType } from "../../../domain/enums/index.js";

export class PrismaSubcategoryRepository implements ISubcategoryRepository {
  async findById(id: string): Promise<Subcategory | null> {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
    });
    if (!subcategory) return null;
    return this.mapToEntity(subcategory);
  }

  async findAll(onlyActive?: boolean): Promise<Subcategory[]> {
    const where = onlyActive ? { isActive: true } : {};
    const subcategories = await prisma.subcategory.findMany({
      where,
      orderBy: { name: "asc" },
    });
    return subcategories.map((s) => this.mapToEntity(s));
  }

  async findByAnimalType(animalType: AnimalType): Promise<Subcategory[]> {
    const subcategories = await prisma.subcategory.findMany({
      where: { animalType },
      orderBy: { name: "asc" },
    });
    return subcategories.map((s) => this.mapToEntity(s));
  }

  async findAllWithCounts(): Promise<
    Array<{ subcategory: Subcategory; productCount: number }>
  > {
    const data = await prisma.subcategory.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    return data.map((d) => ({
      subcategory: this.mapToEntity(d),
      productCount: d._count.products,
    }));
  }

  async create(subcategory: Subcategory): Promise<Subcategory> {
    const created = await prisma.subcategory.create({
      data: {
        id: subcategory.id,
        animalType: subcategory.animalType,
        name: subcategory.name,
        icon: subcategory.icon,
        isActive: subcategory.isActive,
        createdAt: subcategory.createdAt,
        updatedAt: subcategory.updatedAt,
      },
    });
    return this.mapToEntity(created);
  }

  async update(subcategory: Subcategory): Promise<Subcategory> {
    const updated = await prisma.subcategory.update({
      where: { id: subcategory.id },
      data: {
        name: subcategory.name,
        icon: subcategory.icon,
        isActive: subcategory.isActive,
        updatedAt: subcategory.updatedAt,
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.subcategory.delete({ where: { id } });
  }

  async countProducts(id: string): Promise<number> {
    return prisma.product.count({ where: { subcategoryId: id } });
  }

  private mapToEntity(data: any): Subcategory {
    return new Subcategory({
      id: data.id,
      animalType: data.animalType as AnimalType,
      name: data.name,
      icon: data.icon,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
