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
