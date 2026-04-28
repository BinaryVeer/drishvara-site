#!/usr/bin/env bash
set -e

echo "========================================"
echo "Drishvara Release Readiness Check"
echo "Project: $(pwd)"
echo "Time   : $(date)"
echo "========================================"

PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

ok() {
  echo "[PASS] $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

warn() {
  echo "[WARN] $1"
  WARN_COUNT=$((WARN_COUNT + 1))
}

fail() {
  echo "[FAIL] $1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

check_file() {
  local path="$1"
  local label="$2"
  if [ -e "$path" ]; then
    ok "$label -> $path"
  else
    fail "$label missing -> $path"
  fi
}

check_dir() {
  local path="$1"
  local label="$2"
  if [ -d "$path" ]; then
    ok "$label -> $path"
  else
    fail "$label missing -> $path"
  fi
}

echo
echo "----- Core readiness -----"
check_file "core/providers/llmClient.js" "llm client"
check_file "core/providers/stageExecutionMode.js" "stage execution mode"
check_file "core/providers/debugControls.js" "debug controls"
check_file "core/orchestrator/runPipeline.js" "run pipeline"
check_file "core/orchestrator/runSummary.js" "run summary"

echo
echo "----- Operator readiness -----"
check_file "scripts/run_drishvara.sh" "shell launcher"
check_file "scripts/run_profile.py" "profile launcher"
check_file "scripts/audit_drishvara.sh" "audit script"
check_file "scripts/check.sh" "quick check script"
check_file "config/run-profiles.json" "run profiles config"
check_file "docs/run-modes.md" "run modes doc"

echo
echo "----- Content / learning readiness -----"
check_dir "core/learning/lessons" "lesson store"
check_dir "core/learning/playbooks" "playbook store"
check_dir "core/learning/policies" "policy store"
check_dir "core/learning/run-ledger" "run ledger"
check_dir "content/outputs" "outputs directory"

echo
echo "----- Environment / hygiene -----"
if [ -f ".env" ]; then
  ok ".env exists for local execution"
else
  warn ".env missing for local execution"
fi

if [ -f ".gitignore" ]; then
  ok ".gitignore exists"
else
  fail ".gitignore missing"
fi

if find content/outputs -name "00_run_summary.json" | grep -q .; then
  ok "at least one run summary exists"
else
  warn "no run summary found yet"
fi

SCAFFOLD_ROOT="drishvara_phase01_scaffold"

if git rev-parse --show-toplevel >/dev/null 2>&1; then
  REPO_ROOT=$(git rev-parse --show-toplevel)
  CURRENT_DIR=$(pwd)

  if [ "$CURRENT_DIR" = "$REPO_ROOT" ]; then
    SCAFFOLD_STATUS=$(git status --short -- "$SCAFFOLD_ROOT" || true)
  else
    SCAFFOLD_STATUS=$(git -C "$CURRENT_DIR" status --short -- . || true)
  fi

  if printf "%s" "$SCAFFOLD_STATUS" | grep -q .; then
    warn "scaffold working tree is not clean"
    echo "$SCAFFOLD_STATUS"
  else
    ok "scaffold working tree is clean"
  fi
else
  warn "git repository context not detected"
fi

echo
echo "----- Latest run summary -----"
LATEST_SUMMARY=$(find content/outputs -name "00_run_summary.json" -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | head -n 1 || true)
if [ -n "$LATEST_SUMMARY" ]; then
  echo "$LATEST_SUMMARY"
  cat "$LATEST_SUMMARY"
else
  warn "unable to locate latest run summary"
fi

echo
echo "========================================"
echo "PASS : $PASS_COUNT"
echo "WARN : $WARN_COUNT"
echo "FAIL : $FAIL_COUNT"
echo "========================================"

if [ "$FAIL_COUNT" -gt 0 ]; then
  echo "Release readiness: NOT READY"
  exit 1
fi

if [ "$WARN_COUNT" -gt 0 ]; then
  echo "Release readiness: PARTIALLY READY"
  exit 0
fi

echo "Release readiness: READY"
