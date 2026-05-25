import Stripe from "stripe";
import { AppError } from "../../shared/errors/AppError.js";

let stripeClient: Stripe | null = null;

// Lazy init: cria o cliente Stripe só no primeiro uso. Evita derrubar o boot
// do servidor inteiro quando STRIPE_SECRET_KEY está ausente (o new Stripe("")
// do SDK lança na hora). Em prod o env.ts já exige a chave; em dev a app sobe
// e só o pagamento falha — com erro claro — em vez de crashar no import.
function getStripe(): Stripe {
  if (!stripeClient) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new AppError("Pagamento indisponível: STRIPE_SECRET_KEY não configurada.", 503);
    }
    stripeClient = new Stripe(apiKey, { apiVersion: "2026-02-25.clover" });
  }
  return stripeClient;
}

interface CheckoutItem {
  name: string;
  quantity: number;
  unitPriceCents: number;
  image?: string;
}

interface CreateCheckoutSessionInput {
  orderId: string;
  items: CheckoutItem[];
  shippingCents?: number;
  customerEmail?: string;
}

export class StripeService {
  async createCheckoutSession(input: CreateCheckoutSessionInput) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      input.items.map((item) => ({
        price_data: {
          currency: "brl",
          product_data: {
            name: item.name,
            ...(item.image ? { images: [item.image] } : {}),
          },
          unit_amount: item.unitPriceCents,
        },
        quantity: item.quantity,
      }));

    // Add shipping as a line item if present
    if (input.shippingCents && input.shippingCents > 0) {
      lineItems.push({
        price_data: {
          currency: "brl",
          product_data: { name: "Frete" },
          unit_amount: input.shippingCents,
        },
        quantity: 1,
      });
    }

    const session = await getStripe().checkout.sessions.create({
      ui_mode: "embedded",
      // Métodos de pagamento dinâmicos: omitimos payment_method_types para a Stripe
      // exibir o que estiver ATIVADO no Dashboard (cartão hoje; PIX aparece sozinho
      // assim que for ativado, sem redeploy). Fixar um método não ativado quebra a
      // criação da sessão. O PIX é assíncrono — confirma via async_payment_succeeded.
      mode: "payment",
      line_items: lineItems,
      metadata: { orderId: input.orderId },
      ...(input.customerEmail
        ? { customer_email: input.customerEmail }
        : {}),
      // Janela curta libera estoque rápido se o cliente abandonar; Stripe aceita 30min–24h.
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
      locale: "pt-BR",
      // Já coletamos CPF/telefone no cadastro — não pedir de novo no Stripe
      phone_number_collection: { enabled: false },
      billing_address_collection: "auto",
      custom_text: {
        submit: {
          message: "Acompanhe seu pedido em Meus Pedidos após o pagamento.",
        },
      },
      // Embedded: usuário continua no nosso domínio; Stripe redireciona o iframe pra return_url ao finalizar
      return_url: `${frontendUrl}/pedidos?payment=success&order=${input.orderId}`,
    });

    return {
      sessionId: session.id,
      clientSecret: session.client_secret!,
    };
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }
    return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  }
}

export const stripeService = new StripeService();
