import { inject, injectable } from "tsyringe";
import type { IShippingProvider, ShippingOption, ShippingProduct } from "../../interfaces/IShippingProvider.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

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

    return this.shippingProvider.calculate(cep, products);
  }
}
