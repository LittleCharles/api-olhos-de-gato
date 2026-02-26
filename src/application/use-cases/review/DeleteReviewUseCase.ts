import { inject, injectable } from "tsyringe";
import type { IReviewRepository } from "../../../domain/repositories/IReviewRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class DeleteReviewUseCase {
  constructor(
    @inject("ReviewRepository")
    private reviewRepository: IReviewRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const review = await this.reviewRepository.findById(id);

    if (!review) {
      throw new AppError("Avaliação não encontrada", 404);
    }

    await this.reviewRepository.delete(id);
  }
}
