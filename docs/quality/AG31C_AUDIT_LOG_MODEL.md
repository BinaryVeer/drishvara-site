# AG31C — Audit Log Model

## Purpose

AG31C defines the future audit log model for queue and article-state transitions.

## Audit Data Planned

- actor
- actor role
- action type
- before state
- after state
- timestamp
- decision note
- before hash
- after hash

## Created Planning Records

- Audit log field schema.
- State event log shape.
- Before/after hash model.
- Actor/action/timestamp model.
- Audit log non-activation audit register.
- Future consumption plan for AG31D.

## Governance Preserved

Admin remains final clearance authority. Editor works only on Admin-assigned items and cannot publish.

## Important Boundary

AG31C is planning-only.

No audit runtime, hash runtime, database, migration, SQL, queue runtime, assignment query, state transition runtime, Auth/backend/Supabase activation, RLS application, secrets, server/API routes, deployment, publishing or public mutation is created.

## Next Stage

AG31D — State Transition Audit — non-active audit only.
