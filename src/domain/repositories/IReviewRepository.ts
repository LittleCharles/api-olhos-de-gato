import { Review } from "../entities/Review.js";
import { ReviewStatus } from "../enums/index.js";
import { PaginatedResult, PaginationParams } from "./IProductRepository.js";

export interface ReviewFilters {
  search?: string;
  productId?: string;
  status?: ReviewStatus;
}

export interface ReviewStats {
  totalReviews: number;
  avgRating: number;
  pendingCount: number;
}

export interface IReviewRepository {
  findById(id: string): Promise<Review | null>;
  findAll(
    filters?: ReviewFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Review>>;
  update(review: Review): Promise<Review>;
  delete(id: string): Promise<void>;
  getStats(): Promise<ReviewStats>;
}
