import { inject, injectable } from "tsyringe";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { Product } from "../../../domain/entities/Product.js";
import { Money } from "../../../domain/value-objects/Money.js";
import { UpdateProductDTO } from "../../dtos/ProductDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class UpdateProductUseCase {
  constructor(
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) { }

  async execute(id: string, data: UpdateProductDTO): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new AppError("Produto não encontrado", 404);
    }

    if (data.price !== undefined) {
      product.updatePrice(Money.create(data.price));
    }

    if (data.promoPrice !== undefined) {
      product.updatePromoPrice(
        data.promoPrice !== null ? Money.create(data.promoPrice) : null,
      );
    }

    if (data.stock !== undefined) {
      const stockDiff = data.stock - product.stock;
      if (stockDiff > 0) {
        product.increaseStock(stockDiff);
      } else if (stockDiff < 0) {
        product.decreaseStock(Math.abs(stockDiff));
      }
    }

    product.update({
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      isActive: data.isActive,
      animalType: data.animalType,
      subcategoryId: data.subcategoryId,
      sku: data.sku,
      isFeatured: data.isFeatured,
      isRecommended: data.isRecommended,
    });

    return this.productRepository.update(product);
  }
}
