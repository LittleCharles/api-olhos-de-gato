import { inject, injectable } from "tsyringe";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { Product } from "../../../domain/entities/Product.js";

@injectable()
export class GetRecommendedProductsUseCase {
  constructor(
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) {}

  async execute(limit?: number): Promise<Product[]> {
    return this.productRepository.findRecommended(limit);
  }
}
