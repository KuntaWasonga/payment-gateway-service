// ─── Payment domain types ─────────────────────────────────────────────────────

export enum PaymentStatus {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
}


export interface CreatePaymentRequest {
    amount: number; // in cents to avoid floating point precision issues
    currency: string;
    customerId: string;
    description?: string;
    metadata?: Record<string, string>;
}


export interface PaymentResult {
    id: string;
    gatewayPaymentId: string;
    status: PaymentStatus;
    amount: number; // in cents
    currency: string;
    customerId: string;
    description?: string;
    createdAt: Date;
}

// REFUND TYPES
export interface RefundRequest {
    gatewayPaymentId: string;
    amount: number; // in cents
    reason?: string;
    createdAt: Date;
}

export interface RefundResult {
    id: string;
    gatewayRefundId: string;
    status: "REFUNDED";
    amount: number; // in cents
    createdAt: Date;
}


// WEBHOOK EVENT
export interface WebhookEvent {
    id: string;
    type: string;
    data: { object: Record<string, unknown> };
}