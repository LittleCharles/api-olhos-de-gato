/**
 * Constantes de auth/sessão.
 *
 * - JWT lifetime: string aceita pelo `@fastify/jwt` (ex: "24h", "30d").
 * - Cookie maxAge: segundos (Fastify cookie API).
 * - Token expiry: milissegundos (`Date.now() + ms`).
 */

const SECONDS_PER_HOUR = 60 * 60;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;

export const SESSION_LIFETIME = {
  /** Login com "Lembrar-me" marcado */
  REMEMBER_ME: { jwt: "30d", maxAgeSeconds: 30 * SECONDS_PER_DAY },
  /** Login padrão (sem Lembrar-me) */
  DEFAULT: { jwt: "24h", maxAgeSeconds: SECONDS_PER_DAY },
  /** Cadastro novo: 7 dias por padrão pra não interromper o onboarding */
  REGISTER: { jwt: "7d", maxAgeSeconds: 7 * SECONDS_PER_DAY },
} as const;

/** Validade do token de redefinição de senha (gerado em ForgotPassword) */
export const RESET_PASSWORD_TOKEN_LIFETIME_MS = SECONDS_PER_HOUR * 1000;

/** Validade do token de verificação de email */
export const VERIFY_EMAIL_TOKEN_LIFETIME_MS = SECONDS_PER_DAY * 1000;
