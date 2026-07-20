import { Coupon } from "../../../domain/entities/Coupon.js";

export class CouponPresenter {
  static toHTTP(coupon: Coupon) {
    return {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description ?? null,
      discountPercent: coupon.discountPercent,
      minOrderValue: coupon.minOrderValue?.getValue() ?? null,
      minOrderValueFormatted: coupon.minOrderValue?.format() ?? null,
      usageLimit: coupon.usageLimit ?? null,
      usedCount: coupon.usedCount,
      startsAt: coupon.startsAt?.toISOString() ?? null,
      expiresAt: coupon.expiresAt?.toISOString() ?? null,
      isActive: coupon.isActive,
      createdAt: coupon.createdAt.toISOString(),
      updatedAt: coupon.updatedAt.toISOString(),
    };
  }
}
