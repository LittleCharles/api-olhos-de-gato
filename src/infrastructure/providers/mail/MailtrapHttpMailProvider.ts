import type { IMailProvider, SendMailData } from "../../../application/interfaces/IMailProvider.js";

interface FromAddress {
  email: string;
  name?: string;
}

function parseFrom(raw: string): FromAddress {
  // Aceita "Nome <email@dominio>" ou só "email@dominio"
  const match = raw.match(/^\s*(.+?)\s*<(.+)>\s*$/);
  if (match) return { name: match[1], email: match[2] };
  return { email: raw.trim() };
}

function resolveEndpoint(): string {
  const mode = (process.env.MAILTRAP_MODE || "sandbox").toLowerCase();
  if (mode === "live") {
    return "https://send.api.mailtrap.io/api/send";
  }
  const inboxId = process.env.MAILTRAP_INBOX_ID;
  if (!inboxId) {
    throw new Error("MAILTRAP_INBOX_ID é obrigatório quando MAILTRAP_MODE=sandbox");
  }
  return `https://sandbox.api.mailtrap.io/api/send/${inboxId}`;
}

export class MailtrapHttpMailProvider implements IMailProvider {
  async send(data: SendMailData): Promise<void> {
    const token = process.env.MAILTRAP_API_TOKEN;
    if (!token) {
      throw new Error("MAILTRAP_API_TOKEN não configurado");
    }

    const from = parseFrom(
      process.env.MAIL_FROM || "Olhos de Gato <noreply@olhosdegato.com.br>",
    );
    const endpoint = resolveEndpoint();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [{ email: data.to }],
        subject: data.subject,
        html: data.html,
      }),
    });

    if (!response.ok) {
      // Mailtrap retorna JSON com { errors: [...] } em falha
      const bodyText = await response.text().catch(() => "");
      throw new Error(
        `Mailtrap API ${response.status} ${response.statusText}: ${bodyText.slice(0, 500)}`,
      );
    }
  }
}
