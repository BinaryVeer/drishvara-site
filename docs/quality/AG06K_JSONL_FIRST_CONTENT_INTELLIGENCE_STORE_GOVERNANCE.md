# AG06K — JSONL-first Content Intelligence Store Governance

## Purpose

AG06K closes the JSONL-first content-intelligence store governance layer for future Drishvara long-form production.

This stage defines future JSONL record families, line contracts, storage manifest rules, state model, validation rules and safety controls.

AG06K does not create production JSONL files, append JSONL records, import scaffold outputs, mutate public articles, insert references, generate content packets, write to a database, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG06K consumes:

- AG06H-R1 Content Intelligence Foundation Alignment Review.
- AG06I Visual/Data/Infographic Requirement Schema Closure.
- AG06J Reference and Source Credibility Schema Closure.
- AG06B Content Packet Schema.
- AG06F Long-Form Production Queue.
- AG06H Batch 01 Content Packet Upgrade Planning.

## JSONL-first Store Principle

Future content-intelligence records should be stored as append-oriented JSONL records before any database or runtime activation.

Each line must be one complete JSON object. Each record must include stable identity, schema version, stage ID, source trace, mutation controls and audit trace.

## Future Record Families

AG06K defines future JSONL record families for:

- content packet records;
- reference candidate records;
- approved reference records;
- rejected reference records;
- visual plan records;
- quality review records;
- publish queue state records;
- learning snapshot records;
- run registry records;
- audit event records.

These are future store contracts only. AG06K does not create or populate the production JSONL files.

## Common Line Contract

Every future JSONL record must follow the common line contract:

- UTF-8 encoding;
- one valid JSON object per line;
- no blank lines;
- no trailing commas;
- stable record ID;
- schema ID and schema version;
- stage ID;
- source trace;
- mutation controls;
- audit trace;
- public-ready and publish-ready flags defaulting to false.

## State Model

AG06K defines a future state model:

- planned_not_created;
- draft_record_allowed_in_future_stage;
- under_review;
- revision_required;
- approved_for_content_packet;
- approved_for_publish_queue;
- publish_ready;
- published_in_later_stage;
- rejected;
- archived_by_explicit_approval_only.

## Safety Rules

AG06K records these safety rules:

- no raw secrets or credentials in JSONL;
- no raw user profile storage;
- no public article HTML mutation through JSONL;
- no database sync in AG06K;
- no Supabase activation in AG06K;
- no scaffold import in AG06K;
- no publishing in AG06K.

## Explicit Exclusions

AG06K does not:

- create production JSONL content files;
- append records to JSONL files;
- import scaffold outputs;
- write to any database;
- activate Supabase, Auth, API routes or backend services;
- mutate current public article HTML;
- insert, populate or change reference URLs;
- modify CSS or JavaScript;
- copy, move, delete, import or publish scaffold files;
- generate article rewrites;
- generate upgraded content packets;
- generate visual assets or infographics;
- assign final quality or visitor-value scores;
- publish content;
- mark any existing public article as final Drishvara-quality content.

## Acceptance Criteria

AG06K is acceptable only if:

- AG06H-R1, AG06I, AG06J and AG06B inputs are present;
- future JSONL record families are defined;
- common line contract is defined;
- store manifest fields are defined;
- state model is defined;
- JSONL safety rules are defined;
- package scripts for generate:ag06k and validate:ag06k are present;
- validate:project includes validate:ag06k;
- no JSONL production file creation, JSONL append, scaffold import, database write, public article mutation, reference insertion, content generation, backend/Auth/Supabase activation or publishing is performed.

## Next Stage

The next stage is AG06L — Publish Queue and Approval State Register.
