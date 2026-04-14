import { Order } from "../../../../domain/entities/Order.js";
import { OrderStatus } from "../../../../domain/enums/index.js";
import { baseLayout, escapeHtmlValue } from "./baseLayout.js";

export interface StoreInfo {
  name: string;
  address: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
}

function formatBRL(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

function orderShortId(order: Order): string {
  return order.id.slice(0, 8).toUpperCase();
}

function destinationBlock(order: Order, store: StoreInfo): string {
  if (order.isPickup) {
    return `
      <div style="background:#fff1f2; border-left:4px solid #ec4899; padding:14px 16px; border-radius:6px; margin:20px 0;">
        <p style="margin:0 0 4px; color:#881337; font-weight:600; font-size:14px;">🏪 Retirada na loja</p>
        <p style="margin:0; color:#3f3f46; font-size:13px;">${escapeHtmlValue(store.name)}</p>
        <p style="margin:0; color:#3f3f46; font-size:13px;">${escapeHtmlValue(store.address)}</p>
      </div>`;
  }
  return `
    <div style="background:#eff6ff; border-left:4px solid #3b82f6; padding:14px 16px; border-radius:6px; margin:20px 0;">
      <p style="margin:0; color:#1e40af; font-weight:600; font-size:14px;">📦 Entrega a domicílio</p>
    </div>`;
}

function itemsTable(order: Order): string {
  const rows = order.items
    .map((item) => {
      const name = escapeHtmlValue(item.productName);
      const unit = formatBRL(item.unitPrice.getValue());
      const total = formatBRL(item.total.getValue());
      return `<tr>
          <td style="padding:10px 8px; border-bottom:1px solid #e4e4e7; color:#3f3f46;">${name}</td>
          <td style="padding:10px 8px; border-bottom:1px solid #e4e4e7; text-align:center; color:#3f3f46;">${item.quantity}</td>
          <td style="padding:10px 8px; border-bottom:1px solid #e4e4e7; text-align:right; color:#3f3f46;">R$ ${unit}</td>
          <td style="padding:10px 8px; border-bottom:1px solid #e4e4e7; text-align:right; color:#18181b; font-weight:600;">R$ ${total}</td>
        </tr>`;
    })
    .join("");
  return `
    <table style="width:100%; border-collapse:collapse; margin:16px 0;" cellpadding="0" cellspacing="0" role="presentation">
      <thead>
        <tr style="background:#fafafa;">
          <th style="padding:10px 8px; text-align:left; font-size:13px; color:#52525b; border-bottom:1px solid #e4e4e7;">Produto</th>
          <th style="padding:10px 8px; text-align:center; font-size:13px; color:#52525b; border-bottom:1px solid #e4e4e7;">Qtd</th>
          <th style="padding:10px 8px; text-align:right; font-size:13px; color:#52525b; border-bottom:1px solid #e4e4e7;">Preço</th>
          <th style="padding:10px 8px; text-align:right; font-size:13px; color:#52525b; border-bottom:1px solid #e4e4e7;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function totalsBlock(order: Order): string {
  const subtotal = formatBRL(order.subtotal.getValue());
  const shipping = order.shippingCost ? order.shippingCost.getValue() : 0;
  const total = formatBRL(order.total.getValue());
  const shippingLine =
    !order.isPickup && shipping > 0
      ? `<p style="margin:4px 0;">Frete: <strong>R$ ${formatBRL(shipping)}</strong></p>`
      : order.isPickup
        ? `<p style="margin:4px 0; color:#65a30d;">Retirada na loja — sem custo</p>`
        : "";
  return `
    <div style="text-align:right; margin-top:12px; color:#3f3f46; font-size:14px;">
      <p style="margin:4px 0;">Subtotal: <strong>R$ ${subtotal}</strong></p>
      ${shippingLine}
      <p style="margin:8px 0 0; font-size:18px; color:#ec4899;"><strong>Total: R$ ${total}</strong></p>
    </div>`;
}

// ============================================================================
// Builders
// ============================================================================

export function buildOrderCreatedEmail(
  order: Order,
  customer: CustomerInfo,
  store: StoreInfo,
): { subject: string; html: string } {
  const shortId = orderShortId(order);
  const safeName = escapeHtmlValue(customer.name || "cliente");
  const totalStr = formatBRL(order.total.getValue());

  const content = `
    <h2 style="margin:0 0 16px; font-size:20px; color:#18181b;">Pedido recebido!</h2>
    <p style="margin:0 0 12px; color:#3f3f46;">Olá <strong>${safeName}</strong>,</p>
    <p style="margin:0 0 4px; color:#3f3f46;">Seu pedido <strong>#${shortId}</strong> foi registrado. Veja os detalhes:</p>
    ${destinationBlock(order, store)}
    ${itemsTable(order)}
    ${totalsBlock(order)}
    <p style="margin:24px 0 0; color:#71717a; font-size:13px;">Você pode acompanhar o status em "Meus Pedidos" na sua conta.</p>
  `;

  return {
    subject: `Pedido #${shortId} recebido — Olhos de Gato`,
    html: baseLayout({
      title: `Pedido #${shortId}`,
      preview: `Pedido #${shortId} confirmado — total R$ ${totalStr}`,
      content,
    }),
  };
}

export function buildPaymentConfirmedEmail(
  order: Order,
  customer: CustomerInfo,
  store: StoreInfo,
): { subject: string; html: string } {
  const shortId = orderShortId(order);
  const safeName = escapeHtmlValue(customer.name || "cliente");
  const next = order.isPickup
    ? "Vamos preparar seu pedido e avisamos quando estiver pronto pra retirada."
    : "Vamos preparar e despachar seu pedido em breve. Você receberá o código de rastreio assim que disponível.";

  const content = `
    <h2 style="margin:0 0 16px; font-size:20px; color:#18181b;">Pagamento confirmado ✅</h2>
    <p style="margin:0 0 12px; color:#3f3f46;">Olá <strong>${safeName}</strong>,</p>
    <p style="margin:0 0 4px; color:#3f3f46;">Recebemos o pagamento do seu pedido <strong>#${shortId}</strong>.</p>
    ${destinationBlock(order, store)}
    <p style="margin:0 0 4px; color:#3f3f46;">${next}</p>
  `;

  return {
    subject: `Pagamento confirmado — Pedido #${shortId}`,
    html: baseLayout({
      title: `Pagamento confirmado — #${shortId}`,
      preview: `Pagamento do pedido #${shortId} foi confirmado`,
      content,
    }),
  };
}

const statusCopy: Record<OrderStatus, { title: string; body: string } | null> = {
  [OrderStatus.PENDING]: null,
  [OrderStatus.CONFIRMED]: null, // já coberto pelo webhook de pagamento
  [OrderStatus.PREPARING]: {
    title: "Preparando seu pedido 📦",
    body: "Estamos separando os itens do seu pedido com todo carinho.",
  },
  [OrderStatus.READY]: {
    title: "Seu pedido está pronto! 🎉",
    body: "Você já pode passar na loja pra retirar. Confira o endereço abaixo.",
  },
  [OrderStatus.DELIVERED]: {
    title: "Pedido entregue ✅",
    body: "Esperamos que você e seu pet amem os produtos. Obrigado pela compra!",
  },
  [OrderStatus.CANCELLED]: {
    title: "Pedido cancelado",
    body: "Seu pedido foi cancelado. Se você não solicitou esse cancelamento, entre em contato com o suporte.",
  },
};

export function buildStatusChangeEmail(
  order: Order,
  newStatus: OrderStatus,
  customer: CustomerInfo,
  store: StoreInfo,
  notes?: string,
): { subject: string; html: string } | null {
  const copy = statusCopy[newStatus];
  if (!copy) return null;

  // READY com pickup mostra endereço da loja; READY sem pickup é estranho, mas tolera.
  const shortId = orderShortId(order);
  const safeName = escapeHtmlValue(customer.name || "cliente");
  const safeNotes = notes ? escapeHtmlValue(notes) : "";

  const notesBlock = safeNotes
    ? `<div style="background:#fafafa; border-left:4px solid #a1a1aa; padding:12px 16px; border-radius:6px; margin:16px 0; color:#3f3f46; font-size:13px; white-space:pre-wrap;">${safeNotes}</div>`
    : "";

  const content = `
    <h2 style="margin:0 0 16px; font-size:20px; color:#18181b;">${escapeHtmlValue(copy.title)}</h2>
    <p style="margin:0 0 12px; color:#3f3f46;">Olá <strong>${safeName}</strong>,</p>
    <p style="margin:0 0 4px; color:#3f3f46;">${escapeHtmlValue(copy.body)}</p>
    <p style="margin:0 0 4px; color:#3f3f46;">Pedido <strong>#${shortId}</strong></p>
    ${newStatus === OrderStatus.READY && order.isPickup ? destinationBlock(order, store) : ""}
    ${notesBlock}
  `;

  return {
    subject: `${copy.title.split(" ")[0]} — Pedido #${shortId}`,
    html: baseLayout({
      title: copy.title,
      preview: copy.body,
      content,
    }),
  };
}

export function buildTrackingEmail(
  order: Order,
  trackingCode: string,
  customer: CustomerInfo,
): { subject: string; html: string } {
  const shortId = orderShortId(order);
  const safeName = escapeHtmlValue(customer.name || "cliente");
  const safeCode = escapeHtmlValue(trackingCode);
  const correiosUrl = `https://rastreamento.correios.com.br/app/index.php?codigo=${encodeURIComponent(trackingCode)}`;

  const content = `
    <h2 style="margin:0 0 16px; font-size:20px; color:#18181b;">Seu pedido foi despachado! 🚚</h2>
    <p style="margin:0 0 12px; color:#3f3f46;">Olá <strong>${safeName}</strong>,</p>
    <p style="margin:0 0 4px; color:#3f3f46;">Seu pedido <strong>#${shortId}</strong> está a caminho.</p>
    <div style="background:#fff1f2; border-left:4px solid #ec4899; padding:14px 16px; border-radius:6px; margin:20px 0;">
      <p style="margin:0 0 4px; color:#881337; font-weight:600; font-size:13px;">Código de rastreio</p>
      <p style="margin:0; color:#18181b; font-family:monospace; font-size:16px; font-weight:600;">${safeCode}</p>
    </div>
  `;

  return {
    subject: `Pedido #${shortId} despachado — Olhos de Gato`,
    html: baseLayout({
      title: `Pedido #${shortId} despachado`,
      preview: `Código de rastreio: ${trackingCode}`,
      content,
      cta: { label: "Rastrear pedido", url: correiosUrl },
    }),
  };
}
