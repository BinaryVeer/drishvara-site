# AG07I — Quality and Visitor-Value Scoring Boundary

## Purpose

AG07I defines the quality and visitor-value scoring boundary for future long-form content packets.

This stage defines scoring dimensions, weights, thresholds, readiness gates, reviewer decision fields and workflow only. It does not calculate actual scores, approve publish-readiness, change approval state, generate article prose, mutate public articles, insert references, generate visuals, append JSONL records, publish content, write to a database, or activate backend/Auth/Supabase/API functionality.

## Why Actual Scores Are Not Calculated in AG07I

Actual scoring is intentionally blocked because the current AG07C packet is still a preview-only skeleton, while AG07G and AG07H keep reference, visual, caption, alt-text, image-credit and data-unit fields empty.

A real score must be based on a revised packet and a structured article inference record. Therefore, AG07J Article Inference Store Boundary is identified as the next controlled stage before any actual score calculation.

## Inputs

AG07I consumes:

- AG07H Visual and Data Enrichment Boundary / Workbench.
- AG07G Reference Discovery Boundary / Workbench.
- AG07F Preview Packet Schema Revision Boundary.
- AG07C preview-only packet skeleton.
- AG06E long-form article standard.
- AG06I visual/data/infographic requirement standard.
- AG06J reference/source credibility standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Scoring Boundary

AG07I defines:

- quality scoring dimensions;
- visitor-value scoring dimensions;
- scoring weights;
- publish-readiness thresholds;
- article inference requirement before actual scoring;
- readiness gate groups;
- reviewer decision fields;
- failure reason fields;
- future scoring workflow.

Both quality and visitor-value weights total 100.

## Scoring Status

AG07I does not calculate:

- quality score;
- visitor-value score;
- combined score;
- publish-readiness score;
- approval decision.

All dimension statuses remain not_evaluated.

All calculated score fields remain null.

## Production Readiness Decision

AG07I does not make the packet production-ready.

Production readiness remains not_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07I does not:

- calculate actual scores;
- create or store article inference records;
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
- create or append production JSONL records;
- write to any database;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Acceptance Criteria

AG07I is acceptable only if:

- AG07H boundary is consumed;
- scoring dimensions are defined;
- quality scoring weights total 100;
- visitor-value scoring weights total 100;
- scoring thresholds are defined;
- article inference is required before actual scoring;
- actual score calculation remains false;
- all calculated score fields remain null;
- publish-ready approval remains false;
- approval-state change remains false;
- production readiness remains not_ready;
- publish readiness remains blocked;
- AG07J Article Inference Store Boundary is identified as next before any actual score calculation;
- package scripts for generate:ag07i and validate:ag07i are present;
- validate:project includes validate:ag07i;
- no actual score calculation, approval-state change, article prose generation, public mutation, reference insertion, visual generation, scaffold import, JSONL production append, database write, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07J — Article Inference Store Boundary.

AG07J must not start automatically. It requires explicit approval.
