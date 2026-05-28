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
  console.error(`❌ AG39B validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag39a-public-mutation-decision-checkpoint.json",
  "data/content-intelligence/backend-architecture/ag39a-operator-approval-gate-record.json",
  "data/content-intelligence/backend-architecture/ag39a-grant-execution-decision-record.json",
  "data/content-intelligence/backend-architecture/ag39a-execution-scope-decision-record.json",
  "data/content-intelligence/quality-registry/ag39a-controlled-execution-package-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag39a-to-ag39b-controlled-execution-package-boundary.json",

  "data/content-intelligence/quality-reviews/ag39b-controlled-execution-package-planning.json",
  "data/content-intelligence/backend-architecture/ag39b-controlled-execution-package-planning.json",
  "data/content-intelligence/backend-architecture/ag39b-target-execution-package-record.json",
  "data/content-intelligence/backend-architecture/ag39b-grant-instruction-package-record.json",
  "data/content-intelligence/backend-architecture/ag39b-audit-rollback-execution-package-record.json",
  "data/content-intelligence/backend-architecture/ag39b-operator-approval-requirement-record.json",
  "data/content-intelligence/backend-architecture/ag39b-no-execution-audit-register.json",
  "data/content-intelligence/quality-registry/ag39b-controlled-execution-package-blocker-register.json",
  "data/content-intelligence/quality-registry/ag39b-controlled-execution-preflight-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag39b-to-ag39c-controlled-execution-preflight-boundary.json",
  "data/quality/ag39b-controlled-execution-package-planning.json",
  "data/quality/ag39b-controlled-execution-package-planning-preview.json",
  "docs/quality/AG39B_CONTROLLED_EXECUTION_PACKAGE_PLANNING.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const ag39a = readJson("data/content-intelligence/backend-architecture/ag39a-public-mutation-decision-checkpoint.json");
const ag39aReadiness = readJson("data/content-intelligence/quality-registry/ag39a-controlled-execution-package-readiness-record.json");
const ag39aBoundary = readJson("data/content-intelligence/mutation-plans/ag39a-to-ag39b-controlled-execution-package-boundary.json");

const packageRecord = readJson("data/content-intelligence/backend-architecture/ag39b-controlled-execution-package-planning.json");
const target = readJson("data/content-intelligence/backend-architecture/ag39b-target-execution-package-record.json");
const grant = readJson("data/content-intelligence/backend-architecture/ag39b-grant-instruction-package-record.json");
const auditRollback = readJson("data/content-intelligence/backend-architecture/ag39b-audit-rollback-execution-package-record.json");
const approval = readJson("data/content-intelligence/backend-architecture/ag39b-operator-approval-requirement-record.json");
const noExecution = readJson("data/content-intelligence/backend-architecture/ag39b-no-execution-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag39b-controlled-execution-preflight-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag39b-to-ag39c-controlled-execution-preflight-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag39b-controlled-execution-package-planning.json");
const preview = readJson("data/quality/ag39b-controlled-execution-package-planning-preview.json");
const pkg = readJson("package.json");

if (ag39a.status !== "public_mutation_decision_checkpoint_created_ready_for_ag39b_package_planning") fail("AG39A source mismatch.");
if (ag39aReadiness.ready_for_ag39b !== true) fail("AG39A readiness must allow AG39B.");
if (ag39aBoundary.next_stage_id !== "AG39B") fail("AG39A boundary must point to AG39B.");

if (packageRecord.status !== "controlled_execution_package_planning_created_ready_for_ag39c_preflight") fail("Package status mismatch.");
if (packageRecord.package_decision.controlled_execution_package_planning_created !== true) fail("Package planning missing.");
if (packageRecord.package_decision.proceed_to_ag39c_controlled_execution_preflight !== true) fail("AG39C readiness missing.");

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
  if (packageRecord.package_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (target.status !== "target_execution_package_created_no_execution") fail("Target package status mismatch.");
if (target.target_scope.target_mode !== "test_or_non_public_article_only") fail("Target must remain test/non-public.");
if (target.target_scope.real_publish_allowed_in_ag39b !== false) fail("Real publish must remain false.");
if (target.execution_steps_run.length !== 0) fail("No execution steps should run.");

if (grant.status !== "grant_instruction_package_created_no_sql_file_no_execution") fail("Grant package status mismatch.");
if (grant.anon_grants_for_admin_editor_tables.length !== 0) fail("Anon grants must be empty.");
if (grant.write_grants_planned_in_ag39b.length !== 0) fail("Write grants must be empty.");
if (grant.sql_file_created_in_ag39b !== false) fail("SQL file must not be created.");
if (grant.sql_executed_in_ag39b !== false) fail("SQL must not execute.");
if (grant.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");
if (grant.rls_remains_primary_access_control_layer !== true) fail("RLS primary boundary missing.");

if (auditRollback.audit_execution_requirements.audit_log_write_allowed_in_ag39b !== false) fail("Audit write must be false.");
if (auditRollback.rollback_execution_requirements.rollback_write_allowed_in_ag39b !== false) fail("Rollback write must be false.");
if (auditRollback.writes_run.length !== 0) fail("No writes should run.");

if (approval.approval_requirement.explicit_operator_approval_recorded_in_ag39b !== false) fail("No approval must be recorded.");
if (approval.approval_requirement.execution_authorized_now !== false) fail("Execution must not be authorized.");
if (approval.approval_requirement.public_mutation_allowed_now !== false) fail("Public mutation must not be allowed.");

if (noExecution.audit_passed !== true) fail("No-execution audit must pass.");
for (const check of noExecution.checks) {
  if (check.passed !== true) fail(`No-execution check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag39c !== true) fail("AG39C readiness missing.");
if (readiness.next_stage_id !== "AG39C") fail("Next stage must be AG39C.");
if (readiness.allowed_ag39c_mode !== "preflight_only_no_execution_without_explicit_operator_approval") fail("AG39C mode mismatch.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.audit_log_write_allowed_next !== false) fail("Audit write must remain false.");
if (readiness.rollback_write_allowed_next !== false) fail("Rollback write must remain false.");
if (readiness.anon_grants_allowed_next !== false) fail("Anon grants must remain false.");
if (readiness.sql_grants_allowed_next_without_approval !== false) fail("SQL grants must remain false.");

if (boundary.next_stage_id !== "AG39C") fail("Boundary must point to AG39C.");
if (review.summary.ready_for_ag39c_preflight !== true) fail("Review AG39C readiness missing.");
if (preview.ready_for_ag39c_preflight !== 1) fail("Preview AG39C readiness missing.");
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

if (!pkg.scripts?.["generate:ag39b"]) fail("Missing generate:ag39b script.");
if (!pkg.scripts?.["validate:ag39b"]) fail("Missing validate:ag39b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag39b")) {
  fail("validate:project must include validate:ag39b.");
}

pass("AG39B Controlled Execution Package Planning is present.");
pass("Target, grant instruction, audit/rollback and approval packages are valid.");
pass("No-execution audit is valid.");
pass("AG39C Controlled Execution Preflight readiness is valid.");
pass("No public mutation, real publish, database write, deployment, SQL grant execution or service-role key is recorded.");
