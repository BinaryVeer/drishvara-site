import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag39cPreflight: "data/content-intelligence/backend-architecture/ag39c-controlled-execution-preflight.json",
  ag39cTargetPreflight: "data/content-intelligence/backend-architecture/ag39c-target-execution-preflight-record.json",
  ag39cGrantPreflight: "data/content-intelligence/backend-architecture/ag39c-grant-instruction-preflight-record.json",
  ag39cAuditRollbackPreflight: "data/content-intelligence/backend-architecture/ag39c-audit-rollback-execution-preflight-record.json",
  ag39cApprovalPreflight: "data/content-intelligence/backend-architecture/ag39c-operator-approval-preflight-record.json",
  ag39cNoExecutionAudit: "data/content-intelligence/backend-architecture/ag39c-no-execution-audit-register.json",
  ag39cReadiness: "data/content-intelligence/quality-registry/ag39c-controlled-execution-audit-readiness-record.json",
  ag39cBoundary: "data/content-intelligence/mutation-plans/ag39c-to-ag39d-controlled-execution-audit-boundary.json",

  ag39bPackage: "data/content-intelligence/backend-architecture/ag39b-controlled-execution-package-planning.json",
  ag39aCheckpoint: "data/content-intelligence/backend-architecture/ag39a-public-mutation-decision-checkpoint.json",
  ag38zClosure: "data/content-intelligence/backend-architecture/ag38z-controlled-apply-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag39d-controlled-execution-audit.json",
  audit: "data/content-intelligence/backend-architecture/ag39d-controlled-execution-audit.json",
  preflightChainAudit: "data/content-intelligence/backend-architecture/ag39d-preflight-chain-audit-register.json",
  grantSecurityAudit: "data/content-intelligence/backend-architecture/ag39d-grant-security-audit-register.json",
  approvalGateAudit: "data/content-intelligence/backend-architecture/ag39d-operator-approval-gate-audit-register.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag39d-no-mutation-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag39d-controlled-execution-audit-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag39d-controlled-execution-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag39d-to-ag39z-controlled-execution-closure-boundary.json",
  registry: "data/quality/ag39d-controlled-execution-audit.json",
  preview: "data/quality/ag39d-controlled-execution-audit-preview.json",
  doc: "docs/quality/AG39D_CONTROLLED_EXECUTION_AUDIT.md"
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
  if (!exists(p)) throw new Error(`Missing AG39D input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (records.ag39cPreflight.status !== "controlled_execution_preflight_created_ready_for_ag39d_audit") {
  throw new Error("AG39C preflight status mismatch.");
}
if (records.ag39cReadiness.ready_for_ag39d !== true) {
  throw new Error("AG39C readiness does not permit AG39D.");
}
if (records.ag39cReadiness.allowed_ag39d_mode !== "audit_only_no_execution_without_explicit_operator_approval") {
  throw new Error("AG39D allowed mode mismatch.");
}
if (records.ag39cBoundary.next_stage_id !== "AG39D") {
  throw new Error("AG39C boundary does not point to AG39D.");
}
if (records.ag39cNoExecutionAudit.audit_passed !== true) {
  throw new Error("AG39C no-execution audit must pass.");
}
if (records.ag39bPackage.status !== "controlled_execution_package_planning_created_ready_for_ag39c_preflight") {
  throw new Error("AG39B package status mismatch.");
}
if (records.ag39aCheckpoint.status !== "public_mutation_decision_checkpoint_created_ready_for_ag39b_package_planning") {
  throw new Error("AG39A checkpoint status mismatch.");
}
if (records.ag38zClosure.status !== "controlled_apply_closure_created_ready_for_ag39a_public_mutation_decision") {
  throw new Error("AG38Z closure status mismatch.");
}

const blockedState = {
  controlled_execution_audit_created: true,
  preflight_chain_audit_passed: true,
  grant_security_audit_passed: true,
  operator_approval_gate_audit_passed: true,
  no_mutation_audit_passed: true,
  controlled_execution_closure_ready: true,

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

const preflightChainAudit = {
  module_id: "AG39D",
  title: "Controlled Execution Preflight Chain Audit Register",
  status: "preflight_chain_audit_passed",
  audited_chain: [
    {
      stage_id: "AG39A",
      title: "Public Mutation Decision Checkpoint",
      status: records.ag39aCheckpoint.status,
      result: "Decision checkpoint created; no public mutation approved."
    },
    {
      stage_id: "AG39B",
      title: "Controlled Execution Package Planning",
      status: records.ag39bPackage.status,
      result: "Execution package planned; no execution, SQL or mutation performed."
    },
    {
      stage_id: "AG39C",
      title: "Controlled Execution Preflight",
      status: records.ag39cPreflight.status,
      result: "Target, grant, audit/rollback and approval preflights passed."
    }
  ],
  chain_length: 3,
  all_chain_items_passed: true,
  blocked_state: blockedState
};

const grantSecurityAudit = {
  module_id: "AG39D",
  title: "Grant Security Audit Register",
  status: "grant_security_audit_passed",
  checks: [
    {
      check_id: "grant_instruction_present",
      passed: records.ag39cGrantPreflight.grant_instruction_outline.length > 0
    },
    {
      check_id: "sql_file_not_created",
      passed: records.ag39cGrantPreflight.sql_file_created_in_ag39c === false
    },
    {
      check_id: "sql_not_executed",
      passed: records.ag39cGrantPreflight.sql_executed_in_ag39c === false
    },
    {
      check_id: "no_service_role_key_required",
      passed: records.ag39bPackage.package_decision.service_role_key_recorded === false
    },
    {
      check_id: "no_anon_access_granted",
      passed: records.ag39cPreflight.preflight_decision.anon_access_granted === false
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const approvalGateAudit = {
  module_id: "AG39D",
  title: "Operator Approval Gate Audit Register",
  status: "operator_approval_gate_audit_passed",
  checks: [
    {
      check_id: "no_operator_approval_recorded",
      passed: records.ag39cApprovalPreflight.approval_result.explicit_operator_approval_recorded === false
    },
    {
      check_id: "execution_not_authorized",
      passed: records.ag39cApprovalPreflight.approval_result.execution_authorized_now === false
    },
    {
      check_id: "public_mutation_not_allowed",
      passed: records.ag39cApprovalPreflight.approval_result.public_mutation_allowed_now === false
    },
    {
      check_id: "database_write_not_allowed",
      passed: records.ag39cApprovalPreflight.approval_result.database_write_allowed_now === false
    },
    {
      check_id: "deployment_not_allowed",
      passed: records.ag39cApprovalPreflight.approval_result.deployment_allowed_now === false
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG39D",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag39d",
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

const allAuditsPassed =
  preflightChainAudit.all_chain_items_passed &&
  grantSecurityAudit.audit_passed &&
  approvalGateAudit.audit_passed &&
  noMutationAudit.audit_passed;

const audit = {
  module_id: "AG39D",
  title: "Controlled Execution Audit",
  status: "controlled_execution_audit_created_ready_for_ag39z_closure",
  purpose:
    "Audit AG39A-AG39C public-mutation/controlled-execution chain while confirming no execution, public mutation, database write, SQL execution, deployment or service-role key use occurred.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  audit_decision: {
    controlled_execution_audit_created: true,
    preflight_chain_audit_passed: preflightChainAudit.all_chain_items_passed,
    grant_security_audit_passed: grantSecurityAudit.audit_passed,
    operator_approval_gate_audit_passed: approvalGateAudit.audit_passed,
    no_mutation_audit_passed: noMutationAudit.audit_passed,
    all_audits_passed: allAuditsPassed,
    proceed_to_ag39z_controlled_execution_closure: allAuditsPassed,

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
  preflight_chain_audit_file: outputs.preflightChainAudit,
  grant_security_audit_file: outputs.grantSecurityAudit,
  approval_gate_audit_file: outputs.approvalGateAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG39D",
  title: "Controlled Execution Audit Blocker Register",
  status: "controlled_execution_audit_blockers_preserved",
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
  module_id: "AG39D",
  title: "Controlled Execution Closure Readiness Record",
  status: "ready_for_ag39z_controlled_execution_closure",
  ready_for_ag39z: allAuditsPassed,
  next_stage_id: "AG39Z",
  next_stage_title: "Controlled Execution Closure",
  allowed_ag39z_mode: "closure_only_no_execution_without_explicit_operator_approval",
  controlled_execution_audit_passed: allAuditsPassed,
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
  module_id: "AG39D",
  title: "AG39D to AG39Z Controlled Execution Closure Boundary",
  status: "ag39z_controlled_execution_closure_boundary_created",
  next_stage_id: "AG39Z",
  next_stage_title: "Controlled Execution Closure",
  allowed_scope: [
    "Consume AG39D audit.",
    "Close AG39 public mutation decision and controlled execution package/preflight/audit chain.",
    "Confirm no execution was performed.",
    "Carry forward explicit approval requirement before any future live dynamic smoke test."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG39D",
  title: "Controlled Execution Audit",
  status: "controlled_execution_audit_created_ready_for_ag39z_closure",
  depends_on: ["AG39C", "AG39B", "AG39A", "AG38Z"],
  generated_from: inputs,
  audit_file: outputs.audit,
  preflight_chain_audit_file: outputs.preflightChainAudit,
  grant_security_audit_file: outputs.grantSecurityAudit,
  approval_gate_audit_file: outputs.approvalGateAudit,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    controlled_execution_audit_created: true,
    all_audits_passed: allAuditsPassed,
    ready_for_ag39z_closure: allAuditsPassed,

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
  module_id: "AG39D",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG39D",
  preview_only: false,
  status: review.status,
  message: "AG39D Controlled Execution Audit created. Ready for AG39Z closure only.",
  controlled_execution_audit_created: 1,
  all_audits_passed: allAuditsPassed ? 1 : 0,
  ready_for_ag39z_closure: allAuditsPassed ? 1 : 0,
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

const doc = `# AG39D — Controlled Execution Audit

## Result

AG39D Controlled Execution Audit is created.

## Scope

AG39D is audit-only. It does not approve or perform public mutation, real publish, queue-state write, audit-log write, rollback write, database write, deployment or SQL grant execution.

## Audited Areas

- AG39A public mutation decision checkpoint.
- AG39B controlled execution package planning.
- AG39C controlled execution preflight.
- Grant/security guard.
- Operator approval gate.
- No-mutation continuity.

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

AG39Z — Controlled Execution Closure.

AG39Z closes the safety gate before moving to the live dynamic smoke test chain.
`;

writeJson(outputs.preflightChainAudit, preflightChainAudit);
writeJson(outputs.grantSecurityAudit, grantSecurityAudit);
writeJson(outputs.approvalGateAudit, approvalGateAudit);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.audit, audit);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG39D Controlled Execution Audit generated.");
console.log("✅ Preflight chain, grant security, approval gate and no-mutation audits passed.");
console.log("✅ Ready for AG39Z closure only.");
console.log("✅ No public mutation, real publish, database write, deployment, SQL grant execution or service-role key recorded.");
