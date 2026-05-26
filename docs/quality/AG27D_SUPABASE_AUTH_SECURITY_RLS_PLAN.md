# AG27D — Supabase/Auth Security and RLS Plan

## Purpose

AG27D prepares a planning-only Supabase/Auth security and RLS model for Drishvara.

It defines role access rules, table-level RLS strategy, Admin/Editor workflow security guards, secret/service-role safety, and a controlled activation-stage placement plan.

## Security Principles

- Admin remains final publish authority.
- Editor cannot publish.
- System-generated content must go to Admin first.
- Editor can edit system/existing content only after Admin assignment.
- Public readers can only read published content.
- Subscriber access remains isolated from Admin/Editor workflow.
- Service role key must never be exposed to client/browser code.
- No secret is created or committed in AG27D.

## Controlled Activation Placement

Activation is not done in AG27D or AG27Z.

The recommended future path is:

1. AG28 — Backend/Auth Architecture Blueprint.
2. AG29 — Schema/RLS/Security Model and controlled activation audit/apply decision.
3. AG30 — Login UI and route scaffold only after security controls pass.
4. AG31+ — Queue/state integration only after Auth/RLS validation.

## Non-Activation Boundary

AG27D does not create Supabase project, Auth, database, tables, migrations, RLS policies, secrets, runtime queues, GitHub writes, deployment or publishing.

## Next Stage

AG27Z — Backend Decision Closure.
