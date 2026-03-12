import winston from "winston";
import { config } from "../config/index.js";

const isProd = config.env === "production";

export const logger = winston.createLogger({
    level: isProd ? "info" : "debug",
    format: isProd
        ? winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
        )
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: "HH:mm:ss" }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                const metaStr = Object.keys(meta).length
                    ? `  ${JSON.stringify(meta)}`
                    : "";
                return `${timestamp} [${level}] ${message}${metaStr}`;
            }),
        ),
    transports: [new winston.transports.Console()],
});