import { inject, injectable } from "tsyringe";
import type { ICartRepository } from "../../../domain/repositories/ICartRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class UpdateCartItemUseCase {
  constructor(
    @inject("CartRepository")
    private cartRepository: ICartRepository,
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) {}

  async execute(itemId: string, cartId: string, quantity: number): Promise<void> {
    const item = await this.cartRepository.findItemById(itemId);
    if (!item) {
      throw new AppError("Item não encontrado no carrinho", 404);
    }

    if (item.cartId !== cartId) {
      throw new AppError("Acesso negado", 403);
    }

    const product = await this.productRepository.findById(item.productId);
    if (product && product.stock < quantity) {
      throw new AppError("Estoque insuficiente", 400);
    }

    await this.cartRepository.updateItemQuantity(itemId, quantity);
  }
}
