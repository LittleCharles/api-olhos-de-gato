import { prisma } from "../prisma/client.js";
import {
  IProductRepository,
  ProductFilters,
  PaginationParams,
  PaginatedResult,
} from "../../../domain/repositories/IProductRepository.js";
import {
  Product,
  ProductImageProps,
} from "../../../domain/entities/Product.js";
import { Money } from "../../../domain/value-objects/Money.js";
import { AnimalType } from "../../../domain/enums/index.js";
import { Prisma } from "@prisma/client";

export class PrismaProductRepository implements IProductRepository {
  private readonly includeRelations = { images: true, brand: true } as const;

  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: this.includeRelations,
    });
    if (!product) return null;
    return this.mapToEntity(product);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: this.includeRelations,
    });
    if (!product) return null;
    return this.mapToEntity(product);
  }

  async findAll(
    filters?: ProductFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Product>> {
    const where: Prisma.ProductWhereInput = {};

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    } else if (filters?.onlyActive) {
      where.isActive = true;
    }

    if (filters?.onlyInStock) {
      where.stock = { gt: 0 };
    }

    if (filters?.animalType) {
      where.animalType = filters.animalType;
    }

    if (filters?.subcategoryId) {
      where.subcategoryId = filters.subcategoryId;
    }

    if (filters?.onlyFeatured) {
      where.isFeatured = true;
    }

    if (filters?.onlyRecommended) {
      where.isRecommended = true;
    }

    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: this.includeRelations,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => this.mapToEntity(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { categoryId, isActive: true },
      include: this.includeRelations,
    });
    return products.map((p) => this.mapToEntity(p));
  }

  async create(product: Product): Promise<Product> {
    const created = await prisma.product.create({
      data: {
        id: product.id,
        categoryId: product.categoryId,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price.getValue(),
        stock: product.stock,
        isActive: product.isActive,
        animalType: product.animalType,
        subcategoryId: product.subcategoryId,
        promoPrice: product.promoPrice?.getValue() ?? null,
        sku: product.sku,
        isFeatured: product.isFeatured,
        isRecommended: product.isRecommended,
        brandId: product.brandId,
        ean: product.ean,
        weight: product.weight,
        lengthCm: product.lengthCm,
        widthCm: product.widthCm,
        heightCm: product.heightCm,
        countryOrigin: product.countryOrigin,
        manufacturer: product.manufacturer,
        bulletPoints: product.bulletPoints,
      },
      include: this.includeRelations,
    });
    return this.mapToEntity(created);
  }

  async update(product: Product): Promise<Product> {
    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        categoryId: product.categoryId,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price.getValue(),
        stock: product.stock,
        isActive: product.isActive,
        animalType: product.animalType,
        subcategoryId: product.subcategoryId,
        promoPrice: product.promoPrice?.getValue() ?? null,
        sku: product.sku,
        isFeatured: product.isFeatured,
        isRecommended: product.isRecommended,
        brandId: product.brandId,
        ean: product.ean,
        weight: product.weight,
        lengthCm: product.lengthCm,
        widthCm: product.widthCm,
        heightCm: product.heightCm,
        countryOrigin: product.countryOrigin,
        manufacturer: product.manufacturer,
        bulletPoints: product.bulletPoints,
      },
      include: this.includeRelations,
    });
    return this.mapToEntity(updated);
  }

  async updateStock(id: string, quantity: number): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: { stock: quantity },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }

  async findFeatured(limit?: number): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: this.includeRelations,
      orderBy: { name: "asc" },
      take: limit ?? 10,
    });
    return products.map((p) => this.mapToEntity(p));
  }

  async findRecommended(limit?: number): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { isRecommended: true, isActive: true },
      include: this.includeRelations,
      orderBy: { name: "asc" },
      take: limit ?? 10,
    });
    return products.map((p) => this.mapToEntity(p));
  }

  async updateFeatured(id: string, isFeatured: boolean): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: { isFeatured },
    });
  }

  async updateRecommended(id: string, isRecommended: boolean): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: { isRecommended },
    });
  }

  async bulkUpdateFeatured(featuredIds: string[]): Promise<void> {
    await prisma.$transaction([
      prisma.product.updateMany({
        where: {},
        data: { isFeatured: false },
      }),
      prisma.product.updateMany({
        where: { id: { in: featuredIds } },
        data: { isFeatured: true },
      }),
    ]);
  }

  async bulkUpdateRecommended(recommendedIds: string[]): Promise<void> {
    await prisma.$transaction([
      prisma.product.updateMany({
        where: {},
        data: { isRecommended: false },
      }),
      prisma.product.updateMany({
        where: { id: { in: recommendedIds } },
        data: { isRecommended: true },
      }),
    ]);
  }

  private mapToEntity(data: any): Product {
    const images: ProductImageProps[] = (data.images || []).map((img: any) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      order: img.order,
      isMain: img.isMain,
    }));

    return new Product({
      id: data.id,
      categoryId: data.categoryId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: Money.create(Number(data.price)),
      stock: data.stock,
      isActive: data.isActive,
      images,
      animalType: data.animalType as AnimalType,
      subcategoryId: data.subcategoryId ?? null,
      promoPrice: data.promoPrice != null ? Money.create(Number(data.promoPrice)) : null,
      sku: data.sku,
      isFeatured: data.isFeatured,
      isRecommended: data.isRecommended,
      brandId: data.brandId ?? null,
      brandName: data.brand?.name ?? null,
      ean: data.ean ?? null,
      weight: data.weight != null ? Number(data.weight) : null,
      lengthCm: data.lengthCm != null ? Number(data.lengthCm) : null,
      widthCm: data.widthCm != null ? Number(data.widthCm) : null,
      heightCm: data.heightCm != null ? Number(data.heightCm) : null,
      countryOrigin: data.countryOrigin ?? null,
      manufacturer: data.manufacturer ?? null,
      bulletPoints: data.bulletPoints ?? [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
