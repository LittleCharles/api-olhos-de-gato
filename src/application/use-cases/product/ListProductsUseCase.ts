import { inject, injectable } from "tsyringe";
import type {
  IProductRepository,
  PaginatedResult,
} from "../../../domain/repositories/IProductRepository.js";
import { Product } from "../../../domain/entities/Product.js";
import { ProductFiltersDTO } from "../../dtos/ProductDTO.js";

@injectable()
export class ListProductsUseCase {
  constructor(
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) { }

  async execute(filters: ProductFiltersDTO): Promise<PaginatedResult<Product>> {
    const { page, limit, ...productFilters } = filters;

    return this.productRepository.findAll(productFilters, { page, limit });
  }
}
