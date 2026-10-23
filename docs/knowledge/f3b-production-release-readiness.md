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
| Persistence | Additive SQL and injected server adapter prepared | Migration review, isolated PostgreSQL execution and transactional/security testing |
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

The injected RPC adapter is disabled by default. Its only executable mode in
this pass is `isolated_local_validation`; no production client, credential,
endpoint, write route or activation switch is installed. Existing coordinator
publication restrictions remain unchanged. Moving to a production-connected
adapter requires separately reviewed authorization and runtime cutover.

No local PostgreSQL server/CLI was available, and the existing Docker daemon was
not running. It was not started. SQL validation here is structural; adapter tests
use isolated mocks. SQL compilation, actual constraints, ACL/RLS, serialization,
parallel transactions, durability, trigger behavior and crash recovery remain
**unverified against PostgreSQL**. Do not apply this migration to production on
the basis of mock/static tests.

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

## Executed local results

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
