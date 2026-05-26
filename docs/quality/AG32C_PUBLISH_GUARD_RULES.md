# AG32C — Publish Guard Rules

## Purpose

AG32C defines the non-active guard rules that any future publish handler must satisfy before an article can move from `publish_approved` to `published`.

## Guard Rules Created

- Admin role guard model.
- Approved state and hash guard model.
- Public filter, audit and rollback guard model.
- Forbidden publish path guard register.
- Guard rules non-activation audit register.
- Future consumption plan for AG32D.

## Required Future Publish Conditions

A future publish action must require:

- Admin authority / final clearance.
- Article state = `publish_approved`.
- Before hash and after hash.
- Public filter pass.
- Audit record.
- Rollback reference.

## Forbidden Paths

- `draft → published`
- `admin_review → published` without `publish_approved`
- `returned → published`
- `editor_submitted → published`
- Editor publish
- Public mutation without audit and rollback

## Important Boundary

AG32C is planning-only.

No publish guard runtime, publish handler runtime, route guard runtime, public filter runtime, audit runtime, hash runtime, rollback runtime, database, migration, SQL, RLS policy, Auth/backend/Supabase activation, secrets, server/API route, deployment, publishing or public mutation is created.

## Next Stage

AG32D — Handler Architecture Audit.
