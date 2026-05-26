# AG26B — Admin Workspace UX Plan

## Purpose

AG26B plans the Admin-side workspace UX for Drishvara.

Admin is the core reviewer for system-generated/AI-generated content and the final publish authority. System-generated content goes to Admin first. Admin may publish later, hold, reject, or forward content to Editor for editing. Editor returns edited content to Admin. Editor cannot publish.

## Consumed Source-of-Truth

- AG26A Editor Workspace UX Plan.
- AG26A Admin-Editor-System Routing Alignment.
- AG25Z Featured Reads Production Readiness Closure.
- AG26 umbrella Admin/Editor Manual Workflow Strengthening.
- AG24Z Episodic Knowledge Engine Closure.
- AG27 backend decision checkpoint confirming Supabase/Auth/backend remains deferred.

## Planned Admin Surfaces

- Admin Dashboard.
- System Generated Content Inbox.
- Editor Created Candidate Inbox.
- Editor Returned Content Inbox.
- Admin Review Detail View.
- Assign to Editor Panel.
- Admin Tool Approval Panel.
- Admin Reference and Attribution Review.
- Admin Final Publish Control Panel.
- Admin Audit and History Panel.

## Governance

- System-generated content first goes to Admin.
- Admin is core reviewer.
- Admin can send content to Editor for editing.
- Editor returns edited content to Admin.
- Admin is final publish authority.
- Editor has no publish authority.

## Non-Activation Boundary

AG26B does not create Admin login, Auth, backend, Supabase, runtime queues, article mutations, object generation, GitHub writes, deployment, publishing or public-page mutation.

## Next Stage

AG26C — Static UX Scaffold.
