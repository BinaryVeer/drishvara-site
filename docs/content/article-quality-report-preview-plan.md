# Content Stage C08 — Read-only Article Quality Report Preview

## Purpose

This stage creates a read-only article quality report preview for Drishvara public reads.

It uses existing content data only:

- `data/article-index.json`
- `data/homepage-ui.json`
- `data/seo/site-metadata.json`

It does not mutate article content, homepage featured reads, sitemap, review queues, or editorial metadata.

## Why This Is Needed

C07 prepared the future article quality metadata and review scaffold. C08 adds a safe dry-run report so article quality can be inspected before any live editorial workflow is activated.

## Report Scope

The report checks:

- public latest article count
- published item count
- homepage featured read count
- title readiness
- summary readiness
- path/URL readiness
- category/source readiness
- image readiness
- Hindi metadata readiness
- featured-read readiness
- pipeline/scaffold exclusion
- dummy-link absence
- SEO/article count consistency

## Current Stage Position

In C08:

- report generation is preview-only
- report output is local/static JSON
- article mutation is blocked
- homepage mutation is blocked
- review queue write is blocked
- admin review is disabled
- external API fetch is blocked
- Supabase reads/writes remain disabled

## Future Stage

A later stage may add a visible internal report page or admin review integration, but not before Auth/Admin controls are live and tested.
