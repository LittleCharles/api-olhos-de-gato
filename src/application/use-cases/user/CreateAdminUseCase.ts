import { randomUUID } from "crypto";
import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IHashProvider } from "../../interfaces/IHashProvider.js";
import { User } from "../../../domain/entities/User.js";
import { Email } from "../../../domain/value-objects/Email.js";
import { UserRole } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { CreateAdminDTO } from "../../dtos/AdminUserDTO.js";

@injectable()
export class CreateAdminUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
  ) {}

  async execute(data: CreateAdminDTO): Promise<User> {
    const email = Email.create(data.email);

    const existing = await this.userRepository.findByEmail(email.getValue());
    if (existing) {
      throw new AppError("Email já cadastrado", 409);
    }

    const passwordHash = await this.hashProvider.hash(data.password);

    const user = new User({
      id: randomUUID(),
      email,
      passwordHash,
      name: data.name,
      role: UserRole.ADMIN,
      phone: data.phone,
      isActive: true,
      isMaster: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.userRepository.create(user);
  }
}
