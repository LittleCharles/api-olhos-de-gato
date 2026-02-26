import { inject, injectable } from "tsyringe";
import type { ICartRepository } from "../../../domain/repositories/ICartRepository.js";

@injectable()
export class ClearCartUseCase {
  constructor(
    @inject("CartRepository")
    private cartRepository: ICartRepository,
  ) {}

  async execute(customerId: string): Promise<void> {
    const cart = await this.cartRepository.findByCustomerId(customerId);
    if (cart) {
      await this.cartRepository.clearCart(cart.id);
    }
  }
}
