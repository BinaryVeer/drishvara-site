# AG18A — Controlled Real Static Activation Planning

## Purpose

AG18A plans the first controlled real static activation path after AG17Z closure.

AG18A is planning only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Selected Path

Hybrid staged path remains in force:

1. Static/GitHub-controlled go-live first.
2. Supabase/Auth/backend later, only after explicit reminder, review and approval.

## Planned Outputs

- Real static activation sequence plan
- First public candidate selection plan
- GitHub secret governance plan with no secrets created
- Public index/file delta review plan
- Rollback and smoke-test plan
- Real static activation blocker register

## Supabase/Auth Reminder

Supabase/Auth/backend remains deferred. Before any future backend/Auth/Supabase activation stage, remind the user that the approved route is static/GitHub-controlled first and Supabase/Auth/backend later.

## Next Stage

AG18B — Controlled Real Static Activation Plan Audit — only with explicit approval.
