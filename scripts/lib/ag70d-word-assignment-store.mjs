import {
  WORD_CONTRACT, WORD_EVENT, copySnapshot, snapshotHash, internalResult, approved, nonempty,
  validTimestamp, validApprovedRecord, dateScopeKey, inspectWordHistory, inspectSelectionInputs, selectionAuthorityHashes, selectDailyWord, candidateRef
} from "./ag70d-word-selection-engine.mjs";

export const ASSIGNMENT_ADAPTER = "ag70d.word-store.v1";
export const ASSIGNMENT_OPERATIONS = Object.freeze(["reserve", "authorize", "cancel_reservation", "record_publication", "correct", "withdraw", "supersede"]);

function currentApproval(snapshot, input) {
  if (!input || input.contract_version !== WORD_CONTRACT || input.date_key !== snapshot.date_key || input.timezone !== snapshot.timezone || input.publication_scope !== snapshot.publication_scope) return false;
  const inspected = inspectSelectionInputs(input);
  if (!inspected.ok) return false;
  const record = inspected.records.find(r => candidateRef(r) === candidateRef(snapshot.approved_record_snapshot));
  const link = inspected.links.get(candidateRef(snapshot.approved_record_snapshot));
  const hashes = selectionAuthorityHashes(input);
  return validApprovedRecord(record) && record.withdrawn !== true && record.revoked !== true && record.superseded !== true &&
    link?.representative_candidate_ref === candidateRef(record) &&
    ["canonical_lexical_identity_id", "lemma_id", "equivalence_group_id"].every(k => link[k] === record[k]) &&
    !input.exclusions.entries.some(e => e.candidate_ref === candidateRef(record)) &&
    snapshotHash(record) === snapshotHash(snapshot.approved_record_snapshot) &&
    Object.entries(hashes).every(([key, hash]) => snapshot[key] === hash) &&
    approved(input.context) && input.context.basis_ref === snapshot.canonical_context_basis_ref && input.context.version === snapshot.context_version &&
    input.context.snapshot_ref === snapshot.context_snapshot_ref && input.context.date_key === snapshot.date_key &&
    input.context.eligible_candidate_refs?.includes(candidateRef(record)) &&
    input.policy?.publication_model?.canonical_context_basis_ref === input.context.basis_ref &&
    approved(input.precedence) && input.precedence.rule_ref === snapshot.precedence_rule_ref && input.precedence.version === snapshot.precedence_version &&
    input.policy?.approved_precedence_rule_ref === input.precedence.rule_ref;
}

/**
 * Storage-neutral internal coordinator. The injected adapter owns atomic CAS, uniqueness
 * and idempotency. No database client, clock, environment, scheduler or public writer.
 * Production-connected adapters and real publication operations are disabled in this phase.
 */
export async function executeWordAssignment({ adapter, authorization, command, selection_input: input }) {
  const withheld = reason => internalResult("withheld", { reason });
  try {
    if (!approved(authorization) || authorization.trust_boundary !== "server_only" || !nonempty(authorization.actor_ref) ||
        !Array.isArray(authorization.capabilities) || !authorization.capabilities.includes(command?.operation)) return withheld("authorization_unavailable");
    if (adapter?.contract_version !== ASSIGNMENT_ADAPTER || adapter.internal_only !== true || adapter.production_connected !== false ||
        !["readHistory", "readCommand", "compareAndAppend"].every(k => typeof adapter[k] === "function")) return withheld("history_persistence_unavailable");
    if (!command || command.contract_version !== WORD_CONTRACT || !nonempty(command.idempotency_key) || !validTimestamp(command.timestamp) ||
        !ASSIGNMENT_OPERATIONS.includes(command.operation)) return withheld("invalid_assignment_command");
    if (["record_publication", "correct"].includes(command.operation) &&
        (adapter.synthetic_test_adapter !== true || authorization.simulation_only !== true)) return withheld("publication_not_activated");
    const requestHash = snapshotHash({ command, input, actor_ref: authorization.actor_ref, authorization_ref: authorization.approval_ref });
    const prior = await adapter.readCommand(command.idempotency_key);
    if (prior) return prior.request_hash === requestHash ? internalResult("idempotent_replay", { transaction: copySnapshot(prior) }) : withheld("idempotency_conflict");
    const history = await adapter.readHistory();
    const h = inspectWordHistory(history);
    if (!h.ok) return withheld(h.reason);
    if (input?.expected_history_ref !== history.snapshot_ref || snapshotHash(input?.history) !== snapshotHash(history)) return withheld("stale_history");
    const events = [];
    let proposal, assignment;
    const append = (eventType, parentRefs, extra = {}) => {
      const event = {
        event_version: WORD_EVENT, event_id: "word-event:" + snapshotHash([command.idempotency_key, eventType, proposal.assignment_id]),
        command_id: command.idempotency_key + ":" + eventType, request_hash: requestHash,
        sequence: history.revision + events.length + 1, assignment_id: proposal.assignment_id, event_type: eventType,
        timestamp: command.timestamp, parent_event_refs: parentRefs, authorization_ref: authorization.approval_ref,
        actor_ref: authorization.actor_ref, public_output_allowed: false, runtime_activation: false, ...extra
      };
      events.push(event);
      return event;
    };
    if (command.operation === "reserve") {
      const selected = selectDailyWord(input);
      if (selected.status !== "proposal") return selected;
      proposal = selected.proposal;
      const first = append("selection_proposal", [], { proposal });
      append("reservation", [first.event_id]);
    } else {
      assignment = h.assignments.get(command.assignment_id);
      if (!assignment) return withheld("assignment_unavailable");
      proposal = assignment.proposal;
      if (command.proposal_id !== proposal.proposal_id || command.expected_last_event_id !== assignment.last_event_id) return withheld("assignment_target_conflict");
      if (!approved(command.decision)) return withheld("assignment_approval_unavailable");
      const states = {
        authorize: ["reservation"], cancel_reservation: ["reservation"], record_publication: ["authorized_assignment"],
        correct: ["publication", "correction"], withdraw: ["authorized_assignment", "publication", "correction"], supersede: ["authorized_assignment", "publication", "correction"]
      };
      if (!states[command.operation]?.includes(assignment.state)) return withheld("invalid_assignment_transition");
      if (["authorize", "record_publication"].includes(command.operation) && !currentApproval(proposal.snapshot, input)) return withheld("assignment_approval_unavailable");
      const type = { authorize: "authorized_assignment", cancel_reservation: "cancelled_reservation", record_publication: "publication", correct: "correction", withdraw: "withdrawal", supersede: "supersession" }[command.operation];
      const extra = { decision_approval_ref: command.decision.approval_ref };
      if (command.operation === "correct") {
        if (!validApprovedRecord(command.corrected_record_snapshot) || command.corrected_record_snapshot.withdrawn === true || command.corrected_record_snapshot.revoked === true || command.corrected_record_snapshot.superseded === true) return withheld("assignment_approval_unavailable");
        extra.corrected_record_snapshot = copySnapshot(command.corrected_record_snapshot);
        extra.corrects_event_id = command.corrects_event_id;
      }
      if (command.operation === "supersede") {
        if (!nonempty(command.supersession_ref)) return withheld("supersession_reference_unavailable");
        extra.supersession_ref = command.supersession_ref;
      }
      append(type, [assignment.last_event_id], extra);
    }
    const transaction = await adapter.compareAndAppend({
      expected_revision: history.revision, expected_history_ref: history.snapshot_ref,
      idempotency_key: command.idempotency_key, request_hash: requestHash, events
    });
    if (transaction.status === "conflict") {
      const winner = await adapter.readHistory();
      const checked = inspectWordHistory(winner);
      if (!checked.ok) return withheld(checked.reason);
      const a = checked.assignments.get(checked.dates.get(dateScopeKey(proposal.snapshot.date_key)));
      if (a) return internalResult(a.state === "reservation" ? "reservation_conflict" : "replay", {
        reason: "history_revision_conflict", assignment: copySnapshot(a.proposal), history_state: a.state,
        publication_withheld: true, history_snapshot_ref: winner.snapshot_ref
      });
      return withheld("history_revision_conflict");
    }
    if (!["committed", "idempotent_replay"].includes(transaction.status)) return withheld(transaction.reason ?? "history_persistence_unavailable");
    return internalResult(transaction.status, { assignment: copySnapshot(proposal), transaction: copySnapshot(transaction) });
  } catch { return withheld("history_persistence_unavailable"); }
}
