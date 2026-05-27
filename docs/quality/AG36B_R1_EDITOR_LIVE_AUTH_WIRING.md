# AG36B-R1 — Editor Live Auth Wiring

## Purpose

Wire `editor/login.html` to Supabase browser Auth for controlled local Editor login testing.

## Shared Local Config

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

`http://localhost:8080/editor/login.html`

## Boundary

No deployment, public mutation, service-role exposure or dynamic publish runtime.
