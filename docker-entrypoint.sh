#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ] && [ -n "$MYSQL_HOST" ] && [ -n "$MYSQL_PORT" ] && [ -n "$MYSQL_DATABASE" ] && [ -n "$MYSQL_USER" ] && [ -n "$MYSQL_PASSWORD" ]; then
  echo "Composing DATABASE_URL from MYSQL_* environment variables..."
  export DATABASE_URL="$(node -e "const e=encodeURIComponent; process.stdout.write(\`mysql://\${e(process.env.MYSQL_USER)}:\${e(process.env.MYSQL_PASSWORD)}@\${process.env.MYSQL_HOST}:\${process.env.MYSQL_PORT}/\${process.env.MYSQL_DATABASE}\`)")"
fi

echo "Generating Prisma client..."
npx prisma generate

echo "Waiting for MySQL and pushing Prisma schema..."
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
