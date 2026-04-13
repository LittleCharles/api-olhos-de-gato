import { inject, injectable } from "tsyringe";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../infrastructure/database/prisma/client.js";

const MAX_HIGHLIGHTS = 4;

@injectable()
export class ToggleFeaturedUseCase {
  constructor(
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) {}

  async execute(id: string, isFeatured: boolean): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new AppError("Produto não encontrado", 404);
    }
    if (isFeatured && !product.isFeatured) {
      const count = await prisma.product.count({ where: { isFeatured: true } });
      if (count >= MAX_HIGHLIGHTS) {
        throw new AppError(
          `Limite de ${MAX_HIGHLIGHTS} produtos em destaque atingido`,
          409,
        );
      }
    }
    await this.productRepository.updateFeatured(id, isFeatured);
  }
}
