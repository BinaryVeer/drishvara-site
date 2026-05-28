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
  console.error(`❌ AG39D validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag39c-controlled-execution-preflight.json",
  "data/content-intelligence/backend-architecture/ag39c-grant-instruction-preflight-record.json",
  "data/content-intelligence/backend-architecture/ag39c-operator-approval-preflight-record.json",
  "data/content-intelligence/backend-architecture/ag39c-no-execution-audit-register.json",
  "data/content-intelligence/quality-registry/ag39c-controlled-execution-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag39c-to-ag39d-controlled-execution-audit-boundary.json",

  "data/content-intelligence/quality-reviews/ag39d-controlled-execution-audit.json",
  "data/content-intelligence/backend-architecture/ag39d-controlled-execution-audit.json",
  "data/content-intelligence/backend-architecture/ag39d-preflight-chain-audit-register.json",
  "data/content-intelligence/backend-architecture/ag39d-grant-security-audit-register.json",
  "data/content-intelligence/backend-architecture/ag39d-operator-approval-gate-audit-register.json",
  "data/content-intelligence/backend-architecture/ag39d-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag39d-controlled-execution-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag39d-controlled-execution-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag39d-to-ag39z-controlled-execution-closure-boundary.json",
  "data/quality/ag39d-controlled-execution-audit.json",
  "data/quality/ag39d-controlled-execution-audit-preview.json",
  "docs/quality/AG39D_CONTROLLED_EXECUTION_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const ag39c = readJson("data/content-intelligence/backend-architecture/ag39c-controlled-execution-preflight.json");
const ag39cReadiness = readJson("data/content-intelligence/quality-registry/ag39c-controlled-execution-audit-readiness-record.json");
const ag39cBoundary = readJson("data/content-intelligence/mutation-plans/ag39c-to-ag39d-controlled-execution-audit-boundary.json");

const audit = readJson("data/content-intelligence/backend-architecture/ag39d-controlled-execution-audit.json");
const chainAudit = readJson("data/content-intelligence/backend-architecture/ag39d-preflight-chain-audit-register.json");
const grantAudit = readJson("data/content-intelligence/backend-architecture/ag39d-grant-security-audit-register.json");
const approvalAudit = readJson("data/content-intelligence/backend-architecture/ag39d-operator-approval-gate-audit-register.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag39d-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag39d-controlled-execution-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag39d-to-ag39z-controlled-execution-closure-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag39d-controlled-execution-audit.json");
const preview = readJson("data/quality/ag39d-controlled-execution-audit-preview.json");
const pkg = readJson("package.json");

if (ag39c.status !== "controlled_execution_preflight_created_ready_for_ag39d_audit") fail("AG39C source mismatch.");
if (ag39cReadiness.ready_for_ag39d !== true) fail("AG39C readiness must allow AG39D.");
if (ag39cBoundary.next_stage_id !== "AG39D") fail("AG39C boundary must point to AG39D.");

if (chainAudit.all_chain_items_passed !== true) fail("Preflight chain audit must pass.");
if (chainAudit.chain_length !== 3) fail("Preflight chain length must be 3.");

for (const item of [grantAudit, approvalAudit, noMutationAudit]) {
  if (item.audit_passed !== true) fail(`${item.title} must pass.`);
  for (const check of item.checks) {
    if (check.passed !== true) fail(`${item.title} check failed: ${check.check_id}`);
  }
}

if (audit.status !== "controlled_execution_audit_created_ready_for_ag39z_closure") fail("Audit status mismatch.");
if (audit.audit_decision.all_audits_passed !== true) fail("All audits must pass.");
if (audit.audit_decision.proceed_to_ag39z_controlled_execution_closure !== true) fail("AG39Z readiness missing.");

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
  if (audit.audit_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (readiness.ready_for_ag39z !== true) fail("AG39Z readiness missing.");
if (readiness.next_stage_id !== "AG39Z") fail("Next stage must be AG39Z.");
if (readiness.allowed_ag39z_mode !== "closure_only_no_execution_without_explicit_operator_approval") fail("AG39Z mode mismatch.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.audit_log_write_allowed_next !== false) fail("Audit write must remain false.");
if (readiness.rollback_write_allowed_next !== false) fail("Rollback write must remain false.");
if (readiness.anon_grants_allowed_next !== false) fail("Anon grants must remain false.");
if (readiness.sql_grants_allowed_next_without_approval !== false) fail("SQL grants must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG39Z") fail("Boundary must point to AG39Z.");
if (review.summary.ready_for_ag39z_closure !== true) fail("Review AG39Z readiness missing.");
if (preview.ready_for_ag39z_closure !== 1) fail("Preview AG39Z readiness missing.");
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

if (!pkg.scripts?.["generate:ag39d"]) fail("Missing generate:ag39d script.");
if (!pkg.scripts?.["validate:ag39d"]) fail("Missing validate:ag39d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag39d")) {
  fail("validate:project must include validate:ag39d.");
}

pass("AG39D Controlled Execution Audit is present.");
pass("Preflight chain, grant security, approval gate and no-mutation audits are valid.");
pass("AG39Z Controlled Execution Closure readiness is valid.");
pass("No public mutation, real publish, database write, deployment, SQL grant execution or service-role key is recorded.");
