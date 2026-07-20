import { inject, injectable } from "tsyringe";
import type { ICouponRepository } from "../../../domain/repositories/ICouponRepository.js";
import { Coupon } from "../../../domain/entities/Coupon.js";
import { Money } from "../../../domain/value-objects/Money.js";
import { AppError } from "../../../shared/errors/AppError.js";

interface ValidateCouponInput {
  code: string;
  subtotal: Money;
}

export interface ValidateCouponResult {
  coupon: Coupon;
  discount: Money;
}

/**
 * Fonte única das regras de cupom — usada pelo endpoint público de validação
 * (via ValidateCartCouponUseCase) e pela criação do pedido (CreateOrderUseCase).
 * Só valida e calcula; NÃO consome uso (o incremento é atômico na transação do pedido).
 */
@injectable()
export class ValidateCouponUseCase {
  constructor(
    @inject("CouponRepository")
    private couponRepository: ICouponRepository,
  ) {}

  async execute({ code, subtotal }: ValidateCouponInput): Promise<ValidateCouponResult> {
    const coupon = await this.couponRepository.findByCode(code.trim().toUpperCase());
    if (!coupon) {
      throw new AppError("Cupom inválido", 404);
    }

    const now = new Date();

    if (!coupon.isActive) {
      throw new AppError("Cupom inativo", 400);
    }

    if (coupon.isNotStarted(now)) {
      throw new AppError("Cupom ainda não está vigente", 400);
    }

    if (coupon.isExpired(now)) {
      throw new AppError("Cupom expirado", 400);
    }

    if (coupon.isExhausted()) {
      throw new AppError("Cupom esgotado", 400);
    }

    if (coupon.minOrderValue && coupon.minOrderValue.isGreaterThan(subtotal)) {
      throw new AppError(
        `Cupom válido para pedidos a partir de ${coupon.minOrderValue.format()}`,
        400,
      );
    }

    return { coupon, discount: coupon.calculateDiscount(subtotal) };
  }
}
