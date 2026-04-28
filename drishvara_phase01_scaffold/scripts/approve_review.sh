#!/usr/bin/env bash
set -e

ROOT="/Users/vikashvaibhav/Documents/drishvara-site/drishvara_phase01_scaffold"
REVIEW="$ROOT/review"
PUBLISHED="$ROOT/published"
REPO_ROOT="/Users/vikashvaibhav/Documents/drishvara-site"

TOPIC_FOLDER="${1:-shared}"

if [ ! -f "$REVIEW/$TOPIC_FOLDER/candidate.md" ]; then
  echo "No review candidate found for topic folder: $TOPIC_FOLDER"
  exit 1
fi

mkdir -p "$PUBLISHED/$TOPIC_FOLDER"
mkdir -p "$REVIEW/archive/$TOPIC_FOLDER"

STAMP=$(date -u +"%Y%m%dT%H%M%SZ")

cp "$REVIEW/$TOPIC_FOLDER/candidate.md" "$PUBLISHED/$TOPIC_FOLDER/latest.md"
cp "$REVIEW/$TOPIC_FOLDER/candidate.md" "$REVIEW/archive/$TOPIC_FOLDER/${STAMP}_candidate.md"

if [ -f "$REVIEW/$TOPIC_FOLDER/candidate.html" ]; then
  cp "$REVIEW/$TOPIC_FOLDER/candidate.html" "$PUBLISHED/$TOPIC_FOLDER/latest.html"
  cp "$REVIEW/$TOPIC_FOLDER/candidate.html" "$REVIEW/archive/$TOPIC_FOLDER/${STAMP}_candidate.html"
fi

cp "$REVIEW/$TOPIC_FOLDER/candidate_metadata.json" "$PUBLISHED/$TOPIC_FOLDER/metadata.json"
cp "$REVIEW/$TOPIC_FOLDER/candidate_metadata.json" "$REVIEW/archive/$TOPIC_FOLDER/${STAMP}_candidate_metadata.json"

rm -f "$REVIEW/$TOPIC_FOLDER/candidate.md"
rm -f "$REVIEW/$TOPIC_FOLDER/candidate.html"
rm -f "$REVIEW/$TOPIC_FOLDER/candidate_metadata.json"

cd "$ROOT"
python scripts/update_manifest.py
python scripts/update_review_manifest.py
python scripts/update_ops_status.py

cd "$REPO_ROOT"
git add \
  drishvara_phase01_scaffold/published \
  drishvara_phase01_scaffold/review \
  drishvara_phase01_scaffold/core/learning/lessons/candidate-lessons.jsonl \
  drishvara_phase01_scaffold/core/learning/lessons/validated-lessons.jsonl \
  drishvara_phase01_scaffold/core/learning/playbooks/topic-playbooks.json \
  drishvara_phase01_scaffold/core/learning/policies/prompt-policies.json \
  drishvara_phase01_scaffold/core/learning/run-ledger/runs.jsonl

if git diff --cached --quiet; then
  echo "No staged changes to commit."
  exit 0
fi

git commit -m "Approve reviewed content for $TOPIC_FOLDER"
git push origin main

echo "Approved and pushed: $TOPIC_FOLDER"
