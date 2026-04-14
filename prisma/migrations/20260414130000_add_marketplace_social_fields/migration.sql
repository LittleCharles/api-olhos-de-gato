-- Add marketplace social fields to store_settings (schema drift fix)
ALTER TABLE "store_settings"
  ADD COLUMN IF NOT EXISTS "social_mercado_livre" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "social_shopee" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "social_amazon" TEXT NOT NULL DEFAULT '';
