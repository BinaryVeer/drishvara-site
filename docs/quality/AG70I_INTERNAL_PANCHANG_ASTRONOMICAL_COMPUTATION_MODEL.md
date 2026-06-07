# AG70I — Internal Panchang Astronomical Computation Model Production Setup

AG70I defines Drishvara's in-house Panchang astronomical computation model.

## Core principle

External Panchang websites are not part of the production model. They are not source of truth, not runtime dependency, not data-generation input, and not public-claim basis.

They may be used only later as manual post-computation verification after Drishvara has generated its own computed Panchang output.

## Internal computation chain

Date + location + timezone → sunrise/sunset → solar longitude → lunar longitude → Moon-Sun angular difference → Tithi → Nakshatra → Yoga → Karana → Paksha → Vara → later observance/festival/eclipse logic.

## Created

- Internal Panchang astronomical computation model
- Internal computation method register
- Solar/lunar longitude model
- Sunrise/sunset computation model
- Panchang element derivation model
- Ayanamsa runtime policy
- Vara/Paksha/Karana model
- Computed daily Panchang record schema
- Post-computation manual verification policy
- External Panchang site exclusion audit
- No daily computation audit

## Not done

- No daily Panchang records.
- No festival/observance event records.
- No eclipse event records.
- No context interpretation records.
- No public Panchang output.
- No UI/backend/Supabase activation.
