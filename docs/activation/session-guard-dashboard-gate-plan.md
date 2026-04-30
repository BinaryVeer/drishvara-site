# Drishvara Activation Stage 02C — Session Guard & Dashboard Gate Scaffold

## Purpose

Stage 02C adds a disabled session guard and dashboard gate scaffold.

It does not enable live Supabase Auth, session detection, subscription checks, dashboard data loading, or premium guidance.

## Files Added / Updated

- assets/js/session-guard.js
- dashboard.html
- data/backend/activation/supabase-auth-stage-02c.json

## Intended Future Gate Logic

### Anonymous Visitor

- Can view public site.
- Can view dashboard shell only if public preview permits.
- Cannot access dashboard data.
- Cannot access premium guidance.
- Cannot upload palm image.
- Cannot perform admin actions.

### Free Registered User

Future state only:

- Can access basic dashboard shell.
- Can access limited own profile if consent exists.
- Cannot access premium guidance.
- Cannot access palm image reading.

### Active Subscriber

Future state only:

- Can access subscriber dashboard after login.
- Can access daily guidance only when subscription, consent, and approved rules all exist.
- Cannot access unreviewed Panchang/Vedic outputs.
- Cannot access palm image upload until private storage is approved.

### Admin Reviewer

Future state only:

- Must have explicit reviewer/admin role or claim.
- Admin access must not be inferred from email alone.
- Review actions must be server-side and auditable.

## Current Behavior

- Session guard is visible as scaffold.
- Dashboard data remains locked.
- Premium guidance remains blocked.
- No Supabase client is created.
- No session is read.
- No user profile or subscription data is loaded.

## Next Stage

Stage 02D may prepare environment variable mapping and Auth redirect test checklist.

Live Auth should still wait until Supabase migration and Auth settings are confirmed.
