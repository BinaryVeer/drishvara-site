import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
function fail(msg) { console.error(`❌ AG40Z validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag40a-live-article-url-test-package.json",
  "data/content-intelligence/backend-architecture/ag40b-admin-editor-workflow-test-package.json",
  "data/content-intelligence/backend-architecture/ag40c-public-listing-test-package.json",
  "data/content-intelligence/backend-architecture/ag40d-stabilisation-audit.json",
  "data/content-intelligence/quality-registry/ag40d-dynamic-stabilisation-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag40d-to-ag40z-dynamic-stabilisation-closure-boundary.json",

  "data/content-intelligence/quality-reviews/ag40z-dynamic-stabilisation-closure.json",
  "data/content-intelligence/backend-architecture/ag40z-dynamic-stabilisation-closure.json",
  "data/content-intelligence/backend-architecture/ag40z-live-smoke-test-chain-register.json",
  "data/content-intelligence/backend-architecture/ag40z-stabilisation-summary-record.json",
  "data/content-intelligence/backend-architecture/ag40z-dynamic-publishing-sop-readiness-record.json",
  "data/content-intelligence/backend-architecture/ag40z-post-stabilisation-blocker-carry-forward.json",
  "data/content-intelligence/backend-architecture/ag40z-future-consumption-plan.json",
  "data/content-intelligence/quality-registry/ag40z-dynamic-stabilisation-closure-blocker-register.json",
  "data/content-intelligence/quality-registry/ag40z-dynamic-publishing-sop-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag40z-to-ag41a-dynamic-publishing-sop-boundary.json",
  "data/quality/ag40z-dynamic-stabilisation-closure.json",
  "data/quality/ag40z-dynamic-stabilisation-closure-preview.json",
  "docs/quality/AG40Z_DYNAMIC_STABILISATION_CLOSURE.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag40a = readJson("data/content-intelligence/backend-architecture/ag40a-live-article-url-test-package.json");
const ag40b = readJson("data/content-intelligence/backend-architecture/ag40b-admin-editor-workflow-test-package.json");
const ag40c = readJson("data/content-intelligence/backend-architecture/ag40c-public-listing-test-package.json");
const ag40d = readJson("data/content-intelligence/backend-architecture/ag40d-stabilisation-audit.json");
const ag40dReady = readJson("data/content-intelligence/quality-registry/ag40d-dynamic-stabilisation-closure-readiness-record.json");
const ag40dBoundary = readJson("data/content-intelligence/mutation-plans/ag40d-to-ag40z-dynamic-stabilisation-closure-boundary.json");

const closure = readJson("data/content-intelligence/backend-architecture/ag40z-dynamic-stabilisation-closure.json");
const chain = readJson("data/content-intelligence/backend-architecture/ag40z-live-smoke-test-chain-register.json");
const summary = readJson("data/content-intelligence/backend-architecture/ag40z-stabilisation-summary-record.json");
const sop = readJson("data/content-intelligence/backend-architecture/ag40z-dynamic-publishing-sop-readiness-record.json");
const carry = readJson("data/content-intelligence/backend-architecture/ag40z-post-stabilisation-blocker-carry-forward.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag40z-dynamic-publishing-sop-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag40z-to-ag41a-dynamic-publishing-sop-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag40z-dynamic-stabilisation-closure.json");
const preview = readJson("data/quality/ag40z-dynamic-stabilisation-closure-preview.json");
const packageJson = readJson("package.json");

if (ag40a.status !== "live_article_url_test_created_ready_for_ag40b") fail("AG40A status mismatch.");
if (ag40b.status !== "admin_editor_workflow_test_created_ready_for_ag40c") fail("AG40B status mismatch.");
if (ag40c.status !== "public_listing_test_created_ready_for_ag40d") fail("AG40C status mismatch.");
if (ag40d.status !== "stabilisation_audit_created_ready_for_ag40z_closure") fail("AG40D status mismatch.");
if (ag40d.audit_decision.all_audits_passed !== true) fail("AG40D audits must pass.");
if (ag40dReady.ready_for_ag40z !== true) fail("AG40D readiness must allow AG40Z.");
if (ag40dBoundary.next_stage_id !== "AG40Z") fail("AG40D boundary must point to AG40Z.");

if (closure.status !== "dynamic_stabilisation_closure_created_ready_for_ag41a_sop") fail("Closure status mismatch.");
if (closure.closure_decision.ag40_live_smoke_test_chain_closed !== true) fail("AG40 chain closure missing.");
if (closure.closure_decision.proceed_to_ag41a_dynamic_publishing_sop !== true) fail("AG41A readiness missing.");

for (const flag of [
  "login_form_submitted",
  "credentials_used",
  "session_created",
  "real_publish_executed",
  "database_write_done",
  "public_article_mutated",
  "deployment_done",
  "public_mutation_done",
  "dynamic_publish_runtime_enabled",
  "service_role_key_recorded",
  "service_role_key_exposed",
  "anon_access_granted",
  "sql_grants_executed"
]) {
  if (closure.closure_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (chain.chain_length !== 4) fail("AG40 chain length must be 4.");
for (const stage of ["AG40A", "AG40B", "AG40C", "AG40D"]) {
  if (!chain.closed_chain.some((item) => item.stage_id === stage && item.passed === true)) {
    fail(`Missing passed closed stage ${stage}.`);
  }
}
if (chain.closed_successfully !== true) fail("AG40 chain must close successfully.");

for (const [key, value] of Object.entries(summary.summary)) {
  if (value !== true) fail(`Stabilisation summary must be true: ${key}`);
}

if (sop.ready_for_ag41a !== true) fail("SOP readiness missing.");
if (sop.next_stage_id !== "AG41A") fail("SOP next stage must be AG41A.");

for (const [key, value] of Object.entries(carry.blocked_items)) {
  if (value !== false) fail(`Carry-forward blocker must remain false: ${key}`);
}

if (readiness.ready_for_ag41a !== true) fail("AG41A readiness missing.");
if (readiness.next_stage_id !== "AG41A") fail("Next stage must be AG41A.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG41A") fail("Boundary must point to AG41A.");
if (review.summary.ready_for_ag41a !== true) fail("Review AG41A readiness missing.");
if (preview.ready_for_ag41a !== 1) fail("Preview AG41A readiness missing.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!packageJson.scripts?.["generate:ag40z"]) fail("Missing generate:ag40z script.");
if (!packageJson.scripts?.["validate:ag40z"]) fail("Missing validate:ag40z script.");
if (!packageJson.scripts?.["validate:project"]?.includes("npm run validate:ag40z")) {
  fail("validate:project must include validate:ag40z.");
}

pass("AG40Z Dynamic Stabilisation Closure is present.");
pass("AG40 live smoke-test chain is closed.");
pass("Dynamic Publishing SOP readiness is valid.");
pass("No login submission, credentials, session, public mutation, database write, deployment, SQL grant execution or service-role key is recorded.");
