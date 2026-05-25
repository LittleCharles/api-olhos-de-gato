-- O valor SHIPPED foi adicionado ao enum OrderStatus no schema (passo "Enviado"),
-- mas faltou a migração para criá-lo no banco. Adiciona após READY (mesma ordem do
-- schema, evitando drift). IF NOT EXISTS torna idempotente caso já exista em algum ambiente.
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'SHIPPED' AFTER 'READY';
