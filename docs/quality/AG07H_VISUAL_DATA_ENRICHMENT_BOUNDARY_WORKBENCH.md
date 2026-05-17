# AG07H — Visual and Data Enrichment Boundary / Workbench

## Purpose

AG07H defines the visual and data enrichment boundary for future long-form content packets.

This stage is visual/data boundary only. It does not generate visual assets, insert images, populate image credits, populate alt text, populate captions, create data-unit outputs, mutate public articles, insert references, generate article prose, append JSONL records, publish content, write to a database, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07H consumes:

- AG07G Reference Discovery Boundary / Workbench.
- AG07G workbench, schema and learning record.
- AG07F Preview Packet Schema Revision Boundary.
- AG07F contract boundary plan and revised contract schema.
- AG07C preview-only packet skeleton.
- AG06I visual/data/infographic requirement standard.
- AG06E long-form article standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Workbench Boundary

AG07H defines:

- hero visual need slot;
- structured visual / infographic need slot;
- optional supporting context visual slot;
- data-unit slots;
- caption context field;
- alt-text field;
- image-credit field;
- mobile-safe layout rules;
- visual/data review workflow;
- future handoff to later controlled stages.

All asset paths, asset URLs, captions, alt text, image credits and data values remain empty in AG07H.

## Visual and Data Status

AG07H does not create visual assets.

It does not generate infographics.

It does not insert images into article HTML.

It does not populate captions, alt text or image credits.

It does not create data-unit outputs.

## Production Readiness Decision

AG07H does not make the packet production-ready.

Production readiness remains not_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07H does not:

- generate visual assets;
- generate infographics;
- insert hero images;
- insert article images;
- populate image credits;
- populate alt text;
- populate captions;
- generate data-unit outputs;
- insert references into article HTML;
- generate article prose;
- generate production content packets;
- mutate public article HTML;
- copy, move, delete or import scaffold outputs;
- create or append production JSONL records;
- write to any database;
- change approval states;
- set publish_ready=true;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Acceptance Criteria

AG07H is acceptable only if:

- AG07G boundary is consumed;
- AG06I visual/data standard is consumed;
- visual need slots are created as empty boundary slots;
- asset_path, asset_url, caption, alt_text and image_credit fields remain empty;
- data-unit slots are created with empty data_values arrays;
- visual generation remains false;
- image insertion remains false;
- data-unit generation remains false;
- production readiness remains not_ready;
- publish readiness remains blocked;
- AG07I is identified as next only with explicit approval;
- package scripts for generate:ag07h and validate:ag07h are present;
- validate:project includes validate:ag07h;
- no visual generation, image insertion, article prose generation, public mutation, reference insertion, scaffold import, JSONL production append, database write, approval-state change, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07I — Quality and Visitor-Value Scoring Boundary.

AG07I must not start automatically. It requires explicit approval.
