#!/usr/bin/env bash
set -e

BASE="core/tests/sample-inputs/evidence-pack"

echo "===== NORMAL PASS EVIDENCE ====="
node --env-file=.env scripts/dev-run.js --input "$BASE/normal-01-asset-management.json"
node --env-file=.env scripts/dev-run.js --input "$BASE/normal-02-grievance-redressal.json"

echo
echo "===== CONTROLLED CORRECTIVE EVIDENCE ====="
DRISHVARA_FORCE_INTEGRATOR_MISS_VISUAL_PLAN=1 \
node --env-file=.env scripts/dev-run.js --input "$BASE/corrective-02-visual.json"

DRISHVARA_FORCE_INTEGRATOR_MISS_VISUAL_PLAN=1 \
node --env-file=.env scripts/dev-run.js --input "$BASE/corrective-01-story.json"

echo
echo "===== LAST 6 RUNS ====="
tail -n 6 core/learning/run-ledger/runs.jsonl || true

echo
echo "===== LAST 12 CANDIDATE LESSONS ====="
tail -n 12 core/learning/lessons/candidate-lessons.jsonl || true

echo
echo "===== VALIDATED LESSONS ====="
cat core/learning/lessons/validated-lessons.jsonl || true
