#!/usr/bin/env bash
set -e

CRON_CMD='0 9 * * * /Users/vikashvaibhav/Documents/drishvara-site/drishvara_phase01_scaffold/scripts/cron_process.sh'

TMP_FILE=$(mktemp)

crontab -l 2>/dev/null | grep -v 'drishvara_phase01_scaffold/scripts/cron_process.sh' > "$TMP_FILE" || true
echo "$CRON_CMD" >> "$TMP_FILE"
crontab "$TMP_FILE"
rm -f "$TMP_FILE"

echo "Installed cron entry:"
echo "$CRON_CMD"

echo
echo "Current crontab:"
crontab -l
