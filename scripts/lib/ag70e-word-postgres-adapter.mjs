import { ASSIGNMENT_ADAPTER } from "./ag70d-word-assignment-store.mjs";
import { copySnapshot, inspectWordHistory, snapshotHash, internalResult } from "./ag70d-word-selection-engine.mjs";

/** Inject an authenticated server-side RPC transport. No client, credential or endpoint is created. */
export function createWordPostgresAdapter({ rpc, mode = "disabled" } = {}) {
  const enabled = ["isolated_local_validation", "authorized_server"].includes(mode) && typeof rpc === "function";
  async function call(name, parameters) {
    if (!enabled) throw new Error("word_persistence_not_activated");
    const response = await rpc(name, parameters);
    if (response?.error) throw new Error("word_database_operation_failed");
    if (!response || !("data" in response)) throw new Error("invalid_word_database_response");
    return response.data;
  }
  return Object.freeze({
    contract_version: ASSIGNMENT_ADAPTER, internal_only: true, production_connected: mode === "authorized_server",
    prepared_postgres_adapter: true, mode,
    async verifyAuthorization(authorization, operation) {
      if (mode !== "authorized_server") return false;
      return await call("word_assignment_check_authorization", { p_ref: authorization.approval_ref, p_actor: authorization.actor_ref, p_operation: operation }) === true;
    },
    async readHistory() {
      const history = await call("word_assignment_read_history", {});
      const checked = inspectWordHistory(history);
      if (!checked.ok) throw new Error(checked.reason);
      return copySnapshot(history);
    },
    async readCommand(key) {
      const prior = await call("word_assignment_read_command", { p_key: key });
      return prior === null ? null : copySnapshot(prior);
    },
    async compareAndAppend(request) {
      const current = await this.readHistory();
      if (request.expected_revision !== current.revision || request.expected_history_ref !== current.snapshot_ref) return internalResult("conflict");
      const events = [...current.events, ...copySnapshot(request.events)];
      const next = { ...current, events, revision: events.length, snapshot_ref: snapshotHash(events) };
      const checked = inspectWordHistory(next);
      if (!checked.ok) return internalResult("withheld", { reason: checked.reason });
      // One RPC owns all event, claim, revision and receipt changes. Never separate REST inserts.
      const receipt = await call("word_assignment_commit", { p_request: copySnapshot(request) });
      if (!["committed", "idempotent_replay", "conflict", "withheld"].includes(receipt?.status) || receipt.public_output_allowed !== false) throw new Error("invalid_word_database_receipt");
      return copySnapshot(receipt);
    }
  });
}
