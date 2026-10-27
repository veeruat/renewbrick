#!/usr/bin/env bash
# Stops the RenewBrick website started by ./start.sh.
# Sends SIGTERM and waits up to 15 seconds for a clean shutdown, then SIGKILL.
set -euo pipefail

cd "$(dirname "$0")"
PID_FILE=".run/renewbrick.pid"
PORT_FILE=".run/renewbrick.port"

if [[ ! -f "$PID_FILE" ]]; then
  echo "RenewBrick is not running (no PID file)."
  exit 0
fi

PID="$(cat "$PID_FILE")"
if ! kill -0 "$PID" 2>/dev/null; then
  echo "RenewBrick is not running (stale PID $PID). Cleaning up."
  rm -f "$PID_FILE" "$PORT_FILE"
  exit 0
fi

echo "Stopping RenewBrick (PID $PID)…"
# Git Bash on Windows: the PID is an MSYS wrapper and signals do not reach the
# native node.exe, so stop the Windows process tree instead.
if [[ -r "/proc/$PID/winpid" ]] && command -v taskkill >/dev/null; then
  WINPID="$(cat "/proc/$PID/winpid")"
  taskkill //PID "$WINPID" //T //F >/dev/null 2>&1 || true
fi
kill -TERM "$PID" 2>/dev/null || true
for _ in $(seq 1 15); do
  if ! kill -0 "$PID" 2>/dev/null; then
    rm -f "$PID_FILE" "$PORT_FILE"
    echo "Stopped."
    exit 0
  fi
  sleep 1
done

echo "Did not stop within 15s; forcing." >&2
kill -KILL "$PID" 2>/dev/null || true
rm -f "$PID_FILE" "$PORT_FILE"
echo "Stopped (forced)."
