# AG27A — Backend Need Assessment

## Purpose

AG27A assesses whether Drishvara now requires backend planning for Admin/Editor login, database-backed queues, audit logs, article states, rollback, subscriber features and future dynamic publishing.

## Decision

Backend planning is useful and should continue to AG27B.

Backend activation is not approved here.

## Current Assessment

- Static/GitHub-controlled path remains sufficient for the current no-runtime stage.
- Future real Admin/Editor workflow will require backend.
- Future dynamic publishing will require backend.
- Future audit logs, rollback and article-state management will require backend.
- Future subscriber/account features will require backend.

## Strict Blockers

No Supabase project creation, database table creation, RLS policy application, Auth activation, secrets, env vars, runtime API, deployment, publishing or public mutation is performed.

## Next Stage

AG27B — Backend Decision Audit.
