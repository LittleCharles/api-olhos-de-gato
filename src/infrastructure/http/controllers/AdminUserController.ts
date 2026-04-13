import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { ListAdminsUseCase } from "../../../application/use-cases/user/ListAdminsUseCase.js";
import { CreateAdminUseCase } from "../../../application/use-cases/user/CreateAdminUseCase.js";
import { ToggleAdminStatusUseCase } from "../../../application/use-cases/user/ToggleAdminStatusUseCase.js";
import {
  CreateAdminSchema,
  ListAdminsFiltersSchema,
  ToggleAdminStatusSchema,
} from "../../../application/dtos/AdminUserDTO.js";
import { AdminUserPresenter } from "../presenters/AdminUserPresenter.js";

export class AdminUserController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const filters = ListAdminsFiltersSchema.parse(request.query);
    const useCase = container.resolve(ListAdminsUseCase);
    const result = await useCase.execute(filters);

    return reply.send({
      data: result.data.map(AdminUserPresenter.toHTTP),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      stats: result.stats,
    });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = CreateAdminSchema.parse(request.body);
    const useCase = container.resolve(CreateAdminUseCase);
    const user = await useCase.execute(data);
    return reply.status(201).send(AdminUserPresenter.toHTTP(user));
  }

  async toggleStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { isActive } = ToggleAdminStatusSchema.parse(request.body);
    const currentUserId = request.user.id;

    const useCase = container.resolve(ToggleAdminStatusUseCase);
    const user = await useCase.execute(id, isActive, currentUserId);
    return reply.send(AdminUserPresenter.toHTTP(user));
  }
}
