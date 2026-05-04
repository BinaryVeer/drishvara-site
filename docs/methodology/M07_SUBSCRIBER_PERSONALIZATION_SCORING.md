# M07 — Subscriber Personalization Scoring Logic

Status: Methodology/Governance only  
Phase: M-Methodology  
Depends on: M00, M01, M02, M03, M04, M04A, M05, M06, M06A  
Runtime impact: None  
Subscriber impact: None  
Public guidance impact: None  

## 1. Purpose

M07 defines Drishvara’s methodology for future subscriber personalization scoring.

M07 does not generate live subscriber guidance, dashboard cards, premium output, fortune prediction, lucky number, lucky colour, mantra, what-to-do advice, what-not-to-do advice, Auth, Supabase, payment, external API fetch, DOB prediction, Kundli, horoscope, or public dynamic guidance.

M07 is a scoring methodology layer only.

## 2. Subscriber Personalization Scoring Doctrine

Subscriber personalization scoring means ranking or selecting future guidance categories based on consented, reviewed, privacy-safe inputs.

It does not mean predicting destiny, guaranteeing outcomes, assigning spiritual worth, or deciding what a user must do.

Personalization scoring must be explainable, auditable, consent-gated, and non-coercive.

## 3. Personalization Is Not Prediction Doctrine

M07 explicitly separates personalization from prediction.

Allowed future framing:

- guidance relevance score;
- profile-fit score;
- context-fit score;
- confidence score;
- safety score;
- explanation score;
- fallback score.

Not allowed:

- fate score;
- spiritual superiority score;
- destiny certainty score;
- karmic judgment score;
- fear or danger score;
- caste, religion, ethnicity, or community inference score.

## 4. Explicit Exclusions

M07 does not implement subscriber login, subscriber profile runtime, personalization runtime, dashboard cards, premium guidance, fortune output, DOB prediction, Kundli generation, horoscope generation, lucky number output, lucky colour output, mantra output, what-to-do output, what-not-to-do output, Auth, Supabase, payment, subscription entitlement, external API fetch, behavioural targeting, or public guidance.

M07 does not infer caste, religion, ethnicity, community, health status, financial status, political belief, sexuality, or social identity.

## 5. Relationship with Earlier Modules

M07 inherits M00 source doctrine, privacy doctrine, Sanskrit integrity, and output safety doctrine.

M07 inherits M05 consent-first profile input methodology.

M07 inherits M06 safe symbolic guidance methodology.

M07 inherits M06A symbolic scoring formula and mapping doctrine.

M07 inherits M04A validation, calibration, and learning register doctrine.

M07 may later feed M08 API contract and M09 internal preview, but only after safety gates.

## 6. Consent and Entitlement Separation Doctrine

Consent and entitlement must remain separate.

Consent answers: what data may be used?

Entitlement answers: which service level may access which reviewed feature?

A premium subscriber without consent must not receive personalized DOB/location-based guidance.

A consented subscriber without premium entitlement may receive only the allowed free-level output.

M07 does not implement entitlement. It defines that personalization scoring must check consent before entitlement and safety before both.

## 7. Allowed Input Feature Families

Future scoring may use only reviewed and consented feature families.

Allowed families:

- generic date context;
- weekday context;
- tithi context;
- observance context;
- festival context;
- location context with consent;
- timezone context with consent;
- language preference;
- script preference;
- spiritual preference with consent;
- deity or theme preference with consent;
- profile completeness label;
- uncertainty label;
- M06A symbolic score context;
- user-selected no-preference status;
- internal review status.

## 8. Restricted Input Feature Families

Restricted input families require explicit consent and purpose limitation:

- name;
- date of birth;
- birth time;
- birth location;
- current location;
- historical interaction preference;
- saved spiritual preference;
- saved language preference.

If consent is absent, these features must be excluded from scoring.

## 9. Prohibited Feature Families

M07 prohibits scoring based on:

- inferred caste;
- inferred religion;
- inferred ethnicity;
- inferred community;
- inferred health status;
- inferred political belief;
- inferred sexuality;
- inferred financial status;
- inferred vulnerability;
- hidden behavioural targeting;
- fear response;
- manipulation likelihood;
- payment pressure likelihood.

## 10. Feature Weight Doctrine

Future personalization scoring must use declared weights.

Weights must be versioned, reviewable, and explainable.

A future scoring model may include:

- generic_context_weight;
- location_context_weight;
- language_fit_weight;
- script_fit_weight;
- spiritual_preference_weight;
- deity_theme_weight;
- observance_context_weight;
- M06A_symbolic_score_weight;
- profile_completeness_weight;
- uncertainty_penalty;
- privacy_penalty;
- safety_penalty;
- repetition_penalty;
- fallback_boost.

Weights must not be hidden from internal review.

## 11. Core Personalization Formula

Future personalization score may conceptually follow:

Personalization Score equals context relevance plus consented preference fit plus language fit plus location fit plus observance fit plus symbolic score fit plus profile completeness fit minus uncertainty penalty minus privacy penalty minus safety penalty minus repetition penalty.

This formula is conceptual and methodology-only.

M07 does not implement runtime scoring.

## 12. Score Types

Future scoring should separate different score types:

- relevance_score;
- confidence_score;
- safety_score;
- consent_score;
- explanation_score;
- personalization_depth_score;
- fallback_score;
- repetition_score;
- review_readiness_score.

A high relevance score cannot override a low safety score.

## 13. Guidance Card Eligibility Doctrine

Future dashboard or guidance cards must be eligible only if gates pass.

Possible future guidance card families:

- generic daily reflection;
- Panchang context card;
- festival context card;
- symbolic number card;
- symbolic colour card;
- reviewed mantra card;
- what-to-do suggestion card;
- what-not-to-do suggestion card;
- premium deeper guidance card;
- internal review-only card.

M07 does not generate these cards. It only defines future eligibility scoring.

## 14. Daily Guidance Category Scoring

Future daily guidance may rank categories such as:

- reflection;
- Panchang awareness;
- festival awareness;
- devotional suggestion;
- mantra suggestion;
- lucky number;
- lucky colour;
- what to do;
- what not to do;
- premium insight.

Each category must carry consent requirements, source requirements, safety requirements, entitlement requirements, and fallback status.

## 15. What To Do / What Not To Do Scoring

Future what-to-do and what-not-to-do guidance must be low-risk, reflective, and non-coercive.

Allowed examples of future category types:

- mindful conduct;
- simple devotion;
- reading or reflection;
- gratitude;
- restraint in speech;
- planning or discipline;
- charity or service suggestion;
- avoid overreaction;
- avoid unnecessary conflict.

Not allowed:

- medical instruction;
- legal instruction;
- financial instruction;
- fear-based prohibition;
- caste/community-based behaviour;
- guaranteed remedy;
- harmful fasting instruction;
- unsafe ritual instruction.

## 16. Personalization Depth Doctrine

Future personalization depth must be labelled.

Depth levels:

- generic;
- context_aware;
- location_aware;
- preference_aware;
- profile_aware;
- premium_reviewed;
- human_review_required.

Depth level must not imply spiritual superiority.

## 17. Uncertainty and Fallback Doctrine

If required input is uncertain, missing, unconsented, conflicted, or unsafe, scoring must degrade gracefully.

Allowed fallbacks:

- generic daily reflection;
- generic Panchang context;
- non-personalized symbolic guidance;
- no mantra today;
- no personalized guidance today;
- human-review-required.

Fallback must not shame the subscriber or reveal private-data absence.

## 18. Repetition and Freshness Doctrine

Future personalization scoring must avoid stale repetition.

It may apply repetition penalties when the same guidance category, number, colour, mantra, or theme repeats too frequently.

Freshness must not override safety, source, consent, or privacy gates.

## 19. Safety Gate Doctrine

Safety gate dominates all scoring.

If output is unsafe, unreviewed, restricted, fear-based, deterministic, manipulative, or privacy-violating, it must not be shown.

The safety gate may force:

- no output;
- generic fallback;
- human-review-required;
- internal-only preview.

## 20. Privacy and Minimization Doctrine

M07 scoring must use the minimum necessary data.

It must preserve:

- input purpose;
- consent status;
- feature inclusion/exclusion reason;
- privacy label;
- public-safe explanation;
- audit trace.

Private data must not be exposed in explanation labels.

## 21. Explanation Doctrine

Future personalized output must include simple explanation labels without revealing sensitive inputs.

Allowed explanation labels:

- based on today’s general context;
- based on reviewed Panchang context;
- based on your consented preferences;
- based on your selected language/script preference;
- selected as a generic fallback;
- selected after safety review.

Not allowed:

- based on inferred identity;
- based on hidden behaviour;
- based on private DOB details shown publicly;
- based on your caste/religion/community;
- because bad luck is likely.

## 22. M06A Integration Doctrine

M07 may consume M06A symbolic scoring only as an input.

M07 must not override M06A non-randomness, source confidence, safety, privacy, repetition, fallback, and audit requirements.

A symbolic score may inform personalization depth but cannot bypass consent, source, or safety gates.

## 23. M04A Calibration Learning Doctrine

M07 inherits M04A.

Fortnightly or monthly review should check:

- inappropriate personalization;
- over-personalization;
- stale recommendations;
- fallback frequency;
- consent-gate failures;
- privacy concerns;
- explanation confusion;
- user feedback;
- source conflicts;
- safety incidents.

Corrections must be recorded through the learning register and calibration backlog.

## 24. Audit Trace Doctrine

Every future personalization score must preserve audit trace.

Minimum trace fields:

- scoring_id;
- profile_id;
- consent_refs;
- input_feature_refs;
- excluded_feature_refs;
- formula_version;
- weight_version;
- safety_gate_result;
- privacy_gate_result;
- entitlement_gate_result;
- selected_guidance_category;
- fallback_used;
- explanation_label;
- review_status;
- public_output_allowed.

M07 does not implement this trace. It defines the requirement.

## 25. Output Contract Doctrine

Future personalization scoring output should include scoring_id, subscriber_context_ref, consent_basis, feature_set, excluded_features, formula_version, weight_breakdown, score_breakdown, safety_gate_result, privacy_gate_result, fallback_status, selected_guidance_category, explanation_label, personalization_depth, audit_trace_id, review_status, and public_output_allowed.

This is not runtime code.

## 26. Safety Doctrine

M07 prohibits deterministic, fear-based, manipulative, or identity-inferential personalization.

Not allowed:

- Your DOB guarantees this event.
- Your name proves this destiny.
- You must do this or harm will occur.
- You are spiritually better because your profile is complete.
- This is based on your inferred caste, religion, ethnicity, or community.
- This replaces medical, legal, financial, or professional advice.

Allowed:

- optional reflective guidance;
- consented symbolic personalization;
- reviewed devotional suggestion;
- generic fallback;
- human-review-required label.

## 27. M07 Acceptance Criteria

M07 is complete when subscriber personalization scoring doctrine, consent-entitlement separation, allowed/restricted/prohibited feature families, feature weight doctrine, core formula, score types, guidance card eligibility, daily guidance category scoring, what-to-do/what-not-to-do scoring, personalization depth, uncertainty fallback, repetition/freshness, safety gate, privacy minimization, explanation doctrine, M06A integration, M04A calibration-learning, audit trace, and output contract are documented.

M07 must provide a machine-readable registry and validator confirming that no runtime, Auth, Supabase, payment, external API fetch, subscriber output, public guidance, fortune output, DOB prediction, Kundli generation, horoscope generation, lucky number output, colour output, mantra output, dashboard card, or automatic remedy is introduced.

## 28. M07 Status

M07 establishes Subscriber Personalization Scoring Logic.

M07 does not implement live personalization or public subscriber output.
