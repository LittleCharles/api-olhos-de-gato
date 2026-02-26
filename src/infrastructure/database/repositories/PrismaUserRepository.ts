import { prisma } from "../prisma/client.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { User } from "../../../domain/entities/User.js";
import { Email } from "../../../domain/value-objects/Email.js";
import { UserRole } from "../../../domain/enums/index.js";

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.mapToEntity(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return this.mapToEntity(user);
  }

  async create(user: User): Promise<User> {
    const created = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email.getValue(),
        passwordHash: user.passwordHash,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    });

    // Cria o customer se for CUSTOMER
    if (user.role === UserRole.CUSTOMER) {
      await prisma.customer.create({
        data: {
          userId: created.id,
        },
      });
    }

    return this.mapToEntity(created);
  }

  async update(user: User): Promise<User> {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        phone: user.phone,
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  private mapToEntity(data: any): User {
    return new User({
      id: data.id,
      email: Email.create(data.email),
      passwordHash: data.passwordHash,
      name: data.name,
      role: data.role as UserRole,
      phone: data.phone,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
