#!/usr/bin/env bash
set -e

echo "=== Starting Placify AI Stack ==="

# Trap Ctrl+C (SIGINT) and cleanup child processes
trap 'echo "Stopping all processes..."; kill $(jobs -p) 2>/dev/null; exit 0' SIGINT SIGTERM EXIT

# 0. Clean up any stale instances on ports 8000 and 3000
echo "Ensuring ports 8000 and 3000 are available..."
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
sleep 1

# 1. Local Database & Environment Check
echo "Initializing local database & environment..."
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "$ROOT_DIR/.venv" ]; then
  source "$ROOT_DIR/.venv/bin/activate"
elif [ -d "$ROOT_DIR/backend/.venv" ]; then
  source "$ROOT_DIR/backend/.venv/bin/activate"
fi

cd "$ROOT_DIR/backend"
PYTHONPATH=. python3 -m app.seed 2>/dev/null || echo "Database checked."

# 3. Start FastAPI backend
echo "Starting Backend (FastAPI on port 8000)..."
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd "$ROOT_DIR"

# 4. Start Frontend
echo "Starting Frontend (Vite on port 3000)..."
cd "$ROOT_DIR/frontend"
pnpm run dev &
FRONTEND_PID=$!

cd "$ROOT_DIR"

# 5. Verify process loading status
echo ""
echo "=== Checking Service Health & Load Status ==="
sleep 2

# Check Backend
if kill -0 $BACKEND_PID 2>/dev/null; then
  echo " [LOADED]  Backend API Server   (PID: $BACKEND_PID) -> http://localhost:8000"
else
  echo " [EXITED]  Backend API Server   (PID: $BACKEND_PID) FAILED TO LOAD"
fi

# Check Frontend
if kill -0 $FRONTEND_PID 2>/dev/null; then
  echo " [LOADED]  Frontend Vite Server (PID: $FRONTEND_PID) -> http://localhost:3000"
else
  echo " [EXITED]  Frontend Vite Server (PID: $FRONTEND_PID) FAILED TO LOAD"
fi

# Check Docker containers if any exist
DOCKER_COUNT=$(docker compose ps -q 2>/dev/null | wc -l || echo "0")
if [ "$DOCKER_COUNT" -gt 0 ]; then
  echo ""
  echo "Docker Containers Status:"
  docker compose ps --format "table {{.Service}}\t{{.State}}\t{{.Status}}"
fi

echo ""
echo "========================================================"
echo " Placify AI Stack Live Status"
echo " Frontend:  http://localhost:3000"
echo " Backend:   http://localhost:8000"
echo " API Docs:  http://localhost:8000/docs"
echo " Database:  Local SQLite (backend/data/placify.db)"
echo " Press Ctrl+C to terminate all loaded services."
echo "========================================================"
echo ""

wait
