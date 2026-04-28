#!/usr/bin/env bash
set -e

ROOT="/Users/vikashvaibhav/Documents/drishvara-site/drishvara_phase01_scaffold"

cd "$ROOT"

echo "===== REVIEW READY NOTICE ====="
if [ -f notifications/review_ready/latest_review_notice.txt ]; then
  cat notifications/review_ready/latest_review_notice.txt
else
  echo "(none)"
fi

echo
echo "===== FAILURE NOTICE ====="
if [ -f notifications/failures/latest_failure_notice.txt ]; then
  cat notifications/failures/latest_failure_notice.txt
else
  echo "(none)"
fi
