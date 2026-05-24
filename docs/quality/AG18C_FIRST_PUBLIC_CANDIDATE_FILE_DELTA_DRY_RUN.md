# AG18C — First Public Candidate and File Delta Dry-run

## Purpose

AG18C dry-runs the first public candidate and intended file/public-surface deltas.

AG18C is dry-run only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Dry-run Outputs

- Candidate readiness dry-run
- Public filter dry-run
- Intended file delta dry-run
- Featured Reads delta dry-run
- Category listing delta dry-run
- Homepage card delta dry-run
- Sitemap/feed/search delta dry-run
- Rollback and smoke-test dry-run

## Decision State

The candidate remains non-public. All public exposure, GitHub write, deployment and publishing actions remain blocked.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG18D — First Public Candidate and File Delta Dry-run Audit — only with explicit approval.
