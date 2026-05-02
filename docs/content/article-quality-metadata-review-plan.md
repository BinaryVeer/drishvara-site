# Content Stage C07 — Article Quality Metadata & Editorial Review Scaffold

## Purpose

This stage prepares the future article-quality metadata and editorial review scaffold for Drishvara public reads.

It does not mutate article content. It does not publish new articles. It does not activate admin review. It does not enable Supabase reads or writes.

## Why This Is Needed

Drishvara now has:

- public read link and image integrity checks
- editorial selection governance
- featured read override scaffold
- selection memory scaffold
- dry-run featured scoring
- image registry and source governance scaffold
- article URL/slug/sitemap governance scaffold

The next requirement is to prepare article-level quality metadata so every public article can later be reviewed and classified consistently.

## Future Article Quality Metadata

Future article records may include:

- article path
- title
- category
- source type
- author or generator source
- editorial review status
- language readiness
- Hindi readiness
- image approval status
- source/reference status
- evergreen or current flag
- quality score
- reviewer name/role
- approval timestamp
- rollback note

## Review Status Model

Future review statuses may include:

- draft
- generated
- under_review
- approved_public
- published
- needs_revision
- archived
- rejected

## Language Readiness Model

Future language readiness may include:

- english_ready
- hindi_metadata_ready
- hindi_body_ready
- bilingual_ready
- translation_pending
- translation_needs_review

## Source/Reference Status Model

Future source status may include:

- source_not_required
- source_pending
- source_verified
- source_needs_review
- source_rejected

## Guardrails

- Do not mutate article files in this stage.
- Do not mutate `data/article-index.json`.
- Do not mutate `data/homepage-ui.json`.
- Do not activate review queue writes.
- Do not enable admin backend actions.
- Do not fetch external APIs.
- Do not expose service role key.
- Do not promote draft/pipeline/scaffold records as public articles.

## Future Stage

Content Stage C08 may add a read-only article quality report, but it should remain preview-only until editorial approval workflow is implemented.
