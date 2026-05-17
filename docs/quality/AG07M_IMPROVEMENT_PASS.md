# AG07M — Improvement Pass

## Purpose

AG07M uses AG07L dry-run scoring gaps to create one improved preview packet and one improvement pass record.

This stage improves the preview plan only. It does not create a production packet, recalculate scores, approve publish-readiness, change approval state, append production JSONL, write to database or Supabase, generate article prose, mutate public articles, insert references, populate reference URLs, generate visuals, perform static-live mutation, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07M consumes:

- AG07L Revised Preview Packet + Dry-Run Scoring.
- AG07K Article Inference Preview Record Dry Run.
- AG07I Quality and Visitor-Value Scoring Boundary.
- AG07H Visual and Data Enrichment Boundary / Workbench.
- AG07G Reference Discovery Boundary / Workbench.
- AG06E long-form article standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Improvement Scope

AG07M creates:

- one improved preview packet;
- one improvement pass record;
- improvement actions mapped to AG07L score gaps;
- improved reference-readiness plan;
- improved visual/data-readiness plan;
- forward-compatible static-live readiness preview.

## Scoring Status

AG07M consumes AG07L dry-run scores but does not recalculate scores.

Dry-run scoring remains a non-production input.

No publish-ready approval is created.

## Production Readiness Decision

AG07M does not make the packet production-ready.

Production readiness remains not_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07M does not:

- create a production packet;
- create production score records;
- recalculate dry-run scores;
- calculate actual scores;
- approve publish-readiness;
- change approval state;
- set publish_ready=true;
- append production JSONL records;
- write to database or Supabase;
- generate article prose;
- generate production content;
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

AG07M carries static-live readiness requirements forward, including target article path, backup requirement, mutation sections, rollback plan and post-mutation validation checklist. These remain preview-only and inactive.

## Acceptance Criteria

AG07M is acceptable only if:

- AG07L revised preview packet and dry-run scoring are consumed;
- one improved preview packet is created;
- improvement actions are created;
- dry-run scores are consumed but not recalculated;
- production packet creation remains false;
- publish-ready approval remains false;
- approval-state change remains false;
- production JSONL append remains false;
- database/Supabase write remains false;
- article prose generation remains false;
- public article mutation remains false;
- reference insertion and reference URL population remain false;
- visual generation remains false;
- static-live mutation remains false;
- production readiness remains not_ready;
- publish readiness remains blocked;
- AG07N Production Packet Candidate is identified as next only with explicit approval;
- package scripts for generate:ag07m and validate:ag07m are present;
- validate:project includes validate:ag07m.

## Next Stage

The next possible stage is AG07N — Production Packet Candidate.

AG07N must not start automatically. It requires explicit approval.
