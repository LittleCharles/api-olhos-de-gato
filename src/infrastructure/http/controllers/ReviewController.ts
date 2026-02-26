import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { ListReviewsUseCase } from "../../../application/use-cases/review/ListReviewsUseCase.js";
import { ListPublicReviewsUseCase } from "../../../application/use-cases/review/ListPublicReviewsUseCase.js";
import { ApproveReviewUseCase } from "../../../application/use-cases/review/ApproveReviewUseCase.js";
import { RejectReviewUseCase } from "../../../application/use-cases/review/RejectReviewUseCase.js";
import { DeleteReviewUseCase } from "../../../application/use-cases/review/DeleteReviewUseCase.js";
import { ReviewFiltersSchema, PublicReviewFiltersSchema } from "../../../application/dtos/ReviewDTO.js";
import { ReviewPresenter } from "../presenters/ReviewPresenter.js";

export class ReviewController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const filters = ReviewFiltersSchema.parse(request.query);

    const listReviewsUseCase = container.resolve(ListReviewsUseCase);
    const result = await listReviewsUseCase.execute(filters);

    return reply.send({
      data: result.data.map(ReviewPresenter.toHTTP),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      stats: result.stats,
    });
  }

  async approve(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;

    const approveReviewUseCase = container.resolve(ApproveReviewUseCase);
    const review = await approveReviewUseCase.execute(id);

    return reply.send(ReviewPresenter.toHTTP(review));
  }

  async reject(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;

    const rejectReviewUseCase = container.resolve(RejectReviewUseCase);
    const review = await rejectReviewUseCase.execute(id);

    return reply.send(ReviewPresenter.toHTTP(review));
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;

    const deleteReviewUseCase = container.resolve(DeleteReviewUseCase);
    await deleteReviewUseCase.execute(id);

    return reply.status(204).send();
  }

  async listPublic(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { page, limit } = PublicReviewFiltersSchema.parse(request.query);

    const useCase = container.resolve(ListPublicReviewsUseCase);
    const result = await useCase.execute(id, { page, limit });

    return reply.send({
      data: result.data.map(ReviewPresenter.toHTTP),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  }
}
