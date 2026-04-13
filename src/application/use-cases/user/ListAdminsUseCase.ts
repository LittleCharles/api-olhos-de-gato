import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { User } from "../../../domain/entities/User.js";
import { UserRole } from "../../../domain/enums/index.js";
import type { PaginatedResult } from "../../../domain/repositories/IProductRepository.js";
import { ListAdminsFiltersDTO } from "../../dtos/AdminUserDTO.js";

interface ListAdminsResult extends PaginatedResult<User> {
  stats: { total: number; active: number };
}

@injectable()
export class ListAdminsUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute(filters: ListAdminsFiltersDTO): Promise<ListAdminsResult> {
    const { page, limit } = filters;

    const [paginated, total, active] = await Promise.all([
      this.userRepository.findAllByRole(UserRole.ADMIN, { page, limit }),
      this.userRepository.countByRole(UserRole.ADMIN),
      this.userRepository.countByRole(UserRole.ADMIN, true),
    ]);

    return {
      ...paginated,
      stats: { total, active },
    };
  }
}
