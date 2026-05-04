# M05 — Name / DOB / Location Methodology

Status: Methodology/Governance only  
Phase: M-Methodology  
Depends on: M00, M01, M02, M03, M04, M04A  
Runtime impact: None  
Subscriber impact: None  
Public guidance impact: None  

## 1. Purpose

M05 defines Drishvara’s methodology for handling name, date of birth, time of birth, birth location, current location, language preference, and consented personalization inputs.

M05 does not generate live guidance, horoscope, Kundli, birth chart, daily prediction, lucky number, lucky colour, mantra, subscriber dashboard card, Auth, Supabase, payment, external API fetch, or public output.

M05 is a consent-first personalization methodology layer only.

## 2. Why M05 Is Needed

Subscriber guidance must not be built directly on raw personal inputs.

Name, DOB, birth time, birth location, current location, language preference, and spiritual preference can be sensitive or personally identifying.

M05 defines how such inputs may be collected, normalized, validated, minimized, classified, and used safely in later modules.

## 3. Explicit Exclusions

M05 does not implement subscriber login, profile form, DOB runtime processing, Kundli generation, horoscope prediction, birth chart calculation, automatic astrological inference, public personality claim, premium guidance, dashboard card, lucky number, lucky colour, mantra selection, payment, Supabase, Auth, external API fetch, geocoding API, or live personalization.

M05 does not classify caste, religion, ethnicity, health status, political belief, sexuality, or any other sensitive trait from a subscriber name or location.

M05 does not infer social identity from name.

## 4. Relationship with Earlier Modules

M05 inherits M00 source doctrine, Sanskrit integrity, privacy doctrine, and safety doctrine.

M05 inherits M01 calculation-basis disclosure requirements.

M05 inherits M04 location, timezone, coordinate precision, UTC/local time, and privacy handling.

M05 inherits M04A periodic validation, calibration, learning register, and database tuning doctrine.

M05 does not use M02 or M03 to force religious observance. It may only connect to them later through consented and reviewed guidance logic.

## 5. Consent-First Doctrine

No subscriber-specific personalization may occur without explicit consent.

Consent must be separate for:

- storing name;
- storing date of birth;
- storing time of birth;
- storing birth location;
- storing current location;
- using location for calculation;
- using DOB for personalization;
- using language preference;
- using spiritual preference;
- using historical interactions for personalization;
- showing premium guidance.

Consent must be revocable.

If consent is absent, only generic non-personalized guidance may be shown in later modules.

## 6. Data Minimization Doctrine

M05 requires minimum necessary data.

If a feature can work with city-level location, exact coordinates must not be required.

If a feature can work without birth time, birth time must be optional.

If a feature can work without current location, current location must be optional.

Precise birth location and exact birth time must be treated as sensitive personal data.

## 7. Name Methodology

Name may be used only for safe display, respectful personalization, language rendering, and optional numerological or symbolic logic in later modules after review.

Future name processing must preserve:

- raw name;
- display name;
- normalized name;
- script detected;
- transliteration where user-approved;
- initials where useful;
- preferred salutation;
- language preference;
- review status.

M05 prohibits inferring caste, religion, ethnicity, gender identity, community, or social status from name.

## 8. Sanskrit and Transliteration Doctrine for Names

If Sanskritized, Devanagari, or IAST forms are used for names, they must be marked as transliteration or display transformation, not as an authoritative correction of the subscriber’s identity.

A user’s preferred spelling has priority.

No name should be forcibly Sanskritized.

## 9. DOB Methodology

Date of birth may be used only after consent.

Future DOB handling must preserve:

- date value;
- date format submitted;
- calendar system if applicable;
- timezone context if submitted;
- validation status;
- precision level;
- consent status.

DOB must not be used to generate deterministic fate claims.

M05 allows future DOB use only for reviewed symbolic, reflective, or calculation-based guidance where source and safety gates are satisfied.

## 10. Birth Time Methodology

Birth time must be optional unless a future reviewed calculation specifically requires it.

Future birth time handling must preserve:

- time value;
- time format;
- timezone at birth location if known;
- uncertainty level;
- approximate flag;
- source of time;
- consent status.

Approximate birth time must not be treated as exact.

## 11. Birth Location Methodology

Birth location may be used only after explicit consent.

Future birth location handling must preserve:

- user-entered birth location;
- normalized birth location;
- public-safe birth location label;
- coordinate precision;
- timezone at birth if required;
- source of geocoding or manual normalization;
- consent status.

Exact birth location must not be publicly exposed.

## 12. Current Location Methodology

Current location may be used for Panchang, sunrise, timezone, festival, or daily guidance context only after consent.

Future current location handling must preserve:

- current location label;
- calculation location;
- display location;
- coordinate precision;
- timezone;
- consent status;
- expiry or refresh requirement.

Current location must not be assumed to be birth location.

## 13. Language and Script Preference

Subscriber guidance must preserve language and script preferences separately.

Future records should support:

- preferred language;
- preferred script;
- fallback language;
- Sanskrit display preference;
- transliteration preference;
- simple explanation preference.

This does not activate multilingual output in M05.

## 14. Spiritual Preference Doctrine

Spiritual preference may be collected only as an optional, consented personalization signal.

It must not be inferred from name, birth location, language, or region.

Future spiritual preference records may include deity preference, mantra preference, observance preference, tradition preference, or no-preference status.

M05 does not use these preferences to generate mantra or ritual advice.

## 15. Personalization Input Classification

M05 classifies inputs as:

- direct_profile_input;
- consented_calculation_input;
- optional_preference_input;
- derived_normalized_input;
- internal_review_input;
- prohibited_inference.

Only the first four may be used later after consent and review.

## 16. Profile Completeness Doctrine

A future profile may be classified as:

- anonymous;
- generic_user;
- basic_profile;
- name_only_profile;
- dob_without_time;
- dob_with_time;
- location_enabled;
- full_consent_profile;
- premium_eligible_profile;
- human_review_required.

Profile completeness must not be framed as spiritual superiority.

## 17. Uncertainty Doctrine

M05 requires uncertainty labels for personal data.

Examples:

- exact;
- approximate;
- user_unsure;
- system_normalized;
- pending_confirmation;
- not_provided;
- withheld_by_user.

Future guidance must degrade gracefully when uncertainty is high.

## 18. Safety Doctrine

M05 prohibits deterministic claims.

Not allowed:

- Your DOB guarantees this outcome.
- Your name proves this destiny.
- Your birthplace means this must happen.
- You must do this remedy or harm will occur.
- This guidance replaces medical, legal, financial, or professional advice.

Allowed future framing:

- Symbolic guidance based on consented profile inputs.
- Reflective personalization using declared methodology.
- Guidance confidence depends on available and reviewed inputs.

## 19. Privacy and Retention Doctrine

M05 requires privacy controls for all personal inputs.

Future systems must support:

- consent record;
- purpose label;
- data minimization;
- retention policy;
- deletion request support;
- export request support;
- public-safe display;
- internal access control;
- audit trace.

M05 does not implement these controls. It defines the requirement.

## 20. Future Internal Profile Input Contract

Future internal profile input should include profile_id, consent_status, name_record, dob_record, birth_time_record, birth_location_record, current_location_record, language_preference, script_preference, spiritual_preference, uncertainty_flags, privacy_flags, review_status, and public_output_allowed.

This is not runtime code.

## 21. Connection to Future M06

M06 may later define lucky number, colour, and mantra selection methodology.

M05 does not select lucky number, colour, or mantra.

M06 must inherit M05 consent, privacy, uncertainty, and no-deterministic-claim doctrine.

## 22. Connection to Future M07

M07 may later define subscriber personalization scoring.

M05 does not score subscribers.

M07 must distinguish profile completeness from spiritual or personal value.

## 23. Validation and Learning Connection

M05 inherits M04A.

Any future mismatch, complaint, correction, or learning related to profile input normalization must be recorded through a validation or learning register before methodology or database tuning is accepted.

## 24. M05 Acceptance Criteria

M05 is complete when name methodology, DOB methodology, birth time methodology, birth location methodology, current location methodology, consent doctrine, data minimization doctrine, language/script preference, spiritual preference, uncertainty doctrine, safety doctrine, privacy doctrine, future profile contract, and downstream dependency rules are documented.

M05 must provide a machine-readable registry and validator confirming that no runtime, Auth, Supabase, payment, external API fetch, DOB prediction, Kundli generation, lucky number, lucky colour, mantra selection, subscriber output, or public guidance is introduced.

## 25. M05 Status

M05 establishes the Name / DOB / Location Methodology.

M05 does not implement live personalization or public subscriber output.
