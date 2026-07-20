import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { GetMarketingAttributionUseCase } from "../../../application/use-cases/marketing/GetMarketingAttributionUseCase.js";
import { MarketingAttributionQuerySchema } from "../../../application/dtos/MarketingDTO.js";

export class MarketingController {
  async getAttribution(request: FastifyRequest, reply: FastifyReply) {
    const { period } = MarketingAttributionQuerySchema.parse(request.query);
    const useCase = container.resolve(GetMarketingAttributionUseCase);
    const data = await useCase.execute(period);
    return reply.send(data);
  }
}
