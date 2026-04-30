# Supabase SQL Editor Step Order

## Purpose

This file gives the exact manual order for applying and validating the Supabase schema.

## Step 0 — Final Local Verification

Run locally:

npm run activation:supabase:preflight
npm run activation:supabase:validation:preflight
npm run supabase:schema:preflight
npm run preactivation:preflight
npm run content:preflight

Proceed only if all pass.

## Step 1 — Open Supabase

Open the intended Supabase project.

Confirm project name, project URL, and environment.

## Step 2 — Apply Migration SQL

Open SQL Editor.

Paste and run:

supabase/migrations/20260430_b20a_subscriber_backend_schema.sql

Save the output.

Expected result:

- SQL completes without error.
- Tables, policies, triggers, and constraints are created.

## Step 3 — Run Post-Migration Validation SQL

Paste and run:

supabase/validation/01_post_migration_validation.sql

Expected result:

- 7 tables exist.
- RLS enabled for all 7 tables.
- Policies exist.
- updated_at triggers exist.
- critical defaults are blocked/safe.
- set_updated_at function exists.

## Step 4 — Review Results

Compare output with:

docs/activation/supabase-post-apply-validation-guide.md

Do not proceed if:

- any intended table is missing.
- RLS is not enabled.
- policies are missing.
- defaults are unsafe.
- palm image public URL guard is missing.

## Step 5 — Do Not Enable Auth Yet

After migration validation, stop.

Do not enable:

- live Auth flow
- subscriber dashboard data
- payment provider
- palm image upload
- admin backend action
- premium guidance output

These come in later activation stages.

## Step 6 — Record Activation Output

Create a local note or future commit record with:

- date/time of migration apply
- Supabase environment
- validation result
- any errors
- decision whether to proceed to Auth Stage 02
