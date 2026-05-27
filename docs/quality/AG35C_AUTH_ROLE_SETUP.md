# AG35C — Auth Role Setup Package

## Selected Test Users

- Admin: dwivedi.vikash.vaibhav@gmail.com
- Editor: vikash4world@gmail.com

## Purpose

AG35C creates the controlled Auth role setup package.

## Created Files

- `supabase/migrations/20260527_ag35c_auth_role_mapping.sql`
- Auth user creation guide.
- Role mapping manifest.
- Manual role mapping guide.
- Non-execution audit.
- AG35D boundary.

## Manual Supabase Steps

1. Create/invite Admin user in Supabase Authentication.
2. Create/invite Editor user in Supabase Authentication.
3. Do not store passwords in repo or chat.
4. Run the AG35C role-mapping SQL in Supabase SQL Editor.
5. Confirm that the result returns one admin row and one editor row.

## Boundary

This script does not create users, passwords, credentials, secrets, env vars, service-role keys, deployment or public mutation.

## Next

Manual Auth user creation and role mapping confirmation.
