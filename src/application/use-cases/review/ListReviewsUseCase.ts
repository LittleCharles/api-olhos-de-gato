import { inject, injectable } from "tsyringe";
import type { IReviewRepository } from "../../../domain/repositories/IReviewRepository.js";
import type { ReviewStats } from "../../../domain/repositories/IReviewRepository.js";
import { Review } from "../../../domain/entities/Review.js";
import { ReviewFiltersDTO } from "../../dtos/ReviewDTO.js";
import type {
  PaginatedResult,
} from "../../../domain/repositories/IProductRepository.js";

interface ListReviewsResult extends PaginatedResult<Review> {
  stats: ReviewStats;
}

@injectable()
export class ListReviewsUseCase {
  constructor(
    @inject("ReviewRepository")
    private reviewRepository: IReviewRepository,
  ) {}

  async execute(filters: ReviewFiltersDTO): Promise<ListReviewsResult> {
    const { page, limit, ...reviewFilters } = filters;

    const [paginatedResult, stats] = await Promise.all([
      this.reviewRepository.findAll(reviewFilters, { page, limit }),
      this.reviewRepository.getStats(),
    ]);

    return {
      ...paginatedResult,
      stats,
    };
  }
}
