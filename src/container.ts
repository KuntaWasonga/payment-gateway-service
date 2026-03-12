import Stripe from "stripe";
import { config } from "./config/index.js";
import { StripeGateway } from "./gateways/StripeGateway.js";
import { MockGateway }   from "./gateways/MockGateway.js";
import { logger } from "./utils/logger.js";
import { PaymentService } from "./services/PaymentService.js";
import { createPaymentRouter } from "./routes/payments.js";
import { createWebhookRouter } from "./routes/webhooks.js";
import { createHealthRouter }  from "./routes/health.js";



const stripeClient = new Stripe(config.stripe.secretKey, {
  typescript:  true,
});


const gateway =
  config.payment.provider === "stripe"
    ? new StripeGateway(stripeClient, logger)
    : new MockGateway();

logger.info(`Payment gateway: ${config.payment.provider}`);



const paymentService = new PaymentService(gateway, logger);

export const paymentRouter = createPaymentRouter(paymentService);
export const webhookRouter = createWebhookRouter(stripeClient, logger);
export const healthRouter = createHealthRouter();