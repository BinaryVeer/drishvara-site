# AG17A — Controlled Go-live Implementation Path Decision

## Purpose

AG17A records the controlled go-live implementation path decision after AG16 closure.

AG17A is decision-only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, switch public visibility, mutate public indexes or publish anything.

## Selected Path

Hybrid staged path.

1. Static/GitHub-controlled go-live first.
2. Supabase/Auth/backend later, only after explicit reminder, review and approval.

## Supabase/Auth Reminder

Before any later stage attempts Supabase/Auth/backend activation, the system must remind the user that the selected path was hybrid staged and that Supabase/Auth was intentionally deferred.

## Next Stage

AG17B — Hybrid Static Go-live Implementation Plan — only with explicit approval.
