import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG56.8 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag56-7-audit-log-rollback-readiness-verification.json",
  "data/content-intelligence/content-loop/ag56-7-ui-content-logic-carry-forward-audit.json",
  "data/content-intelligence/content-loop/ag56-7-unresolved-pre-go-live-register.json",
  "data/content-intelligence/quality-registry/ag56-7-ag56-8-version-01-go-live-decision-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag56-7-to-ag56-8-version-01-go-live-decision-boundary.json",

  "data/content-intelligence/quality-reviews/ag56-6-word-panchang-reflection-vedic-preview-smoke-test.json",
  "data/content-intelligence/quality-reviews/ag56-5-homepage-module-surface-verification.json",
  "data/content-intelligence/quality-reviews/ag56-4-public-url-listing-verification.json",
  "data/content-intelligence/quality-reviews/ag56-3-controlled-publish-test.json",
  "data/content-intelligence/quality-reviews/ag56-2-admin-editor-review-workflow-test.json",
  "data/content-intelligence/quality-reviews/ag56-1-controlled-dynamic-article-generation-test.json",

  "data/content-intelligence/quality-reviews/ag56-8-version-01-go-live-decision.json",
  "data/content-intelligence/content-loop/ag56-8-source-consumption-record.json",
  "data/content-intelligence/content-loop/ag56-8-controlled-test-result-summary.json",
  "data/content-intelligence/content-loop/ag56-8-go-no-go-decision-record.json",
  "data/content-intelligence/content-loop/ag56-8-defect-watch-item-decision-register.json",
  "data/content-intelligence/content-loop/ag56-8-v01-live-decision-boundary.json",
  "data/content-intelligence/backend-architecture/ag56-8-no-deployment-execution-audit.json",
  "data/content-intelligence/backend-architecture/ag56-8-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag56-8-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag56-8-ag56z-version-01-live-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag56-8-to-ag56z-version-01-live-closure-boundary.json",
  "data/quality/ag56-8-version-01-go-live-decision.json",
  "data/quality/ag56-8-version-01-go-live-decision-preview.json",
  "docs/quality/AG56_8_VERSION_01_GO_LIVE_DECISION.md",
  "scripts/generate-ag56-8-version-01-go-live-decision.mjs",
  "scripts/validate-ag56-8-version-01-go-live-decision.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag56_7Review = readJson("data/content-intelligence/quality-reviews/ag56-7-audit-log-rollback-readiness-verification.json");
const ag56_7Ui = readJson("data/content-intelligence/content-loop/ag56-7-ui-content-logic-carry-forward-audit.json");
const ag56_7Unresolved = readJson("data/content-intelligence/content-loop/ag56-7-unresolved-pre-go-live-register.json");
const ag56_7Readiness = readJson("data/content-intelligence/quality-registry/ag56-7-ag56-8-version-01-go-live-decision-readiness-record.json");
const ag56_7Boundary = readJson("data/content-intelligence/mutation-plans/ag56-7-to-ag56-8-version-01-go-live-decision-boundary.json");

if (ag56_7Review.status !== "audit_log_rollback_readiness_verification_ready_for_ag56_8") fail("AG56.7 status mismatch.");
if (ag56_7Review.summary.ready_for_ag56_8_version_01_go_live_decision !== true) fail("AG56.7 must be ready for AG56.8.");
if (ag56_7Review.summary.daily_signal_default_count !== 10) fail("AG45 daily signal count must be 10.");
if (ag56_7Review.summary.daily_signal_india_count !== 6) fail("AG45 India signal count must be 6.");
if (ag56_7Review.summary.daily_signal_international_count !== 4) fail("AG45 International signal count must be 4.");
if (ag56_7Review.summary.homepage_doctrine !== "Discover → Read → Reflect") fail("Homepage doctrine mismatch.");
if (ag56_7Ui.audit_passed !== true) fail("AG56.7 UI/content carry-forward audit must pass.");
if (ag56_7Unresolved.audit_passed !== true) fail("AG56.7 unresolved register must pass.");
if (ag56_7Unresolved.open_watch_item_count !== 5) fail("AG56.7 open watch count must be 5.");
if (ag56_7Readiness.ready_for_ag56_8 !== true) fail("AG56.7 readiness must permit AG56.8.");
if (ag56_7Boundary.next_stage_id !== "AG56.8") fail("AG56.7 boundary must point to AG56.8.");

const expectedStatuses = {
  "data/content-intelligence/quality-reviews/ag56-1-controlled-dynamic-article-generation-test.json": "controlled_dynamic_article_generation_test_ready_for_ag56_2",
  "data/content-intelligence/quality-reviews/ag56-2-admin-editor-review-workflow-test.json": "admin_editor_review_workflow_test_ready_for_ag56_3",
  "data/content-intelligence/quality-reviews/ag56-3-controlled-publish-test.json": "controlled_publish_test_ready_for_ag56_4",
  "data/content-intelligence/quality-reviews/ag56-4-public-url-listing-verification.json": "public_url_listing_verification_ready_for_ag56_5",
  "data/content-intelligence/quality-reviews/ag56-5-homepage-module-surface-verification.json": "homepage_module_surface_verification_ready_for_ag56_6",
  "data/content-intelligence/quality-reviews/ag56-6-word-panchang-reflection-vedic-preview-smoke-test.json": "word_panchang_reflection_vedic_preview_smoke_test_ready_for_ag56_7"
};

for (const [file, status] of Object.entries(expectedStatuses)) {
  const obj = readJson(file);
  if (obj.status !== status) fail(`${file} status mismatch.`);
}

const review = readJson("data/content-intelligence/quality-reviews/ag56-8-version-01-go-live-decision.json");
const source = readJson("data/content-intelligence/content-loop/ag56-8-source-consumption-record.json");
const summary = readJson("data/content-intelligence/content-loop/ag56-8-controlled-test-result-summary.json");
const decision = readJson("data/content-intelligence/content-loop/ag56-8-go-no-go-decision-record.json");
const defect = readJson("data/content-intelligence/content-loop/ag56-8-defect-watch-item-decision-register.json");
const decisionBoundary = readJson("data/content-intelligence/content-loop/ag56-8-v01-live-decision-boundary.json");
const noDeployment = readJson("data/content-intelligence/backend-architecture/ag56-8-no-deployment-execution-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag56-8-no-backend-auth-rls-database-runtime-audit.json");
const noV02 = readJson("data/content-intelligence/backend-architecture/ag56-8-no-v02-expansion-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag56-8-ag56z-version-01-live-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag56-8-to-ag56z-version-01-live-closure-boundary.json");
const preview = readJson("data/quality/ag56-8-version-01-go-live-decision-preview.json");
const pkg = readJson("package.json");

if (review.status !== "version_01_go_live_decision_ready_for_ag56z") fail("AG56.8 review status mismatch.");

for (const key of [
  "ag56_8_version_01_go_live_decision_recorded",
  "ag56_1_to_ag56_7_consumed",
  "controlled_test_result_summary_recorded",
  "go_no_go_decision_recorded",
  "defect_watch_item_decision_register_recorded",
  "v01_live_decision_boundary_recorded",
  "conditional_go_for_ag56z_recorded",
  "ready_for_ag56z_version_01_live_closure"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.decision !== "CONDITIONAL_GO_FOR_AG56Z_WITH_PRE_LIVE_DEFECT_LIST") fail("Decision mismatch.");
if (review.summary.decision_class !== "CONDITIONAL_GO") fail("Decision class mismatch.");
if (review.summary.full_public_go_live_approved_now !== false) fail("Full public go-live must not be approved.");
if (review.summary.open_watch_item_count_for_ag56z !== 5) fail("AG56Z watch count must be 5.");
if (review.summary.daily_signal_default_count !== 10) fail("Daily signal count must be 10 in AG56.8.");
if (review.summary.daily_signal_india_count !== 6) fail("India signal count must be 6 in AG56.8.");
if (review.summary.daily_signal_international_count !== 4) fail("International signal count must be 4 in AG56.8.");
if (review.summary.homepage_doctrine !== "Discover → Read → Reflect") fail("Homepage doctrine mismatch in AG56.8.");

if (source.status !== "source_consumption_recorded") fail("Source consumption mismatch.");
if (summary.audit_passed !== true) fail("Controlled test summary must pass.");
if (summary.controlled_test_passed_for_closure !== true) fail("Controlled test must pass for closure.");
if (summary.full_public_go_live_ready !== false) fail("Full public go-live readiness must be false.");

if (decision.audit_passed !== true) fail("Go/no-go decision must pass.");
if (decision.decision !== "CONDITIONAL_GO_FOR_AG56Z_WITH_PRE_LIVE_DEFECT_LIST") fail("Go/no-go decision mismatch.");
if (decision.decision_class !== "CONDITIONAL_GO") fail("Go/no-go decision class mismatch.");
if (decision.full_public_go_live_approved_now !== false) fail("Full public go-live must remain false.");
if (decision.deployment_approved_now !== false) fail("Deployment approval must remain false.");
if (decision.backend_runtime_approved_now !== false) fail("Backend runtime approval must remain false.");
if (decision.v02_expansion_approved_now !== false) fail("V02 expansion approval must remain false.");

if (defect.audit_passed !== true) fail("Defect watch decision must pass.");
if (defect.open_watch_item_count !== 5) fail("Defect watch count must be 5.");
if (defect.decision_treatment !== "carry_forward_to_ag56z_as_pre_live_defect_list") fail("Defect treatment mismatch.");
if (defect.daily_signal_rule_decision.required_default_total !== 10) fail("Daily signal defect total mismatch.");
if (defect.daily_signal_rule_decision.required_india_signals !== 6) fail("Daily signal India defect mismatch.");
if (defect.daily_signal_rule_decision.required_international_signals !== 4) fail("Daily signal International defect mismatch.");

for (const item of defect.watch_items) {
  if (item.blocks_full_public_go_live_now !== true) fail(`Watch item must block full public go-live: ${item.issue_id}`);
  if (item.blocks_ag56z_closure_record !== false) fail(`Watch item must not block AG56Z closure record: ${item.issue_id}`);
}

for (const rule of [
  "AG56.8 decision is CONDITIONAL_GO for AG56Z closure with a pre-live defect list.",
  "AG56.8 does not approve full public go-live.",
  "AG56.8 does not deploy or trigger Vercel/GitHub release.",
  "AG56.8 does not publish or mutate public pages.",
  "AG56.8 does not activate backend/Auth/Supabase/RLS/API/database runtime.",
  "AG56.8 does not activate V02 expansion."
]) {
  if (!decisionBoundary.boundary_rules.includes(rule)) fail(`Decision boundary missing: ${rule}`);
}

for (const audit of [noDeployment, noBackend, noV02]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag56z_version_01_live_closure") fail("AG56Z readiness status mismatch.");
if (readiness.ready_for_ag56z !== true) fail("AG56Z readiness must be true.");
if (readiness.next_stage_id !== "AG56Z") fail("Readiness must point to AG56Z.");
if (readiness.closure_mode !== "conditional_live_decision_closure_with_pre_live_defect_list") fail("AG56Z closure mode mismatch.");
if (readiness.open_watch_item_count_for_ag56z !== 5) fail("AG56Z open watch count must be 5.");
if (boundary.next_stage_id !== "AG56Z") fail("Boundary must point to AG56Z.");

for (const key of [
  "full_public_go_live_approved",
  "deployment_approved",
  "deployment_performed",
  "actual_deployment_triggered",
  "vercel_deployment_triggered",
  "github_release_created",
  "live_public_check_executed",
  "public_page_mutation_enabled",
  "public_content_mutation_enabled",
  "content_publishing_enabled",
  "homepage_live_updated",
  "live_listing_updated",
  "public_url_live",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "service_role_key_used",
  "service_role_key_exposed",
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "runtime_publish_queue_enabled",
  "runtime_cms_enabled",
  "public_dashboard_exposed",
  "automated_external_fetch_enabled",
  "rollback_operation_executed",
  "git_revert_executed",
  "git_reset_executed",
  "actual_go_live_approval_granted",
  "v02_item_activated"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag56-8"]) fail("Missing package script: generate:ag56-8");
if (!pkg.scripts?.["validate:ag56-8"]) fail("Missing package script: validate:ag56-8");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag56-8")) fail("validate:project must include validate:ag56-8.");

pass("AG56.8 Version 01 Go-Live Decision is present.");
pass("AG56.1–AG56.7 outputs are consumed.");
pass("Controlled test result summary is valid.");
pass("Go/no-go decision is CONDITIONAL_GO with pre-live defect list.");
pass("Defect/watch-item decision register is valid.");
pass("V01 live decision boundary is valid.");
pass("No deployment execution audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("No V02 expansion audit is valid.");
pass("AG56Z Version 01 Live Closure readiness is valid.");
