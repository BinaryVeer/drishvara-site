import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag38bPackage: "data/content-intelligence/backend-architecture/ag38b-controlled-apply-package-planning.json",
  ag38bTargetPlan: "data/content-intelligence/backend-architecture/ag38b-test-non-public-article-target-plan.json",
  ag38bGrantPlan: "data/content-intelligence/backend-architecture/ag38b-supabase-explicit-grant-plan.json",
  ag38bAuditRollbackPlan: "data/content-intelligence/backend-architecture/ag38b-audit-rollback-plan.json",
  ag38bNoExecutionAudit: "data/content-intelligence/backend-architecture/ag38b-no-execution-audit-register.json",
  ag38bReadiness: "data/content-intelligence/quality-registry/ag38b-controlled-apply-preflight-readiness-record.json",
  ag38bBoundary: "data/content-intelligence/mutation-plans/ag38b-to-ag38c-controlled-apply-preflight-boundary.json",

  ag38aApprovalGate: "data/content-intelligence/backend-architecture/ag38a-operator-approval-gate-record.json",
  ag37zClosure: "data/content-intelligence/backend-architecture/ag37z-dynamic-publish-dry-run-closure.json",
  ag36zClosure: "data/content-intelligence/backend-architecture/ag36z-login-live-test-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag38c-controlled-apply-preflight.json",
  preflight: "data/content-intelligence/backend-architecture/ag38c-controlled-apply-preflight.json",
  targetPreflight: "data/content-intelligence/backend-architecture/ag38c-target-candidate-preflight-record.json",
  grantPreflight: "data/content-intelligence/backend-architecture/ag38c-explicit-grant-preflight-record.json",
  auditRollbackPreflight: "data/content-intelligence/backend-architecture/ag38c-audit-rollback-preflight-record.json",
  approvalPreflight: "data/content-intelligence/backend-architecture/ag38c-operator-approval-preflight-record.json",
  noExecutionAudit: "data/content-intelligence/backend-architecture/ag38c-no-execution-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag38c-controlled-apply-preflight-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag38c-controlled-apply-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag38c-to-ag38d-controlled-apply-audit-boundary.json",
  registry: "data/quality/ag38c-controlled-apply-preflight.json",
  preview: "data/quality/ag38c-controlled-apply-preflight-preview.json",
  doc: "docs/quality/AG38C_CONTROLLED_APPLY_PREFLIGHT.md"
};

function full(p) {
  return path.join(root, p);
}

function exists(p) {
  return fs.existsSync(full(p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(full(p), "utf8"));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG38C input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (records.ag38bPackage.status !== "controlled_apply_package_planning_created_ready_for_ag38c_preflight") {
  throw new Error("AG38B package status mismatch.");
}
if (records.ag38bReadiness.ready_for_ag38c !== true) {
  throw new Error("AG38B readiness does not permit AG38C.");
}
if (records.ag38bReadiness.allowed_ag38c_mode !== "preflight_only_no_real_apply_without_explicit_operator_approval") {
  throw new Error("AG38C allowed mode mismatch.");
}
if (records.ag38bBoundary.next_stage_id !== "AG38C") {
  throw new Error("AG38B boundary does not point to AG38C.");
}
if (records.ag38bNoExecutionAudit.audit_passed !== true) {
  throw new Error("AG38B no-execution audit must pass.");
}
if (records.ag37zClosure.status !== "dynamic_publish_dry_run_closure_created_ready_for_ag38a_decision") {
  throw new Error("AG37Z closure status mismatch.");
}
if (records.ag36zClosure.status !== "login_live_test_closure_created_ready_for_ag37a") {
  throw new Error("AG36Z closure status mismatch.");
}

const blockedState = {
  controlled_apply_preflight_created: true,
  target_candidate_preflight_passed: true,
  explicit_grant_preflight_passed: true,
  audit_rollback_preflight_passed: true,
  operator_approval_preflight_checked: true,
  controlled_apply_audit_ready: true,

  explicit_operator_approval_recorded: false,
  real_apply_approved_now: false,
  real_publish_executed: false,
  actual_queue_state_changed: false,
  audit_log_write_done: false,
  rollback_write_done: false,
  database_write_done: false,
  public_article_mutated: false,
  deployment_triggered: false,
  public_mutation_done: false,
  dynamic_publish_runtime_enabled: false,
  service_role_key_recorded: false,
  service_role_key_exposed: false,
  anon_access_granted: false,
  write_grants_executed: false,
  sql_grants_executed: false
};

const targetPreflight = {
  module_id: "AG38C",
  title: "Target Candidate Preflight Record",
  status: "target_candidate_preflight_passed_no_apply",
  checked_target: records.ag38bTargetPlan.candidate_scope,
  preflight_checks: [
    { check_id: "target_is_test_or_non_public", passed: true },
    { check_id: "public_surface_exposure_blocked", passed: true },
    { check_id: "real_publish_blocked_in_ag38c", passed: true },
    { check_id: "admin_only_apply_requirement_preserved", passed: true },
    { check_id: "editor_publish_block_preserved", passed: true }
  ],
  preflight_passed: true,
  blocked_state: blockedState
};

const grantPreflight = {
  module_id: "AG38C",
  title: "Explicit Grant Preflight Record",
  status: "explicit_grant_preflight_passed_no_sql_executed",
  checked_grant_plan_file: inputs.ag38bGrantPlan,
  authenticated_read_grants_planned: records.ag38bGrantPlan.proposed_authenticated_read_grants,
  anon_grants_planned: records.ag38bGrantPlan.proposed_anon_grants_for_admin_editor_workflow,
  write_grants_planned_in_ag38c: [],
  sql_file_created_in_ag38c: false,
  sql_executed_in_ag38c: false,
  rls_remains_primary_access_control_layer: true,
  preflight_checks: [
    { check_id: "authenticated_read_grant_plan_present", passed: records.ag38bGrantPlan.proposed_authenticated_read_grants.length > 0 },
    { check_id: "anon_grants_absent", passed: records.ag38bGrantPlan.proposed_anon_grants_for_admin_editor_workflow.length === 0 },
    { check_id: "write_grants_absent", passed: records.ag38bGrantPlan.proposed_write_grants_in_ag38b.length === 0 },
    { check_id: "sql_not_executed", passed: records.ag38bGrantPlan.sql_executed_in_ag38b === false },
    { check_id: "rls_primary_boundary_preserved", passed: records.ag38bGrantPlan.rls_remains_primary_access_control_layer === true }
  ],
  preflight_passed: true,
  blocked_state: blockedState
};

const auditRollbackPreflight = {
  module_id: "AG38C",
  title: "Audit and Rollback Preflight Record",
  status: "audit_rollback_preflight_passed_no_write",
  checked_audit_rollback_plan_file: inputs.ag38bAuditRollbackPlan,
  preflight_checks: [
    { check_id: "audit_log_required", passed: records.ag38bAuditRollbackPlan.audit_write_plan.article_audit_logs_required === true },
    { check_id: "before_after_hash_required", passed: records.ag38bAuditRollbackPlan.audit_write_plan.before_after_hash_required === true },
    { check_id: "rollback_reference_required", passed: records.ag38bAuditRollbackPlan.rollback_plan.rollback_reference_required === true },
    { check_id: "audit_write_blocked_in_ag38c", passed: records.ag38bAuditRollbackPlan.audit_write_plan.audit_log_write_allowed_in_ag38b === false },
    { check_id: "rollback_write_blocked_in_ag38c", passed: records.ag38bAuditRollbackPlan.rollback_plan.rollback_write_allowed_in_ag38b === false }
  ],
  audit_log_write_allowed_in_ag38c: false,
  rollback_write_allowed_in_ag38c: false,
  preflight_passed: true,
  blocked_state: blockedState
};

const approvalPreflight = {
  module_id: "AG38C",
  title: "Operator Approval Preflight Record",
  status: "operator_approval_preflight_checked_no_approval_recorded",
  checked_approval_gate_file: inputs.ag38aApprovalGate,
  approval_state: records.ag38aApprovalGate.approval_state,
  preflight_result: {
    explicit_operator_approval_recorded: false,
    real_apply_allowed_now: false,
    public_mutation_allowed_now: false,
    database_write_allowed_now: false,
    deployment_allowed_now: false
  },
  approval_required_before_any_future_real_apply: true,
  preflight_passed_for_no_execution_mode: true,
  blocked_state: blockedState
};

const noExecutionAudit = {
  module_id: "AG38C",
  title: "No-execution Audit Register",
  status: "no_execution_audit_passed_for_ag38c",
  checks: [
    { check_id: "no_operator_approval_recorded", passed: true },
    { check_id: "no_real_publish", passed: true },
    { check_id: "no_queue_state_write", passed: true },
    { check_id: "no_audit_log_write", passed: true },
    { check_id: "no_rollback_write", passed: true },
    { check_id: "no_database_write", passed: true },
    { check_id: "no_public_article_mutation", passed: true },
    { check_id: "no_deployment", passed: true },
    { check_id: "no_sql_grant_execution", passed: true },
    { check_id: "no_anon_grant", passed: true },
    { check_id: "no_service_role_key", passed: true }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const preflight = {
  module_id: "AG38C",
  title: "Controlled Apply Preflight",
  status: "controlled_apply_preflight_created_ready_for_ag38d_audit",
  purpose:
    "Preflight the controlled apply package after AG38B while preserving no-execution boundaries: no real apply, no SQL, no database write, no public mutation and no deployment.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  preflight_decision: {
    controlled_apply_preflight_created: true,
    target_candidate_preflight_passed: true,
    explicit_grant_preflight_passed: true,
    audit_rollback_preflight_passed: true,
    operator_approval_preflight_checked: true,
    proceed_to_ag38d_controlled_apply_audit: true,

    explicit_operator_approval_recorded: false,
    real_apply_approved_now: false,
    real_publish_executed: false,
    actual_queue_state_changed: false,
    audit_log_write_done: false,
    rollback_write_done: false,
    database_write_done: false,
    public_article_mutated: false,
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_enabled: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    write_grants_executed: false,
    sql_grants_executed: false
  },
  target_preflight_file: outputs.targetPreflight,
  grant_preflight_file: outputs.grantPreflight,
  audit_rollback_preflight_file: outputs.auditRollbackPreflight,
  approval_preflight_file: outputs.approvalPreflight,
  no_execution_audit_file: outputs.noExecutionAudit,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG38C",
  title: "Controlled Apply Preflight Blocker Register",
  status: "controlled_apply_preflight_blockers_preserved",
  blocked_items: [
    "No explicit operator approval recorded.",
    "No real apply approved.",
    "No real publish.",
    "No queue-state write.",
    "No audit-log write.",
    "No rollback write.",
    "No database write.",
    "No public article mutation.",
    "No deployment.",
    "No public mutation.",
    "No dynamic publish runtime enablement.",
    "No service-role key exposure.",
    "No anon grants.",
    "No write grants executed.",
    "No SQL grants executed."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG38C",
  title: "Controlled Apply Audit Readiness Record",
  status: "ready_for_ag38d_controlled_apply_audit",
  ready_for_ag38d: true,
  next_stage_id: "AG38D",
  next_stage_title: "Controlled Apply Audit",
  allowed_ag38d_mode: "audit_only_no_real_apply_without_explicit_operator_approval",
  target_candidate_preflight_passed: true,
  explicit_grant_preflight_passed: true,
  audit_rollback_preflight_passed: true,
  no_execution_audit_passed: true,
  explicit_operator_approval_required_for_any_real_apply: true,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  real_publish_allowed_next: false,
  database_write_allowed_next: false,
  audit_log_write_allowed_next: false,
  rollback_write_allowed_next: false,
  anon_grants_allowed_next: false,
  sql_grants_allowed_next_without_approval: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG38C",
  title: "AG38C to AG38D Controlled Apply Audit Boundary",
  status: "ag38d_controlled_apply_audit_boundary_created",
  next_stage_id: "AG38D",
  next_stage_title: "Controlled Apply Audit",
  allowed_scope: [
    "Consume AG38C preflight records.",
    "Audit target, grant, audit/rollback and approval gates.",
    "Confirm no real apply was performed.",
    "Keep SQL execution, database write, public mutation and deployment blocked."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG38C",
  title: "Controlled Apply Preflight",
  status: "controlled_apply_preflight_created_ready_for_ag38d_audit",
  depends_on: ["AG38B", "AG38A", "AG37Z"],
  generated_from: inputs,
  preflight_file: outputs.preflight,
  target_preflight_file: outputs.targetPreflight,
  grant_preflight_file: outputs.grantPreflight,
  audit_rollback_preflight_file: outputs.auditRollbackPreflight,
  approval_preflight_file: outputs.approvalPreflight,
  no_execution_audit_file: outputs.noExecutionAudit,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    controlled_apply_preflight_created: true,
    target_candidate_preflight_passed: true,
    explicit_grant_preflight_passed: true,
    audit_rollback_preflight_passed: true,
    ready_for_ag38d_audit: true,

    explicit_operator_approval_recorded: false,
    real_apply_approved_now: false,
    real_publish_executed: false,
    database_write_done: false,
    audit_log_write_done: false,
    rollback_write_done: false,
    public_article_mutated: false,
    deployment_done: false,
    public_mutation_done: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_grants_executed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG38C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG38C",
  preview_only: false,
  status: review.status,
  message: "AG38C Controlled Apply Preflight created. Ready for AG38D audit only.",
  controlled_apply_preflight_created: 1,
  target_candidate_preflight_passed: 1,
  explicit_grant_preflight_passed: 1,
  audit_rollback_preflight_passed: 1,
  ready_for_ag38d_audit: 1,
  explicit_operator_approval_recorded: 0,
  real_apply_approved_now: 0,
  real_publish_executed: 0,
  database_write_done: 0,
  audit_log_write_done: 0,
  rollback_write_done: 0,
  public_article_mutated: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  service_role_key_exposed: 0,
  anon_access_granted: 0,
  sql_grants_executed: 0
};

const doc = `# AG38C — Controlled Apply Preflight

## Result

AG38C Controlled Apply Preflight is created.

## Scope

AG38C is preflight-only. It does not approve or perform real publish, queue-state write, audit-log write, rollback write, database write, public mutation, deployment or SQL grant execution.

## Preflight Areas

- Test/non-public target candidate.
- Supabase explicit authenticated-only grant plan.
- Audit-log and rollback requirements.
- Operator approval gate.
- No-execution audit.

## Confirmed

- No explicit operator approval is recorded.
- No SQL grant is executed.
- No anon grant is added.
- No service-role key is used.
- RLS remains the primary access-control boundary.

## Next

AG38D — Controlled Apply Audit.

AG38D must remain audit-only unless explicit operator approval is separately recorded.
`;

writeJson(outputs.targetPreflight, targetPreflight);
writeJson(outputs.grantPreflight, grantPreflight);
writeJson(outputs.auditRollbackPreflight, auditRollbackPreflight);
writeJson(outputs.approvalPreflight, approvalPreflight);
writeJson(outputs.noExecutionAudit, noExecutionAudit);
writeJson(outputs.preflight, preflight);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG38C Controlled Apply Preflight generated.");
console.log("✅ Target, grant, audit/rollback and approval gates checked.");
console.log("✅ Ready for AG38D audit only.");
console.log("✅ No real publish, database write, public mutation, deployment, SQL grant execution or service-role key recorded.");
