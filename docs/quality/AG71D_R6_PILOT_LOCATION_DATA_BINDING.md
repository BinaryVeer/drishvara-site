# AG71D-R6 — Pilot Location Data Binding and Timezone Basis

AG71D-R6 binds the four pilot location selections to computationally meaningful location records.

## Corrections

- Each pilot location now carries latitude, longitude, timezone, location_id, country, location type, source status and review status.
- Star Reflection and Panchang selected-place summaries now include coordinates and timezone.
- Coordinate-entry mode now displays a coordinate basis summary.
- Optional place label remains display-only and does not override coordinate computation basis.
- AG71E can consume the prepared `window.drishvaraAg71dR6GetLocationBasis(kind)` API.

## Boundary

No public Panchang output, public Star Reflection output, backend activation, Supabase activation, runtime computation, or full location-bank activation was performed.
