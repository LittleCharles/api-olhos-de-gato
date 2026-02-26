import { inject, injectable } from "tsyringe";
import type { IFavoriteRepository } from "../../../domain/repositories/IFavoriteRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class RemoveFavoriteUseCase {
  constructor(
    @inject("FavoriteRepository")
    private favoriteRepository: IFavoriteRepository,
  ) {}

  async execute(customerId: string, productId: string): Promise<void> {
    const existing = await this.favoriteRepository.findByCustomerAndProduct(customerId, productId);
    if (!existing) {
      throw new AppError("Produto não está nos favoritos", 404);
    }

    await this.favoriteRepository.remove(customerId, productId);
  }
}
