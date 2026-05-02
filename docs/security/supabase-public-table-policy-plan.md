# Supabase Public Table Policy Plan

## Purpose

This document defines how Drishvara should handle future access policies for public/editorial Supabase tables after RLS lockdown.

## Current Rule

All public schema tables should have RLS enabled.

Do not create broad policies such as:

- allow all select on every table
- allow all insert
- allow all update
- allow all delete
- unrestricted anonymous access

## Future Public Read Policy Approach

When Supabase becomes the source for public article reads, only selected tables should receive read-only policies.

Candidate public-read tables may include:

- articles
- article_references
- article_quotes
- article_data_points
- article_scriptural_references
- contributors
- editorial_series

Before enabling public read policies, confirm:

- table contains no private user data
- table contains only approved public content
- draft/review/internal fields are not exposed
- publication status is enforced
- admin/editor tables remain protected
- write access remains blocked

## Tables That Must Remain Protected

These tables must not receive broad public policies:

- subscriber_profiles
- subscriptions
- subscriber_daily_guidance
- user_submissions
- feedback_submissions
- palmistry_requests
- knowledge_update_reviews
- contributor_submissions
- app_users
- admin/review tables
- payment/subscription lifecycle tables

## Required Future Policy Pattern

Future public read policies should be narrow and table-specific.

Example only, do not run until public content table structure is reviewed:

create policy Public can read published articles
on public.articles
for select
to anon, authenticated
using (
  status = 'published'
  and public_visible = true
);

## Required Future Write Pattern

Public users should not write directly to editorial tables.

User submissions should go through controlled intake tables and server-side review workflows.

## Activation Rule

Public read policies can be added only in a later explicit security stage after:

- table schema review
- data sensitivity review
- publication status review
- policy-specific SQL review
- frontend access need confirmation
