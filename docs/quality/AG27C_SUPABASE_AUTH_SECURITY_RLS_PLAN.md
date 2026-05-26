# AG27C — Supabase/Auth Security and RLS Plan

## Purpose

AG27C creates a non-active Supabase/Auth security and RLS planning record.

It plans:

- table shapes,
- Admin/Editor/Subscriber/Public roles,
- RLS policy groups,
- audit requirements,
- rollback requirements,
- secret-governance rules.

## Important Boundary

AG27C does not activate backend.

No Supabase project, database table, SQL migration, RLS policy, Auth setup, login, secret, environment variable, runtime API, deployment, publishing or public mutation is created.

## Role Rule Preserved

Admin assigns work to Editor. Editor works only on Admin-assigned items. Editor sends work back to Admin. Admin remains final clearance authority.

## Next Stage

AG27D — Supabase/Auth Security and RLS Detail Plan — conditional only, still non-active.
