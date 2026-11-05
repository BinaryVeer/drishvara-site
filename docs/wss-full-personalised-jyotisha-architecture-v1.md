# Drishvara · What Stars Say — Full Personalised Jyotiṣa System (WSS01)

**Status:** governing scope / source-validation stage, **not a production Kundali implementation**  
**Baseline:** `main` commit `9355191174f4456971d204534704811fe9e49203`  
**Epic:** [#17](https://github.com/BinaryVeer/drishvara-site/issues/17)  
**Machine contract:** `data/methodology/jyotisha/wss-full-personal-jyotisha-contract-v1.json`

## 1. Product definition

What Stars Say must calculate an **individual birth chart (Janma Kundali)** and produce separately traceable, traditional Jyotiṣa interpretations for selected dates or intervals.

Inputs: **name (optional), date of birth, accurate local birth time, and approved birth place/coordinates with the historically applicable timezone**. Name is solely for salutation and optional consent-based Nāma Rāśi. **Name is not a variable in planetary longitude, birth Lagna, Navāṁśa, or Daśā mathematics.**

The output is **not** a generic Sun-sign horoscope, a row of birth-Nakshatra prose, or random AI completion. The system must derive chart data numerically, then conditionally apply verified interpretation rules.

This is a product delivering *traditional astrological interpretations*, **not scientifically validated forecasts of future events**. Phrases such as possible marriage windows, career themes, beneficial colours, or daily do/don't are framed as tradition, not reliable factual claims about the subscriber.

## 2. Existing implementation versus new requirement

| Component | Existing verified state | Full system requirement |
| --- | --- | --- |
| Location selection | 3,266 approved locations, aliases, historical IANA interpretation | Reuse and verify for minute-level birth instant |
| Panchang astronomy | AG74L model: sidereal Sun/Moon and Tithi/Nakshatra/Yoga/Karana | Dedicated independently validated full graha + ascendant ephemeris |
| Star Reflection | Birth date/time qualifying a sunrise-Nakshatra transition interval; 39 governed symbolic output records | Full Janma chart, Grahas, houses, Dasha/Gochar and rule-driven life domains |
| Name | Optional, session-only on-screen salutation | Additional consent-first Nāma Rāśi independent of Janma Rāśi |
| Prediction timing | No full birth-chart rule-time engine | Per-individual daily/monthly/yearly traditional interpretation from natal + Dasha + dated transits |
| Personal records | No personal-input persistence | Anonymous stateless by default; opt-in encrypted subscriber chart saving with deletion |

**Critical:** The existing Panchang's `drishvara_lahiri_linear_tt_v1` ayanāṁśa and approximate Sun/Moon model must **not** be promoted to a precise D1/D9/D10 planetary/ascendant kernel without independently calibrated planetary positions and date-boundary tests.

## 3. Selected method settings (frozen only as review defaults)

- Parāśarī/Horā source tradition; describe its historical textual lineage accurately rather than attributing later horoscope methods directly to Vedic hymns.
- Sidereal/nirāyaṇa longitudes; Lahiri/Chitrapaksha ayanāṁśa **default proposal**, versioned.
- Whole-sign houses in the primary D1 Rāśi Kundali. A Bhāva-Chalit view is an explicit secondary method, never an unlabeled substitution.
- Mean Rahu default; an explicitly chosen true-node variant must not modify previously generated charts silently.
- Vimśottarī as the first Dashā system, with its year convention, starting balance, padas and calendrical precision **source-approved before numeric activation**.
- Regional, sampradāya and naming-table differences remain explicit configuration and provenance, not simultaneous blended rules.

## 4. Computation and review order

### WSS02 — Birth instant and geographic provenance
Resolve exact approved birthplace/coordinates, stored precision, historical IANA timezone, full UTC offset including historic seconds, and birth-local minute. Repeated times from a DST fall-back require explicit first/second occurrence selection; nonexistent spring-forward times are invalid until corrected. Unknown birth time produces only time-independent or full-day-stable results, never fake Lagna or D9.

### WSS03 — Graha and D1/Lagna kernel
Implement a legally licensed reproducible ephemeris, convert UTC/TT consistently, calculate tropical and sidereal graha longitudes for Surya, Chandra, Budha, Shukra, Mangala, Guru, Shani and nodes. Derive Nakshatra, Pada, Rāśi, Lagna, house assignments and D1. Record ephemeris release, ayanāṁśa, node-model and house conventions with every output. Include chart rendering in North/South Indian formats as presentation only.

### WSS04 — Vargas, Daśā and time sensitivity
Implement independent D9 Navāṁśa and D10 Daśāṁśa rules with source-specific formula fixtures. Compute Vimśottarī birth balance, Mahādaśā, Antardaśā and Pratyantardaśā. Prevent exact forecasts when birth-minute uncertainty crosses a divisional, Lagna, or Daśā boundary. Expand to further Vargas only when the corresponding calculation is independently benchmarked.

### WSS05 — Life-topic rule engine
Each claimed chart theme is assembled from *multiple* qualifying factors and rule IDs: Lagna/lord, 2nd/5th/7th/9th/10th/11th and other relevant houses, graha lordship/aspects, D9/D10 and active periods as appropriate. Marriage, career and job changes are **possible traditional windows**, not exact guaranteed dates. Profession sectors are **symbolic career themes**, not an aptitude test. Colours, gemstones and remedies are optional traditional associations, never substitutes for health, financial or practical decisions.

### WSS06 — Time-specific reading
For each day, month and year, compare independently calculated transits and active Daśā to natal data, run documented rule combinations, output a structured explanation:
1. Calculated facts (degrees, sign changes, date and timezone).
2. Traditional interpretation with rule IDs and conditions.
3. Human-readable daily focus and optional conduct/reflection suggestions.
4. Uncertainty, exclusions, risks and method-specific limitations.

Do not fabricate a planetary transit or use the Gregorian calendar alone to rotate a generic "prediction" as if it were a computed horoscope.

### WSS07 — User-facing charts and subscriber journeys
One birth profile can produce: D1, D9, D10, graha table, Janma Rāśi / Nakshatra / Pada, optional Nāma Rāśi, active Daśā sequence, date-specific traditional interpretation tabs (today, month, year), life-domain views and methodology. The exact original birth time and timezone provenance must be accessible, but never placed in query strings. Hindi/English accessible UI and correction controls required.

### WSS08 — Release control
Independent golden references for all nine grahas, ascendant, Lagna boundaries, sign/pada boundaries, D9/D10, Dasha periods, DST folds/gaps, historical seconds, high latitudes and name-script ambiguities. Required: deterministic re-generation under pinned versions, independent numerical tolerances, privacy/security tests and live browser QA; no "computed Kundali" production claim without full passing evidence.

## 5. Accuracy and licensing gate

The **India Meteorological Department / Positional Astronomy Centre** publishes the Indian Astronomical Ephemeris and Rashtriya Panchang, authoritative independent astronomical reference points.

Swiss Ephemeris is a candidate library but is dual licensed **AGPL or Professional**. Before deployment, approve a route compliant with Drishvara's licence and business model (or independently choose and validate another appropriate engine). Do not import a Swiss-Ephemeris-derived library into a closed-source public backend before licence clearance.

Golden comparisons must include challenging geographic and time cases; thresholds must be *measured* and reviewed, not invented at the planning stage. A precision warning remains necessary even when most cases match.

## 6. Privacy and subscriber model

Default is a stateless, no-account birth calculation. Names, birth date, time, and coordinates are personal information. The engine must disclose client/server processing. Server logs must exclude raw birth details; no analytics events may expose them.

Only opt-in subscribers may save charts, under independently reviewed authentication, encryption, retention, export, revocation and deletion rules. A consent to calculate does **not** imply a consent to store or publish. Private data must not be exposed through Vercel/GitHub static files, Supabase public tables or shareable URLs.

## 7. Output contract and proof

A chart and each interpretive statement must expose at least:

```text
person_input_precision
birthplace_basis + historical timezone source
ephemeris_version + ayanamsha + house_system + node_model
computed_graha_positions / charts / dasha
traditional_rule_id(s) + rule_source
interpretation_type: computed_fact | traditional_interpretation | editorial_prompt
uncertainty / unavailable_reason
no_automatic_prediction_certainty
```

If an input is insufficient, the relevant chart fields are `unavailable` with a reason. The app must never silently assume sunrise/noon, choose an ambiguous DST minute, or infer the birth chart from Nāma Rāśi.

## References for source-gate review

- [Indian Astronomical Ephemeris — IMD/Positional Astronomy Centre](https://mausam.imd.gov.in/responsive/indianAstronomicalEphemeris.php)
- [Rashtriya Panchang — IMD](https://mausam.imd.gov.in/imd_latest/contents/rashtriy_panchang.php)
- [Swiss Ephemeris official information and licensing](https://www.astro.com/swisseph/swephinfo_e.htm)
- [Bṛhat Parāśara Horā Śāstra, Sanskrit and English source index](https://vedicpupil.in/library/books/brihat-parashara-hora-shastra)

Citation of a title does **not** by itself approve an interpretive rule; each final calculation/claim must be linked to a verified chapter/verse or documented astronomical formula and an independently tested fixture.

## Completion definition

**Not complete:** Nāma Rāśi alone; a monthly theme bank; showing a blank Kundali diagram; reuse of Panchang Nakshatra prose.

**Complete:** each subscriber can supply a verified birth time/place, calculate reproducible natal/D1/D9/D10 and Daśā facts, and receive specific date- and life-domain *traditional* interpretations grounded in displayed calculated factors, with all limitations, consent and accuracy gates passed.
