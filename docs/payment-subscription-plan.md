# Drishvara Payment and Subscription Plan

## Purpose

B21 defines the subscription and payment model before live activation. No payment provider is connected in this batch.

## Proposed Subscription Layers

### Free Reader

Access:
- Homepage
- Public articles
- Insights archive
- Submission preparation scaffold

No access:
- Daily lucky number
- Daily lucky color
- Mantra
- What to do / what not to do
- Premium personal guidance
- Palmistry request processing

### Premium Monthly

Future access:
- Subscriber dashboard
- Daily personal guidance after Knowledge Vault approval
- Lucky number / lucky color
- Mantra from reviewed sources only
- What to do / what not to do from approved rules only

### Premium Yearly

Future access:
- Premium monthly access
- Future continuity archive
- Future monthly personal summary

### Founder Circle

Future invite-only/manual plan for early controlled subscribers.

## Provider Strategy

Recommended phased approach:

1. Manual subscription for private testing.
2. India-focused payment gateway for public India launch.
3. Global provider only if international expansion becomes necessary.

## Non-negotiable Safety Rules

- Do not store card details.
- Do not expose payment secret keys in frontend.
- Verify webhook signatures before updating subscription status.
- Do not promise deterministic outcomes.
- Active payment alone is not enough for premium guidance; approved Knowledge Vault rules and user consent are also required.

## Deferred Live Actions

- Payment provider account setup
- Live checkout
- Webhook deployment
- Subscription self-service
- Refund workflow
- Tax invoice logic
