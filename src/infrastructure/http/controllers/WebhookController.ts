import { FastifyRequest, FastifyReply } from "fastify";
import { stripeService } from "../../services/StripeService.js";
import { prisma } from "../../database/prisma/client.js";

export class WebhookController {
  async stripeWebhook(request: FastifyRequest, reply: FastifyReply) {
    const signature = request.headers["stripe-signature"] as string;

    if (!signature) {
      return reply.status(400).send({ error: "Missing stripe-signature header" });
    }

    try {
      const event = stripeService.constructWebhookEvent(
        request.rawBody as Buffer,
        signature,
      );

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const orderId = session.metadata?.orderId;

          if (orderId) {
            await prisma.order.update({
              where: { id: orderId },
              data: {
                paymentStatus: "PAID",
                status: "CONFIRMED",
              },
            });
          }
          break;
        }

        case "checkout.session.expired": {
          const session = event.data.object;
          const orderId = session.metadata?.orderId;

          if (orderId) {
            await prisma.order.update({
              where: { id: orderId },
              data: { paymentStatus: "FAILED" },
            });
          }
          break;
        }
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
