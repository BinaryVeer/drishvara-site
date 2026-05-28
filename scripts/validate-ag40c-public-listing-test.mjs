import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) { return fs.existsSync(path.join(root, p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); }
function fail(msg) { console.error(`❌ AG40C validation failed: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ ${msg}`); }

const required = [
  "data/content-intelligence/backend-architecture/ag40b-admin-editor-workflow-test-package.json",
  "data/content-intelligence/backend-architecture/ag40b-admin-editor-route-result-record.json",
  "data/content-intelligence/backend-architecture/ag40b-workflow-surface-result-record.json",
  "data/content-intelligence/quality-registry/ag40b-public-listing-test-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag40b-to-ag40c-public-listing-test-boundary.json",

  "data/content-intelligence/quality-reviews/ag40c-public-listing-test.json",
  "data/content-intelligence/backend-architecture/ag40c-public-listing-test-package.json",
  "data/content-intelligence/backend-architecture/ag40c-public-listing-result-record.json",
  "data/content-intelligence/backend-architecture/ag40c-public-article-link-result-record.json",
  "data/content-intelligence/backend-architecture/ag40c-operator-approval-record.json",
  "data/content-intelligence/backend-architecture/ag40c-no-mutation-audit-register.json",
  "data/content-intelligence/quality-registry/ag40c-public-listing-test-blocker-register.json",
  "data/content-intelligence/quality-registry/ag40c-stabilisation-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag40c-to-ag40d-stabilisation-audit-boundary.json",
  "data/quality/ag40c-public-listing-test.json",
  "data/quality/ag40c-public-listing-test-preview.json",
  "docs/quality/AG40C_PUBLIC_LISTING_TEST.md",
  "package.json"
];

for (const f of required) if (!exists(f)) fail(`Missing file: ${f}`);

const ag40b = readJson("data/content-intelligence/backend-architecture/ag40b-admin-editor-workflow-test-package.json");
const ag40bReady = readJson("data/content-intelligence/quality-registry/ag40b-public-listing-test-readiness-record.json");
const ag40bBoundary = readJson("data/content-intelligence/mutation-plans/ag40b-to-ag40c-public-listing-test-boundary.json");

const pkgRecord = readJson("data/content-intelligence/backend-architecture/ag40c-public-listing-test-package.json");
const listing = readJson("data/content-intelligence/backend-architecture/ag40c-public-listing-result-record.json");
const articleLinks = readJson("data/content-intelligence/backend-architecture/ag40c-public-article-link-result-record.json");
const approval = readJson("data/content-intelligence/backend-architecture/ag40c-operator-approval-record.json");
const noMutation = readJson("data/content-intelligence/backend-architecture/ag40c-no-mutation-audit-register.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag40c-stabilisation-audit-readiness-record.json");
const review = readJson("data/content-intelligence/quality-reviews/ag40c-public-listing-test.json");
const preview = readJson("data/quality/ag40c-public-listing-test-preview.json");
const packageJson = readJson("package.json");

if (ag40b.status !== "admin_editor_workflow_test_created_ready_for_ag40c") fail("AG40B source mismatch.");
if (ag40b.test_decision.admin_editor_workflow_test_passed !== true) fail("AG40B workflow test must pass.");
if (ag40bReady.ready_for_ag40c !== true) fail("AG40B readiness must allow AG40C.");
if (ag40bBoundary.next_stage_id !== "AG40C") fail("AG40B boundary must point to AG40C.");

if (approval.status !== "operator_approval_recorded_for_read_only_public_listing_test") fail("Approval record mismatch.");
if (listing.public_listing_test_passed !== true) fail("Public listing test must pass.");
if (listing.reachable_listing_count < 1) fail("At least one listing surface must be reachable.");
if (listing.listing_with_article_signal_count < 1) fail("At least one listing surface must have listing/article signal.");
if (listing.read_only_get_requests_only !== true) fail("AG40C must remain read-only.");

if (articleLinks.article_link_detection_passed !== true) fail("Article link/listing signal detection must pass.");

if (noMutation.audit_passed !== true) fail("No-mutation audit must pass.");
for (const check of noMutation.checks) {
  if (check.passed !== true) fail(`No-mutation check failed: ${check.check_id}`);
}

if (pkgRecord.status !== "public_listing_test_created_ready_for_ag40d") fail("Package status mismatch.");
if (pkgRecord.test_decision.public_listing_test_executed !== true) fail("Public listing test executed missing.");
if (pkgRecord.test_decision.public_listing_test_passed !== true) fail("Public listing test passed missing.");
if (pkgRecord.test_decision.proceed_to_ag40d_stabilisation_audit !== true) fail("AG40D readiness missing.");

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

if (readiness.ready_for_ag40d !== true) fail("AG40D readiness missing.");
if (readiness.next_stage_id !== "AG40D") fail("Next stage must be AG40D.");
if (review.summary.ready_for_ag40d !== true) fail("Review AG40D readiness missing.");
if (preview.ready_for_ag40d !== 1) fail("Preview AG40D readiness missing.");
if (preview.public_mutation_done !== 0) fail("Preview public mutation must be 0.");
if (preview.database_write_done !== 0) fail("Preview database write must be 0.");
if (preview.service_role_key_exposed !== 0) fail("Preview service-role exposure must be 0.");

if (!packageJson.scripts?.["generate:ag40c"]) fail("Missing generate:ag40c script.");
if (!packageJson.scripts?.["validate:ag40c"]) fail("Missing validate:ag40c script.");
if (!packageJson.scripts?.["validate:project"]?.includes("npm run validate:ag40c")) {
  fail("validate:project must include validate:ag40c.");
}

pass("AG40C Public Listing Test is present.");
pass("Public listing surface responded successfully in read-only mode.");
pass("No-mutation audit is valid.");
pass("AG40D Stabilisation Audit readiness is valid.");
pass("No login submission, credentials, session, public mutation, database write, deployment, SQL grant execution or service-role key is recorded.");
