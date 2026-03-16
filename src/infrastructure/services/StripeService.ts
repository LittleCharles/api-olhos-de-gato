import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      metadata: { orderId: input.orderId },
      ...(input.customerEmail
        ? { customer_email: input.customerEmail }
        : {}),
      success_url: `${frontendUrl}/pedidos?payment=success&order=${input.orderId}`,
      cancel_url: `${frontendUrl}/checkout?payment=cancelled`,
    });

    return {
      sessionId: session.id,
      sessionUrl: session.url!,
    };
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}

export const stripeService = new StripeService();
