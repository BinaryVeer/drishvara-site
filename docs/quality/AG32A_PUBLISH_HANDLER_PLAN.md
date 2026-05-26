# AG32A — Publish Handler Plan

## Purpose

AG32A defines the future publish handler plan for moving an article from `publish_approved` to `published`.

## Critical Publish Rule

No direct publish path is allowed.

The future publish path remains:

`admin_review → publish_approved → published`

The final `published` step is reserved for a future controlled publish handler and remains inactive.

## Created Planning Records

- Publish handler precondition register.
- Publish public filter model.
- Publish audit and rollback requirement.
- Publish handler non-activation audit register.
- Future consumption plan for AG32B.

## Governance Preserved

Admin remains final clearance authority. Editor cannot publish.

## Important Boundary

AG32A is planning-only.

No publish handler runtime, public filter runtime, audit runtime, hash runtime, rollback runtime, database, migration, SQL, RLS policy, Auth/backend/Supabase activation, secrets, server/API route, deployment, publishing or public mutation is created.

## Next Stage

AG32B — Return/Archive Handler Plan.
