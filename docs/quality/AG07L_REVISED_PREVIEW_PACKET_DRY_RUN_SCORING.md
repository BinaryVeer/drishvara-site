# AG07L — Revised Preview Packet + Dry-Run Scoring

## Purpose

AG07L creates one revised preview packet using the AG07K preview-only article inference record and calculates dry-run quality and visitor-value scores.

This stage is still non-production. It does not create a production packet, approve publish-readiness, change approval state, append production JSONL, write to database or Supabase, generate article prose, mutate public articles, insert references, generate visuals, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07L consumes:

- AG07K Article Inference Preview Record Dry Run.
- AG07J Article Inference Store Boundary.
- AG07I Quality and Visitor-Value Scoring Boundary.
- AG07H Visual and Data Enrichment Boundary / Workbench.
- AG07G Reference Discovery Boundary / Workbench.
- AG07C preview-only packet skeleton.
- AG06E long-form article standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Revised Preview Packet Scope

AG07L defines a revised preview packet with:

- article inference summary;
- planned revised sections;
- reference plan;
- visual/data plan;
- static-live readiness preview fields.

The packet is not a production packet.

## Dry-Run Scoring Scope

AG07L calculates dry-run-only scores for:

- quality score;
- visitor-value score;
- combined score.

The scores are not production approval and do not change publish readiness.

## Production Readiness Decision

AG07L does not make the packet production-ready.

Production readiness remains not_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07L does not:

- create a production packet;
- create production score records;
- approve publish-readiness;
- change approval state;
- set publish_ready=true;
- append production JSONL records;
- write to database or Supabase;
- generate article prose;
- generate production content;
- mutate public article HTML;
- insert references into article HTML;
- generate visual assets or infographics;
- insert images;
- copy, move, delete or import scaffold outputs;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Static-Live Compatibility Note

AG07L introduces static-live readiness preview fields only. These fields are for future controlled static-live stages and do not permit HTML mutation in AG07L.

## Acceptance Criteria

AG07L is acceptable only if:

- AG07K preview inference record is consumed;
- one revised preview packet is created;
- dry-run quality score is calculated;
- dry-run visitor-value score is calculated;
- dry-run combined score is calculated;
- production packet creation remains false;
- publish-ready approval remains false;
- approval-state change remains false;
- production JSONL append remains false;
- database/Supabase write remains false;
- public article mutation remains false;
- reference insertion remains false;
- visual generation remains false;
- production readiness remains not_ready;
- publish readiness remains blocked;
- AG07M Improvement Pass is identified as next only with explicit approval;
- package scripts for generate:ag07l and validate:ag07l are present;
- validate:project includes validate:ag07l.

## Next Stage

The next possible stage is AG07M — Improvement Pass.

AG07M must not start automatically. It requires explicit approval.
