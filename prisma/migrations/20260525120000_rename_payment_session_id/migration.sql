-- Troca de provedor de pagamento (Stripe -> AbacatePay): renomeia a coluna que guarda
-- o id da sessão/cobrança. Mantém os dados existentes (RENAME, não DROP).
ALTER TABLE "orders" RENAME COLUMN "stripe_session_id" TO "payment_session_id";
