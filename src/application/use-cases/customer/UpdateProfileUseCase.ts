import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { UpdateProfileDTO } from "../../dtos/ProfileDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../infrastructure/database/prisma/client.js";

interface UpdateProfileResponse {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  birthDate: Date | null;
}

@injectable()
export class UpdateProfileUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute(userId: string, data: UpdateProfileDTO): Promise<UpdateProfileResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    // Update user name and phone
    user.updateName(data.name);
    if (data.phone !== undefined) {
      user.updatePhone(data.phone ?? "");
    }
    const updatedUser = await this.userRepository.update(user);

    // Update customer cpf and birthDate
    const customer = await prisma.customer.update({
      where: { userId },
      data: {
        cpf: data.cpf ?? null,
        birthDate: data.birthDate ?? null,
      },
    });

    return {
      id: customer.id,
      userId: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email.getValue(),
      phone: updatedUser.phone ?? null,
      cpf: customer.cpf ?? null,
      birthDate: customer.birthDate ?? null,
    };
  }
}
