# AG71I-A — Panchang Computation Engine Extraction Plan

AG71I-A records the decision to split computation work before executing the four-location Panchang harness.

## Finding

AG70K contains real internal dry-run Panchang formula logic, but that logic is embedded inside the AG70K generator and includes hardcoded India timezone handling.

## Decision

Do not execute AG71H records directly yet.

First create a reusable internal engine module with timezone-aware pilot support.

## Next Step

AG71I-B should create:

`scripts/lib/panchang-internal-dry-run-engine.mjs`

The engine must support:

- Asia/Kolkata
- Asia/Tokyo
- canonical AG71H location IDs
- public-blocked internal output only

## Boundary

No computation, public output, backend activation, Supabase activation, runtime API, or UI exact-value wiring was performed in AG71I-A.
