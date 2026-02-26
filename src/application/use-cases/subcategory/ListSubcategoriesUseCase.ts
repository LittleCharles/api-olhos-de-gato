import { inject, injectable } from "tsyringe";
import type { ISubcategoryRepository } from "../../../domain/repositories/ISubcategoryRepository.js";
import { Subcategory } from "../../../domain/entities/Subcategory.js";

@injectable()
export class ListSubcategoriesUseCase {
  constructor(
    @inject("SubcategoryRepository")
    private subcategoryRepository: ISubcategoryRepository,
  ) {}

  async execute(): Promise<
    Array<{ subcategory: Subcategory; productCount: number }>
  > {
    return this.subcategoryRepository.findAllWithCounts();
  }
}
