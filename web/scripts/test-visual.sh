#!/usr/bin/env bash
set -euo pipefail

VERSION=$(node -p "require('playwright/package.json').version")
NAME="cybersetor-playwright-$VERSION"
PORT=${PLAYWRIGHT_PORT:-3333}

if ! docker ps --format '{{.Names}}' | grep -qx "$NAME"; then
  docker run -d --rm --init --ipc=host --name "$NAME" -p "127.0.0.1:$PORT:$PORT" \
    "mcr.microsoft.com/playwright:v$VERSION-noble" \
    /bin/sh -c "npx -y playwright@$VERSION run-server --port $PORT --host 0.0.0.0" >/dev/null
fi

for _ in $(seq 1 120); do
  docker logs "$NAME" 2>&1 | grep -q 'Listening on' && break
  sleep 1
done
docker logs "$NAME" 2>&1 | grep -q 'Listening on' || {
  echo "O servidor do Playwright não respondeu; veja: docker logs $NAME" >&2
  exit 1
}

PLAYWRIGHT_WS_ENDPOINT="ws://127.0.0.1:$PORT/" exec pnpm exec vitest run --project visual --update=none "$@"
