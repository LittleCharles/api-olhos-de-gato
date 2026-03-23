import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { z } from "zod";
import { CalculateShippingUseCase } from "../../../application/use-cases/shipping/CalculateShippingUseCase.js";

const CalculateShippingSchema = z.object({
  zipCode: z.string().min(8).max(9),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export class ShippingController {
  async calculate(request: FastifyRequest, reply: FastifyReply) {
    const data = CalculateShippingSchema.parse(request.body);

    const calculateShipping = container.resolve(CalculateShippingUseCase);

    const options = await calculateShipping.execute({
      zipCode: data.zipCode,
      items: data.items,
    });

    return reply.send({ options });
  }
}
