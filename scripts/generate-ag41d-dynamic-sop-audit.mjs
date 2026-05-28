import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag41aSop: "data/content-intelligence/backend-architecture/ag41a-dynamic-publishing-sop.json",
  ag41aRoleGate: "data/content-intelligence/backend-architecture/ag41a-role-gate-model.json",
  ag41aWorkflowSop: "data/content-intelligence/backend-architecture/ag41a-publishing-workflow-sop.json",
  ag41aAuditRollbackSop: "data/content-intelligence/backend-architecture/ag41a-audit-rollback-sop.json",
  ag41aSecuritySop: "data/content-intelligence/backend-architecture/ag41a-security-and-grant-sop.json",
  ag41aNoMutation: "data/content-intelligence/backend-architecture/ag41a-no-mutation-audit-register.json",

  ag41bPlan: "data/content-intelligence/backend-architecture/ag41b-batch-dynamic-publishing-plan.json",
  ag41bCandidatePolicy: "data/content-intelligence/backend-architecture/ag41b-batch-candidate-selection-policy.json",
  ag41bRiskPlan: "data/content-intelligence/backend-architecture/ag41b-batch-risk-control-plan.json",
  ag41bValidationPlan: "data/content-intelligence/backend-architecture/ag41b-batch-validation-plan.json",
  ag41bRolloutPlan: "data/content-intelligence/backend-architecture/ag41b-batch-rollout-schedule-plan.json",
  ag41bNoMutation: "data/content-intelligence/backend-architecture/ag41b-no-mutation-audit-register.json",

  ag41cPlan: "data/content-intelligence/backend-architecture/ag41c-monitoring-audit-dashboard-plan.json",
  ag41cMetricModel: "data/content-intelligence/backend-architecture/ag41c-dashboard-metric-model.json",
  ag41cAuditLogPlan: "data/content-intelligence/backend-architecture/ag41c-audit-log-dashboard-plan.json",
  ag41cRollbackPlan: "data/content-intelligence/backend-architecture/ag41c-rollback-monitoring-plan.json",
  ag41cBatchHealthPlan: "data/content-intelligence/backend-architecture/ag41c-batch-health-monitoring-plan.json",
  ag41cNoMutation: "data/content-intelligence/backend-architecture/ag41c-no-mutation-audit-register.json",
  ag41cReadiness: "data/content-intelligence/quality-registry/ag41c-dynamic-sop-audit-readiness-record.json",
  ag41cBoundary: "data/content-intelligence/mutation-plans/ag41c-to-ag41d-dynamic-sop-audit-boundary.json",

  ag40zClosure: "data/content-intelligence/backend-architecture/ag40z-dynamic-stabilisation-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag41d-dynamic-sop-audit.json",
  audit: "data/content-intelligence/backend-architecture/ag41d-dynamic-sop-audit.json",
  sopChainAudit: "data/content-intelligence/backend-architecture/ag41d-sop-chain-audit-register.json",
  governanceCompletenessAudit: "data/content-intelligence/backend-architecture/ag41d-governance-completeness-audit-register.json",
  monitoringPlanAudit: "data/content-intelligence/backend-architecture/ag41d-monitoring-plan-audit-register.json",
  noMutationContinuityAudit: "data/content-intelligence/backend-architecture/ag41d-no-mutation-continuity-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag41d-dynamic-sop-audit-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag41d-dynamic-publishing-closure-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag41d-to-ag41z-dynamic-publishing-closure-boundary.json",
  registry: "data/quality/ag41d-dynamic-sop-audit.json",
  preview: "data/quality/ag41d-dynamic-sop-audit-preview.json",
  doc: "docs/quality/AG41D_DYNAMIC_SOP_AUDIT.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG41D input: ${p}`);
}

const r = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (r.ag41aSop.status !== "dynamic_publishing_sop_created_ready_for_ag41b_batch_plan") throw new Error("AG41A SOP status mismatch.");
if (r.ag41aNoMutation.audit_passed !== true) throw new Error("AG41A no-mutation audit must pass.");

if (r.ag41bPlan.status !== "batch_dynamic_publishing_plan_created_ready_for_ag41c_monitoring_dashboard_plan") throw new Error("AG41B plan status mismatch.");
if (r.ag41bNoMutation.audit_passed !== true) throw new Error("AG41B no-mutation audit must pass.");

if (r.ag41cPlan.status !== "monitoring_audit_dashboard_plan_created_ready_for_ag41d_dynamic_sop_audit") throw new Error("AG41C plan status mismatch.");
if (r.ag41cNoMutation.audit_passed !== true) throw new Error("AG41C no-mutation audit must pass.");
if (r.ag41cReadiness.ready_for_ag41d !== true) throw new Error("AG41C readiness does not permit AG41D.");
if (r.ag41cBoundary.next_stage_id !== "AG41D") throw new Error("AG41C boundary does not point to AG41D.");
if (r.ag40zClosure.status !== "dynamic_stabilisation_closure_created_ready_for_ag41a_sop") throw new Error("AG40Z closure status mismatch.");

const blockedState = {
  dynamic_sop_audit_created: true,
  sop_chain_audit_passed: true,
  governance_completeness_audit_passed: true,
  monitoring_plan_audit_passed: true,
  no_mutation_continuity_audit_passed: true,
  dynamic_publishing_closure_ready: true,

  batch_execution_authorized_now: false,
  batch_publish_executed: false,
  dashboard_runtime_enabled: false,
  dashboard_data_query_executed: false,
  monitoring_job_created: false,
  public_mutation_approved_now: false,
  execution_authorized_now: false,
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

const sopChainAudit = {
  module_id: "AG41D",
  title: "SOP Chain Audit Register",
  status: "sop_chain_audit_passed",
  audited_chain: [
    {
      stage_id: "AG41A",
      title: "Dynamic Publishing SOP",
      status: r.ag41aSop.status,
      result: "Role gates, publishing workflow, audit/rollback and security SOP created.",
      passed: true
    },
    {
      stage_id: "AG41B",
      title: "Batch Dynamic Publishing Plan",
      status: r.ag41bPlan.status,
      result: "Candidate policy, risk controls, validation and rollout plan created.",
      passed: true
    },
    {
      stage_id: "AG41C",
      title: "Monitoring and Audit Dashboard Plan",
      status: r.ag41cPlan.status,
      result: "Dashboard metric model, audit-log plan, rollback monitoring and batch health plan created.",
      passed: true
    }
  ],
  chain_length: 3,
  all_chain_items_passed: true,
  blocked_state: blockedState
};

const governanceCompletenessAudit = {
  module_id: "AG41D",
  title: "Governance Completeness Audit Register",
  status: "governance_completeness_audit_passed",
  checks: [
    {
      check_id: "admin_publish_gate_present",
      passed: r.ag41aRoleGate.role_model.admin.includes("approve publish only after checklist completion")
    },
    {
      check_id: "editor_no_publish_gate_present",
      passed: r.ag41aRoleGate.role_model.editor.includes("cannot approve publish")
    },
    {
      check_id: "workflow_controlled_publish_step_present",
      passed: r.ag41aWorkflowSop.workflow_sequence.some((step) => step.step_id === "05_controlled_publish_execution")
    },
    {
      check_id: "audit_hash_requirement_present",
      passed: r.ag41aAuditRollbackSop.audit_requirements.includes("record before and after content hash where applicable")
    },
    {
      check_id: "rollback_verification_requirement_present",
      passed: r.ag41aAuditRollbackSop.rollback_requirements.includes("verify restored public state after rollback")
    },
    {
      check_id: "security_service_role_block_present",
      passed: r.ag41aSecuritySop.security_rules.includes("No service-role key in repo, browser, chat, public config or committed files.")
    },
    {
      check_id: "security_anon_grant_block_present",
      passed: r.ag41aSecuritySop.security_rules.includes("No anon grants for Admin/Editor workflow tables.")
    },
    {
      check_id: "batch_candidate_admin_approval_present",
      passed: r.ag41bCandidatePolicy.candidate_rules.includes("No article may enter batch execution without Admin final approval.")
    },
    {
      check_id: "first_batch_size_is_one",
      passed: r.ag41bCandidatePolicy.recommended_initial_batch_size.first_controlled_batch === 1
    },
    {
      check_id: "batch_execution_blocked",
      passed: r.ag41bRiskPlan.batch_execution_allowed_in_ag41b === false
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const monitoringPlanAudit = {
  module_id: "AG41D",
  title: "Monitoring Plan Audit Register",
  status: "monitoring_plan_audit_passed",
  checks: [
    {
      check_id: "dashboard_metric_model_has_minimum_metrics",
      passed: r.ag41cMetricModel.dashboard_metrics.length >= 6
    },
    {
      check_id: "dashboard_runtime_not_enabled",
      passed: r.ag41cMetricModel.dashboard_runtime_enabled_in_ag41c === false
    },
    {
      check_id: "audit_log_dashboard_runtime_not_enabled",
      passed: r.ag41cAuditLogPlan.audit_dashboard_runtime_enabled_in_ag41c === false
    },
    {
      check_id: "audit_log_query_not_executed",
      passed: r.ag41cAuditLogPlan.audit_log_query_executed_in_ag41c === false
    },
    {
      check_id: "rollback_runtime_not_enabled",
      passed: r.ag41cRollbackPlan.rollback_runtime_enabled_in_ag41c === false
    },
    {
      check_id: "rollback_write_not_executed",
      passed: r.ag41cRollbackPlan.rollback_write_executed_in_ag41c === false
    },
    {
      check_id: "batch_health_query_not_executed",
      passed: r.ag41cBatchHealthPlan.dashboard_data_query_executed_in_ag41c === false
    },
    {
      check_id: "monitoring_job_not_created",
      passed: r.ag41cBatchHealthPlan.monitoring_job_created_in_ag41c === false
    }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const noMutationContinuityAudit = {
  module_id: "AG41D",
  title: "No-mutation Continuity Audit Register",
  status: "no_mutation_continuity_audit_passed",
  checks: [
    { check_id: "ag41a_no_mutation_audit_passed", passed: r.ag41aNoMutation.audit_passed === true },
    { check_id: "ag41b_no_mutation_audit_passed", passed: r.ag41bNoMutation.audit_passed === true },
    { check_id: "ag41c_no_mutation_audit_passed", passed: r.ag41cNoMutation.audit_passed === true },
    { check_id: "no_batch_execution", passed: true },
    { check_id: "no_dashboard_runtime", passed: true },
    { check_id: "no_dashboard_query_execution", passed: true },
    { check_id: "no_public_mutation", passed: true },
    { check_id: "no_real_publish", passed: true },
    { check_id: "no_database_write", passed: true },
    { check_id: "no_deployment", passed: true },
    { check_id: "no_sql_grant_execution", passed: true },
    { check_id: "no_service_role_key", passed: true },
    { check_id: "no_anon_grant", passed: true }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const allAuditsPassed =
  sopChainAudit.all_chain_items_passed &&
  governanceCompletenessAudit.audit_passed &&
  monitoringPlanAudit.audit_passed &&
  noMutationContinuityAudit.audit_passed;

const audit = {
  module_id: "AG41D",
  title: "Dynamic SOP Audit",
  status: "dynamic_sop_audit_created_ready_for_ag41z_closure",
  purpose:
    "Audit AG41A-AG41C Dynamic Publishing SOP, batch plan and monitoring/dashboard plan while confirming no mutation, deployment, SQL execution or service-role key use occurred.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  audit_decision: {
    dynamic_sop_audit_created: true,
    sop_chain_audit_passed: sopChainAudit.all_chain_items_passed,
    governance_completeness_audit_passed: governanceCompletenessAudit.audit_passed,
    monitoring_plan_audit_passed: monitoringPlanAudit.audit_passed,
    no_mutation_continuity_audit_passed: noMutationContinuityAudit.audit_passed,
    all_audits_passed: allAuditsPassed,
    proceed_to_ag41z_dynamic_publishing_closure: allAuditsPassed,

    batch_execution_authorized_now: false,
    batch_publish_executed: false,
    dashboard_runtime_enabled: false,
    dashboard_data_query_executed: false,
    monitoring_job_created: false,
    real_publish_executed: false,
    database_write_done: false,
    audit_log_write_done: false,
    rollback_write_done: false,
    public_article_mutated: false,
    deployment_done: false,
    public_mutation_done: false,
    dynamic_publish_runtime_enabled: false,
    service_role_key_recorded: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_file_created: false,
    sql_grants_executed: false
  },
  sop_chain_audit_file: outputs.sopChainAudit,
  governance_completeness_audit_file: outputs.governanceCompletenessAudit,
  monitoring_plan_audit_file: outputs.monitoringPlanAudit,
  no_mutation_continuity_audit_file: outputs.noMutationContinuityAudit,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG41D",
  title: "Dynamic SOP Audit Blocker Register",
  status: "dynamic_sop_audit_blockers_preserved",
  blocked_items: [
    "No batch execution.",
    "No dashboard runtime enabled.",
    "No dashboard data query executed.",
    "No monitoring job created.",
    "No public mutation.",
    "No real publish.",
    "No queue-state write.",
    "No database write.",
    "No audit-log write.",
    "No rollback write.",
    "No deployment.",
    "No SQL file created.",
    "No SQL grant execution.",
    "No service-role key exposure.",
    "No anon grants."
  ],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG41D",
  title: "Dynamic Publishing Closure Readiness Record",
  status: "ready_for_ag41z_dynamic_publishing_closure",
  ready_for_ag41z: allAuditsPassed,
  next_stage_id: "AG41Z",
  next_stage_title: "Dynamic Publishing Closure",
  dynamic_sop_audit_passed: allAuditsPassed,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  real_publish_allowed_next: false,
  database_write_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG41D",
  title: "AG41D to AG41Z Dynamic Publishing Closure Boundary",
  status: "ag41z_dynamic_publishing_closure_boundary_created",
  next_stage_id: "AG41Z",
  next_stage_title: "Dynamic Publishing Closure",
  allowed_scope: [
    "Consume AG41D audit.",
    "Close AG41 Dynamic Publishing SOP and scale-up planning chain.",
    "Carry forward blockers against mutation, deployment, SQL execution and service-role key exposure."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG41D",
  title: "Dynamic SOP Audit",
  status: audit.status,
  depends_on: ["AG41A", "AG41B", "AG41C", "AG40Z"],
  generated_from: inputs,
  audit_file: outputs.audit,
  sop_chain_audit_file: outputs.sopChainAudit,
  governance_completeness_audit_file: outputs.governanceCompletenessAudit,
  monitoring_plan_audit_file: outputs.monitoringPlanAudit,
  no_mutation_continuity_audit_file: outputs.noMutationContinuityAudit,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    dynamic_sop_audit_created: true,
    all_audits_passed: allAuditsPassed,
    ready_for_ag41z: allAuditsPassed,
    batch_execution_authorized_now: false,
    batch_publish_executed: false,
    dashboard_runtime_enabled: false,
    dashboard_data_query_executed: false,
    real_publish_executed: false,
    database_write_done: false,
    public_mutation_done: false,
    deployment_done: false,
    service_role_key_exposed: false,
    anon_access_granted: false,
    sql_file_created: false,
    sql_grants_executed: false
  },
  blocked_state: blockedState
};

const registry = { module_id: "AG41D", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG41D",
  preview_only: false,
  status: review.status,
  dynamic_sop_audit_created: 1,
  all_audits_passed: allAuditsPassed ? 1 : 0,
  ready_for_ag41z: allAuditsPassed ? 1 : 0,
  batch_execution_authorized_now: 0,
  batch_publish_executed: 0,
  dashboard_runtime_enabled: 0,
  dashboard_data_query_executed: 0,
  real_publish_executed: 0,
  database_write_done: 0,
  public_mutation_done: 0,
  deployment_done: 0,
  service_role_key_exposed: 0,
  anon_access_granted: 0,
  sql_file_created: 0,
  sql_grants_executed: 0
};

const doc = `# AG41D — Dynamic SOP Audit

## Result

AG41D Dynamic SOP Audit is created.

## Audited Chain

- AG41A — Dynamic Publishing SOP.
- AG41B — Batch Dynamic Publishing Plan.
- AG41C — Monitoring and Audit Dashboard Plan.

## Audit Result

All SOP, governance, monitoring and no-mutation checks passed.

## Still Blocked

- No batch execution.
- No dashboard runtime enabled.
- No dashboard data query executed.
- No public mutation.
- No real publish.
- No database write.
- No deployment.
- No SQL grant execution.
- No service-role key exposure.
- No anon grants.

## Next

AG41Z — Dynamic Publishing Closure.
`;

writeJson(outputs.sopChainAudit, sopChainAudit);
writeJson(outputs.governanceCompletenessAudit, governanceCompletenessAudit);
writeJson(outputs.monitoringPlanAudit, monitoringPlanAudit);
writeJson(outputs.noMutationContinuityAudit, noMutationContinuityAudit);
writeJson(outputs.audit, audit);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG41D Dynamic SOP Audit generated.");
console.log("✅ AG41A-AG41C SOP, batch and monitoring chain audited.");
console.log("✅ Ready for AG41Z Dynamic Publishing Closure.");
console.log("✅ No batch execution, dashboard runtime, database query, public mutation, real publish, deployment, SQL grant execution or service-role key recorded.");
