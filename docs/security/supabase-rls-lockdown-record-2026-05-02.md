# Supabase RLS Lockdown Record — 2026-05-02

## Context

Supabase sent a security vulnerability alert stating that one or more public schema tables were publicly accessible because Row-Level Security was not enabled.

This alert related to legacy/editorial public schema tables, not only the new subscriber backend tables.

## Immediate Action Taken

The diagnostic SQL was run in Supabase SQL Editor to list public schema tables with RLS disabled.

Tables with rowsecurity=false were identified.

A controlled RLS lockdown block was then run in Supabase SQL Editor to enable RLS on all public schema tables where RLS was disabled.

## Verification Result

The verification SQL was run again after lockdown.

Expected result: 0 rows.

The expected result was received.

## Current Security Position

- All public schema tables are expected to have RLS enabled.
- No broad public read/write policy was created.
- No anonymous insert policy was created.
- No service-role key was exposed.
- Frontend Supabase client remains disabled.
- Auth remains disabled.
- Payment remains disabled.
- Palm image upload remains disabled.
- Admin backend actions remain disabled.
- Premium/subscriber guidance remains blocked.

## Important Note

Enabling RLS without policies may block future API access to some public/editorial tables. This is acceptable at this stage because Drishvara currently uses static/local generated JSON and frontend scaffolds.

When live Supabase-powered public reads are required, create explicit read-only policies for selected public content tables only.
