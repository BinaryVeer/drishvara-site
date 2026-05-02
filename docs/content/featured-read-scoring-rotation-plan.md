# Content Stage C04 — Featured Read Scoring & Rotation Preview

## Purpose

This stage adds a dry-run scoring and rotation preview layer for Drishvara featured reads.

It does not change homepage featured reads. It does not activate manual override. It does not write selection memory. It does not fetch external APIs.

## Why This Is Needed

Drishvara now has:

- public read link and image integrity checks
- editorial selection governance
- disabled manual override scaffold
- disabled selection memory scaffold

C04 prepares a scoring model so future featured read selection can be more transparent and auditable.

## Scoring Signals

Future featured read scoring may consider:

- title availability
- summary availability
- image availability
- usable article URL
- Hindi metadata availability
- category diversity
- non-pipeline category safety
- freshness
- evergreen value
- duplicate image penalty
- duplicate URL penalty
- manual editorial priority

## Current Stage Position

In C04:

- scoring is preview-only
- homepage mutation is blocked
- external API fetch is blocked
- manual override remains disabled
- selection memory write remains disabled
- Supabase article reads remain disabled

## Future Use

A later stage may generate a visible editorial report or propose a draft Top 4 list, but publication should require review and approval.
