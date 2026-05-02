# Content Stage H08 — Hindi Article Body Sidecar Governance

## Purpose

H08 creates the governance layer for Hindi article-body expansion.

The language runtime and static page copy are now stable. Article bodies should not be translated through broad runtime DOM replacement because this can distort meaning, named entities, Sanskrit/Hindi terms, mantras, quotations, and editorial nuance.

## Core Rule

Hindi article bodies must be displayed only when approved Hindi sidecar content exists for that article path.

## Data Files

- `data/i18n/hindi-article-body.json`
- `data/i18n/hindi-article-body-policy-h08.json`
- `data/i18n/hindi-article-body-review-queue-h08.json`

## Required Sidecar Item Fields

Each approved Hindi article body should include:

- `path`
- `title_hi`
- `summary_hi`
- `article_html_hi`
- `review_status`
- `approved_by`
- `approved_at`
- `source_basis`

## Display Policy

- English article body remains the default.
- Hindi title/summary may be shown through existing metadata.
- Hindi article body is shown only when `review_status = approved`.
- If no approved Hindi body exists, the reader falls back to the English body.

## Non-goals

This stage does not auto-translate article bodies, does not change the language runtime, does not enable Supabase/Auth/payment/admin features, and does not mutate generated article files.

## This Stage Does Not

- auto-translate article bodies
- change the language toggle runtime
- enable Supabase
- enable Auth
- enable payment
- unlock premium guidance
- enable palm upload
- enable admin actions
- mutate generated article files
