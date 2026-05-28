-- Garante a coluna payment_session_id de forma idempotente:
-- - bancos antigos (tinham stripe_session_id): RENAME, preservando os dados;
-- - bancos novos via `migrate deploy` (nenhuma migration cria stripe_session_id):
--   cria payment_session_id direto.
-- Sem o IF, o RENAME falha num banco zerado (coluna inexistente) e trava o migrate (P3009).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE "orders" RENAME COLUMN "stripe_session_id" TO "payment_session_id";
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_session_id'
  ) THEN
    ALTER TABLE "orders" ADD COLUMN "payment_session_id" TEXT;
  END IF;
END $$;
