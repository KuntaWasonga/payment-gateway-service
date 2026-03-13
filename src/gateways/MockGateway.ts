import type { PaymentGateway } from './PaymentGateway.js';
import type { CreatePaymentRequest, PaymentResult, RefundResult } from '../types/index.js';
import { PaymentStatus, PaymentGatewayError } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';


export class MockGateway implements PaymentGateway {

    private readonly store = new Map<String, PaymentResult>();

    async charge(req: CreatePaymentRequest): Promise<PaymentResult> {

        // Simulate a declined card for amounts over $999,999.00 — useful in tests
        if (req.amount > 99_999_999) {
        throw new PaymentGatewayError(
            "Your card was declined.",
            "card_declined",
        );
        }

        const result: PaymentResult = {
            id: uuidv4(),
            gatewayPaymentId: `mock_pi_${uuidv4()}`,
            status: PaymentStatus.SUCCESS,
            amount: req.amount,
            currency: req.currency,
            customerId: req.customerId,
            description: req.description,
            createdAt: new Date(),
        }

        this.store.set(result.id, result);
        return result;
    }


    async getPayment(gatewayPaymentId: string): Promise<PaymentResult | null> {
        return this.store.get(gatewayPaymentId) ?? null;
    }

    async refund(gatewayPaymentId: string, amountInCents: number): Promise<RefundResult> {

        const original = this.store.get(gatewayPaymentId);
        if (!original) {
            throw new PaymentGatewayError("Payment not found for refund.", "resource_missing");
        }

        const result: RefundResult = {
            id: uuidv4(),
            gatewayRefundId: `mock_rf_${uuidv4()}`,
            status: "REFUNDED",
            amount: amountInCents,
            createdAt: new Date(),
        };

        // Mark the original payment as refunded
        this.store.set(gatewayPaymentId, {
        ...original,
        status: PaymentStatus.REFUNDED,
        });

        
        return result;
    }
}