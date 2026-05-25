import crypto from "node:crypto";

const API_BASE = "https://api.abacatepay.com/v2";

// Public key fixa da AbacatePay usada pra assinar os webhooks (HMAC-SHA256 → X-Webhook-Signature).
// Fonte: docs.abacatepay.com/pages/webhooks/security.
const ABACATEPAY_PUBLIC_KEY =
  "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

interface CheckoutProduct {
  externalId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
}

interface CreateCheckoutInput {
  orderId: string;
  // itens + a linha de frete (o controller monta isso); somamos tudo no produto do pedido.
  products: CheckoutProduct[];
  customer: { name?: string; email: string; cellphone?: string; taxId?: string };
}

async function abacatePost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY || ""}`,
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => null)) as
    | { data: T | null; error: string | null }
    | null;

  if (!res.ok || !json || json.error || !json.data) {
    throw new Error(
      `AbacatePay ${path} falhou (${res.status}): ${json?.error ?? res.statusText}`,
    );
  }
  return json.data;
}

export class AbacatePayService {
  /**
   * Cria a cobrança v2 (checkout hospedado, PIX + cartão). Como o checkout v2 só aceita
   * produto por ID e não tem campo de frete, criamos 1 produto por pedido com o TOTAL
   * (itens + frete somados). Reconciliação no webhook é por externalId (= orderId).
   * Retorna { id, url } — `url` é o checkout pra redirecionar; `id` é salvo no pedido.
   */
  async createCheckout(input: CreateCheckoutInput): Promise<{ id: string; url: string }> {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const totalCents = input.products.reduce(
      (sum, p) => sum + p.unitPriceCents * p.quantity,
      0,
    );

    // 1) Produto representando o pedido (total já inclui o frete).
    const product = await abacatePost<{ id: string }>("/products/create", {
      name: `Pedido ${input.orderId.slice(0, 8)}`,
      description: "Pedido Olhos de Gato",
      price: totalCents,
      externalId: `order-${input.orderId}`,
    });

    // 2) Checkout v2 referenciando o produto.
    const checkout = await abacatePost<{ id: string; url: string }>("/checkouts/create", {
      items: [{ id: product.id, quantity: 1 }],
      externalId: input.orderId,
      methods: ["PIX", "CARD"],
      frequency: "ONE_TIME",
      returnUrl: `${frontendUrl}/pedidos`,
      completionUrl: `${frontendUrl}/pedidos?payment=success&order=${input.orderId}`,
      customer: input.customer,
    });

    return { id: checkout.id, url: checkout.url };
  }

  /**
   * Verifica a assinatura HMAC-SHA256 (base64) do header X-Webhook-Signature,
   * calculada sobre o corpo bruto (raw body) com a public key fixa da AbacatePay.
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const expected = crypto
      .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
      .update(Buffer.from(rawBody, "utf8"))
      .digest("base64");
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
}

export const abacatePayService = new AbacatePayService();
