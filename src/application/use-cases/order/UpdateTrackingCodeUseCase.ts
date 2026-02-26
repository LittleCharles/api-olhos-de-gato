import { inject, injectable } from "tsyringe";
import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class UpdateTrackingCodeUseCase {
  constructor(
    @inject("OrderRepository")
    private orderRepository: IOrderRepository,
  ) {}

  async execute(id: string, trackingCode: string): Promise<void> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    await this.orderRepository.updateTrackingCode(id, trackingCode);
  }
}
