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
echo "===== PREPARE REVIEW CANDIDATE ====="
python scripts/review_latest.py

echo
echo "===== UPDATE OPS STATUS ====="
python scripts/update_ops_status.py

echo
echo "===== DONE ====="
echo "Queue item processed and sent to review."
