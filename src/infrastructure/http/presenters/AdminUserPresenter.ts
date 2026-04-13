import { User } from "../../../domain/entities/User.js";

export class AdminUserPresenter {
  static toHTTP(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email.getValue(),
      phone: user.phone ?? null,
      role: user.role,
      isActive: user.isActive,
      isMaster: user.isMaster,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
