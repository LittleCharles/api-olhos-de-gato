import { prisma } from "../prisma/client.js";
import { ICategoryRepository } from "../../../domain/repositories/ICategoryRepository.js";
import { Category } from "../../../domain/entities/Category.js";

export class PrismaCategoryRepository implements ICategoryRepository {
  async findById(id: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return null;
    return this.mapToEntity(category);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) return null;
    return this.mapToEntity(category);
  }

  async findAll(onlyActive?: boolean): Promise<Category[]> {
    const where = onlyActive ? { isActive: true } : {};
    const categories = await prisma.category.findMany({ where });
    return categories.map((c) => this.mapToEntity(c));
  }

  async create(category: Category): Promise<Category> {
    const created = await prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        isActive: category.isActive,
      },
    });
    return this.mapToEntity(created);
  }

  async update(category: Category): Promise<Category> {
    const updated = await prisma.category.update({
      where: { id: category.id },
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        isActive: category.isActive,
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }

  private mapToEntity(data: any): Category {
    return new Category({
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.imageUrl,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
