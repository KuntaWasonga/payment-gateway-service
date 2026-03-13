import type {
    CreatePaymentRequest,
    PaymentResult,
    RefundResult,
} from "../types/index.js";


export interface PaymentGateway {
    charge(req: CreatePaymentRequest): Promise<PaymentResult>;
    getPayment(gatewayPaymentId: string): Promise<PaymentResult | null>;
    refund(gatewayPaymentId: string, amountInCents: number): Promise<RefundResult>;
}