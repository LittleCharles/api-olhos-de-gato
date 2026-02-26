import "reflect-metadata";
import "./shared/container/index.js";
import { buildServer } from "./infrastructure/http/server.js";

async function main() {
  const app = await buildServer();

  const port = Number(process.env.PORT) || 3333;
  const host = "0.0.0.0";

  try {
    await app.listen({ port, host });
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📚 Health check: http://localhost:${port}/health`);
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main();
