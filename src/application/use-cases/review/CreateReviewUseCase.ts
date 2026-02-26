import { inject, injectable } from "tsyringe";
import { randomUUID } from "crypto";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";
import { ReviewStatus } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../infrastructure/database/prisma/client.js";

interface CreateReviewInput {
  customerId: string;
  productId: string;
  rating: number;
  comment: string;
}

@injectable()
export class CreateReviewUseCase {
  constructor(
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) {}

  async execute(input: CreateReviewInput): Promise<{ id: string }> {
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      throw new AppError("Produto não encontrado", 404);
    }

    // Check if customer already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: input.productId,
        authorId: input.customerId,
      },
    });

    if (existingReview) {
      throw new AppError("Você já avaliou este produto", 409);
    }

    const review = await prisma.review.create({
      data: {
        id: randomUUID(),
        productId: input.productId,
        authorId: input.customerId,
        rating: input.rating,
        comment: input.comment,
        status: ReviewStatus.PENDING,
      },
    });

    return { id: review.id };
  }
}
