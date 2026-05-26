# AG28C — Auth Flow Plan

## Purpose

AG28C defines the future Auth flow for Drishvara.

It plans login, session handling, role access, route protection and permission checkpoints for Admin, Editor, system, public reader and future subscriber roles.

## Planned Flow

- Admin login and Admin-only review/publish-control routes.
- Editor login and Editor workspace routes.
- Public reader access to published content only.
- Future subscriber routes separated from Admin/Editor workflow.
- Server-controlled actions isolated from client/browser context.

## Preserved Governance

- Admin remains final publish authority.
- Editor cannot publish.
- System-generated content goes to Admin first.
- Editor-created content goes to Admin review.
- Editor edits system/existing content only after Admin assignment.

## Non-Activation Boundary

AG28C does not activate Supabase Auth, create login runtime, create sessions, create route guards, create accounts, create profile/role tables, create secrets, create runtime queues, deploy or publish.

## Next Stage

AG28D — Backend Architecture Audit.
