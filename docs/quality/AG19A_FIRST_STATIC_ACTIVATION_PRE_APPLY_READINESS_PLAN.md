# AG19A — First Static Activation Pre-Apply Readiness Plan

## Purpose

AG19A defines the pre-apply readiness plan for the first controlled static activation.

AG19A is planning only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Planned Outputs

- Pre-apply checklist plan
- First candidate evidence requirement plan
- Final public filter evidence plan
- Exact file delta pre-apply plan
- Rollback branch/commit strategy plan
- Manual approval gate plan
- GitHub secret storage no-secrets plan

## Decision State

The first static activation is not approved yet. AG19A prepares readiness for audit only.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG19B — Pre-Apply Readiness Audit — only with explicit approval.
