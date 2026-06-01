# ─── Stage 1: deps ─────────────────────────────────────────────────────────────
# Install all dependencies including dev (needed for build) and compile native modules.
# better-sqlite3 is a native addon — requires python3, make, g++ for node-gyp.
FROM node:24-slim AS deps
WORKDIR /app

# Install build tools for better-sqlite3 native compilation
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci

# ─── Stage 2: builder ──────────────────────────────────────────────────────────
# Build the Next.js app in standalone mode.
# Migrations are generated at dev time and committed under drizzle/ — just copy them.
FROM node:24-slim AS builder
WORKDIR /app

# Copy dependencies (including compiled native modules)
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY . .

ENV NODE_ENV=production
RUN npm run build

# ─── Stage 3: runner ───────────────────────────────────────────────────────────
# Minimal production image. We copy better-sqlite3 from the build stage so its
# pre-compiled binary (matching the Node/platform) is available at runtime.
FROM node:24-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy standalone Next.js output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Drizzle migrations (applied on container start by migrate.mjs)
COPY --from=builder /app/drizzle ./drizzle

# Copy the standalone migration script and start script
COPY --from=builder /app/scripts ./scripts
RUN chmod +x ./scripts/start.sh

# Copy better-sqlite3 native module for the runner platform.
# The node_modules in the standalone output do not include better-sqlite3
# (native addon) so we copy it explicitly from the builder stage.
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder /app/node_modules/bindings ./node_modules/bindings
COPY --from=builder /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path

# Copy drizzle-orm for the migration script (needed at runtime by migrate.mjs)
COPY --from=builder /app/node_modules/drizzle-orm ./node_modules/drizzle-orm

EXPOSE 3000

CMD ["./scripts/start.sh"]
