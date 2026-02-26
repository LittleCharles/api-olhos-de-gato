import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { GetCurrentUserUseCase } from "../../../application/use-cases/customer/GetCurrentUserUseCase.js";
import { UpdateProfileUseCase } from "../../../application/use-cases/customer/UpdateProfileUseCase.js";
import { UpdateProfileSchema } from "../../../application/dtos/ProfileDTO.js";

export class ProfileController {
  async me(request: FastifyRequest, reply: FastifyReply) {
    const getCurrentUserUseCase = container.resolve(GetCurrentUserUseCase);
    const profile = await getCurrentUserUseCase.execute(request.user.id);

    return reply.send({
      id: profile.id,
      userId: profile.userId,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      cpf: profile.cpf,
      birthDate: profile.birthDate?.toISOString() ?? null,
      createdAt: profile.createdAt.toISOString(),
    });
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const data = UpdateProfileSchema.parse(request.body);

    const updateProfileUseCase = container.resolve(UpdateProfileUseCase);
    const profile = await updateProfileUseCase.execute(request.user.id, data);

    return reply.send({
      id: profile.id,
      userId: profile.userId,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      cpf: profile.cpf,
      birthDate: profile.birthDate?.toISOString() ?? null,
    });
  }
}
