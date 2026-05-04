# M09 — Internal Calculation Preview

Status: Methodology/Governance only  
Phase: M-Methodology  
Depends on: M00, M01, M02, M03, M04, M04A, M05, M06, M06A, M07, M08  
Runtime impact: None  
Subscriber impact: None  
Public API impact: None  

## 1. Purpose

M09 defines Drishvara’s methodology for future internal calculation previews.

M09 does not execute live Panchang calculation, festival calculation, event-window calculation, symbolic scoring, personalization scoring, subscriber guidance, public output, API routes, dashboard cards, Auth, Supabase, payment, or external API fetch.

M09 exists to define how internal reviewers may later inspect calculation estimates, rule decisions, conflicts, source status, privacy redactions, and readiness before any public or subscriber-facing activation.

## 2. Core Preview Doctrine

Internal preview means review-only visibility.

It must not be confused with public output, subscriber output, premium output, or production runtime.

Every future internal preview must clearly show:

- preview status;
- input basis;
- calculation basis;
- source basis;
- rule basis;
- confidence label;
- conflict flags;
- review gates;
- privacy redactions;
- safety status;
- audit trace;
- public output permission.

By default, public output permission must be false.

## 3. Explicit Exclusions

M09 does not implement live calculation, preview runtime, server endpoints, API routes, Auth, Supabase, payment, subscription entitlement, external API fetch, geocoding API, Panchang runtime, festival runtime, lucky number runtime, lucky colour runtime, mantra runtime, personalization runtime, dashboard card rendering, public Panchang output, public festival output, public guidance, or subscriber output.

M09 does not publish calculation results.

M09 does not allow internal preview to be shown publicly.

## 4. Relationship with Earlier Modules

M09 inherits M00 source doctrine, Sanskrit integrity, privacy doctrine, and output safety doctrine.

M09 inherits M01 Panchang calculation output contract.

M09 inherits M02 tithi, vrat, fasting-day, and conflict handling doctrine.

M09 inherits M03 named observance registry and activation status doctrine.

M09 inherits M04 location, timezone, sunrise, sunset, moonrise, Pradosh, and Parana basis doctrine.

M09 inherits M04A validation, calibration, learning register, and database tuning doctrine.

M09 inherits M05 consent-first profile input methodology.

M09 inherits M06 safe symbolic guidance and no-invented-mantra doctrine.

M09 inherits M06A symbolic scoring formula and mapping doctrine.

M09 inherits M07 subscriber personalization scoring logic.

M09 inherits M08 server-side API contract, response envelope, internal preview, audit trace, and safety gate doctrine.

## 5. Internal Preview Types

M09 recognises the following future preview types:

- Panchang element preview;
- tithi interval preview;
- vrat or fasting-day rule preview;
- named observance registry preview;
- location and event-window preview;
- validation discrepancy preview;
- profile input redaction preview;
- symbolic guidance scoring preview;
- personalization scoring preview;
- API response envelope preview;
- readiness gate preview.

These are preview categories only. They do not activate runtime.

## 6. Preview Access Doctrine

Future internal previews must be restricted to reviewer roles.

Possible future reviewer roles:

- methodology_reviewer;
- source_reviewer;
- sanskrit_reviewer;
- calculation_reviewer;
- observance_rule_reviewer;
- privacy_reviewer;
- safety_reviewer;
- activation_reviewer;
- admin_reviewer.

M09 does not implement roles or authentication.

## 7. Preview Input Doctrine

Every future internal preview must preserve input trace.

Required input areas:

- date or date range;
- location basis;
- timezone basis;
- calculation basis;
- source basis;
- rule family;
- observance ID where applicable;
- profile input reference where applicable;
- consent reference where applicable;
- entitlement reference where applicable;
- preview reason;
- reviewer note.

No preview should run on hidden or unexplained inputs.

## 8. Panchang Element Preview Doctrine

A future Panchang element preview should show:

- tithi;
- vara;
- nakshatra;
- yoga;
- karana;
- sunrise basis;
- ayanamsha basis;
- ephemeris basis;
- start and end intervals;
- skipped or repeated flags;
- confidence label;
- source review status;
- calculation review status.

M09 does not calculate these values.

## 9. Tithi / Vrat Rule Preview Doctrine

A future vrat rule preview should show:

- tithi target;
- paksha target;
- month target;
- sunrise relation;
- sunset or Pradosh relation;
- moonrise relation;
- Parana relation;
- skipped or repeated tithi conflict;
- regional variant;
- sampradaya variant;
- rule decision status;
- human review requirement.

M09 does not decide vrat dates.

## 10. Festival Registry Preview Doctrine

A future festival registry preview should show:

- observance_id;
- display name;
- category;
- rule family references;
- activation status;
- source review status;
- Sanskrit review status;
- calculation review status;
- regional review status;
- sampradaya review status;
- public output permission.

Draft, pending, conflicted, or review-required entries must remain non-public.

## 11. Location and Event Window Preview Doctrine

A future event-window preview should show:

- location label;
- coordinate precision;
- timezone ID;
- sunrise basis;
- sunset basis;
- moonrise basis;
- Pradosh window basis;
- Parana window basis;
- approximation flags;
- polar or extreme-latitude flags;
- review status;
- public-safe location label.

M09 does not calculate event windows.

## 12. Validation Discrepancy Preview Doctrine

M09 must support future preview of M04A validation findings.

A discrepancy preview should show:

- validation cycle ID;
- target type;
- Drishvara proposed value;
- reference value;
- match status;
- severity;
- suspected cause;
- source reference;
- tuning recommendation;
- learning record reference;
- backlog status;
- approval status.

No discrepancy correction may be automatically applied by M09.

## 13. Profile Input Redaction Preview Doctrine

A future profile preview must protect private data.

It should show:

- profile completeness label;
- consent status;
- allowed fields;
- blocked fields;
- redacted fields;
- uncertainty flags;
- privacy flags;
- public-safe display labels;
- fallback eligibility.

It must not expose full DOB, exact birth location, precise coordinates, private spiritual preferences, or subscription status publicly.

## 14. Symbolic Guidance Preview Doctrine

A future symbolic preview should show:

- candidate set;
- number or colour mapping family;
- selection basis;
- scoring basis;
- source confidence;
- fallback status;
- explanation label;
- safety label;
- M06 no-invented-mantra status where mantra is involved.

M09 does not output live lucky numbers, lucky colours, or mantras.

## 15. Personalization Scoring Preview Doctrine

A future personalization scoring preview should show:

- allowed features;
- excluded features;
- consent basis;
- privacy basis;
- safety gate result;
- score breakdown;
- weight version;
- fallback status;
- selected guidance category;
- personalization depth;
- public output permission.

A high relevance score must not override consent, privacy, source, Sanskrit, or safety gates.

## 16. API Response Envelope Preview Doctrine

M09 must support future preview of M08-style response envelopes.

The preview should show:

- request ID;
- module ID;
- operation;
- status;
- data shape;
- warnings;
- errors;
- source basis;
- consent basis;
- entitlement basis;
- privacy basis;
- safety basis;
- audit trace ID;
- public output allowed;
- human review required.

M09 does not create API endpoints.

## 17. Preview Status Doctrine

Preview records must use clear status values:

- draft_preview;
- methodology_only;
- internal_review_only;
- source_review_pending;
- sanskrit_review_pending;
- calculation_review_pending;
- privacy_review_pending;
- safety_review_pending;
- conflict_detected;
- human_review_required;
- ready_for_internal_preview;
- ready_for_m10_readiness_review;
- disabled.

Public-ready is not a valid M09 default status.

## 18. Conflict Flag Doctrine

Internal previews must preserve conflict flags.

Required conflict families:

- source_conflict;
- Sanskrit_conflict;
- calculation_conflict;
- tithi_boundary_conflict;
- skipped_tithi_conflict;
- repeated_tithi_conflict;
- location_timezone_conflict;
- event_window_conflict;
- regional_variant_conflict;
- sampradaya_variant_conflict;
- privacy_conflict;
- entitlement_conflict;
- safety_conflict;
- insufficient_evidence.

Conflicts must not be flattened for convenience.

## 19. Reviewer Decision Doctrine

A future reviewer may assign:

- no_action;
- request_source_review;
- request_sanskrit_review;
- request_calculation_review;
- request_rule_review;
- request_privacy_review;
- request_safety_review;
- create_learning_record;
- create_tuning_backlog_item;
- mark_internal_preview_ready;
- mark_disabled.

M09 does not implement reviewer actions. It defines them.

## 20. Audit Trace Doctrine

Every future preview must preserve audit trace.

Minimum fields:

- preview_id;
- module_id;
- preview_type;
- timestamp;
- reviewer_role;
- input_refs;
- source_refs;
- calculation_refs;
- rule_refs;
- consent_refs;
- entitlement_refs;
- privacy_redactions;
- conflict_flags;
- reviewer_decision;
- public_output_allowed.

## 21. Redaction Doctrine

Internal previews must support redaction levels:

- public_safe;
- reviewer_visible;
- restricted_reviewer_only;
- private_redacted;
- blocked.

Preview exports must default to redacted form.

## 22. Preview Export Doctrine

M09 does not generate files or exports.

Future exports must preserve:

- export purpose;
- reviewer identity;
- redaction level;
- timestamp;
- included fields;
- excluded fields;
- audit trace ID;
- public sharing allowed flag.

Public sharing must default to false.

## 23. M04A Learning Connection

M09 inherits M04A.

Preview findings may create learning records or calibration backlog items.

Any proposed correction must pass review before methodology or database tuning.

M09 must not automatically mutate records.

## 24. M10 Readiness Connection

M09 prepares the evidence base for M10.

M10 may later review whether methodology modules are ready for activation, internal preview, limited pilot, or continued blocking.

M09 itself does not activate anything.

## 25. Safety Doctrine

M09 must avoid public-facing certainty.

Internal preview must not contain language that implies:

- guaranteed correctness;
- universal festival finality;
- guaranteed prediction;
- mandatory ritual;
- fear-based warning;
- medical, legal, financial, or professional replacement;
- identity-based judgement.

Internal preview should use labels such as estimate, pending review, conflict detected, source review required, safety review required, and human review required.

## 26. Future Internal Preview Contract

A future preview record should include preview_id, preview_type, module_refs, input_context, calculation_context, source_context, rule_context, profile_context_if_applicable, consent_context, entitlement_context, privacy_context, preview_payload, warnings, errors, conflict_flags, reviewer_decision, audit_trace_id, review_status, export_allowed, and public_output_allowed.

This is not runtime code.

## 27. M09 Acceptance Criteria

M09 is complete when internal preview doctrine, preview types, preview access doctrine, preview input doctrine, Panchang preview, vrat rule preview, festival registry preview, location/event-window preview, validation discrepancy preview, profile redaction preview, symbolic preview, personalization preview, API envelope preview, preview status doctrine, conflict flag doctrine, reviewer decision doctrine, audit trace doctrine, redaction doctrine, preview export doctrine, M04A learning connection, M10 readiness connection, and safety doctrine are documented.

M09 must provide a machine-readable registry and validator confirming that no runtime, server endpoint, Auth, Supabase, payment, external API fetch, public output, subscriber output, dashboard card, live calculation, live preview, or automatic database mutation is introduced.

## 28. M09 Status

M09 establishes Internal Calculation Preview methodology.

M09 does not implement live preview or public output.
