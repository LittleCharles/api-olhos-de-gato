import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { CreateSubcategoryUseCase } from "../../../application/use-cases/subcategory/CreateSubcategoryUseCase.js";
import { ListSubcategoriesUseCase } from "../../../application/use-cases/subcategory/ListSubcategoriesUseCase.js";
import { UpdateSubcategoryUseCase } from "../../../application/use-cases/subcategory/UpdateSubcategoryUseCase.js";
import { DeleteSubcategoryUseCase } from "../../../application/use-cases/subcategory/DeleteSubcategoryUseCase.js";
import {
  CreateSubcategorySchema,
  UpdateSubcategorySchema,
} from "../../../application/dtos/SubcategoryDTO.js";
import { SubcategoryPresenter } from "../presenters/SubcategoryPresenter.js";

export class SubcategoryController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const listSubcategoriesUseCase = container.resolve(
      ListSubcategoriesUseCase,
    );
    const result = await listSubcategoriesUseCase.execute();

    return reply.send(SubcategoryPresenter.toGroupedHTTP(result));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = CreateSubcategorySchema.parse(request.body);

    const createSubcategoryUseCase = container.resolve(
      CreateSubcategoryUseCase,
    );
    const subcategory = await createSubcategoryUseCase.execute(data);

    return reply.status(201).send(SubcategoryPresenter.toHTTP(subcategory));
  }

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const data = UpdateSubcategorySchema.parse(request.body);

    const updateSubcategoryUseCase = container.resolve(
      UpdateSubcategoryUseCase,
    );
    const subcategory = await updateSubcategoryUseCase.execute(id, data);

    return reply.send(SubcategoryPresenter.toHTTP(subcategory));
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;

    const deleteSubcategoryUseCase = container.resolve(
      DeleteSubcategoryUseCase,
    );
    await deleteSubcategoryUseCase.execute(id);

    return reply.status(204).send();
  }
}
