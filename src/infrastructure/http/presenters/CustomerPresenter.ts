import { Customer } from "../../../domain/entities/Customer.js";

export class CustomerPresenter {
  static toHTTP(customer: Customer) {
    return {
      id: customer.id,
      userId: customer.userId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      cpf: customer.cpf,
      birthDate: customer.birthDate?.toISOString() ?? null,
      isActive: customer.isActive,
      status: customer.isActive ? "active" : "inactive",
      totalOrders: customer.totalOrders,
      totalSpent: customer.totalSpent,
      lastOrderDate: customer.lastOrderDate?.toISOString() ?? null,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  }
}
