-- Marketing / Google Ads:
--  - orders: colunas de atribuição (UTM + gclid) capturadas no 1º acesso e persistidas no
--    pedido. Todas nullable (sem default) — só dado analítico.
--  - store_settings: looker_studio_url (URL de embed do dashboard, admin-only).
--
-- Idempotente (IF NOT EXISTS): no-op onde as colunas já existem, aditiva onde faltam.
-- Seguro para `prisma migrate deploy` em qualquer ambiente (dev/staging/prod).
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "utm_source" TEXT,
  ADD COLUMN IF NOT EXISTS "utm_medium" TEXT,
  ADD COLUMN IF NOT EXISTS "utm_campaign" TEXT,
  ADD COLUMN IF NOT EXISTS "utm_content" TEXT,
  ADD COLUMN IF NOT EXISTS "utm_term" TEXT,
  ADD COLUMN IF NOT EXISTS "gclid" TEXT,
  ADD COLUMN IF NOT EXISTS "ga_client_id" TEXT;

ALTER TABLE "store_settings"
  ADD COLUMN IF NOT EXISTS "looker_studio_url" TEXT NOT NULL DEFAULT '';
