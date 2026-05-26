# AG35B — Supabase Schema Apply Package

## Purpose

AG35B creates the controlled Supabase schema/RLS SQL package for Drishvara backend activation.

## Created Files

- `supabase/migrations/20260527_ag35b_drishvara_controlled_schema.sql`
- Schema manifest.
- RLS manifest.
- Manual Supabase apply guide.
- Non-execution audit.
- AG35C boundary.

## Important Boundary

This stage generates SQL and migration content only.

The script does **not** connect to Supabase, apply SQL, create secrets, create Auth users, write environment variables, deploy, publish or mutate public content.

## Manual Apply Requirement

Review the SQL file manually before applying it in Supabase SQL Editor or Supabase CLI.

After manual apply, share the output before moving to Auth role setup.

## Next Stage

AG35C — Auth Role Setup, after schema apply review/confirmation.
