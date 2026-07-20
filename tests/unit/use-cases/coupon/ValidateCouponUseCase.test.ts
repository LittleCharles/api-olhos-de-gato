import { describe, it, expect, vi, beforeEach } from "vitest";
import { ValidateCouponUseCase } from "@application/use-cases/coupon/ValidateCouponUseCase";
import { Coupon, CouponProps } from "@domain/entities/Coupon";
import { Money } from "@domain/value-objects/Money";
import type { ICouponRepository } from "@domain/repositories/ICouponRepository";

const mockCouponRepository: ICouponRepository = {
  findByCode: vi.fn(),
} as unknown as ICouponRepository;

function makeCoupon(overrides: Partial<CouponProps> = {}): Coupon {
  return new Coupon({
    id: "coupon-1",
    code: "TESTE10",
    description: null,
    discountPercent: 10,
    minOrderValue: null,
    usageLimit: null,
    usedCount: 0,
    startsAt: null,
    expiresAt: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

const FUTURE = new Date(Date.now() + 24 * 60 * 60 * 1000);
const PAST = new Date(Date.now() - 24 * 60 * 60 * 1000);

describe("ValidateCouponUseCase", () => {
  let sut: ValidateCouponUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    sut = new ValidateCouponUseCase(mockCouponRepository);
  });

  it("normaliza o código (trim + MAIÚSCULO) antes de buscar", async () => {
    vi.mocked(mockCouponRepository.findByCode).mockResolvedValue(makeCoupon());

    await sut.execute({ code: "  teste10 ", subtotal: Money.create(100) });

    expect(mockCouponRepository.findByCode).toHaveBeenCalledWith("TESTE10");
  });

  it("rejeita cupom inexistente", async () => {
    vi.mocked(mockCouponRepository.findByCode).mockResolvedValue(null);

    await expect(
      sut.execute({ code: "NAOEXISTE", subtotal: Money.create(100) }),
    ).rejects.toThrow("Cupom inválido");
  });

  it("rejeita cupom inativo", async () => {
    vi.mocked(mockCouponRepository.findByCode).mockResolvedValue(
      makeCoupon({ isActive: false }),
    );

    await expect(
      sut.execute({ code: "TESTE10", subtotal: Money.create(100) }),
    ).rejects.toThrow("Cupom inativo");
  });

  it("rejeita cupom ainda não vigente", async () => {
    vi.mocked(mockCouponRepository.findByCode).mockResolvedValue(
      makeCoupon({ startsAt: FUTURE }),
    );

    await expect(
      sut.execute({ code: "TESTE10", subtotal: Money.create(100) }),
    ).rejects.toThrow("Cupom ainda não está vigente");
  });

  it("rejeita cupom expirado", async () => {
    vi.mocked(mockCouponRepository.findByCode).mockResolvedValue(
      makeCoupon({ expiresAt: PAST }),
    );

    await expect(
      sut.execute({ code: "TESTE10", subtotal: Money.create(100) }),
    ).rejects.toThrow("Cupom expirado");
  });

  it("rejeita cupom esgotado (usedCount atingiu o limite)", async () => {
    vi.mocked(mockCouponRepository.findByCode).mockResolvedValue(
      makeCoupon({ usageLimit: 5, usedCount: 5 }),
    );

    await expect(
      sut.execute({ code: "TESTE10", subtotal: Money.create(100) }),
    ).rejects.toThrow("Cupom esgotado");
  });

  it("rejeita subtotal abaixo do pedido mínimo (mensagem com o valor)", async () => {
    vi.mocked(mockCouponRepository.findByCode).mockResolvedValue(
      makeCoupon({ minOrderValue: Money.create(150) }),
    );

    await expect(
      sut.execute({ code: "TESTE10", subtotal: Money.create(100) }),
    ).rejects.toThrow(/a partir de/);
  });

  it("aceita subtotal exatamente no pedido mínimo", async () => {
    vi.mocked(mockCouponRepository.findByCode).mockResolvedValue(
      makeCoupon({ minOrderValue: Money.create(100) }),
    );

    const { discount } = await sut.execute({
      code: "TESTE10",
      subtotal: Money.create(100),
    });

    expect(discount.getValue()).toBe(10);
  });

  it("calcula o desconto percentual arredondado a centavos", async () => {
    vi.mocked(mockCouponRepository.findByCode).mockResolvedValue(makeCoupon());

    const { coupon, discount } = await sut.execute({
      code: "TESTE10",
      subtotal: Money.create(129.99),
    });

    // 10% de 129,99 = 12,999 → R$ 13,00
    expect(discount.getValue()).toBe(13);
    expect(coupon.code).toBe("TESTE10");
  });

  it("cupom de 100% desconta o subtotal inteiro", async () => {
    vi.mocked(mockCouponRepository.findByCode).mockResolvedValue(
      makeCoupon({ discountPercent: 100 }),
    );

    const { discount } = await sut.execute({
      code: "TESTE10",
      subtotal: Money.create(59.9),
    });

    expect(discount.getValue()).toBe(59.9);
  });
});
