import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IHashProvider } from "../../interfaces/IHashProvider.js";
import { ResetPasswordDTO } from "../../dtos/AuthDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class ResetPasswordUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
  ) { }

  async execute(data: ResetPasswordDTO): Promise<{ message: string }> {
    const user = await this.userRepository.findByResetToken(data.token);

    if (!user) {
      throw new AppError("Token inválido ou expirado", 400);
    }

    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new AppError("Token inválido ou expirado", 400);
    }

    const passwordHash = await this.hashProvider.hash(data.password);
    user.updatePasswordHash(passwordHash);

    await this.userRepository.update(user);

    return {
      message: "Senha redefinida com sucesso",
    };
  }
}
