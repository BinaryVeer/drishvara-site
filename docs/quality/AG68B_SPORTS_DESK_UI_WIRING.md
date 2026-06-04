# AG68B — Sports Desk UI Wiring

AG68B wires the visible Sports Desk card to `generated/sports-desk-working-data.json`.

## Wired

- Live Events target.
- Tournament Watch target.
- Major Updates target.
- Featured Sports Article target.
- Safe fallback if generated working data is unavailable.

## Current state

The Sports Desk now reads from generated working data, but that working data remains inactive/editorial-preview only.

## Not activated

- No live sports sourcing.
- No external sports API.
- No runtime sports API.
- No AI generation or AI selection.
- No score/result claims.
- No backend/Auth/Supabase.
- No service-role use.
- No V02 expansion.

## Next

AG68Z can close the Sports Desk working-data and UI-wiring chain.
