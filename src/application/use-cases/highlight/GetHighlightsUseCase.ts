import { inject, injectable } from "tsyringe";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { Product } from "../../../domain/entities/Product.js";

@injectable()
export class GetHighlightsUseCase {
  constructor(
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) {}

  async execute(): Promise<{ featured: Product[]; recommended: Product[] }> {
    const [featured, recommended] = await Promise.all([
      this.productRepository.findFeatured(),
      this.productRepository.findRecommended(),
    ]);

    return { featured, recommended };
  }
}
