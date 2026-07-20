import { inject, injectable } from "tsyringe";
import type { ICouponRepository } from "../../../domain/repositories/ICouponRepository.js";
import { Coupon } from "../../../domain/entities/Coupon.js";
import { Money } from "../../../domain/value-objects/Money.js";
import { UpdateCouponDTO } from "../../dtos/CouponDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class UpdateCouponUseCase {
  constructor(
    @inject("CouponRepository")
    private couponRepository: ICouponRepository,
  ) {}

  async execute(id: string, data: UpdateCouponDTO): Promise<Coupon> {
    const coupon = await this.couponRepository.findById(id);
    if (!coupon) {
      throw new AppError("Cupom não encontrado", 404);
    }

    if (data.code && data.code !== coupon.code) {
      const existing = await this.couponRepository.findByCode(data.code);
      if (existing && existing.id !== id) {
        throw new AppError("Já existe um cupom com este código", 409);
      }
    }

    coupon.update({
      code: data.code,
      description: data.description,
      discountPercent: data.discountPercent,
      // undefined = não mexe; null = remove o mínimo
      minOrderValue:
        data.minOrderValue === undefined
          ? undefined
          : data.minOrderValue === null
            ? null
            : Money.create(data.minOrderValue),
      usageLimit: data.usageLimit,
      startsAt: data.startsAt,
      expiresAt: data.expiresAt,
      isActive: data.isActive,
    });

    return this.couponRepository.update(coupon);
  }
}
