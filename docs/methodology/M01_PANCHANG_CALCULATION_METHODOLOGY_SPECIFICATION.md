# M01 — Panchang Calculation Methodology Specification

Status: Methodology/Governance only  
Phase: M-Methodology  
Depends on: M00 — Drishvara Source Doctrine & Sanskrit Integrity Framework  
Runtime impact: None  
Subscriber impact: None  
Public Panchang impact: None  

---

## 1. Purpose

M01 defines Drishvara’s Panchang calculation methodology specification.

It does not calculate, publish, expose, or personalize Panchang output. It only documents the calculation assumptions, required inputs, expected intermediate values, output contracts, review gates, and exclusions that future modules must follow.

This module prepares the methodological base for later modules:

- M02 — Tithi / Vrat / Fasting-Day Rule Engine;
- M03 — Festival Rule Registry;
- M04 — Location / Timezone / Sunrise Basis;
- M09 — Internal Calculation Preview.

---

## 2. Scope

M01 covers the calculation methodology for the five Panchang elements:

1. Tithi;
2. Vara;
3. Nakshatra;
4. Yoga;
5. Karana.

M01 also defines the required treatment of:

- date and time basis;
- location basis;
- timezone basis;
- sunrise basis;
- lunar and solar longitude basis;
- sidereal/tropical distinction;
- ayanamsha declaration;
- tithi intervals;
- skipped and repeated elements;
- calculation uncertainty;
- audit trace.

---

## 3. Explicit Exclusions

M01 does not implement:

- live Panchang calculation;
- public Panchang page;
- subscriber Panchang output;
- festival recommendation;
- vrat recommendation;
- fasting-day decision;
- Ashtami/Ekadashi/Trayodashi/Pradosh observance rules;
- DOB-based guidance;
- lucky number/colour/mantra selection;
- Auth;
- Supabase;
- subscription;
- payment;
- external API fetch;
- server endpoint;
- frontend dashboard card.

M01 is a specification only.

---

## 4. Methodological Foundation

Drishvara shall treat Panchang calculation as an astronomical-calendrical process before it is treated as a devotional, festival, or subscriber-guidance process.

Raw calculation must be separated from interpretation.

The future system must maintain separate layers:

| Layer | Meaning |
|---|---|
| Astronomical layer | Computes positions, angles, sunrise, time intervals |
| Panchang element layer | Converts astronomical values into Tithi, Vara, Nakshatra, Yoga, Karana |
| Observance rule layer | Applies vrat/festival decision rules |
| Regional rule layer | Applies tradition or region-specific variants |
| Editorial layer | Produces explanation |
| Subscriber layer | Applies consented personalization and entitlement |

M01 only defines the first two layers.

---

## 5. Source and Review Position

M01 inherits the M00 source doctrine.

The uploaded background reference, “Development of Pañcāṅga from vedic times upto the present” by Shakti Dhara Sharma, is treated as background for the historical evolution of Panchang calculation discipline, including the transition from observation to more systematic astronomical calculation traditions, lunar/solar corrections, and controversies related to tithi and festival determination.

Modern computational references may be studied for implementation design, but no computational library is adopted by M01.

If Swiss Ephemeris, JPL ephemerides, PyJHora, VedicDateTime, or any other computational source is considered later, it must undergo:

1. technical review;
2. licensing review;
3. accuracy review;
4. reproducibility review;
5. commercial/public-service usage review.


---

## 5A. Classical and Computational Calculation Traditions

M01 shall explicitly recognise three calculation traditions or reference frames as part of Drishvara’s methodology doctrine.

These are not runtime implementations in M01. They are methodological anchors for future review, comparison, and source classification.

### 5A.1 Drik Ganitham / Thirukanitha

Drik Ganitham, also referred to in Tamil Panchang contexts as Thirukanitha, shall be treated as the observation/computation-oriented calculation approach.

For Drishvara, this means:

- Panchang calculation should prefer declared astronomical positions over unexamined fixed tables;
- modern computational methods may be used only after source, accuracy, and licensing review;
- calculated positions must be traceable;
- sunrise, longitude, latitude, timezone, and ayanamsha assumptions must be explicit;
- Drik/Thirukanitha should not be used as a vague marketing word.

M01 does not implement Drik Ganitham. It only records that future calculation modules should be compatible with a precise astronomical computation approach.

### 5A.2 Siddhanta Jyotisha — Mathematical Astronomy

Siddhanta Jyotisha shall be treated as the classical mathematical astronomy foundation relevant to Panchang methodology.

For Drishvara, this means:

- Panchang logic must respect the mathematical-astronomical discipline behind Tithi, Nakshatra, Yoga, Karana, Vara, solar/lunar motion, and time reckoning;
- source claims must distinguish between classical Siddhantic basis and modern ephemeris basis;
- future modules must not collapse Jyotisha into generic astrology or unsupported fortune-telling;
- mathematical astronomy and devotional observance rules must remain separate layers.

M01 recognises Siddhanta Jyotisha as a methodological foundation, not as a subscriber prediction engine.

### 5A.3 Sūrya Siddhānta / Surya Siddhanta

Sūrya Siddhānta shall be recorded as a named classical Sanskrit astronomical reference within Drishvara’s source doctrine.

For Drishvara, this means:

- Surya Siddhanta may be used as a classical reference for understanding Siddhantic astronomical reasoning;
- any direct use of Surya Siddhanta rules in software must be separately reviewed;
- Sanskrit verses, terms, and formulas must be source-checked before inclusion;
- classical formulae must not be silently mixed with modern ephemeris outputs;
- where modern astronomical backends differ from Siddhantic values, the distinction must be documented rather than hidden.

Surya Siddhanta is therefore a source-tradition anchor, not an automatically activated calculation backend.

### 5A.4 Tradition Comparison Doctrine

Future Panchang implementation may maintain separate comparison modes:

| Mode | Meaning | Public activation in M01 |
|---|---|---:|
| Drik/Thirukanitha mode | Modern precise astronomical calculation approach | No |
| Siddhantic reference mode | Classical mathematical astronomy comparison | No |
| Surya Siddhanta reference mode | Specific classical textual reference comparison | No |
| Modern ephemeris mode | Reviewed backend such as Swiss Ephemeris/JPL/other | No |

No mode is activated in M01.

Future implementation must declare which mode is being used, whether it is for calculation, comparison, review, or explanation.

### 5A.5 Non-Mixing Rule

Drishvara must not mix calculation bases without disclosure.

For example, future output must not:

- compute positions using a modern ephemeris while claiming pure Surya Siddhanta basis;
- use a regional Panchang rule without declaring the rule family;
- use a Drik label while relying on unreviewed static tables;
- present a Siddhantic reference as if it were a modern astronomical validation;
- present modern astronomical correction as if it were directly stated in a classical Sanskrit verse.

Every calculation output must preserve its calculation basis and source lineage.


---

## 6. Required Calculation Inputs

Future Panchang calculation must not run without explicitly declared input values.

Minimum required inputs:

| Input | Required | Notes |
|---|---:|---|
| Gregorian date | Yes | Civil date requested by user or system |
| Location name | Yes | Human-readable location |
| Latitude | Yes | Decimal degrees |
| Longitude | Yes | Decimal degrees |
| Timezone | Yes | IANA timezone preferred |
| Calculation date range | Yes | Single date or range |
| Sunrise basis | Yes | Finalized in M04 |
| Ephemeris basis | Yes | Finalized before implementation |
| Ayanamsha basis | Yes, if sidereal calculation used | Must be declared and versioned |
| Language preference | No | Only for display, not calculation |
| Subscriber profile | No | Not used in M01 |

---

## 7. Time and Location Doctrine

### 7.1 Timezone

All calculations must preserve both:

- UTC timestamp;
- local civil timestamp.

The future engine must not silently convert times without storing the timezone used.

### 7.2 Location

Panchang values may vary by location because sunrise and local time can change the applicable day boundary and observance treatment.

M01 requires location to be represented as:

```json
{
  "location_name": "Itanagar, Arunachal Pradesh, India",
  "latitude": 27.0844,
  "longitude": 93.6053,
  "timezone": "Asia/Kolkata"
}
EOD

---

## M01 Validation Repair Addendum — Required Doctrine Anchors

This addendum preserves M01 as methodology-only. It does not activate Panchang runtime, subscriber output, public Panchang, Auth, Supabase, payment, or external API fetch.

### Ayanamsha Doctrine

M01 requires that any future sidereal Panchang calculation must explicitly declare the ayanamsha basis.

Future records must include:

- ayanamsha name;
- ayanamsha version;
- ayanamsha source;
- sidereal conversion basis;
- review status.

No future Drishvara Panchang output may silently use an ayanamsha without exposing the basis in the internal calculation trace.

### Ephemeris Doctrine

M01 does not select or activate any ephemeris backend.

Future options such as Swiss Ephemeris, JPL ephemerides, internally validated astronomical routines, or any other computational source must pass:

- technical review;
- licensing review;
- accuracy review;
- reproducibility review;
- commercial/public-service usage review.

No ephemeris source is enabled in M01.

### Interval and Boundary Handling

M01 requires future Panchang elements to be treated as time intervals, not only as day labels.

Future calculation must preserve:

- active value at sunrise;
- start timestamp;
- end timestamp;
- previous element;
- next element;
- transition timestamp;
- transition uncertainty;
- skipped flag;
- repeated flag.

This is necessary before any tithi-based vrat, festival, or observance rule can be applied.

### Skipped and Repeated Element Doctrine

M01 requires explicit handling of skipped and repeated Panchang elements.

A skipped tithi, repeated tithi, skipped nakshatra, repeated nakshatra, or festival conflict must not be silently flattened into a single date.

These conditions must be preserved for M02 and M03.

### M01 does not implement live calculation

M01 does not implement live Panchang calculation, public Panchang display, subscriber guidance, festival recommendation, vrat recommendation, fasting-day decision, Auth, Supabase, payment, external API fetch, server endpoint, or frontend dashboard card.


