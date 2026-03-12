// ─── Entry point ──────────────────────────────────────────────────────────────
// Starts the HTTP server. Handles graceful shutdown on SIGTERM/SIGINT.
// This is the only file that knows about the port and the server lifecycle.

import { app } from "./app.js";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";

const server = app.listen(config.port, () => {
  logger.info("Payment gateway service started", {
    port:        config.port,
    environment: config.env,
    gateway:     config.payment.provider,
  });
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
// Kubernetes sends SIGTERM when rolling out a new version.
// server.close() stops accepting new connections but lets in-flight
// requests finish. After 10 seconds we force-exit to prevent hangs.
const shutdown = (signal: string): void => {
  logger.info(`${signal} received — shutting down gracefully`);

  server.close(() => {
    logger.info("Server closed — process exiting");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Graceful shutdown timed out — forcing exit");
    process.exit(1);
  }, 10_000).unref();     // .unref() prevents this timer from keeping the event loop alive
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

// Surface unhandled promise rejections — they would otherwise silently
// corrupt state and produce mysterious bugs later in the request lifecycle
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason });
});
