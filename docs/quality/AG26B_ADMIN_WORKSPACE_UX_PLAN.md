# AG26B — Admin Workspace UX Plan

## Purpose

AG26B plans the Admin-side workspace UX for Drishvara.

It supports Admin assignment of work to Editor, review of work returned by Editor, evidence review, delta review, archive, return for correction, and planned Publish / Publish-and-close decisions. All actions remain non-runtime and non-executable.

## Consumed Source-of-Truth

- AG26A Editor Workspace UX Plan.
- AG26A Admin-assigned Editor workflow alignment.
- AG25Z Featured Reads Production Readiness Closure.
- AG26 umbrella Admin/Editor Manual Workflow Strengthening.
- AG24Z Episodic Knowledge Engine Closure.
- AG27 backend decision checkpoint confirming Supabase/Auth/backend remains deferred.

## Planned Admin Surfaces

- Admin Dashboard.
- Admin Article Inventory.
- Assignment Control Panel.
- Editor Return Review Panel.
- Evidence Review Panel.
- Delta Review Panel.
- Return for Correction Panel.
- Archive Panel.
- Publish Decision Panel.
- Tool Approval Panel.
- Audit and Notes Panel.
- Admin Status Summary Panel.

## Admin Workflow Rule

Admin assigns or sends work to Editor. Editor can work only on Admin-assigned items. Editor sends work back to Admin. Admin remains final clearance authority.

## Planned Admin Actions

- Archive.
- Return for correction.
- Hold for Admin review.
- Internal clearance candidate.
- Publish — plan only, execution blocked.
- Publish and close — plan only, execution blocked.

## Non-Activation Boundary

AG26B does not create Admin login, Admin account, Auth, backend, Supabase, runtime queues, assignment writes, review action execution, article mutation, public visibility change, publish-approved change, GitHub write, deployment, publishing or public-page mutation.

## Next Stage

AG26C — Static UX Scaffold.
