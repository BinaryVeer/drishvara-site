# Drishvara Activation Stage 02B — Auth Client Scaffold Plan

## Purpose

Stage 02B creates a login page and disabled auth-client scaffold.

It does not instantiate Supabase client and does not enable live authentication.

## Files Added

- login.html
- assets/js/auth-client.js
- data/backend/activation/supabase-auth-stage-02b.json

## Current Behavior

- Login page is visible as scaffold.
- Email field is disabled.
- Send magic link / OTP button is disabled.
- Auth status says integration is pending.
- No session is detected.
- No Supabase client is created.
- No profile or subscription data is loaded.
- Premium guidance remains blocked.

## Future Stage

Stage 02C should prepare:

- session guard scaffold
- dashboard gate scaffold
- auth state surface
- blocked/free/subscriber display logic

Live Auth should still wait until Supabase migration and redirect settings are confirmed.
