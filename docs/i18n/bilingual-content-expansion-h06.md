# Content Stage H06 — Controlled Bilingual Content Expansion Registry

## Purpose

H06 starts controlled bilingual expansion after the H05/H05B language runtime stabilization.

The runtime is now stable. This stage therefore does not change the language toggle mechanism. It creates a structured Hindi copy registry for public pages so that bilingual expansion can happen deliberately and safely.

## Covered Pages

- About
- Contact
- Submissions
- Dashboard
- Article reader scaffold

## Brand Rule

- English: `Drishvara`
- Hindi: `द्रिश्वारा`

## Important Constraint

Article body translation should not be done through uncontrolled runtime DOM replacement. Hindi article bodies must come from approved Hindi sidecar content.

## This Stage Does Not

- change language toggle logic
- fetch external APIs
- enable Supabase
- enable Auth
- enable payment
- unlock premium guidance
- enable palm upload
- enable admin actions
- mutate article JSON
