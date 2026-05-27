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
  console.error(`❌ AG38D validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag38c-controlled-apply-preflight.json",
  "data/content-intelligence/backend-architecture/ag38c-explicit-grant-preflight-record.json",
  "data/content-intelligence/backend-architecture/ag38c-operator-approval-preflight-record.json",
  "data/content-intelligence/backend-architecture/ag38c-no-execution-audit-register.json",
  "data/content-intelligence/quality-registry/ag38c-controlled-apply-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag38c-to-ag38d-controlled-apply-audit-boundary.json",

  "data/content-intelligence/quality-reviews/ag38d-controlled-apply-audit.json",
  "data/content-intelligence/backend-architecture/ag38d-controlled-apply-audit.json",
  "data/content-intelligence/backend-architecture/ag38d-preflight-chain-audit-register.json",
  "data/content-intelligence/backend-architecture/ag38d-explicit-grant-security-audit-register.json",
  "data/content-intelligence/backend-architecture/ag38d-operator-approval-gate-audit-register.json",
  "data/content-intelligence/backend-architecture/ag38d-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag38d-controlled-apply-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag38d-controlled-apply-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag38d-to-ag38z-controlled-apply-closure-boundary.json",
  "data/quality/ag38d-controlled-apply-audit.json",
  "data/quality/ag38d-controlled-apply-audit-preview.json",
  "docs/quality/AG38D_CONTROLLED_APPLY_AUDIT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const ag38c = readJson("data/content-intelligence/backend-architecture/ag38c-controlled-apply-preflight.json");
const ag38cReadiness = readJson("data/content-intelligence/quality-registry/ag38c-controlled-apply-audit-readiness-record.json");
const ag38cBoundary = readJson("data/content-intelligence/mutation-plans/ag38c-to-ag38d-controlled-apply-audit-boundary.json");

const audit = readJson("data/content-intelligence/backend-architecture/ag38d-controlled-apply-audit.json");
const chainAudit = readJson("data/content-intelligence/backend-architecture/ag38d-preflight-chain-audit-register.json");
const grantAudit = readJson("data/content-intelligence/backend-architecture/ag38d-explicit-grant-security-audit-register.json");
const approvalAudit = readJson("data/content-intelligence/backend-architecture/ag38d-operator-approval-gate-audit-register.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag38d-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag38d-controlled-apply-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag38d-to-ag38z-controlled-apply-closure-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag38d-controlled-apply-audit.json");
const preview = readJson("data/quality/ag38d-controlled-apply-audit-preview.json");
const pkg = readJson("package.json");

if (ag38c.status !== "controlled_apply_preflight_created_ready_for_ag38d_audit") fail("AG38C source mismatch.");
if (ag38cReadiness.ready_for_ag38d !== true) fail("AG38C readiness must allow AG38D.");
if (ag38cBoundary.next_stage_id !== "AG38D") fail("AG38C boundary must point to AG38D.");

if (chainAudit.all_chain_items_passed !== true) fail("Preflight chain audit must pass.");
if (chainAudit.chain_length !== 3) fail("Preflight chain length must be 3.");

for (const item of [grantAudit, approvalAudit, noMutationAudit]) {
  if (item.audit_passed !== true) fail(`${item.title} must pass.`);
  for (const check of item.checks) {
    if (check.passed !== true) fail(`${item.title} check failed: ${check.check_id}`);
  }
}

if (audit.status !== "controlled_apply_audit_created_ready_for_ag38z_closure") fail("Audit status mismatch.");
if (audit.audit_decision.all_audits_passed !== true) fail("All audits must pass.");
if (audit.audit_decision.proceed_to_ag38z_controlled_apply_closure !== true) fail("AG38Z readiness missing.");

for (const flag of [
  "explicit_operator_approval_recorded",
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
  "sql_grants_executed"
]) {
  if (audit.audit_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (readiness.ready_for_ag38z !== true) fail("AG38Z readiness missing.");
if (readiness.next_stage_id !== "AG38Z") fail("Next stage must be AG38Z.");
if (readiness.allowed_ag38z_mode !== "closure_only_no_real_apply_without_explicit_operator_approval") fail("AG38Z mode mismatch.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.audit_log_write_allowed_next !== false) fail("Audit write must remain false.");
if (readiness.rollback_write_allowed_next !== false) fail("Rollback write must remain false.");
if (readiness.anon_grants_allowed_next !== false) fail("Anon grants must remain false.");
if (readiness.sql_grants_allowed_next_without_approval !== false) fail("SQL grants must remain false.");

if (boundary.next_stage_id !== "AG38Z") fail("Boundary must point to AG38Z.");
if (review.summary.ready_for_ag38z_closure !== true) fail("Review AG38Z readiness missing.");
if (preview.ready_for_ag38z_closure !== 1) fail("Preview AG38Z readiness missing.");
if (preview.explicit_operator_approval_recorded !== 0) fail("Preview approval must be 0.");
if (preview.real_apply_approved_now !== 0) fail("Preview real apply must be 0.");
if (preview.real_publish_executed !== 0) fail("Preview real publish must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");
if (preview.anon_access_granted !== 0) fail("Preview anon grant must be 0.");
if (preview.sql_grants_executed !== 0) fail("Preview SQL execution must be 0.");

if (!pkg.scripts?.["generate:ag38d"]) fail("Missing generate:ag38d script.");
if (!pkg.scripts?.["validate:ag38d"]) fail("Missing validate:ag38d script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag38d")) {
  fail("validate:project must include validate:ag38d.");
}

pass("AG38D Controlled Apply Audit is present.");
pass("Preflight chain, grant security, approval gate and no-mutation audits are valid.");
pass("AG38Z Controlled Apply Closure readiness is valid.");
pass("No real publish, database write, public mutation, deployment, SQL grant execution or service-role key is recorded.");
