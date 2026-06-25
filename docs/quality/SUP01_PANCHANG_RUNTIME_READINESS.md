# SUP01 — Supabase Panchang Runtime Foundation

SUP01 consumes the formally closed AG74P release without reopening AG74P or creating another AG-numbered Panchang patch.

## Purpose

Prepare a governed server-side Panchang calculation runtime while preserving the existing public UI until SUP02.

## Included

- `calculate-panchang` Supabase Edge Function source.
- Astronomy Engine `2.1.19`, matching the validated AG74L/AG74M computational foundation.
- Approved named-place and worldwide coordinate resolution.
- Explicit IANA timezone requirement for coordinate requests.
- Precomputed AG74P record preference with governed server calculation fallback.
- Approved festival observance readback with all timing windows retained.
- Four normalized runtime-governance tables.
- Public table privilege hardening to SELECT only.
- Active-release RLS filtering.
- Deterministic payload builder and parity matrix.
- No input, coordinate or personal-data persistence.

## Deliberately excluded

- No live SQL migration during local apply.
- No live database write.
- No Edge Function deployment.
- No public client wiring or UI cutover.
- No replacement of AG74P repository projections.
- No additional AG-numbered Panchang patch.

## Next controlled execution

After local apply evidence is reviewed, SUP01 proceeds through migration, canonical payload write, Edge Function deployment, service-role readback, anonymous function invocation and parity validation. SUP02 alone may switch the public UI to the server runtime.
