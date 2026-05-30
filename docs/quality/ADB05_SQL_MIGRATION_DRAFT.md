# ADB05 — SQL Migration Draft Generation with Legacy Methodology Alignment

## Result

ADB05 generates a draft SQL migration file for review.

## Draft file

`data/content-intelligence/database-build/sql-drafts/adb05_astro_drishvara_schema_draft.sql`

## Scope

The draft consumes:

- ADB02 base schema dictionary
- ADB04A schema-extension delta
- M-series methodology records
- D-series knowledge records
- ID-series implementation records

## Included schema families

- Source and review
- Panchanga master and daily output
- Regional calendar and observance profiles
- Calculation-engine support
- Astronomical input snapshots
- Location/timezone/sunrise event windows
- Vrat, fasting, festival and observance rule engine
- Corpus, daily guidance, word rotation and mantra review
- Guidance/reflection rule links and risk controls
- Validation, learning and activation audit

## Still blocked

- No SQL execution
- No database write
- No Supabase connection
- No Supabase table creation
- No seed insertion
- No runtime calculation execution
- No backend/Auth/Supabase activation
- No service-role key exposure

## Next

ADB06 — SQL Draft Validation and Safety Review.
