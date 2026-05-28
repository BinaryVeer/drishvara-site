import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
function fail(msg) { console.error(`❌ AG40D validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag40a-live-article-url-test-package.json",
  "data/content-intelligence/backend-architecture/ag40a-live-article-url-result-record.json",
  "data/content-intelligence/backend-architecture/ag40b-admin-editor-workflow-test-package.json",
  "data/content-intelligence/backend-architecture/ag40c-public-listing-test-package.json",
  "data/content-intelligence/quality-registry/ag40c-stabilisation-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag40c-to-ag40d-stabilisation-audit-boundary.json",

  "data/content-intelligence/quality-reviews/ag40d-stabilisation-audit.json",
  "data/content-intelligence/backend-architecture/ag40d-stabilisation-audit.json",
  "data/content-intelligence/backend-architecture/ag40d-live-smoke-chain-audit-register.json",
  "data/content-intelligence/backend-architecture/ag40d-read-only-test-continuity-audit-register.json",
  "data/content-intelligence/backend-architecture/ag40d-no-mutation-continuity-audit-register.json",
  "data/content-intelligence/quality-registry/ag40d-stabilisation-audit-blocker-register.json",
  "data/content-intelligence/quality-registry/ag40d-dynamic-stabilisation-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag40d-to-ag40z-dynamic-stabilisation-closure-boundary.json",
  "data/quality/ag40d-stabilisation-audit.json",
  "data/quality/ag40d-stabilisation-audit-preview.json",
  "docs/quality/AG40D_STABILISATION_AUDIT.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag40a = readJson("data/content-intelligence/backend-architecture/ag40a-live-article-url-test-package.json");
const ag40aResult = readJson("data/content-intelligence/backend-architecture/ag40a-live-article-url-result-record.json");
const ag40b = readJson("data/content-intelligence/backend-architecture/ag40b-admin-editor-workflow-test-package.json");
const ag40c = readJson("data/content-intelligence/backend-architecture/ag40c-public-listing-test-package.json");
const ag40cReady = readJson("data/content-intelligence/quality-registry/ag40c-stabilisation-audit-readiness-record.json");
const ag40cBoundary = readJson("data/content-intelligence/mutation-plans/ag40c-to-ag40d-stabilisation-audit-boundary.json");

const audit = readJson("data/content-intelligence/backend-architecture/ag40d-stabilisation-audit.json");
const chainAudit = readJson("data/content-intelligence/backend-architecture/ag40d-live-smoke-chain-audit-register.json");
const readOnlyAudit = readJson("data/content-intelligence/backend-architecture/ag40d-read-only-test-continuity-audit-register.json");
const noMutationAudit = readJson("data/content-intelligence/backend-architecture/ag40d-no-mutation-continuity-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag40d-dynamic-stabilisation-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag40d-to-ag40z-dynamic-stabilisation-closure-boundary.json");
const review = readJson("data/content-intelligence/quality-reviews/ag40d-stabilisation-audit.json");
const preview = readJson("data/quality/ag40d-stabilisation-audit-preview.json");
const packageJson = readJson("package.json");

if (ag40a.status !== "live_article_url_test_created_ready_for_ag40b") fail("AG40A status mismatch.");
if (ag40aResult.live_url_test_passed !== true) fail("AG40A live URL must pass.");
if (ag40b.status !== "admin_editor_workflow_test_created_ready_for_ag40c") fail("AG40B status mismatch.");
if (ag40b.test_decision.admin_editor_workflow_test_passed !== true) fail("AG40B must pass.");
if (ag40c.status !== "public_listing_test_created_ready_for_ag40d") fail("AG40C status mismatch.");
if (ag40c.test_decision.public_listing_test_passed !== true) fail("AG40C must pass.");
if (ag40cReady.ready_for_ag40d !== true) fail("AG40C readiness must allow AG40D.");
if (ag40cBoundary.next_stage_id !== "AG40D") fail("AG40C boundary must point to AG40D.");

if (chainAudit.all_chain_items_passed !== true) fail("Live smoke chain audit must pass.");
if (chainAudit.chain_length !== 3) fail("Live smoke chain length must be 3.");
if (readOnlyAudit.audit_passed !== true) fail("Read-only continuity audit must pass.");
if (noMutationAudit.audit_passed !== true) fail("No-mutation continuity audit must pass.");

for (const item of [readOnlyAudit, noMutationAudit]) {
  for (const check of item.checks) {
    if (check.passed !== true) fail(`${item.title} check failed: ${check.check_id}`);
  }
}

if (audit.status !== "stabilisation_audit_created_ready_for_ag40z_closure") fail("Audit status mismatch.");
if (audit.audit_decision.all_audits_passed !== true) fail("All audits must pass.");
if (audit.audit_decision.proceed_to_ag40z_dynamic_stabilisation_closure !== true) fail("AG40Z readiness missing.");

for (const flag of [
  "login_form_submitted",
  "credentials_used",
  "session_created",
  "public_mutation_approved_now",
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
  if (audit.audit_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (readiness.ready_for_ag40z !== true) fail("AG40Z readiness missing.");
if (readiness.next_stage_id !== "AG40Z") fail("Next stage must be AG40Z.");
if (readiness.deployment_allowed_next !== false) fail("Deployment must remain false.");
if (readiness.public_mutation_allowed_next !== false) fail("Public mutation must remain false.");
if (readiness.real_publish_allowed_next !== false) fail("Real publish must remain false.");
if (readiness.database_write_allowed_next !== false) fail("Database write must remain false.");
if (readiness.service_role_key_required_in_repo_or_chat !== false) fail("Service-role key must not be required.");

if (boundary.next_stage_id !== "AG40Z") fail("Boundary must point to AG40Z.");
if (review.summary.ready_for_ag40z !== true) fail("Review AG40Z readiness missing.");
if (preview.ready_for_ag40z !== 1) fail("Preview AG40Z readiness missing.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.database_write_done !== 0) fail("Preview DB write must be 0.");
if (preview.deployment_done !== 0) fail("Preview deployment must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!packageJson.scripts?.["generate:ag40d"]) fail("Missing generate:ag40d script.");
if (!packageJson.scripts?.["validate:ag40d"]) fail("Missing validate:ag40d script.");
if (!packageJson.scripts?.["validate:project"]?.includes("npm run validate:ag40d")) {
  fail("validate:project must include validate:ag40d.");
}

pass("AG40D Stabilisation Audit is present.");
pass("AG40A-AG40C live smoke-test chain audit is valid.");
pass("Read-only and no-mutation continuity audits are valid.");
pass("AG40Z Dynamic Stabilisation Closure readiness is valid.");
pass("No login submission, credentials, session, public mutation, database write, deployment, SQL grant execution or service-role key is recorded.");
