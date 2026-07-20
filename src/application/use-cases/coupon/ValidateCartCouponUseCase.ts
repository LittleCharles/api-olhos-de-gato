import { inject, injectable } from "tsyringe";
import { Coupon } from "../../../domain/entities/Coupon.js";
import { Money } from "../../../domain/value-objects/Money.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../infrastructure/database/prisma/client.js";
import { ValidateCouponUseCase } from "./ValidateCouponUseCase.js";

interface ValidateCartCouponInput {
  customerId: string;
  code: string;
}

interface ValidateCartCouponResult {
  coupon: Coupon;
  discount: Money;
  subtotal: Money;
}

/**
 * Validação de cupom pro checkout: o subtotal vem do carrinho no BANCO
 * (promoPrice ?? price), nunca do cliente — mesmo cálculo do CreateOrderUseCase.
 */
@injectable()
export class ValidateCartCouponUseCase {
  constructor(
    @inject("ValidateCouponUseCase")
    private validateCoupon: ValidateCouponUseCase,
  ) {}

  async execute({ customerId, code }: ValidateCartCouponInput): Promise<ValidateCartCouponResult> {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      select: {
        items: {
          select: {
            quantity: true,
            product: { select: { price: true, promoPrice: true } },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError("Carrinho vazio", 400);
    }

    let subtotal = Money.zero();
    for (const item of cart.items) {
      const unitPrice = item.product.promoPrice
        ? Money.create(Number(item.product.promoPrice))
        : Money.create(Number(item.product.price));
      subtotal = subtotal.add(unitPrice.multiply(item.quantity));
    }

    const { coupon, discount } = await this.validateCoupon.execute({ code, subtotal });

    return { coupon, discount, subtotal };
  }
}
