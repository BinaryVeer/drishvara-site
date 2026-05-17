# AG07O — Approval + Controlled Single-Article Mutation Plan

## Purpose

AG07O creates the approval checklist and controlled single-article mutation plan required before any future one-article apply.

This stage is plan-only. It does not perform actual public mutation, file edits, reference insertion, visual generation, static-live apply, production JSONL append, database/Supabase write, publishing, or backend/Auth/Supabase activation.

## Inputs

AG07O consumes:

- AG07N Production Packet Candidate.
- AG07M Improvement Pass.
- AG07L Revised Preview Packet + Dry-Run Scoring.
- AG07K Article Inference Preview Record Dry Run.
- AG06J reference/source credibility standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Plan Scope

AG07O creates:

- target article path requirements;
- approval checklist;
- reference insertion plan;
- visual/image-credit plan;
- backup and rollback plan;
- static-live mutation checklist;
- post-apply audit checklist;
- AG07P handoff.

## Approval Status

AG07O creates an approval plan but does not approve publishing or applying.

No publish-ready approval is performed.

No approval-state change is performed.

No human apply approval is recorded.

## Static-Live Status

AG07O does not edit static files.

AG07O does not select or mutate a live article.

AG07O does not insert references.

AG07O does not generate or insert visuals.

AG07O does not create backup files.

AG07O does not run rollback.

## Production Readiness Decision

AG07O does not make the packet production-ready.

Production readiness becomes plan_created_not_apply_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07O does not:

- perform actual public mutation;
- edit files;
- write article HTML;
- create backup files;
- execute rollback;
- insert references;
- populate reference URLs;
- generate visual assets or infographics;
- insert images;
- perform static-live apply;
- append production JSONL records;
- write to database or Supabase;
- approve publish-readiness;
- change approval state;
- set publish_ready=true;
- generate article prose;
- generate production content;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Acceptance Criteria

AG07O is acceptable only if:

- AG07N candidate is consumed;
- approval checklist is created;
- target article requirements are created;
- reference insertion plan is created;
- visual/image-credit plan is created;
- backup/rollback plan is created;
- static-live mutation checklist is created;
- post-apply audit checklist is created;
- AG07P handoff is created;
- no actual mutation or file edit is performed;
- no reference insertion or URL population is performed;
- no visual generation is performed;
- no static-live apply is performed;
- no production JSONL append, database/Supabase write, publishing or backend/Auth/Supabase activation is performed;
- AG07P One-Article Controlled Apply is identified as next only with explicit approval;
- package scripts for generate:ag07o and validate:ag07o are present;
- validate:project includes validate:ag07o.

## Next Stage

The next possible stage is AG07P — One-Article Controlled Apply.

AG07P must not start automatically. It requires explicit approval and a selected target article path.
