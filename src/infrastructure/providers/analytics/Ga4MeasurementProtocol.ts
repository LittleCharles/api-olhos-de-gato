/**
 * GA4 Measurement Protocol — dispara o evento `purchase` pelo servidor (fonte de verdade
 * confiável: roda no webhook da Stripe quando o pagamento é confirmado, cobrindo casos em
 * que o evento client-side não dispara, ex.: PIX assíncrono ou aba fechada).
 *
 * - No-op se GA4_MEASUREMENT_ID/GA4_API_SECRET não estiverem configurados.
 * - No-op se não houver clientId (sem cookie _ga → analytics provavelmente sem consentimento;
 *   não enviamos nada pelo servidor pra respeitar a escolha do usuário/LGPD).
 * - Dedup: o GA4 deduplica `purchase` pelo mesmo `transaction_id`; como usamos o client_id
 *   real (capturado no checkout), client-side e server-side casam sem dupla contagem.
 */
export interface Ga4PurchaseItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
}

export interface Ga4PurchaseInput {
  clientId: string | null | undefined;
  transactionId: string;
  value: number;
  currency: string;
  items: Ga4PurchaseItem[];
}

export async function sendGa4Purchase(input: Ga4PurchaseInput): Promise<void> {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!measurementId || !apiSecret) return;
  if (!input.clientId) return;

  const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
    measurementId,
  )}&api_secret=${encodeURIComponent(apiSecret)}`;

  const body = {
    client_id: input.clientId,
    // non_personalized_ads fica implícito; mandamos só o evento de compra.
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: input.transactionId,
          currency: input.currency,
          value: input.value,
          items: input.items.map((i) => ({
            item_id: i.itemId,
            item_name: i.itemName,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
    ],
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // GA4 MP responde 204 No Content em sucesso; não lança em erro de validação (silencioso).
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`GA4 MP ${response.status}: ${text.slice(0, 300)}`);
  }
}
