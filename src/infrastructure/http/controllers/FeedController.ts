import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { GenerateGoogleMerchantFeedUseCase } from "../../../application/use-cases/feed/GenerateGoogleMerchantFeedUseCase.js";

export class FeedController {
  async googleMerchant(_request: FastifyRequest, reply: FastifyReply) {
    const useCase = container.resolve(GenerateGoogleMerchantFeedUseCase);
    const xml = await useCase.execute();
    return reply
      .header("Content-Type", "application/xml; charset=utf-8")
      .header("Cache-Control", "public, max-age=3600")
      .send(xml);
  }
}
