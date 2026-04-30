# Drishvara Supabase Post-Apply Validation Guide

## Purpose

This guide explains how to validate the Supabase schema immediately after applying the Stage 01 migration.

## Validation Files

### 01_post_migration_validation.sql

Run after migration apply.

Checks:
- table existence
- RLS enabled state
- policy existence
- trigger existence
- constraint existence
- critical defaults
- updated_at function

### 02_rls_manual_smoke_tests.sql

Template for later RLS testing with real authenticated users.

Do not assume SQL Editor reflects client-side RLS behavior because SQL Editor may run with elevated privileges.

### 99_emergency_test_rollback.sql

Emergency rollback for test environment only.

Rollback SQL is for test environment only.

Do not run in production without backup/export confirmation.

## Required Expected Results

After migration:

- 7 tables must exist.
- RLS must be enabled on all 7 tables.
- User-facing own-record policies must exist.
- Updated-at triggers must exist.
- `public.set_updated_at()` must exist.
- Subscriber guidance public display must default to false.
- Subscriber guidance subscriber display must default to false.
- Palm image upload must default to false.
- Palm public URL path must be blocked.
- Knowledge Vault monthly review day must default/enforce 10.

## Go / No-Go After Apply

Proceed to Auth planning only if:

- 01_post_migration_validation.sql output is satisfactory.
- RLS is enabled.
- No public anonymous insert is enabled.
- No frontend service role exposure exists.
- Palm image upload remains disabled.
