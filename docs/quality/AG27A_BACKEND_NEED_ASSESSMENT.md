# AG27A — Backend Need Assessment

## Purpose

AG27A assesses whether Drishvara currently requires backend/Auth/Supabase for real Admin/Editor login, database-backed review queues, audit logs, subscriber features and dynamic publishing.

## Assessment Result

Backend is a future requirement for runtime Admin/Editor workflow and dynamic publishing, but backend is not required for the current static governed path.

The current decision remains:

- Continue static now.
- Do not activate Supabase/Auth/backend.
- Do not start AG27C or AG27D without explicit approval.
- Do not start AG28 without explicit approval.

## Consumed Source-of-Truth

- AG26Z Manual Admin/Editor Workflow Closure.
- Existing AG27 backend decision checkpoint.
- AG26 umbrella Admin/Editor workflow strengthening.
- AG25Z Featured Reads Production Readiness Closure.
- AG24Z Episodic Knowledge Engine Closure.

## Need Signals

- Multi-user Admin/Editor login.
- Database-backed review queue.
- Richer audit trail.
- Subscriber/personalization features.
- Dynamic Admin publishing.
- Runtime object generation tracking.
- Static governance continuation.

## Non-Activation Boundary

AG27A does not create backend, Auth, Supabase, database, migrations, RLS policies, secrets, logins, runtime queues, GitHub writes, deployment or publishing.

## Next Stage

AG27B — Backend Decision Audit.
