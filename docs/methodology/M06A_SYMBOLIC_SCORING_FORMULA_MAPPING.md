# M06A — Symbolic Scoring Formula & Mapping Doctrine

Status: Methodology/Governance only  
Phase: M-Methodology  
Depends on: M00, M01, M02, M03, M04, M04A, M05, M06  
Runtime impact: None  
Subscriber impact: None  
Public guidance impact: None  

## 1. Purpose

M06A defines the symbolic scoring formula and mapping doctrine for future lucky number, lucky colour, and symbolic daily guidance selection.

M06A exists to ensure that symbolic guidance is not random, arbitrary, hidden, or manipulative.

M06A does not generate live lucky numbers, lucky colours, mantras, subscriber outputs, dashboard cards, premium guidance, Auth, Supabase, payment, external API fetch, or public dynamic guidance.

## 2. Core Position

Symbolic guidance must be method-based, explainable, non-random, non-deterministic, and reviewable.

Symbolic does not mean random.

Symbolic means the output is selected through declared rules and weights but is not presented as guaranteed fate, guaranteed luck, guaranteed success, guaranteed protection, or guaranteed remedy.

## 3. Explicit Exclusions

M06A does not implement live scoring, subscriber personalization runtime, lucky number runtime, lucky colour runtime, mantra runtime, mantra generation, automatic remedy, premium guidance, dashboard cards, Auth, Supabase, payment, subscription entitlement, external API fetch, DOB prediction, Kundli generation, horoscope generation, or public guidance.

M06A does not create or publish actual daily lucky numbers, colours, or mantras.

## 4. Relationship with M06 and M07

M06 defines safe symbolic guidance categories.

M06A defines the scoring and mapping doctrine behind number and colour selection.

M07 may later use M06A scoring outputs as one input to subscriber personalization, but only after consent, privacy, safety, and review gates.

M07 must not override M06A safety gates.

## 5. Symbolic Scoring Doctrine

Future symbolic number and colour selection must use a scoring model.

A future score may combine:

- base daily rotation;
- weekday association;
- tithi association;
- festival or observance context;
- deity or theme association;
- user preference if consented;
- language or cultural display preference if consented;
- editorial context;
- repetition penalty;
- uncertainty penalty;
- privacy or safety penalty;
- source confidence.

No score may be used if safety, source, consent, or privacy gates fail.

## 6. Core Scoring Formula

Future symbolic selection should follow this conceptual formula:

Final Symbolic Score equals base rotation weight plus weekday weight plus tithi weight plus observance weight plus deity or theme weight plus consented preference weight plus editorial context weight plus source confidence weight minus repetition penalty minus uncertainty penalty minus privacy or safety penalty.

The formula is conceptual and methodology-only. M06A does not implement runtime scoring.

## 7. Default Weight Doctrine

Future default weights must be declared and reviewable.

Suggested starting weights for later review:

- base_rotation_weight: 10
- weekday_weight: 15
- tithi_weight: 15
- observance_context_weight: 20
- deity_theme_weight: 15
- consented_preference_weight: 10
- editorial_context_weight: 5
- source_confidence_weight: 10
- repetition_penalty: 0 to 20
- uncertainty_penalty: 0 to 20
- privacy_safety_penalty: 0 to 100

These are not activated values. They are methodology placeholders for future calibration.

## 8. Number Mapping Doctrine

Future number mapping must be based on declared mapping families.

Allowed mapping families:

- base daily rotation mapping;
- weekday symbolic mapping;
- tithi symbolic mapping;
- festival or vrat symbolic mapping;
- deity or theme symbolic mapping;
- reviewed traditional association;
- editorial curation;
- user preference with consent.

A number must not be assigned from hidden inference, caste inference, religion inference, ethnicity inference, fear warning, or manipulative engagement logic.

## 9. Colour Mapping Doctrine

Future colour mapping must be based on declared mapping families.

Allowed mapping families:

- base daily rotation mapping;
- weekday symbolic mapping;
- tithi symbolic mapping;
- festival or vrat symbolic mapping;
- deity or theme symbolic mapping;
- seasonal editorial mapping;
- reviewed traditional association;
- user preference with consent;
- UI-safe colour palette mapping.

Colour output must preserve colour name, colour family, optional hex value, display-safe contrast check, symbolic basis, and review status.

Colour selection must not claim medical benefit, psychological treatment, guaranteed success, or divine certainty.

## 10. Mantra Interaction Doctrine

M06A does not score or generate mantras.

Mantra selection remains governed by M06 source, Sanskrit, no-invented-mantra, and risk classification rules.

If future scoring influences mantra selection, mantra gates must dominate all scoring logic.

A high symbolic score cannot bypass source review, Sanskrit review, restriction flags, or initiation-required flags.

## 11. Candidate Generation Doctrine

Future symbolic scoring must first generate candidate numbers or colours.

Each candidate must include:

- candidate_id;
- candidate_type;
- value;
- mapping_family;
- source_basis;
- eligible_contexts;
- review_status;
- public_safe_status.

A candidate without source or rule basis must not be scored.

## 12. Score Explanation Doctrine

Every future selected number or colour must have an explanation label.

Allowed explanation labels:

- selected from daily symbolic rotation;
- selected from weekday association;
- selected from tithi association;
- selected from reviewed observance context;
- selected from user preference with consent;
- selected from deity or theme association;
- selected from editorial curation;
- selected as generic non-personalized fallback.

The explanation must not expose private subscriber data.

## 13. Non-Randomness Doctrine

M06A prohibits purely random lucky number or colour selection.

If a rotation is used, it must be deterministic, versioned, and auditable.

Allowed non-random methods:

- date-indexed rotation;
- weekday-indexed rotation;
- tithi-indexed rotation;
- reviewed observance-indexed mapping;
- consented preference matching;
- curated editorial schedule.

Not allowed:

- hidden random selection;
- engagement-optimized manipulation;
- paid-tier bias without disclosure;
- fear-based selection;
- private-data inference.

## 14. Repetition Control Doctrine

Future scoring must avoid stale repetition.

Repetition control may apply penalties when:

- same number repeats too frequently;
- same colour repeats too frequently;
- same theme repeats too frequently;
- output becomes monotonous;
- fallback appears too often.

Repetition penalties must not override safety gates.

## 15. Uncertainty and Fallback Doctrine

If required context is uncertain, future scoring must degrade gracefully.

Examples:

- unknown tithi;
- approximate location;
- missing consent;
- source conflict;
- festival conflict;
- profile uncertainty;
- language ambiguity.

Allowed fallbacks:

- generic symbolic number;
- generic symbolic colour;
- reflection-only guidance;
- no personalized symbolic guidance today;
- human-review-required.

## 16. Safety and Privacy Doctrine

M06A must not use prohibited input categories.

Prohibited:

- inferred caste;
- inferred religion;
- inferred ethnicity;
- inferred health status;
- inferred political belief;
- inferred sexuality;
- inferred financial status;
- hidden behavioural targeting;
- private data without consent.

The scoring system must not manipulate vulnerable users through fear, urgency, or guaranteed outcomes.

## 17. Source Confidence Doctrine

Future mapping entries should have source confidence labels:

- reviewed_source;
- editorial_curated;
- traditional_association_pending_review;
- weak_source;
- source_conflict;
- not_allowed.

Only reviewed_source and editorial_curated may be used for normal symbolic scoring after approval.

Weak or conflicted sources require human review.

## 18. Audit Trace Doctrine

Every future symbolic scoring decision must preserve traceability.

Minimum trace fields:

- scoring_id;
- module_id;
- timestamp;
- candidate_set_id;
- scoring_formula_version;
- mapping_version;
- input_refs;
- consent_refs;
- weight_breakdown;
- penalties_applied;
- selected_candidate_id;
- fallback_used;
- explanation_label;
- review_status;
- public_output_allowed.

M06A does not implement this trace. It defines the requirement.

## 19. Calibration and Learning Doctrine

M06A inherits M04A.

Fortnightly or monthly review should check:

- stale repetition;
- excessive fallback;
- unclear explanations;
- user confusion;
- privacy concerns;
- weak source mappings;
- overuse of a number or colour;
- mismatch between context and selected output;
- safety or overclaiming risk.

Any tuning must be recorded through M04A learning register and calibration backlog.

## 20. Future Internal Scoring Contract

Future internal scoring output should include scoring_id, guidance_type, candidate_set, input_context, consent_basis, formula_version, mapping_version, weight_breakdown, penalties, selected_candidate, explanation_label, safety_label, audit_trace_id, review_status, and public_output_allowed.

This is not runtime code.

## 21. M06A Acceptance Criteria

M06A is complete when symbolic scoring doctrine, core scoring formula, weight doctrine, number mapping doctrine, colour mapping doctrine, mantra interaction doctrine, candidate generation doctrine, score explanation doctrine, non-randomness doctrine, repetition control doctrine, uncertainty fallback doctrine, source confidence doctrine, audit trace doctrine, calibration-learning doctrine, and safety/privacy doctrine are documented.

M06A must provide a machine-readable registry and validator confirming that no runtime, Auth, Supabase, payment, external API fetch, lucky number output, lucky colour output, mantra output, subscriber guidance, public guidance, DOB prediction, Kundli generation, horoscope generation, or automatic remedy is introduced.

## 22. M06A Status

M06A establishes symbolic scoring formula and mapping doctrine.

M06A does not implement live scoring or public subscriber output.
