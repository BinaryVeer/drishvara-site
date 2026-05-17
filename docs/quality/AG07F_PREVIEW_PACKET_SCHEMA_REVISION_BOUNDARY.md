# AG07F — Preview Packet Schema Revision Boundary

## Purpose

AG07F defines a strengthened preview packet schema and contract boundary based on the AG07E revision plan.

This stage is schema/contract boundary only. It does not revise the AG07C packet, create a revised packet, generate article prose, mutate public articles, insert references, generate visuals, append JSONL records, publish content, write to a database, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07F consumes:

- AG07E Preview Packet Revision Plan.
- AG07E revision roadmap.
- AG07E schema and learning record.
- AG07D Preview Packet Review and Gap Audit.
- AG07C preview-only packet skeleton.
- AG07C preview packet schema.
- AG06B content packet schema.
- AG06E long-form article standard.
- AG06I visual/data standard.
- AG06J reference/source credibility standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Contract Boundary

AG07F defines proposed future packet contract sections for:

- identity;
- source context;
- reader value;
- long-form structure;
- reference plan;
- visual/data plan;
- quality and visitor-value gates;
- publish approval gate;
- persistence mapping;
- audit trace.

These are proposed contract sections only. They are not applied to the AG07C packet in AG07F.

## Packet Status

The AG07C preview packet remains:

- unchanged;
- preview-only;
- non-production;
- not publish-ready;
- not publication-allowed;
- without generated article prose;
- without reference URLs;
- without visual assets;
- without JSONL/database persistence.

## Production Readiness Decision

AG07F does not make the preview packet production-ready.

Production readiness remains not_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07F does not:

- execute packet revision;
- modify the AG07C preview packet;
- create a revised packet;
- generate article prose;
- generate production content packets;
- mutate public article HTML;
- insert, populate or change reference URLs;
- fetch live URLs;
- generate visual assets or infographics;
- copy, move, delete or import scaffold outputs;
- create or append production JSONL records;
- write to any database;
- change approval states;
- set publish_ready=true;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Acceptance Criteria

AG07F is acceptable only if:

- AG07E revision plan is consumed;
- AG07D gaps and AG07E revisions are represented;
- proposed contract sections are defined;
- proposed schema deltas are recorded but not applied;
- AG07C packet remains unchanged and preview-only;
- production readiness remains not_ready;
- publish readiness remains blocked;
- AG07G is identified as next only with explicit approval;
- package scripts for generate:ag07f and validate:ag07f are present;
- validate:project includes validate:ag07f;
- no packet revision execution, article prose generation, public mutation, reference insertion, visual generation, scaffold import, JSONL production append, database write, approval-state change, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07G — Reference Discovery Boundary / Workbench.

AG07G must not start automatically. It requires explicit approval.
