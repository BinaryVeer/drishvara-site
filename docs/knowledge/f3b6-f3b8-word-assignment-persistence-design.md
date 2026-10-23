# F3B-6 + F3B-8: internal word assignment contract

Status: implementation for internal qualification only. No database migration,
production adapter, scheduler, endpoint, homepage connector or publication activation.
Baseline: `a4013e86fb39b87421a0269c81f74333c689feb1`.

## Existing owners and trust boundary

- AG70D `production/methodology/ag70d-duplicate-control-and-history-rules.json`
  remains the policy owner (`ag70d.word-selection.v2.1`). It is not rewritten here.
- AG70E `production/knowledge-bank/approved-output-candidate-bank.json`,
  `daily-word-history-bank.json`, `duplicate-control-history-bank.json` and
  `word-output-record-contract.json` remain unchanged, empty and inactive.
- This additive execution contract projects reviewed AG70E records into versioned
  immutable snapshots. It is not a replacement bank or an approval authority.
- Existing Supabase conventions inspected: `supabase/config.toml`,
  `20260527_ag35b_drishvara_controlled_schema.sql`,
  `20260625_sup01_panchang_runtime.sql`, and `calculate-panchang/index.ts`.
  Existing migrations use RLS, explicit privileges and separate audit records;
  the current public Panchang function is read-only for its data integration.
  Do not reuse its anonymous calculation endpoint for word writes.
- Only a future trusted server may load approved policy/context/ranking records,
  authenticate the actor, verify approval references and construct inputs. Strings
  and `review_status` fields are not credentials or cryptographic approval proofs.
  Caller/browser approval assertions must never be forwarded as authoritative.

## Pure selector API

`selectDailyWord(input)` in `scripts/lib/ag70d-word-selection-engine.mjs` has no
I/O, clock, randomness, database or public renderer. All result envelopes explicitly
carry `public_output_allowed: false` and `runtime_activation: false`.

Inputs use `contract_version: ag70d.word-assignment.v1`:

- `date_key`: exact valid `YYYY-MM-DD`, `timezone: Asia/Kolkata`,
  `publication_scope: global_public_word`; no user-location input. `created_at`
  is an explicit canonical UTC timestamp `YYYY-MM-DDTHH:mm:ss.sssZ`.
- `policy`: the existing AG70D policy, including its separately approved context
  and precedence references. Both are null in production, so it withholds.
- `context`: `basis_ref`, `version`, `snapshot_ref`, `date_key`,
  `eligible_candidate_refs`, `review_status`, `approval_ref`.
- `precedence`: `rule_ref`, `version`, `review_status`, `approval_ref`,
  `operator: approved_explicit_candidate_order`, `candidate_order`. The complete
  ordering must come from a separately approved editorial policy result; this
  module defines no weights, relevance scores, random tie-break or default order.
- `bank`: `snapshot_ref`, `version`, `records`. Every candidate has existing
  AG70E `output_candidate_id`, `selected_word_id`, `selection_path`,
  `context_signal_id`, `approved_for_daily_output`, `review_status`, plus
  `approved_record_version`, `canonical_lexical_identity_id`, `lemma_id`,
  `equivalence_group_id`, `approval_record_refs`, `source_evidence[]` with
  canonical `review_status`, explicit production/public permission gates and
  established morphology/semantics/etymology. This first execution contract accepts
  `selection_path: primary_lexical` only; sacred-fallback dispatch and partial-
  etymology exceptions require separately qualified contracts and fail closed here.
  Optional withdrawn/revoked/
  superseded flags exclude a record. Partial etymology or other unsupported
  qualifications withhold; they do not manufacture a fallback.
- `identity_map`: separately reviewed `version`, `snapshot_ref`, `approval_ref`,
  `review_status`, `links[]` identifying versioned candidate, canonical identity,
  lemma, equivalence group and one reviewed representative. Unresolved or
  conflicting relationships are never merged automatically. The complete history
  must be reconciled to the same identity snapshot before selection can resume;
  this phase supplies no identity-map migration.
- `history`: complete global append-only event stream, contract version,
  available/complete flags, contiguous revision, identity snapshot reference,
  and content hash. `expected_history_ref` must match the trusted current read.
  Hashes detect accidental corruption, not malicious re-authoring by a trusted
  source. A pure function cannot independently establish history completeness or
  freshness; the storage transaction must enforce both.
- `exclusions`: separately approved snapshot with `approval_ref`, `review_status`,
  and explicit candidate-ref entries (`editorial_exclusion` or
  `repeat_window_exclusion`). An empty list must also be authoritative.

Output is `proposal`, `replay` or `withheld`. A proposal includes deterministic
IDs, exact approved candidate/version snapshot, source and approval references,
policy/context/precedence/history/identity/bank versions and references, semantic
content hashes for context/precedence/identity/exclusions, creation
timestamp, and a canonically ordered per-candidate exclusion/selection trace.
Replaying an existing assignment is not permission to republish it, including
when it has since been withdrawn or superseded. There is no annual history reset.
Any new records affect only unassigned dates.

Fail-closed reason families (no silent fallback):

| Condition | Reason |
| --- | --- |
| Invalid contract, date, timezone, scope or timestamp | `invalid_input_contract`, `invalid_canonical_date`, `invalid_timezone`, `invalid_publication_scope`, `invalid_timestamp` |
| Empty/unapproved bank, excluded pool, exhaustion | `approved_bank_empty`, `eligible_bank_empty`, `no_unused_eligible_identity` |
| Missing/incomplete/stale/malformed ledger | `history_unavailable`, `history_incomplete`, `stale_history`, `invalid_history` |
| Missing context or unsupported/pending ranking | `canonical_context_unavailable`, `selection_rule_unavailable`, `precedence_unresolved` |
| Identity or record-version conflicts | `ambiguous_lexical_equivalence`, `conflicting_approved_records`, `conflicting_assignment` |
| Unapproved exclusion or pending reservation | `invalid_exclusions`, `assignment_in_progress` |
| Missing store/server approval | `history_persistence_unavailable`, `authorization_unavailable`, `assignment_approval_unavailable` |
| CAS/idempotency/lifecycle conflict | `history_revision_conflict`, `idempotency_conflict`, `assignment_target_conflict`, `invalid_assignment_transition` |
| Unavailable assignment or supersession link | `assignment_unavailable`, `supersession_reference_unavailable` |
| Invalid command or real publication request | `invalid_assignment_command`, `publication_not_activated` |

Synthetic audit examples: an excluded candidate trace is
`{candidate_ref: "synthetic-candidate-1@v1", decision: "excluded", reason:
"already_published_identity_or_equivalent"}`. The selected unused candidate is
traced as `first_unused_under_explicitly_approved_precedence`; empty/exhausted
results have no proposal and carry their reason plus available version references.

## Storage-neutral API and simulated lifecycle

`executeWordAssignment({adapter, authorization, command, selection_input})`
in `ag70d-word-assignment-store.mjs` requires a server-only authorization
descriptor and adapter contract `ag70d.word-store.v1`:

1. `readHistory()` returns a complete consistent snapshot.
2. `readCommand(idempotency_key)` returns a committed immutable receipt or null.
3. `compareAndAppend({expected_revision, expected_history_ref, idempotency_key,
   request_hash, events})` atomically checks revision, date/identity constraints,
   event transitions, idempotency and appends both events and receipt, or nothing.

All errors withhold. An idempotency key reused for a different request conflicts.
A losing CAS rereads and returns the winning immutable assignment or pending
reservation, never a newly chosen replacement. Reads/writes require trusted server
capabilities; these descriptors do not implement authentication themselves.

Lifecycle: `selection_proposal` + `reservation` are appended atomically;
`authorized_assignment` is a separate approved transaction with fresh content
approval checks. Every transition command binds `assignment_id`, `proposal_id`
and `expected_last_event_id`, so a cancelled/replaced reservation cannot inherit a
stale authorization. The server must authenticate the decision approval's binding
to that exact proposal and any correction payload. `publication` is a separate
event, never inferred from assignment.
`correction` needs its own approval, frozen replacement and original publication
link; original snapshots and events remain. `withdrawal` and `supersession` append
their own approved events, retain date ownership and never erase prior usage.
`cancelled_reservation` requires explicit approval and releases only an unpublished
reservation. No silent timeout, deletion or overwrite is allowed.

Every event has `ag70d.word-event.v1`, stable event/assignment/command IDs,
contiguous sequence, server-supplied UTC timestamp, request hash, actor and
authorization references, parent event links and closed public/runtime flags.
Authorization/publication/correction timestamps belong to their separate events,
not edits to the original assignment snapshot. Correction and supersession links
are explicit fields. The original AG70C history schema remains archival and intact.

Only `ag70d-word-assignment-test-adapter.mjs` supplies an adapter. It has no disk
or network persistence and is clearly synthetic. Production-connected adapters
are rejected in this phase. Publication/correction simulation additionally requires
the test-adapter marker and `simulation_only` authorization; no real publication
writer exists. Synthetic approval records never enter AG70E containers.

## Proposed Supabase persistence (design only, not applied SQL)

Use new private-schema tables, not existing article/Panchang/subscriber tables:

- `word_assignment_claims`: unique `(publication_scope, date_key, timezone)` and
  unique active canonical-identity/lemma/equivalence claims across all dates.
  An authorized date claim is permanent, including withdrawals. Only explicitly
  cancelled, never-authorized reservations release claims. Claims are a locked,
  rebuildable index over the immutable event ledger, not editable history.
- `word_assignment_events`: append-only immutable events and frozen snapshots,
  globally unique event IDs and contiguous ledger revision; foreign keys and
  checked transition/parent/correction/supersession relationships. Deny UPDATE,
  DELETE and TRUNCATE, including outside RLS. No cascade deletion of history.
- `word_assignment_commands`: unique idempotency key + request hash + immutable
  receipt; reject same key/different body. Commit receipt with its events.
- A locked global ledger-head row implements expected-revision/hash CAS. Begin
  one transaction, lock head and date/identity claims, validate independently
  approved current records, insert all events/claims/receipt, advance head, commit.
  Unique violations or serialization conflicts roll back the entire transaction;
  reread the winning claim and immutable snapshot instead of silently reselecting.
  No REST sequence of separate inserts can substitute for this transaction.
- Future server-only RPC must have a fixed search path, explicit grants and
  authenticated actor/capability checks, no browser-controlled approval objects.
  Revoke all table/RPC access from `anon` and `authenticated`; enable RLS with
  no public policies. Credentials stay server-side. A service role bypassing RLS
  is not by itself an adequate append-only guard: use restricted DB privileges,
  mutation-rejecting triggers and audited maintenance procedures. Never expose
  this RPC through `calculate-panchang` or the subscriber scaffold.
- Recovery: retry the same idempotency key after network loss; if reservation
  committed, resume authorization against its frozen proposal. If a transaction
  aborted, neither receipt nor events nor claims exist. Explicitly cancel an
  abandoned reservation with an audit event before releasing it. A failed response
  is not evidence that a transaction failed. Use fresh approval checks on resume.
- Bank/identity changes require reviewed versioned snapshots and full-history
  reconciliation; never rewrite past snapshots or recalculate old assignments.

No migration is supplied or applied. Real serializable transactions, cross-process
uniqueness, crash durability, ACL/RLS, privilege bypass resistance, recovery after
commit/response loss and large-ledger performance require isolated PostgreSQL
integration tests before any production adapter can be authorized. In-memory
parallel promises exercise coordinator behavior only, not these DB guarantees.

## Activation blockers

Real reviewed AG70E words/evidence are absent; context and precedence approvals
are unset; reviewed identity/exclusion snapshots, persistence schema/RPC, DB tests,
server authentication, scheduler and publication integration are unapproved or
unimplemented. None of the three evidence-pending pilot words is eligible.
Word cards remain under verification. No F3B-7 or F3B-9 work is included.
