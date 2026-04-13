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

const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

function setAuthCookie(reply: FastifyReply, token: string) {
  reply.setCookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS_SECONDS,
  });
}

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const data = RegisterSchema.parse(request.body);

    const registerUseCase = container.resolve(RegisterUseCase);
    const result = await registerUseCase.execute(data);

    const token = await reply.jwtSign(
      { id: result.user.id, role: result.user.role },
      { expiresIn: "7d" },
    );

    setAuthCookie(reply, token);

    return reply.status(201).send({ user: result.user });
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const data = LoginSchema.parse(request.body);

    const loginUseCase = container.resolve(LoginUseCase);
    const result = await loginUseCase.execute(data);

    const token = await reply.jwtSign(
      { id: result.user.id, role: result.user.role },
      { expiresIn: "7d" },
    );

    setAuthCookie(reply, token);

    return reply.send({ user: result.user });
  }

  async logout(_request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie("auth_token", { path: "/" });
    return reply.send({ ok: true });
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
