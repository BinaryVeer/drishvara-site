# Drishvara Activation Stage 02E — Controlled Auth Enablement Checklist

## Purpose

This checklist prepares the exact controlled procedure for enabling Supabase Auth later.

This stage does not enable live Auth in code. It defines what must be checked manually in Supabase before any login flow becomes active.

## Current State

Completed:

- Supabase migration applied and validated.
- RLS lockdown response recorded.
- Auth/Login runbook prepared.
- Login page scaffold created.
- Auth client scaffold created.
- Session guard and dashboard gate scaffold created.
- Auth environment and redirect checklist created.

Still disabled:

- live Auth
- Supabase frontend client
- live session detection
- dashboard data unlock
- subscription gate
- premium guidance
- payment provider
- palm image upload
- admin backend actions

## Supabase Dashboard Auth Settings

Before enabling Auth later, confirm the following in Supabase Dashboard.

### Site URL

Recommended production Site URL:

- `https://www.drishvara.com`

Recommended local testing base:

- `http://localhost:5173`

### Redirect URLs

Local:

- `http://localhost:5173`
- `http://localhost:5173/login.html`
- `http://localhost:5173/dashboard.html`

Production:

- `https://www.drishvara.com`
- `https://www.drishvara.com/login.html`
- `https://www.drishvara.com/dashboard.html`

## Recommended Initial Auth Method

Initial method:

- Email OTP / Magic Link

Reasons:

- Lower password-management risk.
- Easier controlled early user testing.
- No password reset workflow needed at first.
- Suitable for founder/internal preview.

## Signup Policy Decision

Choose one before live activation:

- Invite-only / controlled user creation
- Public signup disabled initially
- Public signup enabled later after abuse controls

Recommended initial position:

- Controlled / invite-only

## Email Template Review

Before live Auth:

- Review magic-link/OTP email subject.
- Review sender identity.
- Review branding.
- Review redirect behavior.
- Confirm link expiry.
- Confirm spam/junk delivery risk.

## Local Login Test Procedure

After live Auth is intentionally enabled in a later stage:

1. Start local server.
2. Open `http://localhost:5173/login.html`.
3. Enter test email.
4. Send OTP/magic link.
5. Open email.
6. Complete login.
7. Confirm dashboard shell loads.
8. Confirm dashboard data remains locked unless session/subscription logic is explicitly activated.
9. Confirm premium guidance remains blocked.
10. Logout.
11. Confirm session is cleared.

## Production Login Test Procedure

After deployment and live Auth activation:

1. Open `https://www.drishvara.com/login.html`.
2. Enter controlled test email.
3. Complete OTP/magic-link login.
4. Confirm redirect works.
5. Confirm dashboard shell loads.
6. Confirm premium guidance remains blocked.
7. Confirm no payment/palm/admin feature is unlocked.
8. Confirm logout works.

## Disable / Rollback Auth Procedure

If Auth behaves unexpectedly:

1. Disable signups in Supabase Auth settings.
2. Remove or restrict redirect URLs if needed.
3. Disable frontend Auth flag in code.
4. Redeploy static site with Auth disabled.
5. Confirm login page returns to scaffold-only mode.
6. Confirm dashboard data remains locked.
7. Do not drop database tables.

## Strict Safety Rules

- Login alone must not unlock premium guidance.
- Active subscription alone must not unlock spiritual/premium output.
- Premium guidance requires login, active subscription, consent, and approved Knowledge Vault rules.
- Admin access must not be inferred from email alone.
- Service role key must never be exposed to frontend.
- Palm image upload remains disabled until private storage is reviewed.
- Payment provider remains disabled until payment stage is explicitly activated.
