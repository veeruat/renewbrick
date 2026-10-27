#!/usr/bin/env bash
# Starts the RenewBrick website (production server) in the background.
#
# Usage: ./start.sh [--port N] [--build] [--migrate]
#   --port N   port to listen on (overrides PORT)
#   --build    rebuild before starting (always happens if no build exists)
#   --migrate  apply db/schema.sql to DATABASE_URL before starting
#
# Configuration comes from the environment, or from .env.production / .env in
# this directory (never commit those files). Key settings:
#   PORT      port to listen on            (default 3000)
#   HOST      interface to bind            (default 127.0.0.1 — put nginx/a proxy in front;
#             use 0.0.0.0 to listen on all interfaces)
#
# Runtime files: .run/renewbrick.pid, .run/renewbrick.port and .run/renewbrick.log
set -euo pipefail

cd "$(dirname "$0")"
APP_DIR="$(pwd)"
RUN_DIR="$APP_DIR/.run"
PID_FILE="$RUN_DIR/renewbrick.pid"
PORT_FILE="$RUN_DIR/renewbrick.port"
LOG_FILE="$RUN_DIR/renewbrick.log"
mkdir -p "$RUN_DIR"

BUILD=false
MIGRATE=false
PORT_ARG=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --build) BUILD=true ;;
    --migrate) MIGRATE=true ;;
    --port) PORT_ARG="${2:?--port needs a value}"; shift ;;
    --port=*) PORT_ARG="${1#--port=}" ;;
    -h|--help) sed -n '2,17p' "$0"; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 64 ;;
  esac
  shift
done

# Load environment files (production first), without overriding variables already set.
for env_file in .env.production .env; do
  if [[ -f "$env_file" ]]; then
    while IFS='=' read -r key value; do
      [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]] && continue
      key="$(echo "$key" | xargs)"
      [[ -n "${!key:-}" ]] && continue
      value="${value%\"}"; value="${value#\"}"; value="${value%\'}"; value="${value#\'}"
      export "$key=$value"
    done < "$env_file"
  fi
done

export NODE_ENV=production
export PORT="${PORT_ARG:-${PORT:-3000}}"
# Next.js reads HOSTNAME; bash pre-sets HOSTNAME to the machine name, so take it from HOST.
export HOSTNAME="${HOST:-127.0.0.1}"

if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "RenewBrick is already running (PID $(cat "$PID_FILE")) on port $(cat "$PORT_FILE" 2>/dev/null || echo unknown). Run ./stop.sh first to restart."
  exit 0
fi
rm -f "$PID_FILE"

command -v node >/dev/null || { echo "Node.js is not installed (need >= 20.9)." >&2; exit 1; }

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies…"
  npm ci
fi

if $BUILD || [[ ! -f .next/standalone/server.js ]]; then
  echo "Building…"
  npm run build
fi

if $MIGRATE; then
  echo "Applying database schema…"
  npm run db:migrate
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Warning: DATABASE_URL is not set — the site will run, but enquiries cannot be saved." >&2
fi

echo "Starting RenewBrick on http://$HOSTNAME:$PORT …"
nohup node .next/standalone/server.js >>"$LOG_FILE" 2>&1 &
echo $! >"$PID_FILE"
echo "$PORT" >"$PORT_FILE"

# Wait for the server to answer.
for _ in $(seq 1 30); do
  if ! kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Server exited during startup. Last log lines:" >&2
    tail -n 20 "$LOG_FILE" >&2
    rm -f "$PID_FILE"
    exit 1
  fi
  if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/" 2>/dev/null; then
    echo "RenewBrick is up (PID $(cat "$PID_FILE")). Logs: $LOG_FILE"
    exit 0
  fi
  sleep 1
done

echo "Server did not respond on port $PORT within 30s; stopping it. Last log lines:" >&2
tail -n 20 "$LOG_FILE" >&2
"$APP_DIR/stop.sh" >/dev/null 2>&1 || true
exit 1
