#!/bin/sh
set -e

mkdir -p /app/data
npx prisma migrate deploy
npx prisma db seed

exec node server.js
