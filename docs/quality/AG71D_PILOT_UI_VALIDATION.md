# AG71D — Pilot UI Validation

AG71D validates the active index.html coordinate-input UI added in AG71C.

## Validated

- Active index.html patch markers.
- Star Reflection birth-coordinate input surface.
- Panchang coordinate input surface.
- Coordinate toggle script/static DOM contract.

## Boundary

No browser execution, no public runtime activation, no Panchang computation, no Star Reflection computation, no backend activation and no Supabase activation were performed.

## Next

AG71E — Pilot Runtime Output Test.


## Coordinate toggle visibility correction

During live UI review, the Enter Coordinates radio option appeared, but the latitude/longitude fields did not reveal. AG71D corrected the active `index.html` by adding CSS and JS fallback visibility control so coordinate fields appear when Enter Coordinates is selected.


## UI finishing correction

AG71D was further corrected after live review. The Star Reflection coordinate fields now reveal when Enter Birth Coordinates is selected, the coordinate input surface has improved responsive finishing, and the duplicate action label was changed from “Reflection Method Under Review” to “Reflection Locked Pending Review”.


## Final UI correction

AG71D was corrected again after live review. The active `index.html` now uses explicit `data-ag71d-mode` visibility control, a stronger delegated toggle script, improved responsive coordinate-field styling, and a single locked Star Reflection action instead of duplicate “Reflection Method Under Review” controls.


## Star Reflection mode interaction fix

Live review showed that the Enter Birth Coordinates pill was visible but not selectable. AG71D now uses explicit event delegation and `setSurfaceMode()` control so the Star Reflection coordinate mode can be selected and birth latitude/longitude/timezone fields can reveal.
