-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- AlterTable: replace brand string with brand_id FK, add marketplace fields
ALTER TABLE "products" DROP COLUMN IF EXISTS "brand";
ALTER TABLE "products" ADD COLUMN "brand_id" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "ean" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "weight" DECIMAL(10,3);
ALTER TABLE "products" ADD COLUMN "length_cm" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN "width_cm" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN "height_cm" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN "country_origin" TEXT;
ALTER TABLE "products" ADD COLUMN "manufacturer" TEXT;
ALTER TABLE "products" ADD COLUMN "bullet_points" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "products_brand_id_idx" ON "products"("brand_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
