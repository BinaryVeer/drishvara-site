# Internal Editorial Workspace

Scope: internal review service. The authorized hosted schema and limited account access are recorded below. Content approvals, Word-bank promotion, article delivery and scheduling are not activated by this service.

## Ownership

- Existing Supabase Auth users and active `profiles` are reused. An admin role alone confers no review qualification.
- `api/editorial-workspace.js` serves a generic login page and server-gates the workspace with an HttpOnly, SameSite=Strict cookie. Every request checks the existing Auth user and database capabilities. No refresh token or service-role credential reaches the browser.
- `editorial_review_command` derives its actor from `auth.uid()`. Private tables deny direct browser/service-role access. RLS, scoped grants, per-candidate assignments, immutable versions and append-only decisions are enforced in SQL, not by hidden buttons.
- Existing five article desks remain World Affairs, Media & Society, Public Programmes, Sports and Spirituality. Technology remains cross-desk. The local design scan and Article Studio remain the read-only inventory of topic, reference, image and legacy inputs; they are not deployed draft feeds.
- Word intake reuses `ag70e.word-copy.v2` and `meaningStructureErrors`, without constructing a replacement corpus or selector. Research identities are retained. Intake does not authenticate source claims or import approvals embedded in historical data.

## Local preparation and configuration

The source migration is `supabase/migrations/20261027000000_editorial_review_preparation.sql`. Its exact authorized application is recorded below. Do not use a broad `db push` to apply unrelated pending migrations.

The API remains disabled unless `EDITORIAL_WORKSPACE_ENABLED=true` is deliberately configured. It also requires `EDITORIAL_WORKSPACE_ORIGIN` (exact HTTPS origin; explicit HTTP loopback allowed only for local validation), existing `SUPABASE_URL` and `SUPABASE_ANON_KEY`. No service-role fallback is used. Test values are synthetic only. There is no public navigation link.

SQL provisions **no accounts, reviewers, capabilities, qualifications or assignments**. An authorized database operator must record actual capability/assignment authorization references and expiry. Linguistic, IAST, textual and philosophical grants additionally require real qualification references. Account creation and reviewer appointment require separate authorization; entering a reference is not proof of expertise. No self-service grant endpoint exists.

The static shell contains no private candidate data. All candidates are fetched after authentication. Even if a hosting service exposes the raw generic shell, that does not expose drafts or confer access. The existing draft-filled local design must never be copied to a public webroot. Future hosting must verify function asset tracing and same-origin cookie delivery before activation.

## Review flow

1. An intake-authorized account submits a research payload. Word payload: `{contract_version, content, research_refs}`. Article payload: `{desk, body, sources, media, research_refs}`. The title and payload are frozen together; a new version requires the prior `expected_version_id`.
2. An operator assigns independently authorized reviewers. All authors of a candidate are prohibited from reviewing it. A stored source URL or historical `approved` marker is never a reviewer decision.
3. Reviewer records approve/revise/reject, rationale and evidence references for the exact version/hash. Approvals do not establish missing source rights, linguistic facts or editorial evidence by themselves; the assigned human must actually inspect the recorded evidence. Rights decisions must identify the license, public-domain or permission basis, permitted use and attribution in their recorded references/rationale.
4. Word scopes: linguistic, IAST, rights, editorial, context, safety, textual, philosophical and publisher acceptance. Article scopes: editorial, rights, factual, safety, media and publisher acceptance. These are private handoff requirements, not alterations to AG70D/AG70E publication policy. Source-use, linguistic and publisher decisions remain separate.
5. Latest decisions govern. Edits invalidate all prior version approvals. Revoked/expired grants, assignments or inactive accounts invalidate effective approvals. Idempotency keys bind actor and complete command; candidate locks serialize changes.
6. A release-authorized, assigned account can request a handoff only when all current required decisions are effective. `pending_existing_publisher_validation` is **not publication**. Every receipt retains `public_output_allowed:false` and `runtime_activation:false`.

The private review-envelope hash is SHA-256 over PostgreSQL's canonical `jsonb` serialization of `{title,payload}`. It intentionally differs from AG70E's existing `snapshotHash(copy.content)`. Future promotion must recompute and validate the existing content hash, retain decision evidence and enforce both identities. Do not substitute one hash namespace for the other.

## Controlled publication boundary and remaining integration

No release worker is enabled. A future authorized publisher adapter must re-read the current version, effective grants/decisions and outbox state immediately before delivery, rejecting stale or revoked requests. It must never treat the existence of an old outbox row as continuing authorization.

For Words, final source-use metadata must first be genuinely cleared; any change to copy metadata creates a new review version. Promotion must retain actual decision/source references and pass existing `validApprovedRecord`, `reviewedWordCopy`, `approvedEngineBank` and release-configuration checks. Only then may the existing IST unused-first assignment/server workflow operate under its independent production authorization. This implementation does not populate the approved bank.

For Articles, use an exact-version, authenticated publisher adapter with idempotent delivery and recovery. Do not connect this workspace to `publish-all`, `publish-public-programme`, `run-daily-pipeline` or legacy job endpoints: the prior inspection found independent authentication/approval gaps there. Those legacy paths are unchanged and are a separate live-release security blocker, not secured by this new UI.

## Validation

- `node scripts/validate-editorial-workspace.mjs`: contract/HTTP checks using explicitly simulated Auth/RPC.
- `node scripts/validate-editorial-workspace-postgres.mjs`: real pinned PostgreSQL 17, synthetic accounts/data, network none, no ports/persistent volume; removes only its own disposable container in `finally`.
- Local design validators test the new image, typography, existing article/word screens and desktop/mobile layout. Browser fixture tests are not hosted-login certification or real approval evidence.

The generated hero is an AI illustration; Arial is the main typeface and Cambria is reserved for headings. No photographer attribution is claimed.

## Live-integration preparation

The approved hero is retained. `/editorial` is the intended internal entry route; its destination remains the server-authenticated workspace handler. Direct requests for raw workspace files are routed through that handler rather than serving an alternate unauthenticated screen. There is no public navigation link. Vercel function packaging explicitly includes only the five required runtime assets; the draft-filled local preview is not a deployment input.

The F2 preservation validator now permits only that exact function-packaging and internal-route delta, while still checking the original Cron/public configuration and all protected runtime owners. It is not a general waiver for hosting changes.

Request bodies are decoded as complete, strictly valid UTF-8 after byte-count limits, preserving Sanskrit/Hindi across split network packets. Expired/revoked accounts can clear their local cookie even when remote authorization is unavailable.

Live preflight on 27 October 2026 confirmed the linked project `pajlabwwszmhjhabxprf` is `ACTIVE_HEALTHY`, Mumbai, PostgreSQL 17.6.1.104. A hosted SELECT returned the expected `profiles` column names and initially confirmed the review schema/RPC were absent. The CLI returned usable query data but exited with a telemetry shutdown timeout; this is not represented as a clean CLI validation pass. Subsequent hosted operations used the authenticated Supabase connector.

The user subsequently authenticated Vercel and explicitly authorized the exact hosted migration, six limited account scopes, controlled repository commit/push and internal deployment. No content-review qualification was inferred from that authorization.

Deployment order: verify the exact project and remote migration ledger; apply only the reviewed editorial migration and record that single version atomically; verify private ACLs/RLS and unchanged Panchang owners; provision only authorized real-account scopes/assignments; configure the four workspace-specific server settings; deploy and verify anonymous denials plus a real permitted login. Do not run a broad migration push or enable the legacy publisher endpoints. Rollback disables `EDITORIAL_WORKSPACE_ENABLED` and reverts only workspace routing; retain immutable review data rather than dropping the private schema.

## Authorized hosted operations, 27 October 2026

- Applied only `editorial_review_preparation_r1` through Supabase's migration tool. The remote version is `20261027034923`; the repository's source filename retains `20261027000000`. Do not replay it merely because the tool-generated timestamp differs.
- Source SHA-256: `1aa5db514fb7d093259a4480beb4877ee5342da81092f585ff1f096d2b8d587b`. The schema comment records that hash; the application adds only that receipt and a PostgREST schema-reload notification to the source transaction.
- Before application, the remote migration ledger was absent. The supported migration tool registered this one migration. No unrelated historical migration or duplicate local version was applied, repaired or renamed.
- Confirmed seven RLS-enabled private tables, zero public/anon/authenticated/service-role direct table grants, authenticated-only RPC execution and no anonymous execution. There are no review decisions or release requests.
- Existing confirmed active admin account received only `intake`, `release` and `publisher_acceptance` for `word` and `article`, with the actual publisher authorization reference `publisher-authorized-workspace-access-20261027-v1`. All six grants expire at `2026-11-26T03:50:21.954639Z`. Qualification references remain null. No account, qualification, assignment or content approval was created.
- A read-only database policy probe for that account returned an empty permitted queue. This is not a password/JWT browser sign-in certification, nor a human review.
- Word controls remain `persistence_enabled:false` and `publication_enabled:false`. `calculate-panchang` remains version 6 with bundle hash `6a35c7cc6e638389e976bd5a4a9ff1d11e4f23609cbe0905d1d5086a9b8bd1d6`; both Word Edge Functions remain version 1. No Edge Function was redeployed.
- The live integration checkout started at observed production commit `e438542e3e9e5034213a8cce4ae0306a9676cec4`. Before pushing, the new location-interface commit `0a653f71e53da5213679365f8cd9747e0d90cdbb` reached main; the workspace commit was rebased onto it without overwriting those changes. The original older checkout and its unrelated files are preserved.
- Validation: use `node scripts/validate-drishvara-homepage-f2.mjs --editorial-integration` to compare protected files against that production baseline. The original historical mode is retained; its pre-existing failure on the already-modified Panchang page was reproduced without workspace changes. No historical hash or protected controller was altered to hide it.

Website deployment and real account browser acceptance must be verified after the controlled commit; a saved Vercel setting or successful local build alone is not live-launch evidence. The release handoff adapter remains unconnected, so the review desk cannot publish approved or unapproved content directly.
