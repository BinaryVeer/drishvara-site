import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag20eReview: "data/content-intelligence/quality-reviews/ag20e-controlled-static-apply-execution-plan.json",
  ag20ePlan: "data/content-intelligence/go-live/ag20e-controlled-static-apply-execution-plan.json",
  ag20eApprovalSequence: "data/content-intelligence/go-live/ag20e-approval-phrase-execution-sequence-plan.json",
  ag20eTokenPrecondition: "data/content-intelligence/go-live/ag20e-github-token-precondition-plan.json",
  ag20eFileMutationOrder: "data/content-intelligence/go-live/ag20e-file-mutation-order-plan.json",
  ag20ePublicSurfaceOrder: "data/content-intelligence/go-live/ag20e-public-surface-switch-order-plan.json",
  ag20eDeploymentSmokeOrder: "data/content-intelligence/go-live/ag20e-deployment-smoke-test-order-plan.json",
  ag20eRollbackOrder: "data/content-intelligence/go-live/ag20e-rollback-order-plan.json",
  ag20eBlocker: "data/content-intelligence/quality-registry/ag20e-controlled-static-apply-execution-plan-blocker-register.json",
  ag20eReadiness: "data/content-intelligence/quality-registry/ag20e-controlled-static-apply-execution-plan-audit-readiness-record.json",
  ag20eBoundary: "data/content-intelligence/mutation-plans/ag20e-to-ag20f-controlled-static-apply-execution-plan-audit-boundary.json",

  ag20dDecision: "data/content-intelligence/go-live/ag20d-controlled-static-apply-execution-plan-readiness-decision-record.json",
  ag20dSafety: "data/content-intelligence/quality-registry/ag20d-controlled-static-apply-final-authorization-safety-record.json",
  ag19eApprovalPhrase: "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const out = {
  review: "data/content-intelligence/quality-reviews/ag20f-controlled-static-apply-execution-plan-audit.json",
  audit: "data/content-intelligence/audit-records/ag20f-controlled-static-apply-execution-plan-audit-report.json",
  closure: "data/content-intelligence/closure-records/ag20f-controlled-static-apply-execution-plan-audit-closure.json",
  safety: "data/content-intelligence/quality-registry/ag20f-controlled-static-apply-execution-plan-safety-record.json",
  readiness: "data/content-intelligence/quality-registry/ag20f-controlled-static-apply-planning-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag20f-to-ag20z-controlled-static-apply-planning-closure-boundary.json",
  schema: "data/content-intelligence/schema/controlled-static-apply-execution-plan-audit.schema.json",
  learning: "data/content-intelligence/learning/ag20f-controlled-static-apply-execution-plan-audit-learning.json",
  registry: "data/quality/ag20f-controlled-static-apply-execution-plan-audit.json",
  preview: "data/quality/ag20f-controlled-static-apply-execution-plan-audit-preview.json",
  doc: "docs/quality/AG20F_CONTROLLED_STATIC_APPLY_EXECUTION_PLAN_AUDIT.md"
};

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(path.join(root, filePath)), { recursive: true });
}
function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}
function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}
function writeJson(relativePath, value) {
  ensureDir(relativePath);
  fs.writeFileSync(path.join(root, relativePath), JSON.stringify(value, null, 2) + "\n");
}
function writeText(relativePath, value) {
  ensureDir(relativePath);
  fs.writeFileSync(path.join(root, relativePath), value);
}
function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing AG20F input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag20eReview.status !== "controlled_static_apply_execution_plan_created_pending_audit") {
  throw new Error("AG20F requires AG20E review readiness.");
}
if (data.ag20ePlan.status !== "controlled_static_apply_execution_plan_created_pending_audit") {
  throw new Error("AG20F requires AG20E execution plan.");
}
if (data.ag20eReadiness.ready_for_ag20f !== true) {
  throw new Error("AG20F requires AG20E readiness.");
}
if (data.ag20eBoundary.next_stage_id !== "AG20F" || data.ag20eBoundary.explicit_approval_required !== true) {
  throw new Error("AG20F requires AG20E to AG20F explicit boundary.");
}

const requiredPhrase = "Proceed with first controlled static apply";
if (data.ag19eApprovalPhrase.exact_phrase_required_later !== requiredPhrase) {
  throw new Error("AG20F requires the approved AG19E phrase.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG20F requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  controlled_static_apply_execution_plan_audit_only: true,
  ag20e_execution_plan_audited_in_ag20f: true,
  execution_plan_audit_closure_created_in_ag20f: true,
  execution_plan_safety_record_created_in_ag20f: true,
  ag20z_boundary_created_in_ag20f: true,
  selected_article_read_performed: true,

  explicit_approval_phrase_executed_in_ag20f: false,
  article_generation_performed_in_ag20f: false,
  article_mutation_performed_in_ag20f: false,
  queue_mutation_performed_in_ag20f: false,
  active_admin_review_queue_record_created_in_ag20f: false,
  queue_index_mutation_performed_in_ag20f: false,
  admin_action_execution_performed_in_ag20f: false,
  editor_action_execution_performed_in_ag20f: false,
  real_credential_created_in_ag20f: false,
  hardcoded_password_created_in_repo_in_ag20f: false,
  password_hash_created_in_repo_in_ag20f: false,
  auth_activation_performed_in_ag20f: false,
  backend_activation_performed_in_ag20f: false,
  supabase_activation_performed_in_ag20f: false,
  database_write_performed_in_ag20f: false,
  github_token_created_or_exposed_in_ag20f: false,
  github_write_operation_performed_in_ag20f: false,
  active_action_handler_created_in_ag20f: false,
  api_endpoint_created_in_ag20f: false,
  public_visibility_switch_performed_in_ag20f: false,
  public_index_mutation_performed_in_ag20f: false,
  deployment_trigger_performed_in_ag20f: false,
  live_smoke_test_performed_in_ag20f: false,
  rollback_execution_performed_in_ag20f: false,
  public_publishing_operation_performed_in_ag20f: false
};

const auditChecks = [
  {
    check_id: "AG20F-AUDIT-001",
    area: "ag20e_dependency",
    status: "passed",
    note: "AG20E review, execution plan, sequence plans, blocker register, readiness and boundary are present."
  },
  {
    check_id: "AG20F-AUDIT-002",
    area: "execution_plan",
    status:
      data.ag20ePlan.execution_plan_only === true &&
      data.ag20ePlan.candidate.article_path === articlePath &&
      data.ag20ePlan.candidate.article_hash === currentArticleHash &&
      data.ag20ePlan.required_future_approval_phrase === requiredPhrase &&
      data.ag20ePlan.current_decision_state.execution_plan_created === true &&
      data.ag20ePlan.current_decision_state.ready_for_ag20f_audit === true &&
      data.ag20ePlan.current_decision_state.explicit_approval_phrase_executed_now === false &&
      data.ag20ePlan.current_decision_state.controlled_static_apply_authorised_now === false &&
      data.ag20ePlan.current_decision_state.candidate_apply_enabled_now === false &&
      data.ag20ePlan.current_decision_state.github_token_enabled_now === false &&
      data.ag20ePlan.current_decision_state.github_write_enabled_now === false &&
      data.ag20ePlan.current_decision_state.visibility_switch_enabled_now === false &&
      data.ag20ePlan.current_decision_state.public_index_mutation_enabled_now === false &&
      data.ag20ePlan.current_decision_state.deployment_enabled_now === false &&
      data.ag20ePlan.current_decision_state.publishing_enabled_now === false
        ? "passed"
        : "failed",
    note: "Execution plan must be plan-only and must not authorise or execute real apply."
  },
  {
    check_id: "AG20F-AUDIT-003",
    area: "approval_sequence",
    status:
      data.ag20eApprovalSequence.status === "approval_phrase_execution_sequence_planned_not_executed" &&
      data.ag20eApprovalSequence.required_future_approval_phrase === requiredPhrase &&
      Object.entries(data.ag20eApprovalSequence.current_state).every(([key, value]) =>
        key === "sequence_defined" ? value === true : value === false
      )
        ? "passed"
        : "failed",
    note: "Approval phrase execution sequence must be defined but not executed."
  },
  {
    check_id: "AG20F-AUDIT-004",
    area: "github_token_precondition",
    status:
      data.ag20eTokenPrecondition.status === "github_token_precondition_planned_no_secret_created" &&
      Object.entries(data.ag20eTokenPrecondition.current_secret_state).every(([key, value]) =>
        key === "token_precondition_defined" ? value === true : value === false
      )
        ? "passed"
        : "failed",
    note: "GitHub token precondition may be planned only; no token or write may occur."
  },
  {
    check_id: "AG20F-AUDIT-005",
    area: "file_mutation_order",
    status:
      data.ag20eFileMutationOrder.status === "file_mutation_order_planned_no_mutation" &&
      data.ag20eFileMutationOrder.candidate.article_path === articlePath &&
      data.ag20eFileMutationOrder.candidate.article_hash === currentArticleHash &&
      data.ag20eFileMutationOrder.planned_order_for_later_apply.every((step) => step.executed_now === false) &&
      Object.entries(data.ag20eFileMutationOrder.current_mutation_state).every(([key, value]) =>
        key === "file_mutation_order_defined" ? value === true : value === false
      )
        ? "passed"
        : "failed",
    note: "File mutation order must be planned without mutating files or writing to Git."
  },
  {
    check_id: "AG20F-AUDIT-006",
    area: "public_surface_switch_order",
    status:
      data.ag20ePublicSurfaceOrder.status === "public_surface_switch_order_planned_no_switch" &&
      data.ag20ePublicSurfaceOrder.planned_surface_order_for_later_apply.every((step) => step.executed_now === false) &&
      Object.entries(data.ag20ePublicSurfaceOrder.current_public_state).every(([key, value]) =>
        key === "surface_order_defined" ? value === true : value === false
      )
        ? "passed"
        : "failed",
    note: "Public surface switch order must be planned without switching visibility or mutating indexes."
  },
  {
    check_id: "AG20F-AUDIT-007",
    area: "deployment_smoke_test_order",
    status:
      data.ag20eDeploymentSmokeOrder.status === "deployment_smoke_test_order_planned_no_execution" &&
      data.ag20eDeploymentSmokeOrder.planned_order_for_later_apply.every((step) => step.executed_now === false) &&
      Object.entries(data.ag20eDeploymentSmokeOrder.current_execution_state).every(([key, value]) =>
        key === "deployment_smoke_test_order_defined" ? value === true : value === false
      )
        ? "passed"
        : "failed",
    note: "Deployment and smoke-test order must be planned without deployment, live checks or publishing."
  },
  {
    check_id: "AG20F-AUDIT-008",
    area: "rollback_order",
    status:
      data.ag20eRollbackOrder.status === "rollback_order_planned_no_execution" &&
      data.ag20eRollbackOrder.planned_rollback_order_for_later_apply.every((step) => step.executed_now === false) &&
      Object.entries(data.ag20eRollbackOrder.current_rollback_state).every(([key, value]) =>
        key === "rollback_order_defined" ? value === true : value === false
      )
        ? "passed"
        : "failed",
    note: "Rollback order must be planned without rollback execution."
  },
  {
    check_id: "AG20F-AUDIT-009",
    area: "blocker_register",
    status:
      data.ag20eBlocker.blocked_items.includes("Explicit approval phrase execution.") &&
      data.ag20eBlocker.blocked_items.includes("Real candidate apply.") &&
      data.ag20eBlocker.blocked_items.includes("Real GitHub token creation.") &&
      data.ag20eBlocker.blocked_items.includes("Real GitHub write.") &&
      data.ag20eBlocker.blocked_items.includes("Real public visibility switch.") &&
      data.ag20eBlocker.blocked_items.includes("Real public index mutation.") &&
      data.ag20eBlocker.blocked_items.includes("Deployment trigger.") &&
      data.ag20eBlocker.blocked_items.includes("Publish execution.") &&
      data.ag20eBlocker.blocked_items.includes("Live smoke-test execution.") &&
      data.ag20eBlocker.blocked_items.includes("Rollback execution.") &&
      data.ag20eBlocker.blocked_items.includes("Supabase/Auth/backend activation.") &&
      data.ag20eBlocker.supabase_auth_backend_deferred === true
        ? "passed"
        : "failed",
    note: "Execution plan blocker register must keep all real operations blocked."
  },
  {
    check_id: "AG20F-AUDIT-010",
    area: "ag20d_decision_inheritance",
    status:
      data.ag20dDecision.decision.proceed_to_controlled_static_apply_execution_plan === true &&
      data.ag20dDecision.decision.proceed_to_execute_approval_phrase === false &&
      data.ag20dDecision.decision.proceed_to_real_candidate_apply === false &&
      data.ag20dDecision.decision.proceed_to_github_token_creation === false &&
      data.ag20dDecision.decision.proceed_to_github_write === false &&
      data.ag20dDecision.decision.proceed_to_public_visibility_switch === false &&
      data.ag20dDecision.decision.proceed_to_public_index_mutation === false &&
      data.ag20dDecision.decision.proceed_to_deployment_trigger === false &&
      data.ag20dDecision.decision.proceed_to_publish_execution === false &&
      data.ag20dDecision.decision.proceed_to_supabase_auth_backend_activation === false
        ? "passed"
        : "failed",
    note: "AG20D decision must allow only AG20E execution plan and block real apply."
  },
  {
    check_id: "AG20F-AUDIT-011",
    area: "ag20d_safety_inheritance",
    status:
      data.ag20dSafety.safety_assertions.execution_plan_allowed === true &&
      data.ag20dSafety.safety_assertions.approval_phrase_executed === false &&
      data.ag20dSafety.safety_assertions.candidate_real_apply_enabled === false &&
      data.ag20dSafety.safety_assertions.github_token_created === false &&
      data.ag20dSafety.safety_assertions.github_write_enabled === false &&
      data.ag20dSafety.safety_assertions.public_visibility_switch_enabled === false &&
      data.ag20dSafety.safety_assertions.public_index_mutation_enabled === false &&
      data.ag20dSafety.safety_assertions.deployment_trigger_enabled === false &&
      data.ag20dSafety.safety_assertions.publishing_enabled === false
        ? "passed"
        : "failed",
    note: "AG20D safety controls must remain inherited."
  },
  {
    check_id: "AG20F-AUDIT-012",
    area: "readiness_alignment",
    status:
      data.ag20eReadiness.ready_for_ag20f === true &&
      data.ag20eReadiness.required_future_approval_phrase === requiredPhrase &&
      data.ag20eReadiness.github_token_ready === false &&
      data.ag20eReadiness.github_write_ready === false &&
      data.ag20eReadiness.candidate_apply_ready === false &&
      data.ag20eReadiness.public_visibility_switch_ready === false &&
      data.ag20eReadiness.public_index_mutation_ready === false &&
      data.ag20eReadiness.deployment_trigger_ready === false &&
      data.ag20eReadiness.publish_ready === false &&
      data.ag20eReadiness.supabase_activation_ready === false
        ? "passed"
        : "failed",
    note: "AG20E readiness must point to AG20F audit while real apply remains blocked."
  },
  {
    check_id: "AG20F-AUDIT-013",
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
    check_id: "AG20F-AUDIT-014",
    area: "forbidden_operations",
    status: "passed",
    note: "AG20F is audit-only and performs no approval phrase execution, mutation, credential creation, GitHub write, deployment, smoke-test, rollback, publishing or backend activation."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG20F audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const audit = {
  module_id: "AG20F",
  title: "Controlled Static Apply Execution Plan Audit Report",
  status: "controlled_static_apply_execution_plan_audit_passed",
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    failed: failedChecks.length
  },
  decision: {
    ag20e_execution_plan_valid: true,
    approval_sequence_valid: true,
    github_token_precondition_valid: true,
    file_mutation_order_valid: true,
    public_surface_switch_order_valid: true,
    deployment_smoke_test_order_valid: true,
    rollback_order_valid: true,
    no_approval_phrase_executed: true,
    no_candidate_apply_performed: true,
    no_github_token_created: true,
    no_github_write_performed: true,
    no_public_visibility_switch_performed: true,
    no_public_index_mutation_performed: true,
    no_deployment_triggered: true,
    no_live_smoke_test_performed: true,
    no_rollback_executed: true,
    no_publishing_performed: true,
    supabase_auth_backend_deferred: true,
    ready_for_ag20z_closure: true
  },
  ...stageControls
};

const closure = {
  module_id: "AG20F",
  title: "Controlled Static Apply Execution Plan Audit Closure",
  status: "controlled_static_apply_execution_plan_audit_passed_ready_for_ag20z_closure",
  closed_scope: [
    "AG20E controlled static apply execution plan.",
    "Approval phrase execution sequence plan.",
    "GitHub token precondition plan.",
    "File mutation order plan.",
    "Public surface switch order plan.",
    "Deployment and smoke-test order plan.",
    "Rollback order plan."
  ],
  unresolved_for_real_apply: [
    "Exact approval phrase execution.",
    "GitHub token secure availability.",
    "GitHub write.",
    "File mutation.",
    "Public visibility switch.",
    "Public index mutation.",
    "Deployment trigger.",
    "Live smoke-test execution.",
    "Rollback path execution if required.",
    "Publishing confirmation.",
    "Supabase/Auth/backend activation remains deferred."
  ],
  closure_decision: {
    close_ag20e_execution_plan_audit: true,
    proceed_to_ag20z_controlled_static_apply_planning_closure: true,
    proceed_to_execute_approval_phrase: false,
    proceed_to_real_candidate_apply: false,
    proceed_to_github_token_creation: false,
    proceed_to_github_write: false,
    proceed_to_public_visibility_switch: false,
    proceed_to_public_index_mutation: false,
    proceed_to_deployment_trigger: false,
    proceed_to_live_smoke_test_execution: false,
    proceed_to_rollback_execution: false,
    proceed_to_publish_execution: false,
    proceed_to_supabase_auth_backend_activation: false
  },
  ...stageControls
};

const safety = {
  module_id: "AG20F",
  title: "Controlled Static Apply Execution Plan Safety Record",
  status: "execution_plan_safe_for_ag20z_closure_only",
  safety_assertions: {
    static_github_controlled_first: true,
    supabase_auth_backend_deferred: true,
    ag20z_closure_allowed: true,
    approval_phrase_executed: false,
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
    live_smoke_test_enabled: false,
    rollback_execution_enabled: false,
    publishing_enabled: false,
    admin_editor_execution_enabled: false
  },
  reminder: data.ag17bSupabaseReminder.reminder,
  ...stageControls
};

const readiness = {
  module_id: "AG20F",
  title: "Controlled Static Apply Planning Closure Readiness Record",
  status: "ready_for_ag20z_controlled_static_apply_planning_closure",
  ready_for_ag20z: true,
  ag20z_explicit_approval_required: true,
  controlled_static_apply_execution_plan_audit_passed: true,
  failed_checks: 0,
  selected_path: "hybrid_staged_path_static_first",
  static_github_controlled_first: true,
  supabase_auth_backend_deferred: true,
  supabase_auth_reminder_required_in_future: true,
  required_future_approval_phrase: requiredPhrase,

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
  live_smoke_test_ready: false,
  rollback_ready: false,
  publish_ready: false,
  reason: "AG20F audits execution planning. AG20Z should close AG20 and define the next controlled apply transition without executing real apply.",
  ...stageControls
};

const boundary = {
  module_id: "AG20F",
  title: "AG20F to AG20Z Controlled Static Apply Planning Closure Boundary",
  status: "ag20z_boundary_created_not_started",
  next_stage_id: "AG20Z",
  next_stage_title: "Controlled Static Apply Planning Closure",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  required_future_approval_phrase: requiredPhrase,
  ag20z_allowed_scope: [
    "Close AG20 controlled static apply planning chain.",
    "Summarise AG20A through AG20F outputs.",
    "Record remaining blockers before any future apply transition.",
    "Carry forward approval phrase requirement.",
    "Carry forward Supabase/Auth/backend defer reminder.",
    "Create next controlled apply transition boundary."
  ],
  ag20z_blocked_scope: [
    "No approval phrase execution.",
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
    "No deployment trigger.",
    "No live smoke-test.",
    "No rollback execution."
  ],
  supabase_auth_defer_reminder_required_in_ag20z: true,
  ...stageControls
};

const schema = {
  module_id: "AG20F",
  title: "Controlled Static Apply Execution Plan Audit Schema",
  status: "schema_controlled_static_apply_execution_plan_audit_only",
  execution_plan_audit_allowed_in_ag20f: true,
  audit_report_allowed_in_ag20f: true,
  audit_closure_allowed_in_ag20f: true,
  safety_record_allowed_in_ag20f: true,
  ag20z_boundary_allowed_in_ag20f: true,

  explicit_approval_phrase_execution_allowed_in_ag20f: false,
  article_generation_allowed_in_ag20f: false,
  article_mutation_allowed_in_ag20f: false,
  queue_mutation_allowed_in_ag20f: false,
  active_admin_review_queue_record_creation_allowed_in_ag20f: false,
  queue_index_mutation_allowed_in_ag20f: false,
  admin_action_execution_allowed_in_ag20f: false,
  editor_action_execution_allowed_in_ag20f: false,
  real_credential_creation_allowed_in_ag20f: false,
  auth_activation_allowed_in_ag20f: false,
  backend_activation_allowed_in_ag20f: false,
  supabase_activation_allowed_in_ag20f: false,
  database_write_allowed_in_ag20f: false,
  github_token_creation_or_exposure_allowed_in_ag20f: false,
  github_write_operation_allowed_in_ag20f: false,
  active_action_handler_creation_allowed_in_ag20f: false,
  api_endpoint_creation_allowed_in_ag20f: false,
  public_visibility_switch_allowed_in_ag20f: false,
  public_index_mutation_allowed_in_ag20f: false,
  deployment_trigger_allowed_in_ag20f: false,
  live_smoke_test_allowed_in_ag20f: false,
  rollback_execution_allowed_in_ag20f: false,
  public_publishing_operation_allowed_in_ag20f: false,
  ...stageControls
};

const review = {
  module_id: "AG20F",
  title: "Controlled Static Apply Execution Plan Audit",
  status: "controlled_static_apply_execution_plan_audit_passed_ready_for_ag20z_closure",
  depends_on: ["AG20E"],
  generated_from: inputs,
  audit_report_file: out.audit,
  closure_file: out.closure,
  safety_file: out.safety,
  readiness_file: out.readiness,
  next_boundary_file: out.boundary,
  schema_file: out.schema,
  summary: {
    audit_passed: true,
    failed_checks: 0,
    ready_for_ag20z: true,
    selected_path: "hybrid_staged_path_static_first",
    required_future_approval_phrase: requiredPhrase,
    supabase_auth_backend_deferred: true,
    explicit_approval_phrase_executed: false,
    github_token_ready: false,
    github_write_ready: false,
    candidate_apply_ready: false,
    public_visibility_switch_ready: false,
    public_index_mutation_ready: false,
    deployment_trigger_ready: false,
    live_smoke_test_ready: false,
    rollback_ready: false,
    publish_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG20F",
  title: "Controlled Static Apply Execution Plan Audit Learning",
  status: "learning_record_only",
  learning_points: [
    "AG20E execution plan passed audit with zero failed checks.",
    "Approval phrase, GitHub token/write, file mutation, public surface switch, deployment, smoke-test and rollback remain planned only.",
    "The next safe step is AG20Z closure.",
    "No GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback or publishing occurred.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG20F",
  title: "Controlled Static Apply Execution Plan Audit",
  status: "controlled_static_apply_execution_plan_audit_passed_ready_for_ag20z_closure",
  generated_artifacts: {
    review: out.review,
    audit_report: out.audit,
    closure: out.closure,
    safety: out.safety,
    readiness: out.readiness,
    next_boundary: out.boundary,
    schema: out.schema,
    learning: out.learning,
    preview: out.preview,
    document: out.doc
  },
  ...stageControls
};

const preview = {
  module_id: "AG20F",
  preview_only: true,
  status: "controlled_static_apply_execution_plan_audit_passed_ready_for_ag20z_closure",
  audit_passed: true,
  failed_checks: 0,
  ready_for_ag20z: true,
  selected_path: "hybrid_staged_path_static_first",
  required_future_approval_phrase: requiredPhrase,
  supabase_auth_backend_deferred: true,
  explicit_approval_phrase_executed: false,
  github_token_ready: false,
  github_write_ready: false,
  candidate_apply_ready: false,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  deployment_trigger_ready: false,
  live_smoke_test_ready: false,
  rollback_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG20F — Controlled Static Apply Execution Plan Audit

## Purpose

AG20F audits the AG20E controlled static apply execution plan.

AG20F is audit-only. It does not execute the approval phrase, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment, run live smoke-tests, rollback or publish anything.

## Audit Result

AG20E controlled static apply execution plan passed audit with zero failed checks.

## Decision

AG20Z may proceed only as Controlled Static Apply Planning Closure.

Not approved: approval phrase execution, real candidate apply, GitHub token creation, GitHub write, public visibility switch, public index mutation, deployment trigger, live smoke-test, rollback execution, publish execution or Supabase/Auth/backend activation.

## Approval Phrase

Future controlled static apply still requires the exact phrase:

\`Proceed with first controlled static apply\`

This phrase is not executed in AG20F.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG20Z — Controlled Static Apply Planning Closure — only with explicit approval.
`;

writeJson(out.review, review);
writeJson(out.audit, audit);
writeJson(out.closure, closure);
writeJson(out.safety, safety);
writeJson(out.readiness, readiness);
writeJson(out.boundary, boundary);
writeJson(out.schema, schema);
writeJson(out.learning, learning);
writeJson(out.registry, registry);
writeJson(out.preview, preview);
writeText(out.doc, doc);

console.log("✅ AG20F Controlled Static Apply Execution Plan Audit generated.");
console.log("✅ AG20E execution plan audit passed with zero failed checks.");
console.log("✅ Decision recorded: proceed only to AG20Z planning closure.");
console.log("✅ Explicit approval phrase remains required but not executed.");
console.log("✅ GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback and publishing remain blocked.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG20Z Controlled Static Apply Planning Closure boundary created.");
