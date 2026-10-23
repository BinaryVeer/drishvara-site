import { ASSIGNMENT_ADAPTER } from "./ag70d-word-assignment-store.mjs";
import { WORD_CONTRACT, copySnapshot, snapshotHash, inspectWordHistory, internalResult } from "./ag70d-word-selection-engine.mjs";

// Isolated test adapter only. This synchronous critical section is NOT a database proof.
export function createSyntheticWordStore(identitySnapshotRef) {
  let events = [];
  const commands = new Map();
  const history = () => ({
    contract_version: WORD_CONTRACT, available: true, complete: true, revision: events.length,
    identity_snapshot_ref: identitySnapshotRef, snapshot_ref: snapshotHash(events), events: copySnapshot(events)
  });
  return Object.freeze({
    contract_version: ASSIGNMENT_ADAPTER, internal_only: true, production_connected: false, synthetic_test_adapter: true,
    async readHistory() { return history(); },
    async readCommand(key) { return commands.has(key) ? copySnapshot(commands.get(key)) : null; },
    async compareAndAppend(request) {
      const prior = commands.get(request.idempotency_key);
      if (prior) return prior.request_hash === request.request_hash
        ? internalResult("idempotent_replay", { ...copySnapshot(prior), synthetic_fixture: true })
        : internalResult("withheld", { reason: "idempotency_conflict", synthetic_fixture: true });
      if (request.expected_revision !== events.length || request.expected_history_ref !== snapshotHash(events)) return internalResult("conflict", { synthetic_fixture: true });
      const next = [...events, ...copySnapshot(request.events)];
      const checked = inspectWordHistory({ ...history(), events: next, revision: next.length, snapshot_ref: snapshotHash(next) });
      if (!checked.ok) return internalResult("withheld", { reason: checked.reason, synthetic_fixture: true });
      const receipt = internalResult("committed", {
        idempotency_key: request.idempotency_key, request_hash: request.request_hash,
        event_ids: request.events.map(e => e.event_id), history_snapshot_ref: snapshotHash(next), synthetic_fixture: true
      });
      // Both event append and command receipt are committed together in this simulation.
      events = next;
      commands.set(request.idempotency_key, receipt);
      return copySnapshot(receipt);
    }
  });
}
