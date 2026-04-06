import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { RegisterUseCase } from "../../../application/use-cases/auth/RegisterUseCase.js";
import { LoginUseCase } from "../../../application/use-cases/auth/LoginUseCase.js";
import { ForgotPasswordUseCase } from "../../../application/use-cases/auth/ForgotPasswordUseCase.js";
import { ResetPasswordUseCase } from "../../../application/use-cases/auth/ResetPasswordUseCase.js";
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "../../../application/dtos/AuthDTO.js";

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const data = RegisterSchema.parse(request.body);

    const registerUseCase = container.resolve(RegisterUseCase);
    const result = await registerUseCase.execute(data);

    const token = await reply.jwtSign(
      { id: result.user.id, role: result.user.role },
      { expiresIn: "7d" },
    );

    return reply.status(201).send({
      user: result.user,
      token,
    });
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const data = LoginSchema.parse(request.body);

    const loginUseCase = container.resolve(LoginUseCase);
    const result = await loginUseCase.execute(data);

    const token = await reply.jwtSign(
      { id: result.user.id, role: result.user.role },
      { expiresIn: "7d" },
    );

    return reply.send({
      user: result.user,
      token,
    });
  }

  async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
    const data = ForgotPasswordSchema.parse(request.body);

    const forgotPasswordUseCase = container.resolve(ForgotPasswordUseCase);
    const result = await forgotPasswordUseCase.execute(data);

    return reply.send(result);
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    const data = ResetPasswordSchema.parse(request.body);

    const resetPasswordUseCase = container.resolve(ResetPasswordUseCase);
    const result = await resetPasswordUseCase.execute(data);

    return reply.send(result);
  }
}
