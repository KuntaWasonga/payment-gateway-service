import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { logger } from "./utils/logger.js";
import { config } from "./config/index.js";
import { paymentRouter, webhookRouter, healthRouter } from "./container.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";


const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.cors.allowedOrigins }));


// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: "Too many requests — please slow down." },
    })
)


// ── Body parsing ──────────────────────────────────────────────────────────────
// IMPORTANT: webhooks must receive the raw body Buffer for Stripe signature
// verification. Mount the raw parser BEFORE express.json() and scope it
// only to the /webhooks path.
app.use("/webhooks", express.raw({ type: "application/json" }));

// All other routes get standard JSON parsing
app.use(express.json({ limit: "1mb" }));


// ── Request logging ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`, { ip: req.ip });
    next();
});


// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/health", healthRouter);
app.use("/payments", paymentRouter);
app.use("/webhooks", webhookRouter);


// ── Error handling ──────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export { app };