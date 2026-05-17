# AG07N — Production Packet Candidate

## Purpose

AG07N creates one production-packet candidate record using the AG07M improved preview packet.

This stage creates a candidate record only. It does not create an actual production packet, generate production content, approve publish-readiness, change approval state, append production JSONL, write to database or Supabase, generate article prose, mutate public articles, insert references, populate reference URLs, generate visuals, perform static-live mutation, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07N consumes:

- AG07M Improvement Pass.
- AG07L Revised Preview Packet + Dry-Run Scoring.
- AG07K Article Inference Preview Record Dry Run.
- AG07H Visual and Data Enrichment Boundary / Workbench.
- AG07G Reference Discovery Boundary / Workbench.
- AG06E long-form article standard.
- AG06J reference/source credibility standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Candidate Scope

AG07N creates:

- one production-packet candidate record;
- candidate section structure;
- reference candidate plan;
- visual/data candidate plan;
- static-live candidate plan;
- approval candidate checklist;
- readiness record.

The candidate is not a production packet.

## Production Readiness Decision

AG07N does not make the packet production-ready.

Production readiness becomes candidate_created_not_production_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07N does not:

- create an actual production packet;
- generate production content;
- generate article prose;
- recalculate scores;
- calculate actual scores;
- create production score records;
- approve publish-readiness;
- change approval state;
- set publish_ready=true;
- append production JSONL records;
- write to database or Supabase;
- mutate public article HTML;
- insert references into article HTML;
- populate reference URLs;
- generate visual assets or infographics;
- insert images;
- perform static-live mutation;
- copy, move, delete or import scaffold outputs;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Static-Live Compatibility Note

AG07N carries static-live candidate fields forward, including target article path, backup requirement, mutation sections, rollback plan and post-mutation validation checklist. These remain candidate-only and inactive.

## Acceptance Criteria

AG07N is acceptable only if:

- AG07M improved preview packet is consumed;
- one production-packet candidate record is created;
- actual production packet creation remains false;
- production content generation remains false;
- article prose generation remains false;
- publish-ready approval remains false;
- approval-state change remains false;
- production JSONL append remains false;
- database/Supabase write remains false;
- public article mutation remains false;
- reference insertion and reference URL population remain false;
- visual generation remains false;
- static-live mutation remains false;
- production readiness remains candidate_created_not_production_ready;
- publish readiness remains blocked;
- AG07O Approval + Controlled Single-Article Mutation Plan is identified as next only with explicit approval;
- package scripts for generate:ag07n and validate:ag07n are present;
- validate:project includes validate:ag07n.

## Next Stage

The next possible stage is AG07O — Approval + Controlled Single-Article Mutation Plan.

AG07O must not start automatically. It requires explicit approval.
