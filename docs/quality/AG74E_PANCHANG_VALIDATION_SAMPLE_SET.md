# AG74E — Panchang Validation Sample Set

AG74E creates the governed validation sample set for Panchang static-engine result generation.

## Scope

- Uses approved expanded location records from AG74D.
- Creates static validation samples for AG74F.
- Locks the static-engine test plan.
- Keeps public UI unchanged.

## Sample Controls

- Minimum four locations.
- Three dates per location.
- Required Panchang output fields.
- Non-authoritative under-verification note on every sample.

## Disabled

- Backend runtime
- Supabase/Auth
- Personal data storage
- Live ephemeris API dependency
- Final religious authority claim

## Next Step

AG74F should generate static Panchang result data and lookup/fallback fixtures from these samples.
