# AG28A — Backend Architecture Blueprint

## Purpose

AG28A creates the backend/Auth architecture blueprint for Drishvara.

This stage moves Drishvara toward controlled Supabase sandbox activation in later stages, but AG28A itself is blueprint-only and does not activate Supabase, Auth, database, migrations, RLS, secrets, queues or publishing.

## Consumed Source-of-Truth

- AG27Z Backend Decision Closure.
- AG27C Supabase/Auth Architecture Plan.
- AG27D Supabase/Auth Security and RLS Plan.
- AG26Z Manual Admin/Editor Workflow Closure.
- AG25Z Featured Reads Production Readiness Closure.

## Architecture Layers

- Identity and access.
- Content and article state.
- Admin/Editor workflow.
- Reference, asset and object tracking.
- Publishing and audit.
- Future subscriber/personalization.
- Security and RLS.
- Secret and environment governance.

## Controlled Sandbox Direction

AG28A records the direction toward controlled Supabase sandbox activation, but activation is not allowed in AG28A.

The activation path remains:

- AG34 — Controlled Backend Activation Readiness.
- AG35 — Controlled Supabase/Auth Activation.
- AG36 — Admin/Editor Login Live Test.
- AG37 — Dynamic Publish Dry-run.
- AG38 — First Controlled Dynamic Publish Apply.

## Non-Activation Boundary

No Supabase project, Auth, database, table, migration, RLS policy, secret, runtime queue, dynamic publish, deployment or publishing is created.

## Next Stage

AG28B — Database Table Plan.
