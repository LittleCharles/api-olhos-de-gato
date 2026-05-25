import Fastify from "fastify";
import rawBody from "fastify-raw-body";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import * as path from "path";
import { fileURLToPath } from "url";
import { routes } from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

/**
 * Resolve a config de trustProxy. `trustProxy: true` confiaria na cadeia
 * X-Forwarded-For inteira, deixando o cliente forjar `request.ip` e burlar o
 * rate-limit por IP. Aqui limitamos: por padrão confia em 1 hop (a borda do
 * Railway). Sobrescrevível via TRUST_PROXY (nº de hops, ou CIDR/IP do proxy).
 */
function resolveTrustProxy(): boolean | number | string {
  const v = process.env.TRUST_PROXY?.trim();
  if (!v) return 1;
  if (/^\d+$/.test(v)) return Number(v);
  return v;
}

export async function buildServer() {
  const app = Fastify({
    logger: true,
    trustProxy: resolveTrustProxy(),
  });

  // Raw body for Stripe webhooks (must be registered first)
  await app.register(rawBody, { field: "rawBody", global: true, runFirst: true });

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: false, // Disable CSP for API (no HTML served)
  });

  // Global rate limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // Zod Type Provider Configuration
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Swagger Documentation (only in non-production)
  if (process.env.NODE_ENV !== "production") {
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
  }

  // CORS
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN === "true"
        ? true
        : process.env.CORS_ORIGIN.split(",").map(s => s.trim())
      : ["http://localhost:3000"],
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

  // JWT - fail fast if secret is missing
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  await app.register(cookie);
  await app.register(jwt, {
    secret: jwtSecret,
    cookie: { cookieName: "auth_token", signed: false },
  });

  // Error handler
  app.setErrorHandler(errorHandler);

  // Routes
  await app.register(routes);

  return app;
}
