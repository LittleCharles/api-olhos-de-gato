-- AlterTable: Order com snapshot de endereço de entrega (delivery only; pickup fica null)
ALTER TABLE "orders" ADD COLUMN     "shipping_recipient_name" TEXT,
ADD COLUMN     "shipping_zip_code" TEXT,
ADD COLUMN     "shipping_street" TEXT,
ADD COLUMN     "shipping_number" TEXT,
ADD COLUMN     "shipping_complement" TEXT,
ADD COLUMN     "shipping_neighborhood" TEXT,
ADD COLUMN     "shipping_city" TEXT,
ADD COLUMN     "shipping_state" TEXT;
