import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { RegisterUseCase } from "../../../application/use-cases/auth/RegisterUseCase.js";
import { LoginUseCase } from "../../../application/use-cases/auth/LoginUseCase.js";
import { ForgotPasswordUseCase } from "../../../application/use-cases/auth/ForgotPasswordUseCase.js";
import { ResetPasswordUseCase } from "../../../application/use-cases/auth/ResetPasswordUseCase.js";
import { RefreshTokenUseCase } from "../../../application/use-cases/auth/RefreshTokenUseCase.js";
import { VerifyEmailUseCase } from "../../../application/use-cases/auth/VerifyEmailUseCase.js";
import { SendVerificationEmailUseCase } from "../../../application/use-cases/auth/SendVerificationEmailUseCase.js";
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "../../../application/dtos/AuthDTO.js";
import { SESSION_LIFETIME } from "../../../shared/auth-constants.js";

function setAuthCookie(reply: FastifyReply, token: string, maxAge: number) {
  const isProd = process.env.NODE_ENV === "production";
  reply.setCookie("auth_token", token, {
    httpOnly: true,
    secure: isProd,
    // Lax: front e API compartilham o mesmo domínio registrável (olhosdegato.com.br),
    // então são same-site. Lax fecha a superfície de CSRF que o `None` abria.
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const data = RegisterSchema.parse(request.body);

    const registerUseCase = container.resolve(RegisterUseCase);
    const result = await registerUseCase.execute(data);

    const token = await reply.jwtSign(
      { id: result.user.id, role: result.user.role },
      { expiresIn: SESSION_LIFETIME.REGISTER.jwt },
    );

    setAuthCookie(reply, token, SESSION_LIFETIME.REGISTER.maxAgeSeconds);

    return reply.status(201).send({ user: result.user });
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const data = LoginSchema.parse(request.body);

    const loginUseCase = container.resolve(LoginUseCase);
    const result = await loginUseCase.execute(data);

    // "Lembrar-me" controla a duração da sessão
    const lifetime = data.rememberMe ? SESSION_LIFETIME.REMEMBER_ME : SESSION_LIFETIME.DEFAULT;

    const token = await reply.jwtSign(
      { id: result.user.id, role: result.user.role },
      { expiresIn: lifetime.jwt },
    );

    setAuthCookie(reply, token, lifetime.maxAgeSeconds);

    return reply.send({ user: result.user });
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    // O preHandler `customerAuth` já validou o cookie e populou request.user
    const refreshUseCase = container.resolve(RefreshTokenUseCase);
    const result = await refreshUseCase.execute(request.user.id);

    // Refresh sempre estende com a duração default (24h). Lembrar-me só vale no login inicial.
    const token = await reply.jwtSign(
      { id: result.user.id, role: result.user.role },
      { expiresIn: SESSION_LIFETIME.DEFAULT.jwt },
    );
    setAuthCookie(reply, token, SESSION_LIFETIME.DEFAULT.maxAgeSeconds);

    return reply.send({ user: result.user });
  }

  async logout(_request: FastifyRequest, reply: FastifyReply) {
    const isProd = process.env.NODE_ENV === "production";
    reply.clearCookie("auth_token", {
      path: "/",
      secure: isProd,
      sameSite: "lax",
    });
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

  async verifyEmail(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.query as { token?: string };
    const verifyEmailUseCase = container.resolve(VerifyEmailUseCase);
    const result = await verifyEmailUseCase.execute(token ?? "");
    return reply.send(result);
  }

  async resendVerification(request: FastifyRequest, reply: FastifyReply) {
    const sendVerificationUseCase = container.resolve(SendVerificationEmailUseCase);
    await sendVerificationUseCase.execute(request.user.id);
    return reply.send({ message: "Email de verificação reenviado." });
  }
}
