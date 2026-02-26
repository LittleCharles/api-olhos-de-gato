import { inject, injectable } from "tsyringe";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { Product } from "../../../domain/entities/Product.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class GetProductUseCase {
  constructor(
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) { }

  async execute(idOrSlug: string): Promise<Product> {
    let product: Product | null = null;

    // Tenta buscar por UUID primeiro
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    if (isUUID) {
      product = await this.productRepository.findById(idOrSlug);
    } else {
      product = await this.productRepository.findBySlug(idOrSlug);
    }

    if (!product) {
      throw new AppError("Produto não encontrado", 404);
    }

    return product;
  }
}
