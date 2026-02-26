import { inject, injectable } from "tsyringe";
import type { IFavoriteRepository, FavoriteWithProduct } from "../../../domain/repositories/IFavoriteRepository.js";

@injectable()
export class ListFavoritesUseCase {
  constructor(
    @inject("FavoriteRepository")
    private favoriteRepository: IFavoriteRepository,
  ) {}

  async execute(customerId: string): Promise<FavoriteWithProduct[]> {
    return this.favoriteRepository.findByCustomerId(customerId);
  }
}
