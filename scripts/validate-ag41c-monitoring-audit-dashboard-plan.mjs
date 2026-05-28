import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
function fail(msg) { console.error(`❌ AG41C validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag41b-batch-dynamic-publishing-plan.json",
  "data/content-intelligence/backend-architecture/ag41b-batch-candidate-selection-policy.json",
  "data/content-intelligence/backend-architecture/ag41b-batch-risk-control-plan.json",
  "data/content-intelligence/backend-architecture/ag41b-batch-validation-plan.json",
  "data/content-intelligence/backend-architecture/ag41b-batch-rollout-schedule-plan.json",
  "data/content-intelligence/backend-architecture/ag41b-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag41b-monitoring-audit-dashboard-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag41b-to-ag41c-monitoring-audit-dashboard-plan-boundary.json",

  "data/content-intelligence/quality-reviews/ag41c-monitoring-audit-dashboard-plan.json",
  "data/content-intelligence/backend-architecture/ag41c-monitoring-audit-dashboard-plan.json",
  "data/content-intelligence/backend-architecture/ag41c-dashboard-metric-model.json",
  "data/content-intelligence/backend-architecture/ag41c-audit-log-dashboard-plan.json",
  "data/content-intelligence/backend-architecture/ag41c-rollback-monitoring-plan.json",
  "data/content-intelligence/backend-architecture/ag41c-batch-health-monitoring-plan.json",
  "data/content-intelligence/backend-architecture/ag41c-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag41c-monitoring-audit-dashboard-plan-blocker-register.json",
  "data/content-intelligence/quality-registry/ag41c-dynamic-sop-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag41c-to-ag41d-dynamic-sop-audit-boundary.json",
  "data/quality/ag41c-monitoring-audit-dashboard-plan.json",
  "data/quality/ag41c-monitoring-audit-dashboard-plan-preview.json",
  "docs/quality/AG41C_MONITORING_AUDIT_DASHBOARD_PLAN.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag41b = readJson("data/content-intelligence/backend-architecture/ag41b-batch-dynamic-publishing-plan.json");
const ag41bNoMutation = readJson("data/content-intelligence/backend-architecture/ag41b-no-mutation-audit-register.json");
const ag41bReady = readJson("data/content-intelligence/quality-registry/ag41b-monitoring-audit-dashboard-plan-readiness-record.json");
const ag41bBoundary = readJson("data/content-intelligence/mutation-plans/ag41b-to-ag41c-monitoring-audit-dashboard-plan-boundary.json");

const plan = readJson("data/content-intelligence/backend-architecture/ag41c-monitoring-audit-dashboard-plan.json");
const metrics = readJson("data/content-intelligence/backend-architecture/ag41c-dashboard-metric-model.json");
const auditLog = readJson("data/content-intelligence/backend-architecture/ag41c-audit-log-dashboard-plan.json");
const rollback = readJson("data/content-intelligence/backend-architecture/ag41c-rollback-monitoring-plan.json");
const batchHealth = readJson("data/content-intelligence/backend-architecture/ag41c-batch-health-monitoring-plan.json");
const noMutation = readJson("data/content-intelligence/backend-architecture/ag41c-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag41c-dynamic-sop-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag41c-to-ag41d-dynamic-sop-audit-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag41c-monitoring-audit-dashboard-plan.json");
const preview = readJson("data/quality/ag41c-monitoring-audit-dashboard-plan-preview.json");
const packageJson = readJson("package.json");

if (ag41b.status !== "batch_dynamic_publishing_plan_created_ready_for_ag41c_monitoring_dashboard_plan") fail("AG41B source mismatch.");
if (ag41b.plan_decision.proceed_to_ag41c_monitoring_audit_dashboard_plan !== true) fail("AG41B does not permit AG41C.");
if (ag41bNoMutation.audit_passed !== true) fail("AG41B no-mutation audit must pass.");
if (ag41bReady.ready_for_ag41c !== true) fail("AG41B readiness must allow AG41C.");
if (ag41bBoundary.next_stage_id !== "AG41C") fail("AG41B boundary must point to AG41C.");

if (plan.status !== "monitoring_audit_dashboard_plan_created_ready_for_ag41d_dynamic_sop_audit") fail("Plan status mismatch.");
if (plan.plan_decision.monitoring_audit_dashboard_plan_created !== true) fail("Monitoring plan creation missing.");
if (plan.plan_decision.proceed_to_ag41d_dynamic_sop_audit !== true) fail("AG41D readiness missing.");

for (const flag of [
  "dashboard_runtime_enabled",
  "dashboard_ui_created_now",
  "dashboard_data_query_executed",
  "monitoring_job_created",
  "batch_execution_authorized_now",
  "batch_publish_executed",
  "real_publish_executed",
  "database_write_done",
  "audit_log_write_done",
  "rollback_write_done",
  "public_article_mutated",
  "deployment_done",
  "public_mutation_done",
  "dynamic_publish_runtime_enabled",
  "service_role_key_recorded",
  "service_role_key_exposed",
  "anon_access_granted",
  "sql_file_created",
  "sql_grants_executed"
]) {
  if (plan.plan_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (metrics.dashboard_metrics.length < 6) fail("Dashboard metric model must include at least six metrics.");
if (metrics.dashboard_runtime_enabled_in_ag41c !== false) fail("Dashboard runtime must be false.");
for (const metric of metrics.dashboard_metrics) {
  if (metric.runtime_query_executed_in_ag41c !== false) fail(`Metric query must not execute: ${metric.metric_id}`);
}

if (auditLog.audit_dashboard_runtime_enabled_in_ag41c !== false) fail("Audit dashboard runtime must be false.");
if (auditLog.audit_log_query_executed_in_ag41c !== false) fail("Audit log query must not execute.");

if (rollback.rollback_runtime_enabled_in_ag41c !== false) fail("Rollback runtime must be false.");
if (rollback.rollback_write_executed_in_ag41c !== false) fail("Rollback write must not execute.");

if (batchHealth.dashboard_data_query_executed_in_ag41c !== false) fail("Batch health dashboard query must not execute.");
if (batchHealth.monitoring_job_created_in_ag41c !== false) fail("Monitoring job must not be created.");

if (noMutation.audit_passed !== true) fail("No-mutation audit must pass.");
for (const check of noMutation.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag41d !== true) fail("AG41D readiness missing.");
if (readiness.next_stage_id !== "AG41D") fail("Next stage must be AG41D.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG41D") fail("Boundary must point to AG41D.");
if (review.summary.ready_for_ag41d !== true) fail("Review AG41D readiness missing.");
if (preview.ready_for_ag41d !== 1) fail("Preview AG41D readiness missing.");
if (preview.dashboard_runtime_enabled !== 0) fail("Preview dashboard runtime must be 0.");
if (preview.dashboard_data_query_executed !== 0) fail("Preview dashboard query must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!packageJson.scripts?.["generate:ag41c"]) fail("Missing generate:ag41c script.");
if (!packageJson.scripts?.["validate:ag41c"]) fail("Missing validate:ag41c script.");
if (!packageJson.scripts?.["validate:project"]?.includes("npm run validate:ag41c")) {
  fail("validate:project must include validate:ag41c.");
}

pass("AG41C Monitoring and Audit Dashboard Plan is present.");
pass("Dashboard metric model, audit-log dashboard, rollback monitoring and batch health plans are valid.");
pass("No-mutation audit is valid.");
pass("AG41D Dynamic SOP Audit readiness is valid.");
pass("No dashboard runtime, database query, public mutation, real publish, deployment, SQL grant execution or service-role key is recorded.");
