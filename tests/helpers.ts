import { Product } from "@domain/entities/Product";
import { Money } from "@domain/value-objects/Money";
import { AnimalType } from "@domain/enums/index";
import type { CartWithItems, CartItemWithProduct } from "@domain/repositories/ICartRepository";

export function createMockProduct(overrides: Partial<{
  id: string;
  name: string;
  slug: string;
  price: number;
  promoPrice: number | null;
  stock: number;
  isActive: boolean;
  animalType: AnimalType;
}>= {}): Product {
  return new Product({
    id: overrides.id ?? "product-1",
    categoryId: "cat-1",
    name: overrides.name ?? "Ração Premium Gatos",
    slug: overrides.slug ?? "racao-premium-gatos",
    description: "Ração premium para gatos adultos",
    price: Money.create(overrides.price ?? 49.9),
    stock: overrides.stock ?? 10,
    isActive: overrides.isActive ?? true,
    images: [],
    animalType: overrides.animalType ?? AnimalType.GATO,
    subcategoryId: null,
    promoPrice: overrides.promoPrice !== undefined
      ? (overrides.promoPrice !== null ? Money.create(overrides.promoPrice) : null)
      : null,
    sku: "SKU-001",
    isFeatured: false,
    isRecommended: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export function createMockCart(overrides: Partial<{
  id: string;
  customerId: string;
  items: CartItemWithProduct[];
}> = {}): CartWithItems {
  return {
    id: overrides.id ?? "cart-1",
    customerId: overrides.customerId ?? "customer-1",
    items: overrides.items ?? [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createMockCartItem(overrides: Partial<CartItemWithProduct> = {}): CartItemWithProduct {
  return {
    id: overrides.id ?? "cart-item-1",
    productId: overrides.productId ?? "product-1",
    productName: overrides.productName ?? "Ração Premium Gatos",
    productSlug: overrides.productSlug ?? "racao-premium-gatos",
    productPrice: overrides.productPrice ?? 49.9,
    productPromoPrice: overrides.productPromoPrice ?? null,
    productImage: overrides.productImage ?? null,
    quantity: overrides.quantity ?? 1,
  };
}
