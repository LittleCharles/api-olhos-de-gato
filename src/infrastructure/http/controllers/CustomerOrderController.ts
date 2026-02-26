import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { CreateOrderUseCase } from "../../../application/use-cases/order/CreateOrderUseCase.js";
import { ListCustomerOrdersUseCase } from "../../../application/use-cases/order/ListCustomerOrdersUseCase.js";
import { GetCustomerOrderUseCase } from "../../../application/use-cases/order/GetCustomerOrderUseCase.js";
import { CreateReviewUseCase } from "../../../application/use-cases/review/CreateReviewUseCase.js";
import {
  CustomerCreateOrderSchema,
  CustomerOrderFiltersSchema,
  CreateReviewSchema,
} from "../../../application/dtos/CustomerOrderDTO.js";
import { OrderPresenter } from "../presenters/OrderPresenter.js";
import { prisma } from "../../database/prisma/client.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class CustomerOrderController {
  private async getCustomerId(userId: string): Promise<string> {
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!customer) {
      throw new AppError("Perfil de cliente não encontrado", 404);
    }
    return customer.id;
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const customerId = await customerOrderController.getCustomerId(request.user.id);
    const data = CustomerCreateOrderSchema.parse(request.body);

    const createOrderUseCase = container.resolve(CreateOrderUseCase);
    const order = await createOrderUseCase.execute({
      customerId,
      paymentMethod: data.paymentMethod,
      addressId: data.addressId,
      notes: data.notes,
      pickupLocation: data.pickupLocation,
    });

    return reply.status(201).send(OrderPresenter.toHTTP(order));
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const customerId = await customerOrderController.getCustomerId(request.user.id);
    const filters = CustomerOrderFiltersSchema.parse(request.query);

    const listOrdersUseCase = container.resolve(ListCustomerOrdersUseCase);
    const result = await listOrdersUseCase.execute(customerId, {
      page: filters.page,
      limit: filters.limit,
    });

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

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const customerId = await customerOrderController.getCustomerId(request.user.id);

    const getOrderUseCase = container.resolve(GetCustomerOrderUseCase);
    const order = await getOrderUseCase.execute(id, customerId);

    return reply.send(OrderPresenter.toHTTP(order));
  }

  async createReview(request: FastifyRequest, reply: FastifyReply) {
    const { id: productId } = request.params as { id: string };
    const customerId = await customerOrderController.getCustomerId(request.user.id);
    const data = CreateReviewSchema.parse(request.body);

    const createReviewUseCase = container.resolve(CreateReviewUseCase);
    const result = await createReviewUseCase.execute({
      customerId,
      productId,
      rating: data.rating,
      comment: data.comment,
    });

    return reply.status(201).send(result);
  }
}

const customerOrderController = new CustomerOrderController();
