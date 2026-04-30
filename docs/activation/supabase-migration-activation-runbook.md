# Drishvara Activation Stage 01A — Supabase Migration Activation Runbook

## Purpose

This runbook prepares the controlled activation of the Drishvara Supabase backend schema.

This stage does not apply the migration automatically. It only documents the review, apply, validation, and rollback approach before any live database action.

## Migration File

- supabase/migrations/20260430_b20a_subscriber_backend_schema.sql

## Tables Created

- subscriber_profiles
- subscriptions
- subscriber_daily_guidance
- user_submissions
- feedback_submissions
- palmistry_requests
- knowledge_update_reviews

## Do not apply the migration unless

1. Repository is clean except archive/.
2. npm run content:preflight passes.
3. npm run preactivation:preflight passes.
4. npm run supabase:schema:preflight passes.
5. Supabase project URL and keys are confirmed outside the repo.
6. Service role key is never placed in frontend code.
7. Backup/export strategy is available.
8. A test authenticated user is available for validation.

## Supabase SQL Editor

Open Supabase SQL Editor, paste the migration SQL, run once, and save the result output.

## Supabase CLI

Use only after linked project is verified:

supabase db push

## Rollback Approach

Rollback must be done carefully. In a test environment only, emergency reverse drop order is:

drop table if exists public.knowledge_update_reviews cascade;
drop table if exists public.palmistry_requests cascade;
drop table if exists public.feedback_submissions cascade;
drop table if exists public.user_submissions cascade;
drop table if exists public.subscriber_daily_guidance cascade;
drop table if exists public.subscriptions cascade;
drop table if exists public.subscriber_profiles cascade;
drop function if exists public.set_updated_at() cascade;

## Go / No-Go

Go only if local preflights pass, Supabase project is confirmed, secrets are outside repo, test user is available, and rollback approach is understood.
