# Knowledge Stage D04 — Daily Guidance Rule Validation & Selection Preview

## Purpose

D04 introduces validation and preview selection for Daily Guidance rules created under D03.

This stage is not live. It only checks rule quality and produces preview-only selections for internal review.

## Selection Priority

Preview selection follows this order:

1. exact weekday match
2. Word of the Day theme match
3. fallback neutral guidance

## Current Public Position

The public Daily Guidance output remains static/scaffolded. D04 does not update `data/daily-context.json`.

## This Stage Does Not

This stage does not make Daily Guidance dynamic, does not fetch external APIs, does not change the language runtime, does not enable Supabase/Auth/payment/admin features, does not unlock premium guidance, and does not present guidance as deterministic prediction.

## Review Rule

A previewed rule is still not public-live. Public dynamic use will require approved review status and a later activation stage.
