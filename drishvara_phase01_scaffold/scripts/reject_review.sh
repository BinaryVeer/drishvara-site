#!/usr/bin/env bash
set -e

ROOT="/Users/vikashvaibhav/Documents/drishvara-site/drishvara_phase01_scaffold"
REVIEW="$ROOT/review"
REPO_ROOT="/Users/vikashvaibhav/Documents/drishvara-site"

TOPIC_FOLDER="${1:-shared}"

if [ ! -f "$REVIEW/$TOPIC_FOLDER/candidate.md" ]; then
  echo "No review candidate found for topic folder: $TOPIC_FOLDER"
  exit 1
fi

mkdir -p "$REVIEW/rejected/$TOPIC_FOLDER"

STAMP=$(date -u +"%Y%m%dT%H%M%SZ")

cp "$REVIEW/$TOPIC_FOLDER/candidate.md" "$REVIEW/rejected/$TOPIC_FOLDER/${STAMP}_candidate.md"

if [ -f "$REVIEW/$TOPIC_FOLDER/candidate.html" ]; then
  cp "$REVIEW/$TOPIC_FOLDER/candidate.html" "$REVIEW/rejected/$TOPIC_FOLDER/${STAMP}_candidate.html"
fi

cp "$REVIEW/$TOPIC_FOLDER/candidate_metadata.json" "$REVIEW/rejected/$TOPIC_FOLDER/${STAMP}_candidate_metadata.json"

rm -f "$REVIEW/$TOPIC_FOLDER/candidate.md"
rm -f "$REVIEW/$TOPIC_FOLDER/candidate.html"
rm -f "$REVIEW/$TOPIC_FOLDER/candidate_metadata.json"

cd "$ROOT"
python scripts/update_review_manifest.py
python scripts/update_ops_status.py

cd "$REPO_ROOT"
git add   drishvara_phase01_scaffold/review   drishvara_phase01_scaffold/core/learning/lessons/candidate-lessons.jsonl   drishvara_phase01_scaffold/core/learning/lessons/validated-lessons.jsonl   drishvara_phase01_scaffold/core/learning/playbooks/topic-playbooks.json   drishvara_phase01_scaffold/core/learning/policies/prompt-policies.json   drishvara_phase01_scaffold/core/learning/run-ledger/runs.jsonl

if git diff --cached --quiet; then
  echo "No staged changes to commit."
  exit 0
fi

git commit -m "Reject reviewed content for $TOPIC_FOLDER"
git push origin main

echo "Rejected and archived: $TOPIC_FOLDER"
