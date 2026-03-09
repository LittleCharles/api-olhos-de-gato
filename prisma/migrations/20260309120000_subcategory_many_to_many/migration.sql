-- 1. Prefixar IDs existentes das subcategorias com animal type
UPDATE "subcategories" SET "id" = CONCAT(LOWER("animal_type"::text), '-', "id")
WHERE "id" NOT LIKE 'gato-%' AND "id" NOT LIKE 'cachorro-%';

-- 2. Atualizar referências nos produtos (subcategory_id antigo → novo com prefixo)
UPDATE "products" SET "subcategory_id" = CONCAT(LOWER("animal_type"::text), '-', "subcategory_id")
WHERE "subcategory_id" IS NOT NULL
  AND "subcategory_id" NOT LIKE 'gato-%'
  AND "subcategory_id" NOT LIKE 'cachorro-%';

-- 3. Criar junction table (padrão Prisma implicit m2m)
CREATE TABLE "_ProductToSubcategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProductToSubcategory_A_fkey" FOREIGN KEY ("A") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProductToSubcategory_B_fkey" FOREIGN KEY ("B") REFERENCES "subcategories"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "_ProductToSubcategory_AB_unique" ON "_ProductToSubcategory"("A", "B");
CREATE INDEX "_ProductToSubcategory_B_index" ON "_ProductToSubcategory"("B");

-- 4. Migrar dados existentes da coluna subcategory_id para junction table
INSERT INTO "_ProductToSubcategory" ("A", "B")
SELECT "id", "subcategory_id"
FROM "products"
WHERE "subcategory_id" IS NOT NULL;

-- 5. Remover FK, index e coluna antiga
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_subcategory_id_fkey";
DROP INDEX IF EXISTS "products_subcategory_id_idx";
ALTER TABLE "products" DROP COLUMN "subcategory_id";
