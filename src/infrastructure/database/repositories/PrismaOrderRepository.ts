import { injectable } from "tsyringe";
import { prisma } from "../prisma/client.js";
import {
  IOrderRepository,
  OrderFilters,
} from "../../../domain/repositories/IOrderRepository.js";
import {
  PaginatedResult,
  PaginationParams,
} from "../../../domain/repositories/IProductRepository.js";
import { Order, OrderItemProps } from "../../../domain/entities/Order.js";
import { Money } from "../../../domain/value-objects/Money.js";
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "../../../domain/enums/index.js";
import { Prisma } from "@prisma/client";

@injectable()
export class PrismaOrderRepository implements IOrderRepository {
  async findById(id: string): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        customer: {
          include: { user: true },
        },
        history: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) return null;
    return this.mapToEntity(order);
  }

  async findByIdWithDetails(id: string): Promise<any> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        customer: {
          include: {
            user: true,
            addresses: true,
          },
        },
        history: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return order;
  }

  async findByCustomer(
    customerId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Order>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { customerId };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: { product: true },
          },
          customer: {
            include: { user: true },
          },
          history: {
            orderBy: { createdAt: "asc" },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((o) => this.mapToEntity(o)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAll(
    filters?: OrderFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Order>> {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        {
          customer: {
            user: {
              name: { contains: filters.search, mode: "insensitive" },
            },
          },
        },
        {
          customer: {
            user: {
              email: { contains: filters.search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: { product: true },
          },
          customer: {
            include: { user: true },
          },
          history: {
            orderBy: { createdAt: "asc" },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((o) => this.mapToEntity(o)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(order: Order): Promise<Order> {
    const created = await prisma.order.create({
      data: {
        id: order.id,
        customerId: order.customerId,
        adminId: order.adminId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal.getValue(),
        discount: order.discount.getValue(),
        total: order.total.getValue(),
        notes: order.notes,
        trackingCode: order.trackingCode,
        pickupLocation: order.pickupLocation,
        items: {
          create: order.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice.getValue(),
            total: item.total.getValue(),
          })),
        },
      },
      include: {
        items: {
          include: { product: true },
        },
        customer: {
          include: { user: true },
        },
        history: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return this.mapToEntity(created);
  }

  async update(order: Order): Promise<Order> {
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: order.status,
        paymentStatus: order.paymentStatus,
        adminId: order.adminId,
        trackingCode: order.trackingCode,
        notes: order.notes,
      },
      include: {
        items: {
          include: { product: true },
        },
        customer: {
          include: { user: true },
        },
        history: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return this.mapToEntity(updated);
  }

  async addStatusHistory(
    orderId: string,
    status: OrderStatus,
    notes?: string,
  ): Promise<void> {
    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status,
        notes,
      },
    });
  }

  async updateTrackingCode(id: string, trackingCode: string): Promise<void> {
    await prisma.order.update({
      where: { id },
      data: { trackingCode },
    });
  }

  private mapToEntity(data: any): Order {
    const items: OrderItemProps[] = (data.items || []).map((item: any) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name ?? "",
      quantity: item.quantity,
      unitPrice: Money.create(Number(item.unitPrice)),
      total: Money.create(Number(item.total)),
    }));

    return new Order({
      id: data.id,
      customerId: data.customerId,
      adminId: data.adminId,
      status: data.status as OrderStatus,
      paymentStatus: data.paymentStatus as PaymentStatus,
      paymentMethod: data.paymentMethod as PaymentMethod,
      subtotal: Money.create(Number(data.subtotal)),
      discount: Money.create(Number(data.discount)),
      total: Money.create(Number(data.total)),
      notes: data.notes,
      trackingCode: data.trackingCode,
      pickupLocation: data.pickupLocation,
      items,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
