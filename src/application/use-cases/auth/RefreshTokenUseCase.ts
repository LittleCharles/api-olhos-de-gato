import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { UserRole } from "../../../domain/enums/index.js";

interface RefreshResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<RefreshResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("Usuário não encontrado", 401);
    }
    if (!user.isActive) {
      throw new AppError("Sua conta foi desativada", 403);
    }
    return {
      user: {
        id: user.id,
        email: user.email.getValue(),
        name: user.name,
        role: user.role,
      },
    };
  }
}
