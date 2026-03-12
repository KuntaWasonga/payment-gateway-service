import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { config } from "../config/index.js";
import { AppError } from "../types/index.js";

export interface ApiSuccess<T> {
    success: true;
    data: T;
}


export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        timestamp: string;
        stack?: string;
    }
}


export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction,
): void {
    const isAppError = err instanceof AppError;
    const statusCode = isAppError ? err.statusCode : 500;
    const code = isAppError ? err.code       : "INTERNAL_ERROR";
    const message = isAppError && err.isOperational
        ? err.message
        : "An unexpected error occurred.";

    if (statusCode >= 500) {
        logger.error("Server error", {
            method: req.method,
            path: req.path,
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
        })
    } else {
        logger.warn("Client error", {
            method: req.method,
            path: req.path,
            error: err instanceof Error ? err.message : String(err),
        })
    }

    const body: ApiError = {
        success: false,
        error: {
            code,
            message,
            timestamp: new Date().toISOString(),
            ...(config.env === "development" && err instanceof Error && { stack: err.stack }),
        }
    }

    res.status(statusCode).json(body);
}

export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: {
            code: "NOT_FOUND",
            message: `Route ${req.method}: ${req.path} does not exist.`,
            timestamp: new Date().toISOString(),
        }
    } satisfies ApiError);
}
