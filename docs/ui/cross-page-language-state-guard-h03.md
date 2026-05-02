# Public UI Hotfix H03 — Cross-page Language State Guard & Brand Lock

## Purpose

H03 stabilizes language state across Drishvara public pages after the homepage runtime hotfixes H01/H02.

It addresses:

- returning from another page in Hindi and seeing mixed homepage language
- inability to reset the homepage fully back to English
- wrong Hindi brand spellings such as `दृशर`
- About/Submissions pages having only partial Hindi navigation behavior

## Canonical Brand Rule

- English: `Drishvara`
- Hindi: `द्रिश्वारा`

Blocked Hindi forms:

- `दृशर`
- `द्रिश्वर`
- `द्रिष्वरा`

## Scope

This is a frontend-only guard script. It synchronizes language keys, locks the brand spelling, and applies a small cross-page phrase map for public pages.

It does not:

- enable Supabase
- enable Auth
- fetch external APIs
- mutate content JSON
- activate Vedic/Panchang rule engine
- unlock payment, premium, palm upload, or admin features
