# Drishvara Admin Review Panel Plan

## Purpose

The admin review panel will support controlled review of user submissions, feedback, palmistry requests, Hindi drafts, Knowledge Vault updates, subscriber guidance outputs, and subscription status issues.

## B22 Scope

B22 creates only the admin review scaffold.

It does not enable:
- live admin login
- backend writes
- approvals
- deletions
- payment actions
- palm image review
- Knowledge Vault public activation

## Review Queues

### User Submissions

Future source table:
- user_submissions

Future actions:
- review
- request more information
- reject
- archive

### Feedback

Future source table:
- feedback_submissions

Future actions:
- accept
- reject
- archive

### Palmistry Requests

Future source table:
- palmistry_requests

Blocked until:
- private storage
- explicit image consent
- deletion mechanism
- admin/reviewer access control

### Hindi Drafts

Current source:
- generated/hindi-drafts

Future actions:
- approve
- hold
- needs revision
- reject

### Knowledge Vault Updates

Monthly review day:
- 10th of every month

Future source table:
- knowledge_update_reviews

### Subscriber Guidance

Future source table:
- subscriber_daily_guidance

Output must remain blocked unless:
- user is authenticated
- subscription is active
- consent exists
- Knowledge Vault rules are approved
- calculation method is reviewed

## Security Rules

- Admin panel must be noindex while scaffolded.
- Admin actions must not be client-only in production.
- Service role keys must never appear in frontend code.
- All review actions must be auditable.
- Public users must not access review actions.
