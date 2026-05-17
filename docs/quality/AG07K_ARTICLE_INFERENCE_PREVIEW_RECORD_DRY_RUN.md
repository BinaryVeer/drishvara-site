# AG07K — Article Inference Preview Record Dry Run

## Purpose

AG07K creates one preview-only article inference record from the AG07J article inference store boundary.

This stage may populate structured preview inference values for the dry-run record. It does not create a production inference record, append production JSONL, write to database or Supabase, calculate actual scores, approve publish-readiness, change approval state, generate article prose, mutate public articles, insert references, generate visuals, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07K consumes:

- AG07J Article Inference Store Boundary.
- AG07I Quality and Visitor-Value Scoring Boundary.
- AG07H Visual and Data Enrichment Boundary / Workbench.
- AG07G Reference Discovery Boundary / Workbench.
- AG07C preview-only packet skeleton.
- AG06E long-form article standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Preview Record Scope

AG07K creates one preview-only inference record covering:

- article theme;
- reader intent;
- target audience;
- knowledge depth;
- evidence requirement;
- reference need;
- visual/data need;
- SEO/search intent signals;
- originality/improvement inference;
- gap summary;
- recommended upgrade direction;
- future scoring dependency.

The record is a dry-run artifact only.

## Production and Scoring Status

AG07K does not calculate quality score, visitor-value score or combined score.

AG07K does not make the packet production-ready.

Production readiness remains not_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07K does not:

- create a production inference record;
- append production JSONL records;
- write to database or Supabase;
- calculate actual scores;
- approve publish-readiness;
- change approval state;
- set publish_ready=true;
- generate article prose;
- generate production content packets;
- mutate public article HTML;
- insert references into article HTML;
- generate visual assets or infographics;
- insert images;
- copy, move, delete or import scaffold outputs;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Compressed Path After AG07K

After AG07K, the remaining path is compressed as follows:

1. AG07L — Revised Preview Packet + Dry-Run Scoring.
2. AG07M — Improvement Pass.
3. AG07N — Production Packet Candidate.
4. AG07O — Approval + Controlled Single-Article Mutation Plan.
5. AG07P — One-Article Controlled Apply.
6. AG07Q — Post-Mutation Audit.
7. AG07Z — Closure / Repeatable Production Readiness.

## Acceptance Criteria

AG07K is acceptable only if:

- AG07J boundary is consumed;
- exactly one preview-only inference record is created;
- inference field groups are populated as preview values only;
- production inference record creation remains false;
- production JSONL append remains false;
- database/Supabase write remains false;
- actual score calculation remains false;
- publish-ready approval remains false;
- approval-state change remains false;
- production readiness remains not_ready;
- publish readiness remains blocked;
- AG07L Revised Preview Packet + Dry-Run Scoring is identified as next only with explicit approval;
- package scripts for generate:ag07k and validate:ag07k are present;
- validate:project includes validate:ag07k;
- no production JSONL append, database/Supabase write, score calculation, publish-ready approval, approval-state change, article prose generation, public mutation, reference insertion, visual generation, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07L — Revised Preview Packet + Dry-Run Scoring.

AG07L must not start automatically. It requires explicit approval.
