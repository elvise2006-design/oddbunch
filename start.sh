#!/usr/bin/env bash
#
# Seedling & Vine — start the frontend and backend together.
#
#   ./start.sh          run both (Ctrl-C stops both)
#   ./start.sh setup    install frontend deps + create the venv + seed the DB
#   ./start.sh backend  run only the FastAPI server
#   ./start.sh frontend run only the Vite dev server
#   ./start.sh seed     reset + reseed the database
#
# Ports come from .env files:
#   backend/.env   PORT (default 8000), HOST, DATABASE_URL, CORS_ORIGINS
#   frontend/.env  VITE_PORT (default 5173), VITE_API_BASE_URL

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# Load requested PORT / HOST from backend/.env without requiring extra tooling.
REQUESTED_PORT="$(grep -E '^PORT=' "$BACKEND/.env" 2>/dev/null | cut -d= -f2 || true)"
REQUESTED_PORT="${REQUESTED_PORT:-8000}"
BACKEND_HOST="$(grep -E '^HOST=' "$BACKEND/.env" 2>/dev/null | cut -d= -f2 || true)"
BACKEND_HOST="${BACKEND_HOST:-127.0.0.1}"
REQUESTED_FRONTEND_PORT="$(grep -E '^VITE_PORT=' "$FRONTEND/.env" 2>/dev/null | cut -d= -f2 || true)"
REQUESTED_FRONTEND_PORT="${REQUESTED_FRONTEND_PORT:-5173}"

# macOS/Linux listener check — used to move off a port another app already owns.
port_in_use() { lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; }

next_free_port() {
  local port="$1" tries=0
  while [ "$tries" -lt 25 ]; do
    if ! port_in_use "$port"; then printf '%s' "$port"; return 0; fi
    port=$((port + 1))
    tries=$((tries + 1))
  done
  return 1
}

BACKEND_PORT="$(next_free_port "$REQUESTED_PORT")" || BACKEND_PORT="$REQUESTED_PORT"
FRONTEND_PORT="$(next_free_port "$REQUESTED_FRONTEND_PORT")" || FRONTEND_PORT="$REQUESTED_FRONTEND_PORT"

# Keep the frontend pointing at whatever port the backend actually got.
ENV_API_BASE="$(grep -E '^VITE_API_BASE_URL=' "$FRONTEND/.env" 2>/dev/null | cut -d= -f2- || true)"
CHOSEN_API_BASE="http://127.0.0.1:$BACKEND_PORT/api"
if [ -z "$ENV_API_BASE" ] || [ "$ENV_API_BASE" != "$CHOSEN_API_BASE" ]; then
  export VITE_API_BASE_URL="$CHOSEN_API_BASE"
fi
export VITE_PORT="$FRONTEND_PORT"

# Prefer a user-installed Node; fall back to the local install we created.
if ! command -v node >/dev/null 2>&1 && [ -x "$HOME/.local/node/bin/node" ]; then
  export PATH="$HOME/.local/node/bin:$PATH"
fi

c_green() { printf '\033[0;32m%s\033[0m\n' "$1"; }
c_dim()   { printf '\033[0;90m%s\033[0m\n' "$1"; }
c_bold()  { printf '\033[1m%s\033[0m\n' "$1"; }

setup() {
  c_bold "▸ Setting up the backend"
  if [ ! -d "$BACKEND/.venv" ]; then
    if command -v uv >/dev/null 2>&1; then
      uv venv --python 3.13 "$BACKEND/.venv"
    else
      python3 -m venv "$BACKEND/.venv"
    fi
  fi
  "$BACKEND/.venv/bin/python" -m pip install --quiet --upgrade pip
  "$BACKEND/.venv/bin/python" -m pip install --quiet -r "$BACKEND/requirements.txt"
  c_dim "  dependencies installed"

  c_bold "▸ Creating the database + seed data"
  (cd "$BACKEND" && "$BACKEND/.venv/bin/python" -m app.seed --reset)

  c_bold "▸ Setting up the frontend"
  (cd "$FRONTEND" && npm install)
  c_dim "  dependencies installed"
}

run_backend() {
  c_green "▸ Backend  → http://localhost:$BACKEND_PORT"
  c_dim "  API docs → http://localhost:$BACKEND_PORT/docs"
  cd "$BACKEND"
  exec "$BACKEND/.venv/bin/python" -m uvicorn app.main:app \
    --host "$BACKEND_HOST" --port "$BACKEND_PORT" --reload
}

run_frontend() {
  c_green "▸ Frontend → http://localhost:$FRONTEND_PORT"
  c_dim "  API      → $CHOSEN_API_BASE"
  cd "$FRONTEND"
  exec npm run dev
}

announce_ports() {
  if [ "$BACKEND_PORT" != "$REQUESTED_PORT" ] || [ "$FRONTEND_PORT" != "$REQUESTED_FRONTEND_PORT" ]; then
    c_dim "  Note: ports $REQUESTED_PORT/$REQUESTED_FRONTEND_PORT were already in use,"
    c_dim "        so this run shifted to $BACKEND_PORT/$FRONTEND_PORT."
    c_dim "        Set PORT in backend/.env and VITE_PORT in frontend/.env to pin them."
  fi
}

case "${1:-run}" in
  setup)
    setup
    echo
    c_green "Setup complete. Run ./start.sh to start both servers."
    ;;

  seed)
    cd "$BACKEND" && "$BACKEND/.venv/bin/python" -m app.seed "${2:-}"
    ;;

  backend)
    run_backend
    ;;

  frontend)
    run_frontend
    ;;

  run)
    if [ ! -d "$BACKEND/.venv" ] || [ ! -d "$FRONTEND/node_modules" ]; then
      echo "Dependencies missing — running setup first."
      echo
      setup
      echo
    fi

    # `concurrently` (via npx) keeps both processes in one terminal and shares Ctrl-C.
    if [ ! -d "$FRONTEND/node_modules/concurrently" ]; then
      (cd "$FRONTEND" && npm install --silent --no-save concurrently)
    fi

    c_bold "  Seedling & Vine"
    echo
    c_green "  Frontend → http://localhost:$FRONTEND_PORT"
    c_green "  Backend  → http://localhost:$BACKEND_PORT   (API docs: /docs)"
    c_dim "  API base → $CHOSEN_API_BASE"
    echo
    announce_ports
    echo

    # Foreground exec: Ctrl-C lands in this process group, so both children
    # receive it and shut down together (no `kill 0` needed).
    # `cd $BACKEND` first so uvicorn's reloader watches the backend sources,
    # not whatever directory start.sh was invoked from.
    cd "$FRONTEND"
    exec npx concurrently --names "frontend,backend" --prefix-colors "green,magenta" \
      --kill-others-on-fail \
      "npm run dev" \
      "cd $BACKEND && $BACKEND/.venv/bin/python -m uvicorn app.main:app --host $BACKEND_HOST --port $BACKEND_PORT --reload"
    ;;

  *)
    echo "Usage: ./start.sh [setup|run|backend|frontend|seed|--reset]"
    exit 1
    ;;
esac
