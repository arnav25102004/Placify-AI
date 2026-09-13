#!/usr/bin/env bash
set -e

echo "=== Starting Placify AI Stack ==="

# Trap Ctrl+C (SIGINT) and cleanup child processes
trap 'echo "Stopping all processes..."; kill $(jobs -p) 2>/dev/null; exit 0' SIGINT SIGTERM EXIT

# 1. Ensure PostgreSQL and Redis are running via Docker
echo "Starting PostgreSQL and Redis containers..."
docker compose up -d postgres redis

# 2. Apply database migrations & seed users
echo "Ensuring migrations and seed data..."
if [ -d "backend/.venv" ]; then
  source backend/.venv/bin/activate
fi

cd backend
alembic upgrade head 2>/dev/null || echo "Alembic migrations checked."
python3 -m app.seed 2>/dev/null || echo "Database seeded."

# 3. Start Celery worker in background (if redis is reachable)
celery -A app.celery_app.celery_app worker --loglevel=info &
CELERY_PID=$!

# 4. Start FastAPI backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd ..

# 5. Start Frontend
echo "Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "=========================================="
echo " Placify AI is running!"
echo " Frontend: http://localhost:3000"
echo " Backend:  http://localhost:8000"
echo " API Docs: http://localhost:8000/docs"
echo " Press Ctrl+C to stop all services."
echo "=========================================="
echo ""

wait
