# AG06G — Long-Form Content Packet Upgrade Dry-Run Review

## Purpose

AG06G performs the first non-mutating dry-run review of the AG06F long-form production queue. It selects Batch 01 for future content-packet upgrade planning while preserving all no-go controls.

AG06G does not generate upgraded article text, does not create content packets, does not edit public article HTML, does not import scaffold outputs, does not change reference URLs, and does not publish anything.

## Inputs

AG06G consumes:

- AG06F long-form upgrade queue.
- AG06F long-form upgrade mapping.
- AG06F registry summary.

## Selection Logic

Batch 01 is selected from high-priority AG06F queue items first. High-priority entries are those requiring reference-governance and long-form upgrade attention before any future production use.

The selected batch is a dry-run selection only. It is not an approval for article mutation, scaffold import, content packet generation, or public publishing.

## Dry-Run Review Position

Every selected entry remains:

- not ready for content-packet generation;
- not ready for article mutation;
- not ready for scaffold import;
- not ready for publication.

The purpose of this stage is to identify a controlled first batch and record the planning requirements that a later stage may use.

## Explicit Exclusions

AG06G does not:

- mutate current public article HTML;
- alter AG03/AG05 reference blocks or URLs;
- copy, move, delete, import, or publish scaffold files;
- generate article rewrites;
- generate upgraded content packets;
- modify CSS or JavaScript;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup, or public dynamic output;
- mark any existing public article as final Drishvara-quality content.

## Acceptance Criteria

AG06G is acceptable only if:

- AG06F queue and mapping are consumed;
- Batch 01 dry-run selection exists;
- selected batch count is exactly 5 unless fewer high-priority items exist;
- selected entries are high-priority entries first;
- every selected entry remains ready_for_article_mutation=false;
- every selected entry remains ready_for_publication=false;
- content_packet_generation_performed remains false;
- article_rewrite_performed remains false;
- scaffold_import_performed remains false;
- package scripts for generate:ag06g and validate:ag06g are present;
- validate:project includes validate:ag06g;
- no public article/reference/scaffold/CSS/JS/backend/Auth/Supabase/publishing mutation is performed.

## Next Stage

The recommended next stage is AG06H — Batch 01 Content Packet Upgrade Planning. AG06H may plan the structure of upgraded content packets for the selected batch, but it must remain non-mutating unless separately approved.
