# AG07C — Content Packet Generator Preview-Only Dry Run

## Purpose

AG07C performs the first controlled preview-only dry run for the Drishvara long-form content packet generator pathway.

This stage creates one non-public content packet skeleton for review. The packet is preview-only and contains placeholders, contracts and audit fields only. It does not generate final article prose, mutate public article HTML, insert references, generate visuals, append JSONL records, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07C consumes:

- AG07B Content Packet Generator Dry-Run Implementation Plan.
- AG07A Long-Form Content Packet Generator Design / Dry-Run Boundary.
- AG06Z Content Intelligence Foundation Closure.
- AG06B Content Packet Schema.
- AG06E Long-Form Article Standard.
- AG06I Visual/Data/Infographic Requirement Standard.
- AG06J Reference and Source Credibility Standard.
- AG06K JSONL-first Store Manifest.
- AG06L Publish Queue and Approval State Register.

## Dry-Run Output

AG07C creates one preview-only packet skeleton:

- content packet ID;
- selected source article metadata;
- source queue snapshot;
- planning snapshot;
- approval-state snapshot;
- target article standard;
- required section skeleton;
- reference requirement preview;
- visual requirement preview;
- JSONL/database boundary;
- mutation controls;
- audit trace.

## Preview-Only Boundary

The AG07C packet is not a production packet.

It is not publish-ready.

It contains no generated article prose.

It contains no verified reference URLs.

It contains no generated visual assets.

It does not change any approval state.

## Explicit Exclusions

AG07C does not:

- mutate current public article HTML;
- insert, populate or change reference URLs;
- fetch live URLs;
- generate article prose;
- generate final content packets for production;
- generate visual assets or infographics;
- copy, move, delete or import scaffold outputs;
- create or append production JSONL records;
- write to any database;
- change approval states;
- set publish_ready=true;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Acceptance Criteria

AG07C is acceptable only if:

- AG07B is present and closed as implementation-plan only;
- AG07A boundary and AG06Z foundation are present;
- exactly one preview-only packet skeleton is created;
- packet status is preview_only_dry_run;
- production_packet=false;
- publication_allowed=false;
- publish_ready=false;
- all packet sections are placeholder-only;
- no article prose is generated;
- reference counts remain zero and URLs are empty;
- visual asset count remains zero;
- mutation controls remain false;
- package scripts for generate:ag07c and validate:ag07c are present;
- validate:project includes validate:ag07c;
- no public mutation, reference insertion, visual generation, scaffold import, JSONL production append, database write, approval-state change, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07D — Preview Packet Review and Gap Audit.

AG07D must not start automatically. It requires explicit approval.
