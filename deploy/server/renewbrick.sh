#!/usr/bin/env bash
# RenewBrick on the shared server - one script for the whole lifecycle. Run from anywhere, e.g.
# ~/renewbrick/renewbrick.sh status
#
#   ./renewbrick.sh start             start nginx, the enquiry form and acme (rebuilds the form if its code
#                                     changed; a temporary self-signed certificate until `cert`)
#   ./renewbrick.sh stop | status | logs [service]
#   ./renewbrick.sh activate <tag>    switch the site to releases/<tag> (uploaded by ship.sh); keeps the last 5
#   ./renewbrick.sh rollback [tag]    switch back to the previous release (or <tag>)
#   ./renewbrick.sh releases          list releases, marking the live one
#   ./renewbrick.sh cert              get the Let's Encrypt certificate - only once renewbrick.com and www
#                                     point at this server (it checks), i.e. right after the DNS switch
#   ./renewbrick.sh reload-proxy      pick up a renewed certificate (weekly cron, see README.md)
#   ./renewbrick.sh recreate-proxy    start a new nginx so it reads a changed template
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$DIR/.env"
REL="$DIR/releases"
KEEP=5
DOMAINS=(renewbrick.com www.renewbrick.com)
[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE - cp env.example .env and fill it in first." >&2; exit 1; }
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

compose() { docker compose --env-file "$ENV_FILE" -f "$DIR/docker-compose.yml" "$@"; }

ensure_network() {
  # The edge (grace-edge repo) owns this network; whichever starts first creates it.
  docker network inspect edge >/dev/null 2>&1 || docker network create edge >/dev/null
}

running() { [ -n "$(compose ps -q --status running proxy 2>/dev/null)" ]; }

live_tag() { readlink "$REL/current" 2>/dev/null || true; }

ensure_cert() {
  # nginx can't start without a certificate. Until `cert` runs, a self-signed one stands in: nobody
  # reaches it, because DNS still points elsewhere.
  if ! compose run --rm --no-deps --entrypoint sh acme -c "test -s /nginx-certs/fullchain.pem" >/dev/null 2>&1; then
    echo "No certificate yet: creating a temporary self-signed one (renewbrick.sh cert replaces it after the DNS switch)."
    compose run --rm --no-deps --entrypoint sh acme -c \
      "openssl req -x509 -newkey rsa:2048 -nodes -days 30 -subj /CN=renewbrick.com -keyout /nginx-certs/privkey.pem -out /nginx-certs/fullchain.pem 2>/dev/null"
  fi
}

reload() { compose exec -T proxy sh -c "nginx -t -q && nginx -s reload"; }

start() {
  ensure_network
  [ -n "$(live_tag)" ] || { echo "No release yet - run ship.sh from your machine first." >&2; exit 1; }
  ensure_cert
  # ship.sh (manual fallback) sets RB_BUILD_CONTACT=1: build its commit's form here, whatever .env says.
  [ "${RB_BUILD_CONTACT:-0}" = "1" ] && export CONTACT_TAG=local
  if [ -n "${CONTACT_TAG:-}" ] && [ "$CONTACT_TAG" != "local" ]; then
    # The deploy job's image (ci-deploy.sh pulled it): never build here.
    compose up -d --no-build --pull never --remove-orphans
  else
    [ -f "$DIR/contact-src/deploy/server/contact/Dockerfile" ] || { echo "No contact-src/ - run ship.sh from your machine." >&2; exit 1; }
    # --build: the enquiry form image is rebuilt when contact-src/ changed (cached otherwise).
    compose up -d --build --remove-orphans
  fi
  sleep 1
  compose exec -T proxy nginx -t -q
  compose ps
}

activate() {
  local tag="$1" previous
  [ -f "$REL/$tag/index.html" ] && [ -f "$REL/$tag/_nginx_headers.conf" ] || { echo "releases/$tag isn't a complete release." >&2; exit 1; }
  previous="$(live_tag)"
  # Atomic swap: a request sees the old release or the new one, never a mix.
  ln -sfn "$tag" "$REL/current.new"
  mv -Tf "$REL/current.new" "$REL/current"
  if running; then
    if ! reload; then
      echo "nginx rejected releases/$tag - going back to ${previous:-nothing}." >&2
      [ -n "$previous" ] && ln -sfn "$previous" "$REL/current.new" && mv -Tf "$REL/current.new" "$REL/current"
      exit 1
    fi
  else
    start
  fi
  echo "Live: $tag (was ${previous:-none})"
  # Keep the newest $KEEP releases, and never the live one.
  find "$REL" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %f\n' | sort -rn | tail -n +$((KEEP + 1)) | cut -d' ' -f2 |
    while read -r old; do [ "$old" = "$tag" ] || rm -rf "${REL:?}/$old"; done
}

case "${1:-}" in
  start) start ;;
  stop) compose stop ;;
  status)
    echo "Live release: $(live_tag)"
    compose ps
    ;;
  logs)
    if [ -n "${2:-}" ]; then compose logs --tail=200 "$2"; else compose logs --tail=100; fi
    ;;
  activate) activate "${2:?Usage: $0 activate <tag>}" ;;
  rollback)
    target="${2:-$(find "$REL" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %f\n' | sort -rn | cut -d' ' -f2 | grep -vx "$(live_tag)" | head -n 1)}"
    [ -n "$target" ] || { echo "No earlier release to roll back to." >&2; exit 1; }
    activate "$target"
    ;;
  releases)
    find "$REL" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %f\n' | sort -rn | cut -d' ' -f2 |
      while read -r r; do if [ "$r" = "$(live_tag)" ]; then echo "* $r (live)"; else echo "  $r"; fi; done
    ;;
  cert)
    : "${CERT_EMAIL:?set CERT_EMAIL in .env}" "${SERVER_IP:?set SERVER_IP in .env}"
    for d in "${DOMAINS[@]}"; do
      ip="$(getent ahostsv4 "$d" | awk 'NR == 1 { print $1 }')"
      [ "$ip" = "$SERVER_IP" ] || { echo "$d resolves to ${ip:-nothing}, not $SERVER_IP: switch DNS first (README.md)." >&2; exit 1; }
    done
    running || start
    echo "Asking Let's Encrypt for ${DOMAINS[*]} (HTTP challenge through the edge's port 80)..."
    compose exec -T acme acme.sh --issue --webroot /webroot --server letsencrypt --accountemail "$CERT_EMAIL" \
      -d "${DOMAINS[0]}" -d "${DOMAINS[1]}" --keylength ec-256 || [ $? -eq 2 ]   # 2 = already issued and still valid
    compose exec -T acme acme.sh --install-cert -d "${DOMAINS[0]}" --ecc \
      --key-file /nginx-certs/privkey.pem --fullchain-file /nginx-certs/fullchain.pem
    reload
    sleep 2   # new connections go to the new workers once the old ones have handed over
    echo "Certificate installed:"
    echo | openssl s_client -connect 127.0.0.1:443 -servername "${DOMAINS[0]}" 2>/dev/null | openssl x509 -noout -subject -issuer -enddate
    ;;
  reload-proxy) reload ;;
  # nginx renders nginx/default.conf.template only when it starts, so a changed template needs a new
  # container (ci-deploy.sh does this when it changed).
  recreate-proxy) compose up -d --no-build --force-recreate --no-deps proxy ;;
  *)
    echo "Usage: $0 {start|stop|status|logs [service]|activate <tag>|rollback [tag]|releases|cert|reload-proxy|recreate-proxy}" >&2
    exit 1
    ;;
esac
