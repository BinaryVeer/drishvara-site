import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG55A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag54z-release-operations-closure.json",
  "data/content-intelligence/release-operations/ag54z-release-operations-closure-record.json",
  "data/content-intelligence/release-operations/ag54z-ag54a-to-ag54d-consumption-summary.json",
  "data/content-intelligence/release-operations/ag54z-release-operations-posture-record.json",
  "data/content-intelligence/release-operations/ag54z-carry-forward-release-operations-deferral-register.json",
  "data/content-intelligence/ag-roadmap/ag54z-to-ag55-v01-release-candidate-freeze-handoff.json",
  "data/content-intelligence/backend-architecture/ag54z-no-deployment-rollback-publishing-audit.json",
  "data/content-intelligence/backend-architecture/ag54z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag54z-no-service-role-public-mutation-audit.json",
  "data/content-intelligence/quality-registry/ag54z-ag55a-v01-scope-freeze-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag54z-to-ag55a-v01-scope-freeze-boundary.json",
  "data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json",
  "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag55a-v01-scope-freeze.json",
  "data/content-intelligence/release-candidate/ag55a-source-consumption-record.json",
  "data/content-intelligence/release-candidate/ag55a-v01-scope-freeze-register.json",
  "data/content-intelligence/release-candidate/ag55a-v01-included-module-register.json",
  "data/content-intelligence/release-candidate/ag55a-v02-deferral-register.json",
  "data/content-intelligence/release-candidate/ag55a-ag42-to-ag54-completed-stage-digest.json",
  "data/content-intelligence/release-candidate/ag55a-full-repo-inventory-digest.json",
  "data/content-intelligence/release-candidate/ag55a-v01-scope-freeze-boundary.json",
  "data/content-intelligence/backend-architecture/ag55a-no-controlled-dynamic-content-loop-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag55a-no-deployment-publishing-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag55a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag55a-ag55b-completed-repo-stack-reconciliation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag55a-to-ag55b-completed-repo-stack-reconciliation-boundary.json",
  "data/quality/ag55a-v01-scope-freeze.json",
  "data/quality/ag55a-v01-scope-freeze-preview.json",
  "docs/quality/AG55A_V01_SCOPE_FREEZE.md",
  "scripts/generate-ag55a-v01-scope-freeze.mjs",
  "scripts/validate-ag55a-v01-scope-freeze.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag54zReview = readJson("data/content-intelligence/quality-reviews/ag54z-release-operations-closure.json");
const ag54zClosure = readJson("data/content-intelligence/release-operations/ag54z-release-operations-closure-record.json");
const ag54zPosture = readJson("data/content-intelligence/release-operations/ag54z-release-operations-posture-record.json");
const ag54zCarryForward = readJson("data/content-intelligence/release-operations/ag54z-carry-forward-release-operations-deferral-register.json");
const ag54zHandoff = readJson("data/content-intelligence/ag-roadmap/ag54z-to-ag55-v01-release-candidate-freeze-handoff.json");
const ag54zReadiness = readJson("data/content-intelligence/quality-registry/ag54z-ag55a-v01-scope-freeze-readiness-record.json");
const ag54zBoundary = readJson("data/content-intelligence/mutation-plans/ag54z-to-ag55a-v01-scope-freeze-boundary.json");

if (ag54zReview.status !== "release_operations_closed_ready_for_ag55a") fail("AG54Z status mismatch.");
if (ag54zReview.summary.ready_for_ag55a_v01_scope_freeze !== true) fail("AG54Z must be ready for AG55A.");
if (ag54zClosure.status !== "release_operations_closure_completed") fail("AG54Z closure mismatch.");
if (ag54zPosture.posture_summary.v01_scope_freeze !== "ready_for_AG55A_planning_only") fail("AG54Z V01 scope posture mismatch.");
if (!ag54zCarryForward.deferred_items.includes("actual deployment")) fail("AG54Z deployment deferral missing.");
if (ag54zHandoff.next_stage_id !== "AG55A") fail("AG54Z handoff must point to AG55A.");
if (ag54zReadiness.ready_for_ag55a !== true) fail("AG54Z readiness must permit AG55A.");
if (ag54zBoundary.next_stage_id !== "AG55A") fail("AG54Z boundary must point to AG55A.");

for (const file of [
  "data/content-intelligence/backend-architecture/ag54z-no-deployment-rollback-publishing-audit.json",
  "data/content-intelligence/backend-architecture/ag54z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag54z-no-service-role-public-mutation-audit.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const ag53zReview = readJson("data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json");
const ag52zReview = readJson("data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json");
const ag51zReview = readJson("data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag53zReview.status !== "public_quality_closed_ready_for_ag54a") fail("AG53Z status mismatch.");
if (ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") fail("AG52Z status mismatch.");
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") fail("AG51Z status mismatch.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag55a-v01-scope-freeze.json");
const sourceConsumption = readJson("data/content-intelligence/release-candidate/ag55a-source-consumption-record.json");
const freezeRegister = readJson("data/content-intelligence/release-candidate/ag55a-v01-scope-freeze-register.json");
const includedRegister = readJson("data/content-intelligence/release-candidate/ag55a-v01-included-module-register.json");
const deferralRegister = readJson("data/content-intelligence/release-candidate/ag55a-v02-deferral-register.json");
const stageDigest = readJson("data/content-intelligence/release-candidate/ag55a-ag42-to-ag54-completed-stage-digest.json");
const repoInventory = readJson("data/content-intelligence/release-candidate/ag55a-full-repo-inventory-digest.json");
const scopeBoundary = readJson("data/content-intelligence/release-candidate/ag55a-v01-scope-freeze-boundary.json");
const noDynamicLoop = readJson("data/content-intelligence/backend-architecture/ag55a-no-controlled-dynamic-content-loop-activation-audit.json");
const noDeploymentPublishing = readJson("data/content-intelligence/backend-architecture/ag55a-no-deployment-publishing-public-mutation-audit.json");
const noBackendRuntime = readJson("data/content-intelligence/backend-architecture/ag55a-no-backend-auth-rls-database-runtime-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag55a-ag55b-completed-repo-stack-reconciliation-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag55a-to-ag55b-completed-repo-stack-reconciliation-boundary.json");
const preview = readJson("data/quality/ag55a-v01-scope-freeze-preview.json");
const pkg = readJson("package.json");

if (review.status !== "v01_scope_freeze_ready_for_ag55b") fail("AG55A review status mismatch.");

for (const key of [
  "ag55a_v01_scope_freeze_recorded",
  "ag54z_consumed",
  "ag42_to_ag54_outputs_consumed",
  "v01_included_module_register_recorded",
  "v02_deferral_register_recorded",
  "completed_stage_digest_recorded",
  "full_repo_inventory_digest_recorded",
  "v01_scope_freeze_boundary_recorded",
  "ready_for_ag55b_completed_repo_stack_reconciliation"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag55b !== 0) fail("AG55B blocker count must be zero.");
if (sourceConsumption.status !== "source_consumption_recorded") fail("Source consumption status mismatch.");
if (sourceConsumption.consumed_stage_range !== "AG42–AG54") fail("AG42–AG54 range must be consumed.");

if (freezeRegister.freeze_scope_status !== "v01_scope_frozen_for_reconciliation") fail("V01 freeze status mismatch.");
if (freezeRegister.frozen_v01_modules.length !== 13) fail("Expected 13 frozen AG42–AG54 V01 modules.");
if (includedRegister.included_modules.length !== 13) fail("Included module register must contain AG42–AG54.");
if (includedRegister.inclusion_rule.indexOf("does not imply deployment") === -1) fail("Inclusion rule must block deployment implication.");

for (const stage of ["AG42","AG43","AG44","AG45","AG46","AG47","AG48","AG49","AG50","AG51","AG52","AG53","AG54"]) {
  if (!freezeRegister.frozen_v01_modules.includes(stage)) fail(`Frozen module missing: ${stage}`);
  const digestRow = stageDigest.stage_digest.find((row) => row.stage_id === stage);
  if (!digestRow || digestRow.file_count <= 0) fail(`Stage digest missing files for ${stage}`);
}

if (stageDigest.all_stage_outputs_present !== true) fail("Stage digest must confirm all stage outputs present.");
if (stageDigest.missing_stage_outputs.length !== 0) fail("Stage digest missing outputs must be zero.");

if (!JSON.stringify(deferralRegister.deferred_items).includes("controlled dynamic content-loop")) fail("Controlled dynamic content-loop deferral missing.");
if (!deferralRegister.deferred_items.includes("backend/Auth/Supabase activation")) fail("Backend/Auth/Supabase deferral missing.");
if (!deferralRegister.deferred_items.includes("deployment/Vercel trigger")) fail("Deployment/Vercel deferral missing.");

if (repoInventory.audit_passed !== true) fail("Repo inventory digest must pass.");
if (repoInventory.inventory_position !== "repo_inventory_digest_only_no_mutation_no_publish_no_deploy") fail("Repo inventory must remain digest-only.");
if (repoInventory.inventory_totals.repo_file_count <= 0) fail("Repo file count must be positive.");

for (const rule of [
  "AG55A does not activate AG56.",
  "AG55A does not activate controlled dynamic content loop.",
  "AG55A does not approve V02 items.",
  "AG55A does not deploy, publish, mutate public pages or trigger live checks."
]) {
  if (!scopeBoundary.boundary_rules.includes(rule)) fail(`Scope boundary missing: ${rule}`);
}

for (const audit of [noDynamicLoop, noDeploymentPublishing, noBackendRuntime]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag55b_completed_repo_stack_reconciliation") fail("AG55B readiness status mismatch.");
if (readiness.ready_for_ag55b !== true) fail("AG55B readiness must be true.");
if (readiness.next_stage_id !== "AG55B") fail("Readiness must point to AG55B.");
if (boundary.next_stage_id !== "AG55B") fail("Boundary must point to AG55B.");

for (const key of [
  "controlled_dynamic_content_loop_activated",
  "ag56_dynamic_test_path_activated",
  "v02_item_activated",
  "actual_deployment_triggered",
  "vercel_deployment_triggered",
  "deployment_approved",
  "deployment_performed",
  "github_release_created",
  "live_public_check_executed",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "public_page_mutation_enabled",
  "backend_auth_supabase_activation_approved",
  "backend_auth_supabase_activation_performed",
  "service_role_key_used",
  "service_role_key_exposed",
  "rls_policy_mutation_enabled",
  "grant_mutation_enabled",
  "runtime_database_query_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "public_dashboard_exposed",
  "external_fetch_enabled"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag55a"]) fail("Missing package script: generate:ag55a");
if (!pkg.scripts?.["validate:ag55a"]) fail("Missing package script: validate:ag55a");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag55a")) fail("validate:project must include validate:ag55a.");

pass("AG55A V01 Scope Freeze is present.");
pass("AG54Z release operations closure is consumed.");
pass("AG42–AG54 completed outputs are consumed.");
pass("V01 scope freeze register is valid.");
pass("V01 included module register is valid.");
pass("V02 deferral register is valid.");
pass("Completed stage digest is valid.");
pass("Full repo inventory digest is valid.");
pass("V01 scope freeze boundary is valid.");
pass("No controlled dynamic content-loop activation audit is valid.");
pass("No deployment/publishing/public mutation audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("AG55B completed repo stack reconciliation readiness is valid.");
