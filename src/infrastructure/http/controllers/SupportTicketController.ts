import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { CreateTicketUseCase } from "../../../application/use-cases/ticket/CreateTicketUseCase.js";
import { ListTicketsUseCase } from "../../../application/use-cases/ticket/ListTicketsUseCase.js";
import { GetTicketUseCase } from "../../../application/use-cases/ticket/GetTicketUseCase.js";
import { UpdateTicketStatusUseCase } from "../../../application/use-cases/ticket/UpdateTicketStatusUseCase.js";
import { ReplyToTicketUseCase } from "../../../application/use-cases/ticket/ReplyToTicketUseCase.js";
import {
  CreateTicketSchema,
  TicketFiltersSchema,
  UpdateTicketStatusSchema,
  ReplyTicketSchema,
} from "../../../application/dtos/SupportTicketDTO.js";
import { SupportTicketPresenter } from "../presenters/SupportTicketPresenter.js";
import { prisma } from "../../database/prisma/client.js";

export class SupportTicketController {
  private async getCustomerId(userId: string): Promise<string | null> {
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    });
    return customer?.id ?? null;
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = CreateTicketSchema.parse(request.body);

    let customerId: string | null = null;
    if (request.user?.id) {
      customerId = await this.getCustomerId(request.user.id);
    }

    const useCase = container.resolve(CreateTicketUseCase);
    const ticket = await useCase.execute(data, customerId);

    return reply.status(201).send(SupportTicketPresenter.toHTTP(ticket));
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const filters = TicketFiltersSchema.parse(request.query);

    const useCase = container.resolve(ListTicketsUseCase);
    const result = await useCase.execute(filters);

    return reply.send({
      data: result.data.map(SupportTicketPresenter.toListHTTP),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      stats: result.stats,
    });
  }

  async get(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;

    const useCase = container.resolve(GetTicketUseCase);
    const ticket = await useCase.execute(id);

    return reply.send(SupportTicketPresenter.toHTTP(ticket));
  }

  async updateStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { status } = UpdateTicketStatusSchema.parse(request.body);

    const useCase = container.resolve(UpdateTicketStatusUseCase);
    const ticket = await useCase.execute(id, status);

    return reply.send(SupportTicketPresenter.toHTTP(ticket));
  }

  async reply(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { message } = ReplyTicketSchema.parse(request.body);

    const useCase = container.resolve(ReplyToTicketUseCase);
    const ticketReply = await useCase.execute(id, message);

    return reply.status(201).send(SupportTicketPresenter.replyToHTTP(ticketReply));
  }
}
