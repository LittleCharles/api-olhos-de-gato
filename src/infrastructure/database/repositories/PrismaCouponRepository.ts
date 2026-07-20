import { prisma } from "../prisma/client.js";
import { ICouponRepository } from "../../../domain/repositories/ICouponRepository.js";
import { Coupon } from "../../../domain/entities/Coupon.js";
import { Money } from "../../../domain/value-objects/Money.js";

export class PrismaCouponRepository implements ICouponRepository {
  async findAll(): Promise<Coupon[]> {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return coupons.map((c) => this.mapToEntity(c));
  }

  async findById(id: string): Promise<Coupon | null> {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) return null;
    return this.mapToEntity(coupon);
  }

  async findByCode(code: string): Promise<Coupon | null> {
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon) return null;
    return this.mapToEntity(coupon);
  }

  async create(coupon: Coupon): Promise<Coupon> {
    const created = await prisma.coupon.create({
      data: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description ?? null,
        discountPercent: coupon.discountPercent,
        minOrderValue: coupon.minOrderValue?.getValue() ?? null,
        usageLimit: coupon.usageLimit ?? null,
        usedCount: coupon.usedCount,
        startsAt: coupon.startsAt ?? null,
        expiresAt: coupon.expiresAt ?? null,
        isActive: coupon.isActive,
      },
    });
    return this.mapToEntity(created);
  }

  async update(coupon: Coupon): Promise<Coupon> {
    const updated = await prisma.coupon.update({
      where: { id: coupon.id },
      data: {
        code: coupon.code,
        description: coupon.description ?? null,
        discountPercent: coupon.discountPercent,
        minOrderValue: coupon.minOrderValue?.getValue() ?? null,
        usageLimit: coupon.usageLimit ?? null,
        startsAt: coupon.startsAt ?? null,
        expiresAt: coupon.expiresAt ?? null,
        isActive: coupon.isActive,
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.coupon.delete({ where: { id } });
  }

  async releaseUsage(id: string): Promise<void> {
    // Decremento condicional: piso 0 mesmo sob concorrência/replay
    await prisma.coupon.updateMany({
      where: { id, usedCount: { gt: 0 } },
      data: { usedCount: { decrement: 1 } },
    });
  }

  private mapToEntity(data: any): Coupon {
    return new Coupon({
      id: data.id,
      code: data.code,
      description: data.description,
      discountPercent: Number(data.discountPercent),
      minOrderValue:
        data.minOrderValue != null ? Money.create(Number(data.minOrderValue)) : null,
      usageLimit: data.usageLimit,
      usedCount: data.usedCount,
      startsAt: data.startsAt,
      expiresAt: data.expiresAt,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
