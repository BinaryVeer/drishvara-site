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
  console.error(`❌ AG38B validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag38a-controlled-apply-decision-checkpoint.json",
  "data/content-intelligence/backend-architecture/ag38a-supabase-explicit-grant-readiness-record.json",
  "data/content-intelligence/quality-registry/ag38a-controlled-apply-package-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag38a-to-ag38b-controlled-apply-package-boundary.json",

  "data/content-intelligence/quality-reviews/ag38b-controlled-apply-package-planning.json",
  "data/content-intelligence/backend-architecture/ag38b-controlled-apply-package-planning.json",
  "data/content-intelligence/backend-architecture/ag38b-test-non-public-article-target-plan.json",
  "data/content-intelligence/backend-architecture/ag38b-supabase-explicit-grant-plan.json",
  "data/content-intelligence/backend-architecture/ag38b-audit-rollback-plan.json",
  "data/content-intelligence/backend-architecture/ag38b-no-execution-audit-register.json",
  "data/content-intelligence/quality-registry/ag38b-controlled-apply-package-blocker-register.json",
  "data/content-intelligence/quality-registry/ag38b-controlled-apply-preflight-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag38b-to-ag38c-controlled-apply-preflight-boundary.json",
  "data/quality/ag38b-controlled-apply-package-planning.json",
  "data/quality/ag38b-controlled-apply-package-planning-preview.json",
  "docs/quality/AG38B_CONTROLLED_APPLY_PACKAGE_PLANNING.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const ag38a = readJson("data/content-intelligence/backend-architecture/ag38a-controlled-apply-decision-checkpoint.json");
const ag38aReadiness = readJson("data/content-intelligence/quality-registry/ag38a-controlled-apply-package-readiness-record.json");
const ag38aBoundary = readJson("data/content-intelligence/mutation-plans/ag38a-to-ag38b-controlled-apply-package-boundary.json");

const packageRecord = readJson("data/content-intelligence/backend-architecture/ag38b-controlled-apply-package-planning.json");
const target = readJson("data/content-intelligence/backend-architecture/ag38b-test-non-public-article-target-plan.json");
const grant = readJson("data/content-intelligence/backend-architecture/ag38b-supabase-explicit-grant-plan.json");
const auditRollback = readJson("data/content-intelligence/backend-architecture/ag38b-audit-rollback-plan.json");
const noExecution = readJson("data/content-intelligence/backend-architecture/ag38b-no-execution-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag38b-controlled-apply-preflight-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag38b-to-ag38c-controlled-apply-preflight-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag38b-controlled-apply-package-planning.json");
const preview = readJson("data/quality/ag38b-controlled-apply-package-planning-preview.json");
const pkg = readJson("package.json");

if (ag38a.status !== "controlled_apply_decision_checkpoint_created_ready_for_ag38b_package_planning") fail("AG38A source mismatch.");
if (ag38aReadiness.ready_for_ag38b !== true) fail("AG38A readiness must allow AG38B.");
if (ag38aBoundary.next_stage_id !== "AG38B") fail("AG38A boundary must point to AG38B.");

if (packageRecord.status !== "controlled_apply_package_planning_created_ready_for_ag38c_preflight") fail("Package status mismatch.");
if (packageRecord.package_decision.controlled_apply_package_planning_created !== true) fail("Package planning missing.");
if (packageRecord.package_decision.explicit_grant_plan_created !== true) fail("Explicit grant plan missing.");
if (packageRecord.package_decision.audit_rollback_plan_created !== true) fail("Audit rollback plan missing.");
if (packageRecord.package_decision.proceed_to_ag38c_controlled_apply_preflight !== true) fail("AG38C readiness missing.");

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
  if (packageRecord.package_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (target.candidate_scope.target_mode !== "test_or_non_public_article_only") fail("Target mode mismatch.");
if (target.candidate_scope.public_surface_exposure_allowed_in_ag38b !== false) fail("Public exposure must be false.");
if (target.candidate_scope.real_publish_allowed_in_ag38b !== false) fail("Real publish must be false.");

if (grant.status !== "explicit_grant_plan_created_no_sql_executed") fail("Grant plan status mismatch.");
if (grant.proposed_anon_grants_for_admin_editor_workflow.length !== 0) fail("Anon grants must be empty.");
if (grant.proposed_write_grants_in_ag38b.length !== 0) fail("Write grants must be empty.");
if (grant.sql_file_created_in_ag38b !== false) fail("SQL file must not be created in AG38B.");
if (grant.sql_executed_in_ag38b !== false) fail("SQL must not execute in AG38B.");
if (grant.rls_remains_primary_access_control_layer !== true) fail("RLS primary boundary missing.");

if (auditRollback.audit_write_plan.audit_log_write_allowed_in_ag38b !== false) fail("Audit write must be false.");
if (auditRollback.rollback_plan.rollback_write_allowed_in_ag38b !== false) fail("Rollback write must be false.");

if (noExecution.audit_passed !== true) fail("No-execution audit must pass.");
for (const check of noExecution.checks) {
  if (check.passed !== true) fail(`No-execution check failed: ${check.check_id}`);
}

if (readiness.ready_for_ag38c !== true) fail("AG38C readiness missing.");
if (readiness.next_stage_id !== "AG38C") fail("Next stage must be AG38C.");
if (readiness.allowed_ag38c_mode !== "preflight_only_no_real_apply_without_explicit_operator_approval") fail("AG38C mode mismatch.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.audit_log_write_allowed_next !== false) fail("Audit write must remain false.");
if (readiness.rollback_write_allowed_next !== false) fail("Rollback write must remain false.");
if (readiness.anon_grants_allowed_next !== false) fail("Anon grants must remain false.");
if (readiness.sql_grants_allowed_next_without_approval !== false) fail("SQL grant execution without approval must remain false.");

if (boundary.next_stage_id !== "AG38C") fail("Boundary must point to AG38C.");
if (review.summary.ready_for_ag38c_preflight !== true) fail("Review AG38C readiness missing.");
if (preview.ready_for_ag38c_preflight !== 1) fail("Preview AG38C readiness missing.");
if (preview.explicit_operator_approval_recorded !== 0) fail("Preview approval must be 0.");
if (preview.real_publish_executed !== 0) fail("Preview real publish must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");
if (preview.anon_access_granted !== 0) fail("Preview anon grant must be 0.");
if (preview.sql_grants_executed !== 0) fail("Preview SQL execution must be 0.");

if (!pkg.scripts?.["generate:ag38b"]) fail("Missing generate:ag38b script.");
if (!pkg.scripts?.["validate:ag38b"]) fail("Missing validate:ag38b script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag38b")) {
  fail("validate:project must include validate:ag38b.");
}

pass("AG38B Controlled Apply Package Planning is present.");
pass("Supabase explicit grant plan is included without SQL execution.");
pass("Target candidate, audit/rollback plan and no-execution audit are valid.");
pass("AG38C Controlled Apply Preflight readiness is valid.");
pass("No real publish, database write, public mutation, deployment, SQL grant execution or service-role key is recorded.");
