-- AlterTable
ALTER TABLE "users" ADD COLUMN "is_master" BOOLEAN NOT NULL DEFAULT false;

-- Marcar o admin mais antigo como master (se existir)
UPDATE "users"
SET "is_master" = true
WHERE "id" = (
  SELECT "id" FROM "users"
  WHERE "role" = 'ADMIN'
  ORDER BY "created_at" ASC
  LIMIT 1
);
