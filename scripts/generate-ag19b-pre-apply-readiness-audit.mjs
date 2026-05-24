import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag19aReview: "data/content-intelligence/quality-reviews/ag19a-first-static-activation-pre-apply-readiness-plan.json",
  ag19aChecklist: "data/content-intelligence/go-live/ag19a-first-static-activation-pre-apply-checklist-plan.json",
  ag19aCandidateEvidence: "data/content-intelligence/go-live/ag19a-first-candidate-evidence-requirement-plan.json",
  ag19aPublicFilterEvidence: "data/content-intelligence/go-live/ag19a-final-public-filter-evidence-plan.json",
  ag19aExactFileDelta: "data/content-intelligence/go-live/ag19a-exact-file-delta-pre-apply-plan.json",
  ag19aRollbackStrategy: "data/content-intelligence/go-live/ag19a-rollback-branch-commit-strategy-plan.json",
  ag19aManualApproval: "data/content-intelligence/go-live/ag19a-manual-approval-gate-plan.json",
  ag19aGithubSecret: "data/content-intelligence/go-live/ag19a-github-secret-storage-no-secrets-plan.json",
  ag19aBlockers: "data/content-intelligence/quality-registry/ag19a-pre-apply-blocker-register.json",
  ag19aReadiness: "data/content-intelligence/quality-registry/ag19a-pre-apply-readiness-audit-readiness-record.json",
  ag19aBoundary: "data/content-intelligence/mutation-plans/ag19a-to-ag19b-pre-apply-readiness-audit-boundary.json",
  ag18zBlocked: "data/content-intelligence/quality-registry/ag18z-real-static-activation-pre-apply-blocked-register.json",
  ag18zSummary: "data/content-intelligence/go-live/ag18z-controlled-real-static-activation-planning-summary.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag19b-pre-apply-readiness-audit.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag19b-pre-apply-readiness-audit-report.json");
const decisionPath = path.join(root, "data/content-intelligence/go-live/ag19b-final-public-delta-dry-run-readiness-decision-record.json");
const safetyPath = path.join(root, "data/content-intelligence/quality-registry/ag19b-pre-apply-safety-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag19b-final-public-delta-dry-run-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag19b-to-ag19c-final-public-delta-dry-run-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/pre-apply-readiness-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag19b-pre-apply-readiness-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag19b-pre-apply-readiness-audit.json");
const previewPath = path.join(root, "data/quality/ag19b-pre-apply-readiness-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG19B_PRE_APPLY_READINESS_AUDIT.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG19B input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag19aReview.status !== "first_static_activation_pre_apply_readiness_plan_defined_real_apply_blocked") {
  throw new Error("AG19B requires AG19A review readiness.");
}
if (data.ag19aReadiness.ready_for_ag19b !== true) {
  throw new Error("AG19B requires AG19A readiness.");
}
if (data.ag19aBoundary.next_stage_id !== "AG19B" || data.ag19aBoundary.explicit_approval_required !== true) {
  throw new Error("AG19B requires AG19A to AG19B explicit boundary.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG19B requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  pre_apply_readiness_audit_only: true,
  ag19a_pre_apply_plans_audited_in_ag19b: true,
  final_public_delta_dry_run_decision_created_in_ag19b: true,
  pre_apply_safety_record_created_in_ag19b: true,
  ag19c_boundary_created_in_ag19b: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag19b: false,
  article_mutation_performed_in_ag19b: false,
  queue_mutation_performed_in_ag19b: false,
  active_admin_review_queue_record_created_in_ag19b: false,
  queue_index_mutation_performed_in_ag19b: false,
  admin_action_execution_performed_in_ag19b: false,
  editor_action_execution_performed_in_ag19b: false,
  real_credential_created_in_ag19b: false,
  hardcoded_password_created_in_repo_in_ag19b: false,
  password_hash_created_in_repo_in_ag19b: false,
  auth_activation_performed_in_ag19b: false,
  backend_activation_performed_in_ag19b: false,
  supabase_activation_performed_in_ag19b: false,
  database_write_performed_in_ag19b: false,
  github_token_created_or_exposed_in_ag19b: false,
  github_write_operation_performed_in_ag19b: false,
  active_action_handler_created_in_ag19b: false,
  api_endpoint_created_in_ag19b: false,
  public_visibility_switch_performed_in_ag19b: false,
  public_index_mutation_performed_in_ag19b: false,
  deployment_trigger_performed_in_ag19b: false,
  public_publishing_operation_performed_in_ag19b: false
};

const auditChecks = [
  {
    check_id: "AG19B-AUDIT-001",
    area: "ag19a_dependency",
    status: "passed",
    note: "AG19A review, pre-apply plans, blocker register, readiness and boundary are present."
  },
  {
    check_id: "AG19B-AUDIT-002",
    area: "pre_apply_checklist_plan",
    status:
      data.ag19aChecklist.status === "first_static_activation_pre_apply_checklist_planned_no_execution" &&
      data.ag19aChecklist.checklist_items.every((item) => item.completed_now === false) &&
      Object.values(data.ag19aChecklist.execution_state_now).every((value) => value === false)
        ? "passed"
        : "failed",
    note: "Pre-apply checklist must be planned only and no checklist item may be completed as executed."
  },
  {
    check_id: "AG19B-AUDIT-003",
    area: "candidate_evidence_plan",
    status:
      data.ag19aCandidateEvidence.status === "candidate_evidence_requirements_planned_no_evidence_apply" &&
      data.ag19aCandidateEvidence.candidate.article_path === articlePath &&
      data.ag19aCandidateEvidence.candidate.article_hash === currentArticleHash &&
      Object.values(data.ag19aCandidateEvidence.current_evidence_state).every((value) => value === false)
        ? "passed"
        : "failed",
    note: "Candidate evidence requirements are planned but not verified/applied."
  },
  {
    check_id: "AG19B-AUDIT-004",
    area: "public_filter_evidence_plan",
    status:
      data.ag19aPublicFilterEvidence.status === "final_public_filter_evidence_planned_no_visibility_switch" &&
      data.ag19aPublicFilterEvidence.current_filter_state.public_visibility === false &&
      data.ag19aPublicFilterEvidence.current_filter_state.publish_approved === false &&
      data.ag19aPublicFilterEvidence.current_filter_state.public_index_allowed === false &&
      data.ag19aPublicFilterEvidence.current_filter_state.public_exposure_allowed_now === false
        ? "passed"
        : "failed",
    note: "Public filter evidence must remain planned with no visibility/public exposure."
  },
  {
    check_id: "AG19B-AUDIT-005",
    area: "exact_file_delta_plan",
    status:
      data.ag19aExactFileDelta.status === "exact_file_delta_pre_apply_planned_no_mutation" &&
      data.ag19aExactFileDelta.proposed_future_delta_targets.every((target) => target.exact_file_selected_now === false && target.mutation_now === false) &&
      Object.values(data.ag19aExactFileDelta.mutation_state_now).every((value) => value === false)
        ? "passed"
        : "failed",
    note: "Exact file delta may be planned only; no file selection/mutation may occur."
  },
  {
    check_id: "AG19B-AUDIT-006",
    area: "rollback_strategy_plan",
    status:
      data.ag19aRollbackStrategy.status === "rollback_branch_commit_strategy_planned_no_execution" &&
      Object.values(data.ag19aRollbackStrategy.current_state).every((value) => value === false)
        ? "passed"
        : "failed",
    note: "Rollback branch/commit strategy must be planned only and not executed."
  },
  {
    check_id: "AG19B-AUDIT-007",
    area: "manual_approval_gate_plan",
    status:
      data.ag19aManualApproval.status === "manual_approval_gate_planned_no_approval_executed" &&
      data.ag19aManualApproval.approval_required_before_future_apply === true &&
      Object.values(data.ag19aManualApproval.current_approval_state).every((value) => value === false)
        ? "passed"
        : "failed",
    note: "Manual approval gate must be required, but no real approval is executed in AG19A/AG19B."
  },
  {
    check_id: "AG19B-AUDIT-008",
    area: "github_secret_storage_no_secrets",
    status:
      data.ag19aGithubSecret.status === "github_secret_storage_planned_no_secrets_created" &&
      data.ag19aGithubSecret.future_secret_requirements.every((item) =>
        item.created_now === false &&
        item.exposed_now === false &&
        item.wired_now === false &&
        item.committed_now === false
      ) &&
      Object.values(data.ag19aGithubSecret.current_secret_state).every((value) => value === false)
        ? "passed"
        : "failed",
    note: "GitHub secret storage may be planned only; no secret or write is enabled."
  },
  {
    check_id: "AG19B-AUDIT-009",
    area: "blocker_register",
    status:
      data.ag19aBlockers.blocked_items.includes("Real candidate apply.") &&
      data.ag19aBlockers.blocked_items.includes("Real GitHub token creation.") &&
      data.ag19aBlockers.blocked_items.includes("Real GitHub write.") &&
      data.ag19aBlockers.blocked_items.includes("Real public visibility switch.") &&
      data.ag19aBlockers.blocked_items.includes("Real public index mutation.") &&
      data.ag19aBlockers.blocked_items.includes("Deployment trigger.") &&
      data.ag19aBlockers.blocked_items.includes("Publish execution.") &&
      data.ag19aBlockers.blocked_items.includes("Supabase/Auth/backend activation.")
        ? "passed"
        : "failed",
    note: "All pre-apply blockers must remain active."
  },
  {
    check_id: "AG19B-AUDIT-010",
    area: "ag18z_inheritance",
    status:
      data.ag18zSummary.final_ag18_state.ready_for_ag19_pre_apply_readiness_planning === true &&
      data.ag18zSummary.final_ag18_state.github_write_enabled === false &&
      data.ag18zSummary.final_ag18_state.public_visibility_switch_enabled === false &&
      data.ag18zSummary.final_ag18_state.public_index_mutation_enabled === false &&
      data.ag18zSummary.final_ag18_state.deployment_trigger_enabled === false &&
      data.ag18zSummary.final_ag18_state.publishing_enabled === false &&
      data.ag18zSummary.final_ag18_state.supabase_auth_backend_enabled === false
        ? "passed"
        : "failed",
    note: "AG18Z closure state must remain inherited and non-active."
  },
  {
    check_id: "AG19B-AUDIT-011",
    area: "readiness_alignment",
    status:
      data.ag19aReadiness.ready_for_ag19b === true &&
      data.ag19aReadiness.github_token_ready === false &&
      data.ag19aReadiness.github_write_ready === false &&
      data.ag19aReadiness.candidate_apply_ready === false &&
      data.ag19aReadiness.public_visibility_switch_ready === false &&
      data.ag19aReadiness.public_index_mutation_ready === false &&
      data.ag19aReadiness.deployment_trigger_ready === false &&
      data.ag19aReadiness.publish_ready === false &&
      data.ag19aReadiness.supabase_activation_ready === false
        ? "passed"
        : "failed",
    note: "AG19A readiness must point to audit while real activation remains blocked."
  },
  {
    check_id: "AG19B-AUDIT-012",
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
    check_id: "AG19B-AUDIT-013",
    area: "forbidden_operations",
    status: "passed",
    note: "AG19B is audit-only and performs no article generation, mutation, credentials, GitHub write, visibility switch, public index mutation, deployment, publishing or backend activation."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG19B audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const auditReport = {
  module_id: "AG19B",
  title: "Pre-Apply Readiness Audit Report",
  status: "pre_apply_readiness_audit_passed",
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    failed: failedChecks.length
  },
  decision: {
    ag19a_pre_apply_plans_valid: true,
    checklist_plan_valid: true,
    candidate_evidence_plan_valid: true,
    public_filter_evidence_plan_valid: true,
    exact_file_delta_plan_valid: true,
    rollback_strategy_valid: true,
    manual_approval_gate_valid: true,
    github_secret_storage_no_secrets_valid: true,
    no_candidate_apply_performed: true,
    no_github_token_created: true,
    no_github_write_performed: true,
    no_public_visibility_switch_performed: true,
    no_public_index_mutation_performed: true,
    no_deployment_triggered: true,
    no_publishing_performed: true,
    supabase_auth_backend_deferred: true,
    ready_for_final_public_delta_dry_run: true
  },
  ...stageControls
};

const decision = {
  module_id: "AG19B",
  title: "Final Public Delta Dry-run Readiness Decision Record",
  status: "pre_apply_readiness_audit_passed_ready_for_ag19c_final_public_delta_dry_run",
  decision: {
    proceed_to_final_public_delta_dry_run: true,
    proceed_to_real_candidate_apply: false,
    proceed_to_github_token_creation: false,
    proceed_to_github_write: false,
    proceed_to_public_visibility_switch: false,
    proceed_to_public_index_mutation: false,
    proceed_to_deployment_trigger: false,
    proceed_to_publish_execution: false,
    proceed_to_supabase_auth_backend_activation: false
  },
  recommended_next_stage: "AG19C",
  recommended_next_stage_title: "Final Public Delta Dry-run",
  rationale: [
    "AG19A pre-apply readiness plans passed audit with zero failed checks.",
    "The next safe step is final public delta dry-run only.",
    "No real apply, token, GitHub write, visibility switch, public mutation, deployment or publishing is approved.",
    "Supabase/Auth/backend remains deferred."
  ],
  ...stageControls
};

const safety = {
  module_id: "AG19B",
  title: "Pre-Apply Safety Record",
  status: "pre_apply_readiness_safe_for_final_public_delta_dry_run_only",
  safety_assertions: {
    static_github_controlled_first: true,
    supabase_auth_backend_deferred: true,
    final_public_delta_dry_run_allowed: true,
    candidate_real_apply_enabled: false,
    github_token_created: false,
    github_token_exposed: false,
    github_token_wired: false,
    github_write_enabled: false,
    article_mutation_enabled: false,
    queue_mutation_enabled: false,
    public_visibility_switch_enabled: false,
    public_index_mutation_enabled: false,
    deployment_trigger_enabled: false,
    publishing_enabled: false,
    admin_editor_execution_enabled: false
  },
  reminder: data.ag17bSupabaseReminder.reminder,
  ...stageControls
};

const readiness = {
  module_id: "AG19B",
  title: "Final Public Delta Dry-run Readiness Record",
  status: "ready_for_ag19c_final_public_delta_dry_run",
  ready_for_ag19c: true,
  ag19c_explicit_approval_required: true,
  pre_apply_readiness_audit_passed: true,
  failed_checks: 0,
  final_public_delta_dry_run_ready: true,
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
  reason: "AG19B approves AG19C final public delta dry-run only. Real activation remains blocked.",
  ...stageControls
};

const boundary = {
  module_id: "AG19B",
  title: "AG19B to AG19C Final Public Delta Dry-run Boundary",
  status: "ag19c_boundary_created_not_started",
  next_stage_id: "AG19C",
  next_stage_title: "Final Public Delta Dry-run",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  ag19c_allowed_scope: [
    "Dry-run exact future file delta preview.",
    "Dry-run before/after public listing preview.",
    "Dry-run Featured Reads preview.",
    "Dry-run category listing preview.",
    "Dry-run homepage card preview if applicable.",
    "Dry-run sitemap/feed/search preview if applicable.",
    "Dry-run rollback preview.",
    "Dry-run smoke-test checklist preview.",
    "Carry forward Supabase/Auth/backend defer reminder."
  ],
  ag19c_blocked_scope: [
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
  supabase_auth_defer_reminder_required_in_ag19c: true,
  ...stageControls
};

const schema = {
  module_id: "AG19B",
  title: "Pre-Apply Readiness Audit Schema",
  status: "schema_pre_apply_readiness_audit_only",
  pre_apply_audit_allowed_in_ag19b: true,
  final_delta_dry_run_decision_allowed_in_ag19b: true,
  safety_record_allowed_in_ag19b: true,
  ag19c_boundary_allowed_in_ag19b: true,

  article_generation_allowed_in_ag19b: false,
  article_mutation_allowed_in_ag19b: false,
  queue_mutation_allowed_in_ag19b: false,
  active_admin_review_queue_record_creation_allowed_in_ag19b: false,
  queue_index_mutation_allowed_in_ag19b: false,
  admin_action_execution_allowed_in_ag19b: false,
  editor_action_execution_allowed_in_ag19b: false,
  real_credential_creation_allowed_in_ag19b: false,
  auth_activation_allowed_in_ag19b: false,
  backend_activation_allowed_in_ag19b: false,
  supabase_activation_allowed_in_ag19b: false,
  database_write_allowed_in_ag19b: false,
  github_token_creation_or_exposure_allowed_in_ag19b: false,
  github_write_operation_allowed_in_ag19b: false,
  active_action_handler_creation_allowed_in_ag19b: false,
  api_endpoint_creation_allowed_in_ag19b: false,
  public_visibility_switch_allowed_in_ag19b: false,
  public_index_mutation_allowed_in_ag19b: false,
  public_publishing_operation_allowed_in_ag19b: false,
  deployment_trigger_allowed_in_ag19b: false,
  ...stageControls
};

const review = {
  module_id: "AG19B",
  title: "Pre-Apply Readiness Audit",
  status: "pre_apply_readiness_audit_passed_ready_for_ag19c_final_public_delta_dry_run",
  depends_on: ["AG19A"],
  generated_from: inputs,
  audit_report_file: "data/content-intelligence/audit-records/ag19b-pre-apply-readiness-audit-report.json",
  decision_file: "data/content-intelligence/go-live/ag19b-final-public-delta-dry-run-readiness-decision-record.json",
  safety_file: "data/content-intelligence/quality-registry/ag19b-pre-apply-safety-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag19b-final-public-delta-dry-run-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag19b-to-ag19c-final-public-delta-dry-run-boundary.json",
  schema_file: "data/content-intelligence/schema/pre-apply-readiness-audit.schema.json",
  summary: {
    audit_passed: true,
    failed_checks: 0,
    ready_for_ag19c: true,
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
  module_id: "AG19B",
  title: "Pre-Apply Readiness Audit Learning",
  status: "learning_record_only",
  learning_points: [
    "AG19A pre-apply readiness plans passed audit with zero failed checks.",
    "The next safe step is AG19C final public delta dry-run only.",
    "No real candidate apply, GitHub token, GitHub write, visibility switch, public index mutation, deployment or publishing is approved.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG19B",
  title: "Pre-Apply Readiness Audit",
  status: "pre_apply_readiness_audit_passed_ready_for_ag19c_final_public_delta_dry_run",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag19b-pre-apply-readiness-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag19b-pre-apply-readiness-audit-report.json",
    decision: "data/content-intelligence/go-live/ag19b-final-public-delta-dry-run-readiness-decision-record.json",
    safety: "data/content-intelligence/quality-registry/ag19b-pre-apply-safety-record.json",
    readiness: "data/content-intelligence/quality-registry/ag19b-final-public-delta-dry-run-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag19b-to-ag19c-final-public-delta-dry-run-boundary.json",
    schema: "data/content-intelligence/schema/pre-apply-readiness-audit.schema.json",
    learning: "data/content-intelligence/learning/ag19b-pre-apply-readiness-audit-learning.json",
    preview: "data/quality/ag19b-pre-apply-readiness-audit-preview.json",
    document: "docs/quality/AG19B_PRE_APPLY_READINESS_AUDIT.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG19B",
  preview_only: true,
  status: "pre_apply_readiness_audit_passed_ready_for_ag19c_final_public_delta_dry_run",
  audit_passed: true,
  failed_checks: 0,
  ready_for_ag19c: true,
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

const doc = `# AG19B — Pre-Apply Readiness Audit

## Purpose

AG19B audits the AG19A first static activation pre-apply readiness plan.

AG19B is audit-only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Audit Result

AG19A pre-apply readiness plans passed audit with zero failed checks.

## Decision

AG19C may proceed only as Final Public Delta Dry-run.

Not approved: real candidate apply, GitHub token creation, GitHub write, public visibility switch, public index mutation, deployment trigger, publish execution or Supabase/Auth/backend activation.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG19C — Final Public Delta Dry-run — only with explicit approval.
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

console.log("✅ AG19B Pre-Apply Readiness Audit generated.");
console.log("✅ AG19A pre-apply readiness audit passed with zero failed checks.");
console.log("✅ Decision recorded: proceed only to AG19C final public delta dry-run.");
console.log("✅ GitHub token, GitHub write, visibility switch, public index mutation, deployment and publishing remain blocked.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG19C Final Public Delta Dry-run boundary created.");
