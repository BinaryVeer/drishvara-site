# Content Stage C03 — Featured Read Override & Selection Memory Scaffold

## Purpose

This stage prepares a future editorial override and selection-memory scaffold for Drishvara featured reads.

It does not activate manual override. It does not publish new articles. It does not mutate homepage featured reads.

## Why This Is Needed

Drishvara already has:

- public article index generation
- homepage featured reads
- featured image mapping
- Hindi metadata readiness
- public read integrity checks
- editorial governance checks

The next need is to prepare a safe way to later lock or override the homepage featured reads without damaging the automated selection pipeline.

## Current Position

Manual override is disabled.

The current homepage featured reads continue to come from the existing public-preview/static content pipeline.

## Future Override Rules

When enabled later, every manual featured read override should include:

- article path or URL
- slot number
- editor or reviewer name/role
- reason for override
- approval timestamp
- rollback note
- expiry or review date

## Selection Memory Rules

Selection memory should help prevent repeated homepage choices.

Future memory may track:

- article path
- title
- category
- image URL
- selected date
- slot number
- selection source
- language readiness
- reason for selection

## Guardrails

- Do not activate manual override in this stage.
- Do not mutate homepage featured reads in this stage.
- Do not fetch external APIs.
- Do not enable Supabase article reads.
- Do not expose service role keys.
- Do not override with Daily Context, Sports Context, Hindi Drafts, generated, pipeline, scaffold, placeholder, or internal-only records.

## Future Stage

Content Stage C04 may introduce a disabled scoring report or a draft override preview, but live override should remain blocked until reviewed.
