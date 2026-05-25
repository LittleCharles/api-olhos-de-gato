import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { CreateOrderUseCase } from "../../../application/use-cases/order/CreateOrderUseCase.js";
import { ListCustomerOrdersUseCase } from "../../../application/use-cases/order/ListCustomerOrdersUseCase.js";
import { GetCustomerOrderUseCase } from "../../../application/use-cases/order/GetCustomerOrderUseCase.js";
import { RetryOrderPaymentUseCase } from "../../../application/use-cases/order/RetryOrderPaymentUseCase.js";
import { CreateReviewUseCase } from "../../../application/use-cases/review/CreateReviewUseCase.js";
import {
  CustomerCreateOrderSchema,
  CustomerOrderFiltersSchema,
  CreateReviewSchema,
} from "../../../application/dtos/CustomerOrderDTO.js";
import { OrderPresenter } from "../presenters/OrderPresenter.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { stripeService } from "../../services/StripeService.js";
import type { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";

export class CustomerOrderController {
  private async getCustomerId(userId: string): Promise<string> {
    const customerRepo = container.resolve<ICustomerRepository>("CustomerRepository");
    const customer = await customerRepo.findByUserId(userId);
    if (!customer) {
      throw new AppError("Perfil de cliente não encontrado", 404);
    }
    return customer.id;
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const customerId = await customerOrderController.getCustomerId(request.user.id);
    const data = CustomerCreateOrderSchema.parse(request.body);

    // Fetch user info for email and Stripe
    const userRepo = container.resolve<IUserRepository>("UserRepository");
    const user = await userRepo.findById(request.user.id);

    const createOrderUseCase = container.resolve(CreateOrderUseCase);
    const order = await createOrderUseCase.execute({
      customerId,
      customerEmail: user?.email?.getValue(),
      customerName: user?.name,
      paymentMethod: data.paymentMethod,
      addressId: data.addressId,
      notes: data.notes,
      pickupLocation: data.pickupLocation,
      shippingServiceId: data.shippingServiceId,
    });

    const checkoutItems = order.items.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
      unitPriceCents: Math.round(item.unitPrice.getValue() * 100),
    }));

    // Add shipping as line item if present
    const shippingCostValue = order.shippingCost?.getValue() ?? 0;
    if (shippingCostValue > 0) {
      checkoutItems.push({
        name: `Frete (${order.shippingService || "Envio"})`,
        quantity: 1,
        unitPriceCents: Math.round(shippingCostValue * 100),
      });
    }

    const { sessionId, clientSecret } = await stripeService.createCheckoutSession({
      orderId: order.id,
      items: checkoutItems,
      customerEmail: user?.email?.getValue(),
    });

    // Save stripe session id on order
    const orderRepo = container.resolve<IOrderRepository>("OrderRepository");
    await orderRepo.updateStripeSessionId(order.id, sessionId);

    return reply.status(201).send({
      ...OrderPresenter.toHTTP(order),
      clientSecret,
    });
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

  async retryPayment(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const customerId = await customerOrderController.getCustomerId(request.user.id);

    const retryUseCase = container.resolve(RetryOrderPaymentUseCase);
    const order = await retryUseCase.execute({ orderId: id, customerId });

    // Email pro Stripe pré-preencher (mesmo padrão do create)
    const userRepo = container.resolve<IUserRepository>("UserRepository");
    const user = await userRepo.findById(request.user.id);

    const checkoutItems = order.items.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
      unitPriceCents: Math.round(item.unitPrice.getValue() * 100),
    }));

    const shippingCostValue = order.shippingCost?.getValue() ?? 0;
    if (shippingCostValue > 0) {
      checkoutItems.push({
        name: `Frete (${order.shippingService || "Envio"})`,
        quantity: 1,
        unitPriceCents: Math.round(shippingCostValue * 100),
      });
    }

    const { sessionId, clientSecret } = await stripeService.createCheckoutSession({
      orderId: order.id,
      items: checkoutItems,
      customerEmail: user?.email?.getValue(),
    });

    // Sobrescreve o sessionId antigo — a session anterior fica órfã na Stripe e expira sozinha
    const orderRepo = container.resolve<IOrderRepository>("OrderRepository");
    await orderRepo.updateStripeSessionId(order.id, sessionId);

    return reply.send({ clientSecret });
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
