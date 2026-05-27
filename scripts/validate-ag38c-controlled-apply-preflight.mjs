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
  console.error(`❌ AG38C validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag38b-controlled-apply-package-planning.json",
  "data/content-intelligence/backend-architecture/ag38b-test-non-public-article-target-plan.json",
  "data/content-intelligence/backend-architecture/ag38b-supabase-explicit-grant-plan.json",
  "data/content-intelligence/backend-architecture/ag38b-audit-rollback-plan.json",
  "data/content-intelligence/backend-architecture/ag38b-no-execution-audit-register.json",
  "data/content-intelligence/quality-registry/ag38b-controlled-apply-preflight-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag38b-to-ag38c-controlled-apply-preflight-boundary.json",

  "data/content-intelligence/quality-reviews/ag38c-controlled-apply-preflight.json",
  "data/content-intelligence/backend-architecture/ag38c-controlled-apply-preflight.json",
  "data/content-intelligence/backend-architecture/ag38c-target-candidate-preflight-record.json",
  "data/content-intelligence/backend-architecture/ag38c-explicit-grant-preflight-record.json",
  "data/content-intelligence/backend-architecture/ag38c-audit-rollback-preflight-record.json",
  "data/content-intelligence/backend-architecture/ag38c-operator-approval-preflight-record.json",
  "data/content-intelligence/backend-architecture/ag38c-no-execution-audit-register.json",
  "data/content-intelligence/quality-registry/ag38c-controlled-apply-preflight-blocker-register.json",
  "data/content-intelligence/quality-registry/ag38c-controlled-apply-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag38c-to-ag38d-controlled-apply-audit-boundary.json",
  "data/quality/ag38c-controlled-apply-preflight.json",
  "data/quality/ag38c-controlled-apply-preflight-preview.json",
  "docs/quality/AG38C_CONTROLLED_APPLY_PREFLIGHT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const ag38b = readJson("data/content-intelligence/backend-architecture/ag38b-controlled-apply-package-planning.json");
const ag38bReadiness = readJson("data/content-intelligence/quality-registry/ag38b-controlled-apply-preflight-readiness-record.json");
const ag38bBoundary = readJson("data/content-intelligence/mutation-plans/ag38b-to-ag38c-controlled-apply-preflight-boundary.json");

const preflight = readJson("data/content-intelligence/backend-architecture/ag38c-controlled-apply-preflight.json");
const target = readJson("data/content-intelligence/backend-architecture/ag38c-target-candidate-preflight-record.json");
const grant = readJson("data/content-intelligence/backend-architecture/ag38c-explicit-grant-preflight-record.json");
const auditRollback = readJson("data/content-intelligence/backend-architecture/ag38c-audit-rollback-preflight-record.json");
const approval = readJson("data/content-intelligence/backend-architecture/ag38c-operator-approval-preflight-record.json");
const noExecution = readJson("data/content-intelligence/backend-architecture/ag38c-no-execution-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag38c-controlled-apply-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag38c-to-ag38d-controlled-apply-audit-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag38c-controlled-apply-preflight.json");
const preview = readJson("data/quality/ag38c-controlled-apply-preflight-preview.json");
const pkg = readJson("package.json");

if (ag38b.status !== "controlled_apply_package_planning_created_ready_for_ag38c_preflight") fail("AG38B source mismatch.");
if (ag38bReadiness.ready_for_ag38c !== true) fail("AG38B readiness must allow AG38C.");
if (ag38bBoundary.next_stage_id !== "AG38C") fail("AG38B boundary must point to AG38C.");

if (preflight.status !== "controlled_apply_preflight_created_ready_for_ag38d_audit") fail("Preflight status mismatch.");
if (preflight.preflight_decision.controlled_apply_preflight_created !== true) fail("Preflight created missing.");
if (preflight.preflight_decision.explicit_grant_preflight_passed !== true) fail("Grant preflight missing.");
if (preflight.preflight_decision.audit_rollback_preflight_passed !== true) fail("Audit/rollback preflight missing.");
if (preflight.preflight_decision.proceed_to_ag38d_controlled_apply_audit !== true) fail("AG38D readiness missing.");

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
  if (preflight.preflight_decision[flag] !== false) fail(`${flag} must be false.`);
}

for (const record of [target, grant, auditRollback]) {
  if (record.preflight_passed !== true) fail(`${record.title} must pass.`);
}

if (grant.sql_file_created_in_ag38c !== false) fail("SQL file must not be created in AG38C.");
if (grant.sql_executed_in_ag38c !== false) fail("SQL must not execute in AG38C.");
if (grant.anon_grants_planned.length !== 0) fail("Anon grants must remain empty.");
if (grant.write_grants_planned_in_ag38c.length !== 0) fail("Write grants must remain empty.");

if (approval.preflight_result.explicit_operator_approval_recorded !== false) fail("No approval must be recorded.");
if (approval.preflight_result.real_apply_allowed_now !== false) fail("Real apply must not be allowed.");
if (approval.preflight_result.database_write_allowed_now !== false) fail("Database write must not be allowed.");
if (approval.preflight_result.deployment_allowed_now !== false) fail("Deployment must not be allowed.");

if (noExecution.audit_passed !== true) fail("No-execution audit must pass.");
for (const check of noExecution.checks) {
  if (check.passed !== true) fail(`No-execution check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag38d !== true) fail("AG38D readiness missing.");
if (readiness.next_stage_id !== "AG38D") fail("Next stage must be AG38D.");
if (readiness.allowed_ag38d_mode !== "audit_only_no_real_apply_without_explicit_operator_approval") fail("AG38D mode mismatch.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.audit_log_write_allowed_next !== false) fail("Audit write must remain false.");
if (readiness.rollback_write_allowed_next !== false) fail("Rollback write must remain false.");
if (readiness.anon_grants_allowed_next !== false) fail("Anon grants must remain false.");
if (readiness.sql_grants_allowed_next_without_approval !== false) fail("SQL grants must remain false.");

if (boundary.next_stage_id !== "AG38D") fail("Boundary must point to AG38D.");
if (review.summary.ready_for_ag38d_audit !== true) fail("Review AG38D readiness missing.");
if (preview.ready_for_ag38d_audit !== 1) fail("Preview AG38D readiness missing.");
if (preview.explicit_operator_approval_recorded !== 0) fail("Preview approval must be 0.");
if (preview.real_publish_executed !== 0) fail("Preview real publish must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");
if (preview.anon_access_granted !== 0) fail("Preview anon grant must be 0.");
if (preview.sql_grants_executed !== 0) fail("Preview SQL execution must be 0.");

if (!pkg.scripts?.["generate:ag38c"]) fail("Missing generate:ag38c script.");
if (!pkg.scripts?.["validate:ag38c"]) fail("Missing validate:ag38c script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag38c")) {
  fail("validate:project must include validate:ag38c.");
}

pass("AG38C Controlled Apply Preflight is present.");
pass("Target, explicit grant, audit/rollback and approval preflights are valid.");
pass("No-execution audit is valid.");
pass("AG38D Controlled Apply Audit readiness is valid.");
pass("No real publish, database write, public mutation, deployment, SQL grant execution or service-role key is recorded.");
