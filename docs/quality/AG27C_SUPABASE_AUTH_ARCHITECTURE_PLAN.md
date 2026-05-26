# AG27C — Supabase/Auth Architecture Plan

## Purpose

AG27C prepares a planning-only Supabase/Auth architecture for Drishvara.

It covers future Admin, Editor, system, public reader, subscriber, article queue, review workflow, publishing, audit, references, attribution, object-generation tracking and personalization modules.

## Planning Approval Scope

This stage records approval to prepare architecture and security planning only.

It does not approve backend activation, Auth activation, Supabase project creation, database creation, migration creation, secret creation, runtime queues, dynamic publishing, deployment or publishing.

## Architecture Coverage

- Role and Auth architecture model.
- Supabase table architecture blueprint.
- Admin/Editor workflow architecture.
- Publishing state architecture.
- Secret and environment governance plan.

## Preserved Governance

- Admin remains final publish authority.
- Editor cannot publish.
- System-generated content goes to Admin first.
- Editor edits system/existing content only after Admin assignment.
- Public readers only see published content.
- Subscriber/personalization remains future-only.

## Non-Activation Boundary

AG27C does not create Supabase project, Auth, database, tables, migrations, RLS policies, secrets, runtime queues, GitHub writes, deployment or publishing.

## Next Stage

AG27D — Supabase/Auth Security and RLS Plan.
