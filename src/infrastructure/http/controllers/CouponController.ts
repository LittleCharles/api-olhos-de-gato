import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { CreateCouponUseCase } from "../../../application/use-cases/coupon/CreateCouponUseCase.js";
import { ListCouponsUseCase } from "../../../application/use-cases/coupon/ListCouponsUseCase.js";
import { UpdateCouponUseCase } from "../../../application/use-cases/coupon/UpdateCouponUseCase.js";
import { DeleteCouponUseCase } from "../../../application/use-cases/coupon/DeleteCouponUseCase.js";
import { ValidateCartCouponUseCase } from "../../../application/use-cases/coupon/ValidateCartCouponUseCase.js";
import {
  CreateCouponSchema,
  UpdateCouponSchema,
  ValidateCouponSchema,
} from "../../../application/dtos/CouponDTO.js";
import { CouponPresenter } from "../presenters/CouponPresenter.js";
import { AppError } from "../../../shared/errors/AppError.js";
import type { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository.js";

async function getCustomerId(userId: string): Promise<string> {
  const customerRepo = container.resolve<ICustomerRepository>("CustomerRepository");
  const customer = await customerRepo.findByUserId(userId);
  if (!customer) {
    throw new AppError("Perfil de cliente não encontrado", 404);
  }
  return customer.id;
}

export class CouponController {
  // === Admin (CRUD) ===

  async list(request: FastifyRequest, reply: FastifyReply) {
    const listCouponsUseCase = container.resolve(ListCouponsUseCase);
    const coupons = await listCouponsUseCase.execute();

    return reply.send(coupons.map((c) => CouponPresenter.toHTTP(c)));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = CreateCouponSchema.parse(request.body);

    const createCouponUseCase = container.resolve(CreateCouponUseCase);
    const coupon = await createCouponUseCase.execute(data);

    return reply.status(201).send(CouponPresenter.toHTTP(coupon));
  }

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const data = UpdateCouponSchema.parse(request.body);

    const updateCouponUseCase = container.resolve(UpdateCouponUseCase);
    const coupon = await updateCouponUseCase.execute(id, data);

    return reply.send(CouponPresenter.toHTTP(coupon));
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;

    const deleteCouponUseCase = container.resolve(DeleteCouponUseCase);
    await deleteCouponUseCase.execute(id);

    return reply.status(204).send();
  }

  // === Checkout (customer) ===

  // Valida o cupom contra o carrinho DO BANCO do cliente autenticado.
  // Falhas viram AppError (400/404) com mensagem pt-BR — o front exibe error.message.
  async validate(request: FastifyRequest, reply: FastifyReply) {
    const customerId = await getCustomerId(request.user.id);
    const { code } = ValidateCouponSchema.parse(request.body);

    const validateCartCouponUseCase = container.resolve(ValidateCartCouponUseCase);
    const { coupon, discount, subtotal } = await validateCartCouponUseCase.execute({
      customerId,
      code,
    });

    return reply.send({
      code: coupon.code,
      description: coupon.description ?? null,
      discountPercent: coupon.discountPercent,
      discountAmount: discount.getValue(),
      discountAmountFormatted: discount.format(),
      subtotal: subtotal.getValue(),
    });
  }
}
