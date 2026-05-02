# Content Stage C05 — Image Registry & Source Governance Scaffold

## Purpose

This stage prepares image governance for Drishvara public reads and homepage featured articles.

It does not fetch external image APIs. It does not change homepage featured reads. It does not mutate article records.

## Why This Is Needed

Drishvara now has:

- public read link and image integrity checks
- editorial selection governance
- featured read override scaffold
- selection memory scaffold
- dry-run scoring and rotation preview

The next requirement is to ensure images are tracked responsibly.

## Governance Objectives

Future image governance should track:

- article path
- image URL
- image provider/source
- source URL
- license status
- credit line
- alt text
- category
- image usage purpose
- approval status
- duplicate-use status

## Current Stage Position

In C05:

- image registry write is disabled
- category fallback activation is disabled
- homepage image mutation is disabled
- external image API fetch is disabled
- manual override remains disabled
- Supabase article/image reads remain disabled

## Future Category Fallback Logic

Later, if an article lacks an image, a category fallback may be proposed for:

- Public Programmes
- Media & Society
- World Affairs
- Spirituality
- Governance
- Technology
- Health
- Environment
- Sports

Fallback use should remain review-based, not automatic, until image approval workflow exists.

## Alt Text Rule

Every future approved image should have meaningful alt text that describes the image context without keyword stuffing.

## Non-Goals

This stage does not:

- fetch images
- validate remote image availability
- store image files
- create image CDN rules
- alter homepage featured reads
- activate image fallback replacement
- activate Supabase storage
