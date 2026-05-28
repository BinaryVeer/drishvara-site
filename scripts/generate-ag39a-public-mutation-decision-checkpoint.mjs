import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag38zClosure: "data/content-intelligence/backend-architecture/ag38z-controlled-apply-closure.json",
  ag38zChain: "data/content-intelligence/backend-architecture/ag38z-controlled-apply-chain-register.json",
  ag38zApprovalCarryForward: "data/content-intelligence/backend-architecture/ag38z-operator-approval-carry-forward-record.json",
  ag38zGrantCarryForward: "data/content-intelligence/backend-architecture/ag38z-explicit-grant-carry-forward-record.json",
  ag38zBlockerCarryForward: "data/content-intelligence/backend-architecture/ag38z-post-controlled-apply-blocker-carry-forward.json",
  ag38zFuturePlan: "data/content-intelligence/backend-architecture/ag38z-future-consumption-plan.json",
  ag38zReadiness: "data/content-intelligence/quality-registry/ag38z-public-mutation-decision-readiness-record.json",
  ag38zBoundary: "data/content-intelligence/mutation-plans/ag38z-to-ag39a-public-mutation-decision-boundary.json",

  ag37zClosure: "data/content-intelligence/backend-architecture/ag37z-dynamic-publish-dry-run-closure.json",
  ag36zClosure: "data/content-intelligence/backend-architecture/ag36z-login-live-test-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag39a-public-mutation-decision-checkpoint.json",
  checkpoint: "data/content-intelligence/backend-architecture/ag39a-public-mutation-decision-checkpoint.json",
  publicMutationRiskReview: "data/content-intelligence/backend-architecture/ag39a-public-mutation-risk-review-record.json",
  operatorApprovalGate: "data/content-intelligence/backend-architecture/ag39a-operator-approval-gate-record.json",
  grantExecutionDecision: "data/content-intelligence/backend-architecture/ag39a-grant-execution-decision-record.json",
  executionScopeDecision: "data/content-intelligence/backend-architecture/ag39a-execution-scope-decision-record.json",
  blocker: "data/content-intelligence/quality-registry/ag39a-public-mutation-decision-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag39a-controlled-execution-package-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag39a-to-ag39b-controlled-execution-package-boundary.json",
  registry: "data/quality/ag39a-public-mutation-decision-checkpoint.json",
  preview: "data/quality/ag39a-public-mutation-decision-checkpoint-preview.json",
  doc: "docs/quality/AG39A_PUBLIC_MUTATION_DECISION_CHECKPOINT.md"
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
  if (!exists(p)) throw new Error(`Missing AG39A input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (records.ag38zClosure.status !== "controlled_apply_closure_created_ready_for_ag39a_public_mutation_decision") {
  throw new Error("AG38Z closure status mismatch.");
}
if (records.ag38zReadiness.ready_for_ag39a !== true) {
  throw new Error("AG38Z readiness does not permit AG39A.");
}
if (records.ag38zReadiness.allowed_ag39a_mode !== "decision_checkpoint_only_no_public_mutation_without_explicit_operator_approval") {
  throw new Error("AG39A allowed mode mismatch.");
}
if (records.ag38zBoundary.next_stage_id !== "AG39A") {
  throw new Error("AG38Z boundary does not point to AG39A.");
}
if (records.ag38zChain.closed_successfully !== true) {
  throw new Error("AG38 chain must be closed successfully.");
}
if (records.ag37zClosure.status !== "dynamic_publish_dry_run_closure_created_ready_for_ag38a_decision") {
  throw new Error("AG37Z closure status mismatch.");
}
if (records.ag36zClosure.status !== "login_live_test_closure_created_ready_for_ag37a") {
  throw new Error("AG36Z closure status mismatch.");
}

const blockedState = {
  public_mutation_decision_checkpoint_created: true,
  public_mutation_risk_review_created: true,
  operator_approval_gate_created: true,
  grant_execution_decision_created: true,
  execution_scope_decision_created: true,
  controlled_execution_package_ready_to_plan: true,

  explicit_operator_approval_recorded: false,
  public_mutation_approved_now: false,
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

const publicMutationRiskReview = {
  module_id: "AG39A",
  title: "Public Mutation Risk Review Record",
  status: "public_mutation_risk_review_created_no_mutation_authorized",
  reviewed_risks: [
    {
      risk_id: "accidental_public_publication",
      severity: "critical",
      required_control: "No public mutation without explicit operator approval and rollback readiness."
    },
    {
      risk_id: "wrong_article_published",
      severity: "high",
      required_control: "Target article must be exact test/non-public article and independently verified before execution."
    },
    {
      risk_id: "missing_or_failed_rollback",
      severity: "high",
      required_control: "Rollback reference and restore path must be operational before any apply."
    },
    {
      risk_id: "audit_gap",
      severity: "high",
      required_control: "Audit-log write path must be ready before any state change."
    },
    {
      risk_id: "excessive_grant_exposure",
      severity: "high",
      required_control: "No anon grants for Admin/Editor workflow tables; RLS remains primary boundary."
    },
    {
      risk_id: "deployment_side_effect",
      severity: "medium",
      required_control: "No deployment in AG39A; execution package only later if approved."
    }
  ],
  risk_review_passed_for_decision_checkpoint: true,
  public_mutation_authorized: false,
  blocked_state: blockedState
};

const operatorApprovalGate = {
  module_id: "AG39A",
  title: "Operator Approval Gate Record",
  status: "explicit_operator_approval_required_before_public_mutation",
  inherited_from_ag38z: inputs.ag38zApprovalCarryForward,
  approval_state: {
    explicit_operator_approval_recorded_in_ag39a: false,
    public_mutation_allowed_now: false,
    real_apply_allowed_now: false,
    real_publish_allowed_now: false,
    database_write_allowed_now: false,
    audit_log_write_allowed_now: false,
    rollback_write_allowed_now: false,
    deployment_allowed_now: false,
    service_role_key_allowed_in_repo_or_chat: false
  },
  required_before_any_future_public_mutation: [
    "Explicit operator approval.",
    "Exact target article confirmation.",
    "Audit-log write path confirmation.",
    "Rollback write and restore path confirmation.",
    "Grant/RLS confirmation.",
    "No anon exposure confirmation.",
    "Controlled execution package validation."
  ],
  blocked_state: blockedState
};

const grantExecutionDecision = {
  module_id: "AG39A",
  title: "Grant Execution Decision Record",
  status: "grant_execution_decision_created_no_sql_executed",
  inherited_from_ag38z: inputs.ag38zGrantCarryForward,
  decision_scope: "decision_only_no_sql_execution",
  grant_decision: {
    authenticated_read_grants_may_be_packaged_later: true,
    anon_grants_for_admin_editor_tables_allowed: false,
    write_grants_allowed_without_approval: false,
    sql_grants_allowed_now: false,
    sql_grants_executed_now: false,
    service_role_key_required_in_repo_or_chat: false,
    rls_remains_primary_access_control_layer: true
  },
  blocked_state: blockedState
};

const executionScopeDecision = {
  module_id: "AG39A",
  title: "Execution Scope Decision Record",
  status: "execution_scope_decision_created_no_execution_authorized",
  allowed_next_planning_scope: [
    "Prepare controlled execution package only.",
    "Continue using test/non-public article only.",
    "Prepare exact preflight checklist.",
    "Prepare SQL/grant instruction draft only if needed.",
    "Prepare rollback and audit verification steps."
  ],
  not_allowed_now: [
    "No real publish.",
    "No public mutation.",
    "No database write.",
    "No audit-log write.",
    "No rollback write.",
    "No deployment.",
    "No service-role key exposure.",
    "No anon grants.",
    "No SQL execution."
  ],
  execution_authorized_now: false,
  blocked_state: blockedState
};

const checkpoint = {
  module_id: "AG39A",
  title: "Public Mutation Decision Checkpoint",
  status: "public_mutation_decision_checkpoint_created_ready_for_ag39b_package_planning",
  purpose:
    "Create a public mutation decision checkpoint after AG38 controlled apply closure while preserving all blockers against real publish, database write, public mutation, deployment, SQL grant execution and service-role key exposure.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  decision: {
    ag39a_is_decision_checkpoint_only: true,
    controlled_execution_package_may_be_planned_next: true,
    explicit_operator_approval_required_before_public_mutation: true,
    public_mutation_risk_review_created: true,
    grant_execution_decision_created: true,

    explicit_operator_approval_recorded: false,
    public_mutation_approved_now: false,
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
  public_mutation_risk_review_file: outputs.publicMutationRiskReview,
  operator_approval_gate_file: outputs.operatorApprovalGate,
  grant_execution_decision_file: outputs.grantExecutionDecision,
  execution_scope_decision_file: outputs.executionScopeDecision,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG39A",
  title: "Public Mutation Decision Blocker Register",
  status: "public_mutation_decision_blockers_preserved",
  blocked_items: [
    "No explicit operator approval recorded.",
    "No public mutation approved.",
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
  module_id: "AG39A",
  title: "Controlled Execution Package Readiness Record",
  status: "ready_for_ag39b_controlled_execution_package_planning",
  ready_for_ag39b: true,
  next_stage_id: "AG39B",
  next_stage_title: "Controlled Execution Package Planning",
  allowed_ag39b_mode: "package_planning_only_no_public_mutation_without_explicit_operator_approval",
  public_mutation_decision_checkpoint_created: true,
  explicit_operator_approval_required_for_public_mutation: true,
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
  module_id: "AG39A",
  title: "AG39A to AG39B Controlled Execution Package Boundary",
  status: "ag39b_controlled_execution_package_boundary_created",
  next_stage_id: "AG39B",
  next_stage_title: "Controlled Execution Package Planning",
  allowed_scope: [
    "Consume AG39A public mutation decision checkpoint.",
    "Plan a controlled execution package only.",
    "Keep execution, public mutation and deployment blocked.",
    "Keep SQL/grant execution blocked unless separately approved.",
    "Keep service-role key out of repo/chat."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG39A",
  title: "Public Mutation Decision Checkpoint",
  status: "public_mutation_decision_checkpoint_created_ready_for_ag39b_package_planning",
  depends_on: ["AG38Z", "AG37Z", "AG36Z"],
  generated_from: inputs,
  checkpoint_file: outputs.checkpoint,
  public_mutation_risk_review_file: outputs.publicMutationRiskReview,
  operator_approval_gate_file: outputs.operatorApprovalGate,
  grant_execution_decision_file: outputs.grantExecutionDecision,
  execution_scope_decision_file: outputs.executionScopeDecision,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    public_mutation_decision_checkpoint_created: true,
    ready_for_ag39b_package_planning: true,
    explicit_operator_approval_required: true,

    explicit_operator_approval_recorded: false,
    public_mutation_approved_now: false,
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
  module_id: "AG39A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG39A",
  preview_only: false,
  status: review.status,
  message: "AG39A Public Mutation Decision Checkpoint created. Ready for AG39B package planning only.",
  public_mutation_decision_checkpoint_created: 1,
  ready_for_ag39b_package_planning: 1,
  explicit_operator_approval_required: 1,
  explicit_operator_approval_recorded: 0,
  public_mutation_approved_now: 0,
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

const doc = `# AG39A — Public Mutation Decision Checkpoint

## Result

AG39A Public Mutation Decision Checkpoint is created.

## Scope

AG39A is decision-only. It does not approve or perform public mutation, real publish, queue-state write, audit-log write, rollback write, database write, deployment or SQL grant execution.

## Decision Position

AG39A confirms that any future public mutation requires explicit operator approval.

## Carried Forward

- Operator approval requirement.
- Explicit grant/RLS safety requirement.
- No anon grants for Admin/Editor workflow tables.
- No service-role key in repo/chat.

## Still Blocked

- No explicit operator approval recorded.
- No public mutation approved.
- No real apply approved.
- No real publish.
- No queue-state write.
- No audit-log write.
- No rollback write.
- No database write.
- No public article mutation.
- No deployment.
- No SQL grant execution.
- No service-role key exposure.

## Next

AG39B — Controlled Execution Package Planning.

AG39B must remain package-planning only unless explicit operator approval is separately recorded.
`;

writeJson(outputs.publicMutationRiskReview, publicMutationRiskReview);
writeJson(outputs.operatorApprovalGate, operatorApprovalGate);
writeJson(outputs.grantExecutionDecision, grantExecutionDecision);
writeJson(outputs.executionScopeDecision, executionScopeDecision);
writeJson(outputs.checkpoint, checkpoint);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG39A Public Mutation Decision Checkpoint generated.");
console.log("✅ Operator approval, grant execution and public mutation risk gates created.");
console.log("✅ Ready for AG39B package planning only.");
console.log("✅ No public mutation, real publish, database write, deployment, SQL grant execution or service-role key recorded.");
