# AG38A — Controlled Apply Decision Checkpoint

## Result

AG38A Controlled Apply Decision Checkpoint is created.

## Important Decision

AG38A is a checkpoint only. It does not approve or perform real publish, queue-state write, audit-log write, rollback write, database write, public mutation or deployment.

## Supabase Explicit GRANT Readiness

The Supabase Data API explicit-GRANT change has been added to the governed readiness track.

Future controlled apply planning must review:

- authenticated-only access requirements;
- no anon grants for Admin/Editor workflow tables;
- no write grants unless explicitly approved;
- RLS remains the primary access-control boundary.

## Still Blocked

- No real publish.
- No queue-state write.
- No audit-log write.
- No rollback write.
- No database write.
- No public article mutation.
- No deployment.
- No public mutation.
- No dynamic publish runtime.
- No service-role key exposure.
- No anon grants for Admin/Editor workflow tables.
- No SQL grants executed.

## Next

AG38B — Controlled Apply Package Planning.

AG38B must remain package-planning only unless explicit operator approval is separately recorded.
