import { inject, injectable } from "tsyringe";
import type { IFavoriteRepository } from "../../../domain/repositories/IFavoriteRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class AddFavoriteUseCase {
  constructor(
    @inject("FavoriteRepository")
    private favoriteRepository: IFavoriteRepository,
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) {}

  async execute(customerId: string, productId: string): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new AppError("Produto não encontrado", 404);
    }

    const existing = await this.favoriteRepository.findByCustomerAndProduct(customerId, productId);
    if (existing) {
      throw new AppError("Produto já está nos favoritos", 409);
    }

    await this.favoriteRepository.add(customerId, productId);
  }
}
