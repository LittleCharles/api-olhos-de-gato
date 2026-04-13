import { inject, injectable } from "tsyringe";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../infrastructure/database/prisma/client.js";

const MAX_HIGHLIGHTS = 4;

@injectable()
export class ToggleRecommendedUseCase {
  constructor(
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) {}

  async execute(id: string, isRecommended: boolean): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new AppError("Produto não encontrado", 404);
    }
    if (isRecommended && !product.isRecommended) {
      const count = await prisma.product.count({
        where: { isRecommended: true },
      });
      if (count >= MAX_HIGHLIGHTS) {
        throw new AppError(
          `Limite de ${MAX_HIGHLIGHTS} produtos recomendados atingido`,
          409,
        );
      }
    }
    await this.productRepository.updateRecommended(id, isRecommended);
  }
}
