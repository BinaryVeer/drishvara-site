#!/usr/bin/env bash
set -e

TMP_FILE=$(mktemp)

crontab -l 2>/dev/null | grep -v 'drishvara_phase01_scaffold/scripts/cron_process.sh' > "$TMP_FILE" || true
crontab "$TMP_FILE"
rm -f "$TMP_FILE"

echo "Removed Drishvara cron entry if it existed."

echo
echo "Current crontab:"
crontab -l 2>/dev/null || echo "(empty)"
