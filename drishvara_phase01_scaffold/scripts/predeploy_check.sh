#!/usr/bin/env bash
set -e

echo "===== RELEASE READINESS ====="
./scripts/ready.sh

echo
echo "===== ENV VALIDATION ====="
python scripts/validate_env.py

echo
echo "===== CHEAP PROFILE CHECK ====="
python scripts/run_profile.py cheap-smoke
