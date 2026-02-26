import { inject, injectable } from "tsyringe";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { Product } from "../../../domain/entities/Product.js";
import type { UpdateHighlightsDTO } from "../../dtos/HighlightDTO.js";

@injectable()
export class UpdateHighlightsUseCase {
  constructor(
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) {}

  async execute(
    dto: UpdateHighlightsDTO,
  ): Promise<{ featured: Product[]; recommended: Product[] }> {
    await Promise.all([
      this.productRepository.bulkUpdateFeatured(dto.featuredIds),
      this.productRepository.bulkUpdateRecommended(dto.recommendedIds),
    ]);

    const [featured, recommended] = await Promise.all([
      this.productRepository.findFeatured(),
      this.productRepository.findRecommended(),
    ]);

    return { featured, recommended };
  }
}
