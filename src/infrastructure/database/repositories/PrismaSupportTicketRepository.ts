import { prisma } from "../prisma/client.js";
import {
  ISupportTicketRepository,
  TicketFilters,
  TicketStats,
  CreateTicketData,
} from "../../../domain/repositories/ISupportTicketRepository.js";
import { SupportTicket } from "../../../domain/entities/SupportTicket.js";
import { TicketReply } from "../../../domain/entities/TicketReply.js";
import { TicketStatus, TicketSubject } from "../../../domain/enums/index.js";
import {
  PaginatedResult,
  PaginationParams,
} from "../../../domain/repositories/IProductRepository.js";
import { Prisma } from "@prisma/client";

export class PrismaSupportTicketRepository implements ISupportTicketRepository {
  async findById(id: string): Promise<SupportTicket | null> {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        replies: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!ticket) return null;
    return this.mapToEntity(ticket);
  }

  async findAll(
    filters?: TicketFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<SupportTicket>> {
    const where: Prisma.SupportTicketWhereInput = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { message: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.subject) {
      where.subject = filters.subject;
    }

    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return {
      data: tickets.map((t) => this.mapToEntity(t)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: CreateTicketData): Promise<SupportTicket> {
    const ticket = await prisma.supportTicket.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        subject: data.subject,
        message: data.message,
        customerId: data.customerId ?? null,
        orderId: data.orderId ?? null,
      },
      include: {
        replies: { orderBy: { createdAt: "asc" } },
      },
    });

    return this.mapToEntity(ticket);
  }

  async update(ticket: SupportTicket): Promise<SupportTicket> {
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: ticket.status,
        updatedAt: new Date(),
      },
    });

    const updated = await this.findById(ticket.id);
    return updated!;
  }

  async addReply(
    ticketId: string,
    message: string,
    isAdmin: boolean,
  ): Promise<TicketReply> {
    const reply = await prisma.ticketReply.create({
      data: {
        ticketId,
        message,
        isAdmin,
      },
    });

    return new TicketReply({
      id: reply.id,
      ticketId: reply.ticketId,
      message: reply.message,
      isAdmin: reply.isAdmin,
      createdAt: reply.createdAt,
    });
  }

  async getStats(): Promise<TicketStats> {
    const [total, openCount, inProgressCount] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
      prisma.supportTicket.count({ where: { status: "IN_PROGRESS" } }),
    ]);

    return {
      totalTickets: total,
      openCount,
      inProgressCount,
    };
  }

  private mapToEntity(data: any): SupportTicket {
    return new SupportTicket({
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      subject: data.subject as TicketSubject,
      message: data.message,
      status: data.status as TicketStatus,
      customerId: data.customerId ?? null,
      orderId: data.orderId ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      replies: data.replies?.map(
        (r: any) =>
          new TicketReply({
            id: r.id,
            ticketId: r.ticketId,
            message: r.message,
            isAdmin: r.isAdmin,
            createdAt: r.createdAt,
          }),
      ),
    });
  }
}
