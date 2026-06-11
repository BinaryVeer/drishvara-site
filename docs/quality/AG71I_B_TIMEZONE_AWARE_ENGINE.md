# AG71I-B — Timezone-Aware Panchang Dry-Run Engine

AG71I-B creates the reusable internal Panchang dry-run engine.

## What Was Created

`scripts/lib/panchang-internal-dry-run-engine.mjs`

The engine includes:

- timezone offset handling for Asia/Kolkata and Asia/Tokyo
- AG70K-style solar/lunar longitude approximation
- Lahiri ayanamsa approximation
- Tithi, Nakshatra, Yoga, Karana, Paksha and Vara derivation
- public-blocked dry-run record construction
- computed-record validation helper

## What Was Not Done

- No AG71H request-bank execution
- No 28-record computed bank
- No public output
- No UI exact-value wiring
- No backend or Supabase activation

## Next Step

AG71I-C should execute the 28 AG71H request records internally and write a public-blocked computed bank.
