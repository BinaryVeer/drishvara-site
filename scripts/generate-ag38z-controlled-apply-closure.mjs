import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag38aCheckpoint: "data/content-intelligence/backend-architecture/ag38a-controlled-apply-decision-checkpoint.json",
  ag38bPackage: "data/content-intelligence/backend-architecture/ag38b-controlled-apply-package-planning.json",
  ag38cPreflight: "data/content-intelligence/backend-architecture/ag38c-controlled-apply-preflight.json",
  ag38dAudit: "data/content-intelligence/backend-architecture/ag38d-controlled-apply-audit.json",
  ag38dPreflightChainAudit: "data/content-intelligence/backend-architecture/ag38d-preflight-chain-audit-register.json",
  ag38dGrantSecurityAudit: "data/content-intelligence/backend-architecture/ag38d-explicit-grant-security-audit-register.json",
  ag38dApprovalGateAudit: "data/content-intelligence/backend-architecture/ag38d-operator-approval-gate-audit-register.json",
  ag38dNoMutationAudit: "data/content-intelligence/backend-architecture/ag38d-no-mutation-audit-register.json",
  ag38dReadiness: "data/content-intelligence/quality-registry/ag38d-controlled-apply-closure-readiness-record.json",
  ag38dBoundary: "data/content-intelligence/mutation-plans/ag38d-to-ag38z-controlled-apply-closure-boundary.json",
  ag37zClosure: "data/content-intelligence/backend-architecture/ag37z-dynamic-publish-dry-run-closure.json",
  ag36zClosure: "data/content-intelligence/backend-architecture/ag36z-login-live-test-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag38z-controlled-apply-closure.json",
  closure: "data/content-intelligence/backend-architecture/ag38z-controlled-apply-closure.json",
  chainRegister: "data/content-intelligence/backend-architecture/ag38z-controlled-apply-chain-register.json",
  approvalCarryForward: "data/content-intelligence/backend-architecture/ag38z-operator-approval-carry-forward-record.json",
  grantCarryForward: "data/content-intelligence/backend-architecture/ag38z-explicit-grant-carry-forward-record.json",
  blockerCarryForward: "data/content-intelligence/backend-architecture/ag38z-post-controlled-apply-blocker-carry-forward.json",
  futureConsumptionPlan: "data/content-intelligence/backend-architecture/ag38z-future-consumption-plan.json",
  blocker: "data/content-intelligence/quality-registry/ag38z-controlled-apply-closure-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag38z-public-mutation-decision-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag38z-to-ag39a-public-mutation-decision-boundary.json",
  registry: "data/quality/ag38z-controlled-apply-closure.json",
  preview: "data/quality/ag38z-controlled-apply-closure-preview.json",
  doc: "docs/quality/AG38Z_CONTROLLED_APPLY_CLOSURE.md"
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
  if (!exists(p)) throw new Error(`Missing AG38Z input: ${p}`);
}

const records = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (records.ag38aCheckpoint.status !== "controlled_apply_decision_checkpoint_created_ready_for_ag38b_package_planning") {
  throw new Error("AG38A checkpoint status mismatch.");
}
if (records.ag38bPackage.status !== "controlled_apply_package_planning_created_ready_for_ag38c_preflight") {
  throw new Error("AG38B package status mismatch.");
}
if (records.ag38cPreflight.status !== "controlled_apply_preflight_created_ready_for_ag38d_audit") {
  throw new Error("AG38C preflight status mismatch.");
}
if (records.ag38dAudit.status !== "controlled_apply_audit_created_ready_for_ag38z_closure") {
  throw new Error("AG38D audit status mismatch.");
}
if (records.ag38dAudit.audit_decision?.all_audits_passed !== true) {
  throw new Error("AG38D all audits must pass.");
}
if (records.ag38dReadiness.ready_for_ag38z !== true) {
  throw new Error("AG38D readiness does not permit AG38Z.");
}
if (records.ag38dBoundary.next_stage_id !== "AG38Z") {
  throw new Error("AG38D boundary does not point to AG38Z.");
}
if (records.ag37zClosure.status !== "dynamic_publish_dry_run_closure_created_ready_for_ag38a_decision") {
  throw new Error("AG37Z closure status mismatch.");
}
if (records.ag36zClosure.status !== "login_live_test_closure_created_ready_for_ag37a") {
  throw new Error("AG36Z closure status mismatch.");
}

const blockedState = {
  controlled_apply_closure_created: true,
  ag38_controlled_apply_chain_closed: true,
  approval_gate_carried_forward: true,
  explicit_grant_review_carried_forward: true,
  public_mutation_decision_ready: true,

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

const chainRegister = {
  module_id: "AG38Z",
  title: "Controlled Apply Chain Register",
  status: "ag38_controlled_apply_chain_registered_for_closure",
  closed_chain: [
    {
      stage_id: "AG38A",
      title: "Controlled Apply Decision Checkpoint",
      status: records.ag38aCheckpoint.status,
      result: "Decision checkpoint created; no real apply approved.",
      file: inputs.ag38aCheckpoint
    },
    {
      stage_id: "AG38B",
      title: "Controlled Apply Package Planning",
      status: records.ag38bPackage.status,
      result: "Package planning completed; no SQL or mutation executed.",
      file: inputs.ag38bPackage
    },
    {
      stage_id: "AG38C",
      title: "Controlled Apply Preflight",
      status: records.ag38cPreflight.status,
      result: "Target, explicit grant, audit/rollback and approval preflights passed.",
      file: inputs.ag38cPreflight
    },
    {
      stage_id: "AG38D",
      title: "Controlled Apply Audit",
      status: records.ag38dAudit.status,
      result: "Preflight chain, grant security, approval gate and no-mutation audits passed.",
      file: inputs.ag38dAudit
    }
  ],
  chain_length: 4,
  closed_successfully: true,
  blocked_state: blockedState
};

const approvalCarryForward = {
  module_id: "AG38Z",
  title: "Operator Approval Carry Forward Record",
  status: "operator_approval_requirement_carried_forward",
  approval_state: {
    explicit_operator_approval_recorded: false,
    real_apply_allowed_now: false,
    public_mutation_allowed_now: false,
    database_write_allowed_now: false,
    deployment_allowed_now: false,
    service_role_key_allowed_in_repo_or_chat: false
  },
  mandatory_before_any_future_real_apply: [
    "Explicit operator approval must be recorded.",
    "Exact target article must be confirmed.",
    "Rollback plan must be operational.",
    "Audit-log write path must be operational.",
    "Supabase grants must be reviewed and applied only if approved.",
    "No public mutation unless separately approved."
  ],
  blocked_state: blockedState
};

const grantCarryForward = {
  module_id: "AG38Z",
  title: "Explicit Grant Carry Forward Record",
  status: "explicit_grant_review_carried_forward_no_sql_executed",
  carried_forward_from: [
    inputs.ag38aCheckpoint,
    inputs.ag38bPackage,
    inputs.ag38cGrantPreflight,
    inputs.ag38dGrantSecurityAudit
  ].filter(Boolean),
  grant_position: {
    authenticated_read_grants_may_be_prepared_later: true,
    anon_grants_for_admin_editor_tables_allowed: false,
    write_grants_allowed_without_approval: false,
    sql_grants_executed_in_ag38: false,
    rls_remains_primary_access_control_layer: true
  },
  blocked_state: blockedState
};

const blockerCarryForward = {
  module_id: "AG38Z",
  title: "Post Controlled Apply Blocker Carry Forward",
  status: "post_controlled_apply_blockers_carried_forward_to_ag39",
  blocker_meaning:
    "AG38 closed the controlled apply planning/preflight/audit chain only. It does not authorize real publish, database writes, audit writes, rollback writes, public mutation, deployment, anon grants or service-role key use.",
  blocked_items: {
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
    service_role_key_exposed: false,
    anon_access_granted: false,
    write_grants_executed: false,
    sql_grants_executed: false
  },
  blocked_state: blockedState
};

const futureConsumptionPlan = {
  module_id: "AG38Z",
  title: "Future Consumption Plan",
  status: "future_consumption_plan_created_for_ag39_and_later",
  future_consumption: {
    AG39A:
      "AG39A should be a public mutation decision checkpoint only. It must not perform public mutation or real publish without explicit operator approval.",
    AG39B:
      "AG39B may prepare a tightly scoped controlled apply execution package only after AG39A approval.",
    AG39C:
      "AG39C should prepare SQL/grant execution instructions only if the operator explicitly approves, and should keep service-role key out of repo/chat.",
    AG39D:
      "AG39D should audit any approved controlled apply execution package before execution.",
    AG39Z:
      "AG39Z should close the public mutation decision chain and either continue blocking or proceed to a separately approved execution stage."
  },
  blocked_state: blockedState
};

const closure = {
  module_id: "AG38Z",
  title: "Controlled Apply Closure",
  status: "controlled_apply_closure_created_ready_for_ag39a_public_mutation_decision",
  purpose:
    "Close AG38 controlled apply planning/preflight/audit chain while preserving all blockers against real apply, database write, public mutation, deployment, SQL grant execution and service-role key exposure.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  closure_decision: {
    ag38_controlled_apply_chain_closed: true,
    controlled_apply_planning_closed: true,
    controlled_apply_preflight_closed: true,
    controlled_apply_audit_passed: true,
    proceed_to_ag39a_public_mutation_decision_checkpoint: true,

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
  chain_register_file: outputs.chainRegister,
  approval_carry_forward_file: outputs.approvalCarryForward,
  grant_carry_forward_file: outputs.grantCarryForward,
  blocker_carry_forward_file: outputs.blockerCarryForward,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG38Z",
  title: "Controlled Apply Closure Blocker Register",
  status: "controlled_apply_closure_blockers_preserved_for_ag39",
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
  module_id: "AG38Z",
  title: "Public Mutation Decision Readiness Record",
  status: "ready_for_ag39a_public_mutation_decision_checkpoint",
  ready_for_ag39a: true,
  next_stage_id: "AG39A",
  next_stage_title: "Public Mutation Decision Checkpoint",
  allowed_ag39a_mode: "decision_checkpoint_only_no_public_mutation_without_explicit_operator_approval",
  ag38_controlled_apply_chain_closed: true,
  controlled_apply_audit_passed: true,
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
  module_id: "AG38Z",
  title: "AG38Z to AG39A Public Mutation Decision Boundary",
  status: "ag39a_public_mutation_decision_boundary_created",
  next_stage_id: "AG39A",
  next_stage_title: "Public Mutation Decision Checkpoint",
  allowed_scope: [
    "Consume AG38Z closure.",
    "Review whether public mutation should be considered.",
    "Confirm explicit operator approval requirement.",
    "Keep public mutation, real publish, database write, deployment and service-role key use blocked unless separately approved."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG38Z",
  title: "Controlled Apply Closure",
  status: "controlled_apply_closure_created_ready_for_ag39a_public_mutation_decision",
  depends_on: ["AG38A", "AG38B", "AG38C", "AG38D", "AG37Z"],
  generated_from: inputs,
  closure_file: outputs.closure,
  chain_register_file: outputs.chainRegister,
  approval_carry_forward_file: outputs.approvalCarryForward,
  grant_carry_forward_file: outputs.grantCarryForward,
  blocker_carry_forward_file: outputs.blockerCarryForward,
  future_consumption_plan_file: outputs.futureConsumptionPlan,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    controlled_apply_closure_created: true,
    ag38_controlled_apply_chain_closed: true,
    controlled_apply_audit_passed: true,
    ready_for_ag39a_public_mutation_decision: true,

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
  module_id: "AG38Z",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG38Z",
  preview_only: false,
  status: review.status,
  message: "AG38Z Controlled Apply Closure created. Ready for AG39A public mutation decision checkpoint only.",
  controlled_apply_closure_created: 1,
  ag38_controlled_apply_chain_closed: 1,
  controlled_apply_audit_passed: 1,
  ready_for_ag39a_public_mutation_decision: 1,
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

const doc = `# AG38Z — Controlled Apply Closure

## Closure Result

AG38 Controlled Apply chain is closed.

## Confirmed Chain

- AG38A — Controlled Apply Decision Checkpoint.
- AG38B — Controlled Apply Package Planning.
- AG38C — Controlled Apply Preflight.
- AG38D — Controlled Apply Audit.

## Closure Meaning

AG38 confirms planning, preflight and audit readiness only. It does not approve or execute real apply.

## Still Blocked

- No explicit operator approval recorded.
- No real apply approved.
- No real publish.
- No queue-state write.
- No audit-log write.
- No rollback write.
- No database write.
- No public article mutation.
- No deployment.
- No public mutation.
- No dynamic publish runtime.
- No service-role key exposure.
- No anon grants.
- No write grants executed.
- No SQL grants executed.

## Next

AG39A — Public Mutation Decision Checkpoint.

AG39A must remain decision-only unless explicit operator approval is separately recorded.
`;

writeJson(outputs.chainRegister, chainRegister);
writeJson(outputs.approvalCarryForward, approvalCarryForward);
writeJson(outputs.grantCarryForward, grantCarryForward);
writeJson(outputs.blockerCarryForward, blockerCarryForward);
writeJson(outputs.futureConsumptionPlan, futureConsumptionPlan);
writeJson(outputs.closure, closure);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG38Z Controlled Apply Closure generated.");
console.log("✅ AG38 controlled apply chain closed.");
console.log("✅ Ready for AG39A public mutation decision checkpoint only.");
console.log("✅ No real publish, database write, public mutation, deployment, SQL grant execution or service-role key recorded.");
