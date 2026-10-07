#!/usr/bin/env bash
# Pull the latest code, rebuild and reload — run on the VPS from the project folder:
#   ./deploy.sh
set -euo pipefail

cd "$(dirname "$0")"

echo "→ Pulling latest code"
git pull --ff-only

echo "→ Installing dependencies"
npm ci

echo "→ Building"
npm run build

echo "→ Reloading PM2"
if pm2 describe smartx-web > /dev/null 2>&1; then
  pm2 reload smartx-web --update-env
else
  pm2 start ecosystem.config.cjs
fi
pm2 save

echo "✓ Deployed"
