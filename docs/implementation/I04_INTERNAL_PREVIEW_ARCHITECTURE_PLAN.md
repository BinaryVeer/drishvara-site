# I04 — Internal Preview Architecture Plan

Status: Implementation planning / internal preview architecture only  
Phase: I-Implementation Planning  
Depends on: I00, I01, I02, I03, C16  
Runtime impact: None  
Subscriber impact: None  
Public API impact: None  
Admin impact: None  
Database impact: None  
ML impact: None  

## 1. Purpose

I04 defines Drishvara’s future internal preview architecture.

I04 does not create runtime preview routes, API routes, dashboard cards, admin UI, Supabase tables, Auth flows, database migrations, server endpoints, public output, subscriber output, ML ingestion, embeddings, vector database writes, or content mutation.

I04 creates a preview-only architecture map for future internal reviewer-facing previews.

## 2. Current Position

I00 established implementation planning boundaries.

I01 established safe folder architecture and static registry loading planning.

I02 established feature flag and environment boundary planning.

I03 established logical data model planning without database activation.

C16 closed the content governance sequence and handed off content governance outputs for future planning only.

I04 continues planning only.

## 3. Internal Preview Doctrine

Internal preview means a controlled, non-public, reviewer-facing view of planned outputs or governance data.

Internal preview must not become public output.

Internal preview must not become subscriber output.

Internal preview must not mutate source data.

Internal preview must not bypass source, privacy, consent, entitlement, review, or activation gates.

## 4. Preview Families

Future internal preview families may include:

- methodology status preview;
- content asset readiness preview;
- review queue planning preview;
- Panchang calculation preview;
- observance rule preview;
- festival rule preview;
- source registry preview;
- Sanskrit integrity preview;
- subscriber profile completeness preview;
- symbolic guidance preview;
- personalization score preview;
- API contract preview;
- feature flag readiness preview;
- data model readiness preview;
- deployment readiness preview.

I04 does not activate any preview family.

## 5. Access Boundary Doctrine

Future internal preview access must require:

- Auth;
- reviewer role mapping;
- role-based access;
- privacy redaction;
- audit trace;
- feature flag gate;
- safe mode gate;
- no public route exposure.

I04 does not activate Auth or reviewer roles.

## 6. Public Output Boundary

Internal preview output must never be directly exposed to:

- homepage;
- article pages;
- public Panchang pages;
- public festival pages;
- subscriber dashboards;
- sitemap;
- SEO metadata;
- public API routes.

I04 does not modify public files.

## 7. Subscriber Output Boundary

Internal preview must not show personalized subscriber guidance unless a future privacy, consent, entitlement, and redaction model is approved.

Subscriber-sensitive previews must remain blocked until:

- Auth exists;
- consent model exists;
- entitlement gate exists;
- privacy review passes;
- redaction rules exist;
- audit trail exists.

I04 does not create subscriber previews.

## 8. Redaction Doctrine

Future internal preview must support redaction.

Redaction categories include:

- subscriber identifier;
- contact information;
- precise location;
- birth data;
- payment reference;
- authentication reference;
- sensitive preference;
- internal secret;
- service-role reference;
- API key reference;
- reviewer identity where required.

I04 does not process real private data.

## 9. Preview Source Doctrine

Future previews may read from approved static governance outputs first.

Candidate preview sources include:

- methodology registries;
- review registries;
- content governance handoff;
- content readiness matrix;
- implementation planning registries;
- static registry loading manifest;
- feature flag/environment boundary preview;
- data model planning preview.

I04 does not create runtime data loading.

## 10. Preview Route Boundary

Future preview routes, if ever created, must be private and gated.

Required route controls:

- no public route by default;
- Auth required;
- reviewer role required;
- feature flag required;
- safe mode respected;
- audit trace created;
- redaction applied;
- no mutation;
- no public cache;
- no SEO indexing.

I04 does not create routes.

## 11. Preview Component Boundary

Future UI components for internal preview must be separate from public components.

Preview UI must display:

- preview-only status;
- source registry path;
- last validation status;
- redaction status;
- blocked capabilities;
- activation blockers;
- reviewer notes if available.

I04 does not create UI components.

## 12. Audit Trace Doctrine

Every future internal preview request should produce an audit trace.

Audit trace fields may include:

- preview_trace_id;
- preview_family;
- requested_by_role;
- requested_at;
- source_refs;
- redaction_applied;
- blocked_capabilities;
- output_generated;
- public_output_changed;
- subscriber_output_changed;
- mutation_performed.

In safe internal preview, public_output_changed, subscriber_output_changed, and mutation_performed must remain false.

I04 does not write audit traces.

## 13. Safe Mode Doctrine

Future safe mode must be able to disable all preview families.

Safe mode should force off:

- Panchang preview;
- subscriber profile preview;
- personalization preview;
- guidance preview;
- admin review preview;
- API contract runtime preview;
- ML/embedding preview;
- external API preview.

I04 does not create safe mode.

## 14. Preview Readiness Levels

Future preview families may have readiness levels:

- not_planned;
- planned_only;
- static_preview_possible;
- internal_preview_blocked;
- internal_preview_ready_for_review;
- pilot_preview_candidate;
- activation_blocked.

I04 does not move any preview family beyond planned_only.

## 15. Data Handling Doctrine

Future internal previews must distinguish:

- public static data;
- internal governance data;
- internal preview data;
- restricted admin data;
- subscriber private data;
- secret server-only data;
- prohibited client data.

I04 does not expose restricted, subscriber-private, or secret data.

## 16. Security Boundary Doctrine

Future internal preview architecture must protect against:

- public URL exposure;
- accidental SEO indexing;
- client-side secret leakage;
- service-role key exposure;
- subscriber data leakage;
- unsafe caching;
- unreviewed calculation output;
- silent public activation;
- silent mutation.

I04 does not create security mechanisms; it records the boundary.

## 17. Preview Evidence Pack Doctrine

A future preview should provide evidence:

- source file references;
- registry status;
- validation status;
- feature flag state;
- blocked capability list;
- redaction note;
- audit trace ID;
- reviewer decision if applicable.

I04 does not create live evidence packs.

## 18. Preview Failure Doctrine

Future preview failure must be safe.

Failures should return:

- no public output;
- no subscriber output;
- no mutation;
- clear internal error category;
- blocked capability confirmation;
- rollback not required if no write occurred.

I04 does not create error handlers.

## 19. Preview Output

I04 may generate:

- data/implementation/i04-internal-preview-architecture-preview.json

This output is preview-only.

It is not a route map.

It is not an API contract.

It is not UI.

It is not public output.

## 20. Recommended Next Stage

Recommended next stage:

I05 — Backend/Supabase Activation Readiness Plan

I05 should remain readiness-planning only unless separately approved.

## 21. Explicit Exclusions

I04 does not:

- create runtime preview routes;
- create API routes;
- create server endpoints;
- create UI components;
- create dashboard cards;
- activate internal preview;
- activate public preview;
- activate subscriber preview;
- activate Supabase;
- activate Auth;
- activate payment;
- activate RLS;
- activate admin UI;
- activate review queue;
- create database tables;
- create database migrations;
- write audit traces;
- process real subscriber data;
- expose private data;
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

## 22. I04 Acceptance Criteria

I04 is complete when:

1. I04 document exists.
2. I04 registry exists.
3. I04 preview generator exists.
4. I04 validator exists.
5. I04 preview output exists.
6. Internal preview doctrine is declared.
7. Preview families are declared.
8. Access, public-output, subscriber-output, and redaction boundaries are declared.
9. Preview source, route, component, audit, safe mode, and failure doctrines are declared.
10. No runtime preview, API, UI, Supabase, Auth, Admin, database, ML, public output, or subscriber output is enabled.
11. validate:i04 passes.
12. validate:implementation passes.
13. validate:project passes.

## 23. I04 Status

I04 establishes Internal Preview Architecture Plan.

I04 does not activate runtime preview, API routes, public output, subscriber output, admin, Supabase, Auth, payment, database, ML, or mutation.
