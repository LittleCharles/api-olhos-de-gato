import { inject, injectable } from "tsyringe";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { Product } from "../../../domain/entities/Product.js";
import { Money } from "../../../domain/value-objects/Money.js";
import { CreateProductDTO } from "../../dtos/ProductDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { randomUUID } from "crypto";

@injectable()
export class CreateProductUseCase {
  constructor(
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) { }

  async execute(data: CreateProductDTO): Promise<Product> {
    const slug = this.generateSlug(data.name);

    const existingProduct = await this.productRepository.findBySlug(slug);
    if (existingProduct) {
      throw new AppError("Já existe um produto com este nome", 409);
    }

    const product = new Product({
      id: randomUUID(),
      categoryId: data.categoryId ?? null,
      name: data.name,
      slug,
      description: data.description,
      price: Money.create(data.price),
      stock: data.stock ?? 0,
      isActive: data.isActive ?? true,
      images: [],
      animalType: data.animalType,
      subcategoryIds: data.subcategoryIds ?? [],
      promoPrice: data.promoPrice ? Money.create(data.promoPrice) : null,
      sku: data.sku,
      isFeatured: data.isFeatured ?? false,
      isRecommended: data.isRecommended ?? false,
      brandId: data.brandId ?? null,
      ean: data.ean ?? null,
      weight: data.weight ?? null,
      lengthCm: data.lengthCm ?? null,
      widthCm: data.widthCm ?? null,
      heightCm: data.heightCm ?? null,
      countryOrigin: data.countryOrigin ?? null,
      manufacturer: data.manufacturer ?? null,
      bulletPoints: data.bulletPoints ?? [],
      specifications: (data.specifications ?? []).map((s, i) => ({ label: s.label, value: s.value, order: i })),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.productRepository.create(product);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
