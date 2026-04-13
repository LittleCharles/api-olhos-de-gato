import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { User } from "../../../domain/entities/User.js";
import { UserRole } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class ToggleAdminStatusUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute(
    targetId: string,
    isActive: boolean,
    currentUserId: string,
  ): Promise<User> {
    const target = await this.userRepository.findById(targetId);
    if (!target) {
      throw new AppError("Usuário não encontrado", 404);
    }
    if (target.role !== UserRole.ADMIN) {
      throw new AppError("Apenas administradores podem ser gerenciados aqui", 400);
    }
    if (target.isMaster && !isActive) {
      throw new AppError("Admin master não pode ser desativado", 403);
    }
    if (target.id === currentUserId && !isActive) {
      throw new AppError("Você não pode desativar a si mesmo", 403);
    }

    // Defense-in-depth: nunca deixar a loja sem ao menos 1 admin ativo
    if (!isActive && target.isActive) {
      const activeCount = await this.userRepository.countByRole(UserRole.ADMIN, true);
      if (activeCount <= 1) {
        throw new AppError(
          "Não é possível desativar o último admin ativo",
          409,
        );
      }
    }

    target.setActive(isActive);
    return this.userRepository.update(target);
  }
}
