import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IHashProvider } from "../../interfaces/IHashProvider.js";
import { User } from "../../../domain/entities/User.js";
import { Email } from "../../../domain/value-objects/Email.js";
import { UserRole } from "../../../domain/enums/index.js";
import { RegisterDTO } from "../../dtos/AuthDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { SendVerificationEmailUseCase } from "./SendVerificationEmailUseCase.js";
import { prisma } from "../../../infrastructure/database/prisma/client.js";
import { randomUUID } from "crypto";

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

@injectable()
export class RegisterUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("SendVerificationEmailUseCase")
    private sendVerificationEmailUseCase: SendVerificationEmailUseCase,
  ) { }

  async execute(data: RegisterDTO): Promise<RegisterResponse> {
    const email = Email.create(data.email);

    const existingUser = await this.userRepository.findByEmail(
      email.getValue(),
    );
    if (existingUser) {
      throw new AppError("Email já cadastrado", 409);
    }

    const passwordHash = await this.hashProvider.hash(data.password);

    const user = new User({
      id: randomUUID(),
      email,
      passwordHash,
      name: data.name,
      role: UserRole.CUSTOMER,
      phone: data.phone,
      isActive: true,
      isMaster: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdUser = await this.userRepository.create(user);

    // Marca aceite de termos no Customer (criado automaticamente pelo PrismaUserRepository)
    if (data.acceptedTerms) {
      await prisma.customer.update({
        where: { userId: createdUser.id },
        data: { acceptedTermsAt: new Date() },
      });
    }

    // Dispara email de verificação (best-effort, não bloqueia o fluxo)
    this.sendVerificationEmailUseCase.execute(createdUser.id).catch((err) => {
      console.error("[Register] Falha ao enviar email de verificação:", err);
    });

    return {
      user: {
        id: createdUser.id,
        email: createdUser.email.getValue(),
        name: createdUser.name,
        role: createdUser.role,
      },
    };
  }
}
