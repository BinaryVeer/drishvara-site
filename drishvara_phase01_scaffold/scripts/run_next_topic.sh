#!/usr/bin/env bash
set -e

ROOT="/Users/vikashvaibhav/Documents/drishvara-site/drishvara_phase01_scaffold"
PENDING="$ROOT/queue/pending"
PROCESSED="$ROOT/queue/processed"
FAILED="$ROOT/queue/failed"

NEXT_FILE=$(ls "$PENDING"/*.json 2>/dev/null | sort | head -n 1 || true)

if [ -z "$NEXT_FILE" ]; then
  echo "No pending topic files found."
  exit 0
fi

echo "===== NEXT TOPIC FILE ====="
echo "$NEXT_FILE"

cd "$ROOT"

if python scripts/run_profile.py production-full "$NEXT_FILE"; then
  mv "$NEXT_FILE" "$PROCESSED"/
  echo "Moved to processed."
else
  mv "$NEXT_FILE" "$FAILED"/
  echo "Moved to failed."
  exit 1
fi
