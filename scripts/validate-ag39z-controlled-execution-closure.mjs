import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
function fail(msg) { console.error(`❌ AG39Z validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag39a-public-mutation-decision-checkpoint.json",
  "data/content-intelligence/backend-architecture/ag39b-controlled-execution-package-planning.json",
  "data/content-intelligence/backend-architecture/ag39c-controlled-execution-preflight.json",
  "data/content-intelligence/backend-architecture/ag39d-controlled-execution-audit.json",
  "data/content-intelligence/quality-registry/ag39d-controlled-execution-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag39d-to-ag39z-controlled-execution-closure-boundary.json",

  "data/content-intelligence/quality-reviews/ag39z-controlled-execution-closure.json",
  "data/content-intelligence/backend-architecture/ag39z-controlled-execution-closure.json",
  "data/content-intelligence/backend-architecture/ag39z-controlled-execution-chain-register.json",
  "data/content-intelligence/backend-architecture/ag39z-live-dynamic-smoke-test-readiness-record.json",
  "data/content-intelligence/backend-architecture/ag39z-operator-approval-carry-forward-record.json",
  "data/content-intelligence/backend-architecture/ag39z-post-execution-gate-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag39z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag39z-controlled-execution-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag39z-live-article-url-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag39z-to-ag40a-live-article-url-test-boundary.json",
  "data/quality/ag39z-controlled-execution-closure.json",
  "data/quality/ag39z-controlled-execution-closure-preview.json",
  "docs/quality/AG39Z_CONTROLLED_EXECUTION_CLOSURE.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag39d = readJson("data/content-intelligence/backend-architecture/ag39d-controlled-execution-audit.json");
const ag39dReady = readJson("data/content-intelligence/quality-registry/ag39d-controlled-execution-closure-readiness-record.json");
const ag39dBoundary = readJson("data/content-intelligence/mutation-plans/ag39d-to-ag39z-controlled-execution-closure-boundary.json");
const closure = readJson("data/content-intelligence/backend-architecture/ag39z-controlled-execution-closure.json");
const chain = readJson("data/content-intelligence/backend-architecture/ag39z-controlled-execution-chain-register.json");
const smoke = readJson("data/content-intelligence/backend-architecture/ag39z-live-dynamic-smoke-test-readiness-record.json");
const approval = readJson("data/content-intelligence/backend-architecture/ag39z-operator-approval-carry-forward-record.json");
const carry = readJson("data/content-intelligence/backend-architecture/ag39z-post-execution-gate-blocker-carry-forward.json");
const ready = readJson("data/content-intelligence/quality-registry/ag39z-live-article-url-test-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag39z-to-ag40a-live-article-url-test-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag39z-controlled-execution-closure.json");
const preview = readJson("data/quality/ag39z-controlled-execution-closure-preview.json");
const pkg = readJson("package.json");

if (ag39d.status !== "controlled_execution_audit_created_ready_for_ag39z_closure") fail("AG39D source mismatch.");
if (ag39d.audit_decision.all_audits_passed !== true) fail("AG39D audits must pass.");
if (ag39dReady.ready_for_ag39z !== true) fail("AG39D readiness must allow AG39Z.");
if (ag39dBoundary.next_stage_id !== "AG39Z") fail("AG39D boundary must point to AG39Z.");

if (closure.status !== "controlled_execution_closure_created_ready_for_ag40a_live_article_url_test") fail("Closure status mismatch.");
if (closure.closure_decision.ag39_controlled_execution_chain_closed !== true) fail("AG39 chain closure missing.");
if (closure.closure_decision.proceed_to_ag40a_live_article_url_test_planning !== true) fail("AG40A readiness missing.");

for (const flag of [
  "explicit_operator_approval_recorded",
  "execution_authorized_now",
  "public_mutation_approved_now",
  "live_article_url_test_executed",
  "real_publish_executed",
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
  if (closure.closure_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (chain.chain_length !== 4) fail("AG39 chain length must be 4.");
for (const stage of ["AG39A", "AG39B", "AG39C", "AG39D"]) {
  if (!chain.closed_chain.some((item) => item.stage_id === stage)) fail(`Missing closed stage ${stage}.`);
}
if (chain.closed_successfully !== true) fail("AG39 chain must close successfully.");

if (smoke.live_tests_executed_in_ag39z !== false) fail("No live tests should execute in AG39Z.");
if (approval.approval_state.explicit_operator_approval_recorded !== false) fail("Operator approval must not be recorded.");
if (approval.approval_state.live_smoke_test_execution_allowed_now !== false) fail("Live smoke test execution must not be allowed now.");

for (const [key, value] of Object.entries(carry.blocked_items)) {
  if (value !== false) fail(`Carry-forward blocker must remain false: ${key}`);
}

if (ready.ready_for_ag40a !== true) fail("AG40A readiness missing.");
if (ready.next_stage_id !== "AG40A") fail("Next stage must be AG40A.");
if (ready.explicit_operator_approval_required_for_live_test_execution !== true) fail("Explicit approval requirement missing.");
if (ready.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (ready.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (ready.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (ready.database_write_allowed_next !== false) fail("Database write must remain false.");
if (ready.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG40A") fail("Boundary must point to AG40A.");
if (review.summary.ready_for_ag40a_live_article_url_test !== true) fail("Review AG40A readiness missing.");
if (preview.ready_for_ag40a_live_article_url_test !== 1) fail("Preview AG40A readiness missing.");
if (preview.explicit_operator_approval_recorded !== 0) fail("Preview approval must be 0.");
if (preview.live_article_url_test_executed !== 0) fail("Preview live URL test execution must be 0.");
if (preview.real_publish_executed !== 0) fail("Preview real publish must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!pkg.scripts?.["generate:ag39z"]) fail("Missing generate:ag39z script.");
if (!pkg.scripts?.["validate:ag39z"]) fail("Missing validate:ag39z script.");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag39z")) fail("validate:project must include validate:ag39z.");

pass("AG39Z Controlled Execution Closure is present.");
pass("AG39 controlled execution chain is closed.");
pass("AG40A Live Article URL Test readiness is valid.");
pass("Operator approval and no-mutation blockers are carried forward.");
pass("No live test, public mutation, real publish, database write, deployment, SQL grant execution or service-role key is recorded.");
