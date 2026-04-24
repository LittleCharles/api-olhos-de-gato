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
});

const MAIL_KEYS = [
  "MAIL_HOST",
  "MAIL_PORT",
  "MAIL_USER",
  "MAIL_PASS",
  "MAIL_FROM",
] as const;

const PROD_REQUIRED = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "CORS_ORIGIN",
  "MAIL_HOST",
  "MAIL_PORT",
  "MAIL_USER",
  "MAIL_PASS",
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

  if (isProd) {
    const missing = PROD_REQUIRED.filter((k) => !process.env[k]);
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
  } else {
    const missingMail = MAIL_KEYS.filter((k) => !process.env[k]);
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
