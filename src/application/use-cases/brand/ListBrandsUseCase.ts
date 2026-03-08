import { inject, injectable } from "tsyringe";
import type { IBrandRepository } from "../../../domain/repositories/IBrandRepository.js";
import { Brand } from "../../../domain/entities/Brand.js";

@injectable()
export class ListBrandsUseCase {
  constructor(
    @inject("BrandRepository")
    private brandRepository: IBrandRepository,
  ) {}

  async execute(): Promise<Brand[]> {
    return this.brandRepository.findAll();
  }
}
