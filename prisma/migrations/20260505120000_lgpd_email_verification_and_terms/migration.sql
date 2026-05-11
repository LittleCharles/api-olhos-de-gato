-- AlterTable: User com campos de verificação de email
ALTER TABLE "users" ADD COLUMN     "email_verified_at" TIMESTAMP(3),
ADD COLUMN     "email_verify_token" TEXT,
ADD COLUMN     "email_verify_expiry" TIMESTAMP(3);

-- CreateIndex: token de verificação único
CREATE UNIQUE INDEX "users_email_verify_token_key" ON "users"("email_verify_token");

-- AlterTable: Customer com aceite de termos
ALTER TABLE "customers" ADD COLUMN     "accepted_terms_at" TIMESTAMP(3);
