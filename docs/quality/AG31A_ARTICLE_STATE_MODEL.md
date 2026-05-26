# AG31A — Article State Model

## Purpose

AG31A defines the non-active article state model for future Admin/Editor queue planning.

## Article States

- draft
- editor_submitted
- admin_review
- returned
- archived
- publish_approved
- published

## Created Planning Records

- Article state register.
- Article state transition map.
- Role-state permission matrix.
- Non-activation audit register.
- Future consumption plan for AG31B.

## Governance Preserved

Admin remains final clearance authority. Editor works only on Admin-assigned items and cannot publish.

## Important Boundary

AG31A is planning-only.

No database, queue runtime, article-state runtime, state transition runtime, assignment query, Auth/backend/Supabase activation, RLS application, secrets, server/API routes, deployment, publishing or public mutation is created.

## Next Stage

AG31B — Queue Integration Plan — non-active planning only.
