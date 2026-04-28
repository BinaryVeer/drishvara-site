#!/usr/bin/env bash
set -e

ROOT="/Users/vikashvaibhav/Documents/drishvara-site/drishvara_phase01_scaffold"

echo "===== SCHEDULED READY CHECK ====="
cd "$ROOT"
./scripts/ready.sh

echo
echo "===== SCHEDULED QUEUE PROCESS ====="
./scripts/process_queue.sh

echo
echo "===== SCHEDULED RUN COMPLETE ====="
echo "If a topic was processed successfully, review candidate files are now available under ./review/"
