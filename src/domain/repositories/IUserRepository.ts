import { User } from "../entities/User.js";
import { UserRole } from "../enums/index.js";
import type { PaginatedResult } from "./IProductRepository.js";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByResetToken(token: string): Promise<User | null>;
  findByEmailVerifyToken(token: string): Promise<User | null>;
  findAllByRole(
    role: UserRole,
    pagination: { page: number; limit: number },
  ): Promise<PaginatedResult<User>>;
  countByRole(role: UserRole, onlyActive?: boolean): Promise<number>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
