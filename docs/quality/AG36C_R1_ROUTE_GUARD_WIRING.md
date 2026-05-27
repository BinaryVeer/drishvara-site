# AG36C-R1 — Route Guard Wiring

Admin and Editor dashboard routes are wired to local Supabase Auth profile-role verification.

## Manual Tests

- Editor opening admin-dashboard.html should be blocked.
- Admin opening admin-dashboard.html should be allowed.
- Editor opening editor-dashboard.html should be allowed.

## Boundary

No passwords, tokens, cookies, Supabase keys, service-role keys, deployment, public mutation or publish actions are recorded.
