import { inject, injectable } from "tsyringe";
import type { ICartRepository } from "../../../domain/repositories/ICartRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class AddToCartUseCase {
  constructor(
    @inject("CartRepository")
    private cartRepository: ICartRepository,
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) {}

  async execute(customerId: string, productId: string, quantity: number): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new AppError("Produto não encontrado", 404);
    }

    if (!product.isActive) {
      throw new AppError("Produto indisponível", 400);
    }

    if (product.stock < quantity) {
      throw new AppError("Estoque insuficiente", 400);
    }

    const cartId = await this.cartRepository.getOrCreateCart(customerId);

    const existingItem = await this.cartRepository.findItemByProduct(cartId, productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new AppError("Estoque insuficiente", 400);
      }
      await this.cartRepository.updateItemQuantity(existingItem.id, newQuantity);
    } else {
      await this.cartRepository.addItem(cartId, productId, quantity);
    }
  }
}
