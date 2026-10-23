import { createHash } from "node:crypto";

export const WORD_CONTRACT = "ag70d.word-assignment.v1";
export const WORD_POLICY = "ag70d.word-selection.v2.1";
export const WORD_EVENT = "ag70d.word-event.v1";
export const WORD_SCOPE = "global_public_word";
export const WORD_TIMEZONE = "Asia/Kolkata";

// JSON-only snapshots: no getters, executable values, implicit dates or caller key order.
export function canonicalJson(value) {
  const seen = new Set();
  function normalize(v) {
    if (v === null || typeof v === "string" || typeof v === "boolean") return v;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (!v || typeof v !== "object" || seen.has(v)) throw new Error("invalid_json_snapshot");
    if (!Array.isArray(v) && ![Object.prototype, null].includes(Object.getPrototypeOf(v))) throw new Error("invalid_json_snapshot");
    seen.add(v);
    const descriptors = Object.getOwnPropertyDescriptors(v);
    if (Reflect.ownKeys(v).some(k => typeof k !== "string" || descriptors[k].get || descriptors[k].set)) throw new Error("invalid_json_snapshot");
    let result;
    if (Array.isArray(v)) {
      if (Object.keys(v).length !== v.length) throw new Error("invalid_json_snapshot");
      result = v.map(normalize);
    } else {
      result = Object.fromEntries(Object.keys(v).sort().map(k => [k, normalize(v[k])]));
    }
    seen.delete(v);
    return result;
  }
  return JSON.stringify(normalize(value));
}

export const snapshotHash = value => "sha256:" + createHash("sha256").update(canonicalJson(value)).digest("hex");
export const copySnapshot = value => JSON.parse(canonicalJson(value));
export const internalResult = (status, fields = {}) => ({ ...fields, status, public_output_allowed: false, runtime_activation: false });
export const nonempty = value => typeof value === "string" && value.trim() === value && value.length > 0;
export const approved = value => value?.review_status === "approved" && nonempty(value.approval_ref);
export const candidateRef = record => record.output_candidate_id + "@" + record.approved_record_version;
export const dateScopeKey = (date, scope = WORD_SCOPE, timezone = WORD_TIMEZONE) => canonicalJson([scope, date, timezone]);

export function validCivilDate(value) {
  if (typeof value !== "string" || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value) || value.startsWith("0000")) return false;
  const parsed = new Date(value + "T00:00:00.000Z");
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validTimestamp(value) {
  if (typeof value !== "string" || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/.test(value)) return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && !value.startsWith("0000") && parsed.toISOString() === value;
}

export function canonicalPublicationDate(timestamp) {
  if (!validTimestamp(timestamp)) return null;
  const parts = new Intl.DateTimeFormat("en", { timeZone: WORD_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(timestamp));
  const get = type => parts.find(p => p.type === type).value;
  const date = `${get("year").padStart(4, "0")}-${get("month")}-${get("day")}`;
  return validCivilDate(date) ? date : null;
}

export function validApprovedRecord(record) {
  return record && nonempty(record.output_candidate_id) && nonempty(record.selected_word_id) && nonempty(record.approved_record_version) &&
    nonempty(record.canonical_lexical_identity_id) && nonempty(record.equivalence_group_id) && nonempty(record.lemma_id) &&
    record.selection_path === "primary_lexical" && nonempty(record.context_signal_id) &&
    ["withdrawn", "revoked", "superseded"].every(k => record[k] === undefined || typeof record[k] === "boolean") &&
    record.production_approved === true && record.approved_for_daily_output === true && record.review_status === "approved" &&
    record.public_use_permission === "approved_for_output" && ["established", "review_approved"].includes(record.morphology_status) &&
    record.semantics_status === "supported" && record.etymology_status === "established" &&
    Array.isArray(record.approval_record_refs) && record.approval_record_refs.length > 0 && record.approval_record_refs.every(nonempty) &&
    Array.isArray(record.source_evidence) && record.source_evidence.length > 0 && record.source_evidence.every(e => nonempty(e.evidence_ref) && e.review_status === "approved");
}

export function validAssignment(snapshot) {
  if (!snapshot || snapshot.contract_version !== WORD_CONTRACT || snapshot.selection_policy_version !== WORD_POLICY ||
      !validCivilDate(snapshot.date_key) || snapshot.timezone !== WORD_TIMEZONE || snapshot.publication_scope !== WORD_SCOPE ||
      !validTimestamp(snapshot.created_at) || !validApprovedRecord(snapshot.approved_record_snapshot) ||
      snapshot.public_output_allowed !== false || snapshot.runtime_activation !== false) return false;
  for (const key of ["context_version", "canonical_context_basis_ref", "context_snapshot_ref", "precedence_version", "precedence_rule_ref", "identity_snapshot_ref", "bank_snapshot_ref", "history_snapshot_ref", "context_content_hash", "precedence_content_hash", "identity_content_hash", "exclusions_content_hash"]) {
    if (!nonempty(snapshot[key])) return false;
  }
  return Number.isSafeInteger(snapshot.history_revision) && snapshot.history_revision >= 0 && Array.isArray(snapshot.trace) &&
    snapshot.canonical_lexical_identity_id === snapshot.approved_record_snapshot.canonical_lexical_identity_id &&
    snapshot.approved_record_version === snapshot.approved_record_snapshot.approved_record_version &&
    canonicalJson(snapshot.source_evidence_refs) === canonicalJson(snapshot.approved_record_snapshot.source_evidence.map(e => e.evidence_ref).sort()) &&
    canonicalJson(snapshot.approval_record_refs) === canonicalJson([...snapshot.approved_record_snapshot.approval_record_refs].sort());
}

export function proposalFor(snapshot) {
  return {
    assignment_id: "word-assignment:" + snapshotHash(dateScopeKey(snapshot.date_key)),
    proposal_id: "word-proposal:" + snapshotHash(snapshot),
    snapshot: copySnapshot(snapshot)
  };
}

// Reduce the complete append-only ledger; no caller-supplied active/used projections are trusted.
export function inspectWordHistory(history) {
  const invalid = reason => ({ ok: false, reason });
  if (!history || history.available !== true) return invalid("history_unavailable");
  if (history.complete !== true) return invalid("history_incomplete");
  try {
    canonicalJson(history);
    if (history.contract_version !== WORD_CONTRACT || !Number.isSafeInteger(history.revision) || history.revision < 0 ||
        !Array.isArray(history.events) || history.events.length !== history.revision ||
        history.snapshot_ref !== snapshotHash(history.events) || !nonempty(history.identity_snapshot_ref)) return invalid("history_incomplete");
    const assignments = new Map(), dates = new Map(), ids = new Set(), commands = new Set(), used = [], revoked = new Set();
    for (const [i, e] of history.events.entries()) {
      if (e.event_version !== WORD_EVENT || e.sequence !== i + 1 || !nonempty(e.event_id) || ids.has(e.event_id) ||
          !nonempty(e.command_id) || commands.has(e.command_id) || !nonempty(e.request_hash) || !nonempty(e.authorization_ref) ||
          !validTimestamp(e.timestamp) || (i && e.timestamp < history.events[i - 1].timestamp) ||
          e.public_output_allowed !== false || e.runtime_activation !== false || !Array.isArray(e.parent_event_refs) ||
          !e.parent_event_refs.every(ref => ids.has(ref))) return invalid("invalid_history");
      const a = assignments.get(e.assignment_id);
      if (e.event_type === "selection_proposal") {
        const p = e.proposal;
        if (!validAssignment(p?.snapshot) || p.snapshot.identity_snapshot_ref !== history.identity_snapshot_ref ||
            canonicalJson(p) !== canonicalJson(proposalFor(p.snapshot)) || p.assignment_id !== e.assignment_id ||
            p.snapshot.created_at > e.timestamp || p.snapshot.history_revision !== i || p.snapshot.history_snapshot_ref !== snapshotHash(history.events.slice(0, i)) ||
            a && a.state !== "cancelled_reservation") return invalid("invalid_history");
        const key = dateScopeKey(p.snapshot.date_key);
        if (dates.has(key)) return invalid("conflicting_assignment");
        const r = p.snapshot.approved_record_snapshot;
        if (used.some(u => sameIdentity(u, r)) || [...assignments.values()].some(v => v.state !== "cancelled_reservation" && sameIdentity(v.proposal.snapshot.approved_record_snapshot, r))) return invalid("conflicting_assignment");
        assignments.set(e.assignment_id, { proposal: p, state: "selection_proposal", last_event_id: e.event_id, correction_events: [] });
        dates.set(key, e.assignment_id);
      } else {
        if (!a || !e.parent_event_refs.includes(a.last_event_id)) return invalid("invalid_history");
        const allowed = {
          reservation: ["selection_proposal"], authorized_assignment: ["reservation"], publication: ["authorized_assignment"],
          correction: ["publication", "correction"], withdrawal: ["authorized_assignment", "publication", "correction"],
          supersession: ["authorized_assignment", "publication", "correction"], cancelled_reservation: ["reservation"]
        };
        if (!allowed[e.event_type]?.includes(a.state)) return invalid("invalid_history");
        if (["authorized_assignment", "publication", "correction", "withdrawal", "supersession"].includes(e.event_type) && !nonempty(e.decision_approval_ref)) return invalid("invalid_history");
        if (e.event_type === "supersession" && !nonempty(e.supersession_ref)) return invalid("invalid_history");
        if (e.event_type === "publication") used.push({ ...a.proposal.snapshot.approved_record_snapshot, usage_assignment_id: e.assignment_id });
        if (e.event_type === "correction") {
          if (!validApprovedRecord(e.corrected_record_snapshot) || !nonempty(e.corrects_event_id) ||
              (a.correction_events.at(-1) ?? a.publication_event_id) !== e.corrects_event_id ||
              [...assignments.entries()].some(([id, other]) => id !== e.assignment_id && other.state !== "cancelled_reservation" && sameIdentity(other.proposal.snapshot.approved_record_snapshot, e.corrected_record_snapshot)) ||
              used.some(u => u.usage_assignment_id !== e.assignment_id && sameIdentity(u, e.corrected_record_snapshot))) return invalid("invalid_history");
          used.push({ ...e.corrected_record_snapshot, usage_assignment_id: e.assignment_id });
          a.correction_events.push(e.event_id);
        }
        if (e.event_type === "publication") a.publication_event_id = e.event_id;
        if (["withdrawal", "supersession"].includes(e.event_type)) revoked.add(e.assignment_id);
        if (e.event_type === "cancelled_reservation") dates.delete(dateScopeKey(a.proposal.snapshot.date_key));
        a.state = e.event_type;
        a.last_event_id = e.event_id;
      }
      ids.add(e.event_id); commands.add(e.command_id);
    }
    if ([...assignments.values()].some(a => a.state === "selection_proposal")) return invalid("history_incomplete");
    return { ok: true, assignments, dates, used, revoked };
  } catch { return invalid("invalid_history"); }
}

export function sameIdentity(a, b) {
  return ["canonical_lexical_identity_id", "equivalence_group_id", "lemma_id"].some(k => a[k] === b[k]);
}

const knownInputKeys = ["contract_version", "date_key", "timezone", "publication_scope", "created_at", "policy", "context", "precedence", "identity_map", "bank", "history", "expected_history_ref", "exclusions"];

// Shared structural/approval checks for selection and later assignment authorization.
export function inspectSelectionInputs(input) {
  const { policy, context, precedence, identity_map: identities, bank, exclusions } = input;
  const invalid = reason => ({ ok: false, reason });
  if (policy?.policy_version !== WORD_POLICY || policy?.publication_model?.timezone !== WORD_TIMEZONE || policy?.publication_model?.scope !== WORD_SCOPE ||
      policy?.eligible_pool_rules?.unused_first !== true || policy?.eligible_pool_rules?.annual_reset_allowed !== false ||
      policy?.eligible_pool_rules?.repeat_window_expiry_restores_used_identity !== false || policy?.exhaustion_policy?.automatic_reuse_allowed !== false || policy?.exhaustion_policy?.initial_action !== "withhold") return invalid("selection_rule_unavailable");
  if (!approved(context) || !nonempty(context.version) || !nonempty(context.snapshot_ref) || context.date_key !== input.date_key ||
      !nonempty(policy.publication_model.canonical_context_basis_ref) || policy.publication_model.canonical_context_basis_ref !== context.basis_ref ||
      !Array.isArray(context.eligible_candidate_refs) || !context.eligible_candidate_refs.every(nonempty)) return invalid("canonical_context_unavailable");
  if (!approved(precedence) || !nonempty(precedence.version) || policy.approved_precedence_rule_ref !== precedence.rule_ref || !nonempty(precedence.rule_ref) ||
      precedence.operator !== "approved_explicit_candidate_order" || !Array.isArray(precedence.candidate_order)) return invalid("selection_rule_unavailable");
  if (!precedence.candidate_order.every(nonempty) || new Set(precedence.candidate_order).size !== precedence.candidate_order.length) return invalid("precedence_unresolved");
  if (!approved(identities) || !nonempty(identities.version) || identities.snapshot_ref !== input.history?.identity_snapshot_ref || !Array.isArray(identities.links)) return invalid("ambiguous_lexical_equivalence");
  if (!bank || !nonempty(bank.snapshot_ref) || !nonempty(bank.version) || !Array.isArray(bank.records)) return invalid("approved_bank_empty");
  if (!approved(exclusions) || !Array.isArray(exclusions.entries) || exclusions.entries.some(e => !nonempty(e.candidate_ref) || !["editorial_exclusion", "repeat_window_exclusion"].includes(e.reason))) return invalid("invalid_exclusions");
  const records = [...bank.records].sort((a, b) => canonicalJson(a) < canonicalJson(b) ? -1 : canonicalJson(a) > canonicalJson(b) ? 1 : 0);
  const refs = new Set(), versions = new Set();
  for (const r of records) {
    if (!nonempty(r.output_candidate_id) || !nonempty(r.approved_record_version) || refs.has(candidateRef(r)) || versions.has(r.output_candidate_id)) return invalid("conflicting_approved_records");
    refs.add(candidateRef(r)); versions.add(r.output_candidate_id);
  }
  const links = new Map();
  for (const link of identities.links) {
    if (!approved(link) || !["candidate_ref", "canonical_lexical_identity_id", "equivalence_group_id", "lemma_id", "representative_candidate_ref"].every(k => nonempty(link[k])) || links.has(link.candidate_ref)) return invalid("ambiguous_lexical_equivalence");
    links.set(link.candidate_ref, link);
  }
  for (const link of links.values()) {
    if (links.get(link.representative_candidate_ref)?.equivalence_group_id !== link.equivalence_group_id) return invalid("ambiguous_lexical_equivalence");
  }
  for (const field of ["canonical_lexical_identity_id", "equivalence_group_id", "lemma_id"]) {
    const representatives = new Map();
    for (const link of links.values()) {
      if (representatives.has(link[field]) && representatives.get(link[field]) !== link.representative_candidate_ref) return invalid("ambiguous_lexical_equivalence");
      representatives.set(link[field], link.representative_candidate_ref);
    }
  }
  return { ok: true, records, links };
}

export function selectionAuthorityHashes(input) {
  const sortedRows = rows => [...rows].sort((a, b) => canonicalJson(a) < canonicalJson(b) ? -1 : canonicalJson(a) > canonicalJson(b) ? 1 : 0);
  return {
    context_content_hash: snapshotHash({ ...input.context, eligible_candidate_refs: [...input.context.eligible_candidate_refs].sort() }),
    precedence_content_hash: snapshotHash(input.precedence),
    identity_content_hash: snapshotHash({ ...input.identity_map, links: sortedRows(input.identity_map.links) }),
    exclusions_content_hash: snapshotHash({ ...input.exclusions, entries: sortedRows(input.exclusions.entries) })
  };
}

export function selectDailyWord(input) {
  const trace = [];
  let references = { selection_policy_version: WORD_POLICY };
  const withheld = reason => internalResult("withheld", { reason, trace, ...references });
  try {
    canonicalJson(input);
    if (!input || Object.keys(input).some(k => !knownInputKeys.includes(k)) || input.contract_version !== WORD_CONTRACT) return withheld("invalid_input_contract");
    references = { ...references, history_snapshot_ref: input.history?.snapshot_ref ?? null,
      context_version: input.context?.version ?? null, precedence_version: input.precedence?.version ?? null,
      bank_snapshot_ref: input.bank?.snapshot_ref ?? null, identity_snapshot_ref: input.identity_map?.snapshot_ref ?? null };
    if (!validCivilDate(input.date_key)) return withheld("invalid_canonical_date");
    if (input.timezone !== WORD_TIMEZONE) return withheld("invalid_timezone");
    if (input.publication_scope !== WORD_SCOPE) return withheld("invalid_publication_scope");
    if (!validTimestamp(input.created_at)) return withheld("invalid_timestamp");
    const h = inspectWordHistory(input.history);
    if (!h.ok) return withheld(h.reason);
    if (input.expected_history_ref !== input.history.snapshot_ref) return withheld("stale_history");
    const existing = h.assignments.get(h.dates.get(dateScopeKey(input.date_key)));
    if (existing) {
      if (existing.state === "reservation") return withheld("assignment_in_progress");
      return internalResult("replay", { assignment: copySnapshot(existing.proposal), history_state: existing.state, publication_withheld: true, trace: [{ reason: "immutable_assignment_replayed_not_publication_permission" }] });
    }
    const { context, precedence, identity_map: identities, bank, exclusions } = input;
    const inspected = inspectSelectionInputs(input);
    if (!inspected.ok) return withheld(inspected.reason);
    const { records, links } = inspected;
    let approvedCount = 0, eligibleCount = 0, unusedCount = 0;
    const pool = [];
    for (const r of records) {
      const ref = candidateRef(r), link = links.get(ref);
      let reason;
      if (!validApprovedRecord(r)) reason = "record_approval_or_evidence_missing";
      else {
        approvedCount++;
        if (r.withdrawn === true || r.revoked === true || r.superseded === true) reason = "record_withdrawn_revoked_or_superseded";
        else if (!context.eligible_candidate_refs.includes(ref)) reason = "outside_approved_context";
        else if (!link || !["canonical_lexical_identity_id", "equivalence_group_id", "lemma_id"].every(k => link[k] === r[k])) reason = "ambiguous_lexical_equivalence";
        else if (link.representative_candidate_ref !== ref) reason = "reviewed_equivalent_not_representative";
        else if (exclusions.entries.some(e => e.candidate_ref === ref && e.reason === "editorial_exclusion")) reason = "editorial_exclusion";
        else if ([...h.assignments.values()].some(a => a.state !== "cancelled_reservation" && !a.publication_event_id && sameIdentity(a.proposal.snapshot.approved_record_snapshot, r))) reason = "identity_reserved_or_assigned";
        else {
          eligibleCount++;
          if (h.used.some(u => sameIdentity(u, r))) reason = "already_published_identity_or_equivalent";
          else {
            unusedCount++;
            if (exclusions.entries.some(e => e.candidate_ref === ref && e.reason === "repeat_window_exclusion")) reason = "repeat_window_exclusion";
            else pool.push(r);
          }
        }
      }
      trace.push({ candidate_ref: ref, reason: reason ?? "unused_eligible", decision: reason ? "excluded" : "eligible" });
    }
    trace.sort((a, b) => a.candidate_ref < b.candidate_ref ? -1 : a.candidate_ref > b.candidate_ref ? 1 : 0);
    if (!approvedCount) return withheld("approved_bank_empty");
    if (!eligibleCount) return withheld(trace.some(t => t.reason === "ambiguous_lexical_equivalence") ? "ambiguous_lexical_equivalence" : "eligible_bank_empty");
    if (!unusedCount) return withheld("no_unused_eligible_identity");
    if (!pool.length) return withheld("eligible_bank_empty");
    if (pool.some(r => !precedence.candidate_order.includes(candidateRef(r)))) return withheld("precedence_unresolved");
    const chosen = [...pool].sort((a, b) => precedence.candidate_order.indexOf(candidateRef(a)) - precedence.candidate_order.indexOf(candidateRef(b)))[0];
    trace.push({ candidate_ref: candidateRef(chosen), decision: "selected", reason: "first_unused_under_explicitly_approved_precedence" });
    const snapshot = {
      contract_version: WORD_CONTRACT, date_key: input.date_key, timezone: WORD_TIMEZONE, publication_scope: WORD_SCOPE,
      canonical_lexical_identity_id: chosen.canonical_lexical_identity_id, approved_record_version: chosen.approved_record_version,
      approved_record_snapshot: copySnapshot(chosen), source_evidence_refs: chosen.source_evidence.map(e => e.evidence_ref).sort(),
      approval_record_refs: [...chosen.approval_record_refs].sort(), selection_policy_version: WORD_POLICY,
      canonical_context_basis_ref: context.basis_ref, context_version: context.version, context_snapshot_ref: context.snapshot_ref,
      precedence_rule_ref: precedence.rule_ref, precedence_version: precedence.version, identity_snapshot_ref: identities.snapshot_ref,
      ...selectionAuthorityHashes(input),
      bank_snapshot_ref: bank.snapshot_ref, history_snapshot_ref: input.history.snapshot_ref, history_revision: input.history.revision,
      trace, created_at: input.created_at, public_output_allowed: false, runtime_activation: false
    };
    return internalResult("proposal", { proposal: proposalFor(snapshot), trace });
  } catch { return withheld("invalid_input_contract"); }
}
