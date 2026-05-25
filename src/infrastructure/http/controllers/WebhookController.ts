import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { HandlePaymentWebhookUseCase } from "../../../application/use-cases/order/HandlePaymentWebhookUseCase.js";
import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";

export class WebhookController {
  async abacatePayWebhook(request: FastifyRequest, reply: FastifyReply) {
    // Validação: a AbacatePay chama a URL configurada com ?webhookSecret=<secret> (definido no painel).
    const secret = (request.query as { webhookSecret?: string })?.webhookSecret;
    const expected = process.env.ABACATEPAY_WEBHOOK_SECRET;
    if (!expected || secret !== expected) {
      return reply.status(401).send({ error: "Invalid webhook secret" });
    }

    try {
      const body = request.body as {
        event?: string;
        data?: { billing?: { id?: string; status?: string } };
      };
      const event = body.event;
      const billingId = body.data?.billing?.id;

      if (event && billingId) {
        // Reconciliação: o billing.id foi salvo no pedido (paymentSessionId) na criação da cobrança.
        const orderRepo = container.resolve<IOrderRepository>("OrderRepository");
        const order = await orderRepo.findByPaymentSessionId(billingId);
        if (order) {
          const handleWebhook = container.resolve(HandlePaymentWebhookUseCase);
          await handleWebhook.execute({ event, orderId: order.id });
        }
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
