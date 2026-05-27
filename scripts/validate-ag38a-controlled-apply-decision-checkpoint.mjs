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
  console.error(`❌ AG38A validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag37z-dynamic-publish-dry-run-closure.json",
  "data/content-intelligence/quality-registry/ag37z-controlled-apply-decision-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag37z-to-ag38a-controlled-apply-decision-boundary.json",

  "data/content-intelligence/quality-reviews/ag38a-controlled-apply-decision-checkpoint.json",
  "data/content-intelligence/backend-architecture/ag38a-controlled-apply-decision-checkpoint.json",
  "data/content-intelligence/backend-architecture/ag38a-supabase-explicit-grant-readiness-record.json",
  "data/content-intelligence/backend-architecture/ag38a-controlled-apply-risk-review-record.json",
  "data/content-intelligence/backend-architecture/ag38a-operator-approval-gate-record.json",
  "data/content-intelligence/quality-registry/ag38a-controlled-apply-decision-blocker-register.json",
  "data/content-intelligence/quality-registry/ag38a-controlled-apply-package-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag38a-to-ag38b-controlled-apply-package-boundary.json",
  "data/quality/ag38a-controlled-apply-decision-checkpoint.json",
  "data/quality/ag38a-controlled-apply-decision-checkpoint-preview.json",
  "docs/quality/AG38A_CONTROLLED_APPLY_DECISION_CHECKPOINT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const ag37z = readJson("data/content-intelligence/backend-architecture/ag37z-dynamic-publish-dry-run-closure.json");
const ag37zReadiness = readJson("data/content-intelligence/quality-registry/ag37z-controlled-apply-decision-readiness-record.json");
const ag37zBoundary = readJson("data/content-intelligence/mutation-plans/ag37z-to-ag38a-controlled-apply-decision-boundary.json");

const checkpoint = readJson("data/content-intelligence/backend-architecture/ag38a-controlled-apply-decision-checkpoint.json");
const grant = readJson("data/content-intelligence/backend-architecture/ag38a-supabase-explicit-grant-readiness-record.json");
const risk = readJson("data/content-intelligence/backend-architecture/ag38a-controlled-apply-risk-review-record.json");
const approval = readJson("data/content-intelligence/backend-architecture/ag38a-operator-approval-gate-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag38a-controlled-apply-package-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag38a-to-ag38b-controlled-apply-package-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag38a-controlled-apply-decision-checkpoint.json");
const preview = readJson("data/quality/ag38a-controlled-apply-decision-checkpoint-preview.json");
const pkg = readJson("package.json");

if (ag37z.status !== "dynamic_publish_dry_run_closure_created_ready_for_ag38a_decision") fail("AG37Z source mismatch.");
if (ag37zReadiness.ready_for_ag38a !== true) fail("AG37Z readiness must allow AG38A.");
if (ag37zBoundary.next_stage_id !== "AG38A") fail("AG37Z boundary must point to AG38A.");

if (checkpoint.status !== "controlled_apply_decision_checkpoint_created_ready_for_ag38b_package_planning") fail("Checkpoint status mismatch.");
if (checkpoint.decision.ag38a_is_decision_checkpoint_only !== true) fail("AG38A must be checkpoint only.");
if (checkpoint.decision.supabase_explicit_grant_review_added !== true) fail("Explicit grant review missing.");
if (checkpoint.decision.explicit_operator_approval_required_before_real_apply !== true) fail("Operator approval requirement missing.");

for (const flag of [
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
  "write_grants_prepared",
  "sql_grants_executed"
]) {
  if (checkpoint.decision[flag] !== false) fail(`${flag} must be false.`);
}

if (grant.status !== "explicit_grant_review_added_no_sql_executed") fail("Grant readiness status mismatch.");
if (grant.current_treatment.no_sql_grant_executed_in_ag38a !== true) fail("AG38A must not execute SQL grants.");
if (grant.current_treatment.no_anon_grant_to_admin_editor_tables !== true) fail("Anon grants must be blocked.");
if (grant.current_treatment.no_write_grant_until_controlled_apply_is_explicitly_approved !== true) fail("Write grants must be blocked.");
if (grant.current_treatment.rls_remains_primary_access_control_layer !== true) fail("RLS primary boundary missing.");
if (grant.proposed_future_grant_direction.anon_grants_for_admin_editor_workflow.length !== 0) fail("Anon grant list must be empty.");
if (grant.proposed_future_grant_direction.write_grants_for_ag38a.length !== 0) fail("AG38A write grant list must be empty.");

if (risk.risk_review_passed_for_decision_checkpoint !== true) fail("Risk review must pass for checkpoint.");
if (risk.real_apply_authorized !== false) fail("Risk review must not authorize real apply.");

if (approval.approval_state.explicit_operator_approval_recorded_in_ag38a !== false) fail("No approval should be recorded in AG38A.");
if (approval.approval_state.real_apply_allowed_now !== false) fail("Real apply must not be allowed now.");
if (approval.approval_state.public_mutation_allowed_now !== false) fail("Public mutation must not be allowed now.");
if (approval.approval_state.database_write_allowed_now !== false) fail("Database write must not be allowed now.");

if (readiness.ready_for_ag38b !== true) fail("AG38B readiness missing.");
if (readiness.next_stage_id !== "AG38B") fail("Next stage must be AG38B.");
if (readiness.allowed_ag38b_mode !== "package_planning_only_no_real_apply_without_explicit_operator_approval") fail("AG38B mode mismatch.");
if (readiness.supabase_explicit_grant_review_required_in_ag38b !== true) fail("Grant review required in AG38B missing.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.audit_log_write_allowed_next !== false) fail("Audit write must remain false.");
if (readiness.rollback_write_allowed_next !== false) fail("Rollback write must remain false.");
if (readiness.anon_grants_allowed_next !== false) fail("Anon grants must remain false.");
if (readiness.write_grants_allowed_next_without_approval !== false) fail("Write grants without approval must remain false.");

if (boundary.next_stage_id !== "AG38B") fail("Boundary must point to AG38B.");
if (review.summary.ready_for_ag38b_package_planning !== true) fail("Review AG38B readiness missing.");
if (preview.ready_for_ag38b_package_planning !== 1) fail("Preview AG38B readiness missing.");
if (preview.real_apply_approved_now !== 0) fail("Preview real apply approval must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");
if (preview.anon_access_granted !== 0) fail("Preview anon grant must be 0.");
if (preview.sql_grants_executed !== 0) fail("Preview SQL grants executed must be 0.");

if (!pkg.scripts?.["generate:ag38a"]) fail("Missing generate:ag38a script.");
if (!pkg.scripts?.["validate:ag38a"]) fail("Missing validate:ag38a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag38a")) {
  fail("validate:project must include validate:ag38a.");
}

pass("AG38A Controlled Apply Decision Checkpoint is present.");
pass("Supabase explicit GRANT readiness review is included without executing SQL.");
pass("Operator approval gate and risk review are valid.");
pass("AG38B Controlled Apply Package Planning readiness is valid.");
pass("No real publish, database write, public mutation, deployment, SQL grant execution or service-role key is recorded.");
