# AG70K — Internal Panchang Daily Computation Engine Dry Run

AG70K computes Batch 01 Panchang daily records using the Drishvara internal dry-run computation engine.

## Computed internally

- Sunrise/sunset
- Solar longitude
- Lunar longitude
- Moon-Sun angular difference
- Tithi
- Nakshatra
- Yoga
- Karana
- Paksha
- Vara

## Important boundary

This is an internal dry-run computation with public output blocked. External Panchang sites are not used as source, runtime dependency, data-generation input, or validation source.

AG70L must validate these values against internal formulas and locked basis first.

## Not done

- No public Panchang output.
- No festival/observance event publication.
- No eclipse event publication.
- No context interpretation records.
- No generated Word output.
- No UI/backend/Supabase activation.
