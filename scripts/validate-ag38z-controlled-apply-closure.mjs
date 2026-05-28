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
  console.error(`❌ AG38Z validation failed: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const required = [
  "data/content-intelligence/backend-architecture/ag38a-controlled-apply-decision-checkpoint.json",
  "data/content-intelligence/backend-architecture/ag38b-controlled-apply-package-planning.json",
  "data/content-intelligence/backend-architecture/ag38c-controlled-apply-preflight.json",
  "data/content-intelligence/backend-architecture/ag38d-controlled-apply-audit.json",
  "data/content-intelligence/quality-registry/ag38d-controlled-apply-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag38d-to-ag38z-controlled-apply-closure-boundary.json",

  "data/content-intelligence/quality-reviews/ag38z-controlled-apply-closure.json",
  "data/content-intelligence/backend-architecture/ag38z-controlled-apply-closure.json",
  "data/content-intelligence/backend-architecture/ag38z-controlled-apply-chain-register.json",
  "data/content-intelligence/backend-architecture/ag38z-operator-approval-carry-forward-record.json",
  "data/content-intelligence/backend-architecture/ag38z-explicit-grant-carry-forward-record.json",
  "data/content-intelligence/backend-architecture/ag38z-post-controlled-apply-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag38z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag38z-controlled-apply-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag38z-public-mutation-decision-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag38z-to-ag39a-public-mutation-decision-boundary.json",
  "data/quality/ag38z-controlled-apply-closure.json",
  "data/quality/ag38z-controlled-apply-closure-preview.json",
  "docs/quality/AG38Z_CONTROLLED_APPLY_CLOSURE.md",
  "package.json"
];

for (const f of required) {
  if (!exists(f)) fail(`Missing file: ${f}`);
}

const ag38a = readJson("data/content-intelligence/backend-architecture/ag38a-controlled-apply-decision-checkpoint.json");
const ag38b = readJson("data/content-intelligence/backend-architecture/ag38b-controlled-apply-package-planning.json");
const ag38c = readJson("data/content-intelligence/backend-architecture/ag38c-controlled-apply-preflight.json");
const ag38d = readJson("data/content-intelligence/backend-architecture/ag38d-controlled-apply-audit.json");
const ag38dReadiness = readJson("data/content-intelligence/quality-registry/ag38d-controlled-apply-closure-readiness-record.json");
const ag38dBoundary = readJson("data/content-intelligence/mutation-plans/ag38d-to-ag38z-controlled-apply-closure-boundary.json");

const closure = readJson("data/content-intelligence/backend-architecture/ag38z-controlled-apply-closure.json");
const chain = readJson("data/content-intelligence/backend-architecture/ag38z-controlled-apply-chain-register.json");
const approval = readJson("data/content-intelligence/backend-architecture/ag38z-operator-approval-carry-forward-record.json");
const grant = readJson("data/content-intelligence/backend-architecture/ag38z-explicit-grant-carry-forward-record.json");
const carryForward = readJson("data/content-intelligence/backend-architecture/ag38z-post-controlled-apply-blocker-carry-forward.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag38z-public-mutation-decision-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag38z-to-ag39a-public-mutation-decision-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag38z-controlled-apply-closure.json");
const preview = readJson("data/quality/ag38z-controlled-apply-closure-preview.json");
const pkg = readJson("package.json");

if (ag38a.status !== "controlled_apply_decision_checkpoint_created_ready_for_ag38b_package_planning") fail("AG38A source mismatch.");
if (ag38b.status !== "controlled_apply_package_planning_created_ready_for_ag38c_preflight") fail("AG38B source mismatch.");
if (ag38c.status !== "controlled_apply_preflight_created_ready_for_ag38d_audit") fail("AG38C source mismatch.");
if (ag38d.status !== "controlled_apply_audit_created_ready_for_ag38z_closure") fail("AG38D source mismatch.");
if (ag38d.audit_decision.all_audits_passed !== true) fail("AG38D audits must pass.");
if (ag38dReadiness.ready_for_ag38z !== true) fail("AG38D readiness must allow AG38Z.");
if (ag38dBoundary.next_stage_id !== "AG38Z") fail("AG38D boundary must point to AG38Z.");

if (closure.status !== "controlled_apply_closure_created_ready_for_ag39a_public_mutation_decision") fail("Closure status mismatch.");
if (closure.closure_decision.ag38_controlled_apply_chain_closed !== true) fail("AG38 chain closure missing.");
if (closure.closure_decision.controlled_apply_audit_passed !== true) fail("Controlled apply audit passed missing.");
if (closure.closure_decision.proceed_to_ag39a_public_mutation_decision_checkpoint !== true) fail("AG39A readiness missing.");

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
  if (closure.closure_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (chain.chain_length !== 4) fail("AG38 chain length must be 4.");
for (const stage of ["AG38A", "AG38B", "AG38C", "AG38D"]) {
  if (!chain.closed_chain.some((item) => item.stage_id === stage)) fail(`Missing closed stage ${stage}.`);
}
if (chain.closed_successfully !== true) fail("AG38 chain must close successfully.");

if (approval.approval_state.explicit_operator_approval_recorded !== false) fail("Operator approval must not be recorded.");
if (approval.approval_state.real_apply_allowed_now !== false) fail("Real apply must not be allowed.");
if (approval.approval_state.public_mutation_allowed_now !== false) fail("Public mutation must not be allowed.");
if (approval.approval_state.database_write_allowed_now !== false) fail("Database write must not be allowed.");

if (grant.grant_position.anon_grants_for_admin_editor_tables_allowed !== false) fail("Anon grants must remain false.");
if (grant.grant_position.write_grants_allowed_without_approval !== false) fail("Write grants without approval must remain false.");
if (grant.grant_position.sql_grants_executed_in_ag38 !== false) fail("SQL grants executed must remain false.");
if (grant.grant_position.rls_remains_primary_access_control_layer !== true) fail("RLS primary boundary missing.");

for (const [key, value] of Object.entries(carryForward.blocked_items)) {
  if (value !== false) fail(`Carry-forward blocker must remain false: ${key}`);
}

if (readiness.ready_for_ag39a !== true) fail("AG39A readiness missing.");
if (readiness.next_stage_id !== "AG39A") fail("Next stage must be AG39A.");
if (readiness.allowed_ag39a_mode !== "decision_checkpoint_only_no_public_mutation_without_explicit_operator_approval") fail("AG39A mode mismatch.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.audit_log_write_allowed_next !== false) fail("Audit write must remain false.");
if (readiness.rollback_write_allowed_next !== false) fail("Rollback write must remain false.");
if (readiness.anon_grants_allowed_next !== false) fail("Anon grants must remain false.");
if (readiness.sql_grants_allowed_next_without_approval !== false) fail("SQL grants must remain false.");

if (boundary.next_stage_id !== "AG39A") fail("Boundary must point to AG39A.");
if (review.summary.ready_for_ag39a_public_mutation_decision !== true) fail("Review AG39A readiness missing.");
if (preview.ready_for_ag39a_public_mutation_decision !== 1) fail("Preview AG39A readiness missing.");
if (preview.explicit_operator_approval_recorded !== 0) fail("Preview approval must be 0.");
if (preview.real_apply_approved_now !== 0) fail("Preview real apply must be 0.");
if (preview.real_publish_executed !== 0) fail("Preview real publish must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");
if (preview.anon_access_granted !== 0) fail("Preview anon grant must be 0.");
if (preview.sql_grants_executed !== 0) fail("Preview SQL execution must be 0.");

if (!pkg.scripts?.["generate:ag38z"]) fail("Missing generate:ag38z script.");
if (!pkg.scripts?.["validate:ag38z"]) fail("Missing validate:ag38z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag38z")) {
  fail("validate:project must include validate:ag38z.");
}

pass("AG38Z Controlled Apply Closure is present.");
pass("AG38 controlled apply planning/preflight/audit chain is closed.");
pass("Operator approval and explicit grant requirements are carried forward.");
pass("AG39A Public Mutation Decision Checkpoint readiness is valid.");
pass("No real publish, database write, public mutation, deployment, SQL grant execution or service-role key is recorded.");
