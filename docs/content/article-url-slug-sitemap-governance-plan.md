# Content Stage C06 — Article URL/Slug Canonicalization & Sitemap Governance

## Purpose

This stage defines governance for Drishvara article URLs, slug formats, canonical URL handling, and sitemap article discovery.

It does not rewrite existing URLs. It does not mutate article content. It does not change sitemap generation in this stage.

## Why This Is Needed

Drishvara currently supports public article discovery through:

- article index
- homepage featured reads
- insights page
- article reader
- SEO metadata
- sitemap

During C01/C02, we confirmed that sitemap article URLs may not always use one single format such as `article.html?path=...`. Therefore, C06 formalizes the supported URL formats and prevents future preflight mismatches.

## Supported Article URL Formats

Current/future acceptable formats:

1. Reader query format

   `article.html?path=<encoded article path>`

2. Clean article route format

   `/articles/<slug>`

3. Fully qualified production clean URL

   `https://www.drishvara.com/articles/<slug>`

## Governance Rules

- Public article URLs must be discoverable through sitemap or article index.
- Article reader must continue to support path-based resolution.
- Homepage must continue to use a safe article URL helper.
- Sitemap must contain public article URLs or SEO metadata must record public article counts.
- Canonical URLs should prefer clean public routes when available.
- Query-based reader URLs may remain supported as compatibility links.
- URL/slug policy must not expose internal file-system details to users in future clean routes.
- Dummy links such as `#`, `#open-day-card`, and `javascript:void` must remain absent.

## Slug Rules for Future Clean URLs

Future slugs should:

- use lowercase letters
- use hyphens instead of spaces
- avoid special characters
- avoid dates unless needed
- remain stable once published
- avoid exposing internal directory names
- map back to an article path through a registry or index

## Non-Goals

This stage does not:

- change current article URLs
- create rewrite rules
- update Vercel routing
- generate new slugs
- modify sitemap generator
- activate Supabase article reads
- fetch external APIs
- enable Auth/payment/premium/admin features

## Future Stage

A later stage may add:

- slug registry
- clean URL redirect map
- sitemap rewrite rules
- article canonical URL generator
- Vercel rewrite validation
