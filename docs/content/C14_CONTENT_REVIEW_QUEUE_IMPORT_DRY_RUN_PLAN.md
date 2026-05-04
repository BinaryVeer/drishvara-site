# Content Stage C14 — Content Review Queue Import Dry-Run Plan

Status: Content governance / dry-run import preview only  
Phase: C-Content Governance  
Depends on: C01 through C13, I00  
Runtime impact: None  
Subscriber impact: None  
Public API impact: None  
Admin impact: None  
ML impact: None  

## 1. Purpose

C14 defines and generates a dry-run import preview for converting C12 review workflow items into future review queue candidate records based on the C13 schema.

C14 does not create a live review queue.

C14 does not create Supabase tables, database migrations, admin UI, admin routes, API routes, reviewer assignments, approval records, public publishing records, ML eligibility records, embeddings, model training records, or vector database records.

C14 is a dry-run planning and preview stage only.

## 2. Current Position

C11 extracted candidate content assets.

C12 generated verification and review workflow recommendations.

C13 defined the future review queue schema and admin boundary.

C14 now prepares a dry-run import preview showing how C12 review items could later be mapped into the future C13 queue schema.

This remains non-live and non-mutating.

## 3. Source File

C14 reads:

- data/content/content-asset-verification-review-preview.json

This is the C12 preview output.

## 4. Output File

C14 may write only:

- data/content/content-review-queue-import-dry-run-preview.json

This is not a live queue.

This is not an admin queue.

This is not a Supabase seed file.

This is not an approval record.

## 5. Dry-Run Import Doctrine

A future import must be:

- explicit;
- dry-run first;
- idempotent;
- auditable;
- reversible;
- approval-gated;
- non-public by default;
- non-ML by default.

C14 follows these principles as a preview only.

## 6. Mapping Doctrine

C14 may map each C12 review item into a proposed future queue record with:

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

These are dry-run proposed records only.

## 7. Queue ID Doctrine

Dry-run queue IDs should be deterministic enough for preview comparison.

They should not be treated as production IDs.

A future live import must define its own approved ID policy.

## 8. Status Mapping Doctrine

C14 may map C12 review statuses into C13 future queue statuses.

Example mapping:

- blocked_pending_basic_metadata → blocked;
- source_review_required → source_review_pending;
- rights_review_required → rights_review_pending;
- quality_review_required → quality_review_pending;
- duplicate_review_required → duplicate_review_pending;
- image_review_required → image_review_pending;
- hindi_review_required → hindi_review_pending;
- public_safety_review_required → public_safety_review_pending;
- ready_for_human_editorial_review → editorial_review_pending.

This is a preview mapping only.

## 9. Reviewer Role Mapping Doctrine

C14 may suggest reviewer roles from required review types.

Example role mapping:

- source_review → source_reviewer;
- rights_review → rights_reviewer;
- image_review → image_reviewer;
- quality_review → quality_reviewer;
- hindi_readiness_review → hindi_reviewer;
- duplicate_review → duplicate_reviewer;
- public_safety_review → public_safety_reviewer;
- ml_eligibility_review → ml_eligibility_reviewer;
- embedding_eligibility_review → embedding_reviewer;
- human_editorial_review → content_editor.

Role suggestions are not assignments.

## 10. Approval Default Doctrine

Every dry-run queue candidate must default to:

- approval_status: not_approved;
- public_safe_status: needs_review;
- source_status: needs_review;
- rights_status: needs_review;
- quality_status: needs_review;
- ml_training_eligible: false;
- embedding_eligible: false;
- registry_write_allowed: false.

C14 cannot approve anything.

## 11. Import Safety Check Doctrine

C14 must report safety checks:

- source preview exists;
- review items exist;
- queue candidate count matches review item count;
- no approval enabled;
- no live queue file created;
- no Supabase enabled;
- no Auth enabled;
- no public output enabled;
- no ML/embedding enabled.

## 12. Explicit Exclusions

C14 does not:

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

## 13. Safety Doctrine

C14 must preserve:

- dry-run only;
- no public approval;
- no ML approval;
- no embedding approval;
- no admin activation;
- no Supabase activation;
- no hidden mutation;
- no public output;
- no subscriber output;
- no service-role key exposure.

## 14. C14 Acceptance Criteria

C14 is complete when:

1. C14 document exists.
2. C14 registry exists.
3. C14 generator exists.
4. C14 validator exists.
5. Dry-run import preview output exists.
6. Dry-run output is marked preview-only and dry-run-only.
7. C12 review items are mapped into future queue candidate records.
8. Queue candidate count matches C12 review item count.
9. No live queue is created.
10. No approvals are granted.
11. ML-training eligibility remains false.
12. Embedding eligibility remains false.
13. Registry write remains false.
14. Supabase/Auth/payment/admin/public/subscriber output remain disabled.
15. validate:c14 passes.
16. validate:content passes.
17. validate:project passes.

## 15. C14 Status

C14 establishes Content Review Queue Import Dry-Run Plan.

C14 does not create a live queue, approve assets, mutate content, or activate runtime.
