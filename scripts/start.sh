#!/usr/bin/env bash
# Build and run the Kanban app. Mac and Linux.
set -eo pipefail

IMAGE=kanban
CONTAINER=kanban
VOLUME=kanban-data
PORT=8000
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

docker build --target runtime -t "$IMAGE" "$ROOT"
docker rm -f "$CONTAINER" >/dev/null 2>&1 || true

ENV_ARGS=()
if [ -f "$ROOT/.env" ]; then
  ENV_ARGS=(--env-file "$ROOT/.env")
fi

docker run -d \
  --name "$CONTAINER" \
  -p "$PORT:8000" \
  -v "$VOLUME:/data" \
  "${ENV_ARGS[@]}" \
  "$IMAGE" >/dev/null

echo "Kanban running at http://localhost:$PORT"
echo "Stop it with scripts/stop.sh"
