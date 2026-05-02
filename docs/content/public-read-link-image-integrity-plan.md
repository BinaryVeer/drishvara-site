# Content Stage C01 — Public Read Link & Image Integrity Plan

## Purpose

This stage validates the public reading flow already built for Drishvara.

It protects:

- homepage featured reads
- public article selection
- article index generation
- Read now links
- article reader route
- featured image mapping
- Hindi metadata availability
- SEO/sitemap article discovery
- placeholder/dummy-link cleanup

## Scope

This checker covers the earlier main content work and the later public-preview safety layer.

## Checks

The checker verifies:

- `data/article-index.json` exists.
- `data/homepage-ui.json` exists.
- homepage, insights, and article reader pages exist.
- public latest articles are present.
- homepage featured reads are present.
- featured reads have title, summary, article path/link, and image.
- featured read links do not point to old placeholders.
- pipeline-only tags are not used as primary homepage featured reads.
- Hindi title/summary metadata exists for public latest items where available.
- article reader supports Hindi body and image rendering.
- sitemap exists and contains article URLs.
- public HTML files do not contain known broken/dummy read links.

## Non-Goals

This stage does not:

- fetch live external images
- call external APIs
- enable Supabase article reads
- enable Auth/payment/premium output
- modify article content
- publish new articles

## Remaining Future Work

Later stages may add:

- live link crawler
- image license/source registry
- manual editorial override
- image relevance scoring
- alt-text approval
- DB-backed public read policies
