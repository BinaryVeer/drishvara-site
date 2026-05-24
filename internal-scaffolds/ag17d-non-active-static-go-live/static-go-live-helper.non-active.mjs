// AG17D — Non-active Static Go-live Implementation Scaffold
// This helper is intentionally non-active and outside /api.
// It prepares shapes only. It cannot write to GitHub, change public visibility,
// update public indexes, trigger deployment, publish, access secrets, or execute Admin/Editor actions.

export const AG17D_STATIC_GO_LIVE_SCAFFOLD = Object.freeze({
  module_id: "AG17D",
  status: "NON_ACTIVE_STATIC_GO_LIVE_SCAFFOLD_ONLY",
  github_write_enabled: false,
  public_visibility_switch_enabled: false,
  public_index_update_enabled: false,
  deployment_trigger_enabled: false,
  publishing_enabled: false,
  admin_action_execution_enabled: false,
  supabase_auth_backend_enabled: false
});

export function preparePublicExposureDeltaNonActive(record) {
  const source = record && typeof record === "object" ? record : {};

  const eligibleShape =
    source.public_visibility === true &&
    source.publish_approved === true &&
    source.public_index_allowed === true &&
    ["public_published", "published_closed"].includes(source.status) &&
    typeof source.article_path === "string" &&
    source.article_hash === source.approved_hash &&
    ["complete", "not_applicable"].includes(source.quality_evidence_status) &&
    source.preview_status === "passed" &&
    source.hash_integrity_status === "matched";

  return Object.freeze({
    module_id: "AG17D",
    status: "NON_ACTIVE_PUBLIC_EXPOSURE_DELTA_PREVIEW_ONLY",
    dry_run_only: true,
    eligible_shape: eligibleShape,
    article_id: source.article_id || null,
    article_path: source.article_path || null,
    public_surface_targets: ["featured_reads", "category_listing", "homepage_card"],
    github_write_enabled: false,
    public_visibility_switch_enabled: false,
    public_index_update_enabled: false,
    deployment_trigger_enabled: false,
    publishing_enabled: false,
    reason: eligibleShape
      ? "Record shape is eligible for future exposure planning, but AG17D cannot write or publish."
      : "Record shape is not eligible for public exposure."
  });
}

export function prepareGithubCommitPayloadNonActive(delta) {
  const source = delta && typeof delta === "object" ? delta : {};

  return Object.freeze({
    module_id: "AG17D",
    status: "NON_ACTIVE_GITHUB_COMMIT_PAYLOAD_PREVIEW_ONLY",
    dry_run_only: true,
    source_delta_status: source.status || null,
    files_to_change_preview: [],
    commit_message_preview: "Preview only — no commit allowed in AG17D",
    github_write_enabled: false,
    github_token_required_but_not_created: true,
    github_token_available: false,
    can_execute_commit: false
  });
}

export function prepareDeploymentChecklistNonActive() {
  return Object.freeze({
    module_id: "AG17D",
    status: "NON_ACTIVE_DEPLOYMENT_CHECKLIST_PREVIEW_ONLY",
    dry_run_only: true,
    deployment_trigger_enabled: false,
    can_trigger_deployment: false,
    checklist_items: [
      "pre-write hash recorded",
      "public filter passed",
      "Admin decision recorded",
      "rollback path recorded",
      "post-deployment smoke test planned"
    ]
  });
}

export function blockStaticGoLiveExecutionNonActive() {
  return Object.freeze({
    module_id: "AG17D",
    status: "STATIC_GO_LIVE_EXECUTION_BLOCKED",
    blocked: true,
    github_write_enabled: false,
    public_visibility_switch_enabled: false,
    public_index_update_enabled: false,
    deployment_trigger_enabled: false,
    publishing_enabled: false,
    supabase_auth_backend_enabled: false
  });
}
