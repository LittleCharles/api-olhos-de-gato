import { inject, injectable } from "tsyringe";
import type { IReviewRepository } from "../../../domain/repositories/IReviewRepository.js";
import { Review } from "../../../domain/entities/Review.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class RejectReviewUseCase {
  constructor(
    @inject("ReviewRepository")
    private reviewRepository: IReviewRepository,
  ) {}

  async execute(id: string): Promise<Review> {
    const review = await this.reviewRepository.findById(id);

    if (!review) {
      throw new AppError("Avaliação não encontrada", 404);
    }

    review.reject();

    return this.reviewRepository.update(review);
  }
}
