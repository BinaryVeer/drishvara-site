# M08 — Server-side API Contract

Status: Methodology/Governance only  
Phase: M-Methodology  
Depends on: M00, M01, M02, M03, M04, M04A, M05, M06, M06A, M07  
Runtime impact: None  
Subscriber impact: None  
Public API impact: None  

## 1. Purpose

M08 defines Drishvara’s future server-side API contract methodology.

M08 does not create live API routes, server handlers, Auth, Supabase, payment, subscriber login, subscription enforcement, public Panchang output, public festival output, live personalization, lucky number output, lucky colour output, mantra output, or dashboard cards.

M08 is a contract-only layer for future implementation.

## 2. Core API Doctrine

Drishvara API contracts must be source-first, privacy-first, consent-gated, entitlement-aware, auditable, versioned, and safe by default.

Every future API response must separate:

- raw calculation;
- rule interpretation;
- source basis;
- personalization basis;
- consent basis;
- entitlement basis;
- safety status;
- audit trace;
- public output permission.

No future API may silently mix calculation, observance decision, and subscriber guidance.

## 3. Explicit Exclusions

M08 does not implement live API endpoints, server runtime, middleware, Auth, Supabase, database connection, payment gateway, subscription billing, external API fetch, live Panchang calculation, live festival calculation, live subscriber guidance, live lucky number, live lucky colour, live mantra, live personalization scoring, dashboard card rendering, public routes, or premium gating runtime.

M08 defines contracts only.

## 4. Relationship with Earlier Modules

M08 inherits M00 source doctrine, Sanskrit integrity, privacy doctrine, and output safety doctrine.

M08 inherits M01 calculation disclosure requirements.

M08 inherits M02 vrat and fasting-day rule framework.

M08 inherits M03 named observance registry structure.

M08 inherits M04 location, timezone, sunrise, sunset, moonrise, Pradosh, and Parana basis.

M08 inherits M04A validation, calibration, and learning register doctrine.

M08 inherits M05 consent-first profile methodology.

M08 inherits M06 symbolic guidance safety and no-invented-mantra doctrine.

M08 inherits M06A symbolic scoring formula and mapping doctrine.

M08 inherits M07 subscriber personalization scoring logic.

## 5. API Versioning Doctrine

Future APIs must be versioned.

Recommended future version pattern:

- /api/v1/methodology/status
- /api/v1/panchang/estimate
- /api/v1/observance/registry
- /api/v1/location/resolve
- /api/v1/profile/inputs
- /api/v1/guidance/symbolic
- /api/v1/personalization/score
- /api/v1/consent/status
- /api/v1/entitlement/status
- /api/v1/audit/trace

M08 does not create these routes.

## 6. Request Envelope Doctrine

Every future request should use a standard request envelope.

Required request envelope fields:

- api_version;
- request_id;
- request_timestamp;
- client_context;
- requested_module;
- requested_operation;
- consent_context;
- entitlement_context;
- privacy_context;
- payload;
- debug_mode_requested;
- public_output_requested.

Requests must not assume consent or entitlement.

## 7. Response Envelope Doctrine

Every future response should use a standard response envelope.

Required response envelope fields:

- api_version;
- request_id;
- response_timestamp;
- module_id;
- operation;
- status;
- data;
- warnings;
- errors;
- source_basis;
- consent_basis;
- entitlement_basis;
- privacy_basis;
- safety_basis;
- audit_trace_id;
- public_output_allowed;
- human_review_required.

The response must make clear whether output is calculation-only, internal-preview-only, subscriber-personalized, premium-gated, or public-safe.

## 8. Error Taxonomy Doctrine

Future APIs should use a stable error taxonomy.

Required error families:

- validation_error;
- missing_consent;
- insufficient_entitlement;
- privacy_blocked;
- source_review_pending;
- sanskrit_review_pending;
- calculation_review_pending;
- location_review_pending;
- observance_rule_review_pending;
- safety_blocked;
- human_review_required;
- conflict_detected;
- unsupported_region;
- unsupported_timezone;
- unavailable_feature;
- internal_methodology_disabled.

Errors must be safe and non-alarming.

## 9. Consent Gate Contract

Future APIs must check consent before using subscriber-specific inputs.

Consent gate response must preserve:

- consent_required;
- consent_present;
- consent_scope;
- consent_version;
- consent_timestamp;
- consent_revocable;
- data_fields_allowed;
- data_fields_blocked;
- fallback_allowed.

If consent is missing, API must return generic fallback or no personalized output.

## 10. Entitlement Gate Contract

Future APIs must separate entitlement from consent.

Entitlement gate response must preserve:

- entitlement_required;
- entitlement_present;
- entitlement_level;
- allowed_features;
- blocked_features;
- premium_locked_cards;
- free_fallback_available;
- reason_code.

Entitlement must not override missing consent or safety block.

## 11. Privacy Gate Contract

Future APIs must enforce privacy redaction.

Privacy gate response must preserve:

- privacy_status;
- redacted_fields;
- public_safe_fields;
- internal_only_fields;
- retention_label;
- purpose_label;
- data_minimization_status;
- deletion_export_eligible;
- audit_required.

API responses must not expose exact DOB, exact birth location, precise coordinates, private spiritual preferences, or subscription status publicly.

## 12. Panchang Estimate Contract

Future Panchang estimate APIs may expose only reviewed calculation estimates.

The future contract must separate:

- input date;
- location basis;
- timezone basis;
- sunrise basis;
- tithi;
- vara;
- nakshatra;
- yoga;
- karana;
- calculation basis;
- ayanamsha basis;
- ephemeris basis;
- confidence label;
- conflict flags;
- public output permission.

M08 does not calculate Panchang.

## 13. Observance Registry Contract

Future observance APIs must use M03 registry IDs.

The future contract must preserve:

- observance_id;
- display_name;
- category;
- rule_family_refs;
- activation_status;
- source_review_status;
- sanskrit_review_status;
- calculation_review_status;
- regional_variant_status;
- sampradaya_variant_status;
- public_output_allowed.

Draft or pending entries must not be treated as public-ready.

## 14. Location and Event Window Contract

Future location/event-window APIs must preserve M04 basis.

The future contract must include:

- location_id;
- public_safe_location_label;
- coordinate_precision;
- timezone_id;
- sunrise;
- sunset;
- moonrise;
- pradosh_window;
- parana_window;
- basis_disclosure;
- approximation_flags;
- edge_case_flags;
- review_status.

M08 does not resolve geocoding or calculate event windows.

## 15. Profile Input Contract

Future subscriber profile APIs must preserve M05 consent-first structure.

The future contract must include:

- profile_id;
- consent_status;
- name_record;
- dob_record;
- birth_time_record;
- birth_location_record;
- current_location_record;
- language_preference;
- script_preference;
- spiritual_preference;
- uncertainty_flags;
- privacy_flags;
- public_output_allowed.

Private profile fields must be redacted unless explicitly needed and authorized.

## 16. Symbolic Guidance Contract

Future symbolic guidance APIs must preserve M06 and M06A requirements.

The future contract must include:

- guidance_type;
- selected_value;
- selection_basis;
- scoring_basis;
- source_reference_if_applicable;
- consent_basis;
- personalization_level;
- confidence_label;
- explanation_label;
- safety_label;
- review_status;
- public_output_allowed.

No API may output generated or invented mantras.

## 17. Personalization Scoring Contract

Future personalization scoring APIs must preserve M07 structure.

The future contract must include:

- scoring_id;
- subscriber_context_ref;
- consent_basis;
- feature_set;
- excluded_features;
- formula_version;
- weight_breakdown;
- score_breakdown;
- safety_gate_result;
- privacy_gate_result;
- entitlement_gate_result;
- fallback_status;
- selected_guidance_category;
- explanation_label;
- personalization_depth;
- audit_trace_id;
- review_status;
- public_output_allowed.

A high personalization score cannot override safety, consent, privacy, source, or Sanskrit review gates.

## 18. Internal Preview Contract

Future internal preview APIs must be clearly marked internal-only.

Internal preview responses must include:

- internal_preview_only;
- reviewer_role_required;
- source_review_status;
- safety_review_status;
- human_review_required;
- not_public_output;
- audit_trace_id.

Internal preview must not leak into public or subscriber output.

## 19. Dashboard Card Contract

Future dashboard cards must be API-safe and gate-aware.

A future card contract should include:

- card_id;
- card_type;
- title;
- summary;
- data_payload;
- locked_state;
- entitlement_required;
- consent_required;
- source_status;
- safety_status;
- explanation_label;
- public_safe;
- audit_trace_id.

M08 does not create dashboard cards.

## 20. Audit Trace Contract

Every future API response must support audit trace.

Minimum audit trace fields:

- audit_trace_id;
- request_id;
- module_id;
- operation;
- timestamp;
- input_refs;
- consent_refs;
- entitlement_refs;
- source_refs;
- calculation_refs;
- rule_refs;
- privacy_redactions;
- safety_gate_result;
- fallback_used;
- reviewer_status;
- public_output_allowed.

## 21. Security and Rate-Limit Doctrine

M08 does not implement security middleware.

Future APIs must define:

- authentication requirement;
- authorization scope;
- rate-limit policy;
- abuse-detection policy;
- sensitive-field redaction;
- logging minimization;
- audit retention;
- error-message safety.

No security feature is activated in M08.

## 22. Caching Doctrine

Future APIs may use caching only where safe.

Caching must not expose private subscriber data.

Cache records must distinguish:

- public static methodology;
- public-safe generic data;
- internal-only calculation preview;
- subscriber-specific private data;
- premium-gated data.

Subscriber-specific private data must not be cached in public caches.

## 23. Status and Readiness Doctrine

Future APIs must expose readiness only in safe form.

Readiness labels:

- methodology_only;
- internal_preview_only;
- source_review_pending;
- safety_review_pending;
- privacy_review_pending;
- entitlement_review_pending;
- public_ready;
- disabled.

M08 APIs default to methodology_only.

## 24. Validation and Learning Connection

M08 inherits M04A.

API contract issues, mismatch cases, confusing errors, privacy redaction issues, and unsafe response patterns must be recorded through the learning register and calibration backlog before tuning.

## 25. Safety Doctrine

API responses must not create fear, certainty, or religious coercion.

Not allowed:

- guaranteed outcome;
- divine certainty;
- harm warning for non-compliance;
- medical/legal/financial replacement;
- identity-based guidance;
- hidden data use.

Allowed:

- methodology-only status;
- source-based estimate;
- reviewed internal preview;
- safe generic fallback;
- human-review-required response.

## 26. Future API Contract Summary

Future server-side API contracts must be versioned, consent-aware, entitlement-aware, privacy-redacted, source-traceable, safety-gated, audit-ready, and non-deterministic where guidance is concerned.

M08 does not implement any live API endpoint.

## 27. M08 Acceptance Criteria

M08 is complete when API versioning, request envelope, response envelope, error taxonomy, consent gate, entitlement gate, privacy gate, Panchang estimate contract, observance registry contract, location/event-window contract, profile input contract, symbolic guidance contract, personalization scoring contract, internal preview contract, dashboard card contract, audit trace contract, security/rate-limit doctrine, caching doctrine, readiness doctrine, validation-learning connection, and safety doctrine are documented.

M08 must provide a machine-readable registry and validator confirming that no runtime, server endpoint, Auth, Supabase, payment, external API fetch, public Panchang output, public festival output, subscriber output, premium guidance, lucky number output, colour output, mantra output, personalization runtime, or dashboard card is introduced.

## 28. M08 Status

M08 establishes the Server-side API Contract methodology.

M08 does not implement live API routes or public output.
