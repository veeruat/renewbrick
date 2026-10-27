#!/usr/bin/env bash
# Starts the RenewBrick website in the background.
#
# The site is fully static (plain HTML/CSS/JS in out/). This script serves it
# with a small built-in Node server — handy on a VM or for local review. On a
# static host (Cloudflare Pages, Netlify) or nginx you do not need it at all.
#
# Usage: ./start.sh [--port N] [--build]
#   --port N   port to listen on (overrides PORT; default 3000)
#   --build    rebuild the site first (always happens if out/ is missing)
#
# Settings: PORT, HOST (default 127.0.0.1; 0.0.0.0 to listen on all interfaces),
# and SITE_URL / SITE_INDEXING for builds. They may also be placed in
# .env.production or .env beside this script (never commit those files).
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
PORT_ARG=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --build) BUILD=true ;;
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

export PORT="${PORT_ARG:-${PORT:-3000}}"
export HOST="${HOST:-127.0.0.1}"

if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "RenewBrick is already running (PID $(cat "$PID_FILE")) on port $(cat "$PORT_FILE" 2>/dev/null || echo unknown). Run ./stop.sh first to restart."
  exit 0
fi
rm -f "$PID_FILE" "$PORT_FILE"

command -v node >/dev/null || { echo "Node.js is not installed (need >= 20.9)." >&2; exit 1; }

if $BUILD || [[ ! -f out/index.html ]]; then
  [[ -d node_modules ]] || { echo "Installing dependencies…"; npm ci; }
  echo "Building…"
  npm run build
fi

echo "Starting RenewBrick on http://$HOST:$PORT …"
nohup node scripts/serve-static.mjs out >>"$LOG_FILE" 2>&1 &
echo $! >"$PID_FILE"
echo "$PORT" >"$PORT_FILE"

# Wait for the server to answer.
for _ in $(seq 1 15); do
  if ! kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Server exited during startup. Last log lines:" >&2
    tail -n 20 "$LOG_FILE" >&2
    rm -f "$PID_FILE" "$PORT_FILE"
    exit 1
  fi
  if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/" 2>/dev/null; then
    echo "RenewBrick is up (PID $(cat "$PID_FILE")). Logs: $LOG_FILE"
    exit 0
  fi
  sleep 1
done

echo "Server did not respond on port $PORT within 15s; stopping it. Last log lines:" >&2
tail -n 20 "$LOG_FILE" >&2
"$APP_DIR/stop.sh" >/dev/null 2>&1 || true
exit 1
