import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IHashProvider } from "../../interfaces/IHashProvider.js";
import { User } from "../../../domain/entities/User.js";
import { Email } from "../../../domain/value-objects/Email.js";
import { UserRole } from "../../../domain/enums/index.js";
import { RegisterDTO } from "../../dtos/AuthDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdUser = await this.userRepository.create(user);

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
