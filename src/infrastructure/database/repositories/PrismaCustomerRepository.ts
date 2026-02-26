import { prisma } from "../prisma/client.js";
import {
  ICustomerRepository,
  CustomerFilters,
} from "../../../domain/repositories/ICustomerRepository.js";
import {
  PaginationParams,
  PaginatedResult,
} from "../../../domain/repositories/IProductRepository.js";
import { Customer } from "../../../domain/entities/Customer.js";

export class PrismaCustomerRepository implements ICustomerRepository {
  async findById(id: string): Promise<Customer | null> {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        user: true,
        orders: {
          select: { total: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
        addresses: true,
      },
    });

    if (!customer) return null;
    return this.mapToEntity(customer);
  }

  async findAll(
    filters?: CustomerFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Customer>> {
    const where: any = {};

    if (filters?.search) {
      where.user = {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { email: { contains: filters.search, mode: "insensitive" } },
        ],
      };
    }

    if (filters?.isActive !== undefined) {
      where.user = { ...where.user, isActive: filters.isActive };
    }

    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          user: true,
          orders: {
            select: { total: true, createdAt: true },
            orderBy: { createdAt: "desc" },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      data: customers.map((c) => this.mapToEntity(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(userId: string, isActive: boolean): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  }

  async getStats(): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    avgTicket: number;
    newThisMonth: number;
  }> {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalCustomers, activeCustomers, newThisMonth, avgResult] =
      await Promise.all([
        prisma.customer.count(),
        prisma.customer.count({
          where: { user: { isActive: true } },
        }),
        prisma.customer.count({
          where: { createdAt: { gte: firstOfMonth } },
        }),
        prisma.order.aggregate({
          _avg: { total: true },
        }),
      ]);

    return {
      totalCustomers,
      activeCustomers,
      avgTicket: avgResult._avg.total ? Number(avgResult._avg.total) : 0,
      newThisMonth,
    };
  }

  private mapToEntity(data: any): Customer {
    const orders = data.orders || [];
    const totalSpent = orders.reduce(
      (sum: number, o: any) => sum + Number(o.total),
      0,
    );

    return new Customer({
      id: data.id,
      userId: data.userId,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone,
      cpf: data.cpf,
      birthDate: data.birthDate,
      isActive: data.user.isActive,
      totalOrders: orders.length,
      totalSpent,
      lastOrderDate: orders.length > 0 ? orders[0].createdAt : null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
