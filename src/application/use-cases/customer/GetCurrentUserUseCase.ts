import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../infrastructure/database/prisma/client.js";

interface CurrentUserResponse {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  birthDate: Date | null;
  createdAt: Date;
}

@injectable()
export class GetCurrentUserUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<CurrentUserResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const customer = await prisma.customer.findUnique({
      where: { userId },
    });

    if (!customer) {
      throw new AppError("Perfil de cliente não encontrado", 404);
    }

    return {
      id: customer.id,
      userId: user.id,
      name: user.name,
      email: user.email.getValue(),
      phone: user.phone ?? null,
      cpf: customer.cpf ?? null,
      birthDate: customer.birthDate ?? null,
      createdAt: customer.createdAt,
    };
  }
}
