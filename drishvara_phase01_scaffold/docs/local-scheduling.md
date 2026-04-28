# Drishvara Local Scheduling Notes

## Recommended local cron command
Run every day at 9:00 AM:

0 9 * * * /Users/vikashvaibhav/Documents/drishvara-site/drishvara_phase01_scaffold/scripts/cron_process.sh

## What it does
- runs scheduled queue processing
- refreshes ops status
- refreshes operator report
- writes a dated log file under `content/logs/`

## Important
This keeps the review gate intact.
It does not auto-approve content.
Approved publishing still requires manual review action.
