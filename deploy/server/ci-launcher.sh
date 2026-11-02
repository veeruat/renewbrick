#!/usr/bin/env bash
# Installed once on the server as ~/bin/renewbrick-ci-deploy and set as the forced command of this
# repo's GitHub Actions SSH key in ~/.ssh/authorized_keys (its own key, not another app's):
#
#   command="/home/ubuntu/bin/renewbrick-ci-deploy",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty,no-user-rc ssh-ed25519 AAAA... renewbrick-github-actions
#
# Accepts only "deploy <40-char sha> <release tag>", with a .tar.gz on stdin holding the built site
# (site/) and this commit's deploy/server files (sent by .github/workflows/deploy.yml). It unpacks
# them and runs deploy/server/ci-deploy.sh from that bundle. The key gives no shell, file access or
# port forwarding, but it does run the bundle's scripts, so treat it like write access to the repo.
# Keep this file tiny and stable: changing it means reinstalling it by hand.
set -euo pipefail
read -r MODE SHA TAG EXTRA <<< "${SSH_ORIGINAL_COMMAND:-}"
if [[ "$MODE" != deploy || ! "$SHA" =~ ^[0-9a-f]{40}$ || ! "$TAG" =~ ^[0-9]{8}-[0-9]{4}-[0-9a-f]{7}(-indexed)?$ || -n "${EXTRA:-}" ]]; then
  echo "usage: deploy <40-char sha> <YYYYMMDD-HHMM-sha7[-indexed]>   (bundle as .tar.gz on stdin)" >&2
  exit 2
fi
work="$(mktemp -d "$HOME/.renewbrick-ci.XXXXXX")"
trap 'rm -rf "$work"' EXIT
head -c 50000000 | tar -xzf - -C "$work"
[ -f "$work/deploy/server/ci-deploy.sh" ] || { echo "bundle has no deploy/server/ci-deploy.sh" >&2; exit 4; }
bash "$work/deploy/server/ci-deploy.sh" "$SHA" "$TAG" "$work"
