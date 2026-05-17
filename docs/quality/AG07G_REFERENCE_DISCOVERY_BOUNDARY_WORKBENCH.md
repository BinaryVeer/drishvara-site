# AG07G — Reference Discovery Boundary / Workbench

## Purpose

AG07G defines the reference discovery and review workbench boundary for future long-form content packets.

This stage is reference-boundary only. It does not populate reference URLs, insert references into article HTML, fetch live URLs, run link-health checks, generate article prose, mutate public articles, generate visuals, append JSONL records, publish content, write to a database, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07G consumes:

- AG07F Preview Packet Schema Revision Boundary.
- AG07F contract boundary plan.
- AG07F revised contract schema.
- AG07F learning record.
- AG07E Preview Packet Revision Plan.
- AG07C preview-only packet skeleton.
- AG06J reference/source credibility standard.
- AG06E long-form article standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Workbench Boundary

AG07G defines:

- source category slots;
- candidate reference slots;
- credibility checklist;
- link-health fields;
- review workflow;
- future handoff to later controlled stages.

All candidate URL, approved URL and rejected URL fields remain empty in AG07G.

## Reference Status

AG07G does not create verified references.

It does not populate candidate references.

It does not approve references.

It does not reject references.

It does not insert references into public article HTML.

## Production Readiness Decision

AG07G does not make the packet production-ready.

Production readiness remains not_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07G does not:

- populate candidate reference URLs;
- populate approved reference URLs;
- populate rejected reference URLs;
- fetch live URLs;
- perform link-health checks;
- insert references into article HTML;
- generate article prose;
- generate production content packets;
- mutate public article HTML;
- generate visual assets or infographics;
- copy, move, delete or import scaffold outputs;
- create or append production JSONL records;
- write to any database;
- change approval states;
- set publish_ready=true;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Acceptance Criteria

AG07G is acceptable only if:

- AG07F boundary is consumed;
- AG06J reference/source credibility standard is consumed;
- candidate reference slots are created as empty boundary slots;
- candidate_url, approved_url and rejected_url fields remain empty;
- reference URL population remains false;
- reference insertion remains false;
- live fetch and link-health fetch remain false;
- production readiness remains not_ready;
- publish readiness remains blocked;
- AG07H is identified as next only with explicit approval;
- package scripts for generate:ag07g and validate:ag07g are present;
- validate:project includes validate:ag07g;
- no reference URL population, reference insertion, article prose generation, public mutation, visual generation, scaffold import, JSONL production append, database write, approval-state change, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07H — Visual and Data Enrichment Boundary / Workbench.

AG07H must not start automatically. It requires explicit approval.
