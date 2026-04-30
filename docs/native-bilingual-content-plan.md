# Drishvara Native Bilingual Content Plan

## Purpose

Drishvara will support bilingual discovery and reading through native English-Hindi content fields rather than Google Translate. This preserves the premium reading experience and avoids external translation bars, layout distortion, and uncontrolled wording.

## Current State

- Top EN | हिन्दी control works for core site UI labels.
- Homepage, Insights, and Article Reader are stable.
- Published articles are currently stored mainly in English.
- Google Translate selector has been removed.
- Article body translation is not yet active.

## Target Principle

The language switch should eventually switch the content surface itself:

- Homepage cards
- Insights cards
- Article title
- Article summary/subtitle
- Article body
- Metadata and archive labels

## Recommended Architecture

### Phase 01: UI Language Control

Status: implemented.

Scope:
- Translate static navigation and common UI labels.
- Persist language choice in browser localStorage.
- No Google Translate dependency.

### Phase 02: Bilingual Card Metadata

Next implementation target.

Add bilingual title and summary fields to generated drafts, article index, and homepage UI.

Required fields:

- title
- title_hi
- summary
- summary_hi

Affected surfaces:

- Homepage Featured Reads
- Insights list cards
- Topic cards where applicable
- Article reader title/subtitle

### Phase 03: Full Bilingual Article Body

Add translated body fields to draft packets and published articles.

Required fields:

- article_html
- article_html_hi

Recommended model:

- Generate English article first.
- Generate Hindi article from final approved English article.
- Keep Hindi tone formal, readable, and culturally natural.
- Avoid literal translation where it harms readability.
- Preserve names, schemes, technical terms, and citations accurately.

### Phase 04: SEO and Public Paths

Option A: Single canonical article path with bilingual embedded content.

Example:

article.html?path=articles/spiritual/example.html

Option B: Separate Hindi article paths.

Example:

articles/spiritual/example.html
articles-hi/spiritual/example.html

Recommendation:

- Use Option A for Phase 02.
- Move to Option B later when Hindi content volume becomes meaningful.

## Bilingual Draft Packet Schema

Each generated draft packet should support:

- draft_packet.title
- draft_packet.title_hi
- draft_packet.summary
- draft_packet.summary_hi
- draft_packet.article_html
- draft_packet.article_html_hi
- draft_packet.language_status.en
- draft_packet.language_status.hi

## Approval Logic

English and Hindi approvals should be tracked separately.

Suggested status values:

- approved
- hold
- needs_revision
- rejected
- pending

Publishing rules:

- English article can publish when EN is approved.
- Hindi version should not publish unless HI is approved.
- Public cards may show Hindi title/summary only when Hindi metadata exists.
- If Hindi article body is missing, article reader should gracefully show English body with Hindi UI.

## Hindi Style Guide

Tone:

- Clear, dignified, and reflective.
- Avoid over-Sanskritized Hindi for public programme and media articles.
- Use simple formal Hindi for public readability.
- Preserve proper nouns and institutional terms carefully.

Examples:

- Public Programmes → लोक कार्यक्रम
- Media & Society → मीडिया और समाज
- World Affairs → विश्व विषय
- Spirituality → आध्यात्मिकता
- Sports → खेल

## Implementation Roadmap

### Batch 14 — Bilingual Metadata Fields

- Add title_hi and summary_hi support.
- Update article index builder.
- Update homepage UI builder.
- Update Insights cards.
- Update article reader title/subtitle.

### Batch 15 — Hindi Article Body Pipeline

- Add article_html_hi to draft generation.
- Add Hindi review/approval status.
- Update publish-all-core to embed bilingual article body.
- Update article reader to switch body based on language.

### Batch 16 — Hindi Quality Guard

- Add Hindi length and script checks.
- Add no-empty-Hindi checks.
- Add approval-only Hindi publish guard.
- Add warning when article title is Hindi but body is missing.

## Immediate Rule

Until Batch 14/15 are complete, the top EN | हिन्दी control should be treated as site UI language control, not full article translation.
