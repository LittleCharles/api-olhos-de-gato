import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { stripeService } from "../../services/StripeService.js";
import { HandleStripeWebhookUseCase } from "../../../application/use-cases/order/HandleStripeWebhookUseCase.js";

export class WebhookController {
  async stripeWebhook(request: FastifyRequest, reply: FastifyReply) {
    const signature = request.headers["stripe-signature"] as string;

    if (!signature) {
      return reply.status(400).send({ error: "Missing stripe-signature header" });
    }

    try {
      const body = request.rawBody;
      if (!body) {
        return reply.status(400).send({ error: "Missing raw body" });
      }
      const event = stripeService.constructWebhookEvent(
        typeof body === "string" ? Buffer.from(body) : body as Buffer,
        signature,
      );

      const session = event.data.object as {
        metadata?: { orderId?: string };
        payment_status?: string;
      };
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const handleWebhook = container.resolve(HandleStripeWebhookUseCase);
        await handleWebhook.execute({
          eventType: event.type,
          orderId,
          paymentStatus: session.payment_status,
        });
      }

      return reply.send({ received: true });
    } catch (err) {
      request.log.error(err, "Stripe webhook error");
      return reply.status(400).send({ error: "Webhook signature verification failed" });
    }
  }
}

const webhookController = new WebhookController();
export { webhookController };
