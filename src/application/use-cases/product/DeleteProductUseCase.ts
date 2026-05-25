import { inject, injectable } from "tsyringe";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../infrastructure/database/prisma/client.js";
import { OrderStatus } from "../../../domain/enums/index.js";

const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.SHIPPED,
];

@injectable()
export class DeleteProductUseCase {
  constructor(
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) { }

  async execute(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new AppError("Produto não encontrado", 404);
    }

    const activeOrderItems = await prisma.orderItem.count({
      where: {
        productId: id,
        order: { status: { in: ACTIVE_ORDER_STATUSES } },
      },
    });

    if (activeOrderItems > 0) {
      throw new AppError(
        "Não é possível excluir este produto: existem pedidos em aberto que o referenciam. Desative o produto em vez de excluir.",
        409,
      );
    }

    await this.productRepository.delete(id);
  }
}
