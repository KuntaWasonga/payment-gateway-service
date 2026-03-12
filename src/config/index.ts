// All process.env access lives HERE and nowhere else.
import "dotenv/config";

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

const provider = optional("PAYMENT_PROVIDER", "mock");
if (provider !== "stripe" && provider !== "mock") {
  throw new Error('PAYMENT_PROVIDER must be "stripe" or "mock"');
}

export const config = {
  env:  optional("NODE_ENV", "development"),
  port: parseInt(optional("PORT", "3001"), 10),

  payment: {
    provider: provider as "stripe" | "mock",
  },

  stripe: {
    // Only required when provider is stripe — validated at startup
    secretKey:     provider === "stripe" ? required("STRIPE_SECRET_KEY")     : "",
    webhookSecret: provider === "stripe" ? required("STRIPE_WEBHOOK_SECRET") : "",
  },

  auth: {
    apiKey: required("API_KEY"),
  },

  cors: {
    allowedOrigins: optional("ALLOWED_ORIGINS", "*").split(","),
  },
} as const;
