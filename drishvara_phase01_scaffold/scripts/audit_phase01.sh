#!/usr/bin/env bash
set -e

echo "===== PHASE 01 FILE AUDIT ====="
echo
echo "--- core/agents ---"
find core/agents -maxdepth 2 -type f | sort
echo
echo "--- core/orchestrator ---"
find core/orchestrator -maxdepth 2 -type f | sort
echo
echo "--- core/providers ---"
find core/providers -maxdepth 2 -type f | sort
echo
echo "--- core/learning ---"
find core/learning -maxdepth 3 -type f | sort
echo
echo "--- docs ---"
find docs -maxdepth 2 -type f | sort
echo
echo "--- latest output folder ---"
find content/outputs/2026-04-16/how-drishvara-should-explain-rural-water-system-sustainability -maxdepth 1 -type f | sort
