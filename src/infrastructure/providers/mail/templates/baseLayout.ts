interface BaseLayoutParams {
  title: string;
  preview: string;
  content: string;
  cta?: { label: string; url: string };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Layout base para emails transacionais.
 * - Header rosa com marca "Olhos de Gato"
 * - Body com conteúdo específico (HTML já sanitizado pelo caller)
 * - CTA opcional (botão rosa)
 * - Footer neutro com aviso de email automático
 */
export function baseLayout({
  title,
  preview,
  content,
  cta,
}: BaseLayoutParams): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#18181b;">
  <div style="display:none; max-height:0; overflow:hidden; color:transparent;">${escapeHtml(preview)}</div>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f4f5; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08);" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="background:#ec4899; padding:20px 32px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:22px; font-weight:700; letter-spacing:0.3px;">Olhos de Gato</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${content}
              ${cta
                ? `
              <div style="text-align:center; margin:32px 0 8px;">
                <a href="${encodeURI(cta.url)}" style="display:inline-block; background:#ec4899; color:#ffffff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600; font-size:15px;">${escapeHtml(cta.label)}</a>
              </div>
              <p style="text-align:center; font-size:12px; color:#71717a; margin:16px 0 0;">Se o botão não funcionar, copie e cole este link no navegador:<br/><span style="color:#52525b; word-break:break-all;">${escapeHtml(cta.url)}</span></p>
              `
                : ""}
            </td>
          </tr>
          <tr>
            <td style="background:#fafafa; padding:20px 32px; text-align:center; color:#71717a; font-size:12px;">
              Este é um email automático — se você não reconhece essa mensagem, pode ignorar.<br/>
              © Olhos de Gato · Petshop oficial
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Escapa valores dinâmicos (vindo de usuário) antes de inserir no template. */
export const escapeHtmlValue = escapeHtml;
