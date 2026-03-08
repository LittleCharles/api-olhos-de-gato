import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { CreateBrandUseCase } from "../../../application/use-cases/brand/CreateBrandUseCase.js";
import { ListBrandsUseCase } from "../../../application/use-cases/brand/ListBrandsUseCase.js";
import { UpdateBrandUseCase } from "../../../application/use-cases/brand/UpdateBrandUseCase.js";
import { DeleteBrandUseCase } from "../../../application/use-cases/brand/DeleteBrandUseCase.js";
import {
  CreateBrandSchema,
  UpdateBrandSchema,
} from "../../../application/dtos/BrandDTO.js";
import { BrandPresenter } from "../presenters/BrandPresenter.js";

export class BrandController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const listBrandsUseCase = container.resolve(ListBrandsUseCase);
    const brands = await listBrandsUseCase.execute();

    return reply.send(brands.map((b) => BrandPresenter.toHTTP(b)));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = CreateBrandSchema.parse(request.body);

    const createBrandUseCase = container.resolve(CreateBrandUseCase);
    const brand = await createBrandUseCase.execute(data);

    return reply.status(201).send(BrandPresenter.toHTTP(brand));
  }

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const data = UpdateBrandSchema.parse(request.body);

    const updateBrandUseCase = container.resolve(UpdateBrandUseCase);
    const brand = await updateBrandUseCase.execute(id, data);

    return reply.send(BrandPresenter.toHTTP(brand));
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;

    const deleteBrandUseCase = container.resolve(DeleteBrandUseCase);
    await deleteBrandUseCase.execute(id);

    return reply.status(204).send();
  }
}
