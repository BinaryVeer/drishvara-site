# ADB14 — Seed Insertion Operator Runbook

## SQL file

`data/content-intelligence/database-build/sql-drafts/adb14_seed_insert_package.sql`

## Execution

Run the SQL manually in Supabase SQL Editor for Drishvara Phase-I only.

## Expected result

A NOTICE similar to:

`ADB14 seed insertion completed. Processed rows: <n>, inserted rows after ON CONFLICT DO NOTHING: <m>`

## Still blocked

- Runtime Panchanga calculation
- Backend/Auth/Supabase runtime activation
- RLS public policy activation
- Deployment
- Service-role key exposure in repo/chat
- AG47 resume
