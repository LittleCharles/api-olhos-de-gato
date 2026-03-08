import { Brand } from "../../../domain/entities/Brand.js";

export class BrandPresenter {
  static toHTTP(brand: Brand) {
    return {
      id: brand.id,
      name: brand.name,
      createdAt: brand.createdAt.toISOString(),
      updatedAt: brand.updatedAt.toISOString(),
    };
  }
}
