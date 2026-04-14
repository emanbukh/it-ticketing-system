#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ] && [ -n "$POSTGRES_HOST" ] && [ -n "$POSTGRES_PORT" ] && [ -n "$POSTGRES_DB" ] && [ -n "$POSTGRES_USER" ] && [ -n "$POSTGRES_PASSWORD" ]; then
  echo "Composing DATABASE_URL from POSTGRES_* environment variables..."
  export DATABASE_URL="$(node -e "const e=encodeURIComponent; process.stdout.write(\`postgresql://\${e(process.env.POSTGRES_USER)}:\${e(process.env.POSTGRES_PASSWORD)}@\${process.env.POSTGRES_HOST}:\${process.env.POSTGRES_PORT}/\${process.env.POSTGRES_DB}\`)")"
fi

echo "Generating Prisma client..."
npx prisma generate

echo "Waiting for Postgres and pushing Prisma schema..."
attempt=1
until npx prisma db push --accept-data-loss; do
  if [ "$attempt" -ge 20 ]; then
    echo "Prisma db push failed after $attempt attempts."
    exit 1
  fi

  echo "Database not ready yet. Retrying in 5 seconds... ($attempt/20)"
  attempt=$((attempt + 1))
  sleep 5
done

if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "Seeding demo data..."
  npm run db:seed
fi

echo "Starting Next.js application..."
exec "$@"
