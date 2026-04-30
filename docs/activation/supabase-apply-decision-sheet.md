# Drishvara Activation Stage 01C — Supabase Apply Decision Sheet

## Purpose

This sheet is used immediately before applying the Supabase migration.

This document does not apply the migration. It records the Go / No-Go basis for the database activation decision.

## Migration Under Review

supabase/migrations/20260430_b20a_subscriber_backend_schema.sql

## Required Local Checks Before Apply

- npm run activation:supabase:preflight
- npm run activation:supabase:validation:preflight
- npm run supabase:schema:preflight
- npm run preactivation:preflight
- npm run content:preflight

## Project Confirmation

Before applying, confirm:

- Supabase project URL is known.
- Supabase project is the intended environment.
- You know whether the target is staging/test or production.
- Service role key is not stored in repository.
- Frontend code does not contain service role key.
- Backup/export strategy is understood.
- Test authenticated user can be created after migration.
- Rollback SQL is understood as test-environment only.

## Go Criteria

Proceed only if all are true:

- Repo status is clean except archive/.
- All preflights pass.
- Migration SQL has been reviewed.
- Seven intended tables are confirmed.
- RLS policy approach is accepted.
- No anonymous public insert is intended.
- Palm image public URL constraint is accepted.
- Subscriber guidance remains blocked by default.
- Payment/Auth/Admin/Palm/Premium guidance remain disabled.

## No-Go Criteria

Do not apply if any are true:

- You are unsure which Supabase project is selected.
- Any preflight fails.
- Any secret is present in frontend or repository.
- You cannot validate RLS after applying.
- You are not ready to run post-migration validation SQL.
- You are not ready to create/test an authenticated user later.
- You expect this migration to enable login/payment automatically.

## Decision Record

Decision: Pending

Target environment: Pending

Reviewer: Pending

Date/time: Pending

Notes: Pending
