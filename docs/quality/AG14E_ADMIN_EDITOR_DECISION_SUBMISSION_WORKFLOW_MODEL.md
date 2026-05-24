# AG14E — Admin Editor Decision and Submission Workflow Model

## Purpose

AG14E defines the Admin and Editor workflow model.

AG14E is model-only. It does not execute Admin actions, execute Editor actions, mutate articles, switch public visibility, create credentials, activate Auth/backend/Supabase/database systems or publish anything.

## Admin Actions

- Archive
- Return for correction
- Publish
- Publish and close

## Editor Actions

- Create manual article
- Save draft
- Preview
- Submit to Admin
- Edit returned article
- Resubmit to Admin

## Workflow Principle

Pipeline can generate. Editor can create and correct. Admin alone can publish. Archive preserves intelligence and audit evidence.

## Audit and Versioning

Every future action must record actor, role, remarks, status transition, pre/post hashes, version and visibility state.

## Next Stage

AG14F — Admin Editor Workflow Model Audit and Secure Action Handler Readiness — only with explicit approval.
