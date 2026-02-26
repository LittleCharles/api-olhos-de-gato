import { inject, injectable } from "tsyringe";
import type { ISubcategoryRepository } from "../../../domain/repositories/ISubcategoryRepository.js";
import { Subcategory } from "../../../domain/entities/Subcategory.js";
import { CreateSubcategoryDTO } from "../../dtos/SubcategoryDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class CreateSubcategoryUseCase {
  constructor(
    @inject("SubcategoryRepository")
    private subcategoryRepository: ISubcategoryRepository,
  ) {}

  async execute(data: CreateSubcategoryDTO): Promise<Subcategory> {
    const existing = await this.subcategoryRepository.findById(data.id);
    if (existing) {
      throw new AppError("Já existe uma subcategoria com este ID", 409);
    }

    const now = new Date();

    const subcategory = new Subcategory({
      id: data.id,
      animalType: data.animalType,
      name: data.name,
      icon: data.icon,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return this.subcategoryRepository.create(subcategory);
  }
}
