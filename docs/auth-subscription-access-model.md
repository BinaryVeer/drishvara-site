# Drishvara Auth and Subscription Access Model

## Purpose

This document defines how Drishvara should separate public, registered, subscriber, and reviewer experiences before enabling live authentication.

## Public / Anonymous Visitor

Allowed:
- Homepage
- Public articles
- Insights archive
- About / Contact
- Local submission preparation scaffold

Blocked:
- Subscriber dashboard
- Daily personal guidance
- Palm image upload
- Backend submission storage
- Profile storage

## Free Registered User

Allowed in future:
- Basic profile
- Public article reading
- Feedback submission

Blocked:
- Lucky number
- Lucky color
- Mantra
- What to do / what not to do
- Premium Panchang guidance
- Palm image reading

## Paid Subscriber

Allowed after future implementation:
- Subscriber dashboard
- Daily personal guidance
- Profile-based guidance after consent
- Premium daily cache

Still blocked until later:
- Palm image upload
- Live premium Panchang
- Payment self-service

## Admin Reviewer

Future role for:
- User submissions
- Feedback
- Hindi drafts
- Knowledge Vault monthly update
- Palmistry requests

## Important Rule

No premium output should appear merely because a user is logged in. Premium guidance requires:

1. Active subscription
2. Consent
3. Approved Knowledge Vault rule
4. Approved calculation method where applicable
5. Safe output guardrails
