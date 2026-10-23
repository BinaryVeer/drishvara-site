import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

// Synthetic, in-memory contract model only. No production bank, writer or selector imports.
const policy = JSON.parse(fs.readFileSync("data/knowledge-base/word-of-day/production/methodology/ag70d-duplicate-control-and-history-rules.json", "utf8"));
const clone = value => structuredClone(value);
const freeze = value => {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const result = (status, fields = {}) => ({ ...fields, status, synthetic_fixture: true, public_output_allowed: false });
const rules = { version: policy.policy_version, approved: true, context: "synthetic-approved-canonical-context", precedence: "synthetic-approved-precedence" };
const request = (timestamp = "2026-10-23T10:00:00Z", extra = {}) => ({ timestamp, bankSnapshot: "synthetic-bank-v1", ...extra });
const word = (n, extra = {}) => ({
  id: `synthetic-word-${n}`, canonicalId: `synthetic-lexeme-${n}`, group: `synthetic-equivalence-${n}`,
  version: 1, approved: true, approvalRefs: ["synthetic-linguistic-and-editorial-approval"],
  sourceRefs: ["synthetic-source-evidence"], identityReviewed: true, equivalenceReviewed: true,
  applicable: true, rank: n, ...extra
});
const ledger = () => ({ available: true, complete: true, revision: 0, reservations: new Map(), assignments: new Map(), events: [] });

function canonicalDate(timestamp) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.exec(timestamp ?? "");
  if (!m) return null;
  const [year, month, day, hour, minute, second] = m.slice(1).map(Number);
  const civil = new Date(Date.UTC(year, month - 1, day));
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime()) || civil.getUTCFullYear() !== year || civil.getUTCMonth() !== month - 1 || civil.getUTCDate() !== day || hour > 23 || minute > 59 || second > 59) return null;
  const parts = new Intl.DateTimeFormat("en", { timeZone: policy.publication_model.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const get = type => parts.find(p => p.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function planFixture(bank, state, input = request(), approvals = rules) {
  const date = canonicalDate(input.timestamp);
  const counts = { bank: bank.length, approved: 0, eligible: 0, unused: 0 };
  const withheld = reason => result("withheld", { reason, audit: { event_type: "withheld", date_key: date, counts, policy_version: policy.policy_version } });
  if (!date) return withheld("invalid_canonical_date");
  if (!state?.available) return withheld("history_unavailable");
  if (!state.complete) return withheld("history_incomplete");
  const key = `${policy.publication_model.scope}|${date}|${policy.publication_model.timezone}`;
  if (state.assignments.has(key)) return result("replay", { assignment: state.assignments.get(key) });
  if (state.reservations.has(key)) return withheld("assignment_in_progress");
  if (!approvals?.approved || approvals.version !== policy.policy_version || !approvals.precedence) return withheld("selection_rule_unavailable");
  if (!approvals.context) return withheld("canonical_context_unavailable");
  const approved = bank.filter(w => w.approved && w.approvalRefs?.length && w.sourceRefs?.length);
  counts.approved = approved.length;
  if (!approved.length) return withheld("approved_bank_empty");
  let eligible = approved.filter(w => !w.withdrawn && !w.revoked && !w.superseded && !w.excluded && w.applicable && w.identityReviewed && w.equivalenceReviewed && w.canonicalId && w.group);
  // Duplicate rows without an approved single representative are excluded, not auto-merged.
  const repeated = (field, value) => eligible.filter(w => w[field] === value).length > 1;
  eligible = eligible.filter(w => !repeated("canonicalId", w.canonicalId) && !repeated("group", w.group));
  const published = state.events.filter(e => ["published", "corrective_publication"].includes(e.type));
  const pending = [...state.reservations.values(), ...state.assignments.values()].filter(a => !published.some(e => e.assignmentId === a.id));
  const withoutPending = eligible.filter(w => !pending.some(a => a.record.canonicalId === w.canonicalId || a.record.group === w.group));
  if (eligible.length && !withoutPending.length) return withheld("assignment_in_progress");
  eligible = withoutPending;
  counts.eligible = eligible.length;
  if (!eligible.length) return withheld("eligible_bank_empty");
  let unused = eligible.filter(w => !published.some(e => e.record.canonicalId === w.canonicalId || e.record.group === w.group));
  counts.unused = unused.length;
  if (!unused.length) return withheld("no_unused_eligible_identity");
  unused = unused.filter(w => !w.repeatWindowExcluded);
  if (!unused.length) return withheld("eligible_bank_empty");
  if (unused.some(w => !Number.isFinite(w.rank))) return withheld("precedence_unresolved");
  unused = [...unused].sort((a, b) => a.rank - b.rank);
  if (unused.length > 1 && unused[0].rank === unused[1].rank) return withheld("precedence_unresolved");
  return result("proposal", { expectedRevision: state.revision, key, payload: freeze({
    id: `synthetic-assignment-${date}`, date_key: date, timezone: policy.publication_model.timezone,
    publication_scope: policy.publication_model.scope, policy_version: policy.policy_version,
    record: clone(unused[0]), bank_snapshot_ref: input.bankSnapshot, history_snapshot_ref: `synthetic-history-${state.revision}`,
    canonical_context_basis_ref: approvals.context, precedence_rule_ref: approvals.precedence,
    assignment_timestamp: input.timestamp, public_output_allowed: false
  }) });
}

function reserveFixture(state, proposal) {
  if (proposal.status !== "proposal") return proposal;
  if (proposal.expectedRevision !== state.revision) return result("withheld", { reason: "history_revision_conflict" });
  if (state.assignments.has(proposal.key) || state.reservations.has(proposal.key)) return result("withheld", { reason: "assignment_in_progress" });
  state.reservations.set(proposal.key, proposal.payload);
  state.events.push(freeze({ type: "draft_reservation", eventId: `synthetic-event-${state.revision}`, assignmentId: proposal.payload.id, record: clone(proposal.payload.record) }));
  state.revision++;
  return result("draft_reservation", { key: proposal.key, assignment: proposal.payload });
}

function assignFixture(state, reservation) {
  if (reservation.status !== "draft_reservation" || state.reservations.get(reservation.key) !== reservation.assignment) return result("withheld", { reason: "assignment_in_progress" });
  state.assignments.set(reservation.key, reservation.assignment);
  state.reservations.delete(reservation.key);
  state.events.push(freeze({ type: "approved_assignment", eventId: `synthetic-event-${state.revision}`, assignmentId: reservation.assignment.id, record: clone(reservation.assignment.record) }));
  state.revision++;
  return result("approved_assignment", { assignment: reservation.assignment });
}

function publishFixture(state, assignment, bank, timestamp) {
  const current = bank.find(w => w.id === assignment.record.id && w.version === assignment.record.version);
  if (!current?.approved || !current.approvalRefs?.length || current.revoked || current.withdrawn || current.superseded) return result("withheld", { reason: "eligible_bank_empty" });
  if (state.events.some(e => e.type === "published" && e.assignmentId === assignment.id)) return result("replay", { assignment });
  const event = freeze({ type: "published", eventId: `synthetic-event-${state.revision}`, assignmentId: assignment.id,
    record: clone(assignment.record), publication_timestamp: timestamp, public_output_allowed: false });
  state.events.push(event);
  state.revision++;
  return result("published", { event });
}

function publishNextFixture(state, bank, input = request()) {
  const planned = planFixture(bank, state, input);
  if (planned.status !== "proposal") return planned;
  const assigned = assignFixture(state, reserveFixture(state, planned));
  if (assigned.status !== "approved_assignment") return assigned;
  return publishFixture(state, assigned.assignment, bank, input.timestamp);
}

function correctFixture(state, original, replacement, approval) {
  if (!approval?.authorized || !approval.ref || !state.events.includes(original) || original.type !== "published" || !replacement.approved || replacement.revoked || !replacement.approvalRefs?.length) {
    return result("withheld", { reason: "selection_rule_unavailable" });
  }
  const event = freeze({ type: "corrective_publication", eventId: `synthetic-correction-${state.revision}`,
    corrects_publication_id: original.eventId, correction_approval_ref: approval.ref,
    assignmentId: original.assignmentId, record: clone(replacement), public_output_allowed: false });
  state.events.push(event);
  state.revision++;
  return result("corrective_publication", { event });
}

let checks = 0;
function check(name, run) { run(); checks++; console.log("PASS synthetic policy fixture: " + name); }
check("same canonical date and different user locations replay one frozen assignment", () => {
  const state = ledger(), bank = [word(1), word(2)];
  publishNextFixture(state, bank);
  const before = JSON.stringify(state.events);
  const a = planFixture(bank, state, request("2026-10-23T11:00:00Z", { userLocation: "Tokyo", userTimezone: "Asia/Tokyo", language: "hi" }));
  const b = planFixture(bank, state, request("2026-10-23T12:00:00Z", { userLocation: "Varanasi", language: "en" }));
  assert.equal(a.status, "replay"); assert.equal(a.assignment, b.assignment);
  assert.equal(state.assignments.size, 1); assert.equal(JSON.stringify(state.events), before);
});
check("two stale same-date proposals cannot both reserve or assign", () => {
  const state = ledger(), bank = [word(1), word(2)];
  const a = planFixture(bank, state), b = planFixture(bank, state);
  const reserved = reserveFixture(state, a);
  assert.equal(reserved.status, "draft_reservation");
  assert.equal(reserveFixture(state, b).reason, "history_revision_conflict");
  assert.equal(planFixture(bank, state).reason, "assignment_in_progress");
  assignFixture(state, reserved);
  assert.equal(planFixture(bank, state).status, "replay"); assert.equal(state.assignments.size, 1);
});
check("equivalent identities without a resolved representative are excluded", () => {
  const bank = [word(1, { group: "synthetic-same" }), word(2, { group: "synthetic-same" })];
  assert.equal(planFixture(bank, ledger()).reason, "eligible_bank_empty");
});
check("unused choices obey explicit fixture precedence independent of caller order", () => {
  const bank = [word(3), word(1), word(2)];
  assert.equal(planFixture(bank, ledger()).payload.record.id, "synthetic-word-1");
  assert.deepEqual(planFixture(bank, ledger()), planFixture([...bank].reverse(), ledger()));
});
check("published preferred word loses to unused alternative across calendar years", () => {
  const state = ledger(), bank = [word(1), word(2)];
  publishNextFixture(state, bank, request("2025-12-31T10:00:00Z"));
  assert.equal(planFixture(bank, state, request("2026-01-01T10:00:00Z")).payload.record.id, "synthetic-word-2");
});
for (const count of policy.scale_contract.approved_word_checkpoints) check(`${count} synthetic identities fit without a 365 reset or cap`, () => {
  const bank = Array.from({ length: count }, (_, i) => word(i + 1)), state = ledger();
  for (let i = 0; i < count - 1; i++) state.events.push(freeze({ type: "published", eventId: `synthetic-prior-${i}`, assignmentId: `synthetic-prior-assignment-${i}`, record: clone(bank[i]) }));
  state.revision = state.events.length;
  assert.equal(planFixture(bank, state).payload.record.id, `synthetic-word-${count}`);
});
check("new approvals affect only future unassigned dates, never replay snapshots", () => {
  const state = ledger(), bank = [word(2)];
  publishNextFixture(state, bank);
  const original = planFixture(bank, state).assignment, bytes = JSON.stringify(original);
  const expanded = [word(1), ...bank];
  assert.equal(planFixture(expanded, state).assignment, original);
  assert.equal(JSON.stringify(original), bytes);
  assert.equal(planFixture(expanded, state, request("2026-10-24T10:00:00Z", { bankSnapshot: "synthetic-bank-v2" })).payload.record.id, "synthetic-word-1");
  assert.throws(() => { original.record.approvalRefs.push("mutation"); }, TypeError);
});
check("empty approved bank and excluded eligible bank have distinct reasons", () => {
  assert.equal(planFixture([], ledger()).reason, "approved_bank_empty");
  assert.equal(planFixture([word(1, { applicable: false })], ledger()).reason, "eligible_bank_empty");
});
check("exhaustion withholds with a non-public reason and never least-recent reuses", () => {
  const state = ledger(), bank = [word(1)]; publishNextFixture(state, bank);
  const result = planFixture(bank, state, request("2027-10-23T10:00:00Z"));
  assert.equal(result.status, "withheld"); assert.equal(result.reason, "no_unused_eligible_identity");
  assert.equal(result.audit.event_type, "withheld"); assert.equal(result.public_output_allowed, false);
  assert.equal(state.assignments.size, 1);
});
check("missing and incomplete history cannot masquerade as an empty history", () => {
  assert.equal(planFixture([word(1)], null).reason, "history_unavailable");
  assert.equal(planFixture([word(1)], { ...ledger(), complete: false }).reason, "history_incomplete");
});
check("missing policy, canonical context or precedence cannot choose a word", () => {
  assert.equal(planFixture([word(1)], ledger(), request(), null).reason, "selection_rule_unavailable");
  assert.equal(planFixture([word(1)], ledger(), request(), { ...rules, context: null }).reason, "canonical_context_unavailable");
  assert.equal(planFixture([word(1)], ledger(), request(), { ...rules, precedence: null }).reason, "selection_rule_unavailable");
  assert.equal(planFixture([word(1), word(2, { rank: 1 })], ledger()).reason, "precedence_unresolved");
});
check("superseded, revoked and withdrawn approvals cannot enter a new assignment", () => {
  const bank = [word(1, { revoked: true }), word(2, { superseded: true }), word(3, { withdrawn: true }), word(4)];
  assert.equal(planFixture(bank, ledger()).payload.record.id, "synthetic-word-4");
  assert.equal(planFixture([word(1, { approvalRefs: [] })], ledger()).reason, "approved_bank_empty");
});
check("approval revocation after assignment blocks publication without deleting history", () => {
  const state = ledger(), bank = [word(1)];
  const assignment = assignFixture(state, reserveFixture(state, planFixture(bank, state))).assignment;
  const before = JSON.stringify(state.events);
  assert.equal(publishFixture(state, assignment, [{ ...bank[0], revoked: true }], "2026-10-23T12:00:00Z").status, "withheld");
  assert.equal(JSON.stringify(state.events), before); assert.equal(state.assignments.size, 1);
});
check("IST civil midnight, not user timezone or sunrise, determines the date", () => {
  assert.equal(canonicalDate("2026-10-22T18:29:59Z"), "2026-10-22");
  assert.equal(canonicalDate("2026-10-22T18:30:00Z"), "2026-10-23");
  assert.equal(canonicalDate("2026-10-23T00:00:00+05:30"), "2026-10-23");
  assert.equal(planFixture([word(1)], ledger(), request("2026-02-30T10:00:00Z")).reason, "invalid_canonical_date");
});
check("reviewed equivalent of an already published identity is not an unused import", () => {
  const state = ledger(); publishNextFixture(state, [word(1, { group: "synthetic-reviewed-same" })]);
  const alias = word(2, { group: "synthetic-reviewed-same" });
  assert.equal(planFixture([alias, word(3)], state, request("2026-10-24T10:00:00Z")).payload.record.id, "synthetic-word-3");
});
check("compatible repeat-window exclusion never restores a used identity", () => {
  const state = ledger(); publishNextFixture(state, [word(1)]);
  const result = planFixture([word(1), word(2, { repeatWindowExcluded: true })], state, request("2026-10-24T10:00:00Z"));
  assert.equal(result.status, "withheld"); assert.equal(result.reason, "eligible_bank_empty");
});
check("corrective publication appends approved evidence without overwriting original history", () => {
  const state = ledger(); const first = publishNextFixture(state, [word(1)]).event;
  const original = JSON.stringify(first), assignment = JSON.stringify([...state.assignments.values()]);
  // A correction is its own explicitly approved synthetic event, not a second date assignment.
  const before = JSON.stringify(state.events);
  assert.equal(correctFixture(state, first, word(2), null).status, "withheld");
  assert.equal(JSON.stringify(state.events), before);
  const corrected = correctFixture(state, first, word(2), { authorized: true, ref: "synthetic-explicit-correction-approval" });
  assert.equal(corrected.status, "corrective_publication");
  assert.equal(corrected.event.corrects_publication_id, first.eventId);
  assert.equal(JSON.stringify(first), original); assert.equal(JSON.stringify([...state.assignments.values()]), assignment);
  assert.equal(state.events.filter(e => ["published", "corrective_publication"].includes(e.type)).length, 2);
  assert.equal(planFixture([word(1), word(2), word(3)], state, request("2026-10-24T10:00:00Z")).payload.record.id, "synthetic-word-3");
});
check("obsolete foundation generator stops before writes, other reads or commands", () => {
  const source = fs.readFileSync("scripts/generate-ag70d-word-methodology-supersession.mjs", "utf8").replace(/^import .*;\n/gm, "");
  let reads = 0, writes = 0, commands = 0;
  const guardedPath = "/synthetic-repo/data/knowledge-base/word-of-day/production/methodology/ag70d-duplicate-control-and-history-rules.json";
  const fakeFs = {
    existsSync: p => p === guardedPath,
    readFileSync: p => { reads++; assert.equal(p, guardedPath); return JSON.stringify(policy); },
    mkdirSync: () => { writes++; throw new Error("unexpected directory write"); },
    writeFileSync: () => { writes++; throw new Error("unexpected file write"); }
  };
  assert.throws(() => vm.runInNewContext(source, { fs: fakeFs, path, process: { cwd: () => "/synthetic-repo" },
    execSync: () => { commands++; throw new Error("unexpected command"); } }), /foundation generator cannot overwrite a versioned selection policy/);
  assert.equal(reads, 1); assert.equal(writes, 0); assert.equal(commands, 0);
});
console.log(`AG70D policy fixtures passed: ${checks} synthetic checks. Concurrency is modeled with revision checks, not a production persistence guarantee. No files or production records were written.`);
