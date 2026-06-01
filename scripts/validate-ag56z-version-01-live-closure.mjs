import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG56Z validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag56-8-version-01-go-live-decision.json",
  "data/content-intelligence/content-loop/ag56-8-go-no-go-decision-record.json",
  "data/content-intelligence/content-loop/ag56-8-defect-watch-item-decision-register.json",
  "data/content-intelligence/quality-registry/ag56-8-ag56z-version-01-live-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag56-8-to-ag56z-version-01-live-closure-boundary.json",

  "data/content-intelligence/quality-reviews/ag56z-version-01-live-closure.json",
  "data/content-intelligence/content-loop/ag56z-source-consumption-record.json",
  "data/content-intelligence/content-loop/ag56z-version-01-live-closure-record.json",
  "data/content-intelligence/content-loop/ag56z-pre-live-defect-list-record.json",
  "data/content-intelligence/content-loop/ag56z-final-live-closure-boundary.json",
  "data/content-intelligence/content-loop/ag56z-post-closure-handoff-record.json",
  "data/content-intelligence/backend-architecture/ag56z-no-deployment-execution-audit.json",
  "data/content-intelligence/backend-architecture/ag56z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag56z-no-v02-expansion-audit.json",
  "data/content-intelligence/quality-registry/ag56z-pre-live-defect-clearance-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag56z-to-pre-live-defect-clearance-boundary.json",
  "data/quality/ag56z-version-01-live-closure.json",
  "data/quality/ag56z-version-01-live-closure-preview.json",
  "docs/quality/AG56Z_VERSION_01_LIVE_CLOSURE.md",
  "scripts/generate-ag56z-version-01-live-closure.mjs",
  "scripts/validate-ag56z-version-01-live-closure.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag56_8Review = readJson("data/content-intelligence/quality-reviews/ag56-8-version-01-go-live-decision.json");
const ag56_8Decision = readJson("data/content-intelligence/content-loop/ag56-8-go-no-go-decision-record.json");
const ag56_8Defect = readJson("data/content-intelligence/content-loop/ag56-8-defect-watch-item-decision-register.json");
const ag56_8Readiness = readJson("data/content-intelligence/quality-registry/ag56-8-ag56z-version-01-live-closure-readiness-record.json");
const ag56_8Boundary = readJson("data/content-intelligence/mutation-plans/ag56-8-to-ag56z-version-01-live-closure-boundary.json");

if (ag56_8Review.status !== "version_01_go_live_decision_ready_for_ag56z") fail("AG56.8 status mismatch.");
if (ag56_8Decision.decision !== "CONDITIONAL_GO_FOR_AG56Z_WITH_PRE_LIVE_DEFECT_LIST") fail("AG56.8 decision mismatch.");
if (ag56_8Decision.decision_class !== "CONDITIONAL_GO") fail("AG56.8 decision class mismatch.");
if (ag56_8Decision.full_public_go_live_approved_now !== false) fail("Full public go-live must not be approved.");
if (ag56_8Defect.open_watch_item_count !== 5) fail("AG56.8 defect count must be 5.");
if (ag56_8Readiness.ready_for_ag56z !== true) fail("AG56Z readiness missing.");
if (ag56_8Boundary.next_stage_id !== "AG56Z") fail("AG56.8 boundary must point to AG56Z.");

const review = readJson("data/content-intelligence/quality-reviews/ag56z-version-01-live-closure.json");
const source = readJson("data/content-intelligence/content-loop/ag56z-source-consumption-record.json");
const closure = readJson("data/content-intelligence/content-loop/ag56z-version-01-live-closure-record.json");
const defectList = readJson("data/content-intelligence/content-loop/ag56z-pre-live-defect-list-record.json");
const finalBoundary = readJson("data/content-intelligence/content-loop/ag56z-final-live-closure-boundary.json");
const handoff = readJson("data/content-intelligence/content-loop/ag56z-post-closure-handoff-record.json");
const noDeployment = readJson("data/content-intelligence/backend-architecture/ag56z-no-deployment-execution-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag56z-no-backend-auth-rls-database-runtime-audit.json");
const noV02 = readJson("data/content-intelligence/backend-architecture/ag56z-no-v02-expansion-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag56z-pre-live-defect-clearance-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag56z-to-pre-live-defect-clearance-boundary.json");
const preview = readJson("data/quality/ag56z-version-01-live-closure-preview.json");
const pkg = readJson("package.json");

if (review.status !== "version_01_live_closure_completed_conditionally") fail("AG56Z review status mismatch.");

for (const key of [
  "ag56z_version_01_live_closure_recorded",
  "ag56_1_to_ag56_8_consumed",
  "conditional_go_closure_recorded",
  "pre_live_defect_list_recorded",
  "final_live_closure_boundary_recorded",
  "post_closure_handoff_recorded",
  "pre_live_defect_clearance_readiness_recorded"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (source.status !== "source_consumption_recorded") fail("Source consumption mismatch.");
if (closure.status !== "version_01_live_closure_completed_conditionally") fail("Closure status mismatch.");
if (closure.closure_mode !== "CONDITIONAL_GO_FOR_AG56Z_WITH_PRE_LIVE_DEFECT_LIST") fail("Closure mode mismatch.");
if (closure.full_public_go_live_approved_now !== false) fail("Closure must not approve full public go-live.");
if (closure.deployment_approved_now !== false) fail("Closure must not approve deployment.");
if (closure.backend_runtime_approved_now !== false) fail("Closure must not approve backend runtime.");
if (closure.v02_expansion_approved_now !== false) fail("Closure must not approve V02.");

if (defectList.audit_passed !== true) fail("Pre-live defect list must pass.");
if (defectList.open_watch_item_count !== 5) fail("Pre-live defect count must be 5.");
if (defectList.required_logic_to_preserve.daily_signal_default_count !== 10) fail("Daily signal total must be 10.");
if (defectList.required_logic_to_preserve.daily_signal_india_count !== 6) fail("India signal count must be 6.");
if (defectList.required_logic_to_preserve.daily_signal_international_count !== 4) fail("International signal count must be 4.");
if (defectList.required_logic_to_preserve.homepage_doctrine !== "Discover → Read → Reflect") fail("Homepage doctrine mismatch.");
if (defectList.defects.length !== 5) fail("There must be five defects.");

for (const rule of [
  "AG56Z closes AG56 as CONDITIONAL_GO only.",
  "AG56Z does not approve full public go-live.",
  "AG56Z does not deploy or trigger Vercel/GitHub release.",
  "AG56Z does not publish or mutate public pages.",
  "AG56Z does not activate backend/Auth/Supabase/RLS/API/database runtime.",
  "AG56Z does not activate V02 expansion."
]) {
  if (!finalBoundary.boundary_rules.includes(rule)) fail(`Final boundary missing: ${rule}`);
}

if (handoff.status !== "post_closure_handoff_recorded") fail("Post-closure handoff mismatch.");
if (handoff.recommended_next_stage !== "Pre-live defect clearance / public UI-content correction gate") fail("Next stage recommendation mismatch.");

for (const audit of [noDeployment, noBackend, noV02]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_pre_live_defect_clearance") fail("Pre-live defect clearance readiness mismatch.");
if (readiness.ready_for_pre_live_defect_clearance !== true) fail("Pre-live defect clearance readiness must be true.");
if (readiness.open_pre_live_defect_count !== 5) fail("Readiness defect count must be 5.");
if (boundary.status !== "pre_live_defect_clearance_boundary_created") fail("Pre-live defect clearance boundary mismatch.");

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

if (!pkg.scripts?.["generate:ag56z"]) fail("Missing package script: generate:ag56z");
if (!pkg.scripts?.["validate:ag56z"]) fail("Missing package script: validate:ag56z");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag56z")) fail("validate:project must include validate:ag56z.");

pass("AG56Z Version 01 Live Closure is present.");
pass("AG56.8 conditional go decision is consumed.");
pass("AG56 controlled content loop is closed conditionally.");
pass("Pre-live defect list is valid.");
pass("Final live closure boundary is valid.");
pass("Post-closure handoff is valid.");
pass("No deployment execution audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("No V02 expansion audit is valid.");
pass("Pre-live defect clearance readiness is valid.");
