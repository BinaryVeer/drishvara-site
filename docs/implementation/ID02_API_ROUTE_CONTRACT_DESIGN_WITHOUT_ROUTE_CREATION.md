# ID02 — API Route Contract Design without Route Creation

Status: Implementation design / API route contract design only  
Phase: ID-Implementation Design  
Depends on: ID01, ID00, IR00, I00 through I05, C16  
Runtime impact: None  
Subscriber impact: None  
Public API impact: None  
Admin impact: None  
Database impact: None  
Migration impact: None  
ML impact: None  

## 1. Purpose

ID02 defines Drishvara’s future API route contracts without creating any route.

ID02 does not create API route files, server endpoints, route handlers, backend source files, Supabase clients, database clients, Auth flows, payment flows, admin UI, review queues, public output, subscriber output, ML ingestion, embeddings, vector database writes, external API fetch, secrets, environment files, or content mutation.

ID02 is API contract design only.

## 2. Current Position

ID01 defined Supabase logical schema and RLS design without migration and recommended ID02.

IR00 allowed detailed design only and kept activation as no-go.

ID02 therefore remains design-only.

## 3. API Contract Design Doctrine

API contracts may be designed before routes exist.

Each future API contract must declare:

- route key;
- route family;
- HTTP method;
- path pattern;
- purpose;
- access tier;
- request contract;
- response contract;
- error taxonomy;
- authentication requirement;
- consent gate;
- entitlement gate;
- privacy gate;
- source gate;
- rate-limit policy;
- cache policy;
- audit trace requirement;
- public output status;
- subscriber output status;
- route creation status;
- activation blockers.

ID02 must not create routes.

## 4. Route Family Doctrine

Future API route families include:

- internal preview;
- Panchang calculation;
- observance and festival;
- subscriber profile;
- subscriber guidance;
- content review;
- admin review;
- entitlement and payment;
- audit;
- health and readiness.

All route families remain disabled.

## 5. Request Contract Doctrine

Each future request contract must define:

- request envelope;
- required fields;
- optional fields;
- prohibited fields;
- validation notes;
- privacy notes.

Requests must never include secrets, service-role keys, raw payment secrets, or unredacted subscriber-private data unless a future secure server-only design permits it.

## 6. Response Contract Doctrine

Each future response contract must define:

- response envelope;
- success fields;
- blocked fields;
- audit trace reference;
- source disclosure requirement;
- error response shape.

Responses must not expose secrets, service-role keys, internal reviewer identity, unredacted subscriber data, or unreviewed outputs.

## 7. Error Taxonomy Doctrine

Future APIs should use a controlled error taxonomy.

Error categories include:

- validation_error;
- auth_required;
- consent_required;
- entitlement_required;
- privacy_blocked;
- source_review_required;
- rights_review_required;
- output_gate_blocked;
- rate_limited;
- safe_mode_blocked;
- internal_preview_only;
- not_implemented;
- activation_blocked.

ID02 does not create runtime error handlers.

## 8. Access Boundary Doctrine

Access tiers include:

- public_static_read;
- internal_preview_read;
- subscriber_private;
- reviewer_restricted;
- admin_restricted;
- server_only.

ID02 does not activate Auth or access control.

## 9. Public Output Boundary

No ID02 route contract may allow public output.

Future public output requires:

- feature flag;
- source gate;
- public-safe gate;
- privacy gate;
- validation gate;
- rollback gate.

ID02 does not create public API routes.

## 10. Subscriber Output Boundary

No ID02 route contract may allow subscriber output.

Future subscriber output requires:

- Auth;
- consent;
- entitlement;
- privacy review;
- redaction;
- audit trace;
- subscriber output gate.

ID02 does not create subscriber APIs.

## 11. Admin and Review Boundary

Future admin/review APIs require:

- Auth;
- role mapping;
- RLS;
- admin boundary;
- audit trace;
- rollback policy;
- no public cache.

ID02 does not create admin APIs.

## 12. Panchang and Guidance Boundary

Future Panchang/guidance APIs require:

- source-first doctrine;
- methodology readiness;
- calculation basis disclosure;
- location/timezone/sunrise basis;
- observance conflict rules;
- Sanskrit integrity;
- no invented mantra doctrine;
- validation-learning loop;
- output gates.

ID02 does not activate Panchang or guidance output.

## 13. Cache and Rate-Limit Doctrine

Future APIs must define cache and rate-limit policies.

Default posture:

- no public cache for private/internal routes;
- no caching of subscriber private guidance without explicit policy;
- rate limit future dynamic calculation routes;
- rate limit future admin write routes;
- rate limit future payment/entitlement webhooks;
- avoid caching unreviewed internal preview output.

ID02 does not create caching or rate limiting.

## 14. Audit Trace Doctrine

Future APIs should include audit tracing where output, decision, entitlement, approval, or profile data is involved.

Audit fields may include:

- trace_id;
- route_key;
- actor_role;
- request_scope;
- gate_decision;
- source_refs;
- output_status;
- blocked_reason;
- created_at.

ID02 does not write audit traces.

## 15. Activation Blocker Doctrine

Every route contract must remain blocked until:

- feature flag exists;
- environment boundary is approved;
- Auth/RLS are ready where needed;
- Supabase/storage is ready where needed;
- validation tests exist;
- rollback path exists;
- privacy gate passes;
- output gate passes.

## 16. Preview Output

ID02 may generate:

- data/implementation/id02-api-route-contract-design-preview.json

This output is preview-only.

It is not a route manifest.

It is not an API implementation.

It is not a server endpoint.

It is not public output.

## 17. Recommended Next Stage

Recommended next stage:

QA00 — First Page / Homepage Stability Audit Checklist

QA00 should focus on static homepage/live page stability and should not activate backend.

## 18. Explicit Exclusions

ID02 does not:

- create API route files;
- create server endpoints;
- create route handlers;
- create backend source files;
- connect Supabase;
- create Supabase tables;
- create RLS policies;
- create database migrations;
- create SQL files;
- create database clients;
- create repositories;
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

## 19. ID02 Acceptance Criteria

ID02 is complete when:

1. ID02 document exists.
2. ID02 registry exists.
3. ID02 preview generator exists.
4. ID02 validator exists.
5. ID02 preview output exists.
6. API route families are declared.
7. Future API contracts are declared.
8. Request/response/error/access/audit/cache/rate-limit doctrines are declared.
9. No API routes, route handlers, server endpoints, Supabase, Auth, RLS, migration, payment, admin, ML, public output, subscriber output, or mutation is enabled.
10. validate:id02 passes.
11. validate:implementation passes.
12. validate:project passes.

## 20. ID02 Status

ID02 establishes API Route Contract Design without Route Creation.

ID02 does not activate API routes, backend, Supabase, Auth, RLS, payment, admin, public output, subscriber output, ML, embeddings, or mutation.
