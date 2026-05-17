# AG06L — Publish Queue and Approval State Register

## Purpose

AG06L closes the publish queue and approval-state governance layer for future Drishvara long-form production.

This stage defines approval states, queue states, transition rules, approval checkpoints, role labels and publish-readiness gate groups. It also maps the existing AG06F long-form upgrade queue into an approval-state register while keeping every entry not approved, not publish-ready and not eligible for public mutation.

AG06L does not publish content, mutate public articles, insert references, generate content packets, append JSONL records, import scaffold outputs, write to any database, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG06L consumes:

- AG06H-R1 Content Intelligence Foundation Alignment Review.
- AG06E Long-Form Article Standard.
- AG06F Long-Form Production Queue.
- AG06G Dry-Run Review.
- AG06H Batch 01 Content Packet Upgrade Planning.
- AG06I Visual/Data/Infographic Requirement Schema Closure.
- AG06J Reference and Source Credibility Schema Closure.
- AG06K JSONL-first Content Intelligence Store Governance.

## Queue Logic

Each AG06F queue entry is represented in AG06L as an approval-state register entry.

Every register entry remains:

- approval_state=not_approved;
- publish_ready=false;
- publication_allowed=false;
- article_mutation_allowed=false;
- reference_insertion_allowed=false;
- content_packet_generation_allowed=false;
- jsonl_append_allowed=false.

## Approval State Model

AG06L defines future states including:

- queued_for_upgrade_review;
- content_packet_planning_only;
- content_packet_generation_awaiting_explicit_approval;
- content_packet_drafted_in_future_stage;
- reference_review_pending;
- visual_review_pending;
- quality_review_pending;
- visitor_value_review_pending;
- editorial_review_pending;
- approval_required;
- approved_for_publish_readiness_review;
- publish_ready_locked_in_future_stage;
- published_in_later_approved_stage;
- revision_required;
- rejected;
- paused;
- archived_by_explicit_approval_only.

## Approval Checkpoints

AG06L defines future approval checkpoints:

- content packet generation permission;
- reference approval;
- visual/data approval;
- quality score approval;
- visitor-value score approval;
- editorial approval;
- final publish approval.

All checkpoints remain pending, blocked or not evaluated in AG06L.

## Publish-Readiness Gate Groups

AG06L groups future publish-readiness gates from:

- AG06E long-form content standard;
- AG06J reference/source credibility;
- AG06I visual/data/infographic requirement;
- AG06K JSONL auditability;
- AG06L public mutation and publish controls.

## Explicit Exclusions

AG06L does not:

- change approval state;
- set publish_ready=true;
- grant publication approval;
- publish content;
- mutate current public article HTML;
- insert, populate or change reference URLs;
- modify CSS or JavaScript;
- create or append production JSONL records;
- write to any database;
- copy, move, delete, import or publish scaffold files;
- generate article rewrites;
- generate upgraded content packets;
- generate visual assets or infographics;
- assign final quality or visitor-value scores;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output;
- mark any existing public article as final Drishvara-quality content.

## Acceptance Criteria

AG06L is acceptable only if:

- AG06H-R1, AG06E, AG06F, AG06G, AG06H, AG06I, AG06J and AG06K inputs are present;
- approval register count matches AG06F queue count;
- every approval register entry remains not approved and not publish-ready;
- state model is defined;
- approval checkpoints are defined;
- transition rules are defined;
- approval role labels are defined as future process roles only, not Auth roles;
- publish-readiness gate groups are defined;
- package scripts for generate:ag06l and validate:ag06l are present;
- validate:project includes validate:ag06l;
- no approval-state change, publish-ready lock, publishing, public article mutation, reference insertion, content packet generation, JSONL append, scaffold import, database write, backend/Auth/Supabase activation or public output is performed.

## Next Stage

The next stage is AG06Z — Content Intelligence Foundation Closure.
