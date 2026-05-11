import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { GetCurrentUserUseCase } from "../../../application/use-cases/customer/GetCurrentUserUseCase.js";
import { UpdateProfileUseCase } from "../../../application/use-cases/customer/UpdateProfileUseCase.js";
import { ChangePasswordUseCase } from "../../../application/use-cases/customer/ChangePasswordUseCase.js";
import { AcceptTermsUseCase } from "../../../application/use-cases/customer/AcceptTermsUseCase.js";
import { DeleteAccountUseCase } from "../../../application/use-cases/customer/DeleteAccountUseCase.js";
import { ExportDataUseCase } from "../../../application/use-cases/customer/ExportDataUseCase.js";
import { UpdateProfileSchema, ChangePasswordSchema } from "../../../application/dtos/ProfileDTO.js";

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
      emailVerified: profile.emailVerified,
      acceptedTerms: profile.acceptedTerms,
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

  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const data = ChangePasswordSchema.parse(request.body);

    const changePasswordUseCase = container.resolve(ChangePasswordUseCase);
    await changePasswordUseCase.execute(request.user.id, data);

    return reply.send({ message: "Senha atualizada com sucesso" });
  }

  async acceptTerms(request: FastifyRequest, reply: FastifyReply) {
    const acceptTermsUseCase = container.resolve(AcceptTermsUseCase);
    const result = await acceptTermsUseCase.execute(request.user.id);
    return reply.send(result);
  }

  async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
    const deleteAccountUseCase = container.resolve(DeleteAccountUseCase);
    await deleteAccountUseCase.execute(request.user.id);
    // Limpa cookie de auth (logout automático)
    const isProd = process.env.NODE_ENV === "production";
    reply.clearCookie("auth_token", {
      path: "/",
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
    return reply.send({ message: "Conta excluída com sucesso" });
  }

  async exportData(request: FastifyRequest, reply: FastifyReply) {
    const exportDataUseCase = container.resolve(ExportDataUseCase);
    const data = await exportDataUseCase.execute(request.user.id);
    reply.header("Content-Disposition", 'attachment; filename="meus-dados.json"');
    reply.header("Content-Type", "application/json");
    return reply.send(data);
  }
}
