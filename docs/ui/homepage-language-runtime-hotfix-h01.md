# Public UI Hotfix H01 — Homepage Language Runtime & Daily Module Audit

## Purpose

This hotfix strengthens homepage language switching for `index.html`.

It addresses the observed issue where other pages respond to EN/हिन्दी switching but the homepage remains partially static.

## Scope

H01 adds a homepage-only runtime layer that:

- listens for language toggle clicks
- listens for language-change events
- re-applies translations after dynamic homepage sections render
- translates known static homepage cards
- translates form placeholders and select options
- keeps Featured Reads, Daily Guide, Sports Desk, Panchang, Word of the Day, and Vedic Guidance under audit
- records that Vedic Guidance/Panchang remain scaffold/static until a later rule-based engine stage

## Non-Goals

This hotfix does not:

- enable Auth
- instantiate Supabase
- fetch external APIs
- change article JSON
- change homepage JSON
- change sitemap
- enable Panchang/Vedic premium output
- claim the Vedic/Panchang modules are fully dynamic
- unlock dashboard, premium, payment, palm upload, or admin actions

## Known Remaining Work

A later module stage should build:

- rule-based Vedic Guidance
- location-aware Panchang/Festival engine
- verified mantra/day logic
- source-grounded daily spiritual guidance
- bilingual daily output backed by curated rules
