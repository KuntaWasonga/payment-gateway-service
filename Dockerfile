# ── Stage 1: Build ────────────────────────────────────────────────────────────
# Compiles TypeScript to JavaScript. This stage is discarded after the build —
# the TypeScript compiler and devDependencies never ship to production.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci                      # installs ALL deps including devDependencies

COPY tsconfig.json ./
COPY src ./src
RUN npm run build               # tsc → outputs to /app/dist


# ── Stage 2: Production ───────────────────────────────────────────────────────
# Lean runtime image. No TypeScript compiler, no devDependencies, no source.
FROM node:20-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

# Non-root user — running as root in a container is a security risk
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
RUN npm ci --omit=dev           # production dependencies only

COPY --from=builder /app/dist ./dist

# Transfer ownership to non-root user before switching
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3001

# Run compiled JS directly — no npm overhead, no TypeScript compiler at runtime
CMD ["node", "dist/index.js"]
