import { inject, injectable } from "tsyringe";
import type { IBrandRepository } from "../../../domain/repositories/IBrandRepository.js";
import { Brand } from "../../../domain/entities/Brand.js";
import { UpdateBrandDTO } from "../../dtos/BrandDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class UpdateBrandUseCase {
  constructor(
    @inject("BrandRepository")
    private brandRepository: IBrandRepository,
  ) {}

  async execute(id: string, data: UpdateBrandDTO): Promise<Brand> {
    const brand = await this.brandRepository.findById(id);
    if (!brand) {
      throw new AppError("Marca não encontrada", 404);
    }

    if (data.name) {
      const existing = await this.brandRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new AppError("Já existe uma marca com este nome", 409);
      }
    }

    brand.update(data);
    return this.brandRepository.update(brand);
  }
}
