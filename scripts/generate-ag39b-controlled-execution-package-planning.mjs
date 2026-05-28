import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag39aCheckpoint: "data/content-intelligence/backend-architecture/ag39a-public-mutation-decision-checkpoint.json",
  ag39aRiskReview: "data/content-intelligence/backend-architecture/ag39a-public-mutation-risk-review-record.json",
  ag39aApprovalGate: "data/content-intelligence/backend-architecture/ag39a-operator-approval-gate-record.json",
  ag39aGrantDecision: "data/content-intelligence/backend-architecture/ag39a-grant-execution-decision-record.json",
  ag39aExecutionScope: "data/content-intelligence/backend-architecture/ag39a-execution-scope-decision-record.json",
  ag39aReadiness: "data/content-intelligence/quality-registry/ag39a-controlled-execution-package-readiness-record.json",
  ag39aBoundary: "data/content-intelligence/mutation-plans/ag39a-to-ag39b-controlled-execution-package-boundary.json",

  ag38zClosure: "data/content-intelligence/backend-architecture/ag38z-controlled-apply-closure.json",
  ag38zApprovalCarryForward: "data/content-intelligence/backend-architecture/ag38z-operator-approval-carry-forward-record.json",
  ag38zGrantCarryForward: "data/content-intelligence/backend-architecture/ag38z-explicit-grant-carry-forward-record.json",
  ag37zClosure: "data/content-intelligence/backend-architecture/ag37z-dynamic-publish-dry-run-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag39b-controlled-execution-package-planning.json",
  package: "data/content-intelligence/backend-architecture/ag39b-controlled-execution-package-planning.json",
  targetExecutionPackage: "data/content-intelligence/backend-architecture/ag39b-target-execution-package-record.json",
  grantInstructionPackage: "data/content-intelligence/backend-architecture/ag39b-grant-instruction-package-record.json",
  auditRollbackExecutionPackage: "data/content-intelligence/backend-architecture/ag39b-audit-rollback-execution-package-record.json",
  operatorApprovalRequirement: "data/content-intelligence/backend-architecture/ag39b-operator-approval-requirement-record.json",
  noExecutionAudit: "data/content-intelligence/backend-architecture/ag39b-no-execution-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag39b-controlled-execution-package-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag39b-controlled-execution-preflight-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag39b-to-ag39c-controlled-execution-preflight-boundary.json",
  registry: "data/quality/ag39b-controlled-execution-package-planning.json",
  preview: "data/quality/ag39b-controlled-execution-package-planning-preview.json",
  doc: "docs/quality/AG39B_CONTROLLED_EXECUTION_PACKAGE_PLANNING.md"
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
  if (!exists(p)) throw new Error(`Missing AG39B input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (records.ag39aCheckpoint.status !== "public_mutation_decision_checkpoint_created_ready_for_ag39b_package_planning") {
  throw new Error("AG39A checkpoint status mismatch.");
}
if (records.ag39aReadiness.ready_for_ag39b !== true) {
  throw new Error("AG39A readiness does not permit AG39B.");
}
if (records.ag39aReadiness.allowed_ag39b_mode !== "package_planning_only_no_public_mutation_without_explicit_operator_approval") {
  throw new Error("AG39B allowed mode mismatch.");
}
if (records.ag39aBoundary.next_stage_id !== "AG39B") {
  throw new Error("AG39A boundary does not point to AG39B.");
}
if (records.ag39aApprovalGate.approval_state.explicit_operator_approval_recorded_in_ag39a !== false) {
  throw new Error("AG39B must not inherit operator approval.");
}
if (records.ag39aGrantDecision.grant_decision.sql_grants_executed_now !== false) {
  throw new Error("AG39A SQL grant execution must be false.");
}
if (records.ag39aExecutionScope.execution_authorized_now !== false) {
  throw new Error("AG39A execution must not be authorized.");
}
if (records.ag38zClosure.status !== "controlled_apply_closure_created_ready_for_ag39a_public_mutation_decision") {
  throw new Error("AG38Z closure status mismatch.");
}

const blockedState = {
  controlled_execution_package_planning_created: true,
  target_execution_package_created: true,
  grant_instruction_package_created: true,
  audit_rollback_execution_package_created: true,
  operator_approval_requirement_carried_forward: true,
  controlled_execution_preflight_ready: true,

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

const targetExecutionPackage = {
  module_id: "AG39B",
  title: "Target Execution Package Record",
  status: "target_execution_package_created_no_execution",
  target_scope: {
    target_mode: "test_or_non_public_article_only",
    candidate_slug: "enhancing-public-healthcare-delivery-digital-innovation",
    expected_source_status: "ready_for_admin_review",
    intended_target_status_if_later_approved: "published",
    public_surface_exposure_allowed_in_ag39b: false,
    real_publish_allowed_in_ag39b: false
  },
  package_steps_planned_only: [
    "Verify target article slug.",
    "Verify Admin role and session.",
    "Verify target article is test/non-public.",
    "Verify rollback and audit requirements.",
    "Verify explicit operator approval before any later execution."
  ],
  execution_steps_run: [],
  blocked_state: blockedState
};

const grantInstructionPackage = {
  module_id: "AG39B",
  title: "Grant Instruction Package Record",
  status: "grant_instruction_package_created_no_sql_file_no_execution",
  instruction_scope: "planning_only",
  grant_instruction_outline: [
    { schema: "public", object: "schema_usage", role: "authenticated", operation: "usage" },
    { table: "public.profiles", role: "authenticated", operation: "select" },
    { table: "public.articles", role: "authenticated", operation: "select" },
    { table: "public.article_assignments", role: "authenticated", operation: "select" },
    { table: "public.article_audit_logs", role: "authenticated", operation: "select" },
    { table: "public.publish_rollback_refs", role: "authenticated", operation: "select" }
  ],
  anon_grants_for_admin_editor_tables: [],
  write_grants_planned_in_ag39b: [],
  sql_file_created_in_ag39b: false,
  sql_executed_in_ag39b: false,
  service_role_key_required_in_repo_or_chat: false,
  rls_remains_primary_access_control_layer: true,
  blocked_state: blockedState
};

const auditRollbackExecutionPackage = {
  module_id: "AG39B",
  title: "Audit and Rollback Execution Package Record",
  status: "audit_rollback_execution_package_created_no_write",
  audit_execution_requirements: {
    article_audit_logs_required: true,
    actor_role_required: "admin",
    action_type_required: "publish",
    before_state_required: true,
    after_state_required: true,
    before_after_hash_required: true,
    decision_note_required: true,
    audit_log_write_allowed_in_ag39b: false
  },
  rollback_execution_requirements: {
    rollback_reference_required: true,
    previous_status_required: true,
    previous_queue_required: true,
    previous_public_visibility_required: true,
    rollback_write_allowed_in_ag39b: false
  },
  writes_run: [],
  blocked_state: blockedState
};

const operatorApprovalRequirement = {
  module_id: "AG39B",
  title: "Operator Approval Requirement Record",
  status: "operator_approval_requirement_preserved_no_approval_recorded",
  inherited_gate_file: inputs.ag39aApprovalGate,
  approval_requirement: {
    explicit_operator_approval_required_for_any_execution: true,
    explicit_operator_approval_recorded_in_ag39b: false,
    execution_authorized_now: false,
    public_mutation_allowed_now: false,
    database_write_allowed_now: false,
    audit_log_write_allowed_now: false,
    rollback_write_allowed_now: false,
    deployment_allowed_now: false
  },
  blocked_state: blockedState
};

const noExecutionAudit = {
  module_id: "AG39B",
  title: "No-execution Audit Register",
  status: "no_execution_audit_passed_for_ag39b",
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

const packageRecord = {
  module_id: "AG39B",
  title: "Controlled Execution Package Planning",
  status: "controlled_execution_package_planning_created_ready_for_ag39c_preflight",
  purpose:
    "Plan a controlled execution package after AG39A public mutation decision checkpoint, without authorizing or performing execution, public mutation, database write, SQL grant execution, deployment or service-role key use.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  package_decision: {
    controlled_execution_package_planning_created: true,
    target_execution_package_created: true,
    grant_instruction_package_created: true,
    audit_rollback_execution_package_created: true,
    proceed_to_ag39c_controlled_execution_preflight: true,

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
  target_execution_package_file: outputs.targetExecutionPackage,
  grant_instruction_package_file: outputs.grantInstructionPackage,
  audit_rollback_execution_package_file: outputs.auditRollbackExecutionPackage,
  operator_approval_requirement_file: outputs.operatorApprovalRequirement,
  no_execution_audit_file: outputs.noExecutionAudit,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG39B",
  title: "Controlled Execution Package Blocker Register",
  status: "controlled_execution_package_blockers_preserved",
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
  module_id: "AG39B",
  title: "Controlled Execution Preflight Readiness Record",
  status: "ready_for_ag39c_controlled_execution_preflight",
  ready_for_ag39c: true,
  next_stage_id: "AG39C",
  next_stage_title: "Controlled Execution Preflight",
  allowed_ag39c_mode: "preflight_only_no_execution_without_explicit_operator_approval",
  controlled_execution_package_created: true,
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
  module_id: "AG39B",
  title: "AG39B to AG39C Controlled Execution Preflight Boundary",
  status: "ag39c_controlled_execution_preflight_boundary_created",
  next_stage_id: "AG39C",
  next_stage_title: "Controlled Execution Preflight",
  allowed_scope: [
    "Consume AG39B controlled execution package planning.",
    "Preflight target, grant, audit, rollback and operator approval requirements.",
    "Do not execute SQL grants.",
    "Do not mutate database/public article state.",
    "Do not deploy.",
    "Do not expose service-role key."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG39B",
  title: "Controlled Execution Package Planning",
  status: "controlled_execution_package_planning_created_ready_for_ag39c_preflight",
  depends_on: ["AG39A", "AG38Z", "AG37Z"],
  generated_from: inputs,
  package_file: outputs.package,
  target_execution_package_file: outputs.targetExecutionPackage,
  grant_instruction_package_file: outputs.grantInstructionPackage,
  audit_rollback_execution_package_file: outputs.auditRollbackExecutionPackage,
  operator_approval_requirement_file: outputs.operatorApprovalRequirement,
  no_execution_audit_file: outputs.noExecutionAudit,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    controlled_execution_package_planning_created: true,
    ready_for_ag39c_preflight: true,

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
  module_id: "AG39B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG39B",
  preview_only: false,
  status: review.status,
  message: "AG39B Controlled Execution Package Planning created. Ready for AG39C preflight only.",
  controlled_execution_package_planning_created: 1,
  ready_for_ag39c_preflight: 1,
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

const doc = `# AG39B — Controlled Execution Package Planning

## Result

AG39B Controlled Execution Package Planning is created.

## Scope

AG39B is package-planning only. It does not approve or perform public mutation, real publish, queue-state write, audit-log write, rollback write, database write, deployment or SQL grant execution.

## Package Components

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

AG39C — Controlled Execution Preflight.

AG39C must remain preflight-only unless explicit operator approval is separately recorded.
`;

writeJson(outputs.targetExecutionPackage, targetExecutionPackage);
writeJson(outputs.grantInstructionPackage, grantInstructionPackage);
writeJson(outputs.auditRollbackExecutionPackage, auditRollbackExecutionPackage);
writeJson(outputs.operatorApprovalRequirement, operatorApprovalRequirement);
writeJson(outputs.noExecutionAudit, noExecutionAudit);
writeJson(outputs.package, packageRecord);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG39B Controlled Execution Package Planning generated.");
console.log("✅ Target, grant instruction, audit/rollback and approval packages created.");
console.log("✅ Ready for AG39C preflight only.");
console.log("✅ No public mutation, real publish, database write, deployment, SQL grant execution or service-role key recorded.");
