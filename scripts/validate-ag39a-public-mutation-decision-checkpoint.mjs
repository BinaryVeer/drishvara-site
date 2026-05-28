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
  console.error(`❌ AG39A validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag38z-controlled-apply-closure.json",
  "data/content-intelligence/backend-architecture/ag38z-controlled-apply-chain-register.json",
  "data/content-intelligence/backend-architecture/ag38z-operator-approval-carry-forward-record.json",
  "data/content-intelligence/backend-architecture/ag38z-explicit-grant-carry-forward-record.json",
  "data/content-intelligence/backend-architecture/ag38z-post-controlled-apply-blocker-carry-forward.json",
  "data/content-intelligence/quality-registry/ag38z-public-mutation-decision-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag38z-to-ag39a-public-mutation-decision-boundary.json",

  "data/content-intelligence/quality-reviews/ag39a-public-mutation-decision-checkpoint.json",
  "data/content-intelligence/backend-architecture/ag39a-public-mutation-decision-checkpoint.json",
  "data/content-intelligence/backend-architecture/ag39a-public-mutation-risk-review-record.json",
  "data/content-intelligence/backend-architecture/ag39a-operator-approval-gate-record.json",
  "data/content-intelligence/backend-architecture/ag39a-grant-execution-decision-record.json",
  "data/content-intelligence/backend-architecture/ag39a-execution-scope-decision-record.json",
  "data/content-intelligence/quality-registry/ag39a-public-mutation-decision-blocker-register.json",
  "data/content-intelligence/quality-registry/ag39a-controlled-execution-package-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag39a-to-ag39b-controlled-execution-package-boundary.json",
  "data/quality/ag39a-public-mutation-decision-checkpoint.json",
  "data/quality/ag39a-public-mutation-decision-checkpoint-preview.json",
  "docs/quality/AG39A_PUBLIC_MUTATION_DECISION_CHECKPOINT.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const ag38z = readJson("data/content-intelligence/backend-architecture/ag38z-controlled-apply-closure.json");
const ag38zChain = readJson("data/content-intelligence/backend-architecture/ag38z-controlled-apply-chain-register.json");
const ag38zReadiness = readJson("data/content-intelligence/quality-registry/ag38z-public-mutation-decision-readiness-record.json");
const ag38zBoundary = readJson("data/content-intelligence/mutation-plans/ag38z-to-ag39a-public-mutation-decision-boundary.json");

const checkpoint = readJson("data/content-intelligence/backend-architecture/ag39a-public-mutation-decision-checkpoint.json");
const risk = readJson("data/content-intelligence/backend-architecture/ag39a-public-mutation-risk-review-record.json");
const approval = readJson("data/content-intelligence/backend-architecture/ag39a-operator-approval-gate-record.json");
const grant = readJson("data/content-intelligence/backend-architecture/ag39a-grant-execution-decision-record.json");
const scope = readJson("data/content-intelligence/backend-architecture/ag39a-execution-scope-decision-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag39a-controlled-execution-package-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag39a-to-ag39b-controlled-execution-package-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag39a-public-mutation-decision-checkpoint.json");
const preview = readJson("data/quality/ag39a-public-mutation-decision-checkpoint-preview.json");
const pkg = readJson("package.json");

if (ag38z.status !== "controlled_apply_closure_created_ready_for_ag39a_public_mutation_decision") fail("AG38Z source mismatch.");
if (ag38zChain.closed_successfully !== true) fail("AG38Z chain must be closed successfully.");
if (ag38zReadiness.ready_for_ag39a !== true) fail("AG38Z readiness must allow AG39A.");
if (ag38zBoundary.next_stage_id !== "AG39A") fail("AG38Z boundary must point to AG39A.");

if (checkpoint.status !== "public_mutation_decision_checkpoint_created_ready_for_ag39b_package_planning") fail("Checkpoint status mismatch.");
if (checkpoint.decision.ag39a_is_decision_checkpoint_only !== true) fail("AG39A must be checkpoint only.");
if (checkpoint.decision.controlled_execution_package_may_be_planned_next !== true) fail("AG39B planning readiness missing.");
if (checkpoint.decision.explicit_operator_approval_required_before_public_mutation !== true) fail("Explicit approval requirement missing.");

for (const flag of [
  "explicit_operator_approval_recorded",
  "public_mutation_approved_now",
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
  if (checkpoint.decision[flag] !== false) fail(`${flag} must be false.`);
}

if (risk.risk_review_passed_for_decision_checkpoint !== true) fail("Risk review must pass.");
if (risk.public_mutation_authorized !== false) fail("Public mutation must not be authorized.");

if (approval.approval_state.explicit_operator_approval_recorded_in_ag39a !== false) fail("No approval should be recorded in AG39A.");
if (approval.approval_state.public_mutation_allowed_now !== false) fail("Public mutation must not be allowed.");
if (approval.approval_state.real_apply_allowed_now !== false) fail("Real apply must not be allowed.");
if (approval.approval_state.database_write_allowed_now !== false) fail("Database write must not be allowed.");
if (approval.approval_state.deployment_allowed_now !== false) fail("Deployment must not be allowed.");

if (grant.grant_decision.anon_grants_for_admin_editor_tables_allowed !== false) fail("Anon grants must remain false.");
if (grant.grant_decision.write_grants_allowed_without_approval !== false) fail("Write grants without approval must remain false.");
if (grant.grant_decision.sql_grants_allowed_now !== false) fail("SQL grants must not be allowed now.");
if (grant.grant_decision.sql_grants_executed_now !== false) fail("SQL grants must not be executed.");
if (grant.grant_decision.rls_remains_primary_access_control_layer !== true) fail("RLS primary boundary missing.");

if (scope.execution_authorized_now !== false) fail("Execution must not be authorized in AG39A.");

if (readiness.ready_for_ag39b !== true) fail("AG39B readiness missing.");
if (readiness.next_stage_id !== "AG39B") fail("Next stage must be AG39B.");
if (readiness.allowed_ag39b_mode !== "package_planning_only_no_public_mutation_without_explicit_operator_approval") fail("AG39B mode mismatch.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.audit_log_write_allowed_next !== false) fail("Audit write must remain false.");
if (readiness.rollback_write_allowed_next !== false) fail("Rollback write must remain false.");
if (readiness.anon_grants_allowed_next !== false) fail("Anon grants must remain false.");
if (readiness.sql_grants_allowed_next_without_approval !== false) fail("SQL grants must remain false.");

if (boundary.next_stage_id !== "AG39B") fail("Boundary must point to AG39B.");
if (review.summary.ready_for_ag39b_package_planning !== true) fail("Review AG39B readiness missing.");
if (preview.ready_for_ag39b_package_planning !== 1) fail("Preview AG39B readiness missing.");
if (preview.explicit_operator_approval_recorded !== 0) fail("Preview approval must be 0.");
if (preview.public_mutation_approved_now !== 0) fail("Preview public mutation approval must be 0.");
if (preview.real_publish_executed !== 0) fail("Preview real publish must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");
if (preview.anon_access_granted !== 0) fail("Preview anon grant must be 0.");
if (preview.sql_grants_executed !== 0) fail("Preview SQL execution must be 0.");

if (!pkg.scripts?.["generate:ag39a"]) fail("Missing generate:ag39a script.");
if (!pkg.scripts?.["validate:ag39a"]) fail("Missing validate:ag39a script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag39a")) {
  fail("validate:project must include validate:ag39a.");
}

pass("AG39A Public Mutation Decision Checkpoint is present.");
pass("Operator approval, grant execution and public mutation risk gates are valid.");
pass("AG39B Controlled Execution Package Planning readiness is valid.");
pass("No public mutation, real publish, database write, deployment, SQL grant execution or service-role key is recorded.");
