import { inject, injectable } from "tsyringe";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

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
    await this.productRepository.updateFeatured(id, isFeatured);
  }
}
