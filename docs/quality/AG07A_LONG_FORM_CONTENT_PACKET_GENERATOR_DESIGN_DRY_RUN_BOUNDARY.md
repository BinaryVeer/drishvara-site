# AG07A — Long-Form Content Packet Generator Design / Dry-Run Boundary

## Purpose

AG07A defines the controlled boundary for a future long-form content packet generator.

This stage is design and dry-run-boundary only. It records the input contract, output contract, validation gates, prohibited side effects and future dry-run steps before any actual generator implementation is attempted.

AG07A does not implement generator logic, execute a dry-run, generate content packets, write content packet outputs, rewrite public articles, insert references, generate visual assets, import scaffold outputs, append JSONL records, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07A consumes:

- AG06Z Content Intelligence Foundation Closure.
- AG06E Long-Form Article Standard.
- AG06B Content Packet Schema.
- AG06F Long-Form Production Queue.
- AG06H Batch 01 Content Packet Planning.
- AG06I Visual/Data/Infographic Requirement Standard.
- AG06J Reference and Source Credibility Standard.
- AG06K JSONL-first Store Manifest.
- AG06L Publish Queue and Approval State Register.

## Boundary Decision

AG07A is allowed to define:

- generator input contract;
- generator output contract;
- validation gates;
- future dry-run steps;
- prohibited side effects;
- alignment with AG06 foundation controls.

AG07A is not allowed to:

- implement the generator;
- execute generation;
- create content packets;
- write content-packet files;
- mutate public articles;
- insert references;
- generate visuals;
- import scaffold outputs;
- append JSONL records;
- publish content.

## Future Generator Input Contract

A later approved generator must receive:

- source article path;
- article classification and queue metadata;
- long-form article standard;
- content packet schema;
- reference credibility standard;
- visual/data/infographic standard;
- JSONL store governance;
- approval-state register status;
- mutation controls;
- audit trace.

## Future Generator Output Contract

A later approved generator may produce only reviewable content-packet objects, subject to later approval. Such packets must include:

- stable content packet ID;
- source article path;
- category and slug;
- target word count range;
- section plan;
- reference requirement;
- visual requirement;
- quality and visitor-value gate requirements;
- publish-readiness requirements;
- mutation controls;
- audit trace.

AG07A itself produces no content packet output.

## Future Dry-Run Boundary

A later stage may separately request approval for dry-run implementation.

That later dry-run must remain non-public, non-publishing and non-mutating unless explicitly expanded.

## Explicit Exclusions

AG07A does not:

- generate content packets;
- write content packet JSON, markdown or HTML;
- rewrite article text;
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

AG07A is acceptable only if:

- AG06Z closure is present and foundation_closed;
- AG07 explicit-approval requirement is carried forward;
- generator input contract is defined;
- generator output contract is defined;
- validation gates are defined;
- future dry-run steps are defined but not executed;
- batch preview entries, if present, remain not generated;
- package scripts for generate:ag07a and validate:ag07a are present;
- validate:project includes validate:ag07a;
- no generator implementation, dry-run execution, content packet generation, output write, public mutation, reference insertion, visual generation, scaffold import, JSONL append, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07B — Content Packet Generator Dry-Run Implementation Plan.

AG07B must not start automatically. It requires explicit approval.
