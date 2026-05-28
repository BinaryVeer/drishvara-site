import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
function fail(msg) { console.error(`❌ AG41Z validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag41a-dynamic-publishing-sop.json",
  "data/content-intelligence/backend-architecture/ag41b-batch-dynamic-publishing-plan.json",
  "data/content-intelligence/backend-architecture/ag41c-monitoring-audit-dashboard-plan.json",
  "data/content-intelligence/backend-architecture/ag41d-dynamic-sop-audit.json",
  "data/content-intelligence/backend-architecture/ag41d-sop-chain-audit-register.json",
  "data/content-intelligence/backend-architecture/ag41d-governance-completeness-audit-register.json",
  "data/content-intelligence/backend-architecture/ag41d-monitoring-plan-audit-register.json",
  "data/content-intelligence/backend-architecture/ag41d-no-mutation-continuity-audit-register.json",
  "data/content-intelligence/quality-registry/ag41d-dynamic-publishing-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag41d-to-ag41z-dynamic-publishing-closure-boundary.json",

  "data/content-intelligence/quality-reviews/ag41z-dynamic-publishing-closure.json",
  "data/content-intelligence/backend-architecture/ag41z-dynamic-publishing-closure.json",
  "data/content-intelligence/backend-architecture/ag41z-dynamic-publishing-chain-register.json",
  "data/content-intelligence/backend-architecture/ag41z-dynamic-publishing-summary-record.json",
  "data/content-intelligence/backend-architecture/ag41z-first-controlled-batch-decision-readiness-record.json",
  "data/content-intelligence/backend-architecture/ag41z-post-dynamic-publishing-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag41z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag41z-dynamic-publishing-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag41z-first-controlled-batch-decision-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag41z-to-ag42a-first-controlled-batch-decision-boundary.json",
  "data/quality/ag41z-dynamic-publishing-closure.json",
  "data/quality/ag41z-dynamic-publishing-closure-preview.json",
  "docs/quality/AG41Z_DYNAMIC_PUBLISHING_CLOSURE.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag41d = readJson("data/content-intelligence/backend-architecture/ag41d-dynamic-sop-audit.json");
const ag41dReady = readJson("data/content-intelligence/quality-registry/ag41d-dynamic-publishing-closure-readiness-record.json");
const ag41dBoundary = readJson("data/content-intelligence/mutation-plans/ag41d-to-ag41z-dynamic-publishing-closure-boundary.json");

const closure = readJson("data/content-intelligence/backend-architecture/ag41z-dynamic-publishing-closure.json");
const chain = readJson("data/content-intelligence/backend-architecture/ag41z-dynamic-publishing-chain-register.json");
const summary = readJson("data/content-intelligence/backend-architecture/ag41z-dynamic-publishing-summary-record.json");
const decisionReady = readJson("data/content-intelligence/backend-architecture/ag41z-first-controlled-batch-decision-readiness-record.json");
const carry = readJson("data/content-intelligence/backend-architecture/ag41z-post-dynamic-publishing-blocker-carry-forward.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag41z-first-controlled-batch-decision-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag41z-to-ag42a-first-controlled-batch-decision-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag41z-dynamic-publishing-closure.json");
const preview = readJson("data/quality/ag41z-dynamic-publishing-closure-preview.json");
const packageJson = readJson("package.json");

if (ag41d.status !== "dynamic_sop_audit_created_ready_for_ag41z_closure") fail("AG41D source mismatch.");
if (ag41d.audit_decision.all_audits_passed !== true) fail("AG41D all audits must pass.");
if (ag41dReady.ready_for_ag41z !== true) fail("AG41D readiness must allow AG41Z.");
if (ag41dBoundary.next_stage_id !== "AG41Z") fail("AG41D boundary must point to AG41Z.");

if (closure.status !== "dynamic_publishing_closure_created_ready_for_ag42a_first_controlled_batch_decision") fail("Closure status mismatch.");
if (closure.closure_decision.ag41_dynamic_publishing_chain_closed !== true) fail("AG41 chain closure missing.");
if (closure.closure_decision.proceed_to_ag42a_first_controlled_batch_decision_checkpoint !== true) fail("AG42A readiness missing.");

for (const flag of [
  "batch_execution_authorized_now",
  "batch_publish_executed",
  "first_controlled_batch_executed",
  "dashboard_runtime_enabled",
  "dashboard_data_query_executed",
  "real_publish_executed",
  "database_write_done",
  "audit_log_write_done",
  "rollback_write_done",
  "public_article_mutated",
  "deployment_done",
  "public_mutation_done",
  "dynamic_publish_runtime_enabled",
  "service_role_key_recorded",
  "service_role_key_exposed",
  "anon_access_granted",
  "sql_file_created",
  "sql_grants_executed"
]) {
  if (closure.closure_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (chain.chain_length !== 4) fail("AG41 chain length must be 4.");
for (const stage of ["AG41A", "AG41B", "AG41C", "AG41D"]) {
  if (!chain.closed_chain.some((item) => item.stage_id === stage && item.passed === true)) {
    fail(`Missing passed closed stage ${stage}.`);
  }
}
if (chain.closed_successfully !== true) fail("AG41 chain must close successfully.");

for (const [key, value] of Object.entries(summary.summary)) {
  if (value !== true) fail(`Summary value must be true: ${key}`);
}

if (decisionReady.ready_for_ag42a !== true) fail("AG42A decision readiness missing.");
if (decisionReady.next_stage_id !== "AG42A") fail("Decision readiness next stage must be AG42A.");

for (const [key, value] of Object.entries(carry.blocked_items)) {
  if (value !== false) fail(`Carry-forward blocker must remain false: ${key}`);
}

if (readiness.ready_for_ag42a !== true) fail("AG42A readiness missing.");
if (readiness.next_stage_id !== "AG42A") fail("Next stage must be AG42A.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG42A") fail("Boundary must point to AG42A.");
if (review.summary.ready_for_ag42a !== true) fail("Review AG42A readiness missing.");
if (preview.ready_for_ag42a !== 1) fail("Preview AG42A readiness missing.");
if (preview.first_controlled_batch_executed !== 0) fail("Preview first controlled batch must be 0.");
if (preview.batch_execution_authorized_now !== 0) fail("Preview batch execution must be 0.");
if (preview.batch_publish_executed !== 0) fail("Preview batch publish must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!packageJson.scripts?.["generate:ag41z"]) fail("Missing generate:ag41z script.");
if (!packageJson.scripts?.["validate:ag41z"]) fail("Missing validate:ag41z script.");
if (!packageJson.scripts?.["validate:project"]?.includes("npm run validate:ag41z")) {
  fail("validate:project must include validate:ag41z.");
}

pass("AG41Z Dynamic Publishing Closure is present.");
pass("AG41 Dynamic Publishing chain is closed.");
pass("First Controlled Batch Decision readiness is valid.");
pass("No first controlled batch execution, public mutation, real publish, database write, deployment, SQL grant execution or service-role key is recorded.");
