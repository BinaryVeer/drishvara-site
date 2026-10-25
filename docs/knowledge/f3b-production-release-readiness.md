# Consolidated Word of the Day release readiness

Baseline: `1aaf29764604285f42108a131122e495ac3f8b71`.
Status: **not production-ready**. Engineering preparation does not grant content,
database, scheduling, deployment or publication authorization.

## Readiness matrix

| Area | Implemented/prepared | Mandatory remaining gate |
| --- | --- | --- |
| Pure selector and unused-first history | Existing internal engine retained unchanged | Approved real bank, identity map, context, precedence and complete history |
| Pilot content | Compact drafts in the existing review dossier; original text retained | Authorized Sanskrit/IAST, Hindi, source/rights, context/safety and editorial decisions |
| Canonical context | Global Asia/Kolkata civil-date contract retained | Specific versioned editorial/Panchang context and location-basis approval |
| Ranking | Approval-ready explicit-order configuration, no assigned order | Authorized relevance/precedence/tie decisions; policy refs remain null |
| Persistence | Additive SQL, disabled adapter and isolated PostgreSQL validator | Final real-test results below; separate Supabase/staging and production migration approval |
| Homepage | Existing five-card layout consumes a read-only publication envelope | Approved publication, exact reviewed copy, source rights and separate release permission |
| Daily automation | Inactive config and deterministic local dry-run planner | Schedule/time/alert thresholds, authentication and operational authorization |
| Live release | None | Deployment, database activation, publication and scheduling authorizations |

## Content outcomes

Reflection (`manana` / historical `mananam`), Discernment (`viveka` / historical
`vivekaḥ`) and Patience (`dhairya` / historical `dhairyam`) retain their original
IDs, script and editorial fields. Existing hosted dictionary evidence is reusable
as attributed research, not authenticated original-edition or human approval.
The new preparation block contains bounded English paraphrases for review; Hindi
lexical meaning, contextual copy and all formal decisions remain pending. No
approved bank is populated. Original reflections are referenced, not relabelled
as dictionary definitions or silently rewritten.

Sources rechecked on 23 October 2026:
[manana](https://www.wisdomlib.org/definition/manana),
[viveka](https://www.wisdomlib.org/definition/viveka),
[Klryz viveka](https://klryz.com/sanskrit.php?id=44011),
[dhairya](https://www.wisdomlib.org/definition/dhairya), and
[NTU's general noun lesson](https://dlbs.liberal.ntu.edu.tw/BDLM/lesson/fan/sanskrit/skt-gr1.htm).
The grammar lesson supports pattern comparison only. Exact editions, word-specific
morphology/IAST, Hindi translation and reuse rights still need authorized review.
The old HTTP 403 lookup is not reclassified as inspected.

An additional blocker is explicit: the current selector requires established
etymology. All three words still have unverified derivation. This implementation
does not fabricate derivations or relax that requirement. A semantic-only path
would need a separate explicit methodology decision, not an inferred exception.

## Prepared database contract

`supabase/migrations/20261023_word_assignment_preparation.sql` is additive and
unapplied. New private tables hold immutable versioned references, revocations,
assignment snapshots, ordered events and idempotency receipts. Rebuildable date
and identity claim indexes enforce one active canonical date and protect used or
reserved lexical identities across years. Cancellation releases only an
unauthorized reservation; authorization, publication and corrections preserve
history and claims. Corrections reference the latest approved publication event.
An approved correction decision binds `proposal_id`, `event_type`,
`corrected_record_hash`, `corrected_context_ref` and `corrected_context_hash`;
the corrected version must be eligible under that separately reviewed date context.
It cannot inherit the original version's context eligibility implicitly.

`word_assignment_commit` locks the global ledger head, checks the expected
revision/hash and idempotency receipt, checks registered nonrevoked approvals and
actor capabilities, validates the event transition, appends the whole batch and
updates claims/head/receipt in one database transaction. Unique conflicts roll
back the block. No sequence of separate REST writes substitutes for that RPC.
Source and decision references are registered by a separately authorized database
owner; the runtime service cannot manufacture approved references. Revocations
append records instead of editing historical approvals.

Both persistence and publication controls default to false. No word, identity,
reviewer or approval is seeded. RLS is enabled; direct table/schema access is
revoked from public, anon, authenticated and service_role. Only the three fixed-
search-path definer RPCs grant EXECUTE to service_role. Immutable tables reject
UPDATE, DELETE and TRUNCATE. Owner/superuser maintenance and role provisioning
remain privileged operational responsibilities, not guarantees against a malicious
database administrator.

The hash bridge uses PostgreSQL's [SHA-256 binary function](https://www.postgresql.org/docs/17/functions-binarystring.html).
It accepts ASCII metadata keys and JavaScript-safe integer numbers; Unicode word
values have no display/content-length cap. Fractional numeric metadata, non-ASCII
keys or unreconciled identity snapshots fail closed rather than claim unsupported
cross-runtime canonicalization. PostgreSQL/Node parity for boundary Unicode and
snapshot serialization must be demonstrated before migration approval.

The initial injected RPC adapter was limited to `isolated_local_validation`.
The consolidated review adds the dormant `authorized_server` mode described below;
its default stays disabled and no production transport or credential is activated.
Existing non-server callers still cannot authorize real publication operations.
Production use requires separately reviewed authorization and runtime cutover.

At the initial preparation baseline no PostgreSQL server was available. The later
authorized disposable Docker execution is reported separately below. It is not
Supabase production certification. Do not apply the migration on the basis of
mock/static tests or assume local PostgreSQL proves managed gateway behavior.

## Read-only output and display

`generated/word-of-day-publication.json` is an output envelope, not a parallel
content bank. Its checked-in state is withheld with no assignment or date. The
legacy AG63 `generated/word-of-day.json` remains byte-identical and is no longer
the F2 Word card's input. Colour and Mantra remain untouched.

The pure exporter requires valid immutable history, a published/corrected event,
matching release-event permission and separately reviewed exact publication copy.
Five content-hash-bound reviews cover linguistic, editorial, rights, context and
safety decisions. Reviewed IAST is optional; unreviewed IAST is never shown.
All source entries require bounded attribution, HTTPS and reuse approvals.

The existing F2 renderer independently checks date/scope/timezone, flags, review
states, attribution and the SHA-256 content hash using WebCrypto, renders escaped
text and clears at IST midnight with a one-shot display-expiry timer. Focus and
visibility refresh use its existing lifecycle; no selector or writer runs in the
browser. A same-origin artifact is trusted as publisher-controlled; this is not
digital-signature authentication. No real artifact or content has been published.

## Inactive automation and recovery

`planDailyWordRun` accepts an explicit UTC instant, resolves the IST civil date,
checks that date's reviewed context and emits a dry-run selection and stable
date-scoped idempotency key. It installs no timer or job and cannot publish.
Missing history/approvals, exhaustion and unavailable persistence produce audit
warnings. Low-bank alerts require a separately approved threshold. The actual
schedule/time, notification transport and monitoring authorization remain unset.

A future approved worker must reread the winning claim after a CAS conflict and
retry the same command key after response loss. Resume only the frozen reservation
with fresh approval checks; do not rerank an assigned date. Keep reservation,
authorization, publication, correction, withdrawal and supersession distinct.
Never reset history annually or reuse because a rolling window expires.

## Validation entry points

- `node scripts/validate-word-production-completion.mjs`: synthetic end-to-end,
  integrity, inactive automation, adapter mock and structural SQL checks.
- Existing 74-check engine, 21-check AG70D policy, AG70E, 78-check F3B, F1 and F2
  preservation validators remain required.
- `scripts/qa-word-publication-local.mjs`: optional installed Playwright only;
  desktop/mobile actual-page checks, long synthetic word and tamper rejection.
  Uses an ephemeral loopback server, never production data. Screenshots go to
  `/private/tmp`, and the browser/server close afterward.
- Syntax checks, `git diff --check`, one static build and removal of incidental
  generated readiness metadata are required before review.

No commit, push, deployment, production migration, scheduler or live publication
is authorized or performed by this work.

## Initial preparation results (historical)

- Consolidated integration: 37 checks passed; SQL assertions are structural only.
- Retained internal engine: 74 checks passed, including existing simulated races,
  replay, unused-first selection and append-only correction coverage.
- AG70D policy: 21 synthetic checks; AG70E foundation validation passed.
- F3B dossier preservation: 78 checks; F2 preservation: 57 checks;
  existing F1 validator: 31 focused checks passed (actual current count).
- Rendered checks passed at 1440px and 390px for real withheld output, approved
  isolated long-word fixtures, attribution, no page overflow, and tamper rejection.
  No page runtime errors were observed in those runs. Supabase requests were
  blocked in the isolated Word-card browser fixture, not live-service certified.
- JavaScript syntax, diff whitespace checks and the static build passed.
  Regenerated readiness metadata was restored; the legacy preview is unchanged.
- PostgreSQL execution and production-service tests: not run; environment unavailable.

## Consolidated authorization review, 24 October 2026

Current baseline: `efb63d525816957f923118cb9e7bc98d4ef3f7e6`.
**Production-qualified words: 0. Approved words: 0. Public output: withheld.**

The existing dossier now contains `consolidated_production_preparation.final_release_review`:
three exact copy proposals, a source-rights assessment, an approval matrix and
explicit etymology decisions. Historical word fields, dictionary captures,
Activities and provisional analysis are untouched. No parallel bank was created.

| Pilot | Evidence captured | Mandatory review still pending |
| --- | --- | --- |
| Reflection / manana / mananam | Hosted dictionary cognitive sense, neuter noun and published derivation claims | Original entry authentication, morphology/IAST, Hindi evidence (timeout/403), rights, identity and exact editorial/safety copy |
| Discernment / viveka / vivekah with visarga | Hosted general senses and derivation claims; Hindwi Hindi entry | Original edition, exact derivation/IAST, bilingual scope, rights and editorial decisions |
| Patience / dhairya / dhairyam | Hosted composure sense and derivation claims; IIT Bombay Hindi noun entry | Original edition, morphology/IAST, Sanskrit versus Hindi gender distinction, rights and editorial decisions |

Published derivation claims now have inspected locators, but none is promoted to
`etymology_status: established`. The current selector requires that status.
Omitting a public derivation paragraph does not waive internal eligibility. A
semantic-only exception needs an explicit publisher decision, versioned policy
authorization and a subsequently reviewed implementation, not an AI approval.

The source-rights assessment distinguishes the [Cologne repository licence](https://github.com/sanskrit-lexicon/csl-orig/blob/main/LICENSE)
and [CC BY-SA conditions](https://creativecommons.org/licenses/by-sa/4.0/) from
unresolved exact-use approval. Klryz identifies its adaptations and inherited
licence; Wisdomlib access does not establish website-wide reuse permission.
Hindi source access does not authorize copying protected wording. Proposed copy
is separately marked AI-assisted paraphrase, not a dictionary quotation.

`ag70d-word-release-configuration.json.publisher_decisions` records unfilled
decisions for exact copy/attribution, global IST civil date, applicability context,
identity equivalence, deterministic order, etymology and operations. Publisher,
signature, content hashes and every approval reference remain null/empty.

### Prepared trusted workflow

`scripts/lib/ag70e-word-server-workflow.mjs` reuses the existing selector,
coordinator, adapter and public projector. Database functions resolve registered
context, identity, candidate, precedence, exclusion and decision references.
`authorized_server` adapter mode requires a live database authorization check;
default mode stays disabled. The database separately gates writes, actor
capabilities, publication and export. Export rechecks active candidate/source/
approval references rather than trusting historical summary flags.

`supabase/functions/word-publication/index.ts` is an **undeployed** authenticated
worker/export entry. `WORD_WORKFLOW_ENABLED` is absent/disabled; no environment
was changed. It accepts only reserve/authorize/publication operation names and
an optional scheduling marker, never caller dates, content or approval objects.
The worker derives IST dates from its server timestamp. Separate decisions remain
necessary for authorization, publication and release. Responses never expose raw
ledger snapshots, credentials or database errors. No CORS write path is installed.

The prepared scheduled path can only reserve, after an approved configured time;
it cannot automatically authorize or publish. No cron job, scheduler, monitoring
transport or production service was installed. Low-bank warnings use the existing
selector's eligible trace and require a reviewed threshold. Unknown history,
missing approvals, exhaustion and database failures continue to withhold.

GET exports a governed envelope to an authenticated trusted caller. It does **not**
write the website's static artifact. The existing F2 card still reads the withheld
`generated/word-of-day-publication.json`. An authorized same-origin feed/artifact
delivery step, cache behavior and managed Edge bundling/gateway execution remain
release gates; this preparation does not claim an observed live connection.

### Release matrix and rollback

| Workstream | Preparation | Release decision |
| --- | --- | --- |
| Content/languages/rights | Three proposals, exact evidence locators and rights limitations | Human reviews and exact copy-hash approvals pending |
| Selection policy | Existing unused-first IST/history rules retained; publisher fields prepared | Context, precedence, equivalence and etymology decisions unset |
| PostgreSQL | Real isolated validator; synthetic references only; no production credentials | Managed Supabase role/gateway parity and migration authorization pending |
| Trusted feed/homepage | Dormant authenticated worker/exporter; existing fail-closed card | Server activation, deployment and feed delivery approval pending |
| Daily operation | Idempotent/replay-aware runner and disabled scheduling controls | Time, threshold, notification destination, owner and scheduler approval pending |

Intended production changes, only after separate approval: apply the reviewed
additive migration; provision real signed/versioned evidence and policy records
through the privileged governance process; deploy the authenticated worker and
approved feed delivery; explicitly enable persistence, then a reviewed dated
publication/release; finally authorize scheduled reservation and monitoring.
There is no automatic permission to execute any of these steps.

Rollback: disable the Word worker and scheduled invocation, set publication and
persistence controls false, and withhold the read-only feed. Revoke only the new
Word RPC grants if operationally required. Preserve immutable events, receipts,
reviews and published identity history; use governed withdrawal/correction, not
deletion, historical rewrites or resurrection of the legacy AG63 preview. Do not
drop the schema as a production rollback or alter Panchang/SUP02 permissions.

No production migration, publication, scheduler activation, deployment, commit or
push is authorized by this preparation. Final execution results must be read with
their explicit local/synthetic versus managed-production limitations.

### Executed consolidated results

- Real PostgreSQL: **41 checks passed** on PostgreSQL 17.11, aarch64 Alpine,
  image `postgres@sha256:eee6c6e1b0894fa4fe0075eb054af9fd1cf39a35321c2d4110626cfe506411fb`.
  The disposable container had network mode `none`, no published port, bind mount
  or persistent volume, no privileged mode, dropped capabilities and tmpfs data.
  Only synthetic words/reviews and locally emulated Supabase role names were used.
- Verified actual migration compilation/application; nine RLS tables; effective
  grants and denied anon/authenticated writes; independent write/publication
  controls; uniqueness; CAS/idempotency; parallel same-date and cross-date claims;
  append-only UPDATE/DELETE/TRUNCATE triggers; atomic rollback; backend termination
  before commit and recovery; correction, withdrawal, supersession and cancellation.
- The real tests found and corrected numeric object-key serialization order in
  PostgreSQL's hash bridge. Unicode, escaping, array-index keys and safe integers
  now have direct Node/PostgreSQL parity assertions; unsupported numbers reject.
- Registered-reference worker tests exercised actual SQL authorization, separate
  assignment/publication/release decisions, repeated requests, pre-schedule IST
  withholding and revoked-source export rejection. All synthetic data and its
  container were removed after successful execution. Other Docker resources were
  not removed or changed; the downloaded image is a reusable local cache.
- Separate mocked/synthetic checks: integration **40**, retained engine **74**,
  policy **21**, F3B preservation **78**, F2 **57**, F1 **31**, plus AG70E foundation.
  Edge HTTP handler tests ran under Node with a Deno registration stub, not a
  deployed managed Edge Runtime or live PostgREST gateway.
- Installed Chrome/Playwright QA passed at **1440** and **390**: real checked-in
  envelope withheld, isolated long-word fixture readable/wrapping without page
  overflow, attribution accessible, tampered copy withheld, zero page runtime
  errors. Supabase calls were blocked; no genuine approved word was substituted.
- IST boundary behavior used explicit deterministic timestamps. An actual live
  midnight scheduler run, production output, managed auth/grants and crash/failover
  durability have not been certified. No test result grants a human review or
  production release approval.

## Hosted reconciliation and dormant public feed, 24 October 2026

Inspection baseline: `7437ebbfca134d8f490828e392d561621cf097ea` on `main`,
equal to `origin/main`. Local linkage was explicitly authorized and established
with CLI 2.108.0 for `pajlabwwszmhjhabxprf`, Drishvara Phase-I, `ap-south-1`
(Mumbai). Generated `supabase/.temp/` linkage metadata is local-only and must not
be staged. No secret values were printed or copied into this report.

### Hosted evidence and migration preview

SELECT-only Management API queries succeeded as `postgres`; this does not prove
ordinary browser-role access or a working direct PostgreSQL connection. Actual
server version is 17.6 (project metadata build 17.6.1.104). The linked
`supabase migration list --linked` operation timed out and was terminated at
60 seconds; no database password was supplied or requested from the user.
No `db push`, including `db push --dry-run`, was run because the current
instruction explicitly prohibited `db push`. The preview below is a read-only
catalog comparison, not a successful CLI migration dry run.

`supabase_migrations.schema_migrations` does not exist. There is therefore no
recorded migration-version inventory to reconcile automatically. This is NOT
evidence that historical DDL is unapplied. Hosted objects already exist:

| Local file | Observed hosted evidence | Safe classification |
| --- | --- | --- |
| `20260430_b20a_subscriber_backend_schema.sql` | All seven named subscriber/submission/review tables exist with RLS | Historical structure present; full DDL equivalence and execution provenance unverified |
| `20260527_ag35b_drishvara_controlled_schema.sql` | All five named profile/article/audit tables exist with RLS | Historical structure present; do not replay or infer exact equivalence |
| `20260527_ag35c_auth_role_mapping.sql` | `profiles` exists; file performs user-specific role upserts | DML application deliberately not inferred; do not rerun or alter current users |
| `20260624_ag74p_panchang_festival_star_reflection.sql` | All five named governed projection/release tables exist with RLS | Existing Panchang/Star infrastructure; preserve data and policies |
| `20260625_sup01_panchang_runtime.sql` | All four additional runtime tables exist with RLS | Existing runtime infrastructure, not an empty install |
| `20260627_sup02_panchang_public_cutover_readiness.sql` | `sup02_public_cutover_requires_active_runtime` constraint and `sup02_runtime_public_read` policy exist | Direct evidence of cutover DDL present; do not replay blindly |
| `20261023_word_assignment_preparation.sql` | Private Word schema and all `word_assignment_*` public RPCs absent | New infrastructure not present; application still requires separate authorization |

Historical schema beyond these seven files includes `word_corpus`,
`word_of_day_rotation_rules`, `source_authorities`, `source_texts` and
`source_confidence_register`. Their definitions are traceable to
`data/content-intelligence/database-build/sql-drafts/adb05_astro_drishvara_schema_draft.sql`.
`adb10-live-schema-execution-result-record.json` in the same directory records
manual operator-side SQL-editor schema execution against this project. Current
catalog presence corroborates these objects, not byte-identical historical DDL
or approval of their contents. No existing table was recreated or imported.

### Safe duplicate-version/history reconciliation plan

Both AG35B and AG35C currently use migration version `20260527`; one version
cannot identify these two independent files. Renaming one and pushing would
incorrectly present historical role-mapping DML as a new pending operation.

1. Under separate authorization, preserve a recoverable database backup and a
   schema-only catalog/grant/policy snapshot; review full live definitions against
   historical SQL, not merely matching table names.
2. Prepare a reviewed baseline/version map that includes manually applied ADB
   schema and separates AG35B DDL from AG35C DML. Prefer a verified current-schema
   baseline with unique full timestamp versions and preserved historical SQL
   archived outside the active replay queue. Do not invent historical execution
   dates or mark AG35C applied just because `profiles` exists.
3. Prove clean reconstruction plus the unchanged Word migration on an isolated
   schema clone, including data-preserving compatibility and role/grant tests.
4. Obtain explicit approval for any migration-file reorganization or hosted
   migration-history registration. No repair or history writes are authorized by
   this inspection. Do not register all seven old versions as applied blindly.
5. Only then perform an independently authorized CLI preview. Any eventual
   production application must contain only reviewed, genuinely pending changes;
   it must not replay user-role mapping or existing Panchang migrations.

No migrations were renamed, repaired, pushed, reset or executed in this pass.

### Legacy Word versus AG70D/AG70E

Hosted `word_corpus` has two records, `WORD-DHARMA-DRAFT` and
`WORD-PRATIBHA-DRAFT`: both `under_editorial_verification`, `pending_review` and
`public_use_allowed = false`. Neither is one of the three qualified-research
pilot identities. `word_of_day_rotation_rules` contains `ROT-WORD-DRAFT-001`,
`manual_editorial_rotation`, a 30-day exclusion window and public use false.
That obsolete repeat-window record does not override AG70D's unused-first,
no-annual-reset, immutable-history policy and is not consumed by the new feed.

These legacy rows contain lexical/source pointers and coarse review flags, not
AG70E's exact versioned approved-copy hashes, per-review approvals, registered
source/release decisions, canonical applicability context or complete assignment
history. The source registers contain source-level provenance/claim fields;
their existence or legacy verification flags are not word-level approval.
Future reuse requires explicit identity/evidence mapping and normal AG70D/AG70E
qualification. No copying into competing candidate/reviewed/approved banks or
automatic legacy-table conversion is implemented.

Both legacy Word tables have RLS enabled and no policies. Current table grants
include SELECT/INSERT/UPDATE/DELETE and TRUNCATE/TRIGGER/REFERENCES for `anon`
and `authenticated`. RLS with no policies denies ordinary row access, but it
does not govern every granted operation, notably TRUNCATE. These overbroad
catalog privileges need separately approved least-privilege hardening and an
entry-point review. This is not a demonstrated unauthenticated REST exploit;
no writes or exploit attempts were performed. `service_role` bypasses RLS.
No existing grants or policies were changed. The prepared private assignment
schema remains a distinct, restricted server boundary, not a second lexical bank.

### Dormant read-only public delivery

`scripts/lib/ag70e-word-public-feed.mjs` reuses the existing canonical IST date,
history validation and `projectPublishedWord` approval projector. The separate
`supabase/functions/word-of-day/index.ts` entry point can call only
`word_assignment_release_snapshot` and never imports the worker command handler.
The prepared SQL's six service-role RPCs remain unchanged; only this one read
RPC is reachable through the feed transport. No reservation, approval or
publication operation can be requested through this route.

- Only GET and HEAD are accepted. All query parameters, including caller dates
  and operation names, are rejected. The trusted server derives the IST date.
- Reads return `ag70e.word-publication.v1`, already accepted by the existing F2
  renderer. Exact approved release/history/copy/source checks remain mandatory.
  Future-dated publication timestamps, missing/revoked approvals and invalid
  snapshots withhold output; there is no legacy or yesterday fallback.
- Public fields are allowlisted. Raw history, candidate snapshots, reviewer
  notes and arbitrary copy metadata are not returned. Unexpected hash-bound
  content/source fields withhold instead of being stripped and falsely relabelled
  as approved. Published content hashes remain unchanged.
- Browser and CDN headers are `no-store`; there are no ETags, 304 responses,
  stale-if-error or stale-while-revalidate policies. Each request reads current
  approvals. If IST midnight occurs during a read, that response withholds;
  the next request resolves the new date. Existing F2 midnight expiry is retained.
- `WORD_PUBLIC_FEED_ENABLED` must explicitly equal `true`; default is disabled.
  `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are server-only. The outgoing
  HTTPS RPC has a ten-second timeout and rejects redirects. Caller credentials
  are never forwarded. No secret values or raw database errors enter responses.
- Optional `WORD_PUBLIC_FEED_ALLOWED_ORIGIN` must be one exact HTTPS origin;
  unmatched browser origins are denied, wildcard/credentialed CORS is absent.
  Without it, trusted server reads without an Origin header remain possible.
  CORS is a delivery policy, not source approval or caller authentication.

The endpoint is undeployed. `supabase/config.toml` is unchanged: its existing
`verify_jwt = false` applies only to `calculate-panchang`. Before a genuinely
public Word feed can be deployed, separately approve a public gateway setting
for `word-of-day` only, secure server credential configuration and managed Edge
bundle/auth tests. Never relax `word-publication` worker authentication to make
the public feed work. Local tests use Node with a Deno registration stub; Deno
is not installed locally, and relative `.mjs` bundling in the managed runtime
has not been certified.

The homepage still fetches the unchanged withheld static JSON asset. This route
does not rewrite that asset. The proposed minimum future cutover is to point the
existing F2 loader at the approved public read-only endpoint with the approved
site origin; an alternative same-origin proxy must preserve no-store and must
not forward browser-supplied operations or credentials. Either connector change
requires separate approval. No homepage, Vercel, worker or Panchang change is
included here. Approved AG70E banks remain empty and the three pilots unapproved.

### Hosted capabilities and remaining release operations

- `calculate-panchang` alone remains ACTIVE at version 6 with JWT verification
  false; neither Word function is deployed. Word imports/SQL do not modify its
  shared runtime or tables. Shared project-wide service credentials remain a
  security consideration, not a guarantee of credential-level isolation.
- `pg_cron` 1.6.4 and `pg_net` 0.20.0 are available but NOT installed. Vault
  (`supabase_vault`) 0.3.1 and `pgcrypto` 1.3 are installed. No Vault secret values
  were read and no extension or job was created. The public feed needs no cron
  or network-call extension; future scheduling is an independent authorization.
- Database size was 20,106,387 bytes, with 14 current connections and configured
  `max_connections = 60` at the observation instant. These are not quota, CPU,
  reserved-slot, pooler or storage-headroom guarantees. Account usage/quotas and
  compute tier were unavailable through this inspection; no paid upgrade is
  justified by the observed metadata alone.
- Release still requires history reconciliation, scoped privilege review,
  production migration authorization, authenticated evidence/editorial/context/
  precedence decisions, registered approvals, managed runtime tests, separate
  feed and worker deployment authorization, and a reviewed homepage connector.
  Scheduling/publication permissions remain separate and disabled.
- Rollback: disable the new feed/worker and any separately authorized job, serve
  the existing withheld envelope and preserve ledger history. Do not reset the
  shared database, drop legacy data, revoke Panchang access or overwrite history.

Local validation entry point: `node scripts/validate-word-public-feed.mjs`.
Its 27 checks cover synthetic approval/export, F2 contract compatibility, note
filtering, method/query/origin restrictions, default dormancy, fresh no-store
reads, midnight withholding, future timestamp rejection, read-only RPC transport
and preservation. They are not hosted execution or production publication tests.

Current local results: feed 27, integration 40, retained engine 74, policy 21,
F1 31 and F2 57 checks passed; AG70D methodology and AG70E foundation passed.
The existing F3B dossier validator passed its preceding content/governance checks
but stops at line 684: its fallback Git assertion expects historical baseline
`78773a9919a53adca89204745cbdfc1b85517486`, not the current `7437ebbf...`.
That validator was not edited or bypassed, and a complete F3B-suite PASS is not
claimed. The new feed validator and integration suite separately confirm the
unchanged banks, closed publication gates and preserved output requirements.
Three new JS/TS files passed syntax and whitespace checks; the JSON contract
parses successfully. No build, hosted migration, production write, deployment,
schedule, commit or push was performed in this pass.

## Controlled maintenance and security preparation, 24 October 2026

Baseline remains `7437ebbfca134d8f490828e392d561621cf097ea`; remote `main`
was independently checked with `git ls-remote`. This section supersedes only
the preceding stale-validator limitation, not its content or release decisions.
The four existing public-feed code/contract files remain byte-identical to the
start of this maintenance pass. All prior text in this document is retained.
No production operation or repository closure is authorized by this record.

### Dependency classifications and deliberate retention

Reference searches covered current HTML/JS, package/build entries, Word/D04
contracts, governance/quality records, Supabase SQL/Edge owners and Admin/Editor
workflows; relevant Git history was checked. The following classes describe
ownership, not permission to execute a historical generator or publish content.

| Classification | Exact inspected owners/candidates | Decision and dependency evidence |
| --- | --- | --- |
| Active production dependency | `assets/js/drishvara-v2-homepage.js`, `generated/word-of-day-publication.json`, `data/knowledge-base/word-of-day/production/knowledge-bank/word-output-record-contract.json` | Preserve the F2 contract, withheld asset and one authoritative renderer; no new homepage connector |
| Active production dependency | `panchang.html`, `what-stars-say.html`, `assets/js/sup02-panchang-server-controller.js`, `supabase/functions/calculate-panchang/index.ts` | Preserve F1 routes and existing calculation ownership; F1/F2 and AG74P/AG75C validators protect these owners |
| Active production dependency | `scripts/lib/ag70d-word-selection-engine.mjs`, `scripts/lib/ag70d-word-assignment-store.mjs`, `scripts/lib/ag70e-word-postgres-adapter.mjs`, `scripts/lib/ag70e-word-publication-pipeline.mjs`, `scripts/lib/ag70e-word-server-workflow.mjs` | Preserve current internal/dormant release dependencies; this classification does not imply live activation |
| Active production dependency | `assets/js/ag36a-admin-live-auth.js`, `assets/js/ag36b-editor-live-auth.js` | Existing auth code reads `profiles`; no legacy Word write consumer identified there. Do not alter unrelated Admin/Editor roles or article permissions |
| Governed historical/audit evidence | `data/content-intelligence/quality-reviews/f3b2-word-activities-evidence-dossier.json`, `data/knowledge/daily-guidance/daily-guidance-rule-examples-d03.json`, `data/knowledge/daily-guidance/daily-guidance-selection-preview-d04.json` | Preserve original three-word and three-Activities evidence; current F3B validator compares the source fields and rejects false approvals |
| Governed historical/audit evidence | `data/knowledge/daily-guidance/word-of-day-bank-d02.json`, `data/initial-working-data/word-of-day/ag63a-word-bank-approved-preview.json` | Historical inputs to AG69/F3B identity/source validation, not an alternative AG70E approved bank |
| Governed historical/audit evidence | `data/content-intelligence/database-build/sql-drafts/adb05_astro_drishvara_schema_draft.sql`, `data/content-intelligence/database-build/adb10-live-schema-execution-result-record.json` | Provenance of manually established hosted Word/source schema; necessary for reconciliation and rollback understanding |
| Governed historical/audit evidence | All seven original files in `supabase/migrations/`, including both `20260527_*` files | Different DDL and role-mapping DML, not duplicate content. Hosted history remains unregistered; do not delete, rename or replay |
| Superseded but still referenced | `generated/word-of-day.json`, the AG63B inline loader in `index.html` | Loader remains in the deliberately quarantined shell; AG63B/Z, AG69K, F1/F2 and historical published-path references still depend on it. Do not remove its URL or reopen the shell |
| Superseded but still referenced | `scripts/generate-ag63a-word-of-the-day-foundation.mjs`, `scripts/generate-ag63b-word-of-the-day-ui-wiring.mjs`, `scripts/generate-ag63z-word-of-the-day-closure.mjs` | Package entry points, historical validators and audit records reference these scripts. Do not run them as current production generation or remove them without a separately reviewed retirement map |
| Superseded but still referenced | `data/methodology/word-of-day/ag63a-word-of-the-day-methodology.json`, `data/methodology/word-of-day/ag63a-word-selection-rotation-policy.json`, `data/knowledge/daily-guidance/word-of-day-rotation-policy-d02.json` | AG70D supersession map explicitly retains these as legacy references; executable selection stays owned by AG70D v2.1 |
| Superseded but still referenced | `generated/vedic-guidance-working-data.json`, `scripts/generate-ag65a-vedic-guidance-foundation.mjs`, AG69 source/asset-chain records | F2 Colour/Mantra withholding checks and historical qualification/roadmap references remain; not eligible for age-based deletion |
| Demonstrably obsolete, duplicate or disposable | Historical HEAD/staged-file-shape branches in `scripts/validate-f3b2-word-activities-evidence-dossier.mjs` | Replaced with stable publication contracts and negative assertions; immutable source comparisons were retained. This is obsolete test logic removal, not deletion of a governance file |

**Repository files deleted: none.** No inspected file satisfied all eight deletion
conditions. In particular, published paths, build/validator references, governed
provenance, migration/rollback history or future qualification ownership prevent
safe deletion. No directory, prototype, research artifact or user backup was
removed. A future cleanup needs explicit reference retirement and a public URL
compatibility decision before deleting the retained candidates above.

`/supabase/.temp/` is now excluded by `.gitignore`, with the authorized local
linkage cache preserved. `prototypes/` remains untracked, unstaged and untouched.
No broad clean/reset or source-generation command was used.

### Minimal hardening SQL and reconciliation boundary

New, unapplied migration:
`supabase/migrations/20261024000000_word_legacy_privilege_hardening.sql`.
It requires PostgreSQL 17+, both expected legacy tables and the three Supabase
roles. Its explicit transaction and transaction-local `pg_catalog` search path
limit resolution and rollback behavior. Only `public.word_corpus` and
`public.word_of_day_rotation_rules` are targeted.

- Revoke INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER and MAINTAIN from
  PUBLIC, `anon` and `authenticated`; separately revoke column INSERT/UPDATE/
  REFERENCES so explicit column grants cannot bypass table-level hardening.
- Preserve existing SELECT grants, owners, schema access, RLS/policies, content
  and direct service-role grants. Snapshot and compare effective service-role
  table AND column privileges; unexpected server-access loss aborts atomically.
- Check effective browser-role privileges after revocation. Inherited table or
  column grants that remain unsafe cause a governed error and rollback rather
  than silently claiming hardening succeeded. No global role-membership changes,
  CASCADE, default-privilege edits, new grants or data operations are performed.
- Missing target/role or incompatible runtime fails instead of skipping silently.
  No historical rotation or Word-publication setting is enabled.

Fresh hosted catalog inspection still reports PostgreSQL 17.6, no migration
ledger table, no assignment schema/RPCs and no legacy Word RLS policies. Exact
ACLs show direct service-role access and the unnecessary browser-role MAINTAIN
grant in addition to previously reported privileges. The SQL is prepared, NOT
applied: those hosted grants have not been fixed by this local work.

There are now eight local migration files: seven originals plus this one new
uniquely versioned proposal. The duplicate `20260527` is deliberately unresolved.
The earlier seven-file comparison and non-destructive baseline plan still apply;
the new file does not make the queue safe for `db push`. No historical migration
was deleted, renamed, replayed or registered as applied. Hosted `db push`,
`migration repair` and `db reset` were not run.

Any future rollout needs an approved recoverable schema/grant snapshot, the
reviewed history reconciliation and a migration plan containing only authorized
changes. Rollback must not restore broad browser-write privileges automatically;
review narrowly required server grants while retaining RLS and all existing data.

### Actual isolated PostgreSQL verification

`node scripts/validate-word-legacy-hardening.mjs`: **30 real PostgreSQL checks
passed** on PostgreSQL 17.11, aarch64 Alpine, using the pinned official image
`postgres@sha256:eee6c6e1b0894fa4fe0075eb054af9fd1cf39a35321c2d4110626cfe506411fb`.
This is a local PostgreSQL result, not a managed Supabase gateway certification.

The container had network `none`, no published ports or persistent volumes,
read-only root filesystem, nonroot postgres user, all capabilities dropped,
no-new-privileges, tmpfs data, 512 MiB memory and one CPU. Synthetic tables/roles
only were used; no production URL, credentials or content were imported. The
prepared assignment migration was applied only inside this disposable database.

Tests demonstrated actual denied INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER/REFERENCES/
MAINTAIN attempts for both browser roles, including permissive synthetic policies
to distinguish ACL enforcement from RLS default denial. A valid REFERENCES probe
succeeded before hardening and failed with a permission error afterward. Table
and column grants, PUBLIC grants, idempotency, inherited privileges, atomic
failure/rollback, missing targets and server-access preservation were checked.
Unrelated synthetic Panchang content/ACLs and the actual prepared assignment
schema's nine tables, six RPCs and disabled controls stayed identical.

The disposable test container and tmpfs data were removed; a label-scoped check
confirmed no hardening-test containers remained. Other Docker resources were not
removed or modified. The pinned official image remains a reusable local cache.

### Validator and feed preservation results

F3B now passes **83** checks. Only obsolete current-HEAD/origin/staging-shape
assumptions were replaced. Historical source/copy comparisons and all prior
substantive identity, source-integrity, review and publication assertions remain.
Additional negative cases reject published-envelope promotion, server activation
and release-gate bypass. Existing immutable Git references remain provenance
anchors, not a requirement to run the repository at an obsolete commit.

The existing feed still passes **27** local checks without code/contract edits.
GET/HEAD, approved-snapshot export, IST date, midnight withholding, private-note
filtering, F2 compatibility and rejection of write methods remain intact. The
Edge route is still undeployed and default-disabled; managed bundling, public
gateway settings, server-only credentials and approved connector still need
separate verification/authorization. No Deno installation or speculative
production-runtime claim was added.

Other executed results: integration **40**, engine **74**, AG70D policy **21**,
F1 **31**, F2 **57**; AG70D/AG70E, AG69K, AG74P closure and AG75C validations
passed. No publication flags, approved records, homepage, calendar, Star result
bank, calculations, existing Edge worker or backend setting changed. Content,
policy, migration, deployment, connector and scheduling release blockers remain.

The single `npm run build` completed successfully. Its regenerated readiness
manifest was the only incidental build output; it was restored to its initially
clean tracked state. JS/TS syntax, output-contract JSON and whitespace checks
passed. No source file was deleted and no staged changes were created.

## Consolidated release decision, 24 October 2026

Implementation baseline: `99734ac043a395d3019e97b1e0f3756a4be5edd1`.
**Decision: local preparation complete; production release blocked.** No new
approval, production operation, commit or push is authorized by this checklist.

### Connector and verification boundary

The existing Word renderer now accepts the exact read-only `word-of-day` URL
only through `meta[name="drishvara-word-feed"]`. Its checked-in content is empty:
the homepage still consumes the withheld static envelope. After an authorized
connector cutover, reads omit credentials, disallow redirects, time out and bypass
caches. Live-feed errors never fall back to an old static word. One IST-midnight
reread plus existing focus/visibility refresh requires no daily website rebuild;
there is no publication operation, recurring poll or new content selector.
Expired, future, tampered or unapproved copy still withholds. English, Hindi and
Sanskrit remain jointly mandatory under the current copy contract; IAST may be
null but must be approved when supplied. No language approval was inferred.

The public feed bounds concurrent database reads to four **per isolate** and
returns 429/Retry-After at capacity. This is not distributed rate-limit or managed
gateway certification. Public responses retain the existing contract's provenance
references, not raw registries, private notes or full internal review records.
The worker's narrow TypeScript result guards and feed JSDoc fix Deno inference;
they do not loosen authentication or approval checks. Both entry points pass
official Deno 2.1.4 checks, not deployed Supabase gateway/bundling certification.

The expanded pinned PostgreSQL 17.11 rehearsal passes 44 real checks, using
synthetic records only. It creates the three legacy Word dependency tables from
historical ADB05 DDL and matches the two hosted column/type/nullability fingerprints
before applying the exact assignment-then-hardening sequence. Legacy content and
unrelated synthetic editorial/Panchang objects are preserved. Actual SQL RPCs feed
the Node public handler and existing renderer. This is a Word-schema representative
rehearsal, NOT a full hosted-data/schema clone or production history certification.
The disposable container and tmpfs data are removed. Other Docker resources stay.

### Unresolved authorization and migration decisions

- Reuse the dossier's `final_release_review.approval_matrix` and the existing
  release configuration's `publisher_decisions`; do not create another bank or
  methodology. All three pilots, exact copy/rights, morphology/IAST/Hindi and
  original-edition reviews remain pending. AG70E approved banks remain empty.
- Approve exact copy hashes, attribution/licence treatment, global IST scope,
  canonical context/identity map and deterministic candidate order. Optional
  public etymology prose cannot bypass the current internal `established` gate;
  a semantic-only exception needs explicit versioned policy authorization first.
- Future batch intake uses the existing AG70E candidate/evidence/review contracts:
  deduplicate lemma/equivalence identities, attach authenticated evidence and
  reviewers, validate exact copy, then register approved immutable versions through
  an authorized operator. Research records never auto-promote. A three-word bank
  is only a pilot; exhaustion must withhold, not recycle or reset annually.
- Fresh SELECT-only hosted inspection still finds no migration ledger, assignment
  schema or Word RPCs. Both historical `20260527_*` files are preserved. Their
  duplicate CLI version and manually established historical schema remain a
  separate baseline-registration decision; no migration repair, fake application
  dates, renames or blanket `db push` is safe. Review backup and complete schema/
  grant/policy equivalence before authorizing that reconciliation.
- The existing scheduled worker can reserve only. Authorization, publication and
  event release require owner-registered decisions. Unattended publication and
  its decision-registration mechanism/time/retries require explicit policy approval
  and subsequent focused implementation/rehearsal; merely enabling Cron is NOT
  sufficient. No scheduler or automatic approval was added in this preparation.

### Authorized-operator execution checklist (NOT executed)

After scope-specific production authorization, a recoverable schema/grant/data
backup and verified object preconditions, the minimal Word-only SQL sequence is:

```sh
psql -X -v ON_ERROR_STOP=1 'service=drishvara-approved-word' -f supabase/migrations/20261023_word_assignment_preparation.sql
psql -X -v ON_ERROR_STOP=1 'service=drishvara-approved-word' -f supabase/migrations/20261024000000_word_legacy_privilege_hardening.sql
supabase functions deploy word-publication --project-ref pajlabwwszmhjhabxprf
supabase functions deploy word-of-day --project-ref pajlabwwszmhjhabxprf --no-verify-jwt
```

The operator supplies the restricted local PostgreSQL service configuration;
no password belongs in argv, Git or logs. Each SQL file is transactional; if the
second fails, retain the first schema disabled and investigate, never replay it
blindly. Verify nine private RLS tables, six server-only RPCs and denied effective
browser writes. The public JWT exception applies to `word-of-day` only; preserve
worker authentication and `calculate-panchang`. Initially keep both Word enable
flags false. Configure only approved Word environment values via a secure local
env file using `supabase secrets set --project-ref pajlabwwszmhjhabxprf --env-file
"$APPROVED_WORD_ENV_FILE"`; built-in service-role credentials remain server-only.
Managed bundle, auth and distributed abuse-limit checks must precede enabling.

Register only genuinely approved content, source, context, precedence, actor and
per-assignment decisions; keep controls off until those references are verified.
An approved first publication requires reserve, authorize, record-publication
and an independently registered event release, with readback at every step.
Only then authorize the homepage meta-URL cutover and site deployment. Scheduling
must wait for the separately approved automated-decision contract above.

Monitor canonical date/status, assignment/event IDs, unused-bank count, 429/5xx,
revocations and missing daily output; report failures without logging copy drafts
or credentials. Existing workflow alerts cover withholding and approved low-bank
thresholds, not an installed external alerting service. Rollback disables both
Word flags, removes the connector URL and withholds output; remove only an
explicitly authorized Word job if one was later installed. Preserve all histories,
leave Panchang untouched, and never reset/drop the shared database or restore
broad browser-write grants. Production rollback and notification ownership still
require named operators and approval references.

## Publisher policy decision and dormant standing workflow, 24 October 2026

Baseline: `f7d6fce5e6d102d03a0127182cff595a88f0dd0f`. The release configuration's
`publisher_policy` is the authoritative local decision record:
`drishvara-word-publisher-policy@1`, approval reference
`drishvara-publisher-word-policy-20261024-v1`, authority `Drishvara Publisher`,
decision date `2026-10-24`, evidence the explicit publisher instruction in this
conversation. It records precisely global IST civil dates, unused-approved-eligible
identities first with exhaustion withholding, and standing routine publication
only after all individual approvals. It is not a signature, linguistic review,
candidate-order decision, database registration or production execution event.
The existing supersession map and nonrepetition rules are unchanged.

This supersedes the earlier *technical* reservation-only limitation, not the
remaining content or operational blockers. `runWordDailyPublication` now drives
reserve, authorize, publication and snapshot release through the existing engine,
coordinator and SQL RPCs. `run_daily` is accepted only behind the existing worker's
server authentication; browser dates, approval flags and records remain rejected.
Scheduled execution additionally requires enabled/approved automatic scheduling
and its configured IST time. All real execution/scheduler switches stay false.

New unapplied extension:
`supabase/migrations/20261024010000_word_standing_policy_preparation.sql`.
It seeds no policy or word and changes no activation control. After the original
assignment and legacy-hardening migrations, it adds one service-only decision RPC,
commit-time policy checks and a policy-aware wrapper around the preserved original
exporter. The database independently checks current IST date, registered/versioned
policy, effective dates, revocation/supersession, deployment/production approvals,
actor capabilities and independently registered copy/source/rights approvals.
Derived per-assignment decisions and releases explicitly identify their system
basis, publisher-policy reference and version; no per-word human sign-off is
invented. Existing event references resolve to immutable audit records. Deterministic
IDs and the existing locks, unique claims and append-only triggers govern retries.

The three pilots remain unapproved and AG70E banks empty. Exact copy, morphology,
IAST, Hindi, etymology/source-rights and context reviews still require authentic
evidence/decisions. The complete eligible-pool/ranking/context references remain
unset: unused-first approval does not invent tie-breaking or an editorial context.
Before production, reconcile migration history and approve backups and the exact
three-file Word SQL sequence, register the genuine policy plus separate production,
content, actor, context and precedence approvals, verify managed Edge/auth/grants,
and authorize deployment, schedule time and homepage cutover separately. Do not
use blanket `db push`. None of those production actions was performed here.

Revocation uses the immutable registered reference revocation mechanism or a new
authorized deployment with standing execution disabled; exports then withhold.
Amendments append a new publisher-approved version and deployment reference,
never rewrite earlier policy, decisions or history. Database rollback is disabling
the Word workflow/feed, not deleting the new ledger or resetting the shared project.

Validation: 64 real isolated PostgreSQL checks, integration 40, public feed 36 and
F3B preservation 83 passed. Both Word entry points passed pinned Deno 2.1.4 type
checks; syntax, JSON, build and diff checks passed. Disposable test data was
removed and generated readiness metadata restored. These tests grant no word
approval, hosted certification, deployment, scheduling or publication permission.

## Executed Word-only infrastructure and outstanding approvals, 24 October 2026

Execution baseline: `711a635ec593539f263591d3322ee5bdf2a708e1`.
The consolidated release instruction and subsequent publisher clarification
authorize independent, bounded Word infrastructure work, but explicitly confirm
that Reflection, Discernment and Patience still lack word-level approvals.
This section supersedes earlier **unapplied/undeployed** descriptions only for
the operations recorded below. It does not grant content or execution approval.

### Actual hosted operations

The following unchanged SQL files were applied to `pajlabwwszmhjhabxprf` in one
transaction, with five-second lock and sixty-second statement timeouts. Strict
preconditions rejected existing Word objects, unsupported PostgreSQL and changed
legacy column fingerprints. No historical SQL was replayed.

| Applied file | SHA-256 of committed source |
| --- | --- |
| `20261023_word_assignment_preparation.sql` | `b16b21f3d723fa8cd75414dd22c91ece89492dee24b4d029a114e7c38e89432f` |
| `20261024000000_word_legacy_privilege_hardening.sql` | `c41206fe25c667f91bdf72d5daf8f5d7ac16f163c5a49d972d19493f16de07dd` |
| `20261024010000_word_standing_policy_preparation.sql` | `5a43e5a91df6908e9b0715d148d3e98df83c9e0d6a7bd8d0ac2abcd39efe632e` |

Readback verified nine private RLS tables, seven service-only public RPCs,
eleven append-only/policy triggers, zero registered references/events and ledger
revision zero. Persistence and publication are false; identity/deployment refs
remain null. Browser RPC attempts were denied; a service-role commit was rejected
by `word_persistence_not_activated`. No unsafe private helper EXECUTE or legacy
column grants remain. Legacy service-role access is preserved. No synthetic or
real candidate, approval, policy registration or publication was inserted.

All sixteen inspected table data hashes/counts remained identical, including the
two legacy Word drafts and one legacy rotation record. Fourteen protected
Panchang/editorial table catalogs remained identical; Word owners, RLS, policies,
constraints and indexes were preserved apart from the intended ACL revocations.
Restricted operational metadata snapshots are under
`/private/tmp/drishvara-word-release-9NLs7Y/`, outside Git, mode 0600. They contain
catalog/ACL metadata and data hashes, not a full data backup or credentials.

Both default-disabled Word functions were deployed through managed API bundling:

| Function | Version | Gateway JWT | Bundle SHA-256 |
| --- | --- | --- | --- |
| `word-publication` | 1 | true | `64fbb92e310612121771795bc8577273beae1db4fdc03c78bcbe8ca9952bf5b3` |
| `word-of-day` | 1 | false, read-only function only | `db7b677de81c2709192486ac8f01989c45e7261eaa3c5c1c58a9cf6874f17056` |

No Word enable secrets exist. Managed feed GET/HEAD returned 503/withheld with
no-store; POST returned 405 and query-based operations 400. Anonymous and invalid-
JWT worker requests returned 401. Valid-credential worker execution while enabled
was not attempted. No credentials were retrieved or printed. The unchanged
`calculate-panchang` v6 bundle remains
`6a35c7cc6e638389e976bd5a4a9ff1d11e4f23609cbe0905d1d5086a9b8bd1d6`.

### Historical reconciliation boundary

Read-only comparison found the expected historical table/index/policy names;
`sup01_runtime_public_read` is absent where the later SUP02 policy supersedes it.
Object-name presence is not complete schema/DML equivalence. The two `20260527`
files remain distinct DDL and user-role-mapping DML, preserved without replay,
rename or false application records. The historical migration ledger remains
absent. These three exact Word files were executed directly, not through blanket
`db push`, and are recorded here rather than falsely registered as old history.

Standard CLI migration replay remains unsafe. Before using it, an operator must
approve a verified hosted baseline and a unique-version mapping for both retained
historical files, with their original hashes/provenance preserved. This outstanding
administrative reconciliation does not authorize changes to existing data or
reapplication of the now-present Word schema.

### Exact pending copy and consolidated authorization package

The existing dossier's `final_release_review.publication_copy_proposals` now holds
`publisher-review-v2`. Optional public IAST is null; the unreviewed proposed forms
remain in its evidence assessment. Original word fields and Activities are intact.
No public derivation, dictionary quotation, grammatical-case claim, therapeutic
promise or religious prescription is proposed. All copy below remains unapproved.

| Identity and scripts | Exact English meaning | Exact Hindi meaning | Existing evidence locator |
| --- | --- | --- | --- |
| Reflection / मनन / मननम् | Thoughtful consideration of an idea or experience. | किसी विचार या अनुभव पर ध्यानपूर्वक विचार करना। | Wisdomlib manana: separately attributed cognitive MW/Cappeller blocks; original edition and Reflection Hindi evidence pending |
| Discernment / विवेक / विवेकः | The ability to distinguish and judge thoughtfully. | भेद समझकर सोच-समझकर निर्णय करने की क्षमता। | Wisdomlib viveka general senses, Klryz MW72 pointer, Hindwi Hindi entry; no automatic Vedanta scope |
| Patience / धैर्य / धैर्यम् | Composure and steadiness through difficulty or delay. | कठिनाई या प्रतीक्षा में मन की स्थिरता और संयम। | Wisdomlib dhairya MW/Apte blocks and IIT Bombay Hindi entry; Sanskrit/Hindi gender distinction remains |

One outstanding decision set, using the existing dossier/configuration fields:

1. Qualified reviewers: authenticate exact edition/entry and derivation evidence;
   approve Sanskrit form/morphology, Hindi meaning and bilingual contextual use.
   IAST review is required before adding IAST, not invented through omission.
2. Rights reviewer/publisher: approve the exact source-use layer, attribution,
   licensing/change notices and proposed original paraphrases. Accessible hosted
   entries and the Cologne licence are not blanket rights clearance.
3. Publisher: approve exact copy/source versions and content-hash-bound editorial,
   safety and applicability decisions after the independent reviews exist.
4. Publisher: approve canonical identity equivalence, date-context basis and the
   explicit candidate order. Existing global IST/unused-first policy is already
   authorized; it does not supply these missing decisions.
5. Publisher: either obtain established etymology for each candidate or explicitly
   authorize a versioned semantic-only exception and its reviewed implementation.
   Omitting public derivation prose does not waive the current selector gate.
6. Publisher/operator: authorize registered production/actor references, execution,
   exact homepage origin/cutover, schedule time, retry/monitoring owner and alert
   destination only after eligible approved content and security gates are met.

Approved words: **0**. Approved AG70E banks remain empty. First publication: none.
No Cron/pg_net extension, job, Vault secret or scheduler was added. The homepage
connector remains empty and the deployed static envelope remains withheld.
`https://www.drishvara.com/`, `panchang.html` and `what-stars-say.html` returned
HTTP 200. This execution verified live HTTP/source state, not a successful new
desktop/mobile rendered acceptance: the browser attempt timed out. Earlier local
rendered/synthetic tests are not relabelled as live publication certification.

Final re-executed checks: 64 real isolated PostgreSQL (container/data removed),
41 integration including the optional-IAST omission regression, 36 public feed,
83 dossier preservation and the AG70E empty-bank validator passed. JSON syntax,
validator syntax, whitespace and the single static build passed; only incidental
readiness metadata was restored. Unchanged independent engine/policy and prior
F1/F2 evidence are reused, not claimed as freshly run. No site deployment, commit
or push was performed. Full release remains blocked.

Disable/rollback: keep Word enable flags and database controls false, connector
empty and scheduling absent. If later enabled, disable Word invocation/feed and
its specific job first; retain all references, receipts and immutable history.
Do not drop the schema, reset Supabase, replay the migrations or restore broad
browser-write grants. Panchang, Reflection, F1/F2 and unrelated services stay intact.

## Publication activation evidence and decision boundary, 24 October 2026

Starting baseline: `3fe48298f42684440b07f7476c0bd6c6adc91575`.
**Outcome: independently executable evidence/registration work completed;
Word publication remains blocked by genuine missing word-level approvals.**

The existing dossier's
`final_release_review.publication_activation_review` holds the new observations.
All historical captures, original fields, Activities and pending copy proposals
remain intact. No parallel bank, methodology, rule or frontend implementation was
created. The five additional integrity checks distinguish source inspection from
linguistic/rights/editorial authorization.

### New primary-source evidence

Cologne's MW 1899 digital text was pinned to revision
`e4742e12cde786b1a2d10e0507808620a4f2c8eb`, SHA-256
`e4641dc4384de459408368a9b34b2a13c90a19b0ecd4671f92c055b7578d0129`.
The three official printed-page PDFs were rendered and visually inspected;
their URLs and individual hashes are recorded in the dossier. This is not a
qualified human review or authentication of the dictionary's literary citations.

| Pilot | MW entry and scan inspected | DSAL exact Hindi lookup inspected | Specific remaining linguistic decision |
| --- | --- | --- | --- |
| Reflection | Cognitive noun record 156763, p. 783 col. 3; separate adjective/homage senses | मनन, displayed p. 3779, page-query index 3780 | Authenticate formation/display morphology and approve the proposed Hindi translation; missing Hindi access is no longer the blocker |
| Discernment | General senses 200139-200141, p. 987 col. 3; Vedanta scope kept separate | विवेक, displayed p. 4539, page-query index 4534 | Review vi-vic formation, visarga and bounded bilingual meaning; the p. 989 cross-reference was inspected digitally, not as another scan |
| Patience | Second dhairya homonym, record 102069, p. 520 col. 2 | धैर्य, displayed p. 2482, page-query index 2483 | Review the dhira association, exact formation and neuter display; do not substitute Hindi masculine for Sanskrit neuter |

The pinned Cologne data licence was independently retrieved as CC BY-SA 4.0.
Exact-use attribution/licence treatment remains unapproved. DSAL's publisher
notice restricts reuse; only locators and bounded research findings are stored,
not dictionary prose in proposed public copy. These findings do not fabricate
rights permission. Optional public IAST remains omitted; established etymology is
still mandatory under the unchanged executable contract. Exact publisher-review-v2
English/Hindi/Sanskrit copy remains in the existing table above and dossier.

### Actual policy registration and disabled managed execution

Only the already-authorized `drishvara-word-publisher-policy@1` was appended to
the hosted immutable registry and read back, with its existing approval reference
`drishvara-publisher-word-policy-20261024-v1` and payload hash
`sha256:338f19f2ca7d2b60f5672d238eb330a846711bc488d953c637b9286c6f2bd894`.
No individual approval, candidate, source permission, actor/deployment approval or
publication event was registered. The registry now contains one policy reference,
not one approved word. Both database controls remain false; worker/feed enable
settings remain absent. No migration, function redeployment or secret change was
performed. Word functions stay v1; Panchang remains the unchanged v6 bundle.
Anonymous worker requests returned 401; the public feed returned 503/withheld.
Enabled, credentialed managed publication was deliberately not attempted.

### Homepage and automation

The existing connector allowlists the correct deployed read-only endpoint, but
the meta URL remains empty. Live `https://www.drishvara.com/` was checked in actual
1440px and 390px browser viewports: Word displayed **Under verification**, no
horizontal overflow or page runtime errors, connector disabled. Screenshots are
`/private/tmp/drishvara-word-live-withheld-1440.png` and
`/private/tmp/drishvara-word-live-withheld-390.png`. No approved-word rendering or
midnight transition is claimed as a live test; those remain covered by existing
isolated tests. No website build/deployment or homepage source change was needed.

The existing full scheduler operation is authenticated server-side POST to
`/functions/v1/word-publication`, body
`{"operation":"run_daily","scheduled":true}`. It performs the complete standing
workflow, not reservation alone, and independently checks configured schedule
approval/time and current IST date. Browser callers cannot use it. Future invocation
credentials must stay in trusted server/Vault ownership, never client assets,
committed SQL or logs. Schedule time/UTC conversion, execution/monitoring owner,
alert destination and bounded operational retries must be explicitly approved
before installing a job. No Cron/pg_net extension, schedule or external alert
transport was activated. Prior 64 real PostgreSQL checks cover deterministic
retry/concurrency/revocation/exhaustion mechanics, not an installed production job.

### Smallest remaining authorization set

1. Obtain candidate-specific qualified morphology/derivation and Hindi reviews
   for the exact three records and locators above; retain IAST omission unless
   separately reviewed. No new general source-discovery programme is required.
2. Obtain exact source-use/attribution clearance and publisher approval of the
   existing versioned copy after those reviews. Source inspection alone cannot
   supply these independent approval records.
3. Approve canonical identity equivalence, date-context basis and explicit order.
   Either establish each etymology or explicitly authorize and review a versioned
   semantic-only exception; no such exception is inferred here.
4. Once a real candidate is eligible, register genuine approval/context/actor/
   deployment references, authorize enabled execution/homepage cutover and approve
   the schedule/monitoring fields. Global IST, unused-first and standing policy
   decisions are already authorized and must not be requested again.

The absent historical migration ledger and duplicate `20260527` versions are
deferred maintenance, not a current Word RPC dependency. Do not use blanket
`db push`, migration repair or historical replay until separately reconciled.
Approved words and first publication remain **zero/none**. Rollback/disable remains
Word controls off, feed/worker enable flags off, connector empty and jobs absent;
preserve immutable policy/history and do not reset/drop the shared database.

Affected validation passed: 46 integration checks (including five new source/
policy-registration integrity assertions), 36 feed checks, 83 dossier-preservation
checks, AG70E empty-bank validation, JavaScript/JSON syntax and diff whitespace.
The unaffected 64 real PostgreSQL and prior policy/F1/F2 results are reused.
No production bundle changed, so no additional build or website deployment was
needed. Only the dossier, this record and the focused validator changed locally.

### Private lexical bank and consolidated authorization package

The local bank is populated, not just designed. It lives outside the webroot at
`/Users/vikashvaibhav/Documents/drishvara-word-bank-private` (owner-only directory).
Pinned Cologne MW 1899 and AP90 1890 contain 286,525 and 34,882 raw rows. After
quarantining MW 196225's malformed terminator, 211,184 distinct source headwords
were available. A deterministic capacity sample contains **10,000 unique Sanskrit
headword proposals**. All 10,000 passed source/checksum/entry and transliteration
roundtrip checks. None is a linguistically approved semantic identity or a
verified Hindi/English equivalent. Homographs and source senses remain separate
evidence; philosophical suitability is pending, not inferred from sampling.

The observed pinned data licence is CC BY-SA 4.0. Raw text, licence, author/edition,
digitizer attribution, version checksums and change notices remain private and
identifiable. No restricted DSAL corpus was bulk-imported. Export preserves these
materials; redistribution or exact public adaptation still needs the recorded
licence/attribution assessment, not unrestricted proprietary relicensing.

Internal commands (no Supabase writes, selectors or publication side effects):

```sh
node scripts/word-lexical-bank.mjs acquire
node scripts/word-lexical-bank.mjs ingest --limit 10000
node scripts/word-lexical-bank.mjs status
node scripts/word-lexical-bank.mjs search --query patience --state VERIFIED --limit 10
node scripts/word-lexical-bank.mjs review-batch
node scripts/word-lexical-bank.mjs prepare-engine-bank
node scripts/word-lexical-bank.mjs export --out /private/path/new-backup.json
node scripts/word-lexical-bank.mjs restore --from /private/path/new-backup.json --root /private/path/new-bank
```

`--catalog` accepts another reviewed, pinned Cologne-format CC BY-SA source
catalog; unknown formats/licences are rejected, not guessed. Imports are additive
and idempotent; corrections/withdrawals append version-checked events and cannot
erase prior withdrawal. `correct`/`withdraw` require `--id`, `--reason` and
`--expected-version`. Private history uses exclusive local file locking,
content-addressed commits and atomic CURRENT replacement, not a claim of
PostgreSQL transactions or protection against a malicious filesystem owner.
Local withdrawal blocks subsequent exports; managed revocation still uses the
existing separately authorized server workflow, not a new automatic writer.
Restore re-derives imported records from raw source checksums, rather than
trusting copied approval flags. The real 115,741,851-byte backup restored all
10,000 records with identical history; its disposable restored copy was removed.

The existing dossier's `final_release_review.internal_bank_qualification` is the
single consolidated authorization package. Its private three-word copy bundle
preserves the historical IDs, proposed EN/HI/SA text and original editorial
reflections, binds exact content hashes and keeps all five review kinds pending.
The other 9,997 entries have no invented bilingual copy. No second approved bank
was created: the engine export consumes only existing AG70E approved contracts,
with matching local versions and source references. It currently exports zero.

Publisher decisions: exact copy/attribution after review; canonical equivalence,
context and explicit order; retention of mandatory established etymology versus
an explicitly versioned semantic-only exception; then operational registration,
cutover, schedule and monitoring approval. Global IST, unused-first and standing
policy are already authorized. Qualified Sanskrit/Hindi/morphology review and
exact-use source assessment remain necessary; optional public IAST is omitted.
The etymology exception is only a proposal, with no engine or policy weakening.

Fresh read-only hosted checks found nine RLS tables, seven service-only RPCs,
zero browser table/RPC grants, zero candidates/events, and only the previously
registered publisher policy. Both controls are false, WORD enable settings
absent, Word functions v1, Panchang v6, pg_cron/pg_net not installed. Feed 503,
anonymous worker 401, homepage 200 with empty connector and Under verification.
Prior desktop/mobile and real PostgreSQL evidence is reused because their code
has not changed. No migration, hosted import, secret update, schedule, site
deployment or publication was performed. **Approved 0; publishable 0; NOT LIVE.**

Focused validation: 75 private-bank checks (including the real corpus, two local
writer processes and a synthetic qualified export into the unchanged selector),
46 publication integration checks, 36 feed checks, 83 dossier preservation checks
and AG70E empty-bank validation passed. The real backup restore is an additional
executed check. Prior 64 real PostgreSQL checks and F1/F2 evidence are reused,
not presented as freshly rerun. Syntax, JSON and diff checks passed; internal-only
changes require no production website build. No commit or push was performed.
