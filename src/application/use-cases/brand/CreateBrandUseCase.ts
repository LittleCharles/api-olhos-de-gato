import { inject, injectable } from "tsyringe";
import type { IBrandRepository } from "../../../domain/repositories/IBrandRepository.js";
import { Brand } from "../../../domain/entities/Brand.js";
import { CreateBrandDTO } from "../../dtos/BrandDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { randomUUID } from "crypto";

@injectable()
export class CreateBrandUseCase {
  constructor(
    @inject("BrandRepository")
    private brandRepository: IBrandRepository,
  ) {}

  async execute(data: CreateBrandDTO): Promise<Brand> {
    const existing = await this.brandRepository.findByName(data.name);
    if (existing) {
      throw new AppError("Já existe uma marca com este nome", 409);
    }

    const brand = new Brand({
      id: randomUUID(),
      name: data.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.brandRepository.create(brand);
  }
}
