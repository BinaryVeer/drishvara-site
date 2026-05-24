import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag18bReview: "data/content-intelligence/quality-reviews/ag18b-controlled-real-static-activation-plan-audit.json",
  ag18bAudit: "data/content-intelligence/audit-records/ag18b-controlled-real-static-activation-plan-audit-report.json",
  ag18bDecision: "data/content-intelligence/go-live/ag18b-first-candidate-file-delta-dry-run-readiness-decision-record.json",
  ag18bSafety: "data/content-intelligence/quality-registry/ag18b-real-static-activation-safety-record.json",
  ag18bReadiness: "data/content-intelligence/quality-registry/ag18b-first-candidate-file-delta-dry-run-readiness-record.json",
  ag18bBoundary: "data/content-intelligence/mutation-plans/ag18b-to-ag18c-first-public-candidate-file-delta-dry-run-boundary.json",
  ag18aCandidate: "data/content-intelligence/go-live/ag18a-first-public-candidate-selection-plan.json",
  ag18aSecret: "data/content-intelligence/go-live/ag18a-github-secret-governance-no-secrets-plan.json",
  ag18aDelta: "data/content-intelligence/go-live/ag18a-public-index-delta-review-plan.json",
  ag18aRollback: "data/content-intelligence/go-live/ag18a-rollback-smoke-test-plan.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag16zSummary: "data/content-intelligence/content-pipeline/ag16z-public-visibility-publish-control-summary.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag18c-first-public-candidate-file-delta-dry-run.json");
const candidateDryRunPath = path.join(root, "data/content-intelligence/go-live/ag18c-candidate-readiness-dry-run.json");
const publicFilterDryRunPath = path.join(root, "data/content-intelligence/go-live/ag18c-public-filter-dry-run.json");
const fileDeltaDryRunPath = path.join(root, "data/content-intelligence/go-live/ag18c-intended-file-delta-dry-run.json");
const featuredReadsDeltaPath = path.join(root, "data/content-intelligence/go-live/ag18c-featured-reads-delta-dry-run.json");
const categoryListingDeltaPath = path.join(root, "data/content-intelligence/go-live/ag18c-category-listing-delta-dry-run.json");
const homepageDeltaPath = path.join(root, "data/content-intelligence/go-live/ag18c-homepage-card-delta-dry-run.json");
const sitemapDeltaPath = path.join(root, "data/content-intelligence/go-live/ag18c-sitemap-feed-search-delta-dry-run.json");
const rollbackDryRunPath = path.join(root, "data/content-intelligence/go-live/ag18c-rollback-smoke-test-dry-run.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag18c-first-public-candidate-file-delta-dry-run-audit-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag18c-to-ag18d-first-public-candidate-file-delta-dry-run-audit-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/first-public-candidate-file-delta-dry-run.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag18c-first-public-candidate-file-delta-dry-run-learning.json");
const registryPath = path.join(root, "data/quality/ag18c-first-public-candidate-file-delta-dry-run.json");
const previewPath = path.join(root, "data/quality/ag18c-first-public-candidate-file-delta-dry-run-preview.json");
const docPath = path.join(root, "docs/quality/AG18C_FIRST_PUBLIC_CANDIDATE_FILE_DELTA_DRY_RUN.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG18C input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag18bReview.status !== "controlled_real_static_activation_plan_audit_passed_ready_for_ag18c_dry_run") {
  throw new Error("AG18C requires AG18B review readiness.");
}
if (data.ag18bAudit.failed_checks.length !== 0) {
  throw new Error("AG18C requires AG18B audit to pass with zero failed checks.");
}
if (data.ag18bDecision.decision.proceed_to_first_public_candidate_file_delta_dry_run !== true) {
  throw new Error("AG18C requires AG18B decision to proceed to dry-run.");
}
if (data.ag18bDecision.decision.proceed_to_github_write !== false) {
  throw new Error("AG18C requires GitHub write to remain blocked.");
}
if (data.ag18bDecision.decision.proceed_to_public_visibility_switch !== false) {
  throw new Error("AG18C requires public visibility switch to remain blocked.");
}
if (data.ag18bDecision.decision.proceed_to_public_index_mutation !== false) {
  throw new Error("AG18C requires public index mutation to remain blocked.");
}
if (data.ag18bDecision.decision.proceed_to_deployment_trigger !== false) {
  throw new Error("AG18C requires deployment trigger to remain blocked.");
}
if (data.ag18bDecision.decision.proceed_to_publish_execution !== false) {
  throw new Error("AG18C requires publishing to remain blocked.");
}
if (data.ag18bDecision.decision.proceed_to_supabase_auth_backend_activation !== false) {
  throw new Error("AG18C requires Supabase/Auth/backend to remain deferred.");
}
if (data.ag18bReadiness.ready_for_ag18c !== true) {
  throw new Error("AG18C requires AG18B readiness.");
}
if (data.ag18bBoundary.next_stage_id !== "AG18C" || data.ag18bBoundary.explicit_approval_required !== true) {
  throw new Error("AG18C requires AG18B to AG18C explicit boundary.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG18C requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  first_public_candidate_file_delta_dry_run_only: true,
  candidate_readiness_dry_run_created_in_ag18c: true,
  public_filter_dry_run_created_in_ag18c: true,
  intended_file_delta_dry_run_created_in_ag18c: true,
  featured_reads_delta_dry_run_created_in_ag18c: true,
  category_listing_delta_dry_run_created_in_ag18c: true,
  homepage_card_delta_dry_run_created_in_ag18c: true,
  sitemap_feed_search_delta_dry_run_created_in_ag18c: true,
  rollback_smoke_test_dry_run_created_in_ag18c: true,
  ag18d_boundary_created_in_ag18c: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag18c: false,
  article_mutation_performed_in_ag18c: false,
  queue_mutation_performed_in_ag18c: false,
  active_admin_review_queue_record_created_in_ag18c: false,
  queue_index_mutation_performed_in_ag18c: false,
  admin_action_execution_performed_in_ag18c: false,
  editor_action_execution_performed_in_ag18c: false,
  real_credential_created_in_ag18c: false,
  hardcoded_password_created_in_repo_in_ag18c: false,
  password_hash_created_in_repo_in_ag18c: false,
  auth_activation_performed_in_ag18c: false,
  backend_activation_performed_in_ag18c: false,
  supabase_activation_performed_in_ag18c: false,
  database_write_performed_in_ag18c: false,
  github_token_created_or_exposed_in_ag18c: false,
  github_write_operation_performed_in_ag18c: false,
  active_action_handler_created_in_ag18c: false,
  api_endpoint_created_in_ag18c: false,
  public_visibility_switch_performed_in_ag18c: false,
  public_index_mutation_performed_in_ag18c: false,
  deployment_trigger_performed_in_ag18c: false,
  public_publishing_operation_performed_in_ag18c: false
};

const candidateDryRun = {
  module_id: "AG18C",
  title: "Candidate Readiness Dry-run",
  status: "candidate_readiness_dry_run_completed_no_apply",
  dry_run_only: true,
  candidate: {
    source_record: inputs.ag13zCandidate,
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  current_state_assessment: {
    candidate_under_consideration: true,
    selected_for_real_apply_now: false,
    admin_approval_evidence_verified_now: false,
    quality_evidence_verified_now: false,
    reference_verification_verified_now: false,
    image_credit_verified_now: false,
    preview_verified_now: false,
    ready_for_real_apply_now: false,
    reason: "AG18C is dry-run only. Evidence gates are modelled but not applied as live approval."
  },
  future_apply_requirements: data.ag18aCandidate.eligibility_requirements_before_future_apply,
  mutation_state_now: {
    article_mutated: false,
    queue_mutated: false,
    public_visibility_switched: false,
    public_index_mutated: false,
    published: false
  },
  ...stageControls
};

const publicFilterDryRun = {
  module_id: "AG18C",
  title: "Public Filter Dry-run",
  status: "public_filter_dry_run_completed_no_visibility_switch",
  dry_run_only: true,
  current_candidate_state: {
    public_visibility: false,
    publish_approved: false,
    public_index_allowed: false,
    article_hash: currentArticleHash,
    approved_hash: null,
    quality_evidence_status: "not_applied_in_ag18c",
    preview_status: "not_applied_in_ag18c",
    hash_integrity_status: "source_hash_verified_only"
  },
  current_public_filter_result: {
    passed: false,
    public_exposure_allowed_now: false,
    failure_reasons: [
      "public_visibility is not true",
      "publish_approved is not true",
      "public_index_allowed is not true",
      "approved_hash is not applied",
      "quality evidence is not applied as final public evidence",
      "preview is not applied as final public evidence"
    ]
  },
  hypothetical_future_public_filter_result: {
    passed: true,
    public_exposure_allowed_now: false,
    note: "Hypothetical future state only. AG18C does not switch visibility, mutate indexes, deploy or publish."
  },
  inherited_public_controls: data.ag16zSummary.final_public_control_state,
  ...stageControls
};

const intendedFileDeltaDryRun = {
  module_id: "AG18C",
  title: "Intended File Delta Dry-run",
  status: "intended_file_delta_dry_run_completed_no_file_mutation",
  dry_run_only: true,
  candidate_article_path: articlePath,
  candidate_article_hash: currentArticleHash,
  intended_delta_summary: {
    total_preview_targets: 5,
    real_file_mutation_performed: false,
    git_write_performed: false,
    deployment_triggered: false
  },
  intended_delta_targets_preview: [
    {
      target_id: "featured_reads_index",
      preview_file_role: "Featured Reads listing/index entry preview",
      intended_action_later: "add approved article card/listing",
      mutation_now: false
    },
    {
      target_id: "category_listing",
      preview_file_role: "Category/topic listing preview",
      intended_action_later: "add article to category list",
      mutation_now: false
    },
    {
      target_id: "homepage_card",
      preview_file_role: "Homepage reading surface card preview, if approved later",
      intended_action_later: "add homepage card only if selected",
      mutation_now: false
    },
    {
      target_id: "episode_index",
      preview_file_role: "Future episode/series index preview, if applicable later",
      intended_action_later: "link episode only if series engine applies",
      mutation_now: false
    },
    {
      target_id: "sitemap_feed_search",
      preview_file_role: "Sitemap/feed/search preview, if approved later",
      intended_action_later: "update only if AG19/AG20 approves",
      mutation_now: false
    }
  ],
  forbidden_now: [
    "No actual file delta written.",
    "No public index file modified.",
    "No Featured Reads index modified.",
    "No homepage modified.",
    "No sitemap/feed/search file modified.",
    "No GitHub commit or push."
  ],
  ...stageControls
};

const featuredReadsDeltaDryRun = {
  module_id: "AG18C",
  title: "Featured Reads Delta Dry-run",
  status: "featured_reads_delta_dry_run_completed_no_mutation",
  dry_run_only: true,
  preview_card: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    display_status: "preview_only_not_public",
    include_now: false,
    reason: "Featured Reads listing may be previewed only; public listing mutation is blocked."
  },
  mutation_now: false,
  featured_reads_index_mutated: false,
  ...stageControls
};

const categoryListingDeltaDryRun = {
  module_id: "AG18C",
  title: "Category Listing Delta Dry-run",
  status: "category_listing_delta_dry_run_completed_no_mutation",
  dry_run_only: true,
  preview_listing: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    category_status: "preview_only_not_public",
    include_now: false
  },
  mutation_now: false,
  category_listing_mutated: false,
  ...stageControls
};

const homepageDeltaDryRun = {
  module_id: "AG18C",
  title: "Homepage Card Delta Dry-run",
  status: "homepage_card_delta_dry_run_completed_no_mutation",
  dry_run_only: true,
  homepage_card_preview: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    homepage_selection_now: false,
    include_now: false,
    reason: "Homepage card exposure must wait until later approved public apply stage."
  },
  mutation_now: false,
  homepage_mutated: false,
  ...stageControls
};

const sitemapDeltaDryRun = {
  module_id: "AG18C",
  title: "Sitemap Feed Search Delta Dry-run",
  status: "sitemap_feed_search_delta_dry_run_completed_no_mutation",
  dry_run_only: true,
  preview_targets: [
    {
      target_id: "sitemap",
      include_later_only_if_approved: true,
      mutation_now: false
    },
    {
      target_id: "feed",
      include_later_only_if_approved: true,
      mutation_now: false
    },
    {
      target_id: "search_index",
      include_later_only_if_approved: true,
      mutation_now: false
    }
  ],
  sitemap_feed_search_mutated: false,
  ...stageControls
};

const rollbackDryRun = {
  module_id: "AG18C",
  title: "Rollback Smoke-test Dry-run",
  status: "rollback_smoke_test_dry_run_completed_no_execution",
  dry_run_only: true,
  rollback_preview: {
    pre_write_commit_hash_required_later: true,
    revert_path_required_later: true,
    rollback_executed_now: false
  },
  smoke_test_preview: {
    article_url_check_planned: true,
    featured_reads_check_planned: true,
    category_listing_check_planned: true,
    homepage_check_planned: true,
    mobile_layout_check_planned: true,
    reference_and_image_credit_check_planned: true,
    smoke_test_executed_now: false
  },
  inherited_requirements: {
    rollback: data.ag18aRollback.rollback_requirements_before_future_apply,
    smoke_test: data.ag18aRollback.smoke_test_requirements_after_future_apply
  },
  ...stageControls
};

const readiness = {
  module_id: "AG18C",
  title: "First Public Candidate File Delta Dry-run Audit Readiness Record",
  status: "ready_for_ag18d_first_public_candidate_file_delta_dry_run_audit",
  ready_for_ag18d: true,
  ag18d_explicit_approval_required: true,
  candidate_readiness_dry_run_completed: true,
  public_filter_dry_run_completed: true,
  intended_file_delta_dry_run_completed: true,
  featured_reads_delta_dry_run_completed: true,
  category_listing_delta_dry_run_completed: true,
  homepage_card_delta_dry_run_completed: true,
  sitemap_feed_search_delta_dry_run_completed: true,
  rollback_smoke_test_dry_run_completed: true,
  selected_path: "hybrid_staged_path_static_first",
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  supabase_auth_reminder_required_in_future: true,
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
  reason: "AG18C completes dry-run records only. AG18D should audit these dry-runs before any later scaffold or pre-apply stage.",
  ...stageControls
};

const boundary = {
  module_id: "AG18C",
  title: "AG18C to AG18D First Public Candidate File Delta Dry-run Audit Boundary",
  status: "ag18d_boundary_created_not_started",
  next_stage_id: "AG18D",
  next_stage_title: "First Public Candidate and File Delta Dry-run Audit",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  ag18d_allowed_scope: [
    "Audit candidate readiness dry-run.",
    "Audit public filter dry-run.",
    "Audit intended file delta dry-run.",
    "Audit Featured Reads delta dry-run.",
    "Audit category listing delta dry-run.",
    "Audit homepage card delta dry-run.",
    "Audit sitemap/feed/search delta dry-run, if applicable.",
    "Audit rollback and smoke-test dry-run.",
    "Confirm Supabase/Auth/backend remains deferred."
  ],
  ag18d_blocked_scope: [
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
  supabase_auth_defer_reminder_required_in_ag18d: true,
  ...stageControls
};

const schema = {
  module_id: "AG18C",
  title: "First Public Candidate File Delta Dry-run Schema",
  status: "schema_first_public_candidate_file_delta_dry_run_only",
  candidate_readiness_dry_run_allowed_in_ag18c: true,
  public_filter_dry_run_allowed_in_ag18c: true,
  intended_file_delta_dry_run_allowed_in_ag18c: true,
  featured_reads_delta_dry_run_allowed_in_ag18c: true,
  category_listing_delta_dry_run_allowed_in_ag18c: true,
  homepage_card_delta_dry_run_allowed_in_ag18c: true,
  sitemap_feed_search_delta_dry_run_allowed_in_ag18c: true,
  rollback_smoke_test_dry_run_allowed_in_ag18c: true,
  ag18d_boundary_allowed_in_ag18c: true,

  article_generation_allowed_in_ag18c: false,
  article_mutation_allowed_in_ag18c: false,
  queue_mutation_allowed_in_ag18c: false,
  active_admin_review_queue_record_creation_allowed_in_ag18c: false,
  queue_index_mutation_allowed_in_ag18c: false,
  admin_action_execution_allowed_in_ag18c: false,
  editor_action_execution_allowed_in_ag18c: false,
  real_credential_creation_allowed_in_ag18c: false,
  auth_activation_allowed_in_ag18c: false,
  backend_activation_allowed_in_ag18c: false,
  supabase_activation_allowed_in_ag18c: false,
  database_write_allowed_in_ag18c: false,
  github_token_creation_or_exposure_allowed_in_ag18c: false,
  github_write_operation_allowed_in_ag18c: false,
  active_action_handler_creation_allowed_in_ag18c: false,
  api_endpoint_creation_allowed_in_ag18c: false,
  public_visibility_switch_allowed_in_ag18c: false,
  public_index_mutation_allowed_in_ag18c: false,
  public_publishing_operation_allowed_in_ag18c: false,
  deployment_trigger_allowed_in_ag18c: false,
  ...stageControls
};

const review = {
  module_id: "AG18C",
  title: "First Public Candidate and File Delta Dry-run",
  status: "first_public_candidate_file_delta_dry_run_completed_ready_for_ag18d_audit",
  depends_on: ["AG18B"],
  generated_from: inputs,
  candidate_dry_run_file: "data/content-intelligence/go-live/ag18c-candidate-readiness-dry-run.json",
  public_filter_dry_run_file: "data/content-intelligence/go-live/ag18c-public-filter-dry-run.json",
  intended_file_delta_dry_run_file: "data/content-intelligence/go-live/ag18c-intended-file-delta-dry-run.json",
  featured_reads_delta_dry_run_file: "data/content-intelligence/go-live/ag18c-featured-reads-delta-dry-run.json",
  category_listing_delta_dry_run_file: "data/content-intelligence/go-live/ag18c-category-listing-delta-dry-run.json",
  homepage_card_delta_dry_run_file: "data/content-intelligence/go-live/ag18c-homepage-card-delta-dry-run.json",
  sitemap_feed_search_delta_dry_run_file: "data/content-intelligence/go-live/ag18c-sitemap-feed-search-delta-dry-run.json",
  rollback_smoke_test_dry_run_file: "data/content-intelligence/go-live/ag18c-rollback-smoke-test-dry-run.json",
  readiness_file: "data/content-intelligence/quality-registry/ag18c-first-public-candidate-file-delta-dry-run-audit-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag18c-to-ag18d-first-public-candidate-file-delta-dry-run-audit-boundary.json",
  schema_file: "data/content-intelligence/schema/first-public-candidate-file-delta-dry-run.schema.json",
  summary: {
    dry_run_completed: true,
    ready_for_ag18d: true,
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
  module_id: "AG18C",
  title: "First Public Candidate File Delta Dry-run Learning",
  status: "learning_record_only",
  learning_points: [
    "AG18C dry-runs the first public candidate and intended public surface deltas without applying them.",
    "Current candidate state remains non-public because visibility, publish approval and public index flags are not switched.",
    "Featured Reads, category listing, homepage card and sitemap/feed/search changes are preview-only.",
    "Rollback and smoke-test gates are planned but not executed.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG18C",
  title: "First Public Candidate and File Delta Dry-run",
  status: "first_public_candidate_file_delta_dry_run_completed_ready_for_ag18d_audit",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag18c-first-public-candidate-file-delta-dry-run.json",
    candidate_readiness_dry_run: "data/content-intelligence/go-live/ag18c-candidate-readiness-dry-run.json",
    public_filter_dry_run: "data/content-intelligence/go-live/ag18c-public-filter-dry-run.json",
    intended_file_delta_dry_run: "data/content-intelligence/go-live/ag18c-intended-file-delta-dry-run.json",
    featured_reads_delta_dry_run: "data/content-intelligence/go-live/ag18c-featured-reads-delta-dry-run.json",
    category_listing_delta_dry_run: "data/content-intelligence/go-live/ag18c-category-listing-delta-dry-run.json",
    homepage_card_delta_dry_run: "data/content-intelligence/go-live/ag18c-homepage-card-delta-dry-run.json",
    sitemap_feed_search_delta_dry_run: "data/content-intelligence/go-live/ag18c-sitemap-feed-search-delta-dry-run.json",
    rollback_smoke_test_dry_run: "data/content-intelligence/go-live/ag18c-rollback-smoke-test-dry-run.json",
    readiness: "data/content-intelligence/quality-registry/ag18c-first-public-candidate-file-delta-dry-run-audit-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag18c-to-ag18d-first-public-candidate-file-delta-dry-run-audit-boundary.json",
    schema: "data/content-intelligence/schema/first-public-candidate-file-delta-dry-run.schema.json",
    learning: "data/content-intelligence/learning/ag18c-first-public-candidate-file-delta-dry-run-learning.json",
    preview: "data/quality/ag18c-first-public-candidate-file-delta-dry-run-preview.json",
    document: "docs/quality/AG18C_FIRST_PUBLIC_CANDIDATE_FILE_DELTA_DRY_RUN.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG18C",
  preview_only: true,
  status: "first_public_candidate_file_delta_dry_run_completed_ready_for_ag18d_audit",
  dry_run_completed: true,
  ready_for_ag18d: true,
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

const doc = `# AG18C — First Public Candidate and File Delta Dry-run

## Purpose

AG18C dry-runs the first public candidate and intended file/public-surface deltas.

AG18C is dry-run only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Dry-run Outputs

- Candidate readiness dry-run
- Public filter dry-run
- Intended file delta dry-run
- Featured Reads delta dry-run
- Category listing delta dry-run
- Homepage card delta dry-run
- Sitemap/feed/search delta dry-run
- Rollback and smoke-test dry-run

## Decision State

The candidate remains non-public. All public exposure, GitHub write, deployment and publishing actions remain blocked.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG18D — First Public Candidate and File Delta Dry-run Audit — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(candidateDryRunPath, candidateDryRun);
writeJson(publicFilterDryRunPath, publicFilterDryRun);
writeJson(fileDeltaDryRunPath, intendedFileDeltaDryRun);
writeJson(featuredReadsDeltaPath, featuredReadsDeltaDryRun);
writeJson(categoryListingDeltaPath, categoryListingDeltaDryRun);
writeJson(homepageDeltaPath, homepageDeltaDryRun);
writeJson(sitemapDeltaPath, sitemapDeltaDryRun);
writeJson(rollbackDryRunPath, rollbackDryRun);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG18C First Public Candidate and File Delta Dry-run generated.");
console.log("✅ Candidate readiness and public filter dry-runs completed without apply.");
console.log("✅ Featured Reads, category, homepage and sitemap/feed/search deltas are preview-only.");
console.log("✅ Rollback and smoke-test dry-runs completed without execution.");
console.log("✅ GitHub token, GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG18D Dry-run Audit boundary created.");
