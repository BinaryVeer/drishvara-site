# Drishvara Activation Stage 02A — Supabase Auth/Login Runbook

## Purpose

This runbook prepares Supabase Auth and login/session planning before enabling live authentication.

This stage does not enable live Auth. It defines the future login flow, redirect URLs, session detection, dashboard gate, and subscriber access checks.

## Current State

Completed before this stage:

- Stage 01A: Supabase migration activation runbook
- Stage 01B: Supabase post-migration validation SQL pack
- Stage 01C: Supabase apply/no-apply decision checklist

Current live state:

- Supabase Auth is not enabled in frontend.
- Dashboard remains scaffolded.
- Subscriber guidance remains blocked.
- Payment/subscription gate remains disabled.
- Palm image upload remains disabled.
- Admin backend actions remain disabled.

## Future Auth Flow

The intended future flow is:

1. User opens `login.html`.
2. User enters email.
3. Supabase sends magic link or OTP.
4. User returns to allowed redirect URL.
5. Frontend detects session.
6. User profile is loaded from `subscriber_profiles`.
7. Subscription status is checked from `subscriptions`.
8. Dashboard remains blocked unless subscription/status rules allow access.
9. Premium guidance remains blocked unless consent and approved rules also exist.

## Recommended Auth Method

Initial recommended method:

- Email OTP / magic link

Reasons:

- Lower password-management risk.
- Easier for early controlled users.
- Suitable before full subscription automation.
- Reduces need for password reset UI in early phase.

Future optional methods:

- Google OAuth
- Password login
- Phone OTP

## Required Supabase Dashboard Settings

Before enabling live Auth later, confirm:

- Site URL is configured.
- Redirect URLs include local and production URLs.
- Email templates are reviewed.
- OTP/magic-link expiry is acceptable.
- Signup setting is intentional: open signup or invite-only.
- Rate limits and abuse controls are understood.

## Recommended Redirect URLs

Local:

- http://localhost:5173/login.html
- http://localhost:5173/dashboard.html

Production:

- https://www.drishvara.com/login.html
- https://www.drishvara.com/dashboard.html

## Access Logic

### Anonymous Visitor

Allowed:

- homepage
- public articles
- insights
- submissions scaffold

Blocked:

- dashboard data
- profile storage
- subscriber guidance
- palm image upload
- backend submissions
- admin panel actions

### Logged-in Free User

Allowed in future:

- dashboard shell
- basic profile context after consent
- own submission history when backend intake is enabled

Blocked:

- lucky number
- lucky color
- mantra
- what to do / what not to do
- premium guidance
- palm image reading

### Active Subscriber

Allowed in future:

- subscriber dashboard
- daily guidance only after consent and approved rules
- subscriber profile context
- future submission history

Still blocked until later:

- palm image upload
- unreviewed Panchang/Vedic guidance
- deterministic predictions
- payment self-service

### Admin Reviewer

Requires future admin role/claim.

Blocked in this stage:

- review actions
- update actions
- delete actions
- service-role route

## Frontend Files Planned Later

Future files may include:

- `login.html`
- `assets/js/auth-client.js`
- `assets/js/session-guard.js`
- `docs/activation/auth-test-checklist.md`

These should not connect live Auth until Stage 02B/02C.

## Safety Rules

- Do not expose Supabase service role key in frontend.
- Do not enable subscriber guidance only because a user is logged in.
- Do not treat active subscription as sufficient for spiritual/premium output.
- Require user consent for profile-based guidance.
- Keep palm image upload disabled.
- Keep admin actions disabled.
- Keep payment provider disabled.
