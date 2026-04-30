# Drishvara System Inventory

## Purpose

This document records the current Drishvara architecture before live activation of Supabase, Auth, subscription payments, premium guidance, palm image storage, live sports API, or Panchang/Vedic outputs.

## Public Site Layer

Implemented:
- Homepage
- Insights archive
- Article reader
- Featured Reads
- Article index
- SEO files
- robots.txt
- sitemap.xml
- Submissions page scaffold
- Subscriber dashboard scaffold
- Admin review panel scaffold

Scaffolded:
- Sports Desk context
- Right-top Live Sports update
- Word of the Day
- First Light daily context

Blocked:
- Real live sports API
- Live user-specific output
- Live backend submission write

## Content Pipeline Layer

Implemented:
- Article generation/publication pipeline
- Draft approval metadata
- Publish dry-run and approval guard
- Public article discovery refresh
- Homepage Featured Reads
- Featured Read link and image corrections
- Article reader layout/readability corrections
- Article SEO runtime

Implemented Hindi Layer:
- Native EN/Hindi UI control
- Bilingual metadata support
- Hindi metadata override file
- Hindi article body sidecar
- Hindi body draft/review/publish workflow
- Selected Hindi article body support

## Knowledge Vault Layer

Implemented as scaffold:
- Source registry
- Panchang method registry
- Panchang engine scaffold
- Festival rule scaffold
- Vedic guidance taxonomy
- Numerology rules scaffold
- Palmistry rules scaffold
- Palm image policy scaffold
- Mantra policy scaffold
- Subscriber daily guidance schema
- Monthly update schedule on the 10th of every month

Blocked:
- Public Panchang output
- Public Vedic guidance output
- Mantra display from unreviewed sources
- Palm image upload
- Deterministic or guaranteed claims

## Subscriber Layer

Implemented as scaffold:
- Subscriber dashboard
- Subscriber daily guidance schema
- Subscriber daily guidance engine scaffold
- Lucky number blocked state
- Lucky color blocked state
- Mantra blocked state
- What to do / what not to do blocked state
- Profile context placeholder

Blocked:
- Live login
- Live subscription gate
- Live premium guidance
- Profile storage
- Payment provider connection

## Backend Layer

Implemented as scaffold:
- Supabase migration file
- Subscriber profile table
- Subscription table
- Subscriber daily guidance cache table
- User submissions table
- Feedback submissions table
- Palmistry requests table
- Knowledge update reviews table
- Row Level Security policy scaffold
- Auth/access model
- Submission intake policy
- Supabase field mapping
- Payment/subscription planning

Blocked:
- Applying Supabase migration
- Auth provider activation
- Payment provider activation
- Webhook activation
- Backend submission writes
- Palm image storage

## Admin Layer

Implemented as scaffold:
- Admin review page
- Admin review schema
- Review queues:
  - User submissions
  - Feedback
  - Palmistry requests
  - Hindi article drafts
  - Knowledge Vault monthly updates
  - Subscriber guidance review
  - Subscription review

Blocked:
- Live admin login
- Admin backend actions
- Approval/rejection from UI
- Service-role backend route
- Audit log table implementation

## Current Principle

Drishvara is ready for a controlled pre-activation review. Live external services must not be enabled until the final activation checklist is completed.
