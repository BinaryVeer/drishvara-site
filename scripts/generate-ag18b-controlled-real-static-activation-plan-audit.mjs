import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag18aReview: "data/content-intelligence/quality-reviews/ag18a-controlled-real-static-activation-planning.json",
  ag18aSequence: "data/content-intelligence/go-live/ag18a-real-static-activation-sequence-plan.json",
  ag18aCandidate: "data/content-intelligence/go-live/ag18a-first-public-candidate-selection-plan.json",
  ag18aSecret: "data/content-intelligence/go-live/ag18a-github-secret-governance-no-secrets-plan.json",
  ag18aDelta: "data/content-intelligence/go-live/ag18a-public-index-delta-review-plan.json",
  ag18aRollback: "data/content-intelligence/go-live/ag18a-rollback-smoke-test-plan.json",
  ag18aBlockers: "data/content-intelligence/quality-registry/ag18a-real-static-activation-blocker-register.json",
  ag18aReadiness: "data/content-intelligence/quality-registry/ag18a-controlled-real-static-activation-plan-audit-readiness-record.json",
  ag18aBoundary: "data/content-intelligence/mutation-plans/ag18a-to-ag18b-controlled-real-static-activation-plan-audit-boundary.json",
  ag17zBlocked: "data/content-intelligence/quality-registry/ag17z-real-static-activation-blocked-register.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag16zSummary: "data/content-intelligence/content-pipeline/ag16z-public-visibility-publish-control-summary.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag18b-controlled-real-static-activation-plan-audit.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag18b-controlled-real-static-activation-plan-audit-report.json");
const decisionPath = path.join(root, "data/content-intelligence/go-live/ag18b-first-candidate-file-delta-dry-run-readiness-decision-record.json");
const safetyPath = path.join(root, "data/content-intelligence/quality-registry/ag18b-real-static-activation-safety-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag18b-first-candidate-file-delta-dry-run-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag18b-to-ag18c-first-public-candidate-file-delta-dry-run-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/controlled-real-static-activation-plan-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag18b-controlled-real-static-activation-plan-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag18b-controlled-real-static-activation-plan-audit.json");
const previewPath = path.join(root, "data/quality/ag18b-controlled-real-static-activation-plan-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG18B_CONTROLLED_REAL_STATIC_ACTIVATION_PLAN_AUDIT.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG18B input ${name}: ${relativePath}`);
}

const ag18aReview = readJson(inputs.ag18aReview);
const ag18aSequence = readJson(inputs.ag18aSequence);
const ag18aCandidate = readJson(inputs.ag18aCandidate);
const ag18aSecret = readJson(inputs.ag18aSecret);
const ag18aDelta = readJson(inputs.ag18aDelta);
const ag18aRollback = readJson(inputs.ag18aRollback);
const ag18aBlockers = readJson(inputs.ag18aBlockers);
const ag18aReadiness = readJson(inputs.ag18aReadiness);
const ag18aBoundary = readJson(inputs.ag18aBoundary);
const ag17zBlocked = readJson(inputs.ag17zBlocked);
const ag17bSupabaseReminder = readJson(inputs.ag17bSupabaseReminder);
const ag16zSummary = readJson(inputs.ag16zSummary);
const ag13zCandidate = readJson(inputs.ag13zCandidate);

if (ag18aReview.status !== "controlled_real_static_activation_planning_defined_real_activation_blocked") {
  throw new Error("AG18B requires AG18A review.");
}
if (ag18aReadiness.ready_for_ag18b !== true) {
  throw new Error("AG18B requires AG18A readiness.");
}
if (ag18aBoundary.next_stage_id !== "AG18B" || ag18aBoundary.explicit_approval_required !== true) {
  throw new Error("AG18B requires AG18A to AG18B explicit boundary.");
}

const articlePath = ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG18B requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  controlled_real_static_activation_plan_audit_only: true,
  controlled_real_static_activation_plan_audited_in_ag18b: true,
  first_candidate_file_delta_dry_run_decision_created_in_ag18b: true,
  real_static_activation_safety_record_created_in_ag18b: true,
  ag18c_boundary_created_in_ag18b: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag18b: false,
  article_mutation_performed_in_ag18b: false,
  queue_mutation_performed_in_ag18b: false,
  active_admin_review_queue_record_created_in_ag18b: false,
  queue_index_mutation_performed_in_ag18b: false,
  admin_action_execution_performed_in_ag18b: false,
  editor_action_execution_performed_in_ag18b: false,
  real_credential_created_in_ag18b: false,
  hardcoded_password_created_in_repo_in_ag18b: false,
  password_hash_created_in_repo_in_ag18b: false,
  auth_activation_performed_in_ag18b: false,
  backend_activation_performed_in_ag18b: false,
  supabase_activation_performed_in_ag18b: false,
  database_write_performed_in_ag18b: false,
  github_token_created_or_exposed_in_ag18b: false,
  github_write_operation_performed_in_ag18b: false,
  active_action_handler_created_in_ag18b: false,
  api_endpoint_created_in_ag18b: false,
  public_visibility_switch_performed_in_ag18b: false,
  public_index_mutation_performed_in_ag18b: false,
  deployment_trigger_performed_in_ag18b: false,
  public_publishing_operation_performed_in_ag18b: false
};

const auditChecks = [
  {
    check_id: "AG18B-AUDIT-001",
    area: "ag18a_dependency",
    status: "passed",
    note: "AG18A review, plans, blockers, readiness and boundary are present."
  },
  {
    check_id: "AG18B-AUDIT-002",
    area: "sequence_plan_no_execution",
    status:
      ag18aSequence.sequence.every((step) => step.execution_now === false) &&
      Object.values(ag18aSequence.execution_state_now).every((value) => value === false)
        ? "passed"
        : "failed",
    note: "Real static activation sequence must remain planning-only with no execution state enabled."
  },
  {
    check_id: "AG18B-AUDIT-003",
    area: "candidate_plan_no_apply",
    status:
      ag18aCandidate.candidate_under_consideration.hash_verified === true &&
      ag18aCandidate.selection_decision_now.first_candidate_selected_for_real_apply === false &&
      ag18aCandidate.selection_decision_now.public_visibility_enabled === false &&
      ag18aCandidate.selection_decision_now.publish_approved_enabled === false &&
      ag18aCandidate.selection_decision_now.public_index_allowed_enabled === false
        ? "passed"
        : "failed",
    note: "Candidate may be under consideration only; it must not be selected or exposed."
  },
  {
    check_id: "AG18B-AUDIT-004",
    area: "candidate_hash_integrity",
    status:
      ag18aCandidate.candidate_under_consideration.article_path === articlePath &&
      ag18aCandidate.candidate_under_consideration.article_hash === currentArticleHash &&
      currentArticleHash === ag13zCandidate.article_hash
        ? "passed"
        : "failed",
    note: "Seed candidate path and hash must remain stable."
  },
  {
    check_id: "AG18B-AUDIT-005",
    area: "github_secret_governance_no_secrets",
    status:
      ag18aSecret.future_secret_placeholders.every((item) =>
        item.created_now === false &&
        item.exposed_now === false &&
        item.wired_now === false &&
        item.committed_now === false
      ) &&
      ag18aSecret.current_secret_state.github_token_created === false &&
      ag18aSecret.current_secret_state.github_token_exposed === false &&
      ag18aSecret.current_secret_state.github_token_wired === false &&
      ag18aSecret.current_secret_state.github_write_enabled === false
        ? "passed"
        : "failed",
    note: "GitHub secret governance must plan placeholders only; no secret/token/write may exist."
  },
  {
    check_id: "AG18B-AUDIT-006",
    area: "public_index_delta_review_no_mutation",
    status:
      ag18aDelta.future_delta_targets.every((item) => item.mutation_now === false) &&
      Object.values(ag18aDelta.mutation_state_now).every((value) => value === false)
        ? "passed"
        : "failed",
    note: "Public index/file delta review must be planned without mutation."
  },
  {
    check_id: "AG18B-AUDIT-007",
    area: "rollback_smoke_test_no_execution",
    status:
      Object.values(ag18aRollback.current_execution_state).every((value) => value === false) &&
      ag18aRollback.rollback_requirements_before_future_apply.length > 0 &&
      ag18aRollback.smoke_test_requirements_after_future_apply.length > 0
        ? "passed"
        : "failed",
    note: "Rollback and smoke-test must be defined without execution."
  },
  {
    check_id: "AG18B-AUDIT-008",
    area: "blocker_register",
    status:
      ag18aBlockers.blockers.includes("No real GitHub token creation.") &&
      ag18aBlockers.blockers.includes("No real GitHub write.") &&
      ag18aBlockers.blockers.includes("No public visibility switch.") &&
      ag18aBlockers.blockers.includes("No public index mutation.") &&
      ag18aBlockers.blockers.includes("No deployment trigger.") &&
      ag18aBlockers.blockers.includes("No publishing operation.") &&
      ag18aBlockers.blockers.includes("No Supabase/Auth/backend activation.")
        ? "passed"
        : "failed",
    note: "All real static activation blockers must be reconfirmed."
  },
  {
    check_id: "AG18B-AUDIT-009",
    area: "ag17z_blocker_inheritance",
    status:
      ag17zBlocked.blocked_items_after_ag17_closure.includes("Real GitHub content write.") &&
      ag17zBlocked.blocked_items_after_ag17_closure.includes("Real public visibility switch.") &&
      ag17zBlocked.blocked_items_after_ag17_closure.includes("Real public index mutation.") &&
      ag17zBlocked.blocked_items_after_ag17_closure.includes("Deployment trigger.") &&
      ag17zBlocked.blocked_items_after_ag17_closure.includes("Publish execution.") &&
      ag17zBlocked.supabase_auth_backend_deferred === true
        ? "passed"
        : "failed",
    note: "AG17Z real activation blockers must remain inherited."
  },
  {
    check_id: "AG18B-AUDIT-010",
    area: "ag16_public_control_inheritance",
    status:
      ag16zSummary.final_public_control_state.public_exposure_requires_public_visibility_true === true &&
      ag16zSummary.final_public_control_state.public_exposure_requires_publish_approved_true === true &&
      ag16zSummary.final_public_control_state.public_exposure_requires_public_index_allowed_true === true &&
      ag16zSummary.final_public_control_state.public_visibility_switch_enabled === false &&
      ag16zSummary.final_public_control_state.public_index_mutation_enabled === false &&
      ag16zSummary.final_public_control_state.publishing_enabled === false
        ? "passed"
        : "failed",
    note: "AG16 public visibility/publish-control requirements and blockers must remain inherited."
  },
  {
    check_id: "AG18B-AUDIT-011",
    area: "supabase_auth_defer_reminder",
    status:
      ag17bSupabaseReminder.status === "supabase_auth_backend_defer_reminder_carried_forward" &&
      ag17bSupabaseReminder.reminder.includes("static/GitHub-controlled go-live first") &&
      ag17bSupabaseReminder.reminder.includes("Supabase/Auth/backend later") &&
      ag18aBlockers.supabase_auth_backend_deferred === true
        ? "passed"
        : "failed",
    note: "Supabase/Auth/backend defer reminder must remain active."
  },
  {
    check_id: "AG18B-AUDIT-012",
    area: "readiness_alignment",
    status:
      ag18aReadiness.ready_for_ag18b === true &&
      ag18aReadiness.github_token_ready === false &&
      ag18aReadiness.github_write_ready === false &&
      ag18aReadiness.public_visibility_switch_ready === false &&
      ag18aReadiness.public_index_mutation_ready === false &&
      ag18aReadiness.deployment_trigger_ready === false &&
      ag18aReadiness.publish_ready === false &&
      ag18aReadiness.supabase_activation_ready === false
        ? "passed"
        : "failed",
    note: "AG18A readiness must be audit-ready while all activation paths remain blocked."
  },
  {
    check_id: "AG18B-AUDIT-013",
    area: "stage_controls_no_activation",
    status:
      ag18aReview.summary.github_token_ready === false &&
      ag18aReview.summary.github_write_ready === false &&
      ag18aReview.summary.public_visibility_switch_ready === false &&
      ag18aReview.summary.public_index_mutation_ready === false &&
      ag18aReview.summary.deployment_trigger_ready === false &&
      ag18aReview.summary.publish_ready === false
        ? "passed"
        : "failed",
    note: "AG18A summary must confirm no token/write/visibility/index/deployment/publish readiness."
  },
  {
    check_id: "AG18B-AUDIT-014",
    area: "forbidden_operations",
    status: "passed",
    note: "AG18B is audit-only and performs no article generation, mutation, credentials, GitHub write, visibility switch, public index mutation, deployment, publishing or Supabase/Auth/backend activation."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG18B audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const auditReport = {
  module_id: "AG18B",
  title: "Controlled Real Static Activation Plan Audit Report",
  status: "controlled_real_static_activation_plan_audit_passed",
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    failed: failedChecks.length
  },
  decision: {
    ag18a_plan_valid: true,
    candidate_planned_not_applied: true,
    no_github_token_created: true,
    no_github_write_performed: true,
    no_public_visibility_switch_performed: true,
    no_public_index_mutation_performed: true,
    no_deployment_triggered: true,
    no_publishing_performed: true,
    supabase_auth_backend_deferred: true,
    ready_for_first_candidate_file_delta_dry_run: true
  },
  ...stageControls
};

const decision = {
  module_id: "AG18B",
  title: "First Candidate File Delta Dry-run Readiness Decision Record",
  status: "ag18a_plan_audit_passed_ready_for_ag18c_dry_run",
  decision: {
    proceed_to_first_public_candidate_file_delta_dry_run: true,
    proceed_to_real_candidate_selection_apply: false,
    proceed_to_github_token_creation: false,
    proceed_to_github_write: false,
    proceed_to_public_visibility_switch: false,
    proceed_to_public_index_mutation: false,
    proceed_to_deployment_trigger: false,
    proceed_to_publish_execution: false,
    proceed_to_supabase_auth_backend_activation: false
  },
  recommended_next_stage: "AG18C",
  recommended_next_stage_title: "First Public Candidate and File Delta Dry-run",
  rationale: [
    "AG18A planning is complete and audit-passed.",
    "Candidate and file/public-index deltas can be dry-run safely.",
    "No real write, token, public visibility switch, deployment or publishing is approved.",
    "Supabase/Auth/backend remains deferred."
  ],
  ...stageControls
};

const safety = {
  module_id: "AG18B",
  title: "Real Static Activation Safety Record",
  status: "real_static_activation_plan_safe_for_dry_run_only",
  safety_assertions: {
    static_github_controlled_first: true,
    supabase_auth_backend_deferred: true,
    candidate_selection_apply_enabled: false,
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    github_write_enabled: false,
    article_mutation_enabled: false,
    public_visibility_switch_enabled: false,
    public_index_mutation_enabled: false,
    deployment_trigger_enabled: false,
    publishing_enabled: false,
    admin_editor_execution_enabled: false
  },
  reminder: ag17bSupabaseReminder.reminder,
  ...stageControls
};

const readiness = {
  module_id: "AG18B",
  title: "First Candidate File Delta Dry-run Readiness Record",
  status: "ready_for_ag18c_first_public_candidate_file_delta_dry_run",
  ready_for_ag18c: true,
  ag18c_explicit_approval_required: true,
  controlled_real_static_activation_plan_audit_passed: true,
  failed_checks: 0,
  selected_path: "hybrid_staged_path_static_first",
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  supabase_auth_reminder_required_in_future: true,
  candidate_file_delta_dry_run_ready: true,
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
  reason: "AG18B approves AG18C dry-run only. Real activation remains blocked.",
  ...stageControls
};

const boundary = {
  module_id: "AG18B",
  title: "AG18B to AG18C First Public Candidate File Delta Dry-run Boundary",
  status: "ag18c_boundary_created_not_started",
  next_stage_id: "AG18C",
  next_stage_title: "First Public Candidate and File Delta Dry-run",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  ag18c_allowed_scope: [
    "Dry-run first public candidate readiness.",
    "Dry-run public filter evidence.",
    "Dry-run intended public file delta.",
    "Dry-run Featured Reads index delta.",
    "Dry-run category listing delta.",
    "Dry-run homepage card delta if applicable.",
    "Dry-run sitemap/feed/search delta only if applicable.",
    "Dry-run rollback and smoke-test evidence.",
    "Carry forward Supabase/Auth/backend defer reminder."
  ],
  ag18c_blocked_scope: [
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
  supabase_auth_defer_reminder_required_in_ag18c: true,
  ...stageControls
};

const schema = {
  module_id: "AG18B",
  title: "Controlled Real Static Activation Plan Audit Schema",
  status: "schema_controlled_real_static_activation_plan_audit_only",
  plan_audit_allowed_in_ag18b: true,
  dry_run_decision_allowed_in_ag18b: true,
  safety_record_allowed_in_ag18b: true,
  ag18c_boundary_allowed_in_ag18b: true,

  article_generation_allowed_in_ag18b: false,
  article_mutation_allowed_in_ag18b: false,
  queue_mutation_allowed_in_ag18b: false,
  active_admin_review_queue_record_creation_allowed_in_ag18b: false,
  queue_index_mutation_allowed_in_ag18b: false,
  admin_action_execution_allowed_in_ag18b: false,
  editor_action_execution_allowed_in_ag18b: false,
  real_credential_creation_allowed_in_ag18b: false,
  hardcoded_password_allowed_in_ag18b: false,
  password_hash_commit_allowed_in_ag18b: false,
  auth_activation_allowed_in_ag18b: false,
  backend_activation_allowed_in_ag18b: false,
  supabase_activation_allowed_in_ag18b: false,
  database_write_allowed_in_ag18b: false,
  github_token_creation_or_exposure_allowed_in_ag18b: false,
  github_write_operation_allowed_in_ag18b: false,
  active_action_handler_creation_allowed_in_ag18b: false,
  api_endpoint_creation_allowed_in_ag18b: false,
  public_visibility_switch_allowed_in_ag18b: false,
  public_index_mutation_allowed_in_ag18b: false,
  public_publishing_operation_allowed_in_ag18b: false,
  deployment_trigger_allowed_in_ag18b: false,
  ...stageControls
};

const review = {
  module_id: "AG18B",
  title: "Controlled Real Static Activation Plan Audit",
  status: "controlled_real_static_activation_plan_audit_passed_ready_for_ag18c_dry_run",
  depends_on: ["AG18A"],
  generated_from: inputs,
  audit_report_file: "data/content-intelligence/audit-records/ag18b-controlled-real-static-activation-plan-audit-report.json",
  decision_file: "data/content-intelligence/go-live/ag18b-first-candidate-file-delta-dry-run-readiness-decision-record.json",
  safety_file: "data/content-intelligence/quality-registry/ag18b-real-static-activation-safety-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag18b-first-candidate-file-delta-dry-run-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag18b-to-ag18c-first-public-candidate-file-delta-dry-run-boundary.json",
  schema_file: "data/content-intelligence/schema/controlled-real-static-activation-plan-audit.schema.json",
  summary: {
    audit_passed: true,
    failed_checks: 0,
    ready_for_ag18c: true,
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
  module_id: "AG18B",
  title: "Controlled Real Static Activation Plan Audit Learning",
  status: "learning_record_only",
  learning_points: [
    "AG18A controlled real static activation plan passed audit with zero failed checks.",
    "The next safe step is AG18C dry-run only.",
    "Candidate selection, GitHub token creation, GitHub write, public visibility switch, public index mutation, deployment and publishing remain blocked.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path.",
    "AG18C should dry-run candidate readiness and intended file deltas without mutation."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG18B",
  title: "Controlled Real Static Activation Plan Audit",
  status: "controlled_real_static_activation_plan_audit_passed_ready_for_ag18c_dry_run",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag18b-controlled-real-static-activation-plan-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag18b-controlled-real-static-activation-plan-audit-report.json",
    decision: "data/content-intelligence/go-live/ag18b-first-candidate-file-delta-dry-run-readiness-decision-record.json",
    safety: "data/content-intelligence/quality-registry/ag18b-real-static-activation-safety-record.json",
    readiness: "data/content-intelligence/quality-registry/ag18b-first-candidate-file-delta-dry-run-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag18b-to-ag18c-first-public-candidate-file-delta-dry-run-boundary.json",
    schema: "data/content-intelligence/schema/controlled-real-static-activation-plan-audit.schema.json",
    learning: "data/content-intelligence/learning/ag18b-controlled-real-static-activation-plan-audit-learning.json",
    preview: "data/quality/ag18b-controlled-real-static-activation-plan-audit-preview.json",
    document: "docs/quality/AG18B_CONTROLLED_REAL_STATIC_ACTIVATION_PLAN_AUDIT.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG18B",
  preview_only: true,
  status: "controlled_real_static_activation_plan_audit_passed_ready_for_ag18c_dry_run",
  audit_passed: true,
  failed_checks: 0,
  ready_for_ag18c: true,
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

const doc = `# AG18B — Controlled Real Static Activation Plan Audit

## Purpose

AG18B audits the AG18A Controlled Real Static Activation Planning stage.

AG18B is audit-only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Audit Result

AG18A passed audit with zero failed checks.

## Decision

AG18C may proceed only as a first public candidate and file-delta dry-run.

Not approved: real candidate apply, GitHub token creation, GitHub write, public visibility switch, public index mutation, deployment trigger, publish execution or Supabase/Auth/backend activation.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG18C — First Public Candidate and File Delta Dry-run — only with explicit approval.
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

console.log("✅ AG18B Controlled Real Static Activation Plan Audit generated.");
console.log("✅ AG18A plan audit passed with zero failed checks.");
console.log("✅ Decision recorded: proceed only to AG18C dry-run.");
console.log("✅ GitHub token, GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG18C First Public Candidate and File Delta Dry-run boundary created.");
