import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { HandlePaymentWebhookUseCase } from "../../../application/use-cases/order/HandlePaymentWebhookUseCase.js";
import { abacatePayService } from "../../services/AbacatePayService.js";

export class WebhookController {
  async abacatePayWebhook(request: FastifyRequest, reply: FastifyReply) {
    // Validação dupla (AbacatePay v2):
    // (a) secret na URL (?webhookSecret=) — comparado com ABACATEPAY_WEBHOOK_SECRET
    const secret = (request.query as { webhookSecret?: string })?.webhookSecret;
    if (
      !process.env.ABACATEPAY_WEBHOOK_SECRET ||
      secret !== process.env.ABACATEPAY_WEBHOOK_SECRET
    ) {
      return reply.status(401).send({ error: "Invalid webhook secret" });
    }

    // (b) assinatura HMAC (X-Webhook-Signature) sobre o raw body
    const signature = request.headers["x-webhook-signature"] as string | undefined;
    const raw = request.rawBody;
    const rawStr = typeof raw === "string" ? raw : raw?.toString("utf8");
    if (!signature || !rawStr || !abacatePayService.verifyWebhookSignature(rawStr, signature)) {
      return reply.status(401).send({ error: "Invalid signature" });
    }

    try {
      const body = request.body as {
        event?: string;
        data?: { checkout?: { externalId?: string; id?: string; status?: string } };
      };
      const event = body.event;
      // Reconciliação: externalId do checkout = id do nosso pedido (setado na criação).
      const orderId = body.data?.checkout?.externalId;

      if (event && orderId) {
        const handleWebhook = container.resolve(HandlePaymentWebhookUseCase);
        await handleWebhook.execute({ event, orderId });
      }

      return reply.send({ received: true });
    } catch (err) {
      request.log.error(err, "AbacatePay webhook error");
      return reply.status(400).send({ error: "Webhook processing failed" });
    }
  }
}

const webhookController = new WebhookController();
export { webhookController };
