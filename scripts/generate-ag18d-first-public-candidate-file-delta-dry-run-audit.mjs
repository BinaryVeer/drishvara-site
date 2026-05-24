import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag18cReview: "data/content-intelligence/quality-reviews/ag18c-first-public-candidate-file-delta-dry-run.json",
  ag18cCandidate: "data/content-intelligence/go-live/ag18c-candidate-readiness-dry-run.json",
  ag18cPublicFilter: "data/content-intelligence/go-live/ag18c-public-filter-dry-run.json",
  ag18cFileDelta: "data/content-intelligence/go-live/ag18c-intended-file-delta-dry-run.json",
  ag18cFeaturedReads: "data/content-intelligence/go-live/ag18c-featured-reads-delta-dry-run.json",
  ag18cCategoryListing: "data/content-intelligence/go-live/ag18c-category-listing-delta-dry-run.json",
  ag18cHomepageCard: "data/content-intelligence/go-live/ag18c-homepage-card-delta-dry-run.json",
  ag18cSitemapFeedSearch: "data/content-intelligence/go-live/ag18c-sitemap-feed-search-delta-dry-run.json",
  ag18cRollbackSmoke: "data/content-intelligence/go-live/ag18c-rollback-smoke-test-dry-run.json",
  ag18cReadiness: "data/content-intelligence/quality-registry/ag18c-first-public-candidate-file-delta-dry-run-audit-readiness-record.json",
  ag18cBoundary: "data/content-intelligence/mutation-plans/ag18c-to-ag18d-first-public-candidate-file-delta-dry-run-audit-boundary.json",
  ag18bSafety: "data/content-intelligence/quality-registry/ag18b-real-static-activation-safety-record.json",
  ag18bDecision: "data/content-intelligence/go-live/ag18b-first-candidate-file-delta-dry-run-readiness-decision-record.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag18d-first-public-candidate-file-delta-dry-run-audit.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag18d-first-public-candidate-file-delta-dry-run-audit-report.json");
const decisionPath = path.join(root, "data/content-intelligence/go-live/ag18d-non-active-real-static-activation-scaffold-readiness-decision-record.json");
const safetyPath = path.join(root, "data/content-intelligence/quality-registry/ag18d-file-delta-dry-run-safety-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag18d-non-active-real-static-activation-scaffold-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag18d-to-ag18e-non-active-real-static-activation-scaffold-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/first-public-candidate-file-delta-dry-run-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag18d-first-public-candidate-file-delta-dry-run-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag18d-first-public-candidate-file-delta-dry-run-audit.json");
const previewPath = path.join(root, "data/quality/ag18d-first-public-candidate-file-delta-dry-run-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG18D_FIRST_PUBLIC_CANDIDATE_FILE_DELTA_DRY_RUN_AUDIT.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value);
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing AG18D input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag18cReview.status !== "first_public_candidate_file_delta_dry_run_completed_ready_for_ag18d_audit") {
  throw new Error("AG18D requires AG18C review readiness.");
}
if (data.ag18cReadiness.ready_for_ag18d !== true) {
  throw new Error("AG18D requires AG18C readiness.");
}
if (data.ag18cBoundary.next_stage_id !== "AG18D" || data.ag18cBoundary.explicit_approval_required !== true) {
  throw new Error("AG18D requires AG18C to AG18D explicit boundary.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG18D requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  first_public_candidate_file_delta_dry_run_audit_only: true,
  dry_run_outputs_audited_in_ag18d: true,
  non_active_real_static_activation_scaffold_decision_created_in_ag18d: true,
  file_delta_dry_run_safety_record_created_in_ag18d: true,
  ag18e_boundary_created_in_ag18d: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag18d: false,
  article_mutation_performed_in_ag18d: false,
  queue_mutation_performed_in_ag18d: false,
  active_admin_review_queue_record_created_in_ag18d: false,
  queue_index_mutation_performed_in_ag18d: false,
  admin_action_execution_performed_in_ag18d: false,
  editor_action_execution_performed_in_ag18d: false,
  real_credential_created_in_ag18d: false,
  hardcoded_password_created_in_repo_in_ag18d: false,
  password_hash_created_in_repo_in_ag18d: false,
  auth_activation_performed_in_ag18d: false,
  backend_activation_performed_in_ag18d: false,
  supabase_activation_performed_in_ag18d: false,
  database_write_performed_in_ag18d: false,
  github_token_created_or_exposed_in_ag18d: false,
  github_write_operation_performed_in_ag18d: false,
  active_action_handler_created_in_ag18d: false,
  api_endpoint_created_in_ag18d: false,
  public_visibility_switch_performed_in_ag18d: false,
  public_index_mutation_performed_in_ag18d: false,
  deployment_trigger_performed_in_ag18d: false,
  public_publishing_operation_performed_in_ag18d: false
};

const auditChecks = [
  {
    check_id: "AG18D-AUDIT-001",
    area: "ag18c_dependency",
    status: "passed",
    note: "AG18C review, dry-run outputs, readiness and boundary are present."
  },
  {
    check_id: "AG18D-AUDIT-002",
    area: "candidate_readiness_dry_run",
    status:
      data.ag18cCandidate.status === "candidate_readiness_dry_run_completed_no_apply" &&
      data.ag18cCandidate.candidate.article_path === articlePath &&
      data.ag18cCandidate.candidate.article_hash === currentArticleHash &&
      data.ag18cCandidate.current_state_assessment.ready_for_real_apply_now === false &&
      Object.values(data.ag18cCandidate.mutation_state_now).every((value) => value === false)
        ? "passed"
        : "failed",
    note: "Candidate readiness dry-run must remain no-apply and no-mutation."
  },
  {
    check_id: "AG18D-AUDIT-003",
    area: "public_filter_dry_run",
    status:
      data.ag18cPublicFilter.status === "public_filter_dry_run_completed_no_visibility_switch" &&
      data.ag18cPublicFilter.current_public_filter_result.passed === false &&
      data.ag18cPublicFilter.current_public_filter_result.public_exposure_allowed_now === false &&
      data.ag18cPublicFilter.hypothetical_future_public_filter_result.passed === true &&
      data.ag18cPublicFilter.hypothetical_future_public_filter_result.public_exposure_allowed_now === false
        ? "passed"
        : "failed",
    note: "Public filter dry-run must fail current public exposure while allowing only hypothetical future pass."
  },
  {
    check_id: "AG18D-AUDIT-004",
    area: "intended_file_delta_dry_run",
    status:
      data.ag18cFileDelta.status === "intended_file_delta_dry_run_completed_no_file_mutation" &&
      data.ag18cFileDelta.intended_delta_summary.real_file_mutation_performed === false &&
      data.ag18cFileDelta.intended_delta_summary.git_write_performed === false &&
      data.ag18cFileDelta.intended_delta_summary.deployment_triggered === false &&
      data.ag18cFileDelta.intended_delta_targets_preview.every((target) => target.mutation_now === false)
        ? "passed"
        : "failed",
    note: "Intended file delta must remain preview-only with no file mutation, Git write or deployment."
  },
  {
    check_id: "AG18D-AUDIT-005",
    area: "featured_reads_delta_dry_run",
    status:
      data.ag18cFeaturedReads.status === "featured_reads_delta_dry_run_completed_no_mutation" &&
      data.ag18cFeaturedReads.dry_run_only === true &&
      data.ag18cFeaturedReads.mutation_now === false &&
      data.ag18cFeaturedReads.featured_reads_index_mutated === false &&
      data.ag18cFeaturedReads.preview_card.include_now === false
        ? "passed"
        : "failed",
    note: "Featured Reads delta must remain preview-only and not included publicly."
  },
  {
    check_id: "AG18D-AUDIT-006",
    area: "category_listing_delta_dry_run",
    status:
      data.ag18cCategoryListing.status === "category_listing_delta_dry_run_completed_no_mutation" &&
      data.ag18cCategoryListing.dry_run_only === true &&
      data.ag18cCategoryListing.mutation_now === false &&
      data.ag18cCategoryListing.category_listing_mutated === false &&
      data.ag18cCategoryListing.preview_listing.include_now === false
        ? "passed"
        : "failed",
    note: "Category listing delta must remain preview-only."
  },
  {
    check_id: "AG18D-AUDIT-007",
    area: "homepage_card_delta_dry_run",
    status:
      data.ag18cHomepageCard.status === "homepage_card_delta_dry_run_completed_no_mutation" &&
      data.ag18cHomepageCard.dry_run_only === true &&
      data.ag18cHomepageCard.mutation_now === false &&
      data.ag18cHomepageCard.homepage_mutated === false &&
      data.ag18cHomepageCard.homepage_card_preview.include_now === false
        ? "passed"
        : "failed",
    note: "Homepage card delta must remain preview-only."
  },
  {
    check_id: "AG18D-AUDIT-008",
    area: "sitemap_feed_search_delta_dry_run",
    status:
      data.ag18cSitemapFeedSearch.status === "sitemap_feed_search_delta_dry_run_completed_no_mutation" &&
      data.ag18cSitemapFeedSearch.dry_run_only === true &&
      data.ag18cSitemapFeedSearch.sitemap_feed_search_mutated === false &&
      data.ag18cSitemapFeedSearch.preview_targets.every((target) => target.mutation_now === false)
        ? "passed"
        : "failed",
    note: "Sitemap/feed/search delta must remain preview-only."
  },
  {
    check_id: "AG18D-AUDIT-009",
    area: "rollback_smoke_test_dry_run",
    status:
      data.ag18cRollbackSmoke.status === "rollback_smoke_test_dry_run_completed_no_execution" &&
      data.ag18cRollbackSmoke.dry_run_only === true &&
      data.ag18cRollbackSmoke.rollback_preview.rollback_executed_now === false &&
      data.ag18cRollbackSmoke.smoke_test_preview.smoke_test_executed_now === false
        ? "passed"
        : "failed",
    note: "Rollback and smoke-test must remain dry-run only with no execution."
  },
  {
    check_id: "AG18D-AUDIT-010",
    area: "ag18b_safety_inheritance",
    status:
      data.ag18bSafety.safety_assertions.github_token_created === false &&
      data.ag18bSafety.safety_assertions.github_write_enabled === false &&
      data.ag18bSafety.safety_assertions.public_visibility_switch_enabled === false &&
      data.ag18bSafety.safety_assertions.public_index_mutation_enabled === false &&
      data.ag18bSafety.safety_assertions.deployment_trigger_enabled === false &&
      data.ag18bSafety.safety_assertions.publishing_enabled === false &&
      data.ag18bSafety.safety_assertions.supabase_auth_backend_deferred === true
        ? "passed"
        : "failed",
    note: "AG18B safety controls must remain inherited."
  },
  {
    check_id: "AG18D-AUDIT-011",
    area: "ag18b_decision_inheritance",
    status:
      data.ag18bDecision.decision.proceed_to_first_public_candidate_file_delta_dry_run === true &&
      data.ag18bDecision.decision.proceed_to_real_candidate_selection_apply === false &&
      data.ag18bDecision.decision.proceed_to_github_token_creation === false &&
      data.ag18bDecision.decision.proceed_to_github_write === false &&
      data.ag18bDecision.decision.proceed_to_public_visibility_switch === false &&
      data.ag18bDecision.decision.proceed_to_public_index_mutation === false &&
      data.ag18bDecision.decision.proceed_to_deployment_trigger === false &&
      data.ag18bDecision.decision.proceed_to_publish_execution === false &&
      data.ag18bDecision.decision.proceed_to_supabase_auth_backend_activation === false
        ? "passed"
        : "failed",
    note: "AG18B decision must allow only dry-run and block every real activation action."
  },
  {
    check_id: "AG18D-AUDIT-012",
    area: "readiness_alignment",
    status:
      data.ag18cReadiness.ready_for_ag18d === true &&
      data.ag18cReadiness.github_token_ready === false &&
      data.ag18cReadiness.github_write_ready === false &&
      data.ag18cReadiness.public_visibility_switch_ready === false &&
      data.ag18cReadiness.public_index_mutation_ready === false &&
      data.ag18cReadiness.deployment_trigger_ready === false &&
      data.ag18cReadiness.publish_ready === false &&
      data.ag18cReadiness.supabase_activation_ready === false
        ? "passed"
        : "failed",
    note: "AG18C readiness must point to AG18D audit while activation remains blocked."
  },
  {
    check_id: "AG18D-AUDIT-013",
    area: "supabase_auth_defer_reminder",
    status:
      data.ag17bSupabaseReminder.status === "supabase_auth_backend_defer_reminder_carried_forward" &&
      data.ag17bSupabaseReminder.reminder.includes("static/GitHub-controlled go-live first") &&
      data.ag17bSupabaseReminder.reminder.includes("Supabase/Auth/backend later")
        ? "passed"
        : "failed",
    note: "Supabase/Auth/backend defer reminder must remain active."
  },
  {
    check_id: "AG18D-AUDIT-014",
    area: "stage_controls_no_activation",
    status:
      data.ag18cReview.summary.github_token_ready === false &&
      data.ag18cReview.summary.github_write_ready === false &&
      data.ag18cReview.summary.public_visibility_switch_ready === false &&
      data.ag18cReview.summary.public_index_mutation_ready === false &&
      data.ag18cReview.summary.deployment_trigger_ready === false &&
      data.ag18cReview.summary.publish_ready === false
        ? "passed"
        : "failed",
    note: "AG18C summary must confirm no real activation readiness."
  },
  {
    check_id: "AG18D-AUDIT-015",
    area: "forbidden_operations",
    status: "passed",
    note: "AG18D is audit-only and performs no mutation, credential creation, GitHub write, visibility switch, public index mutation, deployment, publishing or backend activation."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG18D audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const auditReport = {
  module_id: "AG18D",
  title: "First Public Candidate File Delta Dry-run Audit Report",
  status: "first_public_candidate_file_delta_dry_run_audit_passed",
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    failed: failedChecks.length
  },
  decision: {
    ag18c_dry_run_valid: true,
    candidate_readiness_dry_run_valid: true,
    public_filter_dry_run_valid: true,
    file_delta_dry_run_valid: true,
    public_surface_deltas_preview_only: true,
    rollback_smoke_test_dry_run_valid: true,
    no_file_mutation_performed: true,
    no_github_token_created: true,
    no_github_write_performed: true,
    no_public_visibility_switch_performed: true,
    no_public_index_mutation_performed: true,
    no_deployment_triggered: true,
    no_publishing_performed: true,
    supabase_auth_backend_deferred: true,
    ready_for_non_active_real_static_activation_scaffold: true
  },
  ...stageControls
};

const decision = {
  module_id: "AG18D",
  title: "Non-active Real Static Activation Scaffold Readiness Decision Record",
  status: "ag18c_dry_run_audit_passed_ready_for_ag18e_non_active_scaffold",
  decision: {
    proceed_to_non_active_real_static_activation_scaffold: true,
    proceed_to_real_candidate_selection_apply: false,
    proceed_to_github_token_creation: false,
    proceed_to_github_write: false,
    proceed_to_public_visibility_switch: false,
    proceed_to_public_index_mutation: false,
    proceed_to_deployment_trigger: false,
    proceed_to_publish_execution: false,
    proceed_to_supabase_auth_backend_activation: false
  },
  recommended_next_stage: "AG18E",
  recommended_next_stage_title: "Non-active Real Static Activation Scaffold",
  rationale: [
    "AG18C dry-run outputs passed audit with zero failed checks.",
    "The next safe step is a non-active scaffold for real static activation shapes.",
    "No real candidate apply, GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing is approved.",
    "Supabase/Auth/backend remains deferred."
  ],
  ...stageControls
};

const safety = {
  module_id: "AG18D",
  title: "File Delta Dry-run Safety Record",
  status: "file_delta_dry_run_safe_for_non_active_scaffold_only",
  safety_assertions: {
    static_github_controlled_first: true,
    supabase_auth_backend_deferred: true,
    candidate_real_apply_enabled: false,
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    github_write_enabled: false,
    file_mutation_enabled: false,
    article_mutation_enabled: false,
    queue_mutation_enabled: false,
    public_visibility_switch_enabled: false,
    public_index_mutation_enabled: false,
    featured_reads_mutation_enabled: false,
    category_listing_mutation_enabled: false,
    homepage_mutation_enabled: false,
    sitemap_feed_search_mutation_enabled: false,
    deployment_trigger_enabled: false,
    publishing_enabled: false,
    admin_editor_execution_enabled: false
  },
  reminder: data.ag17bSupabaseReminder.reminder,
  ...stageControls
};

const readiness = {
  module_id: "AG18D",
  title: "Non-active Real Static Activation Scaffold Readiness Record",
  status: "ready_for_ag18e_non_active_real_static_activation_scaffold",
  ready_for_ag18e: true,
  ag18e_explicit_approval_required: true,
  first_public_candidate_file_delta_dry_run_audit_passed: true,
  failed_checks: 0,
  selected_path: "hybrid_staged_path_static_first",
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  supabase_auth_reminder_required_in_future: true,
  non_active_real_static_activation_scaffold_ready: true,
  article_generation_ready: false,
  article_mutation_ready: false,
  queue_mutation_ready: false,
  admin_action_execution_ready: false,
  editor_action_execution_ready: false,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  github_token_ready: false,
  github_write_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  publish_ready: false,
  reason: "AG18D approves only AG18E non-active real static activation scaffold. Real activation remains blocked.",
  ...stageControls
};

const boundary = {
  module_id: "AG18D",
  title: "AG18D to AG18E Non-active Real Static Activation Scaffold Boundary",
  status: "ag18e_boundary_created_not_started",
  next_stage_id: "AG18E",
  next_stage_title: "Non-active Real Static Activation Scaffold",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  ag18e_allowed_scope: [
    "Create non-active real static activation helper scaffold.",
    "Create first public candidate apply template.",
    "Create public index delta apply template.",
    "Create GitHub write payload template with no secrets.",
    "Create rollback record template.",
    "Create smoke-test checklist template.",
    "Keep scaffold outside /api and non-executable.",
    "Carry forward Supabase/Auth/backend defer reminder."
  ],
  ag18e_blocked_scope: [
    "No new article generation.",
    "No article mutation.",
    "No active queue mutation.",
    "No active Admin Review Queue record creation.",
    "No queue-index mutation.",
    "No Admin/Editor action execution.",
    "No real credentials.",
    "No Auth/backend/Supabase activation.",
    "No GitHub write token creation or wiring.",
    "No GitHub content write.",
    "No public visibility switch.",
    "No public index mutation.",
    "No publishing operation.",
    "No deployment trigger."
  ],
  supabase_auth_defer_reminder_required_in_ag18e: true,
  ...stageControls
};

const schema = {
  module_id: "AG18D",
  title: "First Public Candidate File Delta Dry-run Audit Schema",
  status: "schema_first_public_candidate_file_delta_dry_run_audit_only",
  dry_run_audit_allowed_in_ag18d: true,
  non_active_scaffold_decision_allowed_in_ag18d: true,
  safety_record_allowed_in_ag18d: true,
  ag18e_boundary_allowed_in_ag18d: true,

  article_generation_allowed_in_ag18d: false,
  article_mutation_allowed_in_ag18d: false,
  queue_mutation_allowed_in_ag18d: false,
  active_admin_review_queue_record_creation_allowed_in_ag18d: false,
  queue_index_mutation_allowed_in_ag18d: false,
  admin_action_execution_allowed_in_ag18d: false,
  editor_action_execution_allowed_in_ag18d: false,
  real_credential_creation_allowed_in_ag18d: false,
  auth_activation_allowed_in_ag18d: false,
  backend_activation_allowed_in_ag18d: false,
  supabase_activation_allowed_in_ag18d: false,
  database_write_allowed_in_ag18d: false,
  github_token_creation_or_exposure_allowed_in_ag18d: false,
  github_write_operation_allowed_in_ag18d: false,
  active_action_handler_creation_allowed_in_ag18d: false,
  api_endpoint_creation_allowed_in_ag18d: false,
  public_visibility_switch_allowed_in_ag18d: false,
  public_index_mutation_allowed_in_ag18d: false,
  public_publishing_operation_allowed_in_ag18d: false,
  deployment_trigger_allowed_in_ag18d: false,
  ...stageControls
};

const review = {
  module_id: "AG18D",
  title: "First Public Candidate and File Delta Dry-run Audit",
  status: "first_public_candidate_file_delta_dry_run_audit_passed_ready_for_ag18e_non_active_scaffold",
  depends_on: ["AG18C"],
  generated_from: inputs,
  audit_report_file: "data/content-intelligence/audit-records/ag18d-first-public-candidate-file-delta-dry-run-audit-report.json",
  decision_file: "data/content-intelligence/go-live/ag18d-non-active-real-static-activation-scaffold-readiness-decision-record.json",
  safety_file: "data/content-intelligence/quality-registry/ag18d-file-delta-dry-run-safety-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag18d-non-active-real-static-activation-scaffold-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag18d-to-ag18e-non-active-real-static-activation-scaffold-boundary.json",
  schema_file: "data/content-intelligence/schema/first-public-candidate-file-delta-dry-run-audit.schema.json",
  summary: {
    audit_passed: true,
    failed_checks: 0,
    ready_for_ag18e: true,
    selected_path: "hybrid_staged_path_static_first",
    supabase_auth_backend_deferred: true,
    github_token_ready: false,
    github_write_ready: false,
    public_visibility_switch_ready: false,
    public_index_mutation_ready: false,
    deployment_trigger_ready: false,
    publish_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG18D",
  title: "First Public Candidate File Delta Dry-run Audit Learning",
  status: "learning_record_only",
  learning_points: [
    "AG18C dry-run outputs passed audit with zero failed checks.",
    "Candidate readiness, public filter and file/public-surface deltas remain dry-run only.",
    "The next safe step is a non-active real static activation scaffold.",
    "No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing is approved.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG18D",
  title: "First Public Candidate and File Delta Dry-run Audit",
  status: "first_public_candidate_file_delta_dry_run_audit_passed_ready_for_ag18e_non_active_scaffold",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag18d-first-public-candidate-file-delta-dry-run-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag18d-first-public-candidate-file-delta-dry-run-audit-report.json",
    decision: "data/content-intelligence/go-live/ag18d-non-active-real-static-activation-scaffold-readiness-decision-record.json",
    safety: "data/content-intelligence/quality-registry/ag18d-file-delta-dry-run-safety-record.json",
    readiness: "data/content-intelligence/quality-registry/ag18d-non-active-real-static-activation-scaffold-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag18d-to-ag18e-non-active-real-static-activation-scaffold-boundary.json",
    schema: "data/content-intelligence/schema/first-public-candidate-file-delta-dry-run-audit.schema.json",
    learning: "data/content-intelligence/learning/ag18d-first-public-candidate-file-delta-dry-run-audit-learning.json",
    preview: "data/quality/ag18d-first-public-candidate-file-delta-dry-run-audit-preview.json",
    document: "docs/quality/AG18D_FIRST_PUBLIC_CANDIDATE_FILE_DELTA_DRY_RUN_AUDIT.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG18D",
  preview_only: true,
  status: "first_public_candidate_file_delta_dry_run_audit_passed_ready_for_ag18e_non_active_scaffold",
  audit_passed: true,
  failed_checks: 0,
  ready_for_ag18e: true,
  selected_path: "hybrid_staged_path_static_first",
  supabase_auth_backend_deferred: true,
  github_token_ready: false,
  github_write_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG18D — First Public Candidate and File Delta Dry-run Audit

## Purpose

AG18D audits the AG18C first public candidate and file delta dry-run outputs.

AG18D is audit-only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Audit Result

AG18C dry-run outputs passed audit with zero failed checks.

## Decision

AG18E may proceed only as a non-active real static activation scaffold.

Not approved: real candidate apply, GitHub token creation, GitHub write, public visibility switch, public index mutation, deployment trigger, publish execution or Supabase/Auth/backend activation.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG18E — Non-active Real Static Activation Scaffold — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditPath, auditReport);
writeJson(decisionPath, decision);
writeJson(safetyPath, safety);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG18D First Public Candidate and File Delta Dry-run Audit generated.");
console.log("✅ AG18C dry-run audit passed with zero failed checks.");
console.log("✅ Decision recorded: proceed only to AG18E non-active real static activation scaffold.");
console.log("✅ GitHub token, GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG18E Non-active Real Static Activation Scaffold boundary created.");
