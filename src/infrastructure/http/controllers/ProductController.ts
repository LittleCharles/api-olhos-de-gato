import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { CreateProductUseCase } from "../../../application/use-cases/product/CreateProductUseCase.js";
import { ListProductsUseCase } from "../../../application/use-cases/product/ListProductsUseCase.js";
import { GetProductUseCase } from "../../../application/use-cases/product/GetProductUseCase.js";
import { UpdateProductUseCase } from "../../../application/use-cases/product/UpdateProductUseCase.js";
import { DeleteProductUseCase } from "../../../application/use-cases/product/DeleteProductUseCase.js";
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductFiltersSchema,
  ToggleFeaturedSchema,
  ToggleRecommendedSchema,
} from "../../../application/dtos/ProductDTO.js";
import { ToggleFeaturedUseCase } from "../../../application/use-cases/product/ToggleFeaturedUseCase.js";
import { ToggleRecommendedUseCase } from "../../../application/use-cases/product/ToggleRecommendedUseCase.js";
import { GetFeaturedProductsUseCase } from "../../../application/use-cases/product/GetFeaturedProductsUseCase.js";
import { GetRecommendedProductsUseCase } from "../../../application/use-cases/product/GetRecommendedProductsUseCase.js";
import { ProductPresenter } from "../presenters/ProductPresenter.js";

export class ProductController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = CreateProductSchema.parse(request.body);

    const createProductUseCase = container.resolve(CreateProductUseCase);
    const product = await createProductUseCase.execute(data);

    return reply.status(201).send(ProductPresenter.toHTTP(product));
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const filters = ProductFiltersSchema.parse(request.query);

    const listProductsUseCase = container.resolve(ListProductsUseCase);
    const result = await listProductsUseCase.execute(filters);

    return reply.send({
      data: result.data.map(ProductPresenter.toHTTP),
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

    const getProductUseCase = container.resolve(GetProductUseCase);
    const product = await getProductUseCase.execute(id);

    return reply.send(ProductPresenter.toHTTP(product));
  }

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const data = UpdateProductSchema.parse(request.body);

    const updateProductUseCase = container.resolve(UpdateProductUseCase);
    const product = await updateProductUseCase.execute(id, data);

    return reply.send(ProductPresenter.toHTTP(product));
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;

    const deleteProductUseCase = container.resolve(DeleteProductUseCase);
    await deleteProductUseCase.execute(id);

    return reply.status(204).send();
  }

  async toggleFeatured(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { isFeatured } = ToggleFeaturedSchema.parse(request.body);

    const useCase = container.resolve(ToggleFeaturedUseCase);
    await useCase.execute(id, isFeatured);

    return reply.send({ isFeatured });
  }

  async toggleRecommended(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { isRecommended } = ToggleRecommendedSchema.parse(request.body);

    const useCase = container.resolve(ToggleRecommendedUseCase);
    await useCase.execute(id, isRecommended);

    return reply.send({ isRecommended });
  }

  async featured(
    request: FastifyRequest<{ Querystring: { limit?: string } }>,
    reply: FastifyReply,
  ) {
    const limit = request.query.limit ? Number(request.query.limit) : undefined;

    const useCase = container.resolve(GetFeaturedProductsUseCase);
    const products = await useCase.execute(limit);

    return reply.send(products.map(ProductPresenter.toHTTP));
  }

  async recommended(
    request: FastifyRequest<{ Querystring: { limit?: string } }>,
    reply: FastifyReply,
  ) {
    const limit = request.query.limit ? Number(request.query.limit) : undefined;

    const useCase = container.resolve(GetRecommendedProductsUseCase);
    const products = await useCase.execute(limit);

    return reply.send(products.map(ProductPresenter.toHTTP));
  }
}
