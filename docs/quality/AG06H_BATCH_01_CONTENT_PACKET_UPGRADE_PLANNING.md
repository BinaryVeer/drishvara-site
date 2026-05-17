# AG06H — Batch 01 Content Packet Upgrade Planning

## Purpose

AG06H creates a non-mutating planning layer for the five Batch 01 entries selected in AG06G. It translates the AG06E long-form article standard and the existing AG06B content-packet schema structure into planning requirements for future content-packet upgrade work.

AG06H does not generate content packets, article rewrites, verified reference URLs, visual assets, infographics, quality scores, visitor-value scores, public article edits, or publishing actions.

## Inputs

AG06H consumes:

- AG06G Batch 01 dry-run selection.
- AG06G dry-run review decision.
- AG06E long-form article standard.
- AG06B content-packet schema.

## Planning Logic

Each AG06G selected Batch 01 entry becomes one AG06H planning entry. The planning entry records:

- source article path and title;
- current word-count and reference gap;
- AG06E target standard;
- required planning work;
- planned content-packet sections;
- planned publish-readiness gates;
- scaffold candidate review status;
- blocked actions and mutation controls.

## Content-Packet Schema Position

The existing content-packet schema uses required_sections and fields rather than a JSON-Schema properties structure. AG06H therefore creates section-level planning templates only. It does not produce actual content-packet payloads.

## Readiness Position

Every AG06H planning entry remains:

- content_packet_generated=false;
- article_rewrite_generated=false;
- reference_urls_populated=false;
- visual_asset_generated=false;
- infographic_generated=false;
- ready_for_article_mutation=false;
- ready_for_publication=false.

## Explicit Exclusions

AG06H does not:

- mutate current public article HTML;
- populate, alter, or insert reference URLs;
- copy, move, delete, import, or publish scaffold files;
- generate article rewrites;
- generate upgraded content packets;
- generate visual assets or infographics;
- assign final quality or visitor-value scores;
- modify CSS or JavaScript;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup, or public dynamic output;
- mark any existing public article as final Drishvara-quality content.

## Acceptance Criteria

AG06H is acceptable only if:

- AG06G Batch 01 selection is consumed;
- the planning queue contains exactly the AG06G selected batch count;
- every selected Batch 01 item has one planning entry;
- AG06E word-count, reference, visual, quality, visitor-value and publish-readiness gates are represented;
- AG06B content-packet required sections or fallback required sections are represented;
- every planning entry remains not generated, not mutated and not publish-ready;
- content_packet_generation_performed remains false;
- article_rewrite_performed remains false;
- scaffold_import_performed remains false;
- package scripts for generate:ag06h and validate:ag06h are present;
- validate:project includes validate:ag06h;
- no public article/reference/scaffold/CSS/JS/backend/Auth/Supabase/publishing mutation is performed.

## Next Stage

The recommended next stage is AG06I — Batch 01 Source and Reference Discovery Workbench. AG06I may create research and candidate-reference planning workbench records, but it must not insert references, mutate articles, import scaffold files, generate article rewrites, or publish content unless separately approved.
