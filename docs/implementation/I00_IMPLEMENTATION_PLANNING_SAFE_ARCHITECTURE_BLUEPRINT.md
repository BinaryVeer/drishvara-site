# I00 — Implementation Planning & Safe Architecture Blueprint

Status: Implementation planning only  
Phase: I-Implementation Planning  
Depends on: M00 through M10, R00 through R03  
Runtime impact: None  
Subscriber impact: None  
Public API impact: None  

## 1. Purpose

I00 defines Drishvara’s safe implementation planning blueprint.

I00 does not implement runtime features, server routes, Auth, Supabase, payment, external API fetch, public Panchang output, public festival output, subscriber guidance, dashboard cards, premium guidance, internal preview runtime, live calculation, ML ingestion, embeddings, geocoding, background jobs, or automatic database mutation.

I00 exists to decide the architecture boundary before any implementation module starts.

## 2. Core Position

Drishvara is not starting from zero.

The current active repository already contains:

- a static/public-preview website;
- public article pages and article reader structure;
- content governance C01 through C09;
- knowledge governance D01 through D10;
- methodology stack M00 through M10;
- review/control stack R00 through R03;
- backend/Auth/Supabase/payment/admin scaffolds that remain disabled.

I00 must preserve all existing governance before planning implementation.

## 3. Repository Boundary Doctrine

The active implementation repository is:

- drishvara-site

The older generation scaffold is:

- drishvara_phase01_scaffold

drishvara_phase01_scaffold is not the active website repository.

It should be treated as a reference architecture for future content-generation pipeline design, especially its agent, orchestrator, and schema ideas.

It must not be blindly merged into drishvara-site.

## 4. Folder Role Decision

I00 records the following folder roles:

### drishvara-site

Role: active website and governance repository.

Current use:

- static public site;
- article display;
- homepage featured reads;
- governance data;
- validation scripts;
- methodology/review artifacts;
- future implementation planning.

### drishvara_phase01_scaffold

Role: historical Phase 01 content-generation scaffold and future reference.

Current use:

- reference for agent pipeline design;
- reference for input normalization;
- reference for story drafting;
- reference for visual intelligence;
- reference for guard and publisher flow.

Not current use:

- not active website;
- not active production repo;
- not current public article runtime;
- not current backend.

## 5. Current Achievement Baseline

I00 begins from this baseline:

- Content C01–C09: completed as public-read governance and preflight stack;
- Knowledge D01–D10: completed as knowledge governance stack;
- Methodology M00–M10: completed as methodology stack;
- Review R00–R03: completed as review/refactoring/control stack.

This does not mean runtime is active.

It means Drishvara has a strong governance foundation for implementation planning.

## 6. Architecture Principle

The architecture must be layered.

Recommended future layers:

1. public static site layer;
2. content asset layer;
3. governance registry layer;
4. methodology registry layer;
5. internal preview layer;
6. server-only calculation layer;
7. consent and privacy layer;
8. entitlement layer;
9. subscriber dashboard layer;
10. admin review layer;
11. ML/embedding preparation layer;
12. deployment and rollback layer.

I00 does not implement these layers. It only records the intended separation.

## 7. Server / Client Boundary Doctrine

Future sensitive logic must stay server-side.

Server-side only in future:

- Panchang calculation;
- festival/vrat decision logic;
- source registry validation;
- mantra source validation;
- subscriber personalization scoring;
- consent and entitlement checks;
- private profile handling;
- internal preview generation;
- audit trace generation;
- ML/embedding preparation.

Client-side may show only public-safe and approved outputs.

I00 does not create server routes.

## 8. Static Registry Loading Doctrine

Existing registries should first be treated as static governance data.

Future implementation may read static JSON registries for:

- methodology status;
- content governance status;
- source status;
- feature flags;
- activation readiness;
- blocked capability list.

Static loading must not become live mutation.

## 9. Content Workstream Position

The content workstream is not unstarted.

Content governance C01 through C09 already exists.

The next content-specific module should be:

C10 — Content Asset Registry & ML Eligibility Governance.

C10 should cover:

- completed article registry;
- published-work registry;
- image/picture registry;
- verified-link registry;
- source and rights status;
- public-safe status;
- article versioning;
- ML-training eligibility;
- embedding eligibility;
- future reuse permission.

C10 should not activate ML ingestion.

## 10. Knowledge / Methodology Workstream Position

Knowledge governance D01 through D10 and methodology M00 through M10 should remain protected foundations.

Future implementation must not bypass:

- source-first doctrine;
- Sanskrit integrity;
- no-invented-mantra doctrine;
- Panchang calculation disclosure;
- location/timezone/sunrise basis;
- periodic validation and learning register;
- consent-first profile handling;
- symbolic scoring non-randomness;
- subscriber personalization safety;
- API contract gates;
- internal preview gating;
- activation readiness gates.

## 11. Backend / Supabase / Auth Position

I00 does not activate backend.

Future backend work must be planned separately.

Supabase, Auth, payment, subscription entitlement, admin review, and subscriber login remain disabled.

A future backend planning stage may define:

- database schema;
- migration strategy;
- RLS policy design;
- Auth provider design;
- role model;
- service-role key handling;
- environment variable handling;
- backup and rollback policy.

No backend connection is created in I00.

## 12. API Position

M08 defines the API contract.

I00 may plan future route families but must not implement routes.

Future API routes must remain blocked until:

- source gates pass;
- privacy gates pass;
- consent gates pass;
- entitlement gates pass where applicable;
- safety gates pass;
- audit trace is available;
- internal preview has been reviewed.

## 13. Feature Flag Doctrine

Every future implementation must be feature-flagged.

Required future flag families:

- public_panchang_enabled;
- public_festival_enabled;
- internal_preview_enabled;
- subscriber_guidance_enabled;
- auth_enabled;
- supabase_enabled;
- payment_enabled;
- admin_review_enabled;
- content_registry_write_enabled;
- ml_ingestion_enabled;
- external_api_fetch_enabled.

All such flags remain false in I00.

## 14. Environment Variable Policy

I00 does not create or use environment variables.

Future environment variables must be documented before use.

Sensitive keys must never be committed.

Expected future categories:

- public build variables;
- server-only variables;
- Supabase anon key;
- Supabase service role key;
- payment provider key;
- API provider key;
- analytics key;
- feature flag overrides.

Service-role and payment secrets must remain server-only.

## 15. Data Model Planning Boundary

I00 may plan future data model areas, but does not create a live database.

Future data model areas:

- articles;
- content assets;
- image assets;
- verified links;
- source registry;
- mantra registry;
- Panchang calculation records;
- observance rules;
- validation cycles;
- learning register;
- subscriber profiles;
- consent records;
- entitlement records;
- audit traces;
- admin review queues;
- ML eligibility records.

No database is activated in I00.

## 16. ML / Embedding Boundary

ML and embedding use must not start until assets are governed.

Before ML use, each content asset must have:

- source status;
- rights status;
- public-safe status;
- quality status;
- duplicate/near-duplicate status;
- ML-training eligibility;
- embedding eligibility;
- reviewer approval.

I00 does not perform ML ingestion, embedding generation, training, scraping, or vector database setup.

## 17. Deployment Safety Doctrine

Future deployment must preserve safe fallback.

Deployment planning should include:

- feature disable switches;
- module disable switches;
- rollback plan;
- static fallback;
- public-output block;
- subscriber-output block;
- error-message safety;
- audit log preservation;
- validation before deployment.

I00 does not change deployment.

## 18. Testing Strategy Doctrine

Future implementation must be test-first.

Recommended test categories:

- registry presence tests;
- disabled flag tests;
- route absence tests where features are blocked;
- privacy redaction tests;
- consent gate tests;
- entitlement gate tests;
- source review tests;
- Sanskrit integrity tests;
- content link tests;
- image governance tests;
- sitemap tests;
- fallback tests;
- rollback tests.

I00 does not add runtime tests beyond its validator.

## 19. Recommended Implementation Sequence

Recommended next planning/implementation sequence:

1. I00 — Implementation Planning & Safe Architecture Blueprint;
2. C10 — Content Asset Registry & ML Eligibility Governance;
3. I01 — Safe Folder Architecture & Static Registry Loading Plan;
4. I02 — Feature Flag and Environment Boundary Plan;
5. I03 — Data Model Planning without Database Activation;
6. I04 — Internal Preview Architecture Plan;
7. I05 — Backend/Supabase Activation Readiness Plan;
8. later implementation only after explicit approval.

This sequence may be revised later, but runtime must remain blocked until approved.

## 20. Forbidden Actions in I00

I00 must not:

- enable Auth;
- enable Supabase;
- enable payment;
- fetch external APIs;
- create live API routes;
- activate subscriber login;
- activate dashboard cards;
- activate public Panchang;
- activate public festival dates;
- activate lucky number output;
- activate colour output;
- activate mantra output;
- activate personalized guidance;
- activate ML ingestion;
- create embeddings;
- mutate article data;
- mutate homepage featured reads;
- mutate sitemap;
- write to image registry;
- write to selection memory;
- delete backup files;
- modify .gitignore;
- activate public output.

## 21. I00 Acceptance Criteria

I00 is complete when:

1. I00 document exists.
2. I00 registry exists.
3. I00 validator exists.
4. Active repo and scaffold roles are recorded.
5. Current achievement baseline is recorded.
6. Layered architecture principle is recorded.
7. Server/client boundary is recorded.
8. Static registry loading doctrine is recorded.
9. C10 is recorded as the next content-specific module.
10. Backend/Auth/Supabase/payment remain disabled.
11. API routes remain disabled.
12. Feature flag doctrine is recorded.
13. Environment variable policy is recorded.
14. Data model planning boundary is recorded.
15. ML/embedding boundary is recorded.
16. Deployment safety and testing strategy are recorded.
17. Forbidden I00 actions are recorded.
18. validate:i00 passes.
19. validate:implementation passes.
20. validate:project passes.

## 22. I00 Status

I00 establishes the Implementation Planning & Safe Architecture Blueprint.

I00 does not implement runtime or public output.
