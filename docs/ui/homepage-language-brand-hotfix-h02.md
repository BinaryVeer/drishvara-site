# Public UI Hotfix H02 — Homepage Language State & Brand Canonicalization

## Purpose

H02 stabilizes the homepage language runtime after H01.

It specifically fixes:

- inconsistent homepage EN/हिन्दी switching
- brand text not switching reliably
- incorrect Hindi brand rendering such as `दृशर`
- residual Hindi text after switching back to English

## Brand Rule

The Drishvara brand must be rendered as:

- English: `Drishvara`
- Hindi: `द्रिश्वारा`

Do not use `दृशर` as the brand form.

## Scope

This hotfix updates the homepage language runtime only.

It does not:

- enable Auth
- instantiate Supabase
- fetch external APIs
- modify article JSON
- modify homepage JSON
- activate Vedic/Panchang dynamic rules
- unlock premium/payment/palm/admin features

## Remaining Known Work

The Vedic Guidance and Panchang cards are still scaffold/static. A later engine stage must make them rule-based, source-grounded, date-aware, and location-aware.
