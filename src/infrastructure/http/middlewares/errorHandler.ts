import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../../shared/errors/AppError.js";
import { DomainError } from "../../../domain/errors/DomainError.js";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

const fieldLabels: Record<string, string> = {
  slug: "nome (slug)",
  sku: "SKU",
  email: "e-mail",
};

function formatConstraintField(target: string[]): string {
  const field = target[target.length - 1] ?? "campo";
  return fieldLabels[field] ?? field;
}

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.message,
    });
  }

  if (error instanceof DomainError) {
    return reply.status(400).send({
      error: error.message,
    });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: "Dados inválidos",
      details: (error as ZodError).issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[]) ?? [];
      const field = formatConstraintField(target);
      return reply.status(409).send({
        error: `Já existe um registro com este ${field}`,
      });
    }

    if (error.code === "P2003") {
      return reply.status(400).send({
        error: "Referência inválida: o registro relacionado não existe",
      });
    }

    if (error.code === "P2025") {
      return reply.status(404).send({
        error: "Registro não encontrado",
      });
    }
  }

  console.error("Unexpected error:", error);

  return reply.status(500).send({
    error: "Erro interno do servidor",
  });
}
