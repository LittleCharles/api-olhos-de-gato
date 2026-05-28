-- Taxa do cartão repassada ao cliente (embutida no preço e no frete).
-- card_fee_percent / pix_fee_percent: % da Stripe; card_fee_fixed: R$ fixo por transação;
-- apply_card_fee_to_shipping: liga o gross-up do frete no checkout.
ALTER TABLE "store_settings"
  ADD COLUMN "card_fee_percent" DECIMAL(5,2) NOT NULL DEFAULT 3.99,
  ADD COLUMN "card_fee_fixed" DECIMAL(10,2) NOT NULL DEFAULT 0.39,
  ADD COLUMN "pix_fee_percent" DECIMAL(5,2) NOT NULL DEFAULT 0.99,
  ADD COLUMN "apply_card_fee_to_shipping" BOOLEAN NOT NULL DEFAULT true;
