#!/usr/bin/env bash
# Build RenewBrick from a commit, copy it to the shared server, make it live. Run from the repo root
# in Git Bash:
#
#   RB_SERVER=ubuntu@13.201.211.121 deploy/server/ship.sh              build HEAD, upload, activate
#   RB_SERVER=... deploy/server/ship.sh --ref <commit|branch>           another commit
#   RB_SERVER=... deploy/server/ship.sh --files-only                    only refresh the server's deploy files
#   SITE_INDEXING=true RB_SERVER=... deploy/server/ship.sh               launch build (search engines allowed)
#
# It builds from a clean checkout of the commit (never from your working folder), so the server gets
# exactly what Git has, like the GitHub Actions deploy. Indexing stays off unless SITE_INDEXING=true.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SERVER="${RB_SERVER:?Set RB_SERVER, e.g. RB_SERVER=ubuntu@13.201.211.121}"
KEY="${RB_SSH_KEY:-$HOME/.ssh/sshkey.pem}"
REMOTE_DIR="${RB_REMOTE_DIR:-renewbrick}"
SITE_URL="${SITE_URL:-https://renewbrick.com}"
SSH=(ssh -i "$KEY" -o IdentitiesOnly=yes "$SERVER")
REF=HEAD

upload_files() {
  echo "Uploading deploy files to $SERVER:~/$REMOTE_DIR ..."
  tar -C "$ROOT/deploy/server" -czf - docker-compose.yml renewbrick.sh env.example nginx |
    "${SSH[@]}" "mkdir -p ~/$REMOTE_DIR/releases && tar -xzf - -C ~/$REMOTE_DIR && chmod +x ~/$REMOTE_DIR/renewbrick.sh"
}

case "${1:-}" in
  --files-only) upload_files; exit 0 ;;
  --ref) REF="${2:?--ref needs a commit or branch}" ;;
  "") ;;
  *) echo "Usage: $0 [--ref <commit>|--files-only]" >&2; exit 1 ;;
esac

cd "$ROOT"
SHA="$(git rev-parse --short "$REF^{commit}")"
TAG="$(date +%Y%m%d-%H%M)-$SHA"
[ "${SITE_INDEXING:-false}" = "true" ] && TAG="$TAG-indexed"

WORK="$(mktemp -d)"
cleanup() { git -C "$ROOT" worktree remove --force "$WORK/src" >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT

echo "Building $SHA as $TAG (SITE_URL=$SITE_URL, indexing ${SITE_INDEXING:-false}) ..."
git worktree add --detach "$WORK/src" "$SHA" >/dev/null
(
  cd "$WORK/src"
  npm ci --no-audit --no-fund --loglevel=error
  SITE_URL="$SITE_URL" SITE_INDEXING="${SITE_INDEXING:-false}" npm run build
  # The unit tests include the URL rules every exported page must satisfy.
  npm test
)

OUT="$WORK/src/out"
bash "$ROOT/deploy/server/nginx-headers.sh" "$OUT"

upload_files
echo "Uploading the site ($(du -sh "$OUT" | cut -f1)) ..."
tar -C "$OUT" -czf - . | "${SSH[@]}" "mkdir -p ~/$REMOTE_DIR/releases/$TAG && tar -xzf - -C ~/$REMOTE_DIR/releases/$TAG"
# The enquiry form's build context, from the same commit (the server builds the small image itself).
tar -C "$WORK/src" -czf - deploy/server/contact/Dockerfile deploy/server/contact/package.json \
  deploy/server/contact/package-lock.json deploy/server/contact/server.mjs deploy/server/contact/mail.mjs \
  infra/aws/renewbrick-site.yaml scripts/lib/contact-function.mjs |
  "${SSH[@]}" "rm -rf ~/$REMOTE_DIR/contact-src && mkdir -p ~/$REMOTE_DIR/contact-src && tar -xzf - -C ~/$REMOTE_DIR/contact-src"
"${SSH[@]}" "test -f ~/$REMOTE_DIR/.env" || {
  echo "Release uploaded. First time: create ~/$REMOTE_DIR/.env from env.example, then run"
  echo "  ~/$REMOTE_DIR/renewbrick.sh activate $TAG && ~/$REMOTE_DIR/renewbrick.sh start"
  exit 0
}
# activate swaps the site; start then rebuilds the form service if its code changed (else a no-op).
"${SSH[@]}" "~/$REMOTE_DIR/renewbrick.sh activate $TAG && RB_BUILD_CONTACT=1 ~/$REMOTE_DIR/renewbrick.sh start"
echo "Shipped $TAG."
