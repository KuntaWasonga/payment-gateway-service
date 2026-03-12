# Payment Gateway Microservice

A production-grade Express.js + TypeScript microservice that acts as a payment gateway abstraction layer, supporting **Stripe** (real payments) and a **Mock provider** (local development & testing) via a swappable Strategy Pattern.

## Architecture

```
src/
├── types/              # Domain interfaces, enums, typed errors (DTOs)
│   ├── payment.ts
│   ├── errors.ts
│   └── index.ts
│
├── config/
│   └── index.ts        # All process.env access — single source of truth
│
├── middleware/
│   ├── auth.ts         # API key validation (X-API-Key header)
│   ├── validate.ts     # Zod schema middleware — replaces @Valid
│   └── errorHandler.ts # Centralised error formatter — one shape, always
│
├── gateways/
│   ├── PaymentGateway.ts  # Interface — the contract (Dependency Inversion)
│   ├── StripeGateway.ts   # Real Stripe implementation
│   └── MockGateway.ts     # In-memory fake for dev & tests
│
├── services/
│   └── PaymentService.ts  # Business logic — no HTTP, fully unit-testable
│
├── routes/
│   ├── payments.ts     # POST /payments, GET /payments/:id, POST /refund
│   ├── webhooks.ts     # POST /webhooks/stripe — Stripe async events
│   └── health.ts       # GET /health, /health/live, /health/ready
│
├── utils/
│   └── logger.ts       # Winston — JSON in prod, colourised in dev
│
├── container.ts        # Manual dependency injection
├── app.ts              # Express app + middleware stack
└── index.ts            # Server entry point + graceful shutdown
```

## Key Design Decisions

**Dependency Inversion (SOLID)** — `PaymentService` depends on the `PaymentGateway` interface, not `StripeGateway` directly. Swapping providers is a single line in `container.ts`.

**Layered architecture** — Types → Config → Middleware → Routes → Services → Gateways. Each layer only imports from layers below it. Routes never contain business logic. Services never contain HTTP concerns.

**Centralised error handling** — Every error thrown anywhere in the app flows to one handler in `errorHandler.ts`. Consistent JSON shape on every error response.

**Graceful shutdown** — SIGTERM handling for zero-downtime Kubernetes rolling deploys.

**Structured logging** — Winston with JSON output in production (ingestible by Datadog, CloudWatch, Loki) and colourised output in development.

## API Reference

All payment routes require an `X-API-Key` header.

### Payments

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/payments` | Create and process a payment |
| `GET` | `/payments/:gatewayPaymentId` | Retrieve a payment |
| `POST` | `/payments/:gatewayPaymentId/refund` | Refund a payment |

**POST /payments — request body:**
```json
{
  "amountInCents": 4999,
  "currency": "usd",
  "customerId": "cus_abc123",
  "description": "Order #1042",
  "metadata": { "orderId": "1042" }
}
```

**POST /payments — success response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "gatewayPaymentId": "pi_3abc...",
    "status": "SUCCEEDED",
    "amountInCents": 4999,
    "currency": "usd",
    "customerId": "cus_abc123",
    "createdAt": "2026-03-12T10:00:00.000Z"
  }
}
```

**Error response (all errors):**
```json
{
  "success": false,
  "error": {
    "code": "PAYMENT_GATEWAY_ERROR",
    "message": "Your card was declined."
  }
}
```

### Webhooks

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/webhooks/stripe` | Stripe event listener (raw body required) |

Handles: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Full service info |
| `GET` | `/health/live` | Kubernetes liveness probe |
| `GET` | `/health/ready` | Kubernetes readiness probe |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set PAYMENT_PROVIDER=mock for local dev (no Stripe account needed)

# 3. Start development server (hot reload)
npm run dev

# 4. Test the API
curl -X POST http://localhost:3001/payments \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key-here" \
  -d '{ "amountInCents": 4999, "currency": "usd", "customerId": "cus_test_001" }'
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled production build |
| `npm run typecheck` | Type-check without emitting files |
| `npm test` | Run test suite |

## Docker

```bash
# Build
docker build -t payment-gateway-service .

# Run (mock provider — no Stripe keys needed)
docker run -p 3001:3001 \
  -e PAYMENT_PROVIDER=mock \
  -e API_KEY=dev-key \
  payment-gateway-service

# Run with Stripe
docker run -p 3001:3001 \
  -e PAYMENT_PROVIDER=stripe \
  -e STRIPE_SECRET_KEY=sk_test_... \
  -e STRIPE_WEBHOOK_SECRET=whsec_... \
  -e API_KEY=your-api-key \
  payment-gateway-service
```

## Tech Stack

| Package | Role |
|---------|------|
| `express` | HTTP framework |
| `typescript` | Type safety + compile-time error checking |
| `stripe` | Payment provider SDK |
| `zod` | Runtime request validation + type inference |
| `helmet` | Security HTTP headers |
| `cors` | Cross-origin resource sharing |
| `express-rate-limit` | Request rate limiting |
| `winston` | Structured logging |
| `uuid` | Unique ID generation |
| `dotenv` | Environment variable loading |
