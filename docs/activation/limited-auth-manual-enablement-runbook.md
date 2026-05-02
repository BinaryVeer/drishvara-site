# Drishvara Activation Stage 02F — Limited Auth Manual Enablement Runbook

## Purpose

This runbook records the controlled manual Supabase Auth configuration already performed for Drishvara.

This stage does not enable Auth in frontend code. It does not instantiate the Supabase client. It does not unlock dashboard data, subscriber guidance, premium guidance, payment, palm upload, or admin backend actions.

## Completed Dashboard Configuration

- Site URL set to `https://www.drishvara.com`
- Redirect URLs added:
  - `http://localhost:5173`
  - `http://localhost:5173/login.html`
  - `http://localhost:5173/dashboard.html`
  - `https://www.drishvara.com`
  - `https://www.drishvara.com/login.html`
  - `https://www.drishvara.com/dashboard.html`
- Email provider enabled
- Phone provider disabled
- OAuth apps/server not enabled
- New public user signup disabled
- Anonymous sign-ins disabled
- Confirm email enabled
- RLS verification returned 0 rows

## Current Safe Position

Already completed:

- Supabase database migration applied and validated.
- RLS lockdown completed and documented.
- Auth/Login scaffold prepared.
- Session Guard and Dashboard Gate scaffold prepared.
- Auth environment and redirect planning completed.
- Controlled Auth enablement checklist completed.
- Content governance stack C01-C09 completed.

Still blocked:

- live frontend Supabase client
- live session detection
- dashboard data unlock
- subscription gate
- premium guidance
- payment provider
- palm image upload
- admin backend actions

## RLS Verification SQL

Run this before any future Auth activation step:

```sql
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and rowsecurity = false
order by tablename;
```

Expected:

```text
0 rows
```

## Stop Conditions

Stop immediately if:

- any public table shows `rowsecurity = false`
- service role key appears in frontend code
- `.env.local` appears in repo root
- dashboard data unlocks after login
- premium guidance appears after login
- payment appears live
- palm upload appears live
- admin action appears live

## Strict Rule

Login is only identity verification.

Login must not unlock:

- dashboard data
- subscriber guidance
- premium guidance
- payment access
- palm image upload
- admin actions

These require separate activation stages.

## Parallel UI Hotfix Pending

After this stage, the homepage language/runtime issues should be handled separately under:

`Public UI Hotfix H01 — Homepage Language Runtime & Daily Module Audit`
