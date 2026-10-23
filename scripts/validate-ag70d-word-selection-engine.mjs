import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import {
  WORD_CONTRACT, WORD_TIMEZONE, WORD_SCOPE, canonicalJson, snapshotHash, copySnapshot,
  validCivilDate, canonicalPublicationDate, selectDailyWord, inspectWordHistory, candidateRef
} from "./lib/ag70d-word-selection-engine.mjs";
import { executeWordAssignment } from "./lib/ag70d-word-assignment-store.mjs";
import { createSyntheticWordStore } from "./lib/ag70d-word-assignment-test-adapter.mjs";

// Fictional approvals and records are isolated here, never written to a production bank.
const baseline = "a4013e86fb39b87421a0269c81f74333c689feb1";
const policyPath = "data/knowledge-base/word-of-day/production/methodology/ag70d-duplicate-control-and-history-rules.json";
const productionPolicy = JSON.parse(fs.readFileSync(policyPath, "utf8"));
const identityRef = "synthetic-identity-map-v1";
const yes = { review_status: "approved", approval_ref: "synthetic-approval" };
const stamp = "2026-10-23T10:00:00.000Z";
const clone = copySnapshot;
const syntheticWord = (n, changes = {}) => ({
  output_candidate_id: `synthetic-candidate-${n}`, selected_word_id: `synthetic-word-${n}`, approved_record_version: "v1",
  canonical_lexical_identity_id: `synthetic-identity-${n}`, lemma_id: `synthetic-lemma-${n}`, equivalence_group_id: `synthetic-equivalence-${n}`,
  selection_path: "primary_lexical", context_signal_id: "synthetic-context-signal", production_approved: true,
  approved_for_daily_output: true, review_status: "approved", public_use_permission: "approved_for_output",
  morphology_status: "review_approved", semantics_status: "supported", etymology_status: "established",
  approval_record_refs: ["synthetic-editorial-and-linguistic-approval"],
  source_evidence: [{ evidence_ref: "synthetic-evidence", review_status: "approved" }], ...changes
});
const emptyHistory = () => ({ contract_version: WORD_CONTRACT, available: true, complete: true, revision: 0,
  identity_snapshot_ref: identityRef, snapshot_ref: snapshotHash([]), events: [] });
function fixture(records = [syntheticWord(1), syntheticWord(2), syntheticWord(3)]) {
  const policy = clone(productionPolicy);
  policy.publication_model.canonical_context_basis_ref = "synthetic-canonical-context";
  policy.approved_precedence_rule_ref = "synthetic-approved-precedence";
  const history = emptyHistory();
  return {
    contract_version: WORD_CONTRACT, date_key: "2026-10-23", timezone: WORD_TIMEZONE, publication_scope: WORD_SCOPE, created_at: stamp,
    policy,
    context: { ...yes, basis_ref: policy.publication_model.canonical_context_basis_ref, version: "synthetic-context-v1", snapshot_ref: "synthetic-context-snapshot", date_key: "2026-10-23", eligible_candidate_refs: records.map(candidateRef) },
    precedence: { ...yes, rule_ref: policy.approved_precedence_rule_ref, version: "synthetic-precedence-v1", operator: "approved_explicit_candidate_order", candidate_order: [...new Set(records.map(candidateRef))] },
    identity_map: { ...yes, version: "synthetic-identity-v1", snapshot_ref: identityRef, links: records.map(r => ({ ...yes,
      candidate_ref: candidateRef(r), canonical_lexical_identity_id: r.canonical_lexical_identity_id,
      lemma_id: r.lemma_id, equivalence_group_id: r.equivalence_group_id, representative_candidate_ref: candidateRef(r) })) },
    bank: { version: "synthetic-bank-v1", snapshot_ref: "synthetic-bank-snapshot-v1", records },
    history, expected_history_ref: history.snapshot_ref,
    exclusions: { ...yes, entries: [] }
  };
}
const auth = { ...yes, trust_boundary: "server_only", actor_ref: "synthetic-server", simulation_only: true,
  capabilities: ["reserve", "authorize", "cancel_reservation", "record_publication", "correct", "withdraw", "supersede"] };
let commandSequence = 0;
const command = (operation, extra = {}) => ({ contract_version: WORD_CONTRACT, operation,
  idempotency_key: "synthetic-command-" + ++commandSequence, timestamp: stamp, ...extra });
async function fresh(store, input) {
  const next = clone(input);
  next.history = await store.readHistory();
  next.expected_history_ref = next.history.snapshot_ref;
  return next;
}
async function run(store, input, operation, extra = {}, authorization = auth) {
  const current = await fresh(store, input);
  const a = inspectWordHistory(current.history).assignments?.get(extra.assignment_id);
  const target = a ? { proposal_id: a.proposal.proposal_id, expected_last_event_id: a.last_event_id } : {};
  return executeWordAssignment({ adapter: store, authorization, command: command(operation, { ...target, ...extra }), selection_input: current });
}
async function assigned(store, input, publish = false) {
  const reservation = await run(store, input, "reserve");
  assert.equal(reservation.status, "committed");
  const id = reservation.assignment.assignment_id;
  assert.equal((await run(store, input, "authorize", { assignment_id: id, decision: yes })).status, "committed");
  if (publish) assert.equal((await run(store, input, "record_publication", { assignment_id: id, decision: yes })).status, "committed");
  return reservation.assignment;
}
const tomorrow = input => { const i = clone(input); i.date_key = i.context.date_key = "2026-10-24"; return i; };
const reason = (input, expected) => { const r = selectDailyWord(input); assert.equal(r.status, "withheld"); assert.equal(r.reason, expected); assert.equal(r.public_output_allowed, false); };
let checks = 0;
async function check(name, fn) { await fn(); checks++; console.log("PASS " + name); }

await check("identical inputs produce byte-identical proposals without mutation", () => {
  const i = fixture(), before = canonicalJson(i);
  const first = selectDailyWord(i), second = selectDailyWord(i);
  assert.equal(first.status, "proposal"); assert.equal(canonicalJson(first), canonicalJson(second)); assert.equal(canonicalJson(i), before);
  assert.equal(first.proposal.snapshot.approved_record_snapshot.selected_word_id, "synthetic-word-1");
});
await check("candidate, identity-link and object-key caller order do not affect results", () => {
  const i = fixture(), reversed = clone(i);
  reversed.bank.records.reverse(); reversed.identity_map.links.reverse();
  reversed.bank.records = reversed.bank.records.map(r => Object.fromEntries(Object.entries(r).reverse()));
  assert.equal(canonicalJson(selectDailyWord(i)), canonicalJson(selectDailyWord(reversed)));
});
await check("only externally approved order determines the winning unused candidate", () => {
  const i = fixture(); i.precedence.candidate_order.reverse();
  assert.equal(selectDailyWord(i).proposal.snapshot.approved_record_snapshot.selected_word_id, "synthetic-word-3");
});
for (const date of ["2026-2-03", "2026-02-29", "2026-04-31", "0000-01-01", "2026-10-23T00:00:00Z", " 2026-10-23", "2026-10-23 "]) {
  await check("strict civil date rejects " + JSON.stringify(date), () => reason({ ...fixture(), date_key: date }, "invalid_canonical_date"));
}
await check("leap-year and low-year date validation is exact", () => {
  assert(validCivilDate("2024-02-29")); assert(validCivilDate("0099-01-01")); assert(!validCivilDate("1900-02-29"));
});
await check("canonical rollover is IST midnight, independent of host timezone", () => {
  assert.equal(canonicalPublicationDate("2026-10-22T18:29:59.999Z"), "2026-10-22");
  assert.equal(canonicalPublicationDate("2026-10-22T18:30:00.000Z"), "2026-10-23");
  assert.equal(canonicalPublicationDate("2026-02-30T10:00:00.000Z"), null);
  assert.equal(canonicalPublicationDate("0099-01-01T10:00:00.000Z"), "0099-01-01");
  assert.equal(canonicalPublicationDate("9999-12-31T23:59:59.999Z"), null);
});
for (const tz of ["UTC", "Asia/Tokyo", "", null]) await check("noncanonical timezone withholds: " + tz, () => reason({ ...fixture(), timezone: tz }, "invalid_timezone"));
await check("unknown scope and contract fail closed", () => {
  reason({ ...fixture(), publication_scope: "subscriber" }, "invalid_publication_scope");
  reason({ ...fixture(), contract_version: "future" }, "invalid_input_contract");
});
await check("invalid timestamp and unknown top-level control fail closed", () => {
  reason({ ...fixture(), created_at: "2026-02-30T00:00:00.000Z" }, "invalid_timestamp");
  reason({ ...fixture(), allow_reuse: true }, "invalid_input_contract");
});
await check("executable, cyclic and non-JSON snapshots are rejected", () => {
  const i = fixture(); i.bank.records[0].compute = () => 1; reason(i, "invalid_input_contract");
  const j = fixture(); j.bank.circular = j; reason(j, "invalid_input_contract");
  const k = fixture(); k.context.date = new Date(); reason(k, "invalid_input_contract");
});
await check("real frozen policy lacks approvals and cannot select pilot or synthetic words", () => {
  const i = fixture(); i.policy = clone(productionPolicy); reason(i, "canonical_context_unavailable");
  assert.equal(productionPolicy.approved_precedence_rule_ref, null);
  assert.equal(productionPolicy.publication_model.canonical_context_basis_ref, null);
});
for (const change of [i => { i.context.review_status = "pending"; }, i => { i.context.approval_ref = null; }, i => { i.context.date_key = "2026-10-22"; }]) {
  await check("missing, pending or wrong-date context cannot select", () => { const i = fixture(); change(i); reason(i, "canonical_context_unavailable"); });
}
await check("missing, unknown and pending precedence cannot select", () => {
  for (const mutate of [i => { i.precedence.review_status = "pending"; }, i => { i.precedence.operator = "sort_by_score"; }, i => { i.policy.approved_precedence_rule_ref = null; }]) {
    const i = fixture(); mutate(i); reason(i, "selection_rule_unavailable");
  }
});
await check("incomplete ranking and duplicate precedence entries cannot break ties arbitrarily", () => {
  const i = fixture(); i.precedence.candidate_order.pop(); reason(i, "precedence_unresolved");
  const j = fixture(); j.precedence.candidate_order.push(j.precedence.candidate_order[0]); reason(j, "precedence_unresolved");
});
await check("missing, incomplete, corrupt and stale history are distinct fail-closed cases", () => {
  const i = fixture(); i.history = null; reason(i, "history_unavailable");
  const j = fixture(); j.history.complete = false; reason(j, "history_incomplete");
  const k = fixture(); k.history.revision = 1; reason(k, "history_incomplete");
  const l = fixture(); l.expected_history_ref = "old"; reason(l, "stale_history");
});
await check("empty bank is withheld without fallback", () => reason(fixture([]), "approved_bank_empty"));
await check("unapproved source evidence cannot be overridden by record summary approvals", () => {
  const i = fixture([syntheticWord(1)]); i.bank.records[0].source_evidence[0].review_status = "pending";
  reason(i, "approved_bank_empty");
});
await check("missing linguistic gates, record version or approval references cannot select", () => {
  for (const changes of [{ morphology_status: "pending" }, { semantics_status: "pending" }, { etymology_status: "not_established" },
    { public_use_permission: "not_allowed" }, { approval_record_refs: [] }, { production_approved: false }]) reason(fixture([syntheticWord(1, changes)]), "approved_bank_empty");
  reason(fixture([syntheticWord(1, { approved_record_version: "" })]), "conflicting_approved_records");
});
await check("withdrawn, revoked and superseded candidates are excluded with trace", () => {
  for (const key of ["withdrawn", "revoked", "superseded"]) {
    const i = fixture([syntheticWord(1, { [key]: true }), syntheticWord(2)]);
    const r = selectDailyWord(i); assert.equal(r.proposal.snapshot.approved_record_snapshot.selected_word_id, "synthetic-word-2");
    assert(r.trace.some(t => t.reason === "record_withdrawn_revoked_or_superseded"));
  }
});
await check("out-of-context and editorial exclusions retain an unused alternative", () => {
  const i = fixture(); i.context.eligible_candidate_refs.shift();
  i.exclusions.entries.push({ candidate_ref: candidateRef(i.bank.records[1]), reason: "editorial_exclusion" });
  assert.equal(selectDailyWord(i).proposal.snapshot.approved_record_snapshot.selected_word_id, "synthetic-word-3");
});
await check("unapproved exclusion snapshot and unknown exclusion semantics fail closed", () => {
  const i = fixture(); i.exclusions.review_status = "pending"; reason(i, "invalid_exclusions");
  const j = fixture(); j.exclusions.entries.push({ candidate_ref: candidateRef(j.bank.records[0]), reason: "allow_reuse" }); reason(j, "invalid_exclusions");
});
await check("all excluded is not mistaken for an empty bank", () => {
  const i = fixture(); i.context.eligible_candidate_refs = []; reason(i, "eligible_bank_empty");
});
await check("multiple approved versions or duplicate rows fail closed", () => {
  reason(fixture([syntheticWord(1), syntheticWord(1, { approved_record_version: "v2" })]), "conflicting_approved_records");
  reason(fixture([syntheticWord(1), syntheticWord(1)]), "conflicting_approved_records");
});
await check("unreviewed, missing or conflicting lexical mappings cannot silently merge", () => {
  const i = fixture(); i.identity_map.review_status = "pending"; reason(i, "ambiguous_lexical_equivalence");
  const j = fixture([syntheticWord(1)]); j.identity_map.links = []; reason(j, "ambiguous_lexical_equivalence");
  const k = fixture([syntheticWord(1), syntheticWord(2, { lemma_id: "synthetic-lemma-1" })]); reason(k, "ambiguous_lexical_equivalence");
});
await check("reviewed equivalent senses select only the explicit representative", () => {
  const i = fixture([syntheticWord(1), syntheticWord(2, { equivalence_group_id: "synthetic-equivalence-1" })]);
  i.identity_map.links[1].representative_candidate_ref = candidateRef(i.bank.records[0]);
  assert.equal(selectDailyWord(i).proposal.snapshot.approved_record_snapshot.selected_word_id, "synthetic-word-1");
});
await check("unknown reviewed representative and history identity-map mismatch withhold", () => {
  const i = fixture(); i.identity_map.links[0].representative_candidate_ref = "absent"; reason(i, "ambiguous_lexical_equivalence");
  const j = fixture(); j.identity_map.snapshot_ref = "unreconciled-v2"; reason(j, "ambiguous_lexical_equivalence");
});
await check("reservation and authorization are separate, and replay never publishes", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef);
  const r = await run(store, i, "reserve"); assert.equal(r.status, "committed");
  reason(await fresh(store, i), "assignment_in_progress");
  assert.equal((await run(store, i, "authorize", { assignment_id: r.assignment.assignment_id, decision: yes })).status, "committed");
  const replay = selectDailyWord(await fresh(store, i));
  assert.equal(replay.status, "replay"); assert.equal(replay.publication_withheld, true); assert.equal(replay.public_output_allowed, false);
  assert.deepEqual((await store.readHistory()).events.map(e => e.event_type), ["selection_proposal", "reservation", "authorized_assignment"]);
});
await check("same idempotency key replays original receipt; changed request conflicts", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef), c = command("reserve");
  const args = { adapter: store, authorization: auth, command: c, selection_input: i };
  assert.equal((await executeWordAssignment(args)).status, "committed");
  assert.equal((await executeWordAssignment(args)).status, "idempotent_replay");
  const different = clone(i); different.created_at = "2026-10-23T10:00:01.000Z";
  assert.equal((await executeWordAssignment({ ...args, selection_input: different })).reason, "idempotency_conflict");
  assert.equal((await store.readHistory()).events.length, 2);
});
await check("parallel reservations simulate one winner and deterministic winning reread", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef);
  const outputs = await Promise.all([1, 2, 3].map(() => executeWordAssignment({ adapter: store, authorization: auth, command: command("reserve"), selection_input: i })));
  assert.equal(outputs.filter(r => r.status === "committed").length, 1);
  assert.equal(outputs.filter(r => r.status === "reservation_conflict").length, 2);
  assert.equal(new Set(outputs.map(r => r.assignment.proposal_id)).size, 1);
  assert.equal((await store.readHistory()).events.length, 2);
});
await check("competing different proposals for one date cannot both reserve", async () => {
  const i = fixture(), j = clone(i), store = createSyntheticWordStore(identityRef); j.precedence.candidate_order.reverse();
  const results = await Promise.all([i, j].map(selection_input => executeWordAssignment({ adapter: store, authorization: auth, command: command("reserve"), selection_input })));
  assert.equal(results.filter(r => r.status === "committed").length, 1);
  assert.deepEqual(results[0].assignment, results[1].assignment);
});
await check("interrupted reservation resumes without reranking its frozen candidate", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef);
  const r = await run(store, i, "reserve"), before = canonicalJson(r.assignment);
  const next = clone(i); next.bank.records.reverse();
  assert.equal((await run(store, next, "authorize", { assignment_id: r.assignment.assignment_id, decision: yes })).status, "committed");
  assert.equal(canonicalJson(selectDailyWord(await fresh(store, i)).assignment), before);
});
await check("cancelled reservation appends an audit event before a new proposal can claim date", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef), r = await run(store, i, "reserve");
  assert.equal((await run(store, i, "cancel_reservation", { assignment_id: r.assignment.assignment_id, decision: yes })).status, "committed");
  assert.equal((await run(store, i, "reserve")).status, "committed");
  assert.equal((await store.readHistory()).events[2].event_type, "cancelled_reservation");
});
await check("stale proposal or event target cannot authorize a different replacement reservation", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef), r = await run(store, i, "reserve");
  const oldEvent = (await store.readHistory()).events.at(-1).event_id;
  await run(store, i, "cancel_reservation", { assignment_id: r.assignment.assignment_id, decision: yes });
  const changed = clone(i); changed.precedence.candidate_order.reverse();
  const replacement = await run(store, changed, "reserve"); assert.equal(replacement.status, "committed");
  assert.notEqual(replacement.assignment.proposal_id, r.assignment.proposal_id);
  assert.equal((await run(store, changed, "authorize", { assignment_id: replacement.assignment.assignment_id, proposal_id: r.assignment.proposal_id, expected_last_event_id: oldEvent, decision: yes })).reason, "assignment_target_conflict");
  assert.equal((await store.readHistory()).events.at(-1).event_type, "reservation");
});
await check("approval revocation or changed snapshot blocks authorization, preserving reservation", async () => {
  for (const change of [r => { r.revoked = true; }, r => { r.extra_copy = "changed"; }]) {
    const i = fixture(), store = createSyntheticWordStore(identityRef), r = await run(store, i, "reserve");
    const next = clone(i); change(next.bank.records[0]);
    assert.equal((await run(store, next, "authorize", { assignment_id: r.assignment.assignment_id, decision: yes })).reason, "assignment_approval_unavailable");
    assert.equal((await store.readHistory()).events.length, 2);
  }
});
await check("used identities never return after a calendar year boundary", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef); await assigned(store, i, true);
  const next = await fresh(store, i); next.date_key = next.context.date_key = "2027-01-01";
  const r = selectDailyWord(next); assert.equal(r.proposal.snapshot.approved_record_snapshot.selected_word_id, "synthetic-word-2");
  assert(r.trace.some(t => t.reason === "already_published_identity_or_equivalent"));
});
await check("exhausted bank withholds and cannot least-recent reuse", async () => {
  const i = fixture([syntheticWord(1)]), store = createSyntheticWordStore(identityRef); await assigned(store, i, true);
  reason(await fresh(store, tomorrow(i)), "no_unused_eligible_identity");
});
await check("repeat-window exclusions never restore an already used identity", async () => {
  const i = fixture([syntheticWord(1), syntheticWord(2)]), store = createSyntheticWordStore(identityRef); await assigned(store, i, true);
  const next = await fresh(store, tomorrow(i)); next.exclusions.entries.push({ candidate_ref: candidateRef(next.bank.records[1]), reason: "repeat_window_exclusion" });
  reason(next, "eligible_bank_empty");
});
await check("published lemma or reviewed equivalent under a new ID is not unused", async () => {
  const i = fixture([syntheticWord(1)]), store = createSyntheticWordStore(identityRef); await assigned(store, i, true);
  const next = fixture([syntheticWord(2, { equivalence_group_id: "synthetic-equivalence-1" }), syntheticWord(3)]);
  const r = selectDailyWord(await fresh(store, tomorrow(next)));
  assert.equal(r.proposal.snapshot.approved_record_snapshot.selected_word_id, "synthetic-word-3");
});
for (const size of [3, 365, 3650]) await check(`synthetic bank growth to ${size} records cannot change old assignment`, async () => {
  const store = createSyntheticWordStore(identityRef), originalInput = fixture([syntheticWord(1), syntheticWord(2), syntheticWord(3)]);
  const old = await assigned(store, originalInput, true), frozen = canonicalJson(old);
  const expanded = fixture(Array.from({ length: size }, (_, n) => syntheticWord(n + 1)));
  expanded.precedence.candidate_order.reverse(); expanded.bank.version = "synthetic-expanded-v2"; expanded.bank.snapshot_ref = "synthetic-expanded";
  assert.equal(canonicalJson(selectDailyWord(await fresh(store, expanded)).assignment), frozen);
  assert.equal(selectDailyWord(await fresh(store, tomorrow(expanded))).proposal.snapshot.approved_record_snapshot.selected_word_id, `synthetic-word-${size}`);
});
await check("mutation of a returned snapshot cannot modify stored history", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef), a = await assigned(store, i);
  a.snapshot.approved_record_snapshot.selected_word_id = "tamper";
  const h = await store.readHistory(); h.events[0].proposal.snapshot.trace.length = 0;
  assert.equal(selectDailyWord(await fresh(store, i)).assignment.snapshot.approved_record_snapshot.selected_word_id, "synthetic-word-1");
});
await check("correction simulation appends separate approval and never deletes original publication", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef), original = await assigned(store, i, true);
  const before = await store.readHistory(), publication = before.events.at(-1);
  const r = await run(store, i, "correct", { assignment_id: original.assignment_id, decision: yes, corrects_event_id: publication.event_id, corrected_record_snapshot: syntheticWord(2) });
  assert.equal(r.status, "committed");
  const after = await store.readHistory(); assert.deepEqual(after.events.slice(0, before.events.length), before.events);
  assert.equal(after.events.at(-1).corrects_event_id, publication.event_id);
  assert.deepEqual(selectDailyWord(await fresh(store, i)).assignment, original);
  assert.equal(selectDailyWord(await fresh(store, tomorrow(i))).proposal.snapshot.approved_record_snapshot.selected_word_id, "synthetic-word-3");
});
await check("invalid correction link and missing decision approval do not append", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef), a = await assigned(store, i, true);
  const before = await store.readHistory();
  const bad = await run(store, i, "correct", { assignment_id: a.assignment_id, decision: yes, corrects_event_id: "unknown", corrected_record_snapshot: syntheticWord(2) });
  assert.equal(bad.reason, "invalid_history");
  assert.equal((await run(store, i, "correct", { assignment_id: a.assignment_id })).reason, "assignment_approval_unavailable");
  assert.deepEqual(await store.readHistory(), before);
});
await check("withdrawal and supersession preserve date ownership and published usage", async () => {
  for (const op of ["withdraw", "supersede"]) {
    const i = fixture(), store = createSyntheticWordStore(identityRef), a = await assigned(store, i, true);
    const r = await run(store, i, op, { assignment_id: a.assignment_id, decision: yes, supersession_ref: "synthetic-future-review" });
    assert.equal(r.status, "committed"); assert.equal(selectDailyWord(await fresh(store, i)).status, "replay");
    assert.equal(selectDailyWord(await fresh(store, tomorrow(i))).proposal.snapshot.approved_record_snapshot.selected_word_id, "synthetic-word-2");
  }
});
await check("stale store input and unavailable persistence or authorization fail closed", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef);
  assert.equal((await executeWordAssignment({ adapter: null, authorization: auth, command: command("reserve"), selection_input: i })).reason, "history_persistence_unavailable");
  assert.equal((await executeWordAssignment({ adapter: store, authorization: null, command: command("reserve"), selection_input: i })).reason, "authorization_unavailable");
  const throwing = { ...store, readHistory: async () => { throw new Error("synthetic outage"); } };
  assert.equal((await executeWordAssignment({ adapter: throwing, authorization: auth, command: command("reserve"), selection_input: i })).reason, "history_persistence_unavailable");
  await run(store, i, "reserve");
  assert.equal((await executeWordAssignment({ adapter: store, authorization: auth, command: command("reserve"), selection_input: i })).reason, "stale_history");
});
await check("production-connected adapters, browser capabilities and real publication remain disabled", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef);
  const live = { ...store, production_connected: true };
  assert.equal((await run(live, i, "reserve")).reason, "history_persistence_unavailable");
  assert.equal((await run(store, i, "reserve", {}, { ...auth, trust_boundary: "browser" })).reason, "authorization_unavailable");
  assert.equal((await run(store, i, "record_publication", {}, { ...auth, simulation_only: false })).reason, "publication_not_activated");
});
await check("partial transaction is rejected without receipt or partial append", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef); await run(store, i, "reserve");
  const h = await store.readHistory(), isolated = createSyntheticWordStore(identityRef);
  const r = await isolated.compareAndAppend({ expected_revision: 0, expected_history_ref: snapshotHash([]), idempotency_key: "synthetic-partial", request_hash: "synthetic-hash", events: [h.events[0]] });
  assert.equal(r.reason, "history_incomplete"); assert.equal((await isolated.readHistory()).events.length, 0); assert.equal(await isolated.readCommand("synthetic-partial"), null);
});
await check("invalid event sequence, tampered snapshot and mismatched history hash are rejected", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef); await assigned(store, i);
  const h = await store.readHistory();
  for (const mutate of [x => { x.events[1].sequence = 9; }, x => { x.events[0].proposal.snapshot.approved_record_version = "v99"; }, x => { x.events[0].timestamp = "bad"; }]) {
    const bad = clone(h); mutate(bad); bad.snapshot_ref = snapshotHash(bad.events); assert.equal(inspectWordHistory(bad).ok, false);
  }
  const bad = clone(h); bad.snapshot_ref = "fake"; assert.equal(inspectWordHistory(bad).ok, false);
});
await check("same reviewed lemma and equivalent forms need one reviewed representative", () => {
  const i = fixture([syntheticWord(1), syntheticWord(2, {
    canonical_lexical_identity_id: "synthetic-identity-1", lemma_id: "synthetic-lemma-1", equivalence_group_id: "synthetic-equivalence-1"
  })]);
  i.identity_map.links[1].representative_candidate_ref = candidateRef(i.bank.records[0]);
  const r = selectDailyWord(i); assert.equal(r.status, "proposal");
  assert(r.trace.some(t => t.reason === "reviewed_equivalent_not_representative"));
});
await check("missing reviewed mapping excludes affected record, not unrelated qualified words", () => {
  const i = fixture(); i.identity_map.links.shift();
  const r = selectDailyWord(i); assert.equal(r.proposal.snapshot.approved_record_snapshot.selected_word_id, "synthetic-word-2");
  assert(r.trace.some(t => t.reason === "ambiguous_lexical_equivalence"));
});
await check("sacred fallback and unsupported etymology never become implicit alternate methods", () => {
  reason(fixture([syntheticWord(1, { selection_path: "approved_sacred_fallback" })]), "approved_bank_empty");
  reason(fixture([syntheticWord(1, { revoked: "unknown" })]), "approved_bank_empty");
});
await check("parallel same-key retries commit one command receipt and one reservation", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef), c = command("reserve");
  const results = await Promise.all([1, 2].map(() => executeWordAssignment({ adapter: store, authorization: auth, command: c, selection_input: i })));
  assert.deepEqual(results.map(r => r.status).sort(), ["committed", "idempotent_replay"].sort());
  assert.equal((await store.readHistory()).revision, 2);
});
await check("two dates cannot concurrently claim the same unused identity", async () => {
  const i = fixture([syntheticWord(1)]), store = createSyntheticWordStore(identityRef);
  const results = await Promise.all([i, tomorrow(i)].map(selection_input => executeWordAssignment({ adapter: store, authorization: auth, command: command("reserve"), selection_input })));
  assert.equal(results.filter(r => r.status === "committed").length, 1);
  assert.equal(results.filter(r => r.reason === "history_revision_conflict").length, 1);
  const h = inspectWordHistory(await store.readHistory()); assert(h.ok); assert.equal(h.dates.size, 1);
});
await check("lost response after simulated commit recovers using original idempotency key", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef), c = command("reserve");
  const interrupted = { ...store, async compareAndAppend(request) { await store.compareAndAppend(request); throw new Error("synthetic response lost"); } };
  const args = { adapter: interrupted, authorization: auth, command: c, selection_input: i };
  assert.equal((await executeWordAssignment(args)).reason, "history_persistence_unavailable");
  assert.equal((await store.readHistory()).revision, 2);
  assert.equal((await executeWordAssignment({ ...args, adapter: store })).status, "idempotent_replay");
  assert.equal((await store.readHistory()).revision, 2);
});
await check("unknown policy, conflicting versions and changed approval content cannot authorize reservation", async () => {
  for (const change of [i => { i.policy.policy_version = "unknown"; }, i => { i.bank.records.push(syntheticWord(1, { approved_record_version: "v2" })); },
    i => { i.precedence.candidate_order.reverse(); }, i => { i.context.review_status = "pending"; },
    i => { i.identity_map.links[0].review_status = "pending"; }, i => { i.exclusions.entries.push({ candidate_ref: candidateRef(i.bank.records[0]), reason: "editorial_exclusion" }); }]) {
    const i = fixture(), store = createSyntheticWordStore(identityRef), reserved = await run(store, i, "reserve");
    const changed = clone(i); change(changed);
    assert.equal((await run(store, changed, "authorize", { assignment_id: reserved.assignment.assignment_id, decision: yes })).reason, "assignment_approval_unavailable");
    assert.equal((await store.readHistory()).revision, 2);
  }
});
await check("same-identity version correction is distinct from a fresh daily assignment", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef), a = await assigned(store, i, true);
  const history = await store.readHistory();
  const corrected = syntheticWord(1, { approved_record_version: "v2", corrected_copy: "synthetic reviewed correction" });
  const result = await run(store, i, "correct", { assignment_id: a.assignment_id, decision: yes, corrects_event_id: history.events.at(-1).event_id, corrected_record_snapshot: corrected });
  assert.equal(result.status, "committed");
  const after = await store.readHistory(); assert.deepEqual(after.events.slice(0, history.events.length), history.events);
  assert.equal(after.events.at(-1).corrected_record_snapshot.approved_record_version, "v2");
  assert.equal(selectDailyWord(await fresh(store, i)).assignment.snapshot.approved_record_version, "v1");
});
await check("correction cannot consume another date's reserved identity", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef), a = await assigned(store, i, true);
  const publicationId = (await store.readHistory()).events.at(-1).event_id;
  assert.equal((await run(store, tomorrow(i), "reserve")).status, "committed");
  const before = await store.readHistory();
  assert.equal((await run(store, i, "correct", { assignment_id: a.assignment_id, decision: yes, corrects_event_id: publicationId, corrected_record_snapshot: syntheticWord(2) })).reason, "invalid_history");
  assert.deepEqual(await store.readHistory(), before);
});
await check("superseded correction links and fabricated history metadata fail closed", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef), a = await assigned(store, i, true);
  const publicationId = (await store.readHistory()).events.at(-1).event_id;
  assert.equal((await run(store, i, "correct", { assignment_id: a.assignment_id, decision: yes, corrects_event_id: publicationId, corrected_record_snapshot: syntheticWord(2) })).status, "committed");
  assert.equal((await run(store, i, "correct", { assignment_id: a.assignment_id, decision: yes, corrects_event_id: publicationId, corrected_record_snapshot: syntheticWord(3) })).reason, "invalid_history");
  const fake = await fresh(store, i); fake.history.identity_snapshot_ref = "fake";
  assert.equal((await executeWordAssignment({ adapter: store, authorization: auth, command: command("reserve"), selection_input: fake })).reason, "stale_history");
});
await check("capability denial, invalid command and unauthorized transition cannot mutate store", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef);
  assert.equal((await run(store, i, "reserve", {}, { ...auth, capabilities: [] })).reason, "authorization_unavailable");
  assert.equal((await run(store, i, "reserve", { timestamp: "invalid" })).reason, "invalid_assignment_command");
  assert.equal((await run(store, i, "authorize", { assignment_id: "missing", decision: yes })).reason, "assignment_unavailable");
  const r = await run(store, i, "reserve");
  assert.equal((await run(store, i, "record_publication", { assignment_id: r.assignment.assignment_id, decision: yes })).reason, "invalid_assignment_transition");
  assert.equal((await store.readHistory()).revision, 2);
});
await check("every persisted synthetic event and returned envelope stays internal-only", async () => {
  const i = fixture(), store = createSyntheticWordStore(identityRef), a = await assigned(store, i, true);
  const outputs = [selectDailyWord(fixture()), selectDailyWord(await fresh(store, i)),
    await run(store, i, "withdraw", { assignment_id: a.assignment_id, decision: yes })];
  for (const r of outputs) { assert.equal(r.public_output_allowed, false); assert.equal(r.runtime_activation, false); }
  for (const e of (await store.readHistory()).events) { assert.equal(e.public_output_allowed, false); assert.equal(e.runtime_activation, false); }
});
await check("host timezone does not alter exact selected proposal bytes", () => {
  const input = fixture();
  const script = `import {selectDailyWord,canonicalJson} from './scripts/lib/ag70d-word-selection-engine.mjs';console.log(canonicalJson(selectDailyWord(JSON.parse(process.argv[1]))));`;
  const outputs = ["UTC", "Asia/Kolkata", "America/Los_Angeles"].map(TZ => execFileSync(process.execPath, ["--input-type=module", "-e", script, JSON.stringify(input)], { encoding: "utf8", env: { ...process.env, TZ } }));
  assert.equal(outputs[0], outputs[1]); assert.equal(outputs[1], outputs[2]);
});
await check("actual AG70E content, evidence and history banks stay empty and byte-identical", () => {
  const root = "data/knowledge-base/word-of-day/production/knowledge-bank/";
  for (const file of ["approved-output-candidate-bank.json", "daily-word-history-bank.json", "duplicate-control-history-bank.json", "morphology-production-bank.json", "semantics-production-bank.json", "etymology-production-bank.json", "lexical-source-evidence-map.json", "sacred-fallback-production-bank.json"]) {
    const p = root + file, data = fs.readFileSync(p, "utf8"); assert.deepEqual(JSON.parse(data).records, []);
    assert.equal(data, execFileSync("git", ["show", baseline + ":" + p], { encoding: "utf8" }));
  }
  assert.equal(fs.readFileSync(policyPath, "utf8"), execFileSync("git", ["show", baseline + ":" + policyPath], { encoding: "utf8" }));
  const dossier = JSON.parse(fs.readFileSync("data/content-intelligence/quality-reviews/f3b2-word-activities-evidence-dossier.json", "utf8"));
  assert(dossier.words.every(w => w.production_approved === false && w.public_use_permission === "not_allowed"));
});
console.log(`F3B-6/F3B-8 validation passed: ${checks} checks. All content/approvals fictional; concurrency and crash recovery simulated in memory, NOT verified against PostgreSQL. No production writes or public activation.`);
