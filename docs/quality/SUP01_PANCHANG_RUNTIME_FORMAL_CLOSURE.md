# SUP01 — Panchang Runtime Formal Closure

SUP01 is formally closed following successful live migration, runtime-data activation, Edge Function deployment, anonymous invocation, parity validation and final readback.

## Closed runtime state

| Control | Verified state |
|---|---|
| Foundation commit | `624f55a5193ee32811ef563154872334bf570bb8` |
| AG74P source release | `ag74p_final_2026_06_24` |
| Runtime release | `sup01_panchang_runtime_v1` |
| Runtime status | Active |
| Edge Function | `calculate-panchang` |
| Function version | `4` |
| Public UI cutover | False |
| Input persistence | False |

## Verified data state

- Normalized runtime rows: `20 aliases / 6 calculation policies / 7 festival rules / 1 runtime release`.
- Preserved AG74P rows: `5 locations / 384 daily records / 114 festival observances / 1 star release / 1 release manifest`.
- `anon` and `authenticated` table privileges: SELECT-only.

## Verified runtime behavior

- Pre-activation anonymous invocation matrix: `12/12`.
- Local-to-live Panchang and festival parity: `24/24`.
- Post-activation anonymous invocation matrix: `12/12`.
- Approved precomputed Varanasi record preference verified.
- Governed server-calculation fallback for coordinates verified.
- Unknown-place, invalid-timezone and invalid-coordinate errors verified.
- Festival astronomical, observance, primary-public and ritual windows remain separated.
- Visible Begins/Ends remain mapped to `primary_public_window`.

## Evidence chain

- Live evidence file: `SUP01_Live_Execution_Evidence_20260626_225500.zip`
- Live evidence SHA-256: `8c1d633553f073c56d013b43474f16f201e248574b0f7be6871694791f9917de`
- Reviewed foundation commit/push evidence SHA-256: `94e49deaad10f635ae852f8e63865913a8c13f1f865b1328629455b5985c517c`
- Evidence members: `63`
- Credentials retained: No
- Repository changed during live execution: No

## Governance boundary

AG74P remains immutable and no additional AG-numbered Panchang patch is required. SUP01 establishes and closes the server runtime foundation only. The public browser runtime remains unchanged until SUP02 performs a separately validated client integration and cutover.
