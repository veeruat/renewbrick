#!/usr/bin/env bash
# out/_headers ("/*" block) -> nginx add_header lines, so the server sends exactly what the build says
# (CSP, HSTS, and X-Robots-Tag: noindex unless SITE_INDEXING=true). Used by ship.sh and the deploy job.
#   deploy/server/nginx-headers.sh out      writes out/_nginx_headers.conf
set -euo pipefail
OUT="${1:?usage: $0 <out dir>}"
awk '
  /^[^ ]/ { block = $0; next }
  block == "/*" && /^  [A-Za-z-]+: / {
    line = substr($0, 3); i = index(line, ": ")
    printf "add_header %s \"%s\" always;\n", substr(line, 1, i - 1), substr(line, i + 2)
  }' "$OUT/_headers" > "$OUT/_nginx_headers.conf"
grep -q "Content-Security-Policy" "$OUT/_nginx_headers.conf" || { echo "No headers found in $OUT/_headers" >&2; exit 1; }
