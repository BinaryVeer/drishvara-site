# I02 — Feature Flag and Environment Boundary Plan

Status: Implementation planning / boundary plan only  
Phase: I-Implementation Planning  
Depends on: I00, I01, C16  
Runtime impact: None  
Subscriber impact: None  
Public API impact: None  
Admin impact: None  
ML impact: None  

## 1. Purpose

I02 defines Drishvara’s feature flag and environment-variable boundary plan.

I02 does not create runtime feature toggles, environment files, secrets, server endpoints, API routes, Supabase connections, Auth flows, payment flows, admin panels, public output, subscriber output, ML ingestion, embeddings, vector database writes, or content mutation.

I02 creates a preview-only feature flag and environment boundary report for future planning.

## 2. Current Position

I00 established the implementation planning boundary.

I01 established the safe folder architecture and static registry loading plan.

C16 closed the content governance sequence and handed off the content governance outputs for future planning only.

I02 continues planning only.

## 3. Feature Flag Doctrine

Every future implementation feature must be controlled by an explicit feature flag.

A feature flag must have:

- flag key;
- family;
- default value;
- allowed values;
- runtime exposure status;
- public output status;
- subscriber output status;
- environment dependency;
- approval gate;
- rollback behavior;
- owner or review gate;
- audit note.

Default value for all activation flags must be false.

## 4. Feature Flag Families

Future feature flag families include:

- public content;
- content registry;
- review queue;
- admin review;
- Panchang calculation;
- festival and vrat calculation;
- subscriber guidance;
- personalization;
- Auth;
- Supabase;
- payment;
- API routes;
- internal preview;
- ML and embeddings;
- external API fetch;
- analytics;
- deployment safety.

I02 defines these families but does not activate them.

## 5. Required Future Flags

Required future flags include:

- public_content_dynamic_enabled;
- content_registry_write_enabled;
- review_queue_write_enabled;
- admin_review_enabled;
- admin_ui_enabled;
- public_panchang_enabled;
- public_festival_enabled;
- subscriber_guidance_enabled;
- personalization_enabled;
- auth_enabled;
- supabase_enabled;
- payment_enabled;
- api_routes_enabled;
- internal_preview_enabled;
- ml_ingestion_enabled;
- embedding_generation_enabled;
- external_api_fetch_enabled;
- analytics_enabled.

All remain false in I02.

## 6. Environment Variable Doctrine

Environment variables must be planned before use.

I02 does not create `.env`, `.env.local`, `.env.production`, or any secret file.

Environment variables must be categorized as:

- public build variable;
- server-only variable;
- secret;
- service-role secret;
- payment secret;
- API provider secret;
- analytics key;
- feature-flag override;
- non-secret configuration.

Secret variables must never be committed.

## 7. Public vs Server-Only Environment Boundary

Public variables may be exposed to client code only when they contain no secret or sensitive value.

Server-only variables must never be bundled into public JavaScript.

Service-role keys, payment secrets, private API keys, and internal security tokens must remain server-only.

I02 does not create or read any actual secret.

## 8. Supabase Environment Boundary

Future Supabase usage must separate:

- public anon key;
- service role key;
- project URL;
- database URL;
- migration credentials;
- storage bucket settings;
- RLS policy requirements.

The service role key must never be available to client-side code.

I02 does not activate Supabase.

## 9. Auth Environment Boundary

Future Auth usage must define:

- provider;
- redirect URLs;
- callback URLs;
- session secret;
- role mapping;
- token lifetime;
- logout behavior;
- account recovery behavior;
- admin access boundary.

I02 does not activate Auth.

## 10. Payment Environment Boundary

Future payment usage must define:

- provider;
- public checkout key if applicable;
- secret key;
- webhook secret;
- plan identifiers;
- subscription status mapping;
- refund/cancellation handling;
- entitlement sync boundary.

I02 does not activate payment.

## 11. API Route Boundary

Future API routes must remain disabled until explicitly planned and approved.

Route activation must require:

- feature flag;
- environment readiness;
- Auth/consent gate where needed;
- privacy gate;
- entitlement gate where needed;
- source gate;
- audit trace;
- validation script;
- rollback path.

I02 does not create API routes.

## 12. Internal Preview Boundary

Internal preview may be planned separately.

Internal preview must not become public output.

Internal preview flags must remain false until:

- reviewer access model is approved;
- audit trace exists;
- redaction rules exist;
- source gates pass;
- rollback path exists.

I02 does not activate internal preview.

## 13. ML and Embedding Boundary

ML ingestion and embedding generation must remain disabled.

Before enabling ML or embeddings, assets must pass:

- source review;
- rights review;
- quality review;
- duplicate review;
- privacy review;
- public-safe review;
- ML eligibility review;
- embedding eligibility review;
- reviewer approval.

I02 does not ingest, embed, train, or write vectors.

## 14. External API Boundary

External API fetch must remain disabled.

Future external API usage must define:

- provider;
- purpose;
- endpoint family;
- credential type;
- rate-limit policy;
- cache policy;
- fallback policy;
- source attribution requirement;
- privacy impact;
- cost control;
- failure handling.

I02 does not fetch external APIs.

## 15. Runtime Override Doctrine

Runtime override must not be available by accident.

Future override mechanisms must define:

- who can override;
- where override is stored;
- how override is audited;
- how rollback works;
- which flags cannot be overridden;
- emergency disable process.

I02 does not create override storage.

## 16. Flag Evaluation Doctrine

Future flag evaluation must be deterministic.

Flag evaluation should consider:

- default value;
- environment value;
- safe mode;
- deployment mode;
- user role if applicable;
- entitlement if applicable;
- emergency disable state.

I02 does not create a flag evaluator.

## 17. Safe Mode Doctrine

Future Drishvara runtime should support a global safe mode.

Safe mode should force high-risk features off.

High-risk features include:

- public Panchang;
- subscriber guidance;
- personalized guidance;
- admin review write;
- Supabase writes;
- payment;
- external API fetch;
- ML ingestion;
- embedding generation;
- public dynamic output.

I02 does not create runtime safe mode.

## 18. Environment File Policy

Environment files must not be committed.

Protected names include:

- .env
- .env.local
- .env.production
- .env.development
- service-account.json
- service_role_key.json

I02 does not modify `.gitignore`.

A future cleanup/security stage may update `.gitignore` separately if required.

## 19. Preview Output

I02 may generate:

- data/implementation/i02-feature-flag-environment-boundary-preview.json

This output is preview-only.

It is not runtime configuration.

It is not an environment file.

It is not a feature flag evaluator.

It is not public output.

## 20. Recommended Next Stage

Recommended next stage:

I03 — Data Model Planning without Database Activation

I03 should remain planning-only unless separately approved.

## 21. Explicit Exclusions

I02 does not:

- create `.env`;
- create `.env.local`;
- create `.env.production`;
- create secrets;
- read secrets;
- create runtime feature toggles;
- create feature flag evaluator;
- create API routes;
- create server endpoints;
- activate Supabase;
- activate Auth;
- activate payment;
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
- modify `.gitignore`.

## 22. I02 Acceptance Criteria

I02 is complete when:

1. I02 document exists.
2. I02 registry exists.
3. I02 preview generator exists.
4. I02 validator exists.
5. I02 preview output exists.
6. Feature flag families are declared.
7. Required future flags are declared and default to false.
8. Environment variable categories are declared.
9. Public/server-only boundary is declared.
10. Supabase/Auth/payment/API/ML/external API boundaries are declared.
11. No actual environment files or secrets are created.
12. Runtime, API, Supabase, Auth, admin, ML, public output, and subscriber output remain disabled.
13. validate:i02 passes.
14. validate:implementation passes.
15. validate:project passes.

## 23. I02 Status

I02 establishes Feature Flag and Environment Boundary Plan.

I02 does not activate runtime, environment secrets, API routes, public output, admin, Supabase, Auth, payment, ML, or mutation.
