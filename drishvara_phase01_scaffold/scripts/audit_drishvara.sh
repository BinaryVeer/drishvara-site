#!/usr/bin/env bash
set -e

echo "========================================"
echo "Drishvara Health Audit"
echo "Project: $(pwd)"
echo "Time   : $(date)"
echo "========================================"

check_file() {
  local label="$1"
  local path="$2"

  if [ -e "$path" ]; then
    echo "[OK]   $label -> $path"
  else
    echo "[MISS] $label -> $path"
  fi
}

check_dir() {
  local label="$1"
  local path="$2"

  if [ -d "$path" ]; then
    echo "[OK]   $label -> $path"
  else
    echo "[MISS] $label -> $path"
  fi
}

echo
echo "----- Core providers -----"
check_file "providerConfig" "core/providers/providerConfig.js"
check_file "llmClient" "core/providers/llmClient.js"
check_file "stageExecutionMode" "core/providers/stageExecutionMode.js"
check_file "debugControls" "core/providers/debugControls.js"

echo
echo "----- Orchestrator -----"
check_file "runPipeline" "core/orchestrator/runPipeline.js"
check_file "revisionGovernor" "core/orchestrator/revisionGovernor.js"
check_file "runSummary" "core/orchestrator/runSummary.js"

echo
echo "----- Agents -----"
check_dir "input-normalizer" "core/agents/input-normalizer"
check_dir "story-drafter" "core/agents/story-drafter"
check_dir "visual-intelligence" "core/agents/visual-intelligence"
check_dir "integrator" "core/agents/integrator"
check_dir "guard" "core/agents/guard"
check_dir "publisher" "core/agents/publisher"

echo
echo "----- Learning layer -----"
check_dir "lessons" "core/learning/lessons"
check_dir "playbooks" "core/learning/playbooks"
check_dir "policies" "core/learning/policies"
check_dir "patterns" "core/learning/patterns"
check_dir "run-ledger" "core/learning/run-ledger"

echo
echo "----- Operator layer -----"
check_file "launcher" "scripts/run_drishvara.sh"
check_file "run-modes doc" "docs/run-modes.md"

echo
echo "----- Latest summaries -----"
LATEST_SUMMARY=$(find content/outputs -name "00_run_summary.json" 2>/dev/null | sort | tail -n 1 || true)
if [ -n "$LATEST_SUMMARY" ]; then
  echo "[OK]   latest run summary -> $LATEST_SUMMARY"
  echo "------- summary content -------"
  cat "$LATEST_SUMMARY"
else
  echo "[MISS] latest run summary"
fi

echo
echo "----- Git status -----"
git status --short || true

echo
echo "========================================"
echo "Audit complete"
echo "========================================"
