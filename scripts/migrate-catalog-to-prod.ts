/// <reference types="node" />
/**
 * Migração de CATÁLOGO dev → prod (one-off, idempotente).
 *
 * Copia apenas o catálogo + admin + configurações da loja. NÃO copia dados
 * transacionais/de teste (pedidos, clientes, carrinhos, reviews, favoritos,
 * tickets, marketplace) — o prod começa limpo.
 *
 * Uso (rode LOCAL; as URLs nunca entram em commit):
 *   PowerShell:
 *     $env:DEV_DATABASE_URL="postgresql://...dev..."
 *     $env:PROD_DATABASE_URL="postgresql://...prod..."
 *     npx tsx scripts/migrate-catalog-to-prod.ts
 *   bash:
 *     DEV_DATABASE_URL="..." PROD_DATABASE_URL="..." npx tsx scripts/migrate-catalog-to-prod.ts
 *
 * Use as connection strings PÚBLICAS do Railway (as internas .railway.internal
 * só funcionam dentro da Railway). Pode rodar mais de uma vez com segurança.
 */
import { PrismaClient } from "@prisma/client";

const DEV_URL = process.env.DEV_DATABASE_URL;
const PROD_URL = process.env.PROD_DATABASE_URL;

if (!DEV_URL || !PROD_URL) {
  console.error(
    "❌ Defina DEV_DATABASE_URL e PROD_DATABASE_URL no ambiente antes de rodar.",
  );
  process.exit(1);
}
if (DEV_URL === PROD_URL) {
  console.error("❌ DEV_DATABASE_URL e PROD_DATABASE_URL são iguais. Abortando.");
  process.exit(1);
}

const dev = new PrismaClient({ datasources: { db: { url: DEV_URL } } });
const prod = new PrismaClient({ datasources: { db: { url: PROD_URL } } });

async function main() {
  console.log("→ Migrando catálogo dev → prod...\n");

  // 1. Admin(s) — preserva o passwordHash (mesma senha do dev)
  const admins = await dev.user.findMany({ where: { role: "ADMIN" } });
  for (const u of admins) {
    await prod.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash: u.passwordHash,
        name: u.name,
        role: u.role,
        isMaster: u.isMaster,
        isActive: u.isActive,
        phone: u.phone,
        emailVerifiedAt: u.emailVerifiedAt,
      },
      create: {
        id: u.id,
        email: u.email,
        passwordHash: u.passwordHash,
        name: u.name,
        role: u.role,
        isMaster: u.isMaster,
        isActive: u.isActive,
        phone: u.phone,
        emailVerifiedAt: u.emailVerifiedAt,
        createdAt: u.createdAt,
      },
    });
  }
  console.log(`✓ Admins: ${admins.length}`);

  // 2. Categorias
  const categories = await dev.category.findMany();
  for (const c of categories) {
    await prod.category.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl,
        isActive: c.isActive,
      },
      create: c,
    });
  }
  console.log(`✓ Categorias: ${categories.length}`);

  // 3. Marcas
  const brands = await dev.brand.findMany();
  for (const b of brands) {
    await prod.brand.upsert({
      where: { id: b.id },
      update: { name: b.name },
      create: b,
    });
  }
  console.log(`✓ Marcas: ${brands.length}`);

  // 4. Subcategorias (ids são strings fixas tipo "racao-seca-gato")
  const subcategories = await dev.subcategory.findMany();
  for (const s of subcategories) {
    await prod.subcategory.upsert({
      where: { id: s.id },
      update: {
        animalType: s.animalType,
        name: s.name,
        icon: s.icon,
        isActive: s.isActive,
      },
      create: s,
    });
  }
  console.log(`✓ Subcategorias: ${subcategories.length}`);

  // 5. Produtos (+ imagens, especificações, M2M de subcategorias)
  const products = await dev.product.findMany({
    include: {
      images: true,
      specifications: true,
      subcategories: { select: { id: true } },
    },
  });
  for (const p of products) {
    const { images, specifications, subcategories: subs, ...scalars } = p;
    const subIds = subs.map((s) => ({ id: s.id }));

    await prod.product.upsert({
      where: { id: p.id },
      update: {
        categoryId: scalars.categoryId,
        animalType: scalars.animalType,
        name: scalars.name,
        slug: scalars.slug,
        description: scalars.description,
        price: scalars.price,
        promoPrice: scalars.promoPrice,
        stock: scalars.stock,
        sku: scalars.sku,
        isActive: scalars.isActive,
        isFeatured: scalars.isFeatured,
        isRecommended: scalars.isRecommended,
        brandId: scalars.brandId,
        ean: scalars.ean,
        weight: scalars.weight,
        lengthCm: scalars.lengthCm,
        widthCm: scalars.widthCm,
        heightCm: scalars.heightCm,
        countryOrigin: scalars.countryOrigin,
        manufacturer: scalars.manufacturer,
        bulletPoints: scalars.bulletPoints,
        subcategories: { set: subIds },
      },
      create: {
        ...scalars,
        subcategories: { connect: subIds },
      },
    });

    // Imagens e especificações: deleteMany + create (idempotente em re-runs)
    await prod.productImage.deleteMany({ where: { productId: p.id } });
    if (images.length > 0) {
      await prod.productImage.createMany({ data: images });
    }
    await prod.productSpecification.deleteMany({ where: { productId: p.id } });
    if (specifications.length > 0) {
      await prod.productSpecification.createMany({ data: specifications });
    }
  }
  const totalImages = products.reduce((n, p) => n + p.images.length, 0);
  console.log(`✓ Produtos: ${products.length} (imagens: ${totalImages})`);

  // 6. Configurações da loja (singleton id="default", inclui as taxas)
  const settings = await dev.storeSettings.findUnique({ where: { id: "default" } });
  if (settings) {
    const { id: _id, updatedAt: _updatedAt, ...settingsData } = settings;
    await prod.storeSettings.upsert({
      where: { id: "default" },
      update: settingsData,
      create: settings,
    });
    console.log("✓ Configurações da loja: ok");
  } else {
    console.log("• Configurações da loja: ausentes no dev (puladas)");
  }

  console.log("\n✅ Migração do catálogo concluída.");
}

main()
  .catch((e) => {
    console.error("\n❌ Erro na migração:", e);
    process.exit(1);
  })
  .finally(async () => {
    await dev.$disconnect();
    await prod.$disconnect();
  });
