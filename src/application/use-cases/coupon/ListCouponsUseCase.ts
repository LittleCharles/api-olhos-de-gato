import { inject, injectable } from "tsyringe";
import type { ICouponRepository } from "../../../domain/repositories/ICouponRepository.js";
import { Coupon } from "../../../domain/entities/Coupon.js";

@injectable()
export class ListCouponsUseCase {
  constructor(
    @inject("CouponRepository")
    private couponRepository: ICouponRepository,
  ) {}

  async execute(): Promise<Coupon[]> {
    return this.couponRepository.findAll();
  }
}
