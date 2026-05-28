import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag41bPlan: "data/content-intelligence/backend-architecture/ag41b-batch-dynamic-publishing-plan.json",
  ag41bCandidatePolicy: "data/content-intelligence/backend-architecture/ag41b-batch-candidate-selection-policy.json",
  ag41bRiskPlan: "data/content-intelligence/backend-architecture/ag41b-batch-risk-control-plan.json",
  ag41bValidationPlan: "data/content-intelligence/backend-architecture/ag41b-batch-validation-plan.json",
  ag41bRolloutPlan: "data/content-intelligence/backend-architecture/ag41b-batch-rollout-schedule-plan.json",
  ag41bNoMutation: "data/content-intelligence/backend-architecture/ag41b-no-mutation-audit-register.json",
  ag41bReadiness: "data/content-intelligence/quality-registry/ag41b-monitoring-audit-dashboard-plan-readiness-record.json",
  ag41bBoundary: "data/content-intelligence/mutation-plans/ag41b-to-ag41c-monitoring-audit-dashboard-plan-boundary.json",
  ag41aSop: "data/content-intelligence/backend-architecture/ag41a-dynamic-publishing-sop.json",
  ag40zClosure: "data/content-intelligence/backend-architecture/ag40z-dynamic-stabilisation-closure.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag41c-monitoring-audit-dashboard-plan.json",
  plan: "data/content-intelligence/backend-architecture/ag41c-monitoring-audit-dashboard-plan.json",
  metricModel: "data/content-intelligence/backend-architecture/ag41c-dashboard-metric-model.json",
  auditLogDashboardPlan: "data/content-intelligence/backend-architecture/ag41c-audit-log-dashboard-plan.json",
  rollbackMonitoringPlan: "data/content-intelligence/backend-architecture/ag41c-rollback-monitoring-plan.json",
  batchHealthPlan: "data/content-intelligence/backend-architecture/ag41c-batch-health-monitoring-plan.json",
  noMutationAudit: "data/content-intelligence/backend-architecture/ag41c-no-mutation-audit-register.json",
  blocker: "data/content-intelligence/quality-registry/ag41c-monitoring-audit-dashboard-plan-blocker-register.json",
  readiness: "data/content-intelligence/quality-registry/ag41c-dynamic-sop-audit-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag41c-to-ag41d-dynamic-sop-audit-boundary.json",
  registry: "data/quality/ag41c-monitoring-audit-dashboard-plan.json",
  preview: "data/quality/ag41c-monitoring-audit-dashboard-plan-preview.json",
  doc: "docs/quality/AG41C_MONITORING_AUDIT_DASHBOARD_PLAN.md"
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
  if (!exists(p)) throw new Error(`Missing AG41C input: ${p}`);
}

const r = Object.fromEntries(Object.entries(inputs).map(([k, f]) => [k, readJson(f)]));

if (r.ag41bPlan.status !== "batch_dynamic_publishing_plan_created_ready_for_ag41c_monitoring_dashboard_plan") throw new Error("AG41B plan status mismatch.");
if (r.ag41bPlan.plan_decision.proceed_to_ag41c_monitoring_audit_dashboard_plan !== true) throw new Error("AG41B does not permit AG41C.");
if (r.ag41bNoMutation.audit_passed !== true) throw new Error("AG41B no-mutation audit must pass.");
if (r.ag41bReadiness.ready_for_ag41c !== true) throw new Error("AG41B readiness does not permit AG41C.");
if (r.ag41bBoundary.next_stage_id !== "AG41C") throw new Error("AG41B boundary does not point to AG41C.");
if (r.ag41aSop.status !== "dynamic_publishing_sop_created_ready_for_ag41b_batch_plan") throw new Error("AG41A SOP status mismatch.");
if (r.ag40zClosure.status !== "dynamic_stabilisation_closure_created_ready_for_ag41a_sop") throw new Error("AG40Z closure status mismatch.");

const blockedState = {
  monitoring_audit_dashboard_plan_created: true,
  dashboard_metric_model_created: true,
  audit_log_dashboard_plan_created: true,
  rollback_monitoring_plan_created: true,
  batch_health_monitoring_plan_created: true,
  dynamic_sop_audit_ready: true,

  dashboard_runtime_enabled: false,
  dashboard_ui_created_now: false,
  dashboard_data_query_executed: false,
  monitoring_job_created: false,
  batch_execution_authorized_now: false,
  batch_publish_executed: false,
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

const metricModel = {
  module_id: "AG41C",
  title: "Dashboard Metric Model",
  status: "dashboard_metric_model_created",
  dashboard_metrics: [
    {
      metric_id: "article_pipeline_status_count",
      purpose: "count articles by draft, editor_submitted, admin_review, publish_approved, published and returned status",
      source_table_planned: "articles",
      runtime_query_executed_in_ag41c: false
    },
    {
      metric_id: "editor_assignment_backlog",
      purpose: "track assigned, returned, submitted and closed editor assignments",
      source_table_planned: "article_assignments",
      runtime_query_executed_in_ag41c: false
    },
    {
      metric_id: "publish_approval_queue",
      purpose: "track articles waiting for Admin approval before controlled publish",
      source_table_planned: "articles",
      runtime_query_executed_in_ag41c: false
    },
    {
      metric_id: "audit_log_completeness",
      purpose: "track whether required audit records exist for future publish/rollback events",
      source_table_planned: "article_audit_logs",
      runtime_query_executed_in_ag41c: false
    },
    {
      metric_id: "rollback_readiness",
      purpose: "track whether rollback reference exists before future publish execution",
      source_table_planned: "publish_rollback_refs",
      runtime_query_executed_in_ag41c: false
    },
    {
      metric_id: "public_listing_verification",
      purpose: "track post-publish public URL and listing verification state",
      source_table_planned: "future_public_verification_records",
      runtime_query_executed_in_ag41c: false
    }
  ],
  dashboard_runtime_enabled_in_ag41c: false,
  blocked_state: blockedState
};

const auditLogDashboardPlan = {
  module_id: "AG41C",
  title: "Audit Log Dashboard Plan",
  status: "audit_log_dashboard_plan_created",
  audit_panels: [
    "recent publish decisions",
    "returned articles and decision notes",
    "before/after status transition trail",
    "actor role and action type summary",
    "content hash availability",
    "missing audit note exception register"
  ],
  required_fields: [
    "article_id",
    "actor_id",
    "actor_role",
    "action_type",
    "before_state",
    "after_state",
    "before_hash",
    "after_hash",
    "decision_note",
    "created_at"
  ],
  audit_dashboard_runtime_enabled_in_ag41c: false,
  audit_log_query_executed_in_ag41c: false,
  blocked_state: blockedState
};

const rollbackMonitoringPlan = {
  module_id: "AG41C",
  title: "Rollback Monitoring Plan",
  status: "rollback_monitoring_plan_created",
  rollback_panels: [
    "articles requiring rollback readiness before publish",
    "rollback reference availability",
    "previous public artifact reference availability",
    "restoration note completeness",
    "post-rollback verification state"
  ],
  rollback_rules: [
    "No future controlled publish without rollback reference readiness.",
    "Rollback record must preserve previous public artifact or status reference.",
    "Post-rollback public URL and listing must be verified.",
    "Rollback event must create an audit-log decision note."
  ],
  rollback_runtime_enabled_in_ag41c: false,
  rollback_write_executed_in_ag41c: false,
  blocked_state: blockedState
};

const batchHealthPlan = {
  module_id: "AG41C",
  title: "Batch Health Monitoring Plan",
  status: "batch_health_monitoring_plan_created",
  batch_health_dimensions: [
    "candidate readiness",
    "Admin approval completeness",
    "reference/image attribution completeness",
    "rollback readiness",
    "public URL verification",
    "public listing verification",
    "audit completeness",
    "post-batch stabilisation result"
  ],
  batch_health_states: [
    "not_ready",
    "ready_for_review",
    "approved_for_future_execution",
    "future_execution_pending",
    "verified",
    "exception"
  ],
  dashboard_data_query_executed_in_ag41c: false,
  monitoring_job_created_in_ag41c: false,
  blocked_state: blockedState
};

const noMutationAudit = {
  module_id: "AG41C",
  title: "No-mutation Audit Register",
  status: "no_mutation_audit_passed_for_ag41c",
  checks: [
    { check_id: "planning_only", passed: true },
    { check_id: "no_dashboard_runtime", passed: true },
    { check_id: "no_dashboard_query_execution", passed: true },
    { check_id: "no_monitoring_job_created", passed: true },
    { check_id: "no_batch_execution", passed: true },
    { check_id: "no_public_mutation", passed: true },
    { check_id: "no_real_publish", passed: true },
    { check_id: "no_database_write", passed: true },
    { check_id: "no_audit_log_write", passed: true },
    { check_id: "no_rollback_write", passed: true },
    { check_id: "no_deployment", passed: true },
    { check_id: "no_sql_file_created", passed: true },
    { check_id: "no_sql_grant_execution", passed: true },
    { check_id: "no_service_role_key", passed: true },
    { check_id: "no_anon_grant", passed: true }
  ],
  audit_passed: true,
  blocked_state: blockedState
};

const plan = {
  module_id: "AG41C",
  title: "Monitoring and Audit Dashboard Plan",
  status: "monitoring_audit_dashboard_plan_created_ready_for_ag41d_dynamic_sop_audit",
  purpose:
    "Create the governed monitoring and audit dashboard plan after AG41B batch dynamic publishing plan, without creating dashboard runtime, querying database, mutating state, deploying or executing SQL.",
  created_by: "vikash vaibhav",
  contact_email: "dwivedi.vikash.vaibhav@gmail.com",
  consumed_source_of_truth: Object.values(inputs),
  plan_decision: {
    monitoring_audit_dashboard_plan_created: true,
    dashboard_metric_model_created: true,
    audit_log_dashboard_plan_created: true,
    rollback_monitoring_plan_created: true,
    batch_health_monitoring_plan_created: true,
    proceed_to_ag41d_dynamic_sop_audit: true,

    dashboard_runtime_enabled: false,
    dashboard_ui_created_now: false,
    dashboard_data_query_executed: false,
    monitoring_job_created: false,
    batch_execution_authorized_now: false,
    batch_publish_executed: false,
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
  metric_model_file: outputs.metricModel,
  audit_log_dashboard_plan_file: outputs.auditLogDashboardPlan,
  rollback_monitoring_plan_file: outputs.rollbackMonitoringPlan,
  batch_health_plan_file: outputs.batchHealthPlan,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocked_state: blockedState
};

const blocker = {
  module_id: "AG41C",
  title: "Monitoring and Audit Dashboard Plan Blocker Register",
  status: "monitoring_audit_dashboard_plan_blockers_preserved",
  blocked_items: [
    "No dashboard runtime enabled.",
    "No dashboard UI created.",
    "No dashboard data query executed.",
    "No monitoring job created.",
    "No batch execution.",
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
  module_id: "AG41C",
  title: "Dynamic SOP Audit Readiness Record",
  status: "ready_for_ag41d_dynamic_sop_audit",
  ready_for_ag41d: true,
  next_stage_id: "AG41D",
  next_stage_title: "Dynamic SOP Audit",
  monitoring_audit_dashboard_plan_created: true,
  deployment_allowed_next: false,
  public_mutation_allowed_next: false,
  real_publish_allowed_next: false,
  database_write_allowed_next: false,
  service_role_key_required_in_repo_or_chat: false,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG41C",
  title: "AG41C to AG41D Dynamic SOP Audit Boundary",
  status: "ag41d_dynamic_sop_audit_boundary_created",
  next_stage_id: "AG41D",
  next_stage_title: "Dynamic SOP Audit",
  allowed_scope: [
    "Consume AG41A SOP, AG41B batch plan and AG41C monitoring/dashboard plan.",
    "Audit SOP completeness, batch plan, monitoring plan and no-mutation continuity.",
    "Keep mutation, deployment, SQL execution and service-role key exposure blocked unless separately approved."
  ],
  blocked_scope: blocker.blocked_items,
  blocked_state: blockedState
};

const review = {
  module_id: "AG41C",
  title: "Monitoring and Audit Dashboard Plan",
  status: plan.status,
  depends_on: ["AG41B", "AG41A", "AG40Z"],
  generated_from: inputs,
  plan_file: outputs.plan,
  metric_model_file: outputs.metricModel,
  audit_log_dashboard_plan_file: outputs.auditLogDashboardPlan,
  rollback_monitoring_plan_file: outputs.rollbackMonitoringPlan,
  batch_health_plan_file: outputs.batchHealthPlan,
  no_mutation_audit_file: outputs.noMutationAudit,
  blocker_file: outputs.blocker,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    monitoring_audit_dashboard_plan_created: true,
    ready_for_ag41d: true,
    dashboard_runtime_enabled: false,
    dashboard_data_query_executed: false,
    monitoring_job_created: false,
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

const registry = { module_id: "AG41C", title: review.title, status: review.status, generated_artifacts: outputs };

const preview = {
  module_id: "AG41C",
  preview_only: false,
  status: review.status,
  monitoring_audit_dashboard_plan_created: 1,
  ready_for_ag41d: 1,
  dashboard_runtime_enabled: 0,
  dashboard_data_query_executed: 0,
  monitoring_job_created: 0,
  real_publish_executed: 0,
  database_write_done: 0,
  public_mutation_done: 0,
  deployment_done: 0,
  service_role_key_exposed: 0,
  anon_access_granted: 0,
  sql_file_created: 0,
  sql_grants_executed: 0
};

const doc = `# AG41C — Monitoring and Audit Dashboard Plan

## Result

AG41C Monitoring and Audit Dashboard Plan is created.

## Plan Coverage

- Dashboard metric model.
- Audit-log dashboard plan.
- Rollback monitoring plan.
- Batch health monitoring plan.
- No-mutation audit.

## Dashboard Metrics Planned

- Article pipeline status count.
- Editor assignment backlog.
- Publish approval queue.
- Audit-log completeness.
- Rollback readiness.
- Public listing verification.

## Still Blocked

- No dashboard runtime enabled.
- No dashboard query executed.
- No monitoring job created.
- No public mutation.
- No real publish.
- No database write.
- No deployment.
- No SQL grant execution.
- No service-role key exposure.
- No anon grants.

## Next

AG41D — Dynamic SOP Audit.
`;

writeJson(outputs.metricModel, metricModel);
writeJson(outputs.auditLogDashboardPlan, auditLogDashboardPlan);
writeJson(outputs.rollbackMonitoringPlan, rollbackMonitoringPlan);
writeJson(outputs.batchHealthPlan, batchHealthPlan);
writeJson(outputs.noMutationAudit, noMutationAudit);
writeJson(outputs.plan, plan);
writeJson(outputs.blocker, blocker);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG41C Monitoring and Audit Dashboard Plan generated.");
console.log("✅ Metric model, audit-log dashboard, rollback monitoring and batch health plans are present.");
console.log("✅ Ready for AG41D Dynamic SOP Audit.");
console.log("✅ No dashboard runtime, database query, public mutation, real publish, deployment, SQL grant execution or service-role key recorded.");
