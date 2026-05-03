# Knowledge Stage D09 — Subscriber Guidance Dashboard Readiness Matrix

## Purpose

D09 defines the future subscriber guidance dashboard readiness matrix.

This stage is non-live. It does not enable live dashboard data, Auth, Supabase, payment, subscription gate, entitlement check, premium guidance, or personalized subscriber output.

## Dashboard Card Groups

- login status
- subscription status
- privacy and consent
- profile readiness
- daily reflection
- what to do
- what not to do
- lucky number
- lucky color
- mantra
- Word of the Day
- Panchang context

## Strict Position

This stage does not instantiate Supabase, does not query subscriber tables, does not enable Auth, does not enable payment, does not unlock premium guidance, does not collect birth details, does not change language runtime, does not fetch external APIs, and does not write into `data/daily-context.json`.

## Dashboard Rule

Dashboard cards may remain visible as scaffold or blocked states only. No card should expose personalized subscriber guidance until future Auth, consent, entitlement, privacy, and review gates are activated.

## Future Activation Requirement

A later activation stage must verify Auth session, subscriber profile, explicit consent, subscription entitlement, privacy-safe inputs, and approved guidance rules before live dashboard output is permitted.
