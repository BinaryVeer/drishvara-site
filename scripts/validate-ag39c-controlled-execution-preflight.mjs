import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function fail(msg) {
  console.error(`❌ AG39C validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag39b-controlled-execution-package-planning.json",
  "data/content-intelligence/backend-architecture/ag39b-target-execution-package-record.json",
  "data/content-intelligence/backend-architecture/ag39b-grant-instruction-package-record.json",
  "data/content-intelligence/backend-architecture/ag39b-audit-rollback-execution-package-record.json",
  "data/content-intelligence/backend-architecture/ag39b-operator-approval-requirement-record.json",
  "data/content-intelligence/backend-architecture/ag39b-no-execution-audit-register.json",
  "data/content-intelligence/quality-registry/ag39b-controlled-execution-preflight-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag39b-to-ag39c-controlled-execution-preflight-boundary.json",

  "data/content-intelligence/quality-reviews/ag39c-controlled-execution-preflight.json",
  "data/content-intelligence/backend-architecture/ag39c-controlled-execution-preflight.json",
  "data/content-intelligence/backend-architecture/ag39c-target-execution-preflight-record.json",
  "data/content-intelligence/backend-architecture/ag39c-grant-instruction-preflight-record.json",
  "data/content-intelligence/backend-architecture/ag39c-audit-rollback-execution-preflight-record.json",
  "data/content-intelligence/backend-architecture/ag39c-operator-approval-preflight-record.json",
  "data/content-intelligence/backend-architecture/ag39c-no-execution-audit-register.json",
  "data/content-intelligence/quality-registry/ag39c-controlled-execution-preflight-blocker-register.json",
  "data/content-intelligence/quality-registry/ag39c-controlled-execution-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag39c-to-ag39d-controlled-execution-audit-boundary.json",
  "data/quality/ag39c-controlled-execution-preflight.json",
  "data/quality/ag39c-controlled-execution-preflight-preview.json",
  "docs/quality/AG39C_CONTROLLED_EXECUTION_PREFLIGHT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const ag39b = readJson("data/content-intelligence/backend-architecture/ag39b-controlled-execution-package-planning.json");
const ag39bReadiness = readJson("data/content-intelligence/quality-registry/ag39b-controlled-execution-preflight-readiness-record.json");
const ag39bBoundary = readJson("data/content-intelligence/mutation-plans/ag39b-to-ag39c-controlled-execution-preflight-boundary.json");

const preflight = readJson("data/content-intelligence/backend-architecture/ag39c-controlled-execution-preflight.json");
const target = readJson("data/content-intelligence/backend-architecture/ag39c-target-execution-preflight-record.json");
const grant = readJson("data/content-intelligence/backend-architecture/ag39c-grant-instruction-preflight-record.json");
const auditRollback = readJson("data/content-intelligence/backend-architecture/ag39c-audit-rollback-execution-preflight-record.json");
const approval = readJson("data/content-intelligence/backend-architecture/ag39c-operator-approval-preflight-record.json");
const noExecution = readJson("data/content-intelligence/backend-architecture/ag39c-no-execution-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag39c-controlled-execution-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag39c-to-ag39d-controlled-execution-audit-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag39c-controlled-execution-preflight.json");
const preview = readJson("data/quality/ag39c-controlled-execution-preflight-preview.json");
const pkg = readJson("package.json");

if (ag39b.status !== "controlled_execution_package_planning_created_ready_for_ag39c_preflight") fail("AG39B source mismatch.");
if (ag39bReadiness.ready_for_ag39c !== true) fail("AG39B readiness must allow AG39C.");
if (ag39bBoundary.next_stage_id !== "AG39C") fail("AG39B boundary must point to AG39C.");

if (preflight.status !== "controlled_execution_preflight_created_ready_for_ag39d_audit") fail("Preflight status mismatch.");
if (preflight.preflight_decision.controlled_execution_preflight_created !== true) fail("Preflight created missing.");
if (preflight.preflight_decision.proceed_to_ag39d_controlled_execution_audit !== true) fail("AG39D readiness missing.");

for (const flag of [
  "explicit_operator_approval_recorded",
  "public_mutation_approved_now",
  "execution_authorized_now",
  "real_apply_approved_now",
  "real_publish_executed",
  "actual_queue_state_changed",
  "audit_log_write_done",
  "rollback_write_done",
  "database_write_done",
  "public_article_mutated",
  "deployment_done",
  "public_mutation_done",
  "dynamic_publish_runtime_enabled",
  "service_role_key_recorded",
  "service_role_key_exposed",
  "anon_access_granted",
  "write_grants_executed",
  "sql_file_created",
  "sql_grants_executed"
]) {
  if (preflight.preflight_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const record of [target, grant, auditRollback]) {
  if (record.preflight_passed !== true) fail(`${record.title} must pass.`);
  for (const check of record.preflight_checks) {
    if (check.passed !== true) fail(`${record.title} check failed: ${check.check_id}`);
  }
}

if (grant.sql_file_created_in_ag39c !== false) fail("SQL file must not be created.");
if (grant.sql_executed_in_ag39c !== false) fail("SQL must not execute.");

if (approval.approval_result.explicit_operator_approval_recorded !== false) fail("No approval must be recorded.");
if (approval.approval_result.execution_authorized_now !== false) fail("Execution must not be authorized.");
if (approval.approval_result.public_mutation_allowed_now !== false) fail("Public mutation must not be allowed.");
if (approval.approval_result.database_write_allowed_now !== false) fail("Database write must not be allowed.");

if (noExecution.audit_passed !== true) fail("No-execution audit must pass.");
for (const check of noExecution.checks) {
  if (check.passed !== true) fail(`No-execution check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag39d !== true) fail("AG39D readiness missing.");
if (readiness.next_stage_id !== "AG39D") fail("Next stage must be AG39D.");
if (readiness.allowed_ag39d_mode !== "audit_only_no_execution_without_explicit_operator_approval") fail("AG39D mode mismatch.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.audit_log_write_allowed_next !== false) fail("Audit write must remain false.");
if (readiness.rollback_write_allowed_next !== false) fail("Rollback write must remain false.");
if (readiness.anon_grants_allowed_next !== false) fail("Anon grants must remain false.");
if (readiness.sql_grants_allowed_next_without_approval !== false) fail("SQL grants must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG39D") fail("Boundary must point to AG39D.");
if (review.summary.ready_for_ag39d_audit !== true) fail("Review AG39D readiness missing.");
if (preview.ready_for_ag39d_audit !== 1) fail("Preview AG39D readiness missing.");
if (preview.explicit_operator_approval_recorded !== 0) fail("Preview approval must be 0.");
if (preview.execution_authorized_now !== 0) fail("Preview execution authorization must be 0.");
if (preview.public_mutation_approved_now !== 0) fail("Preview public mutation approval must be 0.");
if (preview.real_publish_executed !== 0) fail("Preview real publish must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");
if (preview.anon_access_granted !== 0) fail("Preview anon grant must be 0.");
if (preview.sql_file_created !== 0) fail("Preview SQL file must be 0.");
if (preview.sql_grants_executed !== 0) fail("Preview SQL execution must be 0.");

if (!pkg.scripts?.["generate:ag39c"]) fail("Missing generate:ag39c script.");
if (!pkg.scripts?.["validate:ag39c"]) fail("Missing validate:ag39c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag39c")) {
  fail("validate:project must include validate:ag39c.");
}

pass("AG39C Controlled Execution Preflight is present.");
pass("Target, grant instruction, audit/rollback and approval preflights are valid.");
pass("No-execution audit is valid.");
pass("AG39D Controlled Execution Audit readiness is valid.");
pass("No public mutation, real publish, database write, deployment, SQL grant execution or service-role key is recorded.");
