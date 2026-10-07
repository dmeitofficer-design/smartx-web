#!/usr/bin/env bash
# Deploy on the WHM server (run as root, same flow as dme-cms):
#   cd /home/<cpanel-user>/repositories/smartx-web && ./deploy.sh
set -euo pipefail

cd "$(dirname "$0")"
APP_DIR="$(pwd)"
APP_NAME="smartx-web"
# The cPanel account that owns the repo folder — git runs as that user
CPANEL_USER="$(stat -c %U "$APP_DIR")"

git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true

echo "→ Pulling latest code as $CPANEL_USER"
sudo -u "$CPANEL_USER" git pull origin main

echo "→ Installing dependencies"
npm install

echo "→ Building"
rm -rf .next
npm run build

echo "→ Restarting PM2 ($APP_NAME)"
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
else
  pm2 start ecosystem.config.cjs
fi
pm2 save

echo "✓ Deployed"
