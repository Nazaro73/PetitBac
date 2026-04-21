import { config } from "./config.js";
import { createServer } from "./server.js";
import { logger } from "./utils/logger.js";

const { httpServer } = createServer();

httpServer.listen(config.port, "0.0.0.0", () => {
  logger.info(`Petit Bac backend listening on :${config.port}`);
  if (config.frontendUrl) {
    logger.info(`Configured frontend URL: ${config.frontendUrl}`);
  } else {
    logger.warn("FRONTEND_URL is empty — only *.vercel.app / *.ngrok-free.app will pass CORS.");
  }
});

function shutdown(signal) {
  logger.info(`Received ${signal}, closing…`);
  httpServer.close(() => process.exit(0));
  // Failsafe
  setTimeout(() => process.exit(1), 5_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
