export interface BaseLayoutStoreInfo {
  /** Email de contato exibido no rodapé. Padrão: contato@olhosdegato.com.br */
  helpEmail?: string;
  /** Link "Central de Atendimento" (header). Padrão: ${FRONTEND_URL}/central-ajuda */
  helpUrl?: string;
  /** URL absoluta do logo (header). Padrão: ${FRONTEND_URL}/LogoOlhosdeGatos.png */
  logoUrl?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialTiktok?: string;
}

interface BaseLayoutParams {
  title: string;
  preview: string;
  content: string;
  cta?: { label: string; url: string };
  storeInfo?: BaseLayoutStoreInfo;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function frontendBase(): string {
  return process.env.FRONTEND_URL || "http://localhost:3000";
}

// Inline SVG icons. Funciona em Apple Mail, Gmail web/mobile, Outlook 365/Mac, Yahoo, Mailtrap preview.
// Outlook desktop antigo pode mostrar fallback (alt text via title), aceitável.
const SVG_INSTAGRAM = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;"><rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="#ec4899" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" stroke="#ec4899" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.1" fill="#ec4899"/></svg>`;
const SVG_FACEBOOK = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display:block;"><path fill="#1877F2" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>`;
const SVG_TIKTOK = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display:block;"><path fill="#18181b" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/></svg>`;

function renderSocialRow(store?: BaseLayoutStoreInfo): string {
  const items: Array<{ label: string; url: string; svg: string }> = [];
  if (store?.socialInstagram) items.push({ label: "Instagram", url: store.socialInstagram, svg: SVG_INSTAGRAM });
  if (store?.socialFacebook) items.push({ label: "Facebook", url: store.socialFacebook, svg: SVG_FACEBOOK });
  if (store?.socialTiktok) items.push({ label: "TikTok", url: store.socialTiktok, svg: SVG_TIKTOK });
  if (items.length === 0) return "";

  const cells = items
    .map(
      ({ label, url, svg }) => `
      <td style="padding:0 10px;">
        <a href="${encodeURI(url)}" title="${escapeHtml(label)}" style="display:inline-block; text-decoration:none; line-height:0;">${svg}</a>
      </td>`,
    )
    .join("");

  return `
    <tr>
      <td align="center" style="padding:28px 16px 12px;">
        <table cellpadding="0" cellspacing="0" role="presentation" style="display:inline-table;"><tr>${cells}</tr></table>
      </td>
    </tr>`;
}

/**
 * Layout base para emails transacionais.
 *
 * Estrutura:
 * - Tagline acima do card
 * - Header (logo + Central de Atendimento)
 * - Stripe gradiente cyan→green
 * - Body com conteúdo dinâmico
 * - Linha de ajuda com email da loja
 * - Fora do card: ícones de redes sociais (se preenchidas em StoreSettings)
 * - Footer minimal
 */
export function baseLayout({
  title,
  preview,
  content,
  cta,
  storeInfo,
}: BaseLayoutParams): string {
  const year = new Date().getFullYear();
  const frontend = frontendBase();
  const helpEmail = storeInfo?.helpEmail || "contato@olhosdegato.com.br";
  const helpUrl = storeInfo?.helpUrl || `${frontend}/central-ajuda`;
  // Hardcoded pra prod (publico). FRONTEND_URL aponta pra staging em dev, e
  // staging tem Vercel Auth ativa -> Mailtrap recebe 401 em vez de PNG. Logo
  // e asset estatico, nao muda por ambiente, entao sempre busca de prod.
  const logoUrl = storeInfo?.logoUrl || "https://olhosdegato.com.br/LogoImageEmail.png";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; color:#18181b; -webkit-font-smoothing:antialiased;">
  <div style="display:none; max-height:0; overflow:hidden; color:transparent; opacity:0;">${escapeHtml(preview)}</div>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f4f5; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0" role="presentation">

          <!-- Top tagline -->
          <tr>
            <td style="padding:0 4px 14px;">
              <p style="margin:0; color:#9ca3af; font-size:11px; font-weight:600; letter-spacing:1.4px; text-transform:uppercase;">Petshop oficial da Olhos de Gato Pet Hotel</p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td>
              <table width="100%" style="background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);" cellpadding="0" cellspacing="0" role="presentation">

                <!-- Header (logo + central de atendimento) -->
                <tr>
                  <td style="padding:24px 32px 18px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td align="left" style="vertical-align:middle;">
                          <img src="${encodeURI(logoUrl)}" alt="Olhos de Gato" height="40" style="height:40px; width:auto; max-width:220px; display:block; border:0; outline:none; text-decoration:none;" />
                        </td>
                        <td align="right" style="vertical-align:middle;">
                          <a href="${encodeURI(helpUrl)}" style="color:#71717a; font-size:13px; text-decoration:none;">Central de Atendimento</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Gradient stripe -->
                <tr>
                  <td style="height:3px; line-height:3px; font-size:0; background:#06b6d4; background:linear-gradient(90deg,#06b6d4 0%,#3b82f6 50%,#10b981 100%);">&nbsp;</td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px 32px 24px;">
                    ${content}
                    ${cta
                      ? `
                    <div style="margin:28px 0 8px;">
                      <a href="${encodeURI(cta.url)}" style="display:inline-block; background:#0ea5e9; color:#ffffff; text-decoration:none; padding:13px 30px; border-radius:999px; font-weight:600; font-size:14px; letter-spacing:0.2px; box-shadow:0 4px 10px rgba(14,165,233,0.25);">${escapeHtml(cta.label)}</a>
                    </div>
                    <p style="font-size:11px; color:#a1a1aa; margin:18px 0 0; line-height:1.6;">Se o botão não funcionar, copie e cole este link no navegador:<br/><span style="color:#0ea5e9; word-break:break-all;">${escapeHtml(cta.url)}</span></p>
                    `
                      : ""}
                  </td>
                </tr>

                <!-- Divider + help line -->
                <tr>
                  <td style="padding:0 32px;">
                    <div style="height:1px; background:#f4f4f5; line-height:1px; font-size:0;">&nbsp;</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 32px 24px;">
                    <p style="margin:0; color:#52525b; font-size:13px; line-height:1.6;">Precisa de ajuda? Fale com a gente em <a href="mailto:${encodeURI(helpEmail)}" style="color:#0ea5e9; text-decoration:none; font-weight:500;">${escapeHtml(helpEmail)}</a></p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          ${renderSocialRow(storeInfo)}

          <!-- Bottom footer -->
          <tr>
            <td align="center" style="padding:8px 16px 24px;">
              <p style="margin:0; color:#9ca3af; font-size:11px; line-height:1.6;">© ${year} Olhos de Gato · Todos os direitos reservados</p>
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
