import { Subcategory } from "../entities/Subcategory.js";
import { AnimalType } from "../enums/index.js";

export interface ISubcategoryRepository {
  findById(id: string): Promise<Subcategory | null>;
  findAll(onlyActive?: boolean): Promise<Subcategory[]>;
  findByAnimalType(animalType: AnimalType): Promise<Subcategory[]>;
  findAllWithCounts(): Promise<
    Array<{ subcategory: Subcategory; productCount: number }>
  >;
  create(subcategory: Subcategory): Promise<Subcategory>;
  update(subcategory: Subcategory): Promise<Subcategory>;
  delete(id: string): Promise<void>;
  countProducts(id: string): Promise<number>;
}
