import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag19bReview: "data/content-intelligence/quality-reviews/ag19b-pre-apply-readiness-audit.json",
  ag19bAudit: "data/content-intelligence/audit-records/ag19b-pre-apply-readiness-audit-report.json",
  ag19bDecision: "data/content-intelligence/go-live/ag19b-final-public-delta-dry-run-readiness-decision-record.json",
  ag19bSafety: "data/content-intelligence/quality-registry/ag19b-pre-apply-safety-record.json",
  ag19bReadiness: "data/content-intelligence/quality-registry/ag19b-final-public-delta-dry-run-readiness-record.json",
  ag19bBoundary: "data/content-intelligence/mutation-plans/ag19b-to-ag19c-final-public-delta-dry-run-boundary.json",
  ag19aCandidateEvidence: "data/content-intelligence/go-live/ag19a-first-candidate-evidence-requirement-plan.json",
  ag19aPublicFilterEvidence: "data/content-intelligence/go-live/ag19a-final-public-filter-evidence-plan.json",
  ag19aExactFileDelta: "data/content-intelligence/go-live/ag19a-exact-file-delta-pre-apply-plan.json",
  ag19aRollbackStrategy: "data/content-intelligence/go-live/ag19a-rollback-branch-commit-strategy-plan.json",
  ag19aManualApproval: "data/content-intelligence/go-live/ag19a-manual-approval-gate-plan.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag19c-final-public-delta-dry-run.json");
const deltaDryRunPath = path.join(root, "data/content-intelligence/go-live/ag19c-final-public-delta-dry-run-record.json");
const beforeAfterPath = path.join(root, "data/content-intelligence/go-live/ag19c-before-after-public-surface-preview.json");
const featuredPath = path.join(root, "data/content-intelligence/go-live/ag19c-featured-reads-final-delta-preview.json");
const categoryPath = path.join(root, "data/content-intelligence/go-live/ag19c-category-listing-final-delta-preview.json");
const homepagePath = path.join(root, "data/content-intelligence/go-live/ag19c-homepage-card-final-delta-preview.json");
const sitemapPath = path.join(root, "data/content-intelligence/go-live/ag19c-sitemap-feed-search-final-delta-preview.json");
const rollbackSmokePath = path.join(root, "data/content-intelligence/go-live/ag19c-rollback-smoke-test-final-preview.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag19c-final-public-delta-dry-run-audit-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag19c-to-ag19d-final-public-delta-dry-run-audit-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/final-public-delta-dry-run.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag19c-final-public-delta-dry-run-learning.json");
const registryPath = path.join(root, "data/quality/ag19c-final-public-delta-dry-run.json");
const previewPath = path.join(root, "data/quality/ag19c-final-public-delta-dry-run-preview.json");
const docPath = path.join(root, "docs/quality/AG19C_FINAL_PUBLIC_DELTA_DRY_RUN.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG19C input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag19bReview.status !== "pre_apply_readiness_audit_passed_ready_for_ag19c_final_public_delta_dry_run") {
  throw new Error("AG19C requires AG19B review readiness.");
}
if (data.ag19bAudit.failed_checks.length !== 0) {
  throw new Error("AG19C requires AG19B audit with zero failed checks.");
}
if (data.ag19bDecision.decision.proceed_to_final_public_delta_dry_run !== true) {
  throw new Error("AG19C requires AG19B decision to proceed to final public delta dry-run.");
}
for (const key of [
  "proceed_to_real_candidate_apply",
  "proceed_to_github_token_creation",
  "proceed_to_github_write",
  "proceed_to_public_visibility_switch",
  "proceed_to_public_index_mutation",
  "proceed_to_deployment_trigger",
  "proceed_to_publish_execution",
  "proceed_to_supabase_auth_backend_activation"
]) {
  if (data.ag19bDecision.decision[key] !== false) throw new Error(`AG19C requires ${key} to remain blocked.`);
}
if (data.ag19bReadiness.ready_for_ag19c !== true) {
  throw new Error("AG19C requires AG19B readiness.");
}
if (data.ag19bBoundary.next_stage_id !== "AG19C" || data.ag19bBoundary.explicit_approval_required !== true) {
  throw new Error("AG19C requires AG19B to AG19C explicit boundary.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG19C requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  final_public_delta_dry_run_only: true,
  final_public_delta_dry_run_created_in_ag19c: true,
  before_after_public_surface_preview_created_in_ag19c: true,
  featured_reads_final_delta_preview_created_in_ag19c: true,
  category_listing_final_delta_preview_created_in_ag19c: true,
  homepage_card_final_delta_preview_created_in_ag19c: true,
  sitemap_feed_search_final_delta_preview_created_in_ag19c: true,
  rollback_smoke_test_final_preview_created_in_ag19c: true,
  ag19d_boundary_created_in_ag19c: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag19c: false,
  article_mutation_performed_in_ag19c: false,
  queue_mutation_performed_in_ag19c: false,
  active_admin_review_queue_record_created_in_ag19c: false,
  queue_index_mutation_performed_in_ag19c: false,
  admin_action_execution_performed_in_ag19c: false,
  editor_action_execution_performed_in_ag19c: false,
  real_credential_created_in_ag19c: false,
  hardcoded_password_created_in_repo_in_ag19c: false,
  password_hash_created_in_repo_in_ag19c: false,
  auth_activation_performed_in_ag19c: false,
  backend_activation_performed_in_ag19c: false,
  supabase_activation_performed_in_ag19c: false,
  database_write_performed_in_ag19c: false,
  github_token_created_or_exposed_in_ag19c: false,
  github_write_operation_performed_in_ag19c: false,
  active_action_handler_created_in_ag19c: false,
  api_endpoint_created_in_ag19c: false,
  public_visibility_switch_performed_in_ag19c: false,
  public_index_mutation_performed_in_ag19c: false,
  deployment_trigger_performed_in_ag19c: false,
  public_publishing_operation_performed_in_ag19c: false
};

const publicTargets = [
  {
    target_id: "featured_reads_index",
    future_action_preview: "Add approved article card/listing to Featured Reads.",
    exact_file_mutation_now: false,
    apply_now: false
  },
  {
    target_id: "category_listing",
    future_action_preview: "Add approved article to relevant category listing.",
    exact_file_mutation_now: false,
    apply_now: false
  },
  {
    target_id: "homepage_card",
    future_action_preview: "Add homepage card only if separately approved.",
    exact_file_mutation_now: false,
    apply_now: false
  },
  {
    target_id: "sitemap_feed_search",
    future_action_preview: "Update sitemap/feed/search only if approved in later apply stage.",
    exact_file_mutation_now: false,
    apply_now: false
  }
];

const finalDeltaDryRun = {
  module_id: "AG19C",
  title: "Final Public Delta Dry-run Record",
  status: "final_public_delta_dry_run_completed_no_mutation",
  dry_run_only: true,
  candidate_article_path: articlePath,
  candidate_article_hash: currentArticleHash,
  proposed_public_targets_preview: publicTargets,
  dry_run_result: {
    final_delta_preview_completed: true,
    exact_files_selected_for_real_apply_now: false,
    real_file_delta_generated_now: false,
    git_write_performed_now: false,
    public_visibility_switched_now: false,
    public_index_mutated_now: false,
    deployment_triggered_now: false,
    published_now: false
  },
  inherited_exact_file_delta_plan: inputs.ag19aExactFileDelta,
  ...stageControls
};

const beforeAfterPreview = {
  module_id: "AG19C",
  title: "Before/After Public Surface Preview",
  status: "before_after_public_surface_preview_completed_no_mutation",
  dry_run_only: true,
  before_state: {
    article_publicly_visible: false,
    featured_reads_contains_article: false,
    category_listing_contains_article: false,
    homepage_contains_article_card: false,
    sitemap_feed_search_contains_article: false
  },
  after_state_preview_only: {
    article_publicly_visible_after_future_apply: true,
    featured_reads_contains_article_after_future_apply: true,
    category_listing_contains_article_after_future_apply: true,
    homepage_contains_article_card_after_future_apply: "only_if_separately_approved",
    sitemap_feed_search_contains_article_after_future_apply: "only_if_approved"
  },
  actual_after_state_now: {
    article_publicly_visible: false,
    featured_reads_contains_article: false,
    category_listing_contains_article: false,
    homepage_contains_article_card: false,
    sitemap_feed_search_contains_article: false
  },
  mutation_now: false,
  ...stageControls
};

const featuredPreview = {
  module_id: "AG19C",
  title: "Featured Reads Final Delta Preview",
  status: "featured_reads_final_delta_preview_completed_no_mutation",
  dry_run_only: true,
  preview_card: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    include_after_future_apply_only: true,
    include_now: false
  },
  mutation_now: false,
  featured_reads_index_mutated: false,
  ...stageControls
};

const categoryPreview = {
  module_id: "AG19C",
  title: "Category Listing Final Delta Preview",
  status: "category_listing_final_delta_preview_completed_no_mutation",
  dry_run_only: true,
  preview_listing: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    include_after_future_apply_only: true,
    include_now: false
  },
  mutation_now: false,
  category_listing_mutated: false,
  ...stageControls
};

const homepagePreview = {
  module_id: "AG19C",
  title: "Homepage Card Final Delta Preview",
  status: "homepage_card_final_delta_preview_completed_no_mutation",
  dry_run_only: true,
  homepage_card_preview: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    include_after_future_apply_only_if_selected: true,
    include_now: false
  },
  mutation_now: false,
  homepage_mutated: false,
  ...stageControls
};

const sitemapPreview = {
  module_id: "AG19C",
  title: "Sitemap Feed Search Final Delta Preview",
  status: "sitemap_feed_search_final_delta_preview_completed_no_mutation",
  dry_run_only: true,
  preview_targets: [
    { target_id: "sitemap", include_after_future_apply_only_if_approved: true, include_now: false, mutation_now: false },
    { target_id: "feed", include_after_future_apply_only_if_approved: true, include_now: false, mutation_now: false },
    { target_id: "search_index", include_after_future_apply_only_if_approved: true, include_now: false, mutation_now: false }
  ],
  sitemap_feed_search_mutated: false,
  ...stageControls
};

const rollbackSmokePreview = {
  module_id: "AG19C",
  title: "Rollback Smoke-test Final Preview",
  status: "rollback_smoke_test_final_preview_completed_no_execution",
  dry_run_only: true,
  rollback_preview: {
    pre_write_commit_hash_required_later: true,
    exact_delta_required_later: true,
    rollback_command_required_later: true,
    rollback_executed_now: false
  },
  smoke_test_preview: {
    article_url_check_planned: true,
    featured_reads_check_planned: true,
    category_listing_check_planned: true,
    homepage_check_planned: true,
    sitemap_feed_search_check_planned: true,
    mobile_layout_check_planned: true,
    reference_and_image_credit_check_planned: true,
    smoke_test_executed_now: false
  },
  inherited_rollback_strategy: inputs.ag19aRollbackStrategy,
  ...stageControls
};

const readiness = {
  module_id: "AG19C",
  title: "Final Public Delta Dry-run Audit Readiness Record",
  status: "ready_for_ag19d_final_public_delta_dry_run_audit",
  ready_for_ag19d: true,
  ag19d_explicit_approval_required: true,
  final_public_delta_dry_run_completed: true,
  before_after_public_surface_preview_completed: true,
  featured_reads_final_delta_preview_completed: true,
  category_listing_final_delta_preview_completed: true,
  homepage_card_final_delta_preview_completed: true,
  sitemap_feed_search_final_delta_preview_completed: true,
  rollback_smoke_test_final_preview_completed: true,
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
  candidate_apply_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  publish_ready: false,
  reason: "AG19C completes final public delta dry-run only. AG19D should audit before any first static activation approval package.",
  ...stageControls
};

const boundary = {
  module_id: "AG19C",
  title: "AG19C to AG19D Final Public Delta Dry-run Audit Boundary",
  status: "ag19d_boundary_created_not_started",
  next_stage_id: "AG19D",
  next_stage_title: "Final Public Delta Dry-run Audit",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  ag19d_allowed_scope: [
    "Audit final public delta dry-run.",
    "Audit before/after public surface preview.",
    "Audit Featured Reads final delta preview.",
    "Audit category listing final delta preview.",
    "Audit homepage final delta preview.",
    "Audit sitemap/feed/search final delta preview.",
    "Audit rollback and smoke-test final preview.",
    "Confirm Supabase/Auth/backend remains deferred."
  ],
  ag19d_blocked_scope: [
    "No new article generation.",
    "No article mutation.",
    "No active queue mutation.",
    "No Admin/Editor action execution.",
    "No real credentials.",
    "No Auth/backend/Supabase activation.",
    "No GitHub token creation or wiring.",
    "No GitHub content write.",
    "No public visibility switch.",
    "No public index mutation.",
    "No publishing operation.",
    "No deployment trigger."
  ],
  supabase_auth_defer_reminder_required_in_ag19d: true,
  ...stageControls
};

const schema = {
  module_id: "AG19C",
  title: "Final Public Delta Dry-run Schema",
  status: "schema_final_public_delta_dry_run_only",
  final_public_delta_dry_run_allowed_in_ag19c: true,
  before_after_public_surface_preview_allowed_in_ag19c: true,
  featured_reads_delta_preview_allowed_in_ag19c: true,
  category_listing_delta_preview_allowed_in_ag19c: true,
  homepage_card_delta_preview_allowed_in_ag19c: true,
  sitemap_feed_search_delta_preview_allowed_in_ag19c: true,
  rollback_smoke_test_final_preview_allowed_in_ag19c: true,
  ag19d_boundary_allowed_in_ag19c: true,

  article_generation_allowed_in_ag19c: false,
  article_mutation_allowed_in_ag19c: false,
  queue_mutation_allowed_in_ag19c: false,
  active_admin_review_queue_record_creation_allowed_in_ag19c: false,
  queue_index_mutation_allowed_in_ag19c: false,
  admin_action_execution_allowed_in_ag19c: false,
  editor_action_execution_allowed_in_ag19c: false,
  real_credential_creation_allowed_in_ag19c: false,
  auth_activation_allowed_in_ag19c: false,
  backend_activation_allowed_in_ag19c: false,
  supabase_activation_allowed_in_ag19c: false,
  database_write_allowed_in_ag19c: false,
  github_token_creation_or_exposure_allowed_in_ag19c: false,
  github_write_operation_allowed_in_ag19c: false,
  active_action_handler_creation_allowed_in_ag19c: false,
  api_endpoint_creation_allowed_in_ag19c: false,
  public_visibility_switch_allowed_in_ag19c: false,
  public_index_mutation_allowed_in_ag19c: false,
  public_publishing_operation_allowed_in_ag19c: false,
  deployment_trigger_allowed_in_ag19c: false,
  ...stageControls
};

const review = {
  module_id: "AG19C",
  title: "Final Public Delta Dry-run",
  status: "final_public_delta_dry_run_completed_ready_for_ag19d_audit",
  depends_on: ["AG19B"],
  generated_from: inputs,
  final_delta_dry_run_file: "data/content-intelligence/go-live/ag19c-final-public-delta-dry-run-record.json",
  before_after_preview_file: "data/content-intelligence/go-live/ag19c-before-after-public-surface-preview.json",
  featured_reads_preview_file: "data/content-intelligence/go-live/ag19c-featured-reads-final-delta-preview.json",
  category_listing_preview_file: "data/content-intelligence/go-live/ag19c-category-listing-final-delta-preview.json",
  homepage_card_preview_file: "data/content-intelligence/go-live/ag19c-homepage-card-final-delta-preview.json",
  sitemap_feed_search_preview_file: "data/content-intelligence/go-live/ag19c-sitemap-feed-search-final-delta-preview.json",
  rollback_smoke_test_preview_file: "data/content-intelligence/go-live/ag19c-rollback-smoke-test-final-preview.json",
  readiness_file: "data/content-intelligence/quality-registry/ag19c-final-public-delta-dry-run-audit-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag19c-to-ag19d-final-public-delta-dry-run-audit-boundary.json",
  schema_file: "data/content-intelligence/schema/final-public-delta-dry-run.schema.json",
  summary: {
    dry_run_completed: true,
    ready_for_ag19d: true,
    selected_path: "hybrid_staged_path_static_first",
    supabase_auth_backend_deferred: true,
    github_token_ready: false,
    github_write_ready: false,
    candidate_apply_ready: false,
    public_visibility_switch_ready: false,
    public_index_mutation_ready: false,
    deployment_trigger_ready: false,
    publish_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG19C",
  title: "Final Public Delta Dry-run Learning",
  status: "learning_record_only",
  learning_points: [
    "AG19C completes final public delta dry-run without mutation.",
    "Before/after public surface state is previewed only.",
    "Featured Reads, category, homepage and sitemap/feed/search changes remain preview-only.",
    "Rollback and smoke-test are planned but not executed.",
    "No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing occurred.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG19C",
  title: "Final Public Delta Dry-run",
  status: "final_public_delta_dry_run_completed_ready_for_ag19d_audit",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag19c-final-public-delta-dry-run.json",
    final_delta_dry_run: "data/content-intelligence/go-live/ag19c-final-public-delta-dry-run-record.json",
    before_after_preview: "data/content-intelligence/go-live/ag19c-before-after-public-surface-preview.json",
    featured_reads_preview: "data/content-intelligence/go-live/ag19c-featured-reads-final-delta-preview.json",
    category_listing_preview: "data/content-intelligence/go-live/ag19c-category-listing-final-delta-preview.json",
    homepage_card_preview: "data/content-intelligence/go-live/ag19c-homepage-card-final-delta-preview.json",
    sitemap_feed_search_preview: "data/content-intelligence/go-live/ag19c-sitemap-feed-search-final-delta-preview.json",
    rollback_smoke_test_preview: "data/content-intelligence/go-live/ag19c-rollback-smoke-test-final-preview.json",
    readiness: "data/content-intelligence/quality-registry/ag19c-final-public-delta-dry-run-audit-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag19c-to-ag19d-final-public-delta-dry-run-audit-boundary.json",
    schema: "data/content-intelligence/schema/final-public-delta-dry-run.schema.json",
    learning: "data/content-intelligence/learning/ag19c-final-public-delta-dry-run-learning.json",
    preview: "data/quality/ag19c-final-public-delta-dry-run-preview.json",
    document: "docs/quality/AG19C_FINAL_PUBLIC_DELTA_DRY_RUN.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG19C",
  preview_only: true,
  status: "final_public_delta_dry_run_completed_ready_for_ag19d_audit",
  dry_run_completed: true,
  ready_for_ag19d: true,
  selected_path: "hybrid_staged_path_static_first",
  supabase_auth_backend_deferred: true,
  github_token_ready: false,
  github_write_ready: false,
  candidate_apply_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG19C — Final Public Delta Dry-run

## Purpose

AG19C dry-runs the final public delta for the first controlled static activation.

AG19C is dry-run only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Dry-run Outputs

- Final public delta dry-run record
- Before/after public surface preview
- Featured Reads final delta preview
- Category listing final delta preview
- Homepage card final delta preview
- Sitemap/feed/search final delta preview
- Rollback and smoke-test final preview

## Decision State

No public mutation has occurred. AG19C prepares final dry-run evidence for AG19D audit only.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG19D — Final Public Delta Dry-run Audit — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(deltaDryRunPath, finalDeltaDryRun);
writeJson(beforeAfterPath, beforeAfterPreview);
writeJson(featuredPath, featuredPreview);
writeJson(categoryPath, categoryPreview);
writeJson(homepagePath, homepagePreview);
writeJson(sitemapPath, sitemapPreview);
writeJson(rollbackSmokePath, rollbackSmokePreview);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG19C Final Public Delta Dry-run generated.");
console.log("✅ Before/after, Featured Reads, category, homepage, sitemap/feed/search and rollback/smoke-test previews created.");
console.log("✅ No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing performed.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG19D Final Public Delta Dry-run Audit boundary created.");
