# AG74I — Panchang Public Surface Stabilization

AG74I introduces a truthful Varanasi/today default state, Panchang-specific date controls and the four-page Varanasi annual-calendar shell.

## Public record policy

A record renders only when all of the following match:

- canonical engine location;
- local civil date;
- IANA timezone;
- explicit AG74I public-display approval;
- existing public-output, UI-output, exact-value and index-wiring approval flags.

Zero eligible matches produce a governed unavailable state. Multiple eligible matches produce a governed conflict state. No nearest record is substituted.

## DOM ownership

AG74I is the sole runtime owner of the Panchang and Upcoming Observance targets. Legacy daily-context, AG64B, AG71E and AG71Q writers are guarded by the AG74I ownership flag. The existing daily-basis guard is also prevented from reserialising any ancestor or descendant that overlaps the AG74I Panchang surface, preserving initialized date-control node identity.

## Date controls

- Previous Day;
- DD/MM/YYYY input;
- native date picker;
- Today;
- Next Day.

The controls preserve the selected civil date even when no approved result is available.

## Annual book

The annual book remains Varanasi-based and contains four physical pages. Each page reserves three canonical lunar-month slots; physical month instances remain variable for later Adhika/Kshaya handling.

## Browser QA

AG74I cannot close from a self-declared issue count. A headless Chrome interaction test verifies default load, date navigation, location change, unavailable state, public-approval rejection, duplicate classification, legacy-controller resistance, book navigation, Star Reflection isolation and no Panchang-specific persistent storage.

## Boundary

No backend, Supabase, external ephemeris API, unrestricted place geocoder or personal-input persistence is activated.
