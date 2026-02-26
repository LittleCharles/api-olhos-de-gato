import { inject, injectable } from "tsyringe";
import type { ISubcategoryRepository } from "../../../domain/repositories/ISubcategoryRepository.js";
import { Subcategory } from "../../../domain/entities/Subcategory.js";
import { UpdateSubcategoryDTO } from "../../dtos/SubcategoryDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class UpdateSubcategoryUseCase {
  constructor(
    @inject("SubcategoryRepository")
    private subcategoryRepository: ISubcategoryRepository,
  ) {}

  async execute(id: string, data: UpdateSubcategoryDTO): Promise<Subcategory> {
    const subcategory = await this.subcategoryRepository.findById(id);
    if (!subcategory) {
      throw new AppError("Subcategoria não encontrada", 404);
    }

    subcategory.update({
      name: data.name,
      icon: data.icon,
      isActive: data.isActive,
    });

    return this.subcategoryRepository.update(subcategory);
  }
}
