#!/usr/bin/env bash
set -e

BASE="core/tests/sample-inputs/challenge-pack"

for file in \
  "$BASE/challenge-01-weak-brief.json" \
  "$BASE/challenge-02-compressed-scope.json" \
  "$BASE/challenge-03-visual-load.json"
do
  echo "===== RUNNING: $file ====="
  node --env-file=.env scripts/dev-run.js --input "$file"
  echo
done

echo "===== LAST 6 RUNS ====="
tail -n 6 core/learning/run-ledger/runs.jsonl || true

echo
echo "===== VALIDATED LESSONS ====="
cat core/learning/lessons/validated-lessons.jsonl || true

echo
echo "===== PROMPT POLICIES ====="
cat core/learning/policies/prompt-policies.json || true
