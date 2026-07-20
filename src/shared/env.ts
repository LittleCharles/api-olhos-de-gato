import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test", "staging"]).default("development"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  CORS_ORIGIN: z.string().optional(),
  STORAGE_PROVIDER: z.enum(["local", "r2"]).default("local"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  ML_APP_ID: z.string().optional(),
  ML_CLIENT_SECRET: z.string().optional(),
  MELHOR_ENVIO_TOKEN: z.string().optional(),
  // GA4 Measurement Protocol (purchase server-side via webhook Stripe). Opcionais:
  // sem eles, o disparo server-side é simplesmente pulado (client-side continua medindo).
  GA4_MEASUREMENT_ID: z.string().optional(),
  GA4_API_SECRET: z.string().optional(),
  // nº de hops de proxy confiáveis (ou CIDR/IP). Default 1 (borda do Railway).
  TRUST_PROXY: z.string().optional(),
});

const MAIL_KEYS = [
  "MAILTRAP_API_TOKEN",
  "MAIL_FROM",
] as const;

const PROD_REQUIRED = [
  "FRONTEND_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "CORS_ORIGIN",
  "MAILTRAP_API_TOKEN",
  "MAIL_FROM",
] as const;

export function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Invalid environment variables:");
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  const isProd = result.data.NODE_ENV === "production";
  const isSandboxMail = (process.env.MAILTRAP_MODE || "sandbox").toLowerCase() !== "live";

  if (isProd) {
    const missing: string[] = PROD_REQUIRED.filter((k) => !process.env[k]);
    if (isSandboxMail && !process.env.MAILTRAP_INBOX_ID) {
      missing.push("MAILTRAP_INBOX_ID");
    }
    if (missing.length > 0) {
      console.error(
        `[env] Envs obrigatórias em produção ausentes: ${missing.join(", ")}`,
      );
      process.exit(1);
    }
    if (process.env.CORS_ORIGIN === "true") {
      console.error(
        "[env] CORS_ORIGIN=true é inseguro em produção (permite qualquer origem com credentials:true). Use a URL literal do frontend.",
      );
      process.exit(1);
    }
    if (process.env.FRONTEND_URL?.includes("localhost")) {
      console.error(
        "[env] FRONTEND_URL aponta para localhost em produção. Stripe checkout e emails de reset de senha vão quebrar.",
      );
      process.exit(1);
    }
    if (!process.env.TRUST_PROXY) {
      console.warn(
        "[env] TRUST_PROXY não definido: usando default de 1 hop. Confirme que request.ip reflete o IP real do cliente atrás do proxy do Railway (ajuste o nº de hops se necessário).",
      );
    }

    // Guards contra divergências silenciosas dev→prod (boot OK mas comportamento errado).
    // Convertem falha silenciosa em falha visível no deploy. Só rodam em produção real
    // (NODE_ENV=production); staging deve usar NODE_ENV=staging e mantém sandbox livremente.

    // Storage: 'local' em produção = FS efêmero do Railway → imagens de produto somem a cada deploy.
    if (result.data.STORAGE_PROVIDER === "local") {
      console.error(
        "[env] STORAGE_PROVIDER=local em produção: o filesystem do Railway é efêmero e as imagens de produto somem a cada deploy/restart. Use STORAGE_PROVIDER=r2.",
      );
      process.exit(1);
    }
    if (result.data.STORAGE_PROVIDER === "r2") {
      const missingR2 = [
        "STORAGE_ACCOUNT_ID",
        "STORAGE_BUCKET",
        "STORAGE_PUBLIC_URL",
        "STORAGE_ACCESS_KEY",
        "STORAGE_SECRET_KEY",
      ].filter((k) => !process.env[k]);
      if (missingR2.length > 0) {
        console.error(
          `[env] STORAGE_PROVIDER=r2 mas faltam vars de R2: ${missingR2.join(", ")}. Uploads de imagem falham silenciosamente.`,
        );
        process.exit(1);
      }
    }

    // Email: sandbox em produção = e-mails de cliente (confirmação de pedido, reset de senha,
    // verificação) ficam presos no inbox de sandbox e NÃO chegam ao cliente.
    if (isSandboxMail) {
      console.error(
        "[env] MAILTRAP_MODE não está 'live' em produção: e-mails de cliente (confirmação de pedido, reset de senha, verificação) NÃO serão entregues. Defina MAILTRAP_MODE=live.",
      );
      process.exit(1);
    }

    // Frete: Melhor Envio configurado mas em sandbox = checkout calcula fretes falsos.
    if (
      process.env.MELHOR_ENVIO_TOKEN &&
      process.env.MELHOR_ENVIO_SANDBOX === "true"
    ) {
      console.error(
        "[env] MELHOR_ENVIO_SANDBOX=true em produção: o checkout vai calcular fretes de sandbox (errados). Defina MELHOR_ENVIO_SANDBOX=false.",
      );
      process.exit(1);
    }

    // Mercado Livre: redirect localhost quebra o OAuth de conectar conta (admin-only → warn, não derruba a loja).
    if (process.env.ML_REDIRECT_URI?.includes("localhost")) {
      console.warn(
        "[env] ML_REDIRECT_URI aponta para localhost em produção: conectar conta do Mercado Livre vai falhar. Use a URL pública da API.",
      );
    }
  } else {
    const missingMail: string[] = MAIL_KEYS.filter((k) => !process.env[k]);
    if (isSandboxMail && !process.env.MAILTRAP_INBOX_ID) {
      missingMail.push("MAILTRAP_INBOX_ID");
    }
    if (missingMail.length > 0) {
      console.warn(
        `[env] Envs de email ausentes (${missingMail.join(", ")}). Emails NÃO serão enviados.`,
      );
    }
    const missingStripe = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"].filter(
      (k) => !process.env[k],
    );
    if (missingStripe.length > 0) {
      console.warn(
        `[env] Envs Stripe ausentes em dev (${missingStripe.join(", ")}). Fluxo de pagamento não funcionará.`,
      );
    }
  }

  return result.data;
}
