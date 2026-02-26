import { FastifyRequest, FastifyReply } from "fastify";
import { UserRole } from "../../../domain/enums/index.js";
import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      id: string;
      role: UserRole;
    };
  }
}

export function optionalAuthMiddleware() {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      // Token is optional — ignore errors
    }
  };
}

export function authMiddleware(allowedRoles?: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();

      const { role } = request.user;

      if (allowedRoles && !allowedRoles.includes(role)) {
        return reply.status(403).send({ error: "Acesso negado" });
      }

      // request.user is already set by jwtVerify, but we can ensure it matches our expectation if needed.
      // In @fastify/jwt, request.user is typed as FastifyJWT['user'] which we defined above.
    } catch (_error) {
      return reply.status(401).send({ error: "Token inválido ou expirado" });
    }
  };
}
