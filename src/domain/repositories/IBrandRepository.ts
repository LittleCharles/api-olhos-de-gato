import { Brand } from "../entities/Brand.js";

export interface IBrandRepository {
  findAll(): Promise<Brand[]>;
  findById(id: string): Promise<Brand | null>;
  findByName(name: string): Promise<Brand | null>;
  create(brand: Brand): Promise<Brand>;
  update(brand: Brand): Promise<Brand>;
  delete(id: string): Promise<void>;
  countProducts(id: string): Promise<number>;
}
