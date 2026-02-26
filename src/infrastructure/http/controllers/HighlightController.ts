import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { GetHighlightsUseCase } from "../../../application/use-cases/highlight/GetHighlightsUseCase.js";
import { UpdateHighlightsUseCase } from "../../../application/use-cases/highlight/UpdateHighlightsUseCase.js";
import { UpdateHighlightsSchema } from "../../../application/dtos/HighlightDTO.js";
import { ProductPresenter } from "../presenters/ProductPresenter.js";

export class HighlightController {
  async get(_request: FastifyRequest, reply: FastifyReply) {
    const useCase = container.resolve(GetHighlightsUseCase);
    const { featured, recommended } = await useCase.execute();

    return reply.send({
      featured: featured.map(ProductPresenter.toHTTP),
      recommended: recommended.map(ProductPresenter.toHTTP),
    });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const data = UpdateHighlightsSchema.parse(request.body);

    const useCase = container.resolve(UpdateHighlightsUseCase);
    const { featured, recommended } = await useCase.execute(data);

    return reply.send({
      featured: featured.map(ProductPresenter.toHTTP),
      recommended: recommended.map(ProductPresenter.toHTTP),
    });
  }
}
