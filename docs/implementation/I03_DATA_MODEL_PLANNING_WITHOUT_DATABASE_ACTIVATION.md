# I03 — Data Model Planning without Database Activation

Status: Implementation planning / logical data model only  
Phase: I-Implementation Planning  
Depends on: I00, I01, I02, C16  
Runtime impact: None  
Subscriber impact: None  
Public API impact: None  
Admin impact: None  
Database impact: None  
ML impact: None  

## 1. Purpose

I03 defines Drishvara’s future logical data model without activating any database.

I03 does not create Supabase tables, database migrations, SQL files, ORM models, API routes, runtime loaders, Auth flows, admin panels, payment flows, public output, subscriber output, ML ingestion, embeddings, vector database writes, or content mutation.

I03 creates a preview-only logical data model planning output for future architecture review.

## 2. Current Position

I00 established implementation planning boundaries.

I01 established safe folder architecture and static registry loading planning.

I02 established feature flag and environment boundary planning.

C16 closed the content governance sequence and handed off content governance outputs for future planning only.

I03 continues planning only.

## 3. Data Model Planning Doctrine

A data model may be planned before a database exists.

Planning must define:

- entity name;
- entity family;
- purpose;
- source dependency;
- required fields;
- optional fields;
- sensitivity level;
- PII category;
- public exposure status;
- write status;
- retention posture;
- review gate;
- future storage candidate;
- activation blocker.

Planning does not authorize storage.

## 4. No Database Activation Doctrine

I03 does not activate:

- Supabase;
- PostgreSQL;
- SQLite;
- object storage;
- vector database;
- migrations;
- RLS;
- seed scripts;
- live tables;
- service-role operations;
- database clients;
- ORM models;
- read/write repositories.

Any future database work must be planned separately.

## 5. Planned Data Model Families

Future data model families include:

- content governance;
- review workflow;
- methodology and source governance;
- Panchang and observance methodology;
- validation and learning;
- subscriber profile and consent;
- entitlement and payment;
- guidance and personalization;
- admin and audit;
- feature flags and environment safety;
- ML and embedding eligibility.

I03 does not create these as live tables.

## 6. Content Governance Entities

Future content governance entities may include:

- content_asset;
- image_asset;
- verified_link;
- content_asset_version;
- content_asset_readiness;
- content_asset_source_rights;
- content_asset_ml_eligibility.

These should remain non-live until registry write, review, approval, and storage boundaries are activated.

## 7. Review Workflow Entities

Future review workflow entities may include:

- review_queue_item;
- review_decision;
- review_assignment;
- review_audit_trace;
- approval_gate_record.

These require Auth, role mapping, RLS, admin workflow, and audit design before activation.

## 8. Methodology and Source Entities

Future methodology/source entities may include:

- source_record;
- mantra_source_record;
- panchang_source_record;
- methodology_module_status;
- calculation_basis_record;
- sanskrit_integrity_review.

These must preserve source-first and Sanskrit-integrity doctrines.

## 9. Panchang and Observance Entities

Future Panchang/observance entities may include:

- panchang_calculation_record;
- tithi_interval_record;
- observance_rule_record;
- festival_rule_record;
- location_time_basis_record;
- ayanamsha_basis_record;
- sunrise_basis_record.

These must remain server-side and blocked from public output until methodology readiness gates are satisfied.

## 10. Validation and Learning Entities

Future validation/learning entities may include:

- validation_cycle;
- figure_variance_record;
- source_comparison_record;
- learning_register_item;
- calibration_backlog_item.

These follow M04A and must not silently tune live output without review.

## 11. Subscriber Profile and Consent Entities

Future subscriber entities may include:

- subscriber_profile;
- profile_input_record;
- consent_record;
- privacy_preference;
- location_preference;
- profile_completeness_record.

These must follow consent, minimization, and privacy boundaries from M05 and M07.

## 12. Entitlement and Payment Entities

Future entitlement/payment entities may include:

- subscription_plan;
- subscriber_entitlement;
- payment_event;
- payment_provider_mapping;
- entitlement_audit_record.

These require payment and Auth boundaries before activation.

I03 does not activate payment.

## 13. Guidance and Personalization Entities

Future guidance entities may include:

- guidance_card_record;
- symbolic_guidance_record;
- lucky_number_selection_record;
- lucky_colour_selection_record;
- mantra_selection_record;
- personalization_score_record;
- guidance_audit_trace.

These must remain blocked from public/subscriber output until consent, entitlement, source, and safety gates pass.

## 14. Admin and Audit Entities

Future admin/audit entities may include:

- admin_user_role;
- admin_action_audit;
- reviewer_role_mapping;
- rollback_record;
- incident_disable_record.

These require Auth, RLS, and admin boundary activation before use.

## 15. Feature Flag and Environment Entities

Future feature/environment entities may include:

- feature_flag_definition;
- feature_flag_state;
- environment_boundary_record;
- safe_mode_record;
- emergency_disable_record.

These must not become runtime toggles until a future flag evaluator is explicitly approved.

## 16. ML and Embedding Eligibility Entities

Future ML/embedding entities may include:

- ml_eligibility_record;
- embedding_eligibility_record;
- vector_index_candidate;
- training_dataset_candidate;
- model_use_audit_record.

These must remain blocked until asset rights, source, quality, duplicate, privacy, and reviewer gates pass.

## 17. Sensitivity Classification Doctrine

Every future entity must be classified.

Allowed sensitivity levels:

- public_static;
- internal_governance;
- internal_preview;
- restricted_admin;
- subscriber_private;
- secret_server_only;
- prohibited_for_client.

Public exposure must never be inferred from existence.

## 18. PII and Privacy Doctrine

PII categories must be tracked.

Allowed PII categories:

- none;
- pseudonymous;
- contact;
- profile;
- location;
- birth_data;
- payment;
- authentication;
- sensitive_preference;
- operational_audit.

Subscriber profile, consent, location, birth data, payment, and authentication entities require stronger privacy gates.

## 19. Storage Candidate Doctrine

Future storage candidates may include:

- static_json;
- server_database;
- supabase_postgres;
- object_storage;
- vector_database;
- audit_log_store;
- external_provider_record.

I03 does not activate any storage candidate.

## 20. Activation Blocker Doctrine

Every future entity must have activation blockers.

Common blockers include:

- needs_feature_flag;
- needs_auth;
- needs_supabase;
- needs_rls;
- needs_admin_boundary;
- needs_privacy_review;
- needs_source_review;
- needs_rights_review;
- needs_public_output_gate;
- needs_subscriber_output_gate;
- needs_ml_eligibility_gate;
- needs_payment_gate;
- needs_migration_plan;
- needs_rollback_plan.

## 21. Preview Output

I03 may generate:

- data/implementation/i03-data-model-planning-preview.json

This output is preview-only.

It is not a schema migration.

It is not a database schema.

It is not a Supabase schema.

It is not an ORM model.

It is not public output.

## 22. Recommended Next Stage

Recommended next stage:

I04 — Internal Preview Architecture Plan

I04 should remain planning-only unless separately approved.

## 23. Explicit Exclusions

I03 does not:

- create database tables;
- create Supabase tables;
- create SQL migrations;
- create ORM models;
- create database clients;
- create repositories;
- create API routes;
- create server endpoints;
- activate Supabase;
- activate Auth;
- activate payment;
- activate RLS;
- activate admin UI;
- activate review queue;
- activate public output;
- activate subscriber output;
- mutate content;
- mutate homepage;
- mutate sitemap;
- write final registries;
- generate embeddings;
- train models;
- write vector database records;
- fetch external APIs;
- create secrets;
- create environment files.

## 24. I03 Acceptance Criteria

I03 is complete when:

1. I03 document exists.
2. I03 registry exists.
3. I03 preview generator exists.
4. I03 validator exists.
5. I03 preview output exists.
6. Planned data model families are declared.
7. Planned entities are declared.
8. Required and optional fields are declared.
9. Sensitivity levels are declared.
10. PII categories are declared.
11. Storage candidates are declared but not activated.
12. Activation blockers are declared.
13. Database, Supabase, Auth, Admin, API, ML, public output, and subscriber output remain disabled.
14. validate:i03 passes.
15. validate:implementation passes.
16. validate:project passes.

## 25. I03 Status

I03 establishes Data Model Planning without Database Activation.

I03 does not activate a database, migration, API, runtime, public output, admin, Supabase, Auth, payment, ML, or mutation.
