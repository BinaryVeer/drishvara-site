// AG15E — Generated Article Admin Queue Non-active Integration Scaffold
// This file is intentionally outside /api and is not a live endpoint.
// It must not write files, mutate queues, publish articles, trigger deployment,
// access secrets, use network services, activate Auth, or execute Admin/Editor actions.

export const AG15E_NON_ACTIVE_INTEGRATION = Object.freeze({
  module_id: "AG15E",
  status: "NON_ACTIVE_INTEGRATION_SCAFFOLD_ONLY",
  integration_execution_enabled: false,
  active_queue_write_enabled: false,
  queue_index_write_enabled: false,
  article_mutation_enabled: false,
  public_visibility_switch_enabled: false,
  publish_enabled: false,
  admin_action_execution_enabled: false
});

export function mapCandidateToQueueRecordNonActive(candidate) {
  const source = candidate && typeof candidate === "object" ? candidate : {};

  return Object.freeze({
    ok: false,
    blocked: true,
    module_id: "AG15E",
    status: "NON_ACTIVE_INTEGRATION_SCAFFOLD_ONLY",
    reason: "This scaffold maps shape only and never writes to the active Admin Review Queue.",
    dry_run_only: true,
    article_id: source.article_id || null,
    slug: source.slug || null,
    title: source.title || null,
    category: source.category || null,
    article_path: source.selected_article_path || source.article_path || null,
    article_hash: source.article_hash || null,
    queue_status: "ready_for_admin_review",
    public_visibility: false,
    publish_approved: false,
    admin_decision_status: "pending_admin_review",
    active_queue_write_enabled: false,
    queue_index_write_enabled: false,
    public_visibility_switch_enabled: false,
    publish_enabled: false
  });
}

export function validateNonActiveQueueHandoffScaffold(record) {
  return Object.freeze({
    ok: false,
    blocked: true,
    module_id: "AG15E",
    status: "NON_ACTIVE_VALIDATION_ONLY",
    reason: "Validation scaffold is non-active and cannot create or mutate queue records.",
    public_visibility_is_false: record?.public_visibility === false,
    publish_approved_is_false: record?.publish_approved === false,
    active_queue_write_enabled: false,
    queue_index_write_enabled: false
  });
}
