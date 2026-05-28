import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
function fail(msg) { console.error(`❌ AG40B validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag40a-live-article-url-test-package.json",
  "data/content-intelligence/backend-architecture/ag40a-live-article-url-result-record.json",
  "data/content-intelligence/quality-registry/ag40a-admin-editor-workflow-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag40a-to-ag40b-admin-editor-workflow-test-boundary.json",

  "data/content-intelligence/quality-reviews/ag40b-admin-editor-workflow-test.json",
  "data/content-intelligence/backend-architecture/ag40b-admin-editor-workflow-test-package.json",
  "data/content-intelligence/backend-architecture/ag40b-admin-editor-route-result-record.json",
  "data/content-intelligence/backend-architecture/ag40b-workflow-surface-result-record.json",
  "data/content-intelligence/backend-architecture/ag40b-operator-approval-record.json",
  "data/content-intelligence/backend-architecture/ag40b-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag40b-admin-editor-workflow-test-blocker-register.json",
  "data/content-intelligence/quality-registry/ag40b-public-listing-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag40b-to-ag40c-public-listing-test-boundary.json",
  "data/quality/ag40b-admin-editor-workflow-test.json",
  "data/quality/ag40b-admin-editor-workflow-test-preview.json",
  "docs/quality/AG40B_ADMIN_EDITOR_WORKFLOW_TEST.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag40a = readJson("data/content-intelligence/backend-architecture/ag40a-live-article-url-test-package.json");
const ag40aResult = readJson("data/content-intelligence/backend-architecture/ag40a-live-article-url-result-record.json");
const ag40aReady = readJson("data/content-intelligence/quality-registry/ag40a-admin-editor-workflow-test-readiness-record.json");
const ag40aBoundary = readJson("data/content-intelligence/mutation-plans/ag40a-to-ag40b-admin-editor-workflow-test-boundary.json");

const pkgRecord = readJson("data/content-intelligence/backend-architecture/ag40b-admin-editor-workflow-test-package.json");
const route = readJson("data/content-intelligence/backend-architecture/ag40b-admin-editor-route-result-record.json");
const workflow = readJson("data/content-intelligence/backend-architecture/ag40b-workflow-surface-result-record.json");
const approval = readJson("data/content-intelligence/backend-architecture/ag40b-operator-approval-record.json");
const noMutation = readJson("data/content-intelligence/backend-architecture/ag40b-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag40b-public-listing-test-readiness-record.json");
const review = readJson("data/content-intelligence/quality-reviews/ag40b-admin-editor-workflow-test.json");
const preview = readJson("data/quality/ag40b-admin-editor-workflow-test-preview.json");
const packageJson = readJson("package.json");

if (ag40a.status !== "live_article_url_test_created_ready_for_ag40b") fail("AG40A source mismatch.");
if (ag40aResult.live_url_test_passed !== true) fail("AG40A live URL must pass.");
if (ag40aReady.ready_for_ag40b !== true) fail("AG40A readiness must allow AG40B.");
if (ag40aBoundary.next_stage_id !== "AG40B") fail("AG40A boundary must point to AG40B.");

if (approval.status !== "operator_approval_recorded_for_read_only_admin_editor_workflow_test") fail("Approval record mismatch.");
if (route.workflow_surface_test_passed !== true) fail("Route workflow surface test must pass.");
if (route.login_surfaces_passed !== true) fail("Login surfaces must pass.");
if (route.dashboard_surfaces_available !== true) fail("Dashboard/guarded surfaces must pass.");
if (workflow.workflow_surface_test_passed !== true) fail("Workflow surface result must pass.");

for (const item of route.route_results) {
  if (item.route_available !== true) fail(`Route unavailable: ${item.route_id}`);
}

for (const check of workflow.workflow_checks) {
  if (check.passed !== true) fail(`Workflow check failed: ${check.check_id}`);
}

if (noMutation.audit_passed !== true) fail("No-mutation audit must pass.");
for (const check of noMutation.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (pkgRecord.status !== "admin_editor_workflow_test_created_ready_for_ag40c") fail("Package status mismatch.");
if (pkgRecord.test_decision.admin_editor_workflow_test_executed !== true) fail("Workflow test executed missing.");
if (pkgRecord.test_decision.admin_editor_workflow_test_passed !== true) fail("Workflow test passed missing.");
if (pkgRecord.test_decision.proceed_to_ag40c_public_listing_test !== true) fail("AG40C readiness missing.");

for (const flag of [
  "login_form_submitted",
  "credentials_used",
  "session_created",
  "public_mutation_approved_now",
  "execution_authorized_now",
  "real_publish_executed",
  "database_write_done",
  "public_article_mutated",
  "deployment_done",
  "public_mutation_done",
  "service_role_key_recorded",
  "service_role_key_exposed",
  "anon_access_granted",
  "sql_grants_executed"
]) {
  if (pkgRecord.test_decision[flag] !== false) fail(`${flag} must be false.`);
}

if (readiness.ready_for_ag40c !== true) fail("AG40C readiness missing.");
if (readiness.next_stage_id !== "AG40C") fail("Next stage must be AG40C.");
if (review.summary.ready_for_ag40c !== true) fail("Review AG40C readiness missing.");
if (preview.ready_for_ag40c !== 1) fail("Preview AG40C readiness missing.");
if (preview.login_form_submitted !== 0) fail("Preview login submission must be 0.");
if (preview.credentials_used !== 0) fail("Preview credentials used must be 0.");
if (preview.session_created !== 0) fail("Preview session created must be 0.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.database_write_done !== 0) fail("Preview database write must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!packageJson.scripts?.["generate:ag40b"]) fail("Missing generate:ag40b script.");
if (!packageJson.scripts?.["validate:ag40b"]) fail("Missing validate:ag40b script.");
if (!packageJson.scripts?.["validate:project"]?.includes("npm run validate:ag40b")) {
  fail("validate:project must include validate:ag40b.");
}

pass("AG40B Admin/Editor Workflow Test is present.");
pass("Admin/Editor workflow surfaces responded successfully in read-only mode.");
pass("No-mutation audit is valid.");
pass("AG40C Public Listing Test readiness is valid.");
pass("No login submission, credentials, session, public mutation, database write, deployment, SQL grant execution or service-role key is recorded.");
