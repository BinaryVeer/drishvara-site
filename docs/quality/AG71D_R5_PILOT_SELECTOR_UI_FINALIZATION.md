# AG71D-R5 — Pilot Selector UI Finalization

AG71D-R5 finalizes the visible pilot selector UI for Star Reflection and Panchang.

## Corrections

- Native select controls remain in DOM for compatibility but are hidden from the visible UI.
- Four pilot location buttons are promoted as the active visible selector.
- Selected-location summary is shown below each selector.
- Future searchable location picker contract is recorded.

## Future Searchable Location Picker

After the 4-location pilot is validated, the location picker should allow the user to type a place name and show matching approved records from the Drishvara location database as the user types. Each selectable record must carry coordinates, timezone, source freshness and review status.

## Boundary

No public Panchang output, public Star Reflection output, backend activation, Supabase activation, runtime computation, or full location-bank activation was performed.
