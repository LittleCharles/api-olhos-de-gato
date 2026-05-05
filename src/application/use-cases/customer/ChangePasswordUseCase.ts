import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IHashProvider } from "../../interfaces/IHashProvider.js";
import { ChangePasswordDTO } from "../../dtos/ProfileDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class ChangePasswordUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
  ) {}

  async execute(userId: string, data: ChangePasswordDTO): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const currentMatches = await this.hashProvider.compare(
      data.currentPassword,
      user.passwordHash,
    );
    if (!currentMatches) {
      throw new AppError("Senha atual incorreta", 400);
    }

    if (data.currentPassword === data.newPassword) {
      throw new AppError("A nova senha deve ser diferente da atual", 400);
    }

    const newHash = await this.hashProvider.hash(data.newPassword);
    user.updatePasswordHash(newHash);
    await this.userRepository.update(user);
  }
}
