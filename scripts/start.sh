#!/bin/sh
# scripts/start.sh — Container entrypoint.
# 1. Run database migrations against the Fly volume.
# 2. Start the Next.js standalone server.
#
# On migration failure: log clearly and exit non-zero (surface as container crash,
# not a white-screen request error). Tables must exist before the first query.

set -e

echo "[start] Running database migrations..."
node /app/scripts/migrate.mjs

echo "[start] Migrations complete. Starting server..."
exec node /app/server.js
