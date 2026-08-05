#!/usr/bin/env bash
# Stop and remove the Kanban container. The kanban-data volume is kept.
set -eo pipefail

CONTAINER=kanban

if [ -n "$(docker ps -aq --filter "name=^${CONTAINER}$")" ]; then
  docker rm -f "$CONTAINER" >/dev/null
  echo "Kanban stopped."
else
  echo "Kanban was not running."
fi
