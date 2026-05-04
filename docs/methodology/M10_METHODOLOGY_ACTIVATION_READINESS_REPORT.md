# M10 — Methodology Activation Readiness Report

Status: Methodology/Governance only  
Phase: M-Methodology  
Depends on: M00, M01, M02, M03, M04, M04A, M05, M06, M06A, M07, M08, M09  
Runtime impact: None  
Subscriber impact: None  
Public API impact: None  

## 1. Purpose

M10 defines Drishvara’s methodology activation readiness framework.

M10 consolidates the M-methodology stack and defines the evidence, gates, blockers, review sign-offs, readiness levels, and go/no-go criteria required before any later implementation, internal preview, limited pilot, or public activation.

M10 does not activate runtime, Auth, Supabase, payment, external API fetch, public Panchang, public festival dates, subscriber guidance, API routes, dashboard cards, premium guidance, internal preview execution, or automatic database mutation.

## 2. Core Readiness Doctrine

Methodology completion is not the same as activation readiness.

A module may be methodologically complete but still not ready for runtime.

M10 requires each future activation decision to pass:

- source readiness;
- Sanskrit readiness;
- calculation readiness;
- location and time readiness;
- observance rule readiness;
- validation and learning readiness;
- privacy readiness;
- consent readiness;
- entitlement readiness;
- safety readiness;
- API contract readiness;
- internal preview readiness;
- operational readiness.

No module may bypass review because it has documentation.

## 3. Explicit Exclusions

M10 does not implement live calculation, public output, subscriber output, Auth, Supabase, payment, subscription entitlement, external API fetch, API routes, internal preview runtime, dashboard cards, premium guidance, lucky number output, lucky colour output, mantra output, personalization runtime, database mutation, geocoding, or background jobs.

M10 does not approve public launch.

M10 does not approve paid launch.

M10 is a readiness-report methodology only.

## 4. Relationship with Earlier Modules

M10 depends on all prior M-methodology modules:

- M00 Source Doctrine and Sanskrit Integrity Framework;
- M01 Panchang Calculation Methodology Specification;
- M02 Tithi / Vrat / Fasting-Day Rule Engine;
- M03 Festival Rule Registry;
- M04 Location / Timezone / Sunrise Basis;
- M04A Periodic Validation, Calibration and Learning Register;
- M05 Name / DOB / Location Methodology;
- M06 Lucky Number / Colour / Mantra Selection Methodology;
- M06A Symbolic Scoring Formula and Mapping Doctrine;
- M07 Subscriber Personalization Scoring Logic;
- M08 Server-side API Contract;
- M09 Internal Calculation Preview.

M10 does not replace any module. It checks whether each module has sufficient evidence for the next stage.

## 5. Readiness Level Doctrine

M10 defines readiness levels.

Allowed readiness levels:

- methodology_complete;
- evidence_missing;
- source_review_pending;
- sanskrit_review_pending;
- calculation_review_pending;
- validation_pending;
- privacy_review_pending;
- safety_review_pending;
- internal_preview_candidate;
- limited_pilot_candidate;
- public_activation_candidate;
- activation_blocked;
- disabled.

All modules default to methodology_complete or activation_blocked until evidence review is performed.

## 6. Activation Stage Doctrine

Future activation must be staged.

Allowed future stages:

- methodology_only;
- internal_data_review;
- internal_calculation_preview;
- internal_guidance_preview;
- limited_staff_pilot;
- limited_subscriber_pilot;
- public_generic_output;
- public_personalized_output;
- premium_output;
- disabled.

M10 itself keeps all stages at methodology_only or activation_blocked.

## 7. Go / No-Go Gate Doctrine

A future go decision requires all relevant gates to pass.

Required gates:

- source_gate;
- Sanskrit_gate;
- calculation_gate;
- location_timezone_gate;
- event_window_gate;
- observance_rule_gate;
- validation_learning_gate;
- privacy_gate;
- consent_gate;
- entitlement_gate;
- safety_gate;
- API_contract_gate;
- internal_preview_gate;
- audit_trace_gate;
- operational_gate.

Any failed critical gate results in no-go.

## 8. Critical Blocker Doctrine

Critical blockers include:

- invented mantra risk;
- unsupported Sanskrit claim;
- unreviewed source;
- calculation basis unknown;
- ayanamsha basis unknown;
- ephemeris basis unknown;
- sunrise basis unresolved;
- location or timezone ambiguity;
- skipped or repeated tithi unresolved;
- festival source conflict unresolved;
- regional or sampradaya conflict hidden;
- consent missing;
- privacy redaction missing;
- safety gate failed;
- deterministic or fear-based wording;
- public output allowed without review;
- subscriber output allowed without entitlement and consent;
- external API or payment activated before review.

Any critical blocker must prevent activation.

## 9. Evidence Pack Doctrine

Every future activation candidate must have an evidence pack.

Required evidence pack sections:

- module IDs included;
- source references;
- Sanskrit review notes;
- calculation basis;
- location/time basis;
- rule family basis;
- validation records;
- discrepancy records;
- learning register references;
- privacy review;
- safety review;
- API contract review;
- audit trace sample;
- reviewer sign-offs;
- unresolved risks;
- go/no-go recommendation.

M10 does not create evidence packs. It defines the structure.

## 10. Module Readiness Matrix Doctrine

M10 requires a readiness matrix for M00 through M09.

Each matrix entry must include:

- module_id;
- module_title;
- methodology_status;
- runtime_status;
- public_output_status;
- required_next_review;
- primary_blockers;
- allowed_next_stage;
- activation_allowed.

No module should have activation_allowed true in M10.

## 11. Reviewer Sign-off Doctrine

Future activation requires explicit reviewer sign-off.

Reviewer sign-off roles:

- methodology_owner;
- source_reviewer;
- sanskrit_reviewer;
- calculation_reviewer;
- observance_rule_reviewer;
- privacy_reviewer;
- safety_reviewer;
- api_contract_reviewer;
- operational_reviewer;
- final_approver.

M10 does not create user accounts or reviewer workflows.

## 12. Validation Threshold Doctrine

Future activation should require validation thresholds.

Example future thresholds:

- Panchang calculation sample coverage complete;
- tithi boundary cases reviewed;
- skipped/repeated tithi cases reviewed;
- sunrise/sunset/moonrise comparisons reviewed;
- Pradosh and Parana cases reviewed;
- named observance registry sample reviewed;
- mantra source records reviewed;
- privacy redaction tests passed;
- API contract tests passed;
- safety wording tests passed.

M10 does not set final numeric pass thresholds. It requires thresholds before activation.

## 13. Internal Preview Readiness Doctrine

A module may become internal-preview-ready only if:

- relevant source gates pass;
- required calculations are traceable;
- conflict flags are preserved;
- privacy redaction is defined;
- audit trace is available;
- reviewer role is defined;
- public output remains false;
- M04A learning path is available.

Internal preview is not public launch.

## 14. Limited Pilot Readiness Doctrine

A limited pilot requires stronger controls.

Required pilot conditions:

- consent flow defined;
- entitlement flow defined if applicable;
- privacy retention defined;
- error messages reviewed;
- support and correction process defined;
- rollback plan defined;
- learning register active;
- safety escalation path defined;
- public claims reviewed.

M10 does not approve a pilot. It defines the criteria.

## 15. Public Activation Readiness Doctrine

Public activation requires all critical gates to pass.

Public activation must not proceed if:

- source status is pending;
- Sanskrit status is pending for mantra;
- calculation basis is pending;
- privacy redaction is incomplete;
- safety wording is unreviewed;
- public_output_allowed is false;
- conflicts are unresolved;
- validation evidence is insufficient.

M10 does not approve public activation.

## 16. Subscriber Guidance Readiness Doctrine

Subscriber guidance requires:

- consent gate;
- privacy gate;
- entitlement gate if premium;
- personalization safety gate;
- profile uncertainty handling;
- fallback path;
- audit trace;
- redaction path;
- learning register path.

Subscriber guidance must not be activated solely because methodology documents exist.

## 17. Premium Guidance Readiness Doctrine

Premium guidance must satisfy all free-output gates plus:

- entitlement definition;
- subscription status handling;
- billing separation;
- premium lock transparency;
- no hidden source degradation;
- no fear-based upsell;
- no safety bypass;
- no private-data exposure.

M10 does not implement payment or premium gating.

## 18. Rollback and Disable Doctrine

Every future activation must support rollback.

Rollback requirements:

- feature disable flag;
- module disable flag;
- public output disable flag;
- subscriber output disable flag;
- emergency safety block;
- audit log preservation;
- reviewer note;
- user-safe message.

M10 does not implement feature flags.

## 19. Operational Readiness Doctrine

Future implementation must define operational responsibilities.

Required operational areas:

- source maintenance;
- Sanskrit review maintenance;
- calculation validation;
- database tuning;
- privacy requests;
- support tickets;
- incident review;
- release review;
- reviewer assignment;
- learning register maintenance.

M10 does not assign people. It defines responsibilities.

## 20. Risk Register Doctrine

M10 requires a future risk register.

Risk areas:

- source risk;
- Sanskrit risk;
- calculation risk;
- location/timezone risk;
- observance rule risk;
- privacy risk;
- consent risk;
- entitlement risk;
- safety risk;
- API risk;
- operational risk;
- reputation risk.

Each risk must have severity, likelihood, owner, mitigation, status, and next review date.

## 21. Readiness Report Contract

A future readiness report should include:

- report_id;
- report_date;
- module_scope;
- readiness_matrix;
- gate_results;
- blocker_summary;
- risk_register;
- evidence_pack_refs;
- validation_summary;
- privacy_summary;
- safety_summary;
- reviewer_signoffs;
- go_no_go_recommendation;
- allowed_next_stage;
- activation_allowed.

This is not runtime code.

## 22. M04A Learning Connection

M10 inherits M04A.

Readiness failures, validation gaps, reviewer comments, and activation blockers must be recorded in the learning register or calibration backlog.

No blocker should disappear without a recorded decision.

## 23. M09 Internal Preview Connection

M10 inherits M09.

M09 internal preview evidence may support M10 readiness, but it cannot replace final reviewer sign-off.

Internal preview readiness is not the same as public readiness.

## 24. Safety Doctrine

M10 prohibits readiness claims that overstate certainty.

Not allowed:

- fully guaranteed correctness;
- universally final festival dates;
- guaranteed divine result;
- subscriber destiny prediction;
- medical/legal/financial replacement;
- public launch claim without gate evidence.

Allowed:

- methodology complete;
- internal review candidate;
- validation pending;
- activation blocked;
- human review required;
- public output not allowed.

## 25. Final M-Methodology Closure Doctrine

M10 may mark the M-methodology phase as document-complete.

Document-complete means the methodology stack has definitions, registries, validators, and safety gates.

Document-complete does not mean runtime-ready, public-ready, subscriber-ready, premium-ready, or legally/commercially ready.

## 26. M10 Acceptance Criteria

M10 is complete when readiness level doctrine, activation stage doctrine, go/no-go gate doctrine, critical blocker doctrine, evidence pack doctrine, module readiness matrix doctrine, reviewer sign-off doctrine, validation threshold doctrine, internal preview readiness, limited pilot readiness, public activation readiness, subscriber guidance readiness, premium guidance readiness, rollback doctrine, operational readiness, risk register, readiness report contract, M04A learning connection, M09 preview connection, safety doctrine, and final methodology closure doctrine are documented.

M10 must provide a machine-readable registry and validator confirming that no runtime, server endpoint, Auth, Supabase, payment, external API fetch, public Panchang output, public festival output, subscriber output, premium guidance, lucky number output, colour output, mantra output, internal preview runtime, dashboard card, or automatic activation is introduced.

## 27. M10 Status

M10 establishes the Methodology Activation Readiness Report.

M10 does not activate any runtime feature or public output.
