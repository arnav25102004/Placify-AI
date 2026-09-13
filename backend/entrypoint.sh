#!/bin/sh
set -e

# Run migrations and seeding once (when starting the api service)
if [ "$1" = "uvicorn" ]; then
  echo "Applying database migrations..."
  alembic upgrade head
  echo "Seeding default database credentials..."
  python3 -m app.seed || true
fi

echo "Starting: $@"
exec "$@"
