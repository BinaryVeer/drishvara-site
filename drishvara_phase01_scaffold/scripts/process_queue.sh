#!/usr/bin/env bash
set -e

ROOT="/Users/vikashvaibhav/Documents/drishvara-site/drishvara_phase01_scaffold"

echo "===== READY CHECK ====="
cd "$ROOT"
./scripts/ready.sh

echo
echo "===== RUN NEXT TOPIC ====="
./scripts/run_next_topic.sh

echo
echo "===== SAVE RUN ====="
./scripts/save_run.sh

echo
echo "===== DONE ====="
echo "Queue item processed and saved."
