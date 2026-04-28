#!/usr/bin/env bash
set -e

MODE="${1:-cheap}"
INPUT_PATH="${2:-core/tests/sample-inputs/evidence-pack/normal-01-asset-management.json}"
PROVIDER_STAGES="${3:-story-drafter,integrator,guard}"
DEBUG_MODE="${4:-0}"

echo "========================================"
echo "Drishvara launcher"
echo "Mode           : $MODE"
echo "Input          : $INPUT_PATH"
echo "Provider stages: $PROVIDER_STAGES"
echo "Debug mode     : $DEBUG_MODE"
echo "========================================"

case "$MODE" in
  cheap)
    DRISHVARA_RUN_MODE=cheap \
    DRISHVARA_DEBUG_MODE="$DEBUG_MODE" \
    node --env-file=.env scripts/dev-run.js --input "$INPUT_PATH"
    ;;
  mixed)
    DRISHVARA_RUN_MODE=mixed \
    DRISHVARA_PROVIDER_STAGES="$PROVIDER_STAGES" \
    DRISHVARA_DEBUG_MODE="$DEBUG_MODE" \
    node --env-file=.env scripts/dev-run.js --input "$INPUT_PATH"
    ;;
  full)
    DRISHVARA_RUN_MODE=full \
    DRISHVARA_DEBUG_MODE="$DEBUG_MODE" \
    node --env-file=.env scripts/dev-run.js --input "$INPUT_PATH"
    ;;
  *)
    echo "Unknown mode: $MODE"
    echo "Usage:"
    echo "  ./scripts/run_drishvara.sh cheap <input_json>"
    echo "  ./scripts/run_drishvara.sh mixed <input_json> <provider_stages_csv> <debug_mode>"
    echo "  ./scripts/run_drishvara.sh full <input_json>"
    exit 1
    ;;
esac
