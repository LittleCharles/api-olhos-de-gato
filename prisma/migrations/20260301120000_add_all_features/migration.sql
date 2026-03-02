-- CreateEnum
CREATE TYPE "AnimalType" AS ENUM ('GATO', 'CACHORRO', 'AMBOS');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TicketSubject" AS ENUM ('PEDIDO', 'PRODUTO', 'TROCA', 'OUTRO');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "MarketplacePlatform" AS ENUM ('MERCADO_LIVRE', 'SHOPEE', 'AMAZON');

-- CreateEnum
CREATE TYPE "MarketplaceListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ERROR', 'CLOSED');

-- AlterTable: users - add is_active
ALTER TABLE "users" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: products - add new columns, make category_id nullable
ALTER TABLE "products" ALTER COLUMN "category_id" DROP NOT NULL;
ALTER TABLE "products" ADD COLUMN "subcategory_id" TEXT;
ALTER TABLE "products" ADD COLUMN "animal_type" "AnimalType" NOT NULL DEFAULT 'GATO';
ALTER TABLE "products" ADD COLUMN "promo_price" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN "sku" TEXT;
ALTER TABLE "products" ADD COLUMN "is_featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN "is_recommended" BOOLEAN NOT NULL DEFAULT false;

-- Generate unique SKU for existing products (if any)
UPDATE "products" SET "sku" = 'SKU-' || LEFT("id", 8) WHERE "sku" IS NULL;
ALTER TABLE "products" ALTER COLUMN "sku" SET NOT NULL;
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex for products
CREATE INDEX "products_subcategory_id_idx" ON "products"("subcategory_id");
CREATE INDEX "products_animal_type_idx" ON "products"("animal_type");

-- AlterTable: orders - add tracking_code, source, external_order_id
ALTER TABLE "orders" ADD COLUMN "tracking_code" TEXT;
ALTER TABLE "orders" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'DIRECT';
ALTER TABLE "orders" ADD COLUMN "external_order_id" TEXT;

-- Drop old FK on products.category_id (was RESTRICT, stays RESTRICT but column is now nullable)
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_fkey";
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: subcategories
CREATE TABLE "subcategories" (
    "id" TEXT NOT NULL,
    "animal_type" "AnimalType" NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subcategories_animal_type_id_key" ON "subcategories"("animal_type", "id");

-- AddForeignKey: products.subcategory_id -> subcategories
ALTER TABLE "products" ADD CONSTRAINT "products_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: product_specifications
CREATE TABLE "product_specifications" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: reviews
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reviews_product_id_idx" ON "reviews"("product_id");
CREATE INDEX "reviews_author_id_idx" ON "reviews"("author_id");

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: favorites
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "favorites_customer_id_product_id_key" ON "favorites"("customer_id", "product_id");

ALTER TABLE "favorites" ADD CONSTRAINT "favorites_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: store_settings
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "store_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "shipping_free_above" DECIMAL(10,2) NOT NULL,
    "shipping_base_price" DECIMAL(10,2) NOT NULL,
    "estimated_delivery" TEXT NOT NULL,
    "pix_enabled" BOOLEAN NOT NULL DEFAULT true,
    "credit_card_enabled" BOOLEAN NOT NULL DEFAULT true,
    "credit_card_max_installments" INTEGER NOT NULL DEFAULT 12,
    "boleto_enabled" BOOLEAN NOT NULL DEFAULT true,
    "social_instagram" TEXT NOT NULL DEFAULT '',
    "social_facebook" TEXT NOT NULL DEFAULT '',
    "social_tiktok" TEXT NOT NULL DEFAULT '',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable: support_tickets
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" "TicketSubject" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "customer_id" TEXT,
    "order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");
CREATE INDEX "support_tickets_customer_id_idx" ON "support_tickets"("customer_id");

ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: ticket_replies
CREATE TABLE "ticket_replies" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_replies_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ticket_replies" ADD CONSTRAINT "ticket_replies_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: marketplace_accounts
CREATE TABLE "marketplace_accounts" (
    "id" TEXT NOT NULL,
    "platform" "MarketplacePlatform" NOT NULL,
    "seller_id" TEXT,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "marketplace_accounts_platform_key" ON "marketplace_accounts"("platform");

-- CreateTable: marketplace_listings
CREATE TABLE "marketplace_listings" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "external_id" TEXT,
    "external_url" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "status" "MarketplaceListingStatus" NOT NULL DEFAULT 'DRAFT',
    "last_sync_at" TIMESTAMP(3),
    "last_error" TEXT,
    "category_mapping" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_listings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "marketplace_listings_account_id_product_id_key" ON "marketplace_listings"("account_id", "product_id");
CREATE INDEX "marketplace_listings_product_id_idx" ON "marketplace_listings"("product_id");
CREATE INDEX "marketplace_listings_status_idx" ON "marketplace_listings"("status");

ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "marketplace_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
