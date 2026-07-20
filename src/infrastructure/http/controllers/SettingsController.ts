import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { GetStoreSettingsUseCase } from "../../../application/use-cases/settings/GetStoreSettingsUseCase.js";
import { UpdateStoreSettingsUseCase } from "../../../application/use-cases/settings/UpdateStoreSettingsUseCase.js";
import { UpdateStoreSettingsSchema } from "../../../application/dtos/StoreSettingsDTO.js";
import { StoreSettingsPresenter } from "../presenters/StoreSettingsPresenter.js";

export class SettingsController {
  // Público (/public/settings): NÃO expõe campos admin-only como lookerStudioUrl.
  async get(_request: FastifyRequest, reply: FastifyReply) {
    const useCase = container.resolve(GetStoreSettingsUseCase);
    const settings = await useCase.execute();
    return reply.send(StoreSettingsPresenter.toHTTP(settings));
  }

  // Admin (/admin/settings): inclui campos internos (lookerStudioUrl).
  async getAdmin(_request: FastifyRequest, reply: FastifyReply) {
    const useCase = container.resolve(GetStoreSettingsUseCase);
    const settings = await useCase.execute();
    return reply.send(StoreSettingsPresenter.toHTTPAdmin(settings));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const data = UpdateStoreSettingsSchema.parse(request.body);
    const useCase = container.resolve(UpdateStoreSettingsUseCase);
    const settings = await useCase.execute(data);
    return reply.send(StoreSettingsPresenter.toHTTPAdmin(settings));
  }
}
