# AG35A — Explicit Activation Approval

## Purpose

AG35A records explicit approval to begin controlled backend activation.

## Approval Decision

Controlled activation is authorized.

The next stage is AG35B — Supabase Schema Apply.

## Important Boundary

AG35A is approval-record only.

No Supabase project creation, Supabase connection, Auth activation, user creation, credentials, database schema apply, SQL/migration/RLS application, secrets, environment variables, service-role key, server/API route, deployment, publishing or public mutation is performed in AG35A.

## Controls for AG35B

- Keep secrets outside the repository.
- Do not expose service-role key to frontend.
- Do not create Auth users until AG35C.
- Do not perform public mutation.
- Use AG29 schema/RLS planning and AG34 readiness controls.
- Validate and commit separately.

## Next Stage

AG35B — Supabase Schema Apply.
