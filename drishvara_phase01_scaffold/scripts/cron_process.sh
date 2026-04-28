#!/usr/bin/env bash
set -e

ROOT="/Users/vikashvaibhav/Documents/drishvara-site/drishvara_phase01_scaffold"
LOG_DIR="$ROOT/content/logs"
STAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="$LOG_DIR/scheduled_process_$STAMP.log"

mkdir -p "$LOG_DIR"

cd "$ROOT"

{
  echo "===== CRON RUN START ====="
  date
  ./scripts/scheduled_process.sh
  echo
  echo "===== REFRESH OPS STATUS + REPORT ====="
  python scripts/update_ops_status.py
  python scripts/render_ops_report.py
  echo
  echo "===== CRON RUN END ====="
  date
} >> "$LOG_FILE" 2>&1

echo "Wrote log: $LOG_FILE"
