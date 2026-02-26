import { inject, injectable } from "tsyringe";
import type { IReviewRepository } from "../../../domain/repositories/IReviewRepository.js";
import { Review } from "../../../domain/entities/Review.js";
import { ReviewStatus } from "../../../domain/enums/index.js";
import type { PaginatedResult } from "../../../domain/repositories/IProductRepository.js";

@injectable()
export class ListPublicReviewsUseCase {
  constructor(
    @inject("ReviewRepository")
    private reviewRepository: IReviewRepository,
  ) {}

  async execute(
    productId: string,
    pagination: { page: number; limit: number },
  ): Promise<PaginatedResult<Review>> {
    return this.reviewRepository.findAll(
      { productId, status: ReviewStatus.APPROVED },
      pagination,
    );
  }
}
