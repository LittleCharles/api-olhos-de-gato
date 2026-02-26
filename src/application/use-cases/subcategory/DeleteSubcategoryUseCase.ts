import { inject, injectable } from "tsyringe";
import type { ISubcategoryRepository } from "../../../domain/repositories/ISubcategoryRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class DeleteSubcategoryUseCase {
  constructor(
    @inject("SubcategoryRepository")
    private subcategoryRepository: ISubcategoryRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const subcategory = await this.subcategoryRepository.findById(id);
    if (!subcategory) {
      throw new AppError("Subcategoria não encontrada", 404);
    }

    const productCount = await this.subcategoryRepository.countProducts(id);
    if (productCount > 0) {
      throw new AppError("Categoria possui produtos vinculados", 409);
    }

    await this.subcategoryRepository.delete(id);
  }
}
