#!/usr/bin/env bash
# Build Hugo site and rsync to the Debian server on Digital Ocean.
#
# Configure via environment (commit-safe) or a local .env file (gitignored):
#   DEPLOY_HOST        e.g. user@123.45.67.89  (or an ssh-config alias)
#   DEPLOY_PATH        e.g. /var/www/owneroperators
#   DEPLOY_BASE_URL    e.g. https://owneroperators.online/   (optional; overrides hugo.toml)

set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$here"

# Load .env if present (simple KEY=VALUE lines).
if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  set -a; source .env; set +a
fi

: "${DEPLOY_HOST:?set DEPLOY_HOST (e.g. user@host) in env or .env}"
: "${DEPLOY_PATH:?set DEPLOY_PATH (e.g. /var/www/owneroperators) in env or .env}"

hugo_args=(--minify --cleanDestinationDir)
if [[ -n "${DEPLOY_BASE_URL:-}" ]]; then
  hugo_args+=(--baseURL "$DEPLOY_BASE_URL")
fi

echo "[deploy] building..."
rm -rf public
hugo "${hugo_args[@]}"

echo "[deploy] rsyncing public/ -> ${DEPLOY_HOST}:${DEPLOY_PATH}"
rsync -avz --delete \
  --exclude=".DS_Store" \
  public/ "${DEPLOY_HOST}:${DEPLOY_PATH}/"

echo "[deploy] done."
