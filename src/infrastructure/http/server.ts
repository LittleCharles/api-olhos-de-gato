import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import * as path from "path";
import { fileURLToPath } from "url";
import { routes } from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

export async function buildServer() {
  const app = Fastify({
    logger: true,
  });

  // Zod Type Provider Configuration
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Swagger Documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Petshop API",
        description: "API RESTful para sistema de Petshop",
        version: "1.0.0",
      },
      servers: [
        { url: "https://api.olhosdegato.com.br", description: "Produção" },
        { url: "http://localhost:3333", description: "Desenvolvimento" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  });

  // Plugins
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN === "true"
        ? true
        : process.env.CORS_ORIGIN.split(",").map(s => s.trim())
      : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  });

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const uploadsPath = path.resolve(__dirname, "../../../uploads");
  await app.register(fastifyStatic, {
    root: uploadsPath,
    prefix: "/uploads/",
    decorateReply: false,
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || "default-secret",
  });

  // Error handler
  app.setErrorHandler(errorHandler);

  // Routes
  await app.register(routes);

  return app;
}
