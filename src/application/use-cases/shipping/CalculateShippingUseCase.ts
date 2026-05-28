import { inject, injectable } from "tsyringe";
import type { IShippingProvider, ShippingOption, ShippingProduct } from "../../interfaces/IShippingProvider.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";
import type { IStoreSettingsRepository } from "../../../domain/repositories/IStoreSettingsRepository.js";

interface ShippingItem {
  productId: string;
  quantity: number;
}

interface CalculateShippingInput {
  zipCode: string;
  items: ShippingItem[];
}

@injectable()
export class CalculateShippingUseCase {
  constructor(
    @inject("ShippingProvider")
    private shippingProvider: IShippingProvider,
    @inject("ProductRepository")
    private productRepository: IProductRepository,
    @inject("StoreSettingsRepository")
    private storeSettingsRepository: IStoreSettingsRepository,
  ) {}

  async execute(input: CalculateShippingInput): Promise<ShippingOption[]> {
    const cep = input.zipCode.replace(/\D/g, "");
    if (cep.length !== 8) {
      throw new AppError("CEP inválido", 400);
    }

    if (!input.items || input.items.length === 0) {
      throw new AppError("Carrinho vazio", 400);
    }

    const products: ShippingProduct[] = [];

    for (const item of input.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new AppError(`Produto não encontrado: ${item.productId}`, 404);
      }

      products.push({
        weight: product.weight ?? 0.3,
        width: product.widthCm ?? 11,
        height: product.heightCm ?? 2,
        length: product.lengthCm ?? 16,
        quantity: item.quantity,
      });
    }

    const options = await this.shippingProvider.calculate(cep, products);

    // Repassa a taxa do cartão (%) no frete, se ligado nas Settings. Grossa o
    // custo da transportadora pra que, após a Stripe descontar o %, o lojista
    // receba o valor cheio do frete. Arredonda pra cima (centavo) — nunca menos.
    const settings = await this.storeSettingsRepository.get();
    if (settings.applyCardFeeToShipping && settings.cardFeePercent > 0) {
      const factor = 1 - settings.cardFeePercent / 100;
      return options.map((o) => ({
        ...o,
        price: Math.ceil((o.price / factor) * 100) / 100,
      }));
    }

    return options;
  }
}
