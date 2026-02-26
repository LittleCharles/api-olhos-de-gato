import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { RegisterUseCase } from "../../../application/use-cases/auth/RegisterUseCase.js";
import { LoginUseCase } from "../../../application/use-cases/auth/LoginUseCase.js";
import {
  RegisterSchema,
  LoginSchema,
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
}
