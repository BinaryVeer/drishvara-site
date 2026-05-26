# AG26C — Static UX Scaffold

## Purpose

AG26C creates a non-active static UX scaffold blueprint for Admin and Editor workspaces.

It does not create live UI routes, login, Auth, backend, runtime queues, assignment writes, article writes, object generation, public mutation, deployment or publishing.

## Consumed Source-of-Truth

- AG26B Admin Workspace UX Plan.
- AG26A Editor Workspace UX Plan and Admin-assigned Editor alignment.
- AG26 umbrella Admin/Editor Manual Workflow Strengthening.
- AG25Z Featured Reads Production Readiness Closure.
- AG24Z Episodic Knowledge Engine Closure.
- AG27 backend decision checkpoint confirming Supabase/Auth/backend remains deferred.

## Scaffold Coverage

- Admin screens from AG26B.
- Editor screens from AG26A.
- Shared static components.
- Admin → Editor → Admin role flow.
- Non-execution/disabled action model.

## Role Flow

Admin assigns item to Editor. Editor works only on Admin-assigned item. Editor sends work back to Admin. Admin decides.

## Non-Execution Boundary

No runtime UI, no live route, no login, no Auth, no backend, no assignment write, no article mutation, no object generation, no GitHub write, no deployment, no publishing and no public mutation.

## Next Stage

AG26D — UX Scaffold Audit.
