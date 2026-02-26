import { inject, injectable } from "tsyringe";
import type { ICartRepository } from "../../../domain/repositories/ICartRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class RemoveCartItemUseCase {
  constructor(
    @inject("CartRepository")
    private cartRepository: ICartRepository,
  ) {}

  async execute(itemId: string, cartId: string): Promise<void> {
    const item = await this.cartRepository.findItemById(itemId);
    if (!item) {
      throw new AppError("Item não encontrado no carrinho", 404);
    }

    if (item.cartId !== cartId) {
      throw new AppError("Acesso negado", 403);
    }

    await this.cartRepository.removeItem(itemId);
  }
}
