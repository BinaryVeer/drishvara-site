# ADB08 — SQL Execution Package and Manual Runbook Review

## Purpose

This runbook prepares the reviewed execution package for the ADB05 SQL draft.

## SQL draft path

`data/content-intelligence/database-build/sql-drafts/adb05_astro_drishvara_schema_draft.sql`

## Current status

The SQL draft has been validated by ADB06, but live execution is still **not approved**.

## Before any execution is approved

The operator must confirm:

1. Exact Supabase project name and project ID.
2. Target schema namespace.
3. No existing-table collision.
4. No index-name collision.
5. No destructive SQL.
6. Backup/rollback readiness.
7. Secret handling outside repository and outside chat.
8. No seed insertion.
9. No runtime calculation activation.
10. No backend/Auth activation.

## Do not do in ADB08

- Do not execute SQL.
- Do not connect to Supabase.
- Do not paste service-role key.
- Do not insert seed data.
- Do not activate runtime calculation.
- Do not deploy.

## Next

ADB09 — Final Live SQL Execution Approval Checkpoint.
