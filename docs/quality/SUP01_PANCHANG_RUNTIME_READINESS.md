# SUP01 — Supabase Panchang Runtime Foundation

**Status:** Formally closed after verified live execution.

SUP01 consumes the formally closed AG74P release without reopening AG74P or creating another AG-numbered Panchang patch.

## Purpose

Establish the governed Supabase schema, canonical runtime data, server-side Panchang calculation runtime and live parity foundation while preserving the existing public UI until SUP02.

## Completed scope

- `calculate-panchang` Supabase Edge Function deployed and verified active.
- Astronomy Engine `2.1.19`, matching the validated AG74L/AG74M computational foundation.
- Approved named-place and worldwide coordinate resolution.
- Explicit IANA timezone requirement for coordinate requests.
- Precomputed AG74P record preference with governed server-calculation fallback.
- Approved festival observance readback with all timing windows retained.
- Four normalized runtime-governance tables.
- Public table privilege hardening to SELECT-only for `anon` and `authenticated`.
- Active-release RLS filtering.
- Deterministic payload builder and parity matrix.
- No input, coordinate or personal-data persistence.

## Verified live execution

- Runtime datasets: `20 aliases / 6 policies / 7 rules / 1 runtime release`.
- Preserved AG74P datasets: `5 locations / 384 daily records / 114 observances / 1 star release / 1 manifest`.
- Anonymous function invocation before activation: `12/12`.
- Local-to-live parity: `24/24`.
- Anonymous function invocation after activation: `12/12`.
- Runtime release `sup01_panchang_runtime_v1`: active.
- Public UI cutover: inactive.
- Repository unchanged during live execution.
- Destructive rollback: not performed; confirmation guard validated.

## Evidence

- Live evidence: `SUP01_Live_Execution_Evidence_20260626_225500.zip`
- SHA-256: `8c1d633553f073c56d013b43474f16f201e248574b0f7be6871694791f9917de`
- Foundation commit: `624f55a5193ee32811ef563154872334bf570bb8`

## Deliberately excluded

- No public client wiring or UI cutover in SUP01.
- No replacement of AG74P repository projections.
- No persistence of calculation requests, coordinates or personal data.
- No additional AG-numbered Panchang patch.

## Next controlled stage

SUP02 alone may integrate the public client with the active server runtime and perform the governed public cutover.
