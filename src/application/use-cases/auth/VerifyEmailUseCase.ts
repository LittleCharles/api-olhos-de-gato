import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class VerifyEmailUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute(token: string): Promise<{ message: string }> {
    if (!token || token.length === 0) {
      throw new AppError("Token inválido", 400);
    }

    const user = await this.userRepository.findByEmailVerifyToken(token);
    if (!user) {
      throw new AppError("Link de verificação inválido ou já utilizado", 400);
    }

    if (user.emailVerifyExpiry && user.emailVerifyExpiry.getTime() < Date.now()) {
      throw new AppError("Link de verificação expirado. Solicite um novo email.", 400);
    }

    user.markEmailVerified();
    await this.userRepository.update(user);

    return { message: "Email confirmado com sucesso!" };
  }
}
