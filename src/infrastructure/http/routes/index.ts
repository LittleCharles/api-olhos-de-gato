import { FastifyInstance } from "fastify";
import { publicRoutes } from "./public.routes.js";
import { adminRoutes } from "./admin.routes.js";
import { MarketplaceController } from "../controllers/MarketplaceController.js";

const marketplaceController = new MarketplaceController();

export async function routes(app: FastifyInstance) {
  app.register(publicRoutes, { prefix: "/api/v1/public" });
  app.register(adminRoutes, { prefix: "/api/v1/admin" });

  // OAuth callback — must be public (ML redirects browser without JWT)
  app.get("/api/v1/admin/marketplace/accounts/:platform/callback", marketplaceController.oauthCallback);

  // Health check
  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));
}
