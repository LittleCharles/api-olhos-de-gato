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
  const requestId = request.id;

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.message,
      requestId,
    });
  }

  if (error instanceof DomainError) {
    return reply.status(400).send({
      error: error.message,
      requestId,
    });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: "Dados inválidos",
      details: (error as ZodError).issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
      requestId,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[]) ?? [];
      const field = formatConstraintField(target);
      return reply.status(409).send({
        error: `Já existe um registro com este ${field}`,
        requestId,
      });
    }

    if (error.code === "P2003") {
      return reply.status(400).send({
        error: "Referência inválida: o registro relacionado não existe",
        requestId,
      });
    }

    if (error.code === "P2025") {
      return reply.status(404).send({
        error: "Registro não encontrado",
        requestId,
      });
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    request.log.error(
      { err: error, reqId: requestId, code: "DB_INIT_FAILED" },
      "DB initialization failed",
    );
    return reply.status(503).send({
      error: "Serviço temporariamente indisponível",
      code: "DB_INIT_FAILED",
      requestId,
    });
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    request.log.error(
      { err: error, reqId: requestId, code: "DB_QUERY_INVALID" },
      "Invalid Prisma query",
    );
    return reply.status(500).send({
      error: "Erro interno do servidor",
      code: "DB_QUERY_INVALID",
      requestId,
    });
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    request.log.error(
      { err: error, reqId: requestId, code: "DB_UNKNOWN_ERROR" },
      "Unknown Prisma error",
    );
    return reply.status(500).send({
      error: "Erro interno do servidor",
      code: "DB_UNKNOWN_ERROR",
      requestId,
    });
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    request.log.error(
      { err: error, reqId: requestId, code: "DB_PANIC" },
      "Prisma Rust panic",
    );
    return reply.status(500).send({
      error: "Erro interno do servidor",
      code: "DB_PANIC",
      requestId,
    });
  }

  request.log.error(
    { err: error, reqId: requestId, code: "UNEXPECTED" },
    "Unexpected error",
  );
  // Backup com stack completo caso o serializer do logger colapse o payload
  console.error(`[reqId=${requestId}] Unexpected error:`, error);

  return reply.status(500).send({
    error: "Erro interno do servidor",
    code: "UNEXPECTED",
    requestId,
  });
}
