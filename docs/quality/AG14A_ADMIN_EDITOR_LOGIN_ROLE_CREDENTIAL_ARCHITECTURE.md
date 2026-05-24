# AG14A — Admin + Editor Login, Role and Credential Architecture

## Purpose

AG14A defines the Admin and Editor architecture for Drishvara publishing control.

AG14A is architecture only. It does not create login pages, credentials, password hashes, backend/Auth/Supabase activation, database writes, article mutation, visibility switching or publishing.

## Admin Role

Admin has final publishing authority. Admin can review, archive, return for correction, publish, publish and close, and review audit trail.

## Editor Role

Editor can manually create articles, edit returned articles, save drafts, preview, and submit/resubmit to Admin. Editor cannot publish.

## Bootstrap Credential Doctrine

Initial Admin/Editor credentials may be used only as secure bootstrap credentials outside public repository code.

First login must force password reset. Real passwords or password hashes must not be committed to GitHub.

## Planned Routes

- Admin login: /admin.html
- Admin dashboard: /admin-dashboard.html
- Editor dashboard: /editor-dashboard.html
- Editor manual article creation: /editor-create.html
- Editor correction workspace: /editor-correction.html

## Next Stage

AG14B — Admin and Editor Login UI Scaffold — only with explicit approval.
