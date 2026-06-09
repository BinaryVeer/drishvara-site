# AG71D-R3 — Star/Panchang Form Interaction Cleanup + UI Polish

AG71D-R3 corrects the root cause of the Star Reflection and Panchang form interaction issue.

## Corrections

- Star Reflection Name and DOB inputs are enabled for preview interaction.
- Star Birth Place dropdown is preserved as a location selector and no longer overwritten by the old method label.
- Star coordinate fields are enabled for preview interaction.
- Panchang location dropdown preserves `id="panchang-place-select"` and the 4 pilot locations.
- Panchang coordinate fields are enabled for preview interaction.
- Older stacked AG71 controller scripts are neutralized into compatibility stubs.
- Old Panchang generated-data select overwrite is guarded.
- Output remains locked.

## Boundary

No public Panchang output, public Star Reflection output, backend activation, Supabase activation, runtime computation, or full location-bank activation was performed.
