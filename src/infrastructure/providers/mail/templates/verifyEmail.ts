import { baseLayout, escapeHtmlValue, type BaseLayoutStoreInfo } from "./baseLayout.js";

export interface VerifyEmailParams {
  customerName: string;
  verifyUrl: string;
  storeInfo?: BaseLayoutStoreInfo;
}

export function buildVerifyEmail({
  customerName,
  verifyUrl,
  storeInfo,
}: VerifyEmailParams): { subject: string; html: string } {
  const safeName = escapeHtmlValue(customerName || "cliente");

  const content = `
    <h1 style="margin:0 0 16px; font-size:22px; font-weight:700; color:#18181b; line-height:1.3;">Bem-vindo ao Olhos de Gato!</h1>
    <p style="margin:0 0 14px; color:#3f3f46; font-size:15px; line-height:1.6;">Olá, <strong>${safeName}</strong>! Falta só um passo pra ativar sua conta.</p>
    <p style="margin:0 0 8px; color:#3f3f46; font-size:15px; line-height:1.6;">Clique no botão abaixo pra confirmar seu email. O link expira em <strong>24 horas</strong>.</p>
  `;

  return {
    subject: "Confirme seu email — Olhos de Gato",
    html: baseLayout({
      title: "Confirme seu email",
      preview: "Ative sua conta no Olhos de Gato",
      content,
      cta: { label: "Confirmar email", url: verifyUrl },
      storeInfo,
    }),
  };
}
