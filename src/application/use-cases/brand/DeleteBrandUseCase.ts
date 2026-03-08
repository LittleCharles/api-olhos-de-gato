import { inject, injectable } from "tsyringe";
import type { IBrandRepository } from "../../../domain/repositories/IBrandRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class DeleteBrandUseCase {
  constructor(
    @inject("BrandRepository")
    private brandRepository: IBrandRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const brand = await this.brandRepository.findById(id);
    if (!brand) {
      throw new AppError("Marca não encontrada", 404);
    }

    const productCount = await this.brandRepository.countProducts(id);
    if (productCount > 0) {
      throw new AppError(
        `Não é possível excluir esta marca pois existem ${productCount} produto(s) vinculado(s)`,
        400,
      );
    }

    await this.brandRepository.delete(id);
  }
}
