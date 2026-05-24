// AG18E — Non-active Real Static Activation Scaffold
// This helper is intentionally non-active and outside /api.
// It prepares preview shapes only. It cannot create tokens, write to GitHub,
// mutate articles, switch visibility, update indexes, trigger deployment,
// publish, access secrets, or activate Supabase/Auth/backend.

export const AG18E_REAL_STATIC_ACTIVATION_SCAFFOLD = Object.freeze({
  module_id: "AG18E",
  status: "NON_ACTIVE_REAL_STATIC_ACTIVATION_SCAFFOLD_ONLY",
  candidate_apply_enabled: false,
  github_token_available: false,
  github_write_enabled: false,
  public_visibility_switch_enabled: false,
  public_index_update_enabled: false,
  deployment_trigger_enabled: false,
  publishing_enabled: false,
  admin_editor_execution_enabled: false,
  supabase_auth_backend_enabled: false
});

export function prepareCandidateApplyPreview(record) {
  const source = record && typeof record === "object" ? record : {};

  return Object.freeze({
    module_id: "AG18E",
    status: "NON_ACTIVE_CANDIDATE_APPLY_PREVIEW_ONLY",
    dry_run_only: true,
    article_path: source.article_path || null,
    article_hash: source.article_hash || null,
    public_visibility_target: false,
    publish_approved_target: false,
    public_index_allowed_target: false,
    can_apply_candidate: false,
    reason: "AG18E prepares candidate-apply shape only. It cannot apply or expose the article."
  });
}

export function preparePublicIndexDeltaPreview(record) {
  const source = record && typeof record === "object" ? record : {};

  return Object.freeze({
    module_id: "AG18E",
    status: "NON_ACTIVE_PUBLIC_INDEX_DELTA_PREVIEW_ONLY",
    dry_run_only: true,
    article_path: source.article_path || null,
    article_hash: source.article_hash || null,
    preview_targets: [
      "featured_reads_index",
      "category_listing",
      "homepage_card",
      "sitemap_feed_search"
    ],
    files_to_change_preview: [],
    public_index_update_enabled: false,
    can_mutate_index: false
  });
}

export function prepareGithubWritePayloadPreview(delta) {
  const source = delta && typeof delta === "object" ? delta : {};

  return Object.freeze({
    module_id: "AG18E",
    status: "NON_ACTIVE_GITHUB_WRITE_PAYLOAD_PREVIEW_ONLY",
    dry_run_only: true,
    source_delta_status: source.status || null,
    commit_message_preview: "Preview only — no GitHub write allowed in AG18E",
    files_to_change_preview: [],
    github_token_required_later: true,
    github_token_created_now: false,
    github_token_available: false,
    github_write_enabled: false,
    can_execute_write: false
  });
}

export function prepareRollbackRecordPreview() {
  return Object.freeze({
    module_id: "AG18E",
    status: "NON_ACTIVE_ROLLBACK_RECORD_PREVIEW_ONLY",
    dry_run_only: true,
    pre_write_commit_hash_required_later: true,
    rollback_command_required_later: true,
    rollback_executed_now: false,
    can_execute_rollback: false
  });
}

export function prepareSmokeTestChecklistPreview() {
  return Object.freeze({
    module_id: "AG18E",
    status: "NON_ACTIVE_SMOKE_TEST_CHECKLIST_PREVIEW_ONLY",
    dry_run_only: true,
    deployment_trigger_enabled: false,
    smoke_test_executed_now: false,
    checks: [
      "article URL opens",
      "Featured Reads card appears only after approved apply",
      "category listing appears only after approved apply",
      "homepage card appears only if selected",
      "references and image credits render",
      "mobile layout remains stable"
    ]
  });
}

export function blockRealStaticActivationExecution() {
  return Object.freeze({
    module_id: "AG18E",
    status: "REAL_STATIC_ACTIVATION_EXECUTION_BLOCKED",
    blocked: true,
    candidate_apply_enabled: false,
    github_token_available: false,
    github_write_enabled: false,
    public_visibility_switch_enabled: false,
    public_index_update_enabled: false,
    deployment_trigger_enabled: false,
    publishing_enabled: false,
    supabase_auth_backend_enabled: false
  });
}
