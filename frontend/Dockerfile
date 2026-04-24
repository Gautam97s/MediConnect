# ── Stage 1: Install dependencies ──────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# ── Stage 2: Build ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 3: Runtime ───────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S mediconnect && adduser -S mediconnect -G mediconnect

COPY --from=builder /app/public ./public
COPY --from=builder --chown=mediconnect:mediconnect /app/.next/standalone ./
COPY --from=builder --chown=mediconnect:mediconnect /app/.next/static ./.next/static

USER mediconnect

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
