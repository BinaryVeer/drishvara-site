import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
function fail(msg) { console.error(`❌ AG41D validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag41a-dynamic-publishing-sop.json",
  "data/content-intelligence/backend-architecture/ag41a-role-gate-model.json",
  "data/content-intelligence/backend-architecture/ag41a-publishing-workflow-sop.json",
  "data/content-intelligence/backend-architecture/ag41a-audit-rollback-sop.json",
  "data/content-intelligence/backend-architecture/ag41a-security-and-grant-sop.json",
  "data/content-intelligence/backend-architecture/ag41a-no-mutation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag41b-batch-dynamic-publishing-plan.json",
  "data/content-intelligence/backend-architecture/ag41b-batch-candidate-selection-policy.json",
  "data/content-intelligence/backend-architecture/ag41b-batch-risk-control-plan.json",
  "data/content-intelligence/backend-architecture/ag41b-no-mutation-audit-register.json",
  "data/content-intelligence/backend-architecture/ag41c-monitoring-audit-dashboard-plan.json",
  "data/content-intelligence/backend-architecture/ag41c-dashboard-metric-model.json",
  "data/content-intelligence/backend-architecture/ag41c-audit-log-dashboard-plan.json",
  "data/content-intelligence/backend-architecture/ag41c-rollback-monitoring-plan.json",
  "data/content-intelligence/backend-architecture/ag41c-batch-health-monitoring-plan.json",
  "data/content-intelligence/backend-architecture/ag41c-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag41c-dynamic-sop-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag41c-to-ag41d-dynamic-sop-audit-boundary.json",

  "data/content-intelligence/quality-reviews/ag41d-dynamic-sop-audit.json",
  "data/content-intelligence/backend-architecture/ag41d-dynamic-sop-audit.json",
  "data/content-intelligence/backend-architecture/ag41d-sop-chain-audit-register.json",
  "data/content-intelligence/backend-architecture/ag41d-governance-completeness-audit-register.json",
  "data/content-intelligence/backend-architecture/ag41d-monitoring-plan-audit-register.json",
  "data/content-intelligence/backend-architecture/ag41d-no-mutation-continuity-audit-register.json",
  "data/content-intelligence/quality-registry/ag41d-dynamic-sop-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag41d-dynamic-publishing-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag41d-to-ag41z-dynamic-publishing-closure-boundary.json",
  "data/quality/ag41d-dynamic-sop-audit.json",
  "data/quality/ag41d-dynamic-sop-audit-preview.json",
  "docs/quality/AG41D_DYNAMIC_SOP_AUDIT.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag41cReady = readJson("data/content-intelligence/quality-registry/ag41c-dynamic-sop-audit-readiness-record.json");
const ag41cBoundary = readJson("data/content-intelligence/mutation-plans/ag41c-to-ag41d-dynamic-sop-audit-boundary.json");

const audit = readJson("data/content-intelligence/backend-architecture/ag41d-dynamic-sop-audit.json");
const chain = readJson("data/content-intelligence/backend-architecture/ag41d-sop-chain-audit-register.json");
const governance = readJson("data/content-intelligence/backend-architecture/ag41d-governance-completeness-audit-register.json");
const monitoring = readJson("data/content-intelligence/backend-architecture/ag41d-monitoring-plan-audit-register.json");
const noMutation = readJson("data/content-intelligence/backend-architecture/ag41d-no-mutation-continuity-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag41d-dynamic-publishing-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag41d-to-ag41z-dynamic-publishing-closure-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag41d-dynamic-sop-audit.json");
const preview = readJson("data/quality/ag41d-dynamic-sop-audit-preview.json");
const packageJson = readJson("package.json");

if (ag41cReady.ready_for_ag41d !== true) fail("AG41C readiness must allow AG41D.");
if (ag41cBoundary.next_stage_id !== "AG41D") fail("AG41C boundary must point to AG41D.");

if (chain.all_chain_items_passed !== true) fail("SOP chain audit must pass.");
if (chain.chain_length !== 3) fail("SOP chain length must be 3.");

for (const item of [governance, monitoring, noMutation]) {
  if (item.audit_passed !== true) fail(`${item.title} must pass.`);
  for (const check of item.checks) {
    if (check.passed !== true) fail(`${item.title} check failed: ${check.check_id}`);
  }
}

if (audit.status !== "dynamic_sop_audit_created_ready_for_ag41z_closure") fail("Audit status mismatch.");
if (audit.audit_decision.all_audits_passed !== true) fail("All audits must pass.");
if (audit.audit_decision.proceed_to_ag41z_dynamic_publishing_closure !== true) fail("AG41Z readiness missing.");

for (const flag of [
  "batch_execution_authorized_now",
  "batch_publish_executed",
  "dashboard_runtime_enabled",
  "dashboard_data_query_executed",
  "monitoring_job_created",
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
  if (audit.audit_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (readiness.ready_for_ag41z !== true) fail("AG41Z readiness missing.");
if (readiness.next_stage_id !== "AG41Z") fail("Next stage must be AG41Z.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG41Z") fail("Boundary must point to AG41Z.");
if (review.summary.ready_for_ag41z !== true) fail("Review AG41Z readiness missing.");
if (preview.ready_for_ag41z !== 1) fail("Preview AG41Z readiness missing.");
if (preview.batch_execution_authorized_now !== 0) fail("Preview batch execution must be 0.");
if (preview.dashboard_runtime_enabled !== 0) fail("Preview dashboard runtime must be 0.");
if (preview.dashboard_data_query_executed !== 0) fail("Preview dashboard query must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!packageJson.scripts?.["generate:ag41d"]) fail("Missing generate:ag41d script.");
if (!packageJson.scripts?.["validate:ag41d"]) fail("Missing validate:ag41d script.");
if (!packageJson.scripts?.["validate:project"]?.includes("npm run validate:ag41d")) {
  fail("validate:project must include validate:ag41d.");
}

pass("AG41D Dynamic SOP Audit is present.");
pass("AG41A-AG41C SOP, batch and monitoring chain audits are valid.");
pass("No-mutation continuity audit is valid.");
pass("AG41Z Dynamic Publishing Closure readiness is valid.");
pass("No batch execution, dashboard runtime, database query, public mutation, real publish, deployment, SQL grant execution or service-role key is recorded.");
