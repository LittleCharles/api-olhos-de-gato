import { describe, it, expect, vi, beforeEach } from "vitest";
import { CalculateShippingUseCase } from "@application/use-cases/shipping/CalculateShippingUseCase";
import type { IShippingProvider, ShippingOption } from "@application/interfaces/IShippingProvider";
import type { IProductRepository } from "@domain/repositories/IProductRepository";
import type { IStoreSettingsRepository } from "@domain/repositories/IStoreSettingsRepository";
import type { StoreSettings } from "@domain/entities/StoreSettings";
import { createMockProduct } from "../../../helpers";

describe("CalculateShippingUseCase", () => {
  let sut: CalculateShippingUseCase;
  let shippingProvider: IShippingProvider;
  let productRepository: IProductRepository;
  let storeSettingsRepository: IStoreSettingsRepository;

  // StoreSettings só precisa expor os getters usados pelo gross-up do frete.
  function settings(applyCardFeeToShipping: boolean, cardFeePercent: number): StoreSettings {
    return { applyCardFeeToShipping, cardFeePercent } as unknown as StoreSettings;
  }

  const baseOptions: ShippingOption[] = [
    { serviceId: 1, serviceName: "Jadlog Package", company: "Jadlog", price: 100, deliveryDays: 5 },
  ];

  beforeEach(() => {
    shippingProvider = { calculate: vi.fn() };
    productRepository = {
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findAll: vi.fn(),
      findByCategory: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateStock: vi.fn(),
      delete: vi.fn(),
      findFeatured: vi.fn(),
      findRecommended: vi.fn(),
      updateFeatured: vi.fn(),
      updateRecommended: vi.fn(),
      bulkUpdateFeatured: vi.fn(),
      bulkUpdateRecommended: vi.fn(),
    };
    storeSettingsRepository = { get: vi.fn(), update: vi.fn() };

    vi.mocked(productRepository.findById).mockResolvedValue(createMockProduct({ id: "p-1" }));
    vi.mocked(shippingProvider.calculate).mockResolvedValue(
      baseOptions.map((o) => ({ ...o })),
    );

    sut = new CalculateShippingUseCase(
      shippingProvider,
      productRepository,
      storeSettingsRepository,
    );
  });

  it("aplica o gross-up da taxa do cartão no frete quando ligado", async () => {
    vi.mocked(storeSettingsRepository.get).mockResolvedValue(settings(true, 3.99));

    const result = await sut.execute({
      zipCode: "01001000",
      items: [{ productId: "p-1", quantity: 1 }],
    });

    // 100 / (1 - 0,0399) = 104,1558... -> arredonda pra cima no centavo = 104,16
    expect(result[0].price).toBe(104.16);
  });

  it("não altera o frete quando o toggle está desligado", async () => {
    vi.mocked(storeSettingsRepository.get).mockResolvedValue(settings(false, 3.99));

    const result = await sut.execute({
      zipCode: "01001000",
      items: [{ productId: "p-1", quantity: 1 }],
    });

    expect(result[0].price).toBe(100);
  });
});
