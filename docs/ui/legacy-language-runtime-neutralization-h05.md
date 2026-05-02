# Public UI Hotfix H05 — Legacy Language Runtime Neutralization

## Purpose

H05 resolves the multi-runtime conflict in Drishvara language switching.

The previous issue was caused by multiple language handlers operating together across pages. This made the homepage behave differently after returning from Contact, Submissions, About, or Insights.

## Decision

There must be one active translation runtime:

- `assets/js/drishvara-language-runtime.js`

The old `assets/js/site-language.js` now acts only as a compatibility shim. It does not translate page content directly.

## Canonical Brand

- English: `Drishvara`
- Hindi: `द्रिश्वारा`

Blocked incorrect forms:

- `दृशर`
- `द्रिश्वर`
- `द्रिष्वरा`
- `दुषर`
- `दृशारा`

## Guardrails

This hotfix does not:

- enable Auth
- enable Supabase
- fetch external APIs
- mutate content JSON
- activate Panchang/Vedic rule engine
- unlock payment, premium, palm upload, or admin actions
