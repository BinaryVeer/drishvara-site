# AG71G — Four-Location Panchang Computation Readiness Bridge

AG71G records the result of the computation-engine discovery after AG71F.

## Finding

The project has an internal Panchang dry-run/validated bank from AG70K/AG70L, but it is not yet ready for direct four-location UI computation.

## Root Cause

- Existing computed bank is Itanagar-only.
- AG71D-R6 defines four pilot locations.
- Existing Itanagar location id differs from the AG71D-R6 canonical pilot id.
- Public output is still blocked by AG70P and AG71F.

## Classification

Path B — engine/banks exist but only as internal dry-run / one-location public-blocked records.

## Next Gate

AG71H should create a four-location internal computation harness with canonical AG71D-R6 location ids and public output blocked.

## Boundary

No public Panchang computation, public Star Reflection interpretation, backend activation, Supabase activation, runtime AI, or full location-bank activation was performed.
