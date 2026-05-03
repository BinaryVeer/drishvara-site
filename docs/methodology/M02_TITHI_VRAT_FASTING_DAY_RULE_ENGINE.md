# M02 — Tithi / Vrat / Fasting-Day Rule Engine

Status: Methodology/Governance only  
Phase: M-Methodology  
Depends on: M00, M01  
Runtime impact: None  
Subscriber impact: None  
Public Panchang impact: None  

---

## 1. Purpose

M02 defines Drishvara’s methodology for a future Tithi, Vrat, and Fasting-Day Rule Engine.

M02 does not calculate live Panchang, does not publish festival dates, does not generate subscriber guidance, and does not activate any public or premium output.

It defines how future modules shall interpret Panchang calculation results from M01 for observance selection, vrat identification, fasting-day logic, conflict handling, and regional or sampradaya variants.

M02 is intentionally broad. It covers all tithis and all major categories of vrat or fasting-day logic, not only Ashtami, Ekadashi, Trayodashi, or Pradosh.

---

## 2. Explicit Exclusions

M02 does not implement:

- live Panchang runtime;
- public Panchang calendar;
- subscriber output;
- personalized daily guidance;
- Auth;
- Supabase;
- payment;
- subscription entitlement;
- external API fetch;
- festival date publication;
- automatic religious recommendation;
- mantra selection;
- lucky number or colour selection;
- DOB-based prediction;
- irreversible fasting instruction;
- fear-based guidance.

M02 is rule-methodology only.

---

## 3. Relationship with M00 and M01

M02 inherits:

- M00 source doctrine;
- M00 Sanskrit integrity framework;
- M00 no-invented-mantra policy;
- M00 privacy and safety doctrine;
- M01 Panchang five-element methodology;
- M01 sunrise, interval, ayanamsha, and ephemeris doctrine;
- M01 skipped/repeated tithi handling;
- M01 Drik/Thirukanitha, Siddhanta Jyotisha, and Surya Siddhanta anchors.

M02 may use M01-derived Panchang elements only after they have passed internal calculation review.

---

## 4. Core Principle

A vrat or fasting day must not be selected merely because a civil date has a label.

The future rule engine must evaluate:

1. relevant Panchang element;
2. paksha;
3. lunar month;
4. sunrise status;
5. sunset or pradosh-kala overlap where applicable;
6. moonrise overlap where applicable;
7. weekday relationship where applicable;
8. nakshatra or yoga relationship where applicable;
9. skipped or repeated tithi;
10. regional rule family;
11. sampradaya rule family;
12. source basis;
13. review status.

---

## 5. All-Tithi Coverage Doctrine

M02 shall support all 30 tithi targets.

Each tithi may become relevant to a vrat, festival, puja, monthly observance, regional observance, or source-specific rule.

The system must not hardcode only the popular tithis.

### 5.1 Shukla Paksha tithis

1. Shukla Pratipada  
2. Shukla Dwitiya  
3. Shukla Tritiya  
4. Shukla Chaturthi  
5. Shukla Panchami  
6. Shukla Shashthi  
7. Shukla Saptami  
8. Shukla Ashtami  
9. Shukla Navami  
10. Shukla Dashami  
11. Shukla Ekadashi  
12. Shukla Dwadashi  
13. Shukla Trayodashi  
14. Shukla Chaturdashi  
15. Purnima  

### 5.2 Krishna Paksha tithis

1. Krishna Pratipada  
2. Krishna Dwitiya  
3. Krishna Tritiya  
4. Krishna Chaturthi  
5. Krishna Panchami  
6. Krishna Shashthi  
7. Krishna Saptami  
8. Krishna Ashtami  
9. Krishna Navami  
10. Krishna Dashami  
11. Krishna Ekadashi  
12. Krishna Dwadashi  
13. Krishna Trayodashi  
14. Krishna Chaturdashi  
15. Amavasya  

---

## 6. Observance Rule Families

M02 recognises the following rule families for future implementation.

### 6.1 Tithi-only rule

An observance is linked mainly to a tithi, subject to sunrise or other boundary rules.

Example types:

- Ekadashi;
- Purnima;
- Amavasya;
- Masik Shivaratri;
- Masik Durgashtami;
- Kalashtami.

### 6.2 Tithi + Paksha rule

An observance requires a specific tithi in Shukla or Krishna Paksha.

Example types:

- Shukla Chaturthi;
- Krishna Chaturthi;
- Shukla Ashtami;
- Krishna Ashtami;
- Krishna Chaturdashi;
- Shukla Ekadashi;
- Krishna Ekadashi.

### 6.3 Lunar month + Tithi rule

An observance requires a lunar month and tithi combination.

Example types:

- Chaitra Shukla Navami;
- Bhadrapada Shukla Chaturthi;
- Kartika Krishna Chaturthi;
- Phalguna Purnima;
- Ashadha Shukla Ekadashi;
- Kartika Shukla Ekadashi.

M02 does not finalize the festival registry. M03 will define named festival entries.

### 6.4 Weekday + Tithi rule

An observance depends on tithi and weekday.

Example types:

- Somvati Amavasya;
- Bhauma Pradosh;
- Shani Pradosh;
- Angarki Sankashti Chaturthi;
- Guru Pushya-type combinations, where applicable in later modules.

### 6.5 Sunrise-touching rule

Some observances depend on whether the tithi is active at sunrise.

Future logic must preserve:

- tithi at sunrise;
- previous sunrise;
- next sunrise;
- tithi start and end;
- repeated tithi flag;
- skipped tithi flag.

### 6.6 Sunset / Pradosh-kala rule

Some observances depend on evening overlap.

Pradosh-type rules require evaluation of whether Trayodashi overlaps with the Pradosh period after sunset.

Future logic must preserve:

- local sunset;
- pradosh window definition;
- Trayodashi interval;
- overlap duration;
- minimum overlap rule;
- regional or source-specific rule family.

### 6.7 Moonrise-based rule

Some observances require moonrise relationship.

Sankashti Chaturthi and Karwa Chauth-type rules may require whether the relevant tithi prevails at moonrise.

Future logic must preserve:

- local moonrise;
- moonrise visibility basis;
- relevant tithi interval;
- overlap status;
- location-specific difference flag.

### 6.8 Parana / fast-breaking rule

Some fasts require a separate fast-breaking window.

Ekadashi-type rules require Dwadashi Parana methodology.

Future logic must preserve:

- fasting day;
- Parana day;
- Parana start;
- Parana end;
- Hari Vasara or other restricted period where applicable after source review;
- sunrise relation;
- sampradaya variant.

M02 does not publish Parana timings. It only defines the future requirement.

### 6.9 Nakshatra-linked rule

Some observances may require a nakshatra condition.

Future logic must support:

- tithi + nakshatra;
- month + nakshatra;
- weekday + nakshatra;
- sunrise or event-window overlap.

### 6.10 Yoga or Karana-linked rule

Some observance traditions may consider Yoga or Karana.

M02 does not define final Yoga/Karana festival rules but requires the data model to support them.

### 6.11 Solar transition / Sankranti rule

Some observances are based on solar ingress rather than tithi.

Future logic must support:

- solar transition timestamp;
- local date assignment;
- punya kala or maha punya kala methodology after source review;
- regional calendar variant.

### 6.12 Regional calendar rule

Some observances vary by region.

Future logic must support:

- North Indian;
- South Indian;
- Tamil;
- Telugu;
- Bengali;
- Odia;
- Assamese;
- Nepali;
- Maharashtra/Gujarati;
- local custom;
- other reviewed regional calendar families.

### 6.13 Sampradaya rule

Some observances vary by sampradaya.

Future logic must support:

- Smarta;
- Vaishnava;
- Shaiva;
- Shakta;
- Ganapatya;
- temple-specific;
- family-tradition note;
- other reviewed tradition families.

M02 does not privilege one sampradaya as universal.

---

## 7. Vrat and Fasting-Day Coverage Doctrine

M02 shall support a future registry for all known and newly reviewed vrat or fasting-day entries.

The following examples must be supported by structure, but M02 does not claim this is a complete activated festival database:

- Ekadashi;
- Dwadashi Parana;
- Pradosh Vrat;
- Sankashti Chaturthi;
- Vinayaka Chaturthi;
- Masik Shivaratri;
- Masik Durgashtami;
- Kalashtami;
- Skanda Sashti;
- Purnima Vrat;
- Amavasya observances;
- Satyanarayana Puja;
- Chandra Darshan;
- Sankranti;
- Karwa Chauth;
- Ahoi Ashtami;
- Janmashtami-type Ashtami rules;
- Durga Ashtami-type Ashtami rules;
- Rama Navami-type Navami rules;
- Akshaya Tritiya-type Tritiya rules;
- Nag Panchami-type Panchami rules;
- Ratha Saptami-type Saptami rules;
- Ananta Chaturdashi-type Chaturdashi rules;
- Guru Purnima-type Purnima rules;
- Mahalaya/Amavasya-type rules;
- regional vrat entries after source review.

Any new vrat may be added only with source, rule family, boundary basis, and review status.

---

## 8. Rule Evaluation Inputs

Future M02-derived rule evaluation requires the following inputs from M01 or later modules:

- local date;
- location;
- timezone;
- sunrise time;
- sunset time;
- moonrise time where applicable;
- tithi interval;
- paksha;
- lunar month;
- weekday;
- nakshatra interval;
- yoga interval;
- karana interval;
- solar ingress timestamp where applicable;
- tithi at sunrise;
- tithi at sunset;
- tithi at moonrise;
- skipped/repeated tithi flags;
- calculation basis;
- ayanamsha basis;
- source registry reference;
- rule family;
- review status.

---

## 9. Rule Output Contract

Future rule output must separate raw calculation from observance decision.

Example future internal structure:

```json
{
  "module": "M02_FUTURE_OUTPUT_CONTRACT_ONLY",
  "public_output_allowed": false,
  "observance_candidate": {
    "name": "Ekadashi",
    "rule_family": "tithi_paksha_sunrise_parana",
    "tithi_target": "Ekadashi",
    "paksha": "Shukla or Krishna",
    "lunar_month": "PENDING_M03",
    "regional_variant": "PENDING_REVIEW",
    "sampradaya_variant": "PENDING_REVIEW"
  },
  "calculation_inputs": {
    "tithi_interval": "FROM_M01",
    "sunrise": "FROM_M04",
    "sunset": "FROM_M04_IF_REQUIRED",
    "moonrise": "FROM_M04_IF_REQUIRED",
    "location": "FROM_M04",
    "timezone": "FROM_M04"
  },
  "rule_decision": {
    "selected_observance_date": null,
    "decision_status": "METHODOLOGY_ONLY",
    "confidence": "PENDING_REVIEW",
    "requires_human_review": true
  },
  "trace": {
    "source_refs": [],
    "calculation_basis": "PENDING_M01_REVIEW",
    "rule_basis": "PENDING_M02_REVIEW",
    "regional_basis": "PENDING_M03_REVIEW"
  }
}

---

## M02 Validation Repair Addendum — Required Doctrine Anchors

This addendum preserves M02 as methodology-only. It does not activate live Panchang runtime, public Panchang calendar, subscriber output, Auth, Supabase, payment, external API fetch, festival-date publication, or automatic religious recommendation.

### All-Tithi Coverage Doctrine

M02 covers all 30 tithi targets as possible rule anchors for future vrat, fasting-day, festival, puja, and observance logic.

### Shukla Paksha tithis

M02 recognises all 15 Shukla Paksha tithis from Shukla Pratipada to Purnima.

### Krishna Paksha tithis

M02 recognises all 15 Krishna Paksha tithis from Krishna Pratipada to Amavasya.

### Observance Rule Families

M02 supports broad future rule families including tithi-only, tithi-paksha, lunar-month-tithi, weekday-tithi, sunrise-touching, sunset/Pradosh overlap, moonrise overlap, Parana/fast-breaking, nakshatra-linked, yoga/karana-linked, solar-transition/Sankranti, regional calendar, and sampradaya variants.

### Sunset / Pradosh-kala rule

M02 requires future Pradosh-type logic to evaluate Trayodashi overlap with a reviewed sunset or Pradosh-kala window.

### Moonrise-based rule

M02 requires future moonrise-based observances to evaluate whether the relevant tithi prevails at local moonrise.

### Parana / fast-breaking rule

M02 requires future Parana logic to be handled separately from fasting-day selection, with source-reviewed start and end windows.

### Regional calendar rule

M02 requires future observance logic to support reviewed regional calendar variants instead of assuming one universal date.

### Sampradaya rule

M02 requires future observance logic to support reviewed sampradaya variants such as Smarta, Vaishnava, Shaiva, Shakta, Ganapatya, temple-specific, family-tradition, or other reviewed traditions.

### Conflict and Ambiguity Doctrine

M02 requires future rule output to preserve conflicts and ambiguity instead of hiding them.

The future rule engine must flag skipped tithi, repeated tithi, sunrise-boundary conflict, sunset-window conflict, moonrise-window conflict, regional conflict, sampradaya conflict, Panchang-source conflict, modern-versus-classical calculation difference, and insufficient source evidence.

Any such case must remain internal or human-review-required until reviewed.

### M02 does not implement live rules

M02 does not implement live Panchang runtime, public Panchang calendar, subscriber output, personalized guidance, Auth, Supabase, payment, subscription entitlement, external API fetch, festival-date publication, automatic religious recommendation, mantra selection, lucky number or colour selection, DOB-based prediction, or fear-based guidance.


