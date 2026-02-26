import { Subcategory } from "../../../domain/entities/Subcategory.js";
import { AnimalType } from "../../../domain/enums/index.js";

export class SubcategoryPresenter {
  static toHTTP(subcategory: Subcategory) {
    return {
      id: subcategory.id,
      animalType: subcategory.animalType,
      name: subcategory.name,
      icon: subcategory.icon,
      isActive: subcategory.isActive,
      createdAt: subcategory.createdAt.toISOString(),
      updatedAt: subcategory.updatedAt.toISOString(),
    };
  }

  static toHTTPWithCount(item: {
    subcategory: Subcategory;
    productCount: number;
  }) {
    return {
      ...SubcategoryPresenter.toHTTP(item.subcategory),
      productCount: item.productCount,
    };
  }

  static toGroupedHTTP(
    items: Array<{ subcategory: Subcategory; productCount: number }>,
  ) {
    const grouped: Record<string, any[]> = {
      [AnimalType.GATO]: [],
      [AnimalType.CACHORRO]: [],
    };
    for (const item of items) {
      grouped[item.subcategory.animalType]?.push(
        SubcategoryPresenter.toHTTPWithCount(item),
      );
    }
    return grouped;
  }
}
