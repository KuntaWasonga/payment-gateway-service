export class AppError extends Error {
    constructor(
        message: string,
        public readonly code: string = "INTERNAL_ERROR",
        public readonly statusCode: number = 500,
        public readonly isOperational: boolean = true,
    ) {
        super(message);
        this.name = "AppError";
        Error.captureStackTrace(this, this.constructor);
    }
}