import { inject, injectable } from "tsyringe";
import type { ICouponRepository } from "../../../domain/repositories/ICouponRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class DeleteCouponUseCase {
  constructor(
    @inject("CouponRepository")
    private couponRepository: ICouponRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const coupon = await this.couponRepository.findById(id);
    if (!coupon) {
      throw new AppError("Cupom não encontrado", 404);
    }

    // Exclusão permitida mesmo com pedidos: FK é SET NULL e o pedido guarda
    // coupon_code como snapshot — histórico preservado.
    await this.couponRepository.delete(id);
  }
}
