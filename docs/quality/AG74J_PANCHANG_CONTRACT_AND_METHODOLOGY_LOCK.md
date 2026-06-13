# AG74J — Panchang Contract and Methodology Lock

AG74J locks one canonical, versioned Panchang profile for future Drishvara calculation and resolution stages.

## Canonical public profile

- Public label: **Drishvara Panchang — Varanasi Standard**
- Canonical place: Varanasi / Banaras
- Timezone: Asia/Kolkata
- Hindu year: Vikram Samvat, Chaitradi
- Lunar-month convention: Purnimanta
- Calculation orientation: modern Drik ephemeris profile
- Ayanamsha: Lahiri / Chitrapaksha
- Sunrise: apparent upper limb at a level horizon under a declared standard-refraction model
- Supported civil-date range: 1900-01-01 through 2100-12-31, inclusive

AG74J does not expose a user-selectable calculation-method or published-Panchang selector. Rishikesh Panchang is not a production dependency or public option in this stage.

## Purnimanta and the Hindu-year boundary

The Purnimanta month convention and the Chaitradi Vikram Samvat year boundary are related but not identical boundaries. The Samvat year changes at Chaitra Shukla Pratipada under the Varanasi sunrise allocation rule. Chaitra Krishna preceding that boundary remains in the previous Samvat year.

Therefore, the four-page annual book uses twelve canonical reporting slots rather than assuming twelve uniform, complete physical lunar-month intervals. Year-edge partial paksha segments must remain explicit.

## Adhika and Kshaya handling

The annual book remains four pages with three canonical month slots per page. Physical month records are variable:

- an Adhika instance precedes the related Nija or regular month;
- a Kshaya month is represented as an explicit canonical-slot exception;
- no missing month may be fabricated;
- Gregorian-quarter language is not used.

## Festival and ritual windows

Condition windows, selected observance dates, primary public windows and ritual windows are separate semantic layers. A tithi boundary must not automatically be relabelled as a ritual window. Unavailable or unreviewed windows remain unavailable.

## Astronomical contract

AG74J selects a modern Drik calculation profile and Lahiri/Chitrapaksha ayanamsha. It does not select an ephemeris software vendor. Backend choice, library version, numeric ayanamsha implementation, Delta-T model and precession/nutation model remain mandatory versioned decisions for AG74L.

Modern ephemeris results must not be represented as pure Surya Siddhanta calculations.

## Safety boundary

AG74J is contract and methodology only. It does not activate astronomical calculation, event generation, unrestricted geocoding, backend runtime, Supabase, personal-location storage, external ephemeris APIs or public method selection.

AG74K may now implement the strict date, place, coordinate, timezone and calendar-profile resolver.
