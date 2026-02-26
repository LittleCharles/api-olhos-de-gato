import { inject, injectable } from "tsyringe";
import type { ICartRepository, CartWithItems } from "../../../domain/repositories/ICartRepository.js";

@injectable()
export class GetCartUseCase {
  constructor(
    @inject("CartRepository")
    private cartRepository: ICartRepository,
  ) {}

  async execute(customerId: string): Promise<CartWithItems | null> {
    return this.cartRepository.findByCustomerId(customerId);
  }
}
