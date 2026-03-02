import "reflect-metadata";
import "./shared/container/index.js";
import { buildServer } from "./infrastructure/http/server.js";
import { startMarketplaceJobs } from "./infrastructure/jobs/MarketplaceJobs.js";

console.log("=== main.ts loaded ===");

async function main() {
  console.log("=== main() starting ===");
  const app = await buildServer();

  const port = Number(process.env.PORT) || 3333;
  const host = "0.0.0.0";

  try {
    await app.listen({ port, host });
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📚 Health check: http://localhost:${port}/health`);

    startMarketplaceJobs();
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
