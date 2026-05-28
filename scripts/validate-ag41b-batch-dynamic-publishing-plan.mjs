import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
function fail(msg) { console.error(`❌ AG41B validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag41a-dynamic-publishing-sop.json",
  "data/content-intelligence/backend-architecture/ag41a-role-gate-model.json",
  "data/content-intelligence/backend-architecture/ag41a-publishing-workflow-sop.json",
  "data/content-intelligence/backend-architecture/ag41a-audit-rollback-sop.json",
  "data/content-intelligence/backend-architecture/ag41a-security-and-grant-sop.json",
  "data/content-intelligence/backend-architecture/ag41a-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag41a-batch-dynamic-publishing-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag41a-to-ag41b-batch-dynamic-publishing-plan-boundary.json",

  "data/content-intelligence/quality-reviews/ag41b-batch-dynamic-publishing-plan.json",
  "data/content-intelligence/backend-architecture/ag41b-batch-dynamic-publishing-plan.json",
  "data/content-intelligence/backend-architecture/ag41b-batch-candidate-selection-policy.json",
  "data/content-intelligence/backend-architecture/ag41b-batch-risk-control-plan.json",
  "data/content-intelligence/backend-architecture/ag41b-batch-validation-plan.json",
  "data/content-intelligence/backend-architecture/ag41b-batch-rollout-schedule-plan.json",
  "data/content-intelligence/backend-architecture/ag41b-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag41b-batch-dynamic-publishing-plan-blocker-register.json",
  "data/content-intelligence/quality-registry/ag41b-monitoring-audit-dashboard-plan-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag41b-to-ag41c-monitoring-audit-dashboard-plan-boundary.json",
  "data/quality/ag41b-batch-dynamic-publishing-plan.json",
  "data/quality/ag41b-batch-dynamic-publishing-plan-preview.json",
  "docs/quality/AG41B_BATCH_DYNAMIC_PUBLISHING_PLAN.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag41a = readJson("data/content-intelligence/backend-architecture/ag41a-dynamic-publishing-sop.json");
const ag41aNoMutation = readJson("data/content-intelligence/backend-architecture/ag41a-no-mutation-audit-register.json");
const ag41aReady = readJson("data/content-intelligence/quality-registry/ag41a-batch-dynamic-publishing-plan-readiness-record.json");
const ag41aBoundary = readJson("data/content-intelligence/mutation-plans/ag41a-to-ag41b-batch-dynamic-publishing-plan-boundary.json");

const plan = readJson("data/content-intelligence/backend-architecture/ag41b-batch-dynamic-publishing-plan.json");
const candidate = readJson("data/content-intelligence/backend-architecture/ag41b-batch-candidate-selection-policy.json");
const risk = readJson("data/content-intelligence/backend-architecture/ag41b-batch-risk-control-plan.json");
const validation = readJson("data/content-intelligence/backend-architecture/ag41b-batch-validation-plan.json");
const rollout = readJson("data/content-intelligence/backend-architecture/ag41b-batch-rollout-schedule-plan.json");
const noMutation = readJson("data/content-intelligence/backend-architecture/ag41b-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag41b-monitoring-audit-dashboard-plan-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag41b-to-ag41c-monitoring-audit-dashboard-plan-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag41b-batch-dynamic-publishing-plan.json");
const preview = readJson("data/quality/ag41b-batch-dynamic-publishing-plan-preview.json");
const packageJson = readJson("package.json");

if (ag41a.status !== "dynamic_publishing_sop_created_ready_for_ag41b_batch_plan") fail("AG41A source mismatch.");
if (ag41a.sop_decision.proceed_to_ag41b_batch_dynamic_publishing_plan !== true) fail("AG41A does not permit AG41B.");
if (ag41aNoMutation.audit_passed !== true) fail("AG41A no-mutation audit must pass.");
if (ag41aReady.ready_for_ag41b !== true) fail("AG41A readiness must allow AG41B.");
if (ag41aBoundary.next_stage_id !== "AG41B") fail("AG41A boundary must point to AG41B.");

if (plan.status !== "batch_dynamic_publishing_plan_created_ready_for_ag41c_monitoring_dashboard_plan") fail("Plan status mismatch.");
if (plan.plan_decision.batch_dynamic_publishing_plan_created !== true) fail("Batch plan creation missing.");
if (plan.plan_decision.proceed_to_ag41c_monitoring_audit_dashboard_plan !== true) fail("AG41C readiness missing.");

for (const flag of [
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

if (candidate.recommended_initial_batch_size.first_controlled_batch !== 1) fail("First batch size must be 1.");
if (!candidate.candidate_rules.includes("No article may enter batch execution without Admin final approval.")) fail("Admin final approval candidate rule missing.");
if (risk.batch_execution_allowed_in_ag41b !== false) fail("Batch execution must not be allowed.");
if (validation.validation_executed_in_ag41b !== false) fail("Validation must be planned only, not executed.");
for (const phase of rollout.rollout_phases) {
  if (phase.execution_allowed_in_ag41b !== false) fail(`Rollout phase execution must be false: ${phase.phase_id}`);
}

if (noMutation.audit_passed !== true) fail("No-mutation audit must pass.");
for (const check of noMutation.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag41c !== true) fail("AG41C readiness missing.");
if (readiness.next_stage_id !== "AG41C") fail("Next stage must be AG41C.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG41C") fail("Boundary must point to AG41C.");
if (review.summary.ready_for_ag41c !== true) fail("Review AG41C readiness missing.");
if (preview.ready_for_ag41c !== 1) fail("Preview AG41C readiness missing.");
if (preview.batch_execution_authorized_now !== 0) fail("Preview batch execution must be 0.");
if (preview.batch_publish_executed !== 0) fail("Preview batch publish must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!packageJson.scripts?.["generate:ag41b"]) fail("Missing generate:ag41b script.");
if (!packageJson.scripts?.["validate:ag41b"]) fail("Missing validate:ag41b script.");
if (!packageJson.scripts?.["validate:project"]?.includes("npm run validate:ag41b")) {
  fail("validate:project must include validate:ag41b.");
}

pass("AG41B Batch Dynamic Publishing Plan is present.");
pass("Candidate policy, risk controls, validation plan and rollout plan are valid.");
pass("No-mutation audit is valid.");
pass("AG41C Monitoring and Audit Dashboard Plan readiness is valid.");
pass("No batch execution, public mutation, real publish, database write, deployment, SQL grant execution or service-role key is recorded.");
