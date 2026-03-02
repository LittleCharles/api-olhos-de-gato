import "reflect-metadata";
import "./shared/container/index.js";
import { buildServer } from "./infrastructure/http/server.js";
import { startMarketplaceJobs } from "./infrastructure/jobs/MarketplaceJobs.js";
import { execSync } from "child_process";

async function runMigrations() {
  try {
    console.log("Running Prisma migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit", timeout: 30000 });
    console.log("Migrations completed.");
  } catch (error) {
    console.error("Migration error (continuing anyway):", error);
  }
}

async function main() {
  await runMigrations();

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
