import "reflect-metadata";
import { validateEnv } from "./shared/env.js";

// Validate environment variables before anything else
validateEnv();

import "./shared/container/index.js";
import { buildServer } from "./infrastructure/http/server.js";
import { startMarketplaceJobs } from "./infrastructure/jobs/MarketplaceJobs.js";

async function main() {
  const app = await buildServer();

  const port = Number(process.env.PORT) || 3333;
  const host = "0.0.0.0";

  try {
    await app.listen({ port, host });
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/health`);

    startMarketplaceJobs();

    // Graceful shutdown
    const shutdown = async () => {
      console.log("Shutting down gracefully...");
      await app.close();
      process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
