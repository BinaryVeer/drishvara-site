# I01 — Safe Folder Architecture & Static Registry Loading Plan

Status: Implementation planning / static loading plan only  
Phase: I-Implementation Planning  
Depends on: I00, C16  
Runtime impact: None  
Subscriber impact: None  
Public API impact: None  
Admin impact: None  
ML impact: None  

## 1. Purpose

I01 defines Drishvara’s safe folder architecture and static registry loading plan.

I01 does not create runtime loaders, API routes, server endpoints, Supabase connections, Auth flows, admin panels, payment flows, public output, subscriber output, ML ingestion, embeddings, vector database writes, or content mutation.

I01 creates a read-only static registry manifest preview so future implementation can understand which JSON governance and preview assets exist.

## 2. Current Position

I00 established the implementation planning boundary.

C16 closed the C10–C15 content governance sequence and recommended I01 as the next stage.

I01 continues planning only.

## 3. Repository Boundary

The active implementation repository remains:

- drishvara-site

The older scaffold remains:

- drishvara_phase01_scaffold

The older scaffold is still reference-only and must not be blindly merged.

## 4. Folder Architecture Doctrine

The repository should be understood in layers.

Current and planned folder roles:

| Folder | Role | Runtime Status |
|---|---|---|
| docs/methodology | methodology documents | static governance |
| data/methodology | methodology registries | read-only planning data |
| docs/review | review/control documents | static governance |
| data/review | review/control registries | read-only planning data |
| docs/content | content governance documents | static governance |
| data/content | content governance registries/previews | read-only planning data |
| docs/implementation | implementation planning documents | static governance |
| data/implementation | implementation planning registries/previews | read-only planning data |
| scripts | validators, generators, build/preflight scripts | controlled CLI only |
| articles | static article content | public static content |
| assets | public/static assets | public static assets |
| data/seo | SEO metadata | static site data |
| data/i18n | language/translation data | static site data |
| data/knowledge | knowledge governance or source data | static governance/planning data |
| data/backend | backend planning/preflight data if present | disabled planning data |

I01 does not restructure folders.

## 5. Static Registry Loading Doctrine

Static registry loading means a future tool may read approved JSON files as static inputs.

It does not mean live mutation.

It does not mean runtime activation.

It does not mean public API exposure.

I01 allows only a manifest preview of static JSON files.

## 6. Static Registry Candidate Families

Static registry candidate families include:

- methodology registries;
- review registries;
- content governance registries;
- content preview outputs;
- implementation planning registries;
- knowledge governance registries;
- backend planning registries;
- SEO metadata;
- i18n data.

Each candidate must preserve:

- relative path;
- family;
- size;
- checksum;
- load policy;
- mutation policy;
- runtime status;
- public-output status;
- sensitivity note.

## 7. Read-Only Loading Boundary

Future static loading must be read-only unless a later approved module explicitly enables writes.

I01 keeps all writes disabled.

Future loader design must distinguish:

- safe read-only governance JSON;
- public static site data;
- preview-only output;
- dry-run output;
- handoff output;
- blocked live registry;
- blocked live queue.

## 8. No Runtime Loader Doctrine

I01 does not create a runtime loader.

I01 does not create JavaScript or server modules used by the public site.

The I01 generator is a CLI-only manifest generator.

## 9. No Public Output Doctrine

The static registry manifest is internal planning data.

It must not be exposed as public output.

It must not change homepage, article pages, sitemap, SEO metadata, or dashboard cards.

## 10. No Supabase/Auth/Admin Doctrine

I01 does not activate:

- Supabase;
- Auth;
- RLS;
- admin UI;
- admin route;
- review queue;
- database migration;
- reviewer assignment;
- approval workflow.

## 11. No ML/Embedding Doctrine

I01 does not activate:

- ML ingestion;
- embeddings;
- model training;
- vector database writes;
- asset eligibility changes.

## 12. Feature Flag Boundary

All future feature flags remain false in I01.

Future implementation may define flags later, but I01 must not set live flags.

Blocked feature families:

- public_panchang_enabled;
- public_festival_enabled;
- subscriber_guidance_enabled;
- admin_review_enabled;
- content_registry_write_enabled;
- review_queue_write_enabled;
- supabase_enabled;
- auth_enabled;
- payment_enabled;
- ml_ingestion_enabled;
- embedding_generation_enabled;
- external_api_fetch_enabled.

## 13. Static Manifest Preview

I01 may generate:

- data/implementation/i01-static-registry-loading-manifest-preview.json

This output is preview-only.

It is not a loader configuration.

It is not a runtime registry.

It is not public.

## 14. Future Implementation Use

Future modules may use I01 outputs to plan:

- safe import boundaries;
- static registry loader design;
- internal preview tools;
- validation dashboards;
- documentation indexes;
- future admin planning;
- future Supabase schema mapping.

Future modules must not treat I01 as activation approval.

## 15. Recommended Next Stage

Recommended next stage:

I02 — Feature Flag and Environment Boundary Plan

I02 should remain planning-only unless separately approved.

## 16. Explicit Exclusions

I01 does not:

- move folders;
- delete files;
- modify backup/archive files;
- modify .gitignore;
- create runtime loaders;
- create API routes;
- create server endpoints;
- activate Supabase;
- activate Auth;
- activate payment;
- activate admin UI;
- activate review queue;
- activate public output;
- activate subscriber output;
- mutate articles;
- mutate homepage;
- mutate sitemap;
- write final registries;
- generate embeddings;
- train models;
- write vector database records;
- fetch external APIs.

## 17. I01 Acceptance Criteria

I01 is complete when:

1. I01 document exists.
2. I01 registry exists.
3. I01 static registry manifest generator exists.
4. I01 validator exists.
5. Static registry manifest preview exists.
6. Folder architecture doctrine is recorded.
7. Static registry loading doctrine is recorded.
8. Read-only loading boundary is recorded.
9. Runtime loader remains absent.
10. Supabase/Auth/Admin remain disabled.
11. ML/embedding remain disabled.
12. Public/subscriber output remain disabled.
13. validate:i01 passes.
14. validate:implementation passes.
15. validate:project passes.

## 18. I01 Status

I01 establishes Safe Folder Architecture & Static Registry Loading Plan.

I01 does not activate runtime, loaders, public output, admin, Supabase, Auth, ML, or mutation.
