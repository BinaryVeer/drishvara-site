# AG71C — Pilot UI Coordinate Input Surface

AG71C adds or prepares the frontend coordinate-input surface for the pilot location workflow.

## Required UI modes

### Panchang

- Select Location
- Enter Coordinates
  - Latitude
  - Longitude
  - Timezone
  - Optional label

### Star Reflection

- Select Birth Place
- Enter Birth Coordinates
  - Birth latitude
  - Birth longitude
  - Birth timezone
  - Optional birth place label

## Implementation note

Frontend discovery report records the candidate UI files. If a safe static HTML target is found, AG71C patches it. If not, AG71D should use the discovery report to patch the exact frontend file without guessing.

## Boundary

No full bank activation, no runtime computation, no backend activation and no Supabase activation.


## Active frontend correction

AG71C was corrected to patch the active `index.html` file, not `_local_archive` backup files.

The visible frontend now includes pilot coordinate-input surfaces for:

- Star Reflection birth coordinates.
- Panchang location coordinates.
