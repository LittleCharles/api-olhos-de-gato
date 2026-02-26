import { Review } from "../../../domain/entities/Review.js";

export class ReviewPresenter {
  static toHTTP(review: Review) {
    return {
      id: review.id,
      productId: review.productId,
      productName: review.productName ?? null,
      authorId: review.authorId,
      authorName: review.authorName ?? null,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }
}
