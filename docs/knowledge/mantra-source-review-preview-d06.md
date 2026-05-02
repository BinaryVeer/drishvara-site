# Knowledge Stage D06 — Mantra Selection Source Registry & Review Preview

## Purpose

D06 creates the source registry and review-preview structure for future mantra selection.

This stage is not live. It does not generate mantras, does not select public daily mantras, and does not change the current public site output.

## Files Added

- `data/knowledge/sanatan/mantra-source-registry-d06.json`
- `data/knowledge/sanatan/mantra-candidate-registry-d06.json`
- `data/knowledge/sanatan/mantra-review-preview-d06.json`

## Core Rule

Mantra text must be manually reviewed before public use, especially Sanskrit text, transliteration, meaning, deity association, day association, and usage context.

## This Stage Does Not

This stage does not generate new mantras, does not fetch external APIs, does not enable public dynamic mantra output, does not present mantras as guaranteed remedies, does not change language runtime, does not enable Supabase/Auth/payment/admin features, does not unlock premium guidance, and does not write into public daily context.

## Review Rule

A mantra candidate must remain `needs_review` until Sanskrit/editorial review is completed. Only a later activation stage may permit approved mantra display.
