import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { ListOrdersUseCase } from "../../../application/use-cases/order/ListOrdersUseCase.js";
import { GetOrderUseCase } from "../../../application/use-cases/order/GetOrderUseCase.js";
import { UpdateOrderStatusUseCase } from "../../../application/use-cases/order/UpdateOrderStatusUseCase.js";
import { UpdateTrackingCodeUseCase } from "../../../application/use-cases/order/UpdateTrackingCodeUseCase.js";
import {
  AdminOrderFiltersSchema,
  UpdateOrderStatusSchema,
  UpdateTrackingSchema,
} from "../../../application/dtos/OrderDTO.js";
import { OrderPresenter } from "../presenters/OrderPresenter.js";

export class OrderController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const filters = AdminOrderFiltersSchema.parse(request.query);

    const listOrdersUseCase = container.resolve(ListOrdersUseCase);
    const result = await listOrdersUseCase.execute(filters);

    return reply.send({
      data: result.data.map(OrderPresenter.toListHTTP),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  }

  async get(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;

    const getOrderUseCase = container.resolve(GetOrderUseCase);
    const order = await getOrderUseCase.execute(id);

    return reply.send(OrderPresenter.toHTTP(order));
  }

  async updateStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { status, notes } = UpdateOrderStatusSchema.parse(request.body);

    const updateOrderStatusUseCase = container.resolve(UpdateOrderStatusUseCase);
    const order = await updateOrderStatusUseCase.execute(id, status, notes);

    return reply.send(OrderPresenter.toHTTP(order));
  }

  async updateTracking(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { trackingCode } = UpdateTrackingSchema.parse(request.body);

    const updateTrackingCodeUseCase = container.resolve(UpdateTrackingCodeUseCase);
    await updateTrackingCodeUseCase.execute(id, trackingCode);

    return reply.status(200).send({
      message: "Código de rastreio atualizado com sucesso",
    });
  }
}
