import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { ListAbandonedCartsUseCase } from "../../../application/use-cases/cart/ListAbandonedCartsUseCase.js";
import { AbandonedCartFiltersSchema } from "../../../application/dtos/AbandonedCartDTO.js";

export class AbandonedCartController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const { page, limit } = AbandonedCartFiltersSchema.parse(request.query);

    const useCase = container.resolve(ListAbandonedCartsUseCase);
    const result = await useCase.execute(page, limit);

    return reply.send({
      carts: result.data.map((cart) => ({
        ...cart,
        lastActivity: cart.lastActivity.toISOString(),
      })),
      total: result.total,
      totalValue: result.totalValue,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  }
}
