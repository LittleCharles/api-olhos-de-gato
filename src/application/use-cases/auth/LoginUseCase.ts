import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IHashProvider } from "../../interfaces/IHashProvider.js";
import { LoginDTO } from "../../dtos/AuthDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { UserRole } from "../../../domain/enums/index.js";

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

@injectable()
export class LoginUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
  ) { }

  async execute(data: LoginDTO): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(
      data.email.toLowerCase(),
    );

    if (!user) {
      throw new AppError("Email ou senha inválidos", 401);
    }

    const passwordMatch = await this.hashProvider.compare(
      data.password,
      user.passwordHash,
    );

    if (!passwordMatch) {
      throw new AppError("Email ou senha inválidos", 401);
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
