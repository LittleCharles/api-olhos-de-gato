import { inject, injectable } from "tsyringe";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { Product } from "../../../domain/entities/Product.js";
import { AppError } from "../../../shared/errors/AppError.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@injectable()
export class GetRelatedProductsUseCase {
  constructor(
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) {}

  async execute(idOrSlug: string, limit?: number): Promise<Product[]> {
    const target = UUID_RE.test(idOrSlug)
      ? await this.productRepository.findById(idOrSlug)
      : await this.productRepository.findBySlug(idOrSlug);

    if (!target) {
      throw new AppError("Produto não encontrado", 404);
    }

    return this.productRepository.findRelated(target.id, limit);
  }
}
