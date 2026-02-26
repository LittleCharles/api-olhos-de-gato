import { Product } from "../entities/Product.js";
import { AnimalType } from "../enums/index.js";

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  onlyActive?: boolean;
  onlyInStock?: boolean;
  animalType?: AnimalType;
  subcategoryId?: string;
  onlyFeatured?: boolean;
  onlyRecommended?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findAll(
    filters?: ProductFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Product>>;
  findByCategory(categoryId: string): Promise<Product[]>;
  create(product: Product): Promise<Product>;
  update(product: Product): Promise<Product>;
  updateStock(id: string, quantity: number): Promise<void>;
  delete(id: string): Promise<void>;
  findFeatured(limit?: number): Promise<Product[]>;
  findRecommended(limit?: number): Promise<Product[]>;
  updateFeatured(id: string, isFeatured: boolean): Promise<void>;
  updateRecommended(id: string, isRecommended: boolean): Promise<void>;
  bulkUpdateFeatured(featuredIds: string[]): Promise<void>;
  bulkUpdateRecommended(recommendedIds: string[]): Promise<void>;
}
