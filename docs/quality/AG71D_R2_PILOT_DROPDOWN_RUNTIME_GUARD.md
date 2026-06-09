# AG71D-R2 — Pilot Dropdown Runtime Guard

AG71D-R2 corrects the live dropdown issue observed after AG71D-R1.

## Correction

The active frontend now guards both pilot dropdowns:

- Star Birth Place: Itanagar, New Delhi, Ranchi, Tokyo
- Panchang Location: Itanagar, New Delhi, Ranchi, Tokyo

The runtime guard re-applies pilot options if older homepage wiring or generated working data overwrites the dropdowns after page load.

## Boundary

No public Panchang output, public Star Reflection output, backend activation, Supabase activation, runtime computation, or full location-bank activation was performed.
