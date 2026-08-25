#!/bin/sh
set -e

export HOME="${HOME:-/tmp}"
export PATH="/opt/node_modules/.bin:${PATH}"
: "${PORT:=8080}"
export PORT

mkdir -p /app/data

# Recover if a previous boot left this migration failed (duplicate status column).
# No-op when the migration was never attempted or already applied successfully.
prisma migrate resolve --rolled-back "20260825154000_add_pilot_status" 2>/dev/null || true

echo "[spl] prisma migrate deploy"
prisma migrate deploy

echo "[spl] seed aircraft catalog"
NODE_PATH="/opt/node_modules" node prisma/seed.cjs

echo "[spl] starting Next.js on ${HOSTNAME:-0.0.0.0}:${PORT}"
exec node server.js
