import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  CORS_ORIGIN: z.string().optional(),
  STORAGE_PROVIDER: z.enum(["local", "r2"]).default("local"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
});

const MAIL_KEYS = [
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

  const missingMail = MAIL_KEYS.filter((k) => !process.env[k]);
  if (missingMail.length > 0) {
    console.warn(
      `[env] Envs de email ausentes (${missingMail.join(", ")}). Emails NÃO serão enviados.`,
    );
  }

  return result.data;
}
