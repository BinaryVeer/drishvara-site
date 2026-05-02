# Public UI Hotfix H04 — Unified Language Runtime Reset

## Purpose

H04 removes the previous layered homepage language patches and introduces one unified runtime for public pages.

## Removed Runtime Patches

- `assets/js/homepage-language-runtime-hotfix.js`
- `assets/js/language-state-guard.js`

## New Runtime

- `assets/js/drishvara-language-runtime.js`

## Brand Rule

- English: `Drishvara`
- Hindi: `द्रिश्वारा`

Blocked incorrect forms:

- `दृशर`
- `द्रिश्वर`
- `द्रिष्वरा`
- `दुषर`

## Guardrails

This hotfix does not:

- enable Auth
- instantiate Supabase
- fetch external APIs
- mutate content JSON
- activate Vedic/Panchang dynamic logic
- unlock payment, premium, palm upload, or admin actions
