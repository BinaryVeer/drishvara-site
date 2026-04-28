#!/usr/bin/env bash
set -e

ROOT="/Users/vikashvaibhav/Documents/drishvara-site/drishvara_phase01_scaffold"

cd "$ROOT"

echo "===== OPS STATUS JSON ====="
cat ops/status.json

echo
echo "===== OPS REPORT MARKDOWN ====="
cat ops/report.md
