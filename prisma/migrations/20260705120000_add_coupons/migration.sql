-- Cupons de desconto (percentual):
--  - coupons: nova tabela — código único (MAIÚSCULO), % de desconto, regras opcionais
--    (pedido mínimo, limite total de usos, vigência) e contador de usos.
--  - orders: coupon_id (FK SET NULL — pedido sobrevive à exclusão do cupom) e
--    coupon_code (snapshot pra exibição no histórico).
--
-- Idempotente (IF NOT EXISTS / DO $$): no-op onde já existe, aditiva onde falta.
-- Seguro para `prisma migrate deploy` em qualquer ambiente (dev/staging/prod).
CREATE TABLE IF NOT EXISTS "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discount_percent" DECIMAL(5,2) NOT NULL,
    "min_order_value" DECIMAL(10,2),
    "usage_limit" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "coupons_code_key" ON "coupons"("code");

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "coupon_id" TEXT,
  ADD COLUMN IF NOT EXISTS "coupon_code" TEXT;

CREATE INDEX IF NOT EXISTS "orders_coupon_id_idx" ON "orders"("coupon_id");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_coupon_id_fkey') THEN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_fkey"
      FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
