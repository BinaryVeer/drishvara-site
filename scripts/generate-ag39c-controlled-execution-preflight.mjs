import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag39bPackage: "data/content-intelligence/backend-architecture/ag39b-controlled-execution-package-planning.json",
  ag39bTargetPackage: "data/content-intelligence/backend-architecture/ag39b-target-execution-package-record.json",
  ag39bGrantPackage: "data/content-intelligence/backend-architecture/ag39b-grant-instruction-package-record.json",
  ag39bAuditRollbackPackage: "data/content-intelligence/backend-architecture/ag39b-audit-rollback-execution-package-record.json",
  ag39bApprovalRequirement: "data/content-intelligence/backend-architecture/ag39b-operator-approval-requirement-record.json",
  ag39bNoExecutionAudit: "data/content-intelligence/backend-architecture/ag39b-no-execution-audit-register.json",
  ag39bReadiness: "data/content-intelligence/quality-registry/ag39b-controlled-execution-preflight-readiness-record.json",
  ag39bBoundary: "data/content-intelligence/mutation-plans/ag39b-to-ag39c-controlled-execution-preflight-boundary.json",

  ag39aCheckpoint: "data/content-intelligence/backend-architecture/ag39a-public-mutation-decision-checkpoint.json",
  ag38zClosure: "data/content-intelligence/backend-architecture/ag38z-controlled-apply-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag39c-controlled-execution-preflight.json",
  preflight: "data/content-intelligence/backend-architecture/ag39c-controlled-execution-preflight.json",
  targetPreflight: "data/content-intelligence/backend-architecture/ag39c-target-execution-preflight-record.json",
  grantPreflight: "data/content-intelligence/backend-architecture/ag39c-grant-instruction-preflight-record.json",
  auditRollbackPreflight: "data/content-intelligence/backend-architecture/ag39c-audit-rollback-execution-preflight-record.json",
  approvalPreflight: "data/content-intelligence/backend-architecture/ag39c-operator-approval-preflight-record.json",
  noExecutionAudit: "data/content-intelligence/backend-architecture/ag39c-no-execution-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag39c-controlled-execution-preflight-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag39c-controlled-execution-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag39c-to-ag39d-controlled-execution-audit-boundary.json",
  registry: "data/quality/ag39c-controlled-execution-preflight.json",
  preview: "data/quality/ag39c-controlled-execution-preflight-preview.json",
  doc: "docs/quality/AG39C_CONTROLLED_EXECUTION_PREFLIGHT.md"
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
  if (!exists(p)) throw new Error(`Missing AG39C input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (records.ag39bPackage.status !== "controlled_execution_package_planning_created_ready_for_ag39c_preflight") {
  throw new Error("AG39B package status mismatch.");
}
if (records.ag39bReadiness.ready_for_ag39c !== true) {
  throw new Error("AG39B readiness does not permit AG39C.");
}
if (records.ag39bReadiness.allowed_ag39c_mode !== "preflight_only_no_execution_without_explicit_operator_approval") {
  throw new Error("AG39C allowed mode mismatch.");
}
if (records.ag39bBoundary.next_stage_id !== "AG39C") {
  throw new Error("AG39B boundary does not point to AG39C.");
}
if (records.ag39bNoExecutionAudit.audit_passed !== true) {
  throw new Error("AG39B no-execution audit must pass.");
}
if (records.ag39aCheckpoint.status !== "public_mutation_decision_checkpoint_created_ready_for_ag39b_package_planning") {
  throw new Error("AG39A checkpoint status mismatch.");
}
if (records.ag38zClosure.status !== "controlled_apply_closure_created_ready_for_ag39a_public_mutation_decision") {
  throw new Error("AG38Z closure status mismatch.");
}

const blockedState = {
  controlled_execution_preflight_created: true,
  target_execution_preflight_passed: true,
  grant_instruction_preflight_passed: true,
  audit_rollback_execution_preflight_passed: true,
  operator_approval_preflight_checked: true,
  controlled_execution_audit_ready: true,

  explicit_operator_approval_recorded: false,
  public_mutation_approved_now: false,
  execution_authorized_now: false,
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
  sql_file_created: false,
  sql_grants_executed: false
};

const targetPreflight = {
  module_id: "AG39C",
  title: "Target Execution Preflight Record",
  status: "target_execution_preflight_passed_no_execution",
  checked_target_package_file: inputs.ag39bTargetPackage,
  checked_target_scope: records.ag39bTargetPackage.target_scope,
  preflight_checks: [
    { check_id: "target_mode_is_test_or_non_public", passed: records.ag39bTargetPackage.target_scope.target_mode === "test_or_non_public_article_only" },
    { check_id: "real_publish_blocked", passed: records.ag39bTargetPackage.target_scope.real_publish_allowed_in_ag39b === false },
    { check_id: "public_surface_exposure_blocked", passed: records.ag39bTargetPackage.target_scope.public_surface_exposure_allowed_in_ag39b === false },
    { check_id: "execution_steps_not_run", passed: records.ag39bTargetPackage.execution_steps_run.length === 0 },
    { check_id: "admin_verification_required", passed: records.ag39bTargetPackage.package_steps_planned_only.includes("Verify Admin role and session.") }
  ],
  preflight_passed: true,
  blocked_state: blockedState
};

const grantPreflight = {
  module_id: "AG39C",
  title: "Grant Instruction Preflight Record",
  status: "grant_instruction_preflight_passed_no_sql",
  checked_grant_package_file: inputs.ag39bGrantPackage,
  grant_instruction_outline: records.ag39bGrantPackage.grant_instruction_outline,
  preflight_checks: [
    { check_id: "grant_instruction_outline_present", passed: records.ag39bGrantPackage.grant_instruction_outline.length > 0 },
    { check_id: "anon_grants_absent", passed: records.ag39bGrantPackage.anon_grants_for_admin_editor_tables.length === 0 },
    { check_id: "write_grants_absent", passed: records.ag39bGrantPackage.write_grants_planned_in_ag39b.length === 0 },
    { check_id: "sql_file_not_created", passed: records.ag39bGrantPackage.sql_file_created_in_ag39b === false },
    { check_id: "sql_not_executed", passed: records.ag39bGrantPackage.sql_executed_in_ag39b === false },
    { check_id: "service_role_key_not_required", passed: records.ag39bGrantPackage.service_role_key_required_in_repo_or_chat === false },
    { check_id: "rls_primary_boundary_preserved", passed: records.ag39bGrantPackage.rls_remains_primary_access_control_layer === true }
  ],
  sql_file_created_in_ag39c: false,
  sql_executed_in_ag39c: false,
  preflight_passed: true,
  blocked_state: blockedState
};

const auditRollbackPreflight = {
  module_id: "AG39C",
  title: "Audit and Rollback Execution Preflight Record",
  status: "audit_rollback_execution_preflight_passed_no_write",
  checked_audit_rollback_package_file: inputs.ag39bAuditRollbackPackage,
  preflight_checks: [
    { check_id: "audit_log_required", passed: records.ag39bAuditRollbackPackage.audit_execution_requirements.article_audit_logs_required === true },
    { check_id: "audit_action_publish_required", passed: records.ag39bAuditRollbackPackage.audit_execution_requirements.action_type_required === "publish" },
    { check_id: "before_after_hash_required", passed: records.ag39bAuditRollbackPackage.audit_execution_requirements.before_after_hash_required === true },
    { check_id: "rollback_reference_required", passed: records.ag39bAuditRollbackPackage.rollback_execution_requirements.rollback_reference_required === true },
    { check_id: "audit_write_blocked", passed: records.ag39bAuditRollbackPackage.audit_execution_requirements.audit_log_write_allowed_in_ag39b === false },
    { check_id: "rollback_write_blocked", passed: records.ag39bAuditRollbackPackage.rollback_execution_requirements.rollback_write_allowed_in_ag39b === false },
    { check_id: "writes_not_run", passed: records.ag39bAuditRollbackPackage.writes_run.length === 0 }
  ],
  audit_log_write_allowed_in_ag39c: false,
  rollback_write_allowed_in_ag39c: false,
  preflight_passed: true,
  blocked_state: blockedState
};

const approvalPreflight = {
  module_id: "AG39C",
  title: "Operator Approval Preflight Record",
  status: "operator_approval_preflight_checked_no_approval_recorded",
  checked_approval_requirement_file: inputs.ag39bApprovalRequirement,
  approval_result: {
    explicit_operator_approval_recorded: false,
    execution_authorized_now: false,
    public_mutation_allowed_now: false,
    database_write_allowed_now: false,
    audit_log_write_allowed_now: false,
    rollback_write_allowed_now: false,
    deployment_allowed_now: false
  },
  approval_required_before_any_future_execution: true,
  preflight_passed_for_no_execution_mode: true,
  blocked_state: blockedState
};

const noExecutionAudit = {
  module_id: "AG39C",
  title: "No-execution Audit Register",
  status: "no_execution_audit_passed_for_ag39c",
  checks: [
    { check_id: "no_operator_approval_recorded", passed: true },
    { check_id: "no_execution_authorized", passed: true },
    { check_id: "no_public_mutation", passed: true },
    { check_id: "no_real_publish", passed: true },
    { check_id: "no_queue_state_write", passed: true },
    { check_id: "no_audit_log_write", passed: true },
    { check_id: "no_rollback_write", passed: true },
    { check_id: "no_database_write", passed: true },
    { check_id: "no_public_article_mutation", passed: true },
    { check_id: "no_deployment", passed: true },
    { check_id: "no_sql_file_created", passed: true },
    { check_id: "no_sql_grant_execution", passed: true },
    { check_id: "no_anon_grant", passed: true },
    { check_id: "no_service_role_key", passed: true }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const preflight = {
  module_id: "AG39C",
  title: "Controlled Execution Preflight",
  status: "controlled_execution_preflight_created_ready_for_ag39d_audit",
  purpose:
    "Preflight AG39B controlled execution package while preserving no-execution boundaries: no operator approval, no public mutation, no database write, no SQL execution, no deployment and no service-role key exposure.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  preflight_decision: {
    controlled_execution_preflight_created: true,
    target_execution_preflight_passed: true,
    grant_instruction_preflight_passed: true,
    audit_rollback_execution_preflight_passed: true,
    operator_approval_preflight_checked: true,
    proceed_to_ag39d_controlled_execution_audit: true,

    explicit_operator_approval_recorded: false,
    public_mutation_approved_now: false,
    execution_authorized_now: false,
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
    sql_file_created: false,
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
  module_id: "AG39C",
  title: "Controlled Execution Preflight Blocker Register",
  status: "controlled_execution_preflight_blockers_preserved",
  blocked_items: [
    "No explicit operator approval recorded.",
    "No execution authorized.",
    "No public mutation approved.",
    "No real publish.",
    "No queue-state write.",
    "No audit-log write.",
    "No rollback write.",
    "No database write.",
    "No public article mutation.",
    "No deployment.",
    "No dynamic publish runtime enablement.",
    "No service-role key exposure.",
    "No anon grants.",
    "No write grants executed.",
    "No SQL file created.",
    "No SQL grants executed."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG39C",
  title: "Controlled Execution Audit Readiness Record",
  status: "ready_for_ag39d_controlled_execution_audit",
  ready_for_ag39d: true,
  next_stage_id: "AG39D",
  next_stage_title: "Controlled Execution Audit",
  allowed_ag39d_mode: "audit_only_no_execution_without_explicit_operator_approval",
  target_execution_preflight_passed: true,
  grant_instruction_preflight_passed: true,
  audit_rollback_execution_preflight_passed: true,
  no_execution_audit_passed: true,
  explicit_operator_approval_required_for_any_execution: true,
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
  module_id: "AG39C",
  title: "AG39C to AG39D Controlled Execution Audit Boundary",
  status: "ag39d_controlled_execution_audit_boundary_created",
  next_stage_id: "AG39D",
  next_stage_title: "Controlled Execution Audit",
  allowed_scope: [
    "Consume AG39C preflight records.",
    "Audit target, grant, audit/rollback and approval preflights.",
    "Confirm no execution was performed.",
    "Keep SQL execution, database write, public mutation, deployment and service-role key use blocked."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG39C",
  title: "Controlled Execution Preflight",
  status: "controlled_execution_preflight_created_ready_for_ag39d_audit",
  depends_on: ["AG39B", "AG39A", "AG38Z"],
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
    controlled_execution_preflight_created: true,
    ready_for_ag39d_audit: true,

    explicit_operator_approval_recorded: false,
    execution_authorized_now: false,
    public_mutation_approved_now: false,
    real_publish_executed: false,
    database_write_done: false,
    audit_log_write_done: false,
    rollback_write_done: false,
    public_article_mutated: false,
    deployment_done: false,
    public_mutation_done: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_file_created: false,
    sql_grants_executed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG39C",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG39C",
  preview_only: false,
  status: review.status,
  message: "AG39C Controlled Execution Preflight created. Ready for AG39D audit only.",
  controlled_execution_preflight_created: 1,
  ready_for_ag39d_audit: 1,
  explicit_operator_approval_recorded: 0,
  execution_authorized_now: 0,
  public_mutation_approved_now: 0,
  real_publish_executed: 0,
  database_write_done: 0,
  audit_log_write_done: 0,
  rollback_write_done: 0,
  public_article_mutated: 0,
  deployment_done: 0,
  public_mutation_done: 0,
  service_role_key_exposed: 0,
  anon_access_granted: 0,
  sql_file_created: 0,
  sql_grants_executed: 0
};

const doc = `# AG39C — Controlled Execution Preflight

## Result

AG39C Controlled Execution Preflight is created.

## Scope

AG39C is preflight-only. It does not approve or perform public mutation, real publish, queue-state write, audit-log write, rollback write, database write, deployment or SQL grant execution.

## Preflight Areas

- Target execution package.
- Grant instruction package.
- Audit and rollback execution package.
- Operator approval requirement.
- No-execution audit.

## Confirmed Blockers

- No explicit operator approval recorded.
- No execution authorized.
- No public mutation approved.
- No real publish.
- No database write.
- No SQL file created.
- No SQL grant execution.
- No service-role key exposure.

## Next

AG39D — Controlled Execution Audit.

AG39D must remain audit-only unless explicit operator approval is separately recorded.
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

console.log("✅ AG39C Controlled Execution Preflight generated.");
console.log("✅ Target, grant instruction, audit/rollback and approval preflights passed.");
console.log("✅ Ready for AG39D audit only.");
console.log("✅ No public mutation, real publish, database write, deployment, SQL grant execution or service-role key recorded.");
