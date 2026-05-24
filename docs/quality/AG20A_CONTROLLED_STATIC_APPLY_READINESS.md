# AG20A — Controlled Static Apply Readiness

## Purpose

AG20A prepares the controlled static apply readiness package after AG19 closure.

AG20A is readiness only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Readiness Package Sections

- Candidate apply readiness check
- GitHub token readiness no-secrets check
- Public surface apply map
- Rollback and smoke-test readiness check
- Explicit approval gate readiness check
- Controlled static apply blocker register

## Approval Phrase

Future controlled static apply requires the exact phrase:

`Proceed with first controlled static apply`

This phrase is not executed in AG20A.

## Decision State

AG20A does not approve or perform real apply. It prepares readiness for AG20B audit only.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG20B — Controlled Static Apply Readiness Audit — only with explicit approval.
