# AG36A-R1 — Admin Live Auth Wiring

## Purpose

Wire `admin/login.html` to Supabase browser Auth for controlled local Admin login testing.

## Local Config

Committed template:

`assets/js/drishvara-auth-local.example.js`

Local gitignored file:

`assets/js/drishvara-auth-local.js`

Only browser-safe public values may be placed in the local file:

- Supabase Project URL
- Supabase anon/public key

Never paste or commit:

- service-role key
- passwords
- tokens
- cookies
- database password
- environment secrets

## Test URL

`http://localhost:8080/admin/login.html`

## Boundary

No deployment, public mutation, service-role exposure or dynamic publish runtime.
