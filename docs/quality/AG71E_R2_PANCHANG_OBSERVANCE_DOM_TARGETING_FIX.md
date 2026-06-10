# AG71E-R2 — Panchang Observance DOM Targeting Fix

AG71E-R2 corrects the Panchang preview behaviour where the Upcoming Observance updater could target a broad parent container and remove surrounding page content.

## Corrections

- Broad destructive DOM targeting was removed.
- Upcoming Observance is found at runtime by its heading.
- A dedicated selected-basis line is appended or updated.
- Existing observance card content is preserved.
- Existing Panchang table update behaviour is retained.

## Boundary

No public Panchang computation, public Star Reflection interpretation, backend activation, Supabase activation, runtime AI, or full location-bank activation was performed.
