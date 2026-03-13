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

// ERROR 400
export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, "VALIDATION_ERROR", 400);
        this.name = "ValidationError";
    }
}


// ERROR 401
export class UnauthorizedError extends AppError {
    constructor(message: string) {
        super(message, "UNAUTHORIZED_ERROR", 401);
        this.name = "UnauthorizedError";
    }
}


// ERROR 402
export class PaymentGatewayError extends AppError {
    constructor(
        message: string,
        public readonly gatewayCode?: string,
    ) {
        super("Payment gateway error", "PAYMENT_GATEWAY_ERROR", 402);
        this.name = "PaymentGatewayError";
    }
}


// ERROR 404
export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, "NOT_FOUND_ERROR", 404);
        this.name = "NotFoundError";
    }
}
