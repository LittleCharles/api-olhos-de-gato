import { Product } from "../../../domain/entities/Product.js";

export class ProductPresenter {
  static toHTTP(product: Product) {
    return {
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price.getValue(),
      priceFormatted: product.price.format(),
      animalType: product.animalType,
      subcategoryId: product.subcategoryId,
      promoPrice: product.promoPrice?.getValue() ?? null,
      promoPriceFormatted: product.promoPrice?.format() ?? null,
      sku: product.sku,
      stock: product.stock,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isRecommended: product.isRecommended,
      isAvailable: product.isAvailable(),
      images: product.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        isMain: img.isMain,
      })),
      mainImage: product.mainImage?.url ?? null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
