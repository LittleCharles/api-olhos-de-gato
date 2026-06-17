-- Adiciona as colunas de frete do pedido (shipping_cost/service/days) que existiam no
-- schema.prisma (model Order) mas nunca foram capturadas em uma migração — haviam sido
-- aplicadas em dev/staging via `prisma db push`. Produção roda `prisma migrate deploy`,
-- então nunca as recebeu, causando P2022 em order.findMany()/create().
--
-- Idempotente (IF NOT EXISTS): no-op em ambientes que já têm as colunas (dev/staging),
-- aditiva em produção (onde faltam). Seguro para `migrate deploy` em qualquer ambiente.
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "shipping_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "shipping_service" TEXT,
  ADD COLUMN IF NOT EXISTS "shipping_days" INTEGER;
