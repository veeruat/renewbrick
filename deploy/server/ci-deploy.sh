#!/usr/bin/env bash
# Server side of the GitHub Actions deploy (.github/workflows/deploy.yml), started by
# ~/bin/renewbrick-ci-deploy (deploy/server/ci-launcher.sh) from the bundle of the commit being deployed.
#
#   ci-deploy.sh <sha> <release tag> <bundle dir>
#     1. puts the bundle's deploy files in ~/renewbrick (.env is never touched)
#     2. pulls ghcr.io/veeruat/renewbrick-contact:<sha> (the enquiry form, built by the job)
#     3. adds the built site as releases/<tag>, switches to it and starts the form service
#     4. checks the site and the form through the edge; on failure the previous release and form come back
set -euo pipefail

SHA="$1"; TAG="$2"; BUNDLE="$3"
DIR="$HOME/renewbrick"
LOG_DIR="$HOME/deploy-logs"
CONTACT_IMAGE=ghcr.io/veeruat/renewbrick-contact
umask 022   # nginx in the container reads the release files
mkdir -p "$LOG_DIR" "$DIR/releases"
LOG="$LOG_DIR/$(date -u +%Y%m%dT%H%M%SZ)_renewbrick_${SHA:0:7}.log"
exec > >(tee -a "$LOG") 2>&1

exec 9>/tmp/renewbrick-ci.lock
flock -n 9 || { echo "[rb] another deploy is running - try again later"; exit 3; }
echo "[rb] deploy ${SHA:0:7} as $TAG at $(date -u +%FT%TZ)"
[ -f "$DIR/.env" ] || { echo "[rb] $DIR/.env is missing - create it from env.example first"; exit 5; }
[ -f "$BUNDLE/site/index.html" ] && [ -f "$BUNDLE/site/_nginx_headers.conf" ] || { echo "[rb] bundle has no built site"; exit 4; }

set_env() {
  local key="$1" value="$2" tmp
  tmp="$(mktemp)"
  awk -v k="$key" -v l="$key=$value" 'index($0, k "=") == 1 { if (!d) print l; d = 1; next } { print } END { if (!d) print l }' "$DIR/.env" > "$tmp"
  cat "$tmp" > "$DIR/.env"; rm -f "$tmp"
}

echo "[rb] 1/4 deploy files"
nginx_before="$(cat "$DIR"/nginx/* 2>/dev/null | sha256sum)"
tar -C "$BUNDLE/deploy/server" -cf - docker-compose.yml renewbrick.sh env.example nginx | tar -C "$DIR" -xf -
chmod +x "$DIR/renewbrick.sh"

echo "[rb] 2/4 enquiry form image"
docker pull -q "$CONTACT_IMAGE:$SHA" >/dev/null ||
  { echo "[rb] $CONTACT_IMAGE:$SHA not found (is the server logged in to ghcr.io?)"; exit 9; }

echo "[rb] 3/4 go live"
PREV_RELEASE="$(readlink "$DIR/releases/current" 2>/dev/null || true)"
PREV_CONTACT="$(sed -n 's/^CONTACT_TAG=//p' "$DIR/.env" | tail -n 1)"
rm -rf "${DIR:?}/releases/$TAG"
mv "$BUNDLE/site" "$DIR/releases/$TAG"
set_env CONTACT_IMAGE "$CONTACT_IMAGE"
set_env CONTACT_TAG "$SHA"

rollback() {
  echo "[rb] going back to ${PREV_RELEASE:-nothing} (form ${PREV_CONTACT:-local})"
  set_env CONTACT_TAG "${PREV_CONTACT:-local}"
  if [ -n "$PREV_RELEASE" ]; then "$DIR/renewbrick.sh" activate "$PREV_RELEASE" || true; fi
  "$DIR/renewbrick.sh" start || echo "[rb] restoring failed too - check ~/renewbrick/renewbrick.sh logs"
}

nginx_changed=0
[ "$(cat "$DIR"/nginx/* | sha256sum)" != "$nginx_before" ] && nginx_changed=1
go_live() {
  "$DIR/renewbrick.sh" activate "$TAG" && "$DIR/renewbrick.sh" start || return 1
  # A changed nginx template is only read by a new container.
  if [ "$nginx_changed" = 1 ]; then "$DIR/renewbrick.sh" recreate-proxy; fi
}
if ! go_live; then
  rollback
  exit 7
fi

echo "[rb] 4/4 checks through the edge"
ok=1
for i in $(seq 1 20); do
  [ "$(docker inspect -f '{{.State.Health.Status}}' renewbrick-contact-1 2>/dev/null)" = "healthy" ] && break
  sleep 3
done
site="$(curl -sk -o /dev/null -w '%{http_code}' --max-time 15 --resolve renewbrick.com:443:127.0.0.1 https://renewbrick.com/ || true)"
# A filled hidden field: the form answers as if sent, and sends nothing.
form="$(curl -sk -o /dev/null -w '%{http_code}' --max-time 15 --resolve renewbrick.com:443:127.0.0.1 -X POST \
  -H 'Content-Type: application/json' -H 'Origin: https://renewbrick.com' -d '{"website":"deploy-check"}' \
  https://renewbrick.com/api/contact || true)"
echo "  site -> $site, form -> $form, form container -> $(docker inspect -f '{{.State.Health.Status}}' renewbrick-contact-1 2>/dev/null)"
[ "$site" = 200 ] && [ "$form" = 200 ] || ok=0
if [ "$ok" != 1 ]; then
  rollback
  exit 8
fi

# Keep the three newest form images (the live one is never removed).
docker image ls "$CONTACT_IMAGE" --format '{{.CreatedAt}}\t{{.Repository}}:{{.Tag}}' | sort -r | tail -n +4 | cut -f2 |
  while read -r img; do [ "$img" = "$CONTACT_IMAGE:$SHA" ] || docker image rm "$img" >/dev/null 2>&1 || true; done
echo "[rb] deployed $TAG - log: $LOG"
