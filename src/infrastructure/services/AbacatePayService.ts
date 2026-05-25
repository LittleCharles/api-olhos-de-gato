import AbacatePayImport from "abacatepay-nodejs-sdk";

// O SDK é CJS: sob NodeNext o tipo do default não resolve como função, mas em runtime
// (esModuleInterop) o import default É a função-fábrica. Cast pra forma documentada no README.
const AbacatePay = AbacatePayImport as unknown as (apiKey: string) => {
  billing: {
    create(data: {
      frequency: "ONE_TIME";
      methods: ("PIX" | "CARD")[];
      products: { externalId: string; name: string; quantity: number; price: number }[];
      returnUrl: string;
      completionUrl: string;
      customer: { name?: string; email: string; cellphone?: string; taxId?: string };
    }): Promise<{ error: string | null; data: { id: string; url: string } | null }>;
  };
};

// Key de DEV gera transações simuladas; key de produção processa pagamentos reais.
const abacate = AbacatePay(process.env.ABACATEPAY_API_KEY || "");

interface CheckoutProduct {
  // externalId único por linha (a AbacatePay cria o produto automaticamente por esse id).
  externalId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
}

interface CreateCheckoutInput {
  orderId: string;
  products: CheckoutProduct[];
  // email é obrigatório; o resto a AbacatePay coleta na página de pagamento se faltar.
  customer: { name?: string; email: string; cellphone?: string; taxId?: string };
}

export class AbacatePayService {
  /**
   * Cria uma cobrança hospedada (PIX + cartão). Os produtos vão inline (incluindo o frete
   * como uma linha) e a AbacatePay cria o produto automaticamente pelo externalId.
   * Retorna { id, url } — `url` é o checkout pra onde o cliente é redirecionado;
   * `id` é salvo no pedido (paymentSessionId) pra reconciliar no webhook.
   */
  async createCheckout(input: CreateCheckoutInput): Promise<{ id: string; url: string }> {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const response = await abacate.billing.create({
      frequency: "ONE_TIME",
      methods: ["PIX", "CARD"],
      products: input.products.map((p) => ({
        externalId: p.externalId,
        name: p.name,
        quantity: p.quantity,
        price: p.unitPriceCents,
      })),
      returnUrl: `${frontendUrl}/pedidos`,
      completionUrl: `${frontendUrl}/pedidos?payment=success&order=${input.orderId}`,
      customer: input.customer,
    });

    if (response.error || !response.data) {
      throw new Error(`AbacatePay: falha ao criar cobrança — ${response.error}`);
    }

    return { id: response.data.id, url: response.data.url };
  }
}

export const abacatePayService = new AbacatePayService();
