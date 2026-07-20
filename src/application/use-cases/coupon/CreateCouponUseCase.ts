import { inject, injectable } from "tsyringe";
import { randomUUID } from "crypto";
import type { ICouponRepository } from "../../../domain/repositories/ICouponRepository.js";
import { Coupon } from "../../../domain/entities/Coupon.js";
import { Money } from "../../../domain/value-objects/Money.js";
import { CreateCouponDTO } from "../../dtos/CouponDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class CreateCouponUseCase {
  constructor(
    @inject("CouponRepository")
    private couponRepository: ICouponRepository,
  ) {}

  async execute(data: CreateCouponDTO): Promise<Coupon> {
    const existing = await this.couponRepository.findByCode(data.code);
    if (existing) {
      throw new AppError("Já existe um cupom com este código", 409);
    }

    const coupon = new Coupon({
      id: randomUUID(),
      code: data.code,
      description: data.description ?? null,
      discountPercent: data.discountPercent,
      minOrderValue: data.minOrderValue != null ? Money.create(data.minOrderValue) : null,
      usageLimit: data.usageLimit ?? null,
      usedCount: 0,
      startsAt: data.startsAt ?? null,
      expiresAt: data.expiresAt ?? null,
      isActive: data.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.couponRepository.create(coupon);
  }
}
