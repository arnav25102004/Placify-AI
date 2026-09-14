#!/bin/sh
set -e

# Schema is managed via Base.metadata.create_all + ensure_*_columns patchers in
# app/main.py's startup hook, not Alembic (see database.py) — the checked-in Alembic
# migration predates several model columns (student_id, submission_source, PR-request
# fields) and would create a stale schema if applied, so it is intentionally not run here.
if [ "$1" = "uvicorn" ]; then
  echo "Seeding default database credentials..."
  python3 -m app.seed || true
fi

echo "Starting: $@"
exec "$@"
