import { FastifyInstance } from "fastify";
import { publicRoutes } from "./public.routes.js";
import { adminRoutes } from "./admin.routes.js";

export async function routes(app: FastifyInstance) {
  app.register(publicRoutes, { prefix: "/api/v1/public" });
  app.register(adminRoutes, { prefix: "/api/v1/admin" });

  // Health check
  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));
}
