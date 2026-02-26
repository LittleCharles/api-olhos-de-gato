/// <reference types="node" />
import { PrismaClient, UserRole, AnimalType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Criar admin
  const adminPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@olhosdegato.com" },
    update: {},
    create: {
      email: "admin@olhosdegato.com",
      passwordHash: adminPassword,
      name: "Administrador",
      role: UserRole.ADMIN,
    },
  });

  console.log("Admin criado:", admin.email);

  // 2. Criar categorias
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "racoes" },
      update: {},
      create: {
        name: "Rações",
        slug: "racoes",
        description: "Rações secas e úmidas para pets",
      },
    }),
    prisma.category.upsert({
      where: { slug: "brinquedos" },
      update: {},
      create: {
        name: "Brinquedos",
        slug: "brinquedos",
        description: "Arranhadores, varinhas e brinquedos interativos",
      },
    }),
    prisma.category.upsert({
      where: { slug: "acessorios" },
      update: {},
      create: {
        name: "Acessórios",
        slug: "acessorios",
        description: "Coleiras, caminhas e caixas de transporte",
      },
    }),
  ]);

  console.log(
    "Categorias criadas:",
    categories.map((c) => c.name).join(", "),
  );

  // 3. Criar subcategorias (icons = lucide-react icon names)
  const subcategories = await Promise.all([
    // --- GATO ---
    prisma.subcategory.upsert({
      where: { id: "racao-seca-gato" },
      update: { icon: "Package" },
      create: {
        id: "racao-seca-gato",
        animalType: AnimalType.GATO,
        name: "Ração Seca",
        icon: "Package",
      },
    }),
    prisma.subcategory.upsert({
      where: { id: "racao-umida-gato" },
      update: { icon: "Drumstick" },
      create: {
        id: "racao-umida-gato",
        animalType: AnimalType.GATO,
        name: "Ração Úmida",
        icon: "Drumstick",
      },
    }),
    prisma.subcategory.upsert({
      where: { id: "areia-gato" },
      update: { icon: "Sparkles" },
      create: {
        id: "areia-gato",
        animalType: AnimalType.GATO,
        name: "Areia",
        icon: "Sparkles",
      },
    }),
    prisma.subcategory.upsert({
      where: { id: "brinquedos-gato" },
      update: { icon: "Puzzle" },
      create: {
        id: "brinquedos-gato",
        animalType: AnimalType.GATO,
        name: "Brinquedos",
        icon: "Puzzle",
      },
    }),
    prisma.subcategory.upsert({
      where: { id: "arranhadores-gato" },
      update: { icon: "TreePine" },
      create: {
        id: "arranhadores-gato",
        animalType: AnimalType.GATO,
        name: "Arranhadores",
        icon: "TreePine",
      },
    }),
    prisma.subcategory.upsert({
      where: { id: "farmacia-gato" },
      update: { icon: "Pill" },
      create: {
        id: "farmacia-gato",
        animalType: AnimalType.GATO,
        name: "Farmácia",
        icon: "Pill",
      },
    }),
    // --- CACHORRO ---
    prisma.subcategory.upsert({
      where: { id: "racao-seca-cachorro" },
      update: { icon: "Package" },
      create: {
        id: "racao-seca-cachorro",
        animalType: AnimalType.CACHORRO,
        name: "Ração Seca",
        icon: "Package",
      },
    }),
    prisma.subcategory.upsert({
      where: { id: "racao-umida-cachorro" },
      update: { icon: "Drumstick" },
      create: {
        id: "racao-umida-cachorro",
        animalType: AnimalType.CACHORRO,
        name: "Ração Úmida",
        icon: "Drumstick",
      },
    }),
    prisma.subcategory.upsert({
      where: { id: "brinquedos-cachorro" },
      update: { icon: "Puzzle" },
      create: {
        id: "brinquedos-cachorro",
        animalType: AnimalType.CACHORRO,
        name: "Brinquedos",
        icon: "Puzzle",
      },
    }),
    prisma.subcategory.upsert({
      where: { id: "coleiras-cachorro" },
      update: { icon: "Circle" },
      create: {
        id: "coleiras-cachorro",
        animalType: AnimalType.CACHORRO,
        name: "Coleiras",
        icon: "Circle",
      },
    }),
    prisma.subcategory.upsert({
      where: { id: "petiscos-cachorro" },
      update: { icon: "Cookie" },
      create: {
        id: "petiscos-cachorro",
        animalType: AnimalType.CACHORRO,
        name: "Petiscos",
        icon: "Cookie",
      },
    }),
    prisma.subcategory.upsert({
      where: { id: "farmacia-cachorro" },
      update: { icon: "Pill" },
      create: {
        id: "farmacia-cachorro",
        animalType: AnimalType.CACHORRO,
        name: "Farmácia",
        icon: "Pill",
      },
    }),
  ]);

  console.log(
    "Subcategorias criadas:",
    subcategories.map((s) => s.name).join(", "),
  );

  // 4. Criar produtos com campos obrigatórios
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: "racao-premium-gatos-castrados-1kg" },
      update: {},
      create: {
        name: "Ração Premium Gatos Castrados 1kg",
        slug: "racao-premium-gatos-castrados-1kg",
        description: "Ração balanceada para gatos castrados",
        price: 45.9,
        stock: 100,
        categoryId: categories[0].id,
        animalType: AnimalType.GATO,
        subcategoryId: "racao-seca-gato",
        sku: "RAC-PREM-GC-1KG",
        isFeatured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: "arranhador-torre" },
      update: {},
      create: {
        name: "Arranhador Torre",
        slug: "arranhador-torre",
        description: "Arranhador torre com 3 andares",
        price: 250.0,
        stock: 10,
        categoryId: categories[1].id,
        animalType: AnimalType.GATO,
        subcategoryId: "arranhadores-gato",
        sku: "BRINQ-ARR-TORRE",
        isRecommended: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: "coleira-ajustavel" },
      update: {},
      create: {
        name: "Coleira Ajustável",
        slug: "coleira-ajustavel",
        description: "Coleira ajustável com sinalizador",
        price: 25.0,
        stock: 50,
        categoryId: categories[2].id,
        animalType: AnimalType.CACHORRO,
        subcategoryId: "coleiras-cachorro",
        sku: "ACES-COL-AJUST",
      },
    }),
  ]);

  console.log(
    "Produtos criados:",
    products.map((p) => p.name).join(", "),
  );

  // 5. Criar configurações da loja (singleton)
  const settings = await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeName: "Olhos de Gato",
      email: "contato@olhosdegato.com",
      phone: "(11) 99999-9999",
      whatsapp: "(11) 99999-9999",
      address: "Rua dos Gatos, 123 - São Paulo/SP",
      shippingFreeAbove: 199.9,
      shippingBasePrice: 14.9,
      estimatedDelivery: "3-7 dias úteis",
      pixEnabled: true,
      creditCardEnabled: true,
      creditCardMaxInstallments: 12,
      boletoEnabled: false,
      socialInstagram: "@olhosdegato",
      socialFacebook: "",
      socialTiktok: "",
    },
  });

  console.log("Configurações da loja criadas:", settings.storeName);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
