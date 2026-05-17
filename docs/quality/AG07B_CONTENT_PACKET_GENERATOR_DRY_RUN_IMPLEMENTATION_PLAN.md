# AG07B — Content Packet Generator Dry-Run Implementation Plan

## Purpose

AG07B defines the implementation plan for a future content packet generator dry-run.

This stage is planning only. It does not create generator code, execute a dry-run, generate content packets, write preview outputs, rewrite public articles, insert references, generate visuals, import scaffold outputs, append JSONL records, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07B consumes:

- AG07A Long-Form Content Packet Generator Design / Dry-Run Boundary.
- AG06Z Content Intelligence Foundation Closure.
- AG06B Content Packet Schema.
- AG06E Long-Form Article Standard.
- AG06F Long-Form Production Queue.
- AG06H Batch 01 Content Packet Planning.
- AG06I Visual/Data/Infographic Requirement Standard.
- AG06J Reference and Source Credibility Standard.
- AG06K JSONL-first Store Manifest.
- AG06L Publish Queue and Approval State Register.

## Planned Components

AG07B defines future components only:

- read-only input loader;
- source context assembler;
- content packet object builder;
- dry-run validator;
- dry-run preview writer;
- audit trace builder.

All components remain planned and not created in AG07B.

## Future Dry-Run Algorithm

AG07B records a later-stage algorithm plan:

- select one planning entry;
- load source article metadata only;
- attach AG06E long-form standard;
- attach AG06I and AG06J requirements;
- build an in-memory packet skeleton;
- validate packet skeleton;
- write preview only if a later stage explicitly approves it.

No step is executed in AG07B.

## Future Implementation Files

AG07B records possible future file paths for AG07C. These files are not created in AG07B and require explicit approval in a later stage.

## Explicit Exclusions

AG07B does not:

- create generator code;
- create generator runtime;
- execute a dry-run;
- generate content packets;
- write content packet JSON, markdown or HTML;
- write dry-run preview outputs;
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

AG07B is acceptable only if:

- AG07A is present and closed as design/dry-run-boundary only;
- AG06Z foundation closure is present;
- planned components are defined but not created;
- future implementation files are listed but not created;
- future dry-run algorithm steps are defined but not executed;
- candidate preview entries remain not selected for execution;
- package scripts for generate:ag07b and validate:ag07b are present;
- validate:project includes validate:ag07b;
- no generator code creation, generator implementation, dry-run execution, content packet generation, output write, public mutation, reference insertion, visual generation, scaffold import, JSONL append, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07C — Content Packet Generator Preview-Only Dry Run.

AG07C must not start automatically. It requires explicit approval.
