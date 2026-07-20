import { FastifyInstance } from "fastify";
import { publicRoutes } from "./public.routes.js";
import { adminRoutes } from "./admin.routes.js";
import { MarketplaceController } from "../controllers/MarketplaceController.js";
import { FeedController } from "../controllers/FeedController.js";
import { prisma } from "../../database/prisma/client.js";

const marketplaceController = new MarketplaceController();
const feedController = new FeedController();

export async function routes(app: FastifyInstance) {
  app.register(publicRoutes, { prefix: "/api/v1/public" });
  app.register(adminRoutes, { prefix: "/api/v1/admin" });

  // OAuth callback — must be public (ML redirects browser without JWT)
  app.get("/api/v1/admin/marketplace/accounts/:platform/callback", marketplaceController.oauthCallback);

  // Feed de produtos Google Merchant (Shopping/PMax) — público, o Merchant busca a URL sozinho.
  app.get("/feed/google-merchant.xml", feedController.googleMerchant);

  // Health check (valida conectividade com o banco)
  app.get("/health", async (_req, reply) => {
    try {
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, rej) =>
          setTimeout(() => rej(new Error("db timeout")), 2000),
        ),
      ]);
      return {
        status: "ok",
        db: "ok",
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      reply.log.error({ err }, "Health check: DB unreachable");
      return reply.status(503).send({
        status: "degraded",
        db: "unreachable",
        timestamp: new Date().toISOString(),
      });
    }
  });
}
