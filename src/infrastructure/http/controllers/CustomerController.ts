import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { ListCustomersUseCase } from "../../../application/use-cases/customer/ListCustomersUseCase.js";
import { GetCustomerUseCase } from "../../../application/use-cases/customer/GetCustomerUseCase.js";
import { UpdateCustomerStatusUseCase } from "../../../application/use-cases/customer/UpdateCustomerStatusUseCase.js";
import {
  CustomerFiltersSchema,
  UpdateCustomerStatusSchema,
} from "../../../application/dtos/CustomerDTO.js";
import { CustomerPresenter } from "../presenters/CustomerPresenter.js";

export class CustomerController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const filters = CustomerFiltersSchema.parse(request.query);

    const listCustomersUseCase = container.resolve(ListCustomersUseCase);
    const result = await listCustomersUseCase.execute(filters);

    return reply.send({
      data: result.data.map(CustomerPresenter.toHTTP),
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

    const getCustomerUseCase = container.resolve(GetCustomerUseCase);
    const customer = await getCustomerUseCase.execute(id);

    return reply.send(CustomerPresenter.toHTTP(customer));
  }

  async updateStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { status } = UpdateCustomerStatusSchema.parse(request.body);

    const updateCustomerStatusUseCase = container.resolve(
      UpdateCustomerStatusUseCase,
    );
    await updateCustomerStatusUseCase.execute(id, status);

    return reply.status(200).send({
      message:
        status === "active"
          ? "Cliente ativado com sucesso"
          : "Cliente desativado com sucesso",
    });
  }
}
