# Content Stage C02 — Editorial Selection & Featured Read Governance Plan

## Purpose

This stage adds governance around Drishvara's public article selection and featured read system.

It protects the earlier main content work, including:

- daily article selection
- publicLatest article discovery
- homepage featured reads
- Read now links
- featured image mapping
- category/topic balance
- Hindi metadata readiness
- SEO/sitemap article discovery

## Current Position

The public reading system is already working in static/public-preview mode.

Existing strengths:

- article index is generated
- homepage featured reads are present
- featured images are mapped
- article reader route is working
- Hindi metadata/body support exists for selected articles
- SEO/sitemap generation exists
- public read integrity checker exists from C01

## Governance Rules

Featured reads should follow these rules:

1. Use public/published-safe article records only.
2. Avoid duplicate article links.
3. Avoid duplicate featured images where possible.
4. Avoid pipeline-only categories such as Daily Context, Sports Context, Hindi Drafts, scaffold, generated, or internal-only content.
5. Maintain category diversity where possible.
6. Prefer articles with title, summary, image, path, and Hindi metadata.
7. Allow future manual editor override, but keep override disabled until an approval workflow exists.
8. Do not fetch live APIs during homepage build.
9. Do not publish articles directly from this checker.

## Recommended Future Selection Scoring

Future scoring may include:

- editorial priority
- freshness
- topic diversity
- image availability
- Hindi metadata availability
- evergreen value
- public interest
- source quality
- duplicate-topic penalty
- manual editor override

## Manual Override Position

Manual override is planned but not live.

When enabled later, it should require:

- explicit article path
- editor name or role
- reason for override
- date/time of override
- rollback option
- preflight validation before publish

## Non-Goals

This stage does not:

- generate new article bodies
- translate articles
- fetch external images
- activate Supabase article reads
- create public database policies
- activate Auth, payment, premium guidance, palm upload, or admin actions

## Next Future Stage

Content Stage C03 may add:

- manual featured read override file
- editorial scoring output
- category rotation memory
- image registry and source/license tracking
