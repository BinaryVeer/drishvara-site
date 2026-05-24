import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag18zReview: "data/content-intelligence/quality-reviews/ag18z-controlled-real-static-activation-planning-closure.json",
  ag18zClosure: "data/content-intelligence/closure-records/ag18z-controlled-real-static-activation-planning-closure.json",
  ag18zSummary: "data/content-intelligence/go-live/ag18z-controlled-real-static-activation-planning-summary.json",
  ag18zBlocked: "data/content-intelligence/quality-registry/ag18z-real-static-activation-pre-apply-blocked-register.json",
  ag18zReadiness: "data/content-intelligence/quality-registry/ag18z-first-static-activation-pre-apply-readiness-record.json",
  ag18zBoundary: "data/content-intelligence/mutation-plans/ag18z-to-ag19a-first-static-activation-pre-apply-readiness-plan-boundary.json",
  ag18cCandidate: "data/content-intelligence/go-live/ag18c-candidate-readiness-dry-run.json",
  ag18cPublicFilter: "data/content-intelligence/go-live/ag18c-public-filter-dry-run.json",
  ag18cFileDelta: "data/content-intelligence/go-live/ag18c-intended-file-delta-dry-run.json",
  ag18eGithubTemplate: "internal-scaffolds/ag18e-non-active-real-static-activation/github-write-payload.template.json",
  ag18eRollbackTemplate: "internal-scaffolds/ag18e-non-active-real-static-activation/rollback-record.template.json",
  ag18eSmokeTemplate: "internal-scaffolds/ag18e-non-active-real-static-activation/smoke-test-checklist.template.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag19a-first-static-activation-pre-apply-readiness-plan.json");
const checklistPath = path.join(root, "data/content-intelligence/go-live/ag19a-first-static-activation-pre-apply-checklist-plan.json");
const candidateEvidencePath = path.join(root, "data/content-intelligence/go-live/ag19a-first-candidate-evidence-requirement-plan.json");
const publicFilterEvidencePath = path.join(root, "data/content-intelligence/go-live/ag19a-final-public-filter-evidence-plan.json");
const exactFileDeltaPath = path.join(root, "data/content-intelligence/go-live/ag19a-exact-file-delta-pre-apply-plan.json");
const rollbackStrategyPath = path.join(root, "data/content-intelligence/go-live/ag19a-rollback-branch-commit-strategy-plan.json");
const manualApprovalPath = path.join(root, "data/content-intelligence/go-live/ag19a-manual-approval-gate-plan.json");
const githubSecretPath = path.join(root, "data/content-intelligence/go-live/ag19a-github-secret-storage-no-secrets-plan.json");
const blockerPath = path.join(root, "data/content-intelligence/quality-registry/ag19a-pre-apply-blocker-register.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag19a-pre-apply-readiness-audit-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag19a-to-ag19b-pre-apply-readiness-audit-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/first-static-activation-pre-apply-readiness-plan.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag19a-first-static-activation-pre-apply-readiness-plan-learning.json");
const registryPath = path.join(root, "data/quality/ag19a-first-static-activation-pre-apply-readiness-plan.json");
const previewPath = path.join(root, "data/quality/ag19a-first-static-activation-pre-apply-readiness-plan-preview.json");
const docPath = path.join(root, "docs/quality/AG19A_FIRST_STATIC_ACTIVATION_PRE_APPLY_READINESS_PLAN.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG19A input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag18zReview.status !== "controlled_real_static_activation_planning_chain_closed_ready_for_ag19a_pre_apply") {
  throw new Error("AG19A requires AG18Z closure review.");
}
if (data.ag18zClosure.final_decision.proceed_to_ag19a_first_static_activation_pre_apply_readiness_plan !== true) {
  throw new Error("AG19A requires AG18Z closure decision.");
}
if (data.ag18zReadiness.ready_for_ag19a !== true) {
  throw new Error("AG19A requires AG18Z readiness.");
}
if (data.ag18zBoundary.next_stage_id !== "AG19A" || data.ag18zBoundary.explicit_approval_required !== true) {
  throw new Error("AG19A requires AG18Z to AG19A explicit boundary.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG19A requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  first_static_activation_pre_apply_readiness_plan_only: true,
  pre_apply_checklist_plan_created_in_ag19a: true,
  candidate_evidence_requirement_plan_created_in_ag19a: true,
  final_public_filter_evidence_plan_created_in_ag19a: true,
  exact_file_delta_pre_apply_plan_created_in_ag19a: true,
  rollback_branch_commit_strategy_plan_created_in_ag19a: true,
  manual_approval_gate_plan_created_in_ag19a: true,
  github_secret_storage_no_secrets_plan_created_in_ag19a: true,
  blocker_register_created_in_ag19a: true,
  ag19b_boundary_created_in_ag19a: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag19a: false,
  article_mutation_performed_in_ag19a: false,
  queue_mutation_performed_in_ag19a: false,
  active_admin_review_queue_record_created_in_ag19a: false,
  queue_index_mutation_performed_in_ag19a: false,
  admin_action_execution_performed_in_ag19a: false,
  editor_action_execution_performed_in_ag19a: false,
  real_credential_created_in_ag19a: false,
  hardcoded_password_created_in_repo_in_ag19a: false,
  password_hash_created_in_repo_in_ag19a: false,
  auth_activation_performed_in_ag19a: false,
  backend_activation_performed_in_ag19a: false,
  supabase_activation_performed_in_ag19a: false,
  database_write_performed_in_ag19a: false,
  github_token_created_or_exposed_in_ag19a: false,
  github_write_operation_performed_in_ag19a: false,
  active_action_handler_created_in_ag19a: false,
  api_endpoint_created_in_ag19a: false,
  public_visibility_switch_performed_in_ag19a: false,
  public_index_mutation_performed_in_ag19a: false,
  deployment_trigger_performed_in_ag19a: false,
  public_publishing_operation_performed_in_ag19a: false
};

const checklistPlan = {
  module_id: "AG19A",
  title: "First Static Activation Pre-Apply Checklist Plan",
  status: "first_static_activation_pre_apply_checklist_planned_no_execution",
  purpose: "Define exact checklist before any future first static activation apply.",
  checklist_items: [
    { item_id: "candidate_confirmed", requirement: "Confirm the first candidate article path and hash.", completed_now: false },
    { item_id: "admin_approval_evidence", requirement: "Confirm Admin approval evidence before any future apply.", completed_now: false },
    { item_id: "quality_evidence", requirement: "Confirm quality, reference, image credit and layout evidence.", completed_now: false },
    { item_id: "public_filter_evidence", requirement: "Confirm public_visibility, publish_approved, public_index_allowed and approved hash evidence.", completed_now: false },
    { item_id: "exact_file_delta", requirement: "Confirm exact files proposed for future mutation.", completed_now: false },
    { item_id: "secret_storage", requirement: "Confirm GitHub token storage governance without creating secrets.", completed_now: false },
    { item_id: "rollback_strategy", requirement: "Confirm branch, commit hash and rollback path.", completed_now: false },
    { item_id: "manual_approval", requirement: "Obtain explicit manual approval before any real apply.", completed_now: false },
    { item_id: "smoke_test_plan", requirement: "Confirm post-deploy smoke-test checklist.", completed_now: false }
  ],
  execution_state_now: {
    pre_apply_completed: false,
    candidate_apply_executed: false,
    github_token_created: false,
    github_write_performed: false,
    public_visibility_switched: false,
    public_index_mutated: false,
    deployment_triggered: false,
    published: false
  },
  ...stageControls
};

const candidateEvidencePlan = {
  module_id: "AG19A",
  title: "First Candidate Evidence Requirement Plan",
  status: "candidate_evidence_requirements_planned_no_evidence_apply",
  candidate: {
    source_record: inputs.ag13zCandidate,
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  required_evidence_before_future_apply: [
    "Admin approval decision record.",
    "Editor correction closure record, if applicable.",
    "Article quality evidence.",
    "Reference verification evidence or editorial-verification label.",
    "Image credit/attribution evidence.",
    "Layout and mobile-readability preview evidence.",
    "Approved hash matching the article hash.",
    "Manual pre-apply approval."
  ],
  current_evidence_state: {
    admin_approval_verified_now: false,
    quality_verified_now: false,
    references_verified_now: false,
    image_credit_verified_now: false,
    layout_verified_now: false,
    approved_hash_applied_now: false,
    ready_for_real_apply_now: false
  },
  inherited_candidate_dry_run: inputs.ag18cCandidate,
  ...stageControls
};

const publicFilterEvidencePlan = {
  module_id: "AG19A",
  title: "Final Public Filter Evidence Plan",
  status: "final_public_filter_evidence_planned_no_visibility_switch",
  filter_requirements_before_future_apply: [
    "public_visibility must be true only in approved future apply stage.",
    "publish_approved must be true only after Admin approval.",
    "public_index_allowed must be true only after file delta review.",
    "approved_hash must match article hash.",
    "quality evidence must be final.",
    "preview evidence must be final.",
    "article must not be archived or returned for correction."
  ],
  current_filter_state: {
    public_visibility: false,
    publish_approved: false,
    public_index_allowed: false,
    approved_hash: null,
    current_article_hash: currentArticleHash,
    public_exposure_allowed_now: false
  },
  inherited_public_filter_dry_run: inputs.ag18cPublicFilter,
  ...stageControls
};

const exactFileDeltaPlan = {
  module_id: "AG19A",
  title: "Exact File Delta Pre-Apply Plan",
  status: "exact_file_delta_pre_apply_planned_no_mutation",
  purpose: "Define the exact public surface files that must be reviewed before future first static apply.",
  candidate_article_path: articlePath,
  candidate_article_hash: currentArticleHash,
  proposed_future_delta_targets: [
    {
      target_id: "featured_reads_index",
      future_action: "Add article card/listing only after AG19/AG20 approval.",
      exact_file_selected_now: false,
      mutation_now: false
    },
    {
      target_id: "category_listing",
      future_action: "Add article to relevant category listing only after approval.",
      exact_file_selected_now: false,
      mutation_now: false
    },
    {
      target_id: "homepage_card",
      future_action: "Add homepage card only if separately approved.",
      exact_file_selected_now: false,
      mutation_now: false
    },
    {
      target_id: "sitemap_feed_search",
      future_action: "Update sitemap/feed/search only if approved in later stage.",
      exact_file_selected_now: false,
      mutation_now: false
    }
  ],
  required_delta_review_before_future_apply: [
    "Before/after diff.",
    "Approved file list only.",
    "No unrelated file mutation.",
    "No credential or secret exposure.",
    "No unapproved homepage exposure.",
    "Rollback file delta prepared."
  ],
  mutation_state_now: {
    exact_file_delta_generated: false,
    featured_reads_mutated: false,
    category_listing_mutated: false,
    homepage_mutated: false,
    sitemap_feed_search_mutated: false,
    git_write_performed: false
  },
  inherited_file_delta_dry_run: inputs.ag18cFileDelta,
  ...stageControls
};

const rollbackStrategyPlan = {
  module_id: "AG19A",
  title: "Rollback Branch Commit Strategy Plan",
  status: "rollback_branch_commit_strategy_planned_no_execution",
  required_before_future_apply: [
    "Record current branch.",
    "Record current HEAD commit.",
    "Record exact approved file delta.",
    "Prepare revert command or rollback commit path.",
    "Prepare post-deploy smoke-test checklist.",
    "Confirm manual rollback owner."
  ],
  current_state: {
    branch_recorded_now: false,
    head_commit_recorded_now: false,
    rollback_command_created_now: false,
    rollback_executed_now: false,
    smoke_test_executed_now: false
  },
  inherited_rollback_template: inputs.ag18eRollbackTemplate,
  inherited_smoke_template: inputs.ag18eSmokeTemplate,
  ...stageControls
};

const manualApprovalPlan = {
  module_id: "AG19A",
  title: "Manual Approval Gate Plan",
  status: "manual_approval_gate_planned_no_approval_executed",
  approval_required_before_future_apply: true,
  approval_phrase_required_later: "Proceed with first controlled static apply",
  required_confirmation_points: [
    "Candidate article path.",
    "Candidate article hash.",
    "Admin approval evidence.",
    "Exact files to mutate.",
    "Rollback path.",
    "GitHub token storage method.",
    "Deployment/smoke-test expectation.",
    "Supabase/Auth/backend remains deferred."
  ],
  current_approval_state: {
    user_approved_real_apply_now: false,
    admin_action_execution_enabled_now: false,
    github_write_enabled_now: false,
    public_publish_enabled_now: false
  },
  ...stageControls
};

const githubSecretPlan = {
  module_id: "AG19A",
  title: "GitHub Secret Storage No-Secrets Plan",
  status: "github_secret_storage_planned_no_secrets_created",
  purpose: "Plan future GitHub secret storage without creating, exposing, wiring or committing any secret.",
  future_secret_requirements: [
    {
      name: "GITHUB_CONTENT_WRITE_TOKEN",
      purpose: "Future controlled static content write only after explicit approval.",
      created_now: false,
      exposed_now: false,
      wired_now: false,
      committed_now: false
    },
    {
      name: "GITHUB_CONTENT_WRITE_BRANCH",
      purpose: "Future branch target for approved static apply.",
      created_now: false,
      exposed_now: false,
      wired_now: false,
      committed_now: false
    }
  ],
  storage_rules: [
    "Never store token in repository.",
    "Never paste token into JSON, scripts, docs or logs.",
    "Use environment secret manager or local secure process only during approved apply stage.",
    "Use least-privilege token if GitHub write becomes necessary.",
    "Record rollback path before token use."
  ],
  inherited_github_write_template: inputs.ag18eGithubTemplate,
  current_secret_state: {
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    github_write_enabled: false
  },
  ...stageControls
};

const blockerRegister = {
  module_id: "AG19A",
  title: "Pre-Apply Blocker Register",
  status: "pre_apply_operations_remain_blocked",
  blocked_items: [
    "Real candidate apply.",
    "Real Admin/Editor execution.",
    "Real article mutation.",
    "Real queue mutation.",
    "Real GitHub token creation.",
    "Real GitHub token exposure.",
    "Real GitHub token wiring.",
    "Real GitHub write.",
    "Real public visibility switch.",
    "Real public index mutation.",
    "Featured Reads mutation.",
    "Category listing mutation.",
    "Homepage card mutation.",
    "Sitemap/feed/search mutation.",
    "Deployment trigger.",
    "Publish execution.",
    "Live smoke-test execution.",
    "Supabase/Auth/backend activation.",
    "Database write path."
  ],
  allowed_after_ag19a_without_new_approval: [
    "Review AG19A pre-apply plans.",
    "Proceed to AG19B pre-apply readiness audit."
  ],
  not_allowed_after_ag19a_without_new_approval: [
    "Create or wire GitHub token.",
    "Perform GitHub write.",
    "Switch public_visibility to true.",
    "Mutate public indexes.",
    "Trigger deployment.",
    "Publish any article.",
    "Enable Admin/Editor action execution.",
    "Activate Supabase/Auth/backend."
  ],
  supabase_auth_backend_deferred: true,
  reminder: data.ag17bSupabaseReminder.reminder,
  ...stageControls
};

const readiness = {
  module_id: "AG19A",
  title: "Pre-Apply Readiness Audit Readiness Record",
  status: "ready_for_ag19b_pre_apply_readiness_audit",
  ready_for_ag19b: true,
  ag19b_explicit_approval_required: true,
  first_static_activation_pre_apply_plan_defined: true,
  candidate_evidence_plan_defined: true,
  final_public_filter_evidence_plan_defined: true,
  exact_file_delta_pre_apply_plan_defined: true,
  rollback_branch_commit_strategy_defined: true,
  manual_approval_gate_defined: true,
  github_secret_storage_no_secrets_defined: true,
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
  reason: "AG19A defines pre-apply readiness planning only. AG19B should audit these plans before any final delta dry-run or approval package.",
  ...stageControls
};

const boundary = {
  module_id: "AG19A",
  title: "AG19A to AG19B Pre-Apply Readiness Audit Boundary",
  status: "ag19b_boundary_created_not_started",
  next_stage_id: "AG19B",
  next_stage_title: "Pre-Apply Readiness Audit",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  ag19b_allowed_scope: [
    "Audit pre-apply checklist plan.",
    "Audit candidate evidence requirement plan.",
    "Audit final public filter evidence plan.",
    "Audit exact file delta pre-apply plan.",
    "Audit rollback branch/commit strategy plan.",
    "Audit manual approval gate plan.",
    "Audit GitHub secret storage no-secrets plan.",
    "Confirm Supabase/Auth/backend remains deferred."
  ],
  ag19b_blocked_scope: [
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
  supabase_auth_defer_reminder_required_in_ag19b: true,
  ...stageControls
};

const schema = {
  module_id: "AG19A",
  title: "First Static Activation Pre-Apply Readiness Plan Schema",
  status: "schema_first_static_activation_pre_apply_readiness_plan_only",
  pre_apply_checklist_plan_allowed_in_ag19a: true,
  candidate_evidence_plan_allowed_in_ag19a: true,
  final_public_filter_evidence_plan_allowed_in_ag19a: true,
  exact_file_delta_pre_apply_plan_allowed_in_ag19a: true,
  rollback_branch_commit_strategy_plan_allowed_in_ag19a: true,
  manual_approval_gate_plan_allowed_in_ag19a: true,
  github_secret_storage_no_secrets_plan_allowed_in_ag19a: true,
  ag19b_boundary_allowed_in_ag19a: true,

  article_generation_allowed_in_ag19a: false,
  article_mutation_allowed_in_ag19a: false,
  queue_mutation_allowed_in_ag19a: false,
  active_admin_review_queue_record_creation_allowed_in_ag19a: false,
  queue_index_mutation_allowed_in_ag19a: false,
  admin_action_execution_allowed_in_ag19a: false,
  editor_action_execution_allowed_in_ag19a: false,
  real_credential_creation_allowed_in_ag19a: false,
  hardcoded_password_allowed_in_ag19a: false,
  password_hash_commit_allowed_in_ag19a: false,
  auth_activation_allowed_in_ag19a: false,
  backend_activation_allowed_in_ag19a: false,
  supabase_activation_allowed_in_ag19a: false,
  database_write_allowed_in_ag19a: false,
  github_token_creation_or_exposure_allowed_in_ag19a: false,
  github_write_operation_allowed_in_ag19a: false,
  active_action_handler_creation_allowed_in_ag19a: false,
  api_endpoint_creation_allowed_in_ag19a: false,
  public_visibility_switch_allowed_in_ag19a: false,
  public_index_mutation_allowed_in_ag19a: false,
  public_publishing_operation_allowed_in_ag19a: false,
  deployment_trigger_allowed_in_ag19a: false,
  ...stageControls
};

const review = {
  module_id: "AG19A",
  title: "First Static Activation Pre-Apply Readiness Plan",
  status: "first_static_activation_pre_apply_readiness_plan_defined_real_apply_blocked",
  depends_on: ["AG18Z"],
  generated_from: inputs,
  checklist_plan_file: "data/content-intelligence/go-live/ag19a-first-static-activation-pre-apply-checklist-plan.json",
  candidate_evidence_plan_file: "data/content-intelligence/go-live/ag19a-first-candidate-evidence-requirement-plan.json",
  public_filter_evidence_plan_file: "data/content-intelligence/go-live/ag19a-final-public-filter-evidence-plan.json",
  exact_file_delta_plan_file: "data/content-intelligence/go-live/ag19a-exact-file-delta-pre-apply-plan.json",
  rollback_strategy_plan_file: "data/content-intelligence/go-live/ag19a-rollback-branch-commit-strategy-plan.json",
  manual_approval_plan_file: "data/content-intelligence/go-live/ag19a-manual-approval-gate-plan.json",
  github_secret_plan_file: "data/content-intelligence/go-live/ag19a-github-secret-storage-no-secrets-plan.json",
  blocker_register_file: "data/content-intelligence/quality-registry/ag19a-pre-apply-blocker-register.json",
  readiness_file: "data/content-intelligence/quality-registry/ag19a-pre-apply-readiness-audit-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag19a-to-ag19b-pre-apply-readiness-audit-boundary.json",
  schema_file: "data/content-intelligence/schema/first-static-activation-pre-apply-readiness-plan.schema.json",
  summary: {
    ready_for_ag19b: true,
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
  module_id: "AG19A",
  title: "First Static Activation Pre-Apply Readiness Plan Learning",
  status: "learning_record_only",
  learning_points: [
    "AG19A begins pre-apply readiness planning after AG18 closure.",
    "The first static activation remains blocked until checklist, evidence, file delta, rollback, manual approval and secret governance are audited.",
    "No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing has occurred.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG19A",
  title: "First Static Activation Pre-Apply Readiness Plan",
  status: "first_static_activation_pre_apply_readiness_plan_defined_real_apply_blocked",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag19a-first-static-activation-pre-apply-readiness-plan.json",
    checklist_plan: "data/content-intelligence/go-live/ag19a-first-static-activation-pre-apply-checklist-plan.json",
    candidate_evidence_plan: "data/content-intelligence/go-live/ag19a-first-candidate-evidence-requirement-plan.json",
    public_filter_evidence_plan: "data/content-intelligence/go-live/ag19a-final-public-filter-evidence-plan.json",
    exact_file_delta_plan: "data/content-intelligence/go-live/ag19a-exact-file-delta-pre-apply-plan.json",
    rollback_strategy_plan: "data/content-intelligence/go-live/ag19a-rollback-branch-commit-strategy-plan.json",
    manual_approval_plan: "data/content-intelligence/go-live/ag19a-manual-approval-gate-plan.json",
    github_secret_plan: "data/content-intelligence/go-live/ag19a-github-secret-storage-no-secrets-plan.json",
    blocker_register: "data/content-intelligence/quality-registry/ag19a-pre-apply-blocker-register.json",
    readiness: "data/content-intelligence/quality-registry/ag19a-pre-apply-readiness-audit-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag19a-to-ag19b-pre-apply-readiness-audit-boundary.json",
    schema: "data/content-intelligence/schema/first-static-activation-pre-apply-readiness-plan.schema.json",
    learning: "data/content-intelligence/learning/ag19a-first-static-activation-pre-apply-readiness-plan-learning.json",
    preview: "data/quality/ag19a-first-static-activation-pre-apply-readiness-plan-preview.json",
    document: "docs/quality/AG19A_FIRST_STATIC_ACTIVATION_PRE_APPLY_READINESS_PLAN.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG19A",
  preview_only: true,
  status: "first_static_activation_pre_apply_readiness_plan_defined_real_apply_blocked",
  ready_for_ag19b: true,
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

const doc = `# AG19A — First Static Activation Pre-Apply Readiness Plan

## Purpose

AG19A defines the pre-apply readiness plan for the first controlled static activation.

AG19A is planning only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Planned Outputs

- Pre-apply checklist plan
- First candidate evidence requirement plan
- Final public filter evidence plan
- Exact file delta pre-apply plan
- Rollback branch/commit strategy plan
- Manual approval gate plan
- GitHub secret storage no-secrets plan

## Decision State

The first static activation is not approved yet. AG19A prepares readiness for audit only.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG19B — Pre-Apply Readiness Audit — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(checklistPath, checklistPlan);
writeJson(candidateEvidencePath, candidateEvidencePlan);
writeJson(publicFilterEvidencePath, publicFilterEvidencePlan);
writeJson(exactFileDeltaPath, exactFileDeltaPlan);
writeJson(rollbackStrategyPath, rollbackStrategyPlan);
writeJson(manualApprovalPath, manualApprovalPlan);
writeJson(githubSecretPath, githubSecretPlan);
writeJson(blockerPath, blockerRegister);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG19A First Static Activation Pre-Apply Readiness Plan generated.");
console.log("✅ Pre-apply checklist, candidate evidence, public filter, exact file delta, rollback, manual approval and GitHub secret-storage plans created.");
console.log("✅ No GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing performed.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG19B Pre-Apply Readiness Audit boundary created.");
