import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
function fail(msg) { console.error(`❌ AG40A validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag39z-controlled-execution-closure.json",
  "data/content-intelligence/quality-registry/ag39z-live-article-url-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag39z-to-ag40a-live-article-url-test-boundary.json",

  "data/content-intelligence/quality-reviews/ag40a-live-article-url-test.json",
  "data/content-intelligence/backend-architecture/ag40a-live-article-url-test-package.json",
  "data/content-intelligence/backend-architecture/ag40a-live-article-url-result-record.json",
  "data/content-intelligence/backend-architecture/ag40a-live-url-operator-approval-record.json",
  "data/content-intelligence/backend-architecture/ag40a-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag40a-live-article-url-test-blocker-register.json",
  "data/content-intelligence/quality-registry/ag40a-admin-editor-workflow-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag40a-to-ag40b-admin-editor-workflow-test-boundary.json",
  "data/quality/ag40a-live-article-url-test.json",
  "data/quality/ag40a-live-article-url-test-preview.json",
  "docs/quality/AG40A_LIVE_ARTICLE_URL_TEST.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag39z = readJson("data/content-intelligence/backend-architecture/ag39z-controlled-execution-closure.json");
const ag39zReady = readJson("data/content-intelligence/quality-registry/ag39z-live-article-url-test-readiness-record.json");
const ag39zBoundary = readJson("data/content-intelligence/mutation-plans/ag39z-to-ag40a-live-article-url-test-boundary.json");

const pkgRecord = readJson("data/content-intelligence/backend-architecture/ag40a-live-article-url-test-package.json");
const result = readJson("data/content-intelligence/backend-architecture/ag40a-live-article-url-result-record.json");
const approval = readJson("data/content-intelligence/backend-architecture/ag40a-live-url-operator-approval-record.json");
const noMutation = readJson("data/content-intelligence/backend-architecture/ag40a-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag40a-admin-editor-workflow-test-readiness-record.json");
const review = readJson("data/content-intelligence/quality-reviews/ag40a-live-article-url-test.json");
const preview = readJson("data/quality/ag40a-live-article-url-test-preview.json");
const packageJson = readJson("package.json");

if (ag39z.status !== "controlled_execution_closure_created_ready_for_ag40a_live_article_url_test") fail("AG39Z source mismatch.");
if (ag39zReady.ready_for_ag40a !== true) fail("AG39Z readiness must allow AG40A.");
if (ag39zBoundary.next_stage_id !== "AG40A") fail("AG39Z boundary must point to AG40A.");

if (approval.status !== "operator_approval_recorded_for_read_only_live_url_test") fail("Approval record mismatch.");
if (result.live_url_test_passed !== true) fail("Live URL test must pass.");
if (result.http_status < 200 || result.http_status >= 400) fail("HTTP status must be 2xx/3xx.");
if (result.has_html !== true) fail("Live response must contain HTML.");
if (result.has_article_signal !== true) fail("Live response must contain Drishvara/article signal.");
if (result.read_only_request_only !== true) fail("AG40A must remain read-only.");

if (noMutation.audit_passed !== true) fail("No-mutation audit must pass.");
for (const check of noMutation.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (pkgRecord.status !== "live_article_url_test_created_ready_for_ag40b") fail("Package status mismatch.");
if (pkgRecord.test_decision.live_article_url_test_executed !== true) fail("Live URL test executed missing.");
if (pkgRecord.test_decision.live_article_url_test_passed !== true) fail("Live URL test passed missing.");
if (pkgRecord.test_decision.proceed_to_ag40b_admin_editor_workflow_test !== true) fail("AG40B readiness missing.");

for (const flag of [
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

if (readiness.ready_for_ag40b !== true) fail("AG40B readiness missing.");
if (review.summary.ready_for_ag40b !== true) fail("Review AG40B readiness missing.");
if (preview.ready_for_ag40b !== 1) fail("Preview AG40B readiness missing.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.database_write_done !== 0) fail("Preview database write must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!packageJson.scripts?.["generate:ag40a"]) fail("Missing generate:ag40a script.");
if (!packageJson.scripts?.["validate:ag40a"]) fail("Missing validate:ag40a script.");
if (!packageJson.scripts?.["validate:project"]?.includes("npm run validate:ag40a")) {
  fail("validate:project must include validate:ag40a.");
}

pass("AG40A Live Article URL Test is present.");
pass("Live article URL responded successfully in read-only mode.");
pass("No-mutation audit is valid.");
pass("AG40B Admin/Editor Workflow Test readiness is valid.");
pass("No public mutation, real publish, database write, deployment, SQL grant execution or service-role key is recorded.");
