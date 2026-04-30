# Drishvara Supabase Backend Plan

## Purpose

This backend layer will support authenticated subscribers, premium guidance, user submissions, feedback, palmistry requests, and Knowledge Vault monthly review workflows.

## B20A Scope

B20A creates the database schema scaffold only. It does not enable login, payments, public palm image upload, or live subscriber dashboard rendering.

## Tables

- subscriber_profiles
- subscriptions
- subscriber_daily_guidance
- user_submissions
- feedback_submissions
- palmistry_requests
- knowledge_update_reviews

## Safety Rules

- Row Level Security must be enabled on all user-facing tables.
- User rows must be visible only to the owning authenticated user.
- Admin/review workflows should use service role or a future admin role.
- Palm image upload remains disabled until private storage, consent, deletion policy, and review workflow are implemented.
- Subscriber daily guidance must not be generated without login, subscription, consent, and approved Knowledge Vault rules.
- Knowledge Vault monthly review is scheduled for the 10th of every month.

## B20 Roadmap

### B20A — Database Schema

Current batch.

### B20B — Auth and Access Model

Define login, subscriber gate, and plan status logic.

### B20C — Subscriber Dashboard

Create dashboard shell for premium daily guidance and profile context.

### B20D — Backend-safe Submission Intake

Connect submissions page to Supabase with consent and review status.

### B21 — Payment / Subscription Planning

Choose payment provider and subscription lifecycle integration.

### B22 — Admin Review Panel

Review submissions, feedback, palmistry requests, and Knowledge Vault updates.
