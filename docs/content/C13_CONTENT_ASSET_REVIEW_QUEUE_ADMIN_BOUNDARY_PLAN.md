# Content Stage C13 — Content Asset Review Queue Schema & Admin Boundary Plan

Status: Content governance / schema and boundary only  
Phase: C-Content Governance  
Depends on: C01 through C12, I00  
Runtime impact: None  
Subscriber impact: None  
Public API impact: None  
Admin impact: None  
ML impact: None  

## 1. Purpose

C13 defines the future content asset review queue schema and admin boundary for Drishvara.

C13 does not create a live review queue, admin panel, admin route, Supabase table, database migration, Auth rule, approval workflow, public publishing workflow, ML pipeline, embedding pipeline, or dashboard card.

C13 is a schema and boundary-planning stage only.

## 2. Current Position

C11 extracted candidate content assets from the existing static public-preview content system.

C12 generated read-only verification and review workflow recommendations for those candidates.

C13 now defines how those review workflow recommendations may later become a controlled review queue after admin, Auth, Supabase, RLS, and approval controls are planned and activated in future modules.

C13 itself does not activate any of those systems.

## 3. Source Reference

C13 references, but does not mutate:

- data/content/content-asset-verification-review-preview.json

This file remains a preview-only output from C12.

## 4. Output Position

C13 creates only:

- a governance document;
- a machine-readable schema/boundary registry;
- a validator.

C13 does not create:

- a live review queue JSON file;
- a Supabase table;
- an admin UI;
- a public API;
- a private API;
- an approval record;
- a published asset record.

## 5. Review Queue Schema Doctrine

A future review queue item should include:

- queue_item_id;
- source_preview_ref;
- review_item_id;
- asset_id;
- asset_type;
- title;
- article_path;
- assigned_review_stage;
- current_review_status;
- priority;
- required_reviews;
- metadata_gaps;
- blockers;
- reviewer_role_required;
- reviewer_assigned_to;
- reviewer_decision;
- reviewer_note;
- approval_status;
- public_safe_status;
- source_status;
- rights_status;
- quality_status;
- duplicate_status;
- image_status;
- hindi_readiness_status;
- ml_training_eligible;
- embedding_eligible;
- registry_write_allowed;
- audit_trace_id;
- created_at;
- updated_at;
- next_action.

The schema is future-facing only.

## 6. Queue Status Doctrine

Future queue statuses may include:

- queued;
- assigned;
- under_review;
- source_review_pending;
- rights_review_pending;
- quality_review_pending;
- duplicate_review_pending;
- image_review_pending;
- hindi_review_pending;
- public_safety_review_pending;
- editorial_review_pending;
- approved_for_public_candidate;
- rejected;
- needs_revision;
- blocked;
- archived;
- closed_no_action.

C13 does not assign live statuses.

## 7. Approval Boundary Doctrine

C13 must not approve any asset.

Future approval must be explicit and role-gated.

Approval categories must remain separate:

- source_approval;
- rights_approval;
- image_approval;
- quality_approval;
- public_safe_approval;
- editorial_approval;
- ml_training_approval;
- embedding_approval.

Approval in one category must not imply approval in another category.

## 8. Admin Boundary Doctrine

C13 defines admin boundaries but does not activate admin.

Future admin workflow requires:

- Auth;
- role-based access;
- reviewer role mapping;
- Supabase or approved storage;
- RLS policy;
- audit trail;
- rollback path;
- approval separation;
- public-output block;
- ML-output block;
- service-role key safety.

C13 does not create or activate admin routes.

## 9. Reviewer Role Doctrine

Future reviewer roles may include:

- content_editor;
- source_reviewer;
- rights_reviewer;
- image_reviewer;
- quality_reviewer;
- hindi_reviewer;
- duplicate_reviewer;
- public_safety_reviewer;
- ml_eligibility_reviewer;
- embedding_reviewer;
- admin_owner;
- final_approver.

C13 does not create users or roles.

## 10. Review Decision Doctrine

Future reviewer decisions may include:

- approve_for_next_review;
- request_revision;
- request_source_details;
- request_rights_details;
- request_image_replacement;
- request_hindi_review;
- mark_duplicate;
- select_canonical_asset;
- mark_reference_only;
- mark_internal_only;
- reject_asset;
- keep_blocked;
- escalate_to_admin_owner.

C13 does not execute decisions.

## 11. Audit Trail Doctrine

Every future review queue action must preserve audit trail.

Audit fields should include:

- audit_trace_id;
- queue_item_id;
- action;
- previous_status;
- new_status;
- reviewer_role;
- reviewer_id_or_label;
- timestamp;
- decision_reason;
- affected_fields;
- rollback_available;
- public_output_changed;
- ml_eligibility_changed;
- embedding_eligibility_changed.

C13 does not write audit records.

## 12. Supabase Boundary Doctrine

C13 does not activate Supabase.

Before Supabase is used for review queue records, a future module must define:

- table schema;
- migration plan;
- RLS policy;
- Auth role mapping;
- service-role key boundary;
- backup and rollback;
- seed/import policy;
- read/write separation;
- local preview fallback;
- admin approval flow.

## 13. Public Output Boundary Doctrine

Review queue existence must not create public output.

Even if a future queue item is approved internally, public publishing must require a separate public-output activation gate.

C13 keeps public output disabled.

## 14. ML and Embedding Boundary Doctrine

Review queue existence must not create ML eligibility.

ML-training and embedding eligibility must remain false unless specifically approved by separate source, rights, quality, privacy, duplicate, and reviewer gates.

C13 keeps ML ingestion, embedding generation, model training, and vector writes disabled.

## 15. Import Boundary Doctrine

C13 may define how C12 preview records could be imported later.

A future import must be:

- explicit;
- dry-run first;
- idempotent;
- auditable;
- reversible;
- approval-gated;
- non-public by default;
- non-ML by default.

C13 does not import C12 records into a live queue.

## 16. Admin UI Boundary Doctrine

A future admin UI may show queue items only after Auth and role controls are active.

Admin UI must show:

- preview/live status;
- asset metadata;
- blockers;
- required reviews;
- reviewer decisions;
- audit trace;
- public-output status;
- ML/embedding eligibility status.

C13 does not create admin UI.

## 17. Explicit Exclusions

C13 does not:

- create a live review queue;
- create admin UI;
- create admin route;
- create API route;
- create Supabase table;
- create database migration;
- activate Auth;
- activate payment;
- activate Supabase;
- activate RLS;
- assign reviewers;
- approve assets;
- approve public-safe status;
- approve sources;
- approve rights;
- approve images;
- approve ML training;
- approve embedding;
- mutate article files;
- mutate article index;
- mutate homepage featured reads;
- mutate sitemap;
- mutate SEO metadata;
- write final asset registry;
- write image registry;
- write verified link registry;
- write selection memory;
- fetch external APIs;
- crawl links;
- download images;
- generate embeddings;
- train models;
- write vector database records;
- activate public output;
- activate subscriber output.

## 18. Safety Doctrine

C13 must preserve:

- no public approval by schema existence;
- no ML approval by schema existence;
- no admin authority without Auth/RLS;
- no source or rights approval without review;
- no hidden public mutation;
- no hidden ML ingestion;
- no service-role key exposure;
- no bypass of C10, C11, or C12 guardrails.

## 19. C13 Acceptance Criteria

C13 is complete when:

1. C13 document exists.
2. C13 registry exists.
3. C13 validator exists.
4. Future review queue item schema is declared.
5. Queue status doctrine is declared.
6. Approval boundary doctrine is declared.
7. Admin boundary doctrine is declared.
8. Reviewer role doctrine is declared.
9. Review decision doctrine is declared.
10. Audit trail doctrine is declared.
11. Supabase boundary doctrine is declared.
12. Public output boundary doctrine is declared.
13. ML and embedding boundary doctrine is declared.
14. Import boundary doctrine is declared.
15. Admin UI boundary doctrine is declared.
16. No live queue, admin UI, Supabase, Auth, approval, registry write, ML, embedding, public output, or subscriber output is enabled.
17. validate:c13 passes.
18. validate:content passes.
19. validate:project passes.

## 20. C13 Status

C13 establishes Content Asset Review Queue Schema & Admin Boundary Plan.

C13 does not create a live queue, approve assets, or activate admin/runtime.
