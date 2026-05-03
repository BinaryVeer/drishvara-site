# M00 — Drishvara Source Doctrine & Sanskrit Integrity Framework

Status: Methodology/Governance only  
Phase: M-Methodology  
Runtime impact: None  
Subscriber impact: None  
Public Panchang impact: None  

---

## 1. Purpose

M00 establishes the source doctrine, Sanskrit integrity rules, and methodological guardrails for Drishvara’s future server-side methodology stack.

This document does not activate live Panchang calculation, subscriber guidance, authentication, entitlement, payment, Supabase, external API calls, or public dynamic outputs. It defines the standard that future methodology modules M01–M10 must follow.

The purpose is to ensure that Drishvara’s spiritual, calendrical, and subscriber guidance systems are:

- source-first;
- Sanskrit-correct;
- transparent in method;
- respectful of tradition without pretending false authority;
- safe for subscriber personalization;
- clearly separated from unsupported prediction, superstition, invented Sanskrit, and fabricated mantras.

---

## 2. Methodological Position

Drishvara shall treat Indic calendrical and spiritual guidance as a disciplined knowledge system, not as casual content generation.

The system must distinguish between:

1. Astronomical or calendrical calculation;
2. Traditional observance rules;
3. Sanskrit textual material;
4. Regional practice variations;
5. Curated editorial guidance;
6. Subscriber personalization;
7. Product-layer entitlement or privacy controls.

No future module may mix these categories without explicit labeling.

---

## 3. Inspiration Disclaimer

Drishvara’s methodology is inspired by a source-first, Sanskrit-conscious, text-aware approach associated with scholars and public educators who emphasize Sanskrit integrity and textual correctness.

In particular, the discipline to avoid pseudo-Sanskrit, invented mantras, loose transliteration, and unsourced claims is treated as methodological inspiration.

Drishvara shall not claim any official association, endorsement, review, approval, or collaboration with Shri Nityanand Misra or any other scholar unless explicit written permission is obtained.

Permitted wording:

> “Drishvara follows a source-first and Sanskrit-integrity approach inspired by public scholarly discipline around correct Sanskrit, textual awareness, and responsible interpretation.”

Not permitted:

> “Approved by…”
> “Endorsed by…”
> “Based on the official method of…”
> “Certified by…”

---

## 4. Panchang Foundation

For future Panchang-related modules, Drishvara shall treat Pañcāṅga as a five-element calendrical framework consisting of:

1. Tithi;
2. Vara;
3. Nakshatra;
4. Yoga;
5. Karana.

Future calculation modules must not treat festival dates as static calendar labels only. Tithi-based observances may depend on lunar phase, sunrise, local time, regional practice, and rule interpretation.

The uploaded reference paper, “Development of Pañcāṅga from vedic times upto the present” by Shakti Dhara Sharma, is to be treated as a methodological background reference for the historical and scientific evolution of Panchang calculation discipline, including the evolution of astronomical observation, Siddhanta-period developments, lunar/solar corrections, and tithi/festival controversies.

M00 does not implement these calculations. It only defines the doctrine that future modules must follow.

---

## 5. Source Hierarchy

Future methodology entries must use a declared source level.

### Level 1 — Primary textual or astronomical source

Examples:
- original Sanskrit source;
- established Jyotisha/Panchang calculation text;
- recognized astronomical basis;
- canonical mantra source where applicable.

### Level 2 — Commentary or traditional interpretive source

Examples:
- traditional commentary;
- regional Panchang authority;
- sampradaya-specific observance rule;
- temple/tradition-specific practice note.

### Level 3 — Modern scholarly or technical source

Examples:
- academic paper;
- astronomy/calendrical history paper;
- technical Panchang calculation note;
- peer-reviewed or institutionally credible reference.

### Level 4 — Editorial curation

Examples:
- Drishvara internal explanation;
- simplified public-facing summary;
- subscriber-friendly interpretation;
- non-authoritative reflection note.

Level 4 may explain or simplify. It may not invent authority.

---

## 6. Sanskrit Integrity Rules

Drishvara shall maintain a strict Sanskrit integrity discipline.

### 6.1 Devanagari and transliteration

Where Sanskrit terms, verses, mantras, or names are used, the system should preserve:

- Devanagari form where available;
- IAST transliteration where required;
- simple English explanation separately;
- source note separately.

The system must not mix pseudo-Sanskrit, phonetic spelling, and translation in a way that creates false Sanskrit.

### 6.2 No invented mantras

No mantra may be generated, rewritten, beautified, recombined, or “AI-created”.

A mantra may only be shown if:

- the source is declared;
- the text is verified;
- the Devanagari and transliteration are checked;
- the intended deity/context is clear;
- the usage is not framed as guaranteed remedy.

### 6.3 No fake Sanskrit

The following are prohibited:

- invented Sanskrit phrases presented as authentic;
- broken machine-translated Sanskrit;
- transliteration without source;
- “Sanskrit-looking” decorative text;
- unverifiable bija-mantra combinations;
- claims that a phrase is Vedic/Puranic/Tantric without source.

### 6.4 Translation separation

Each Sanskrit item should maintain separate fields for:

- `devanagari`;
- `iast`;
- `plain_english_meaning`;
- `source_reference`;
- `usage_context`;
- `review_status`.

---

## 7. Panchang and Festival Methodology Guardrails

Future M01–M04 modules must follow these principles:

1. Panchang calculation must be location-aware where relevant.
2. Sunrise basis must be explicitly declared.
3. Tithi start/end must be treated as intervals, not only labels.
4. Observance rules must be separated from raw astronomical calculation.
5. Festival/vrat decisions must carry rule notes.
6. Regional variations must be allowed through declared rule families.
7. Controversial dates must be marked as such rather than silently flattened.
8. Output must distinguish between:
   - calculated tithi;
   - observance recommendation;
   - regional variation;
   - editorial note.

---

## 8. Subscriber Guidance Methodology Guardrails

Future M05–M07 modules may support subscriber guidance based on:

- name;
- date of birth;
- place/location;
- preferred language;
- spiritual preference;
- consented profile inputs;
- subscription entitlement.

However, such guidance must remain safe, reflective, and non-deterministic.

Permitted:

- devotional suggestion;
- reflective daily note;
- mantra suggestion from verified source;
- lucky colour as symbolic guidance;
- lucky number as editorial/spiritual motif;
- do/don’t suggestions framed as mindful conduct;
- time-period guidance framed as general reflection.

Not permitted:

- guaranteed future prediction;
- medical/legal/financial certainty;
- fear-based warnings;
- curse/remedy claims;
- “must do this or harm will happen” framing;
- invented mantra/remedy;
- hidden use of sensitive personal data;
- subscriber guidance without consent.

---

## 9. Lucky Number, Colour, and Mantra Doctrine

Lucky number, lucky colour, and mantra selection must be treated as curated symbolic guidance, not deterministic fate calculation.

Future methodology must define:

1. input basis;
2. source basis;
3. scoring logic;
4. fallback rule;
5. review status;
6. subscriber consent status;
7. entitlement level;
8. explanation label.

Example output label:

> “Symbolic daily guidance, generated using declared methodology and curated source rules. Not a deterministic prediction.”

---

## 10. Privacy and Consent Doctrine

No subscriber-specific methodology may run unless the relevant data use is consented.

Future modules must distinguish:

- anonymous visitor;
- logged-in subscriber;
- free subscriber;
- premium subscriber;
- consented personalization;
- non-consented generic guidance.

Subscriber guidance must not expose:

- full date of birth publicly;
- exact birth location publicly;
- private spiritual preferences publicly;
- subscription status publicly;
- inferred sensitive traits.

---

## 11. Entitlement and Gating Doctrine

Premium methodology should be gated at the service layer, not inside textual content.

Future API contracts must separate:

- calculation availability;
- subscriber entitlement;
- preview card;
- locked premium card;
- explanation text;
- audit log;
- privacy status.

M00 does not implement entitlement. It only defines that future entitlement logic must be explicit and auditable.

---

## 12. Required Review Gates

Before any future methodology module is activated, it must pass the following gates:

| Gate | Purpose |
|---|---|
| Source Review | Confirms that source hierarchy and references are declared |
| Sanskrit Review | Confirms Devanagari, IAST, translation, and usage integrity |
| Calculation Review | Confirms astronomical/calendrical assumptions |
| Observance Rule Review | Confirms vrat/festival decision logic |
| Privacy Review | Confirms consent, data minimization, and safe profile handling |
| Entitlement Review | Confirms premium/free separation |
| Output Safety Review | Confirms no fear-based, deterministic, or harmful claims |

---

## 13. Prohibited Claims

Drishvara methodology and output must not claim:

- guaranteed fortune;
- guaranteed remedy;
- divine certification;
- official endorsement by a scholar without permission;
- exact future certainty;
- medical/legal/financial authority;
- one universal Panchang rule across all regions without qualification;
- AI-generated mantra authenticity.

---

## 14. Approved Output Labels

Future outputs should use one or more of the following labels:

- `calculation_estimate`;
- `source_based_observance`;
- `regional_rule_variant`;
- `editorial_guidance`;
- `symbolic_guidance`;
- `subscriber_personalized`;
- `premium_gated`;
- `human_review_required`;
- `not_for_medical_legal_financial_reliance`.

---

## 15. M00 Acceptance Criteria

M00 is considered complete when:

1. Source doctrine is documented.
2. Sanskrit integrity framework is documented.
3. No invented mantra policy is documented.
4. Panchang five-element foundation is documented.
5. Subscriber guidance guardrails are documented.
6. Privacy and entitlement doctrine is documented.
7. Review gates are documented.
8. Machine-readable M00 doctrine file exists.
9. Validation script checks minimum doctrine completeness.
10. No runtime, auth, payment, Supabase, API fetch, or public dynamic Panchang behavior is introduced.

---

## 16. Scope Exclusions

The following are explicitly outside M00:

- live Panchang calculation;
- subscriber login;
- subscription payment;
- Supabase integration;
- external Panchang API;
- external festival API;
- personalized subscriber output;
- public dynamic Panchang page;
- mantra generation;
- fortune prediction engine;
- DOB-based live interpretation;
- dashboard runtime cards.

These may be addressed only in later modules after methodology approval.

---

## 17. Downstream Mapping

| Future module | Dependency on M00 |
|---|---|
| M01 Panchang Calculation Methodology Specification | Must inherit Panchang foundation and calculation review gate |
| M02 Tithi/Vrat/Fasting-Day Rule Engine | Must inherit observance rule separation |
| M03 Festival Rule Registry | Must inherit source hierarchy and regional variant doctrine |
| M04 Location/Timezone/Sunrise Basis | Must inherit location-aware Panchang guardrails |
| M05 Name/DOB/Location Methodology | Must inherit privacy and consent doctrine |
| M06 Lucky Number/Colour/Mantra Selection | Must inherit symbolic guidance and no-invented-mantra rule |
| M07 Subscriber Personalization Scoring Logic | Must inherit safe personalization rules |
| M08 Server-side API Contract | Must inherit privacy, entitlement, and output labels |
| M09 Internal Calculation Preview | Must inherit review-only preview discipline |
| M10 Activation Readiness Report | Must verify all M00 gates |

---

## 18. M00 Status

M00 establishes the governing doctrine for Drishvara’s methodology phase.

It is ready to support M01 only after review and approval.

