#!/usr/bin/env bash
set -e

REPO_ROOT="/Users/vikashvaibhav/Documents/drishvara-site"
SCAFFOLD_ROOT="$REPO_ROOT/drishvara_phase01_scaffold"

echo "===== READY CHECK ====="
cd "$SCAFFOLD_ROOT"
./scripts/ready.sh

echo
echo "===== PUBLISH LATEST ====="
python scripts/publish_latest.py

echo
echo "===== COMMIT + PUSH ====="
cd "$REPO_ROOT"

git add \
  drishvara_phase01_scaffold/published \
  drishvara_phase01_scaffold/core/learning/lessons/candidate-lessons.jsonl \
  drishvara_phase01_scaffold/core/learning/lessons/validated-lessons.jsonl \
  drishvara_phase01_scaffold/core/learning/playbooks/topic-playbooks.json \
  drishvara_phase01_scaffold/core/learning/policies/prompt-policies.json \
  drishvara_phase01_scaffold/core/learning/run-ledger/runs.jsonl

if git diff --cached --quiet; then
  echo "No staged changes to commit."
  exit 0
fi

git commit -m "Save latest approved run and learning state"
git push origin main

echo
echo "===== DONE ====="
echo "Latest approved content saved and pushed."
