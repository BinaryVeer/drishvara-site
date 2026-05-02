# Content Stage H07 — Apply Approved Bilingual Static Page Copy

## Purpose

H07 applies the approved H06 static-page bilingual copy into the existing unified language runtime dictionary.

This improves Hindi coverage for:

- About
- Contact
- Submissions
- Dashboard
- Article reader scaffold

## Rule

This stage expands approved copy only. It does not change the language toggle mechanism.

## Brand Rule

- English: `Drishvara`
- Hindi: `द्रिश्वारा`

## Article Body Rule

Article bodies must not be auto-translated through runtime DOM replacement. Hindi article bodies will be shown only when approved Hindi sidecar content exists.

## This Stage Does Not

- change the language toggle click logic
- fetch external APIs
- enable Supabase
- enable Auth
- enable payment
- unlock premium guidance
- enable palm upload
- enable admin actions
- mutate generated article content
