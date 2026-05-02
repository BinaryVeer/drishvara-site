# Knowledge Stage D02 — Word of the Day Curated Rotation Bank

## Purpose

D02 creates a reviewed Word of the Day bank for future daily rotation.

This stage does not make the public Word of the Day dynamic. It only creates the curated foundation needed before a safe date-based or rule-based rotation can be enabled.

## Current Position

The current public Word of the Day may remain static/scaffolded. Future dynamic display must use reviewed entries from the curated bank.

## Files Added

- `data/knowledge/daily-guidance/word-of-day-bank-d02.json`
- `data/knowledge/daily-guidance/word-of-day-rotation-policy-d02.json`

## Future Use

The future engine may select a word by:

- calendar date
- theme balance
- avoidance of recent repetition
- manual editorial override

## Guardrails

This stage does not:

- change language runtime
- fetch external APIs
- generate new spiritual or Sanskrit terms automatically
- enable Supabase
- enable Auth
- enable payment
- unlock premium guidance
- enable admin actions
- mutate generated daily context files
- claim Word of the Day is dynamically selected
