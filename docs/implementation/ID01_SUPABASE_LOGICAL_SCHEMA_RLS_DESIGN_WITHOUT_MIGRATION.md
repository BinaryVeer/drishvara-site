# ID01 — Supabase Logical Schema and RLS Design without Migration

Status: Implementation design / Supabase logical schema and RLS design only  
Phase: ID-Implementation Design  
Depends on: ID00, IR00, I00 through I05, C16  
Runtime impact: None  
Subscriber impact: None  
Public API impact: None  
Admin impact: None  
Database impact: None  
Migration impact: None  
ML impact: None  

## 1. Purpose

ID01 defines Drishvara’s future Supabase logical schema and Row Level Security design without creating any migration, SQL file, database client, Supabase table, RLS policy, Auth flow, API route, backend code, public output, subscriber output, ML ingestion, embedding generation, vector database write, secret, environment file, or content mutation.

ID01 is a schema and RLS design document only.

## 2. Current Position

ID00 created the backend detailed design without activation and recommended ID01.

IR00 allowed detailed design only and kept activation as no-go.

ID01 therefore remains design-only.

## 3. Supabase Schema Design Doctrine

Supabase schema design must remain separate from Supabase activation.

ID01 may define:

- logical table candidates;
- column candidates;
- primary key candidates;
- foreign key candidates;
- unique key candidates;
- index candidates;
- sensitivity class;
- PII category;
- ownership model;
- RLS read/write policy candidates;
- service-role boundary;
- audit boundary;
- activation blockers.

ID01 must not create SQL, migrations, live tables, clients, repositories, routes, or policies.

## 4. Schema Family Doctrine

Future logical schema families include:

- content governance;
- review workflow;
- methodology and source governance;
- Panchang and observance;
- validation and learning;
- subscriber profile and consent;
- entitlement and payment;
- guidance and personalization;
- feature flag and safety;
- admin and audit;
- ML and embedding eligibility.

These are design families only.

## 5. Logical Table Candidate Doctrine

Each logical table candidate must declare:

- table name;
- schema family;
- purpose;
- proposed columns;
- primary key;
- foreign key candidates;
- unique key candidates;
- index candidates;
- sensitivity level;
- PII category;
- row ownership model;
- public read allowed;
- subscriber read/write allowed;
- reviewer read/write allowed;
- admin read/write allowed;
- service role use allowed;
- RLS policy candidates;
- audit requirement;
- activation blockers.

ID01 does not create these tables.

## 6. RLS Design Doctrine

Future RLS must follow deny-by-default.

Every table must state:

- public read policy;
- subscriber self-read policy;
- subscriber self-write policy;
- reviewer read policy;
- reviewer write policy;
- admin read policy;
- admin write policy;
- service-role operation policy;
- audit read policy.

All RLS policies remain candidates only.

## 7. Role Boundary Doctrine

Future role families include:

- anonymous_public;
- subscriber;
- reviewer;
- admin_owner;
- service_role_server_only.

The service role must never be available to client-side code.

ID01 does not activate Auth or roles.

## 8. Content Governance Schema Design

Content governance tables may include:

- content_assets;
- image_assets;
- verified_links;
- content_asset_versions;
- content_asset_readiness;
- content_asset_ml_eligibility.

These require source, rights, public-safe, quality, ML, embedding, and registry-write gates before activation.

## 9. Review Workflow Schema Design

Review workflow tables may include:

- review_queue_items;
- review_decisions;
- review_assignments;
- review_audit_traces;
- approval_gate_records.

These require Auth, RLS, reviewer roles, admin boundary, audit trace, and rollback design before activation.

## 10. Methodology and Source Schema Design

Methodology/source tables may include:

- source_records;
- mantra_source_records;
- panchang_source_records;
- methodology_module_status;
- sanskrit_integrity_reviews.

These must preserve source-first and Sanskrit-integrity doctrines.

## 11. Panchang and Observance Schema Design

Panchang and observance tables may include:

- panchang_calculation_records;
- tithi_interval_records;
- observance_rule_records;
- festival_rule_records;
- location_time_basis_records;
- ayanamsha_basis_records.

These must remain internal until calculation, source, validation, and output gates pass.

## 12. Subscriber Schema Design

Subscriber tables may include:

- subscriber_profiles;
- profile_input_records;
- consent_records;
- privacy_preferences;
- subscriber_entitlements;
- guidance_cards.

These require Auth, consent, RLS, privacy review, and entitlement gates before activation.

## 13. Payment Schema Design

Payment tables may include:

- subscription_plans;
- payment_events;
- entitlement_audit_records.

These require payment provider, webhook security, audit, refund/cancellation workflow, and privacy review before activation.

## 14. Admin and Audit Schema Design

Admin and audit tables may include:

- admin_user_roles;
- admin_action_audits;
- rollback_records;
- incident_disable_records.

These require Auth, admin role boundary, RLS, and audit storage policy before activation.

## 15. ML and Embedding Schema Design

ML and embedding tables may include:

- ml_eligibility_records;
- embedding_eligibility_records;
- vector_index_candidates;
- training_dataset_candidates.

These require source, rights, privacy, ML eligibility, and embedding eligibility gates before activation.

## 16. Index Design Doctrine

ID01 may define index candidates.

Index candidates must not create indexes.

Future index design should support:

- asset lookup;
- review queue filtering;
- subscriber ownership;
- audit trace lookup;
- source lookup;
- observance lookup;
- entitlement lookup;
- validation cycle lookup.

## 17. Migration Boundary Doctrine

ID01 does not create migration files.

Future migration work must define:

- SQL migration naming;
- migration order;
- rollback migration;
- seed/import plan;
- staging dry-run;
- backup before migration;
- validation after migration;
- production promotion gate.

## 18. Preview Output

ID01 may generate:

- data/implementation/id01-supabase-logical-schema-rls-design-preview.json

This output is preview-only.

It is not SQL.

It is not a migration.

It is not a Supabase schema file.

It is not a database client.

It is not public output.

## 19. Recommended Next Stage

Recommended next stage:

ID02 — API Route Contract Design without Route Creation

ID02 should remain design-only unless separately approved.

## 20. Explicit Exclusions

ID01 does not:

- connect Supabase;
- create Supabase project;
- create Supabase tables;
- create RLS policies;
- create SQL files;
- create database migrations;
- create database clients;
- create repositories;
- create ORM models;
- create seed scripts;
- create API routes;
- create server endpoints;
- create Auth flows;
- create payment flows;
- create admin UI;
- create review queue;
- assign reviewers;
- approve assets;
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
- create environment files;
- deploy backend.

## 21. ID01 Acceptance Criteria

ID01 is complete when:

1. ID01 document exists.
2. ID01 registry exists.
3. ID01 preview generator exists.
4. ID01 validator exists.
5. ID01 preview output exists.
6. Logical schema families are declared.
7. Logical table candidates are declared.
8. Column candidates and key candidates are declared.
9. RLS policy candidates are declared.
10. Role boundaries are declared.
11. No SQL, migration, Supabase table, RLS policy, database client, API route, Auth, payment, admin, ML, public output, subscriber output, or mutation is enabled.
12. validate:id01 passes.
13. validate:implementation passes.
14. validate:project passes.

## 22. ID01 Status

ID01 establishes Supabase Logical Schema and RLS Design without Migration.

ID01 does not activate Supabase, database, migration, Auth, RLS, API routes, admin, payment, public output, subscriber output, ML, embeddings, or mutation.
