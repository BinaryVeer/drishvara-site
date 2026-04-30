# Drishvara Activation Stage 02D — Auth Environment & Redirect Configuration Checklist

## Purpose

This checklist prepares the Supabase Auth environment and redirect configuration before live authentication is enabled.

This stage does not enable live Auth and does not add any real keys to the repository.

## Required Supabase Auth Settings

Before enabling live Auth later, confirm:

- Supabase project is confirmed.
- Project URL is known.
- Public anon key is known.
- Service role key is kept server-side only.
- Site URL is configured.
- Redirect URLs are configured.
- Email OTP / magic-link method is reviewed.
- Signup mode is decided: public, invite-only, or manually controlled.
- Rate limits and abuse controls are understood.
- Email template text is reviewed.

## Local Redirect URLs

Add in Supabase Auth settings later:

- http://localhost:5173/login.html
- http://localhost:5173/dashboard.html
- http://localhost:5173

## Production Redirect URLs

Add in Supabase Auth settings later:

- https://www.drishvara.com/login.html
- https://www.drishvara.com/dashboard.html
- https://www.drishvara.com

## Vercel Environment Variables Planned Later

Only public-safe values may be exposed to browser code.

Allowed future browser-side variables:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Never expose:

- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_SECRET_KEY
- DATABASE_URL with admin privileges
- Payment provider secret keys
- Webhook signing secrets

## Local Development Environment Plan

Future local `.env.local` may contain:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Do not commit `.env.local`.

## Auth Safety Rules

- Auth client must use anon public key only.
- Service role key must never appear in frontend JS.
- Service role key must never be committed.
- Login alone must not unlock premium guidance.
- Active subscription alone must not unlock spiritual/premium outputs.
- Premium guidance must still require consent and approved Knowledge Vault rules.
- Admin access must not be inferred from email alone.

## Go / No-Go

Proceed to live Auth only if:

- Supabase migration decision is clear.
- Redirect URLs are configured.
- Public anon key is separated from service role key.
- No secrets exist in repository.
- Login/logout can be tested locally.
- Dashboard remains locked until session/subscription logic is validated.
