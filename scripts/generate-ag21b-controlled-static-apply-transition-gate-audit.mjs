import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag21aReview: "data/content-intelligence/quality-reviews/ag21a-controlled-static-apply-transition-gate.json",
  ag21aTransitionGate: "data/content-intelligence/go-live/ag21a-controlled-static-apply-transition-gate-package.json",
  ag21aFinalPreconditions: "data/content-intelligence/go-live/ag21a-final-precondition-lock-record.json",
  ag21aApprovalPhraseLock: "data/content-intelligence/go-live/ag21a-approval-phrase-lock-record.json",
  ag21aCandidateSurfaceLock: "data/content-intelligence/go-live/ag21a-candidate-and-public-surface-lock-record.json",
  ag21aTokenWriteDeployLock: "data/content-intelligence/go-live/ag21a-token-write-deployment-lock-record.json",
  ag21aOperatorMatrix: "data/content-intelligence/go-live/ag21a-operator-decision-matrix.json",
  ag21aBlocker: "data/content-intelligence/quality-registry/ag21a-controlled-static-apply-transition-gate-blocker-register.json",
  ag21aReadiness: "data/content-intelligence/quality-registry/ag21a-controlled-static-apply-transition-gate-audit-readiness-record.json",
  ag21aBoundary: "data/content-intelligence/mutation-plans/ag21a-to-ag21b-controlled-static-apply-transition-gate-audit-boundary.json",

  ag20zSummary: "data/content-intelligence/go-live/ag20z-controlled-static-apply-planning-summary.json",
  ag20zClosure: "data/content-intelligence/closure-records/ag20z-controlled-static-apply-planning-closure.json",
  ag19eApprovalPhrase: "data/content-intelligence/go-live/ag19e-explicit-approval-phrase-record.json",
  ag17bSupabaseReminder: "data/content-intelligence/go-live/ag17b-supabase-auth-defer-carry-forward-reminder.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const out = {
  review: "data/content-intelligence/quality-reviews/ag21b-controlled-static-apply-transition-gate-audit.json",
  audit: "data/content-intelligence/audit-records/ag21b-controlled-static-apply-transition-gate-audit-report.json",
  decision: "data/content-intelligence/go-live/ag21b-controlled-static-apply-execution-readiness-decision-record.json",
  safety: "data/content-intelligence/quality-registry/ag21b-controlled-static-apply-transition-gate-safety-record.json",
  readiness: "data/content-intelligence/quality-registry/ag21b-controlled-static-apply-execution-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag21b-to-ag21c-controlled-static-apply-execution-readiness-boundary.json",
  schema: "data/content-intelligence/schema/controlled-static-apply-transition-gate-audit.schema.json",
  learning: "data/content-intelligence/learning/ag21b-controlled-static-apply-transition-gate-audit-learning.json",
  registry: "data/quality/ag21b-controlled-static-apply-transition-gate-audit.json",
  preview: "data/quality/ag21b-controlled-static-apply-transition-gate-audit-preview.json",
  doc: "docs/quality/AG21B_CONTROLLED_STATIC_APPLY_TRANSITION_GATE_AUDIT.md"
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
  if (!exists(relativePath)) throw new Error(`Missing AG21B input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([key, relativePath]) => [key, readJson(relativePath)]));

if (data.ag21aReview.status !== "controlled_static_apply_transition_gate_created_pending_audit") {
  throw new Error("AG21B requires AG21A review readiness.");
}
if (data.ag21aTransitionGate.status !== "controlled_static_apply_transition_gate_created_pending_audit") {
  throw new Error("AG21B requires AG21A transition gate package.");
}
if (data.ag21aReadiness.ready_for_ag21b !== true) {
  throw new Error("AG21B requires AG21A readiness.");
}
if (data.ag21aBoundary.next_stage_id !== "AG21B" || data.ag21aBoundary.explicit_approval_required !== true) {
  throw new Error("AG21B requires AG21A to AG21B explicit boundary.");
}

const requiredPhrase = "Proceed with first controlled static apply";
if (data.ag19eApprovalPhrase.exact_phrase_required_later !== requiredPhrase) {
  throw new Error("AG21B requires the approved AG19E phrase.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG21B requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  controlled_static_apply_transition_gate_audit_only: true,
  ag21a_transition_gate_audited_in_ag21b: true,
  execution_readiness_decision_created_in_ag21b: true,
  transition_gate_safety_record_created_in_ag21b: true,
  ag21c_boundary_created_in_ag21b: true,
  selected_article_read_performed: true,

  explicit_approval_phrase_executed_in_ag21b: false,
  article_generation_performed_in_ag21b: false,
  article_mutation_performed_in_ag21b: false,
  queue_mutation_performed_in_ag21b: false,
  active_admin_review_queue_record_created_in_ag21b: false,
  queue_index_mutation_performed_in_ag21b: false,
  admin_action_execution_performed_in_ag21b: false,
  editor_action_execution_performed_in_ag21b: false,
  real_credential_created_in_ag21b: false,
  hardcoded_password_created_in_repo_in_ag21b: false,
  password_hash_created_in_repo_in_ag21b: false,
  auth_activation_performed_in_ag21b: false,
  backend_activation_performed_in_ag21b: false,
  supabase_activation_performed_in_ag21b: false,
  database_write_performed_in_ag21b: false,
  github_token_created_or_exposed_in_ag21b: false,
  github_write_operation_performed_in_ag21b: false,
  active_action_handler_created_in_ag21b: false,
  api_endpoint_created_in_ag21b: false,
  public_visibility_switch_performed_in_ag21b: false,
  public_index_mutation_performed_in_ag21b: false,
  deployment_trigger_performed_in_ag21b: false,
  live_smoke_test_performed_in_ag21b: false,
  rollback_execution_performed_in_ag21b: false,
  public_publishing_operation_performed_in_ag21b: false
};

const auditChecks = [
  {
    check_id: "AG21B-AUDIT-001",
    area: "ag21a_dependency",
    status: "passed",
    note: "AG21A review, transition gate package, lock records, blocker register, readiness and boundary are present."
  },
  {
    check_id: "AG21B-AUDIT-002",
    area: "transition_gate_package",
    status:
      data.ag21aTransitionGate.transition_gate_only === true &&
      data.ag21aTransitionGate.seed_candidate.article_path === articlePath &&
      data.ag21aTransitionGate.seed_candidate.article_hash === currentArticleHash &&
      data.ag21aTransitionGate.required_future_approval_phrase === requiredPhrase &&
      data.ag21aTransitionGate.current_decision_state.transition_gate_created === true &&
      data.ag21aTransitionGate.current_decision_state.ready_for_ag21b_audit === true &&
      data.ag21aTransitionGate.current_decision_state.explicit_approval_phrase_executed_now === false &&
      data.ag21aTransitionGate.current_decision_state.controlled_static_apply_authorised_now === false &&
      data.ag21aTransitionGate.current_decision_state.candidate_apply_enabled_now === false &&
      data.ag21aTransitionGate.current_decision_state.github_token_enabled_now === false &&
      data.ag21aTransitionGate.current_decision_state.github_write_enabled_now === false &&
      data.ag21aTransitionGate.current_decision_state.visibility_switch_enabled_now === false &&
      data.ag21aTransitionGate.current_decision_state.public_index_mutation_enabled_now === false &&
      data.ag21aTransitionGate.current_decision_state.deployment_enabled_now === false &&
      data.ag21aTransitionGate.current_decision_state.live_smoke_test_enabled_now === false &&
      data.ag21aTransitionGate.current_decision_state.rollback_enabled_now === false &&
      data.ag21aTransitionGate.current_decision_state.publishing_enabled_now === false
        ? "passed"
        : "failed",
    note: "Transition gate package must remain gate-only and must not authorise real apply."
  },
  {
    check_id: "AG21B-AUDIT-003",
    area: "final_precondition_lock",
    status:
      data.ag21aFinalPreconditions.status === "final_preconditions_locked_for_transition_gate_no_execution" &&
      data.ag21aFinalPreconditions.required_future_approval_phrase === requiredPhrase &&
      data.ag21aFinalPreconditions.seed_candidate.article_hash === currentArticleHash &&
      Object.entries(data.ag21aFinalPreconditions.current_lock_state).every(([key, value]) =>
        key === "final_preconditions_locked_for_audit" ? value === true : value === false
      )
        ? "passed"
        : "failed",
    note: "Final preconditions must be locked for audit but not executed."
  },
  {
    check_id: "AG21B-AUDIT-004",
    area: "approval_phrase_lock",
    status:
      data.ag21aApprovalPhraseLock.status === "approval_phrase_locked_not_executed" &&
      data.ag21aApprovalPhraseLock.required_future_approval_phrase === requiredPhrase &&
      data.ag21aApprovalPhraseLock.current_phrase_state.phrase_locked === true &&
      data.ag21aApprovalPhraseLock.current_phrase_state.phrase_displayed_for_future_use === true &&
      data.ag21aApprovalPhraseLock.current_phrase_state.phrase_executed_now === false &&
      data.ag21aApprovalPhraseLock.current_phrase_state.controlled_static_apply_authorised_now === false &&
      data.ag21aApprovalPhraseLock.current_phrase_state.github_write_authorised_now === false &&
      data.ag21aApprovalPhraseLock.current_phrase_state.public_visibility_switch_authorised_now === false &&
      data.ag21aApprovalPhraseLock.current_phrase_state.public_index_mutation_authorised_now === false &&
      data.ag21aApprovalPhraseLock.current_phrase_state.deployment_authorised_now === false &&
      data.ag21aApprovalPhraseLock.current_phrase_state.publish_authorised_now === false
        ? "passed"
        : "failed",
    note: "Approval phrase must be locked but not executed."
  },
  {
    check_id: "AG21B-AUDIT-005",
    area: "candidate_surface_lock",
    status:
      data.ag21aCandidateSurfaceLock.status === "candidate_and_public_surfaces_locked_no_mutation" &&
      data.ag21aCandidateSurfaceLock.seed_candidate.article_path === articlePath &&
      data.ag21aCandidateSurfaceLock.seed_candidate.article_hash === currentArticleHash &&
      data.ag21aCandidateSurfaceLock.future_public_surface_candidates.every((surface) => surface.mutate_now === false) &&
      Object.entries(data.ag21aCandidateSurfaceLock.current_surface_state).every(([key, value]) =>
        key === "candidate_locked" ? value === true : value === false
      )
        ? "passed"
        : "failed",
    note: "Candidate and public surfaces must be locked without mutation."
  },
  {
    check_id: "AG21B-AUDIT-006",
    area: "token_write_deployment_lock",
    status:
      data.ag21aTokenWriteDeployLock.status === "token_write_deployment_locked_no_execution" &&
      Object.entries(data.ag21aTokenWriteDeployLock.current_execution_state).every(([key, value]) =>
        key === "token_write_deployment_locked" ? value === true : value === false
      )
        ? "passed"
        : "failed",
    note: "Token/write/deployment must be locked without token creation, GitHub write, deployment, smoke-test or publishing."
  },
  {
    check_id: "AG21B-AUDIT-007",
    area: "operator_decision_matrix",
    status:
      data.ag21aOperatorMatrix.status === "operator_decision_matrix_created_no_execution" &&
      data.ag21aOperatorMatrix.allowed_operator_decisions_now.every((item) => item.allowed_now === true) &&
      data.ag21aOperatorMatrix.blocked_operator_decisions_now.every((item) => item.allowed_now === false)
        ? "passed"
        : "failed",
    note: "Operator matrix must allow audit/review/rescope only and block execution decisions."
  },
  {
    check_id: "AG21B-AUDIT-008",
    area: "blocker_register",
    status:
      data.ag21aBlocker.blocked_items.includes("Explicit approval phrase execution.") &&
      data.ag21aBlocker.blocked_items.includes("Real candidate apply.") &&
      data.ag21aBlocker.blocked_items.includes("Real GitHub token creation.") &&
      data.ag21aBlocker.blocked_items.includes("Real GitHub write.") &&
      data.ag21aBlocker.blocked_items.includes("Real public visibility switch.") &&
      data.ag21aBlocker.blocked_items.includes("Real public index mutation.") &&
      data.ag21aBlocker.blocked_items.includes("Deployment trigger.") &&
      data.ag21aBlocker.blocked_items.includes("Live smoke-test execution.") &&
      data.ag21aBlocker.blocked_items.includes("Rollback execution.") &&
      data.ag21aBlocker.blocked_items.includes("Publish execution.") &&
      data.ag21aBlocker.blocked_items.includes("Supabase/Auth/backend activation.") &&
      data.ag21aBlocker.supabase_auth_backend_deferred === true
        ? "passed"
        : "failed",
    note: "AG21A blocker register must keep all real execution operations blocked."
  },
  {
    check_id: "AG21B-AUDIT-009",
    area: "ag20z_inheritance",
    status:
      data.ag20zSummary.final_ag20_state.ready_for_ag21_controlled_static_apply_transition_gate === true &&
      data.ag20zSummary.final_ag20_state.explicit_approval_phrase_executed === false &&
      data.ag20zSummary.final_ag20_state.candidate_apply_enabled === false &&
      data.ag20zSummary.final_ag20_state.github_token_created === false &&
      data.ag20zSummary.final_ag20_state.github_write_enabled === false &&
      data.ag20zSummary.final_ag20_state.public_visibility_switch_enabled === false &&
      data.ag20zSummary.final_ag20_state.public_index_mutation_enabled === false &&
      data.ag20zSummary.final_ag20_state.deployment_trigger_enabled === false &&
      data.ag20zSummary.final_ag20_state.live_smoke_test_enabled === false &&
      data.ag20zSummary.final_ag20_state.rollback_execution_enabled === false &&
      data.ag20zSummary.final_ag20_state.publishing_enabled === false &&
      data.ag20zSummary.final_ag20_state.supabase_auth_backend_enabled === false
        ? "passed"
        : "failed",
    note: "AG20Z closure state must remain inherited and non-active."
  },
  {
    check_id: "AG21B-AUDIT-010",
    area: "readiness_alignment",
    status:
      data.ag21aReadiness.ready_for_ag21b === true &&
      data.ag21aReadiness.required_future_approval_phrase === requiredPhrase &&
      data.ag21aReadiness.github_token_ready === false &&
      data.ag21aReadiness.github_write_ready === false &&
      data.ag21aReadiness.candidate_apply_ready === false &&
      data.ag21aReadiness.public_visibility_switch_ready === false &&
      data.ag21aReadiness.public_index_mutation_ready === false &&
      data.ag21aReadiness.deployment_trigger_ready === false &&
      data.ag21aReadiness.live_smoke_test_ready === false &&
      data.ag21aReadiness.rollback_ready === false &&
      data.ag21aReadiness.publish_ready === false &&
      data.ag21aReadiness.supabase_activation_ready === false
        ? "passed"
        : "failed",
    note: "AG21A readiness must point to audit while all real apply operations remain blocked."
  },
  {
    check_id: "AG21B-AUDIT-011",
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
    check_id: "AG21B-AUDIT-012",
    area: "forbidden_operations",
    status: "passed",
    note: "AG21B is audit-only and performs no approval phrase execution, mutation, credential creation, GitHub write, deployment, smoke-test, rollback, publishing or backend activation."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG21B audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const audit = {
  module_id: "AG21B",
  title: "Controlled Static Apply Transition Gate Audit Report",
  status: "controlled_static_apply_transition_gate_audit_passed",
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    failed: failedChecks.length
  },
  decision: {
    ag21a_transition_gate_valid: true,
    final_precondition_lock_valid: true,
    approval_phrase_lock_valid: true,
    candidate_surface_lock_valid: true,
    token_write_deployment_lock_valid: true,
    operator_decision_matrix_valid: true,
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
    ready_for_controlled_static_apply_execution_readiness: true
  },
  ...stageControls
};

const decision = {
  module_id: "AG21B",
  title: "Controlled Static Apply Execution Readiness Decision Record",
  status: "controlled_static_apply_transition_gate_audit_passed_ready_for_ag21c_execution_readiness",
  decision: {
    proceed_to_controlled_static_apply_execution_readiness: true,
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
  recommended_next_stage: "AG21C",
  recommended_next_stage_title: "Controlled Static Apply Execution Readiness",
  required_future_approval_phrase: requiredPhrase,
  rationale: [
    "AG21A transition gate passed audit with zero failed checks.",
    "The next safe step is execution readiness only.",
    "The exact approval phrase remains required but not executed.",
    "No real apply, token, GitHub write, visibility switch, public mutation, deployment, smoke-test, rollback or publishing is approved.",
    "Supabase/Auth/backend remains deferred."
  ],
  ...stageControls
};

const safety = {
  module_id: "AG21B",
  title: "Controlled Static Apply Transition Gate Safety Record",
  status: "transition_gate_safe_for_execution_readiness_only",
  safety_assertions: {
    static_github_controlled_first: true,
    supabase_auth_backend_deferred: true,
    execution_readiness_allowed: true,
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
  module_id: "AG21B",
  title: "Controlled Static Apply Execution Readiness Record",
  status: "ready_for_ag21c_controlled_static_apply_execution_readiness",
  ready_for_ag21c: true,
  ag21c_explicit_approval_required: true,
  controlled_static_apply_transition_gate_audit_passed: true,
  failed_checks: 0,
  execution_readiness_ready: true,
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
  reason: "AG21B approves AG21C execution readiness only. Real controlled static apply remains blocked.",
  ...stageControls
};

const boundary = {
  module_id: "AG21B",
  title: "AG21B to AG21C Controlled Static Apply Execution Readiness Boundary",
  status: "ag21c_boundary_created_not_started",
  next_stage_id: "AG21C",
  next_stage_title: "Controlled Static Apply Execution Readiness",
  explicit_approval_required: true,
  selected_path: "hybrid_staged_path_static_first",
  required_future_approval_phrase: requiredPhrase,
  ag21c_allowed_scope: [
    "Prepare controlled static apply execution readiness package.",
    "Restate exact approval phrase requirement.",
    "Restate candidate article path and hash.",
    "Restate final GitHub token/write, public surface, deployment, smoke-test and rollback preconditions.",
    "Confirm Supabase/Auth/backend remains deferred.",
    "Create future execution confirmation path without executing real apply."
  ],
  ag21c_blocked_scope: [
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
  supabase_auth_defer_reminder_required_in_ag21c: true,
  ...stageControls
};

const schema = {
  module_id: "AG21B",
  title: "Controlled Static Apply Transition Gate Audit Schema",
  status: "schema_controlled_static_apply_transition_gate_audit_only",
  transition_gate_audit_allowed_in_ag21b: true,
  execution_readiness_decision_allowed_in_ag21b: true,
  safety_record_allowed_in_ag21b: true,
  ag21c_boundary_allowed_in_ag21b: true,

  explicit_approval_phrase_execution_allowed_in_ag21b: false,
  article_generation_allowed_in_ag21b: false,
  article_mutation_allowed_in_ag21b: false,
  queue_mutation_allowed_in_ag21b: false,
  active_admin_review_queue_record_creation_allowed_in_ag21b: false,
  queue_index_mutation_allowed_in_ag21b: false,
  admin_action_execution_allowed_in_ag21b: false,
  editor_action_execution_allowed_in_ag21b: false,
  real_credential_creation_allowed_in_ag21b: false,
  auth_activation_allowed_in_ag21b: false,
  backend_activation_allowed_in_ag21b: false,
  supabase_activation_allowed_in_ag21b: false,
  database_write_allowed_in_ag21b: false,
  github_token_creation_or_exposure_allowed_in_ag21b: false,
  github_write_operation_allowed_in_ag21b: false,
  active_action_handler_creation_allowed_in_ag21b: false,
  api_endpoint_creation_allowed_in_ag21b: false,
  public_visibility_switch_allowed_in_ag21b: false,
  public_index_mutation_allowed_in_ag21b: false,
  deployment_trigger_allowed_in_ag21b: false,
  live_smoke_test_allowed_in_ag21b: false,
  rollback_execution_allowed_in_ag21b: false,
  public_publishing_operation_allowed_in_ag21b: false,
  ...stageControls
};

const review = {
  module_id: "AG21B",
  title: "Controlled Static Apply Transition Gate Audit",
  status: "controlled_static_apply_transition_gate_audit_passed_ready_for_ag21c_execution_readiness",
  depends_on: ["AG21A"],
  generated_from: inputs,
  audit_report_file: out.audit,
  decision_file: out.decision,
  safety_file: out.safety,
  readiness_file: out.readiness,
  next_boundary_file: out.boundary,
  schema_file: out.schema,
  summary: {
    audit_passed: true,
    failed_checks: 0,
    ready_for_ag21c: true,
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
  module_id: "AG21B",
  title: "Controlled Static Apply Transition Gate Audit Learning",
  status: "learning_record_only",
  learning_points: [
    "AG21A transition gate passed audit with zero failed checks.",
    "The next safe step is AG21C execution readiness only.",
    "The exact approval phrase remains required but not executed.",
    "No GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback or publishing occurred.",
    "Supabase/Auth/backend remains deferred under the hybrid staged path."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG21B",
  title: "Controlled Static Apply Transition Gate Audit",
  status: "controlled_static_apply_transition_gate_audit_passed_ready_for_ag21c_execution_readiness",
  generated_artifacts: {
    review: out.review,
    audit_report: out.audit,
    decision: out.decision,
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
  module_id: "AG21B",
  preview_only: true,
  status: "controlled_static_apply_transition_gate_audit_passed_ready_for_ag21c_execution_readiness",
  audit_passed: true,
  failed_checks: 0,
  ready_for_ag21c: true,
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

const doc = `# AG21B — Controlled Static Apply Transition Gate Audit

## Purpose

AG21B audits the AG21A controlled static apply transition gate.

AG21B is audit-only. It does not execute the approval phrase, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, create or wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment, run live smoke-tests, rollback or publish anything.

## Audit Result

AG21A controlled static apply transition gate passed audit with zero failed checks.

## Decision

AG21C may proceed only as Controlled Static Apply Execution Readiness.

Not approved: approval phrase execution, real candidate apply, GitHub token creation, GitHub write, public visibility switch, public index mutation, deployment trigger, live smoke-test, rollback execution, publish execution or Supabase/Auth/backend activation.

## Approval Phrase

Future controlled static apply still requires the exact phrase:

\`Proceed with first controlled static apply\`

This phrase is not executed in AG21B.

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG21C — Controlled Static Apply Execution Readiness — only with explicit approval.
`;

writeJson(out.review, review);
writeJson(out.audit, audit);
writeJson(out.decision, decision);
writeJson(out.safety, safety);
writeJson(out.readiness, readiness);
writeJson(out.boundary, boundary);
writeJson(out.schema, schema);
writeJson(out.learning, learning);
writeJson(out.registry, registry);
writeJson(out.preview, preview);
writeText(out.doc, doc);

console.log("✅ AG21B Controlled Static Apply Transition Gate Audit generated.");
console.log("✅ AG21A transition gate audit passed with zero failed checks.");
console.log("✅ Decision recorded: proceed only to AG21C execution readiness.");
console.log("✅ Explicit approval phrase remains required but not executed.");
console.log("✅ GitHub token, GitHub write, visibility switch, public index mutation, deployment, smoke-test, rollback and publishing remain blocked.");
console.log("✅ Supabase/Auth/backend remains deferred.");
console.log("✅ AG21C Controlled Static Apply Execution Readiness boundary created.");
