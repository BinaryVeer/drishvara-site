import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG55C validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag55b-completed-repo-stack-reconciliation.json",
  "data/content-intelligence/release-candidate/ag55b-source-consumption-record.json",
  "data/content-intelligence/release-candidate/ag55b-completed-stream-inventory-record.json",
  "data/content-intelligence/release-candidate/ag55b-dependency-reconciliation-record.json",
  "data/content-intelligence/release-candidate/ag55b-roadmap-conflict-resolution-register.json",
  "data/content-intelligence/release-candidate/ag55b-docs-quality-reconciliation-record.json",
  "data/content-intelligence/release-candidate/ag55b-completed-repo-stack-reconciliation-record.json",
  "data/content-intelligence/release-candidate/ag55b-completed-stack-reconciliation-boundary.json",
  "data/content-intelligence/backend-architecture/ag55b-no-controlled-dynamic-content-loop-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag55b-no-deployment-publishing-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag55b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag55b-ag55c-end-to-end-release-candidate-validation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag55b-to-ag55c-end-to-end-release-candidate-validation-boundary.json",

  "data/content-intelligence/quality-reviews/ag55a-v01-scope-freeze.json",
  "data/content-intelligence/release-candidate/ag55a-v01-scope-freeze-register.json",
  "data/content-intelligence/release-candidate/ag55a-v01-included-module-register.json",
  "data/content-intelligence/release-candidate/ag55a-v02-deferral-register.json",
  "data/content-intelligence/release-candidate/ag55a-ag42-to-ag54-completed-stage-digest.json",
  "data/content-intelligence/release-candidate/ag55a-full-repo-inventory-digest.json",

  "data/content-intelligence/quality-reviews/ag54z-release-operations-closure.json",
  "data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json",
  "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag55c-end-to-end-release-candidate-validation.json",
  "data/content-intelligence/release-candidate/ag55c-source-consumption-record.json",
  "data/content-intelligence/release-candidate/ag55c-validate-project-chain-record.json",
  "data/content-intelligence/release-candidate/ag55c-v01-surface-validation-record.json",
  "data/content-intelligence/release-candidate/ag55c-v01-module-readiness-matrix.json",
  "data/content-intelligence/release-candidate/ag55c-security-public-release-readiness-record.json",
  "data/content-intelligence/release-candidate/ag55c-end-to-end-release-candidate-validation-boundary.json",
  "data/content-intelligence/backend-architecture/ag55c-no-live-check-deployment-publishing-audit.json",
  "data/content-intelligence/backend-architecture/ag55c-no-controlled-dynamic-content-loop-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag55c-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag55c-ag55d-release-candidate-go-no-go-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag55c-to-ag55d-release-candidate-go-no-go-boundary.json",
  "data/quality/ag55c-end-to-end-release-candidate-validation.json",
  "data/quality/ag55c-end-to-end-release-candidate-validation-preview.json",
  "docs/quality/AG55C_END_TO_END_RELEASE_CANDIDATE_VALIDATION.md",
  "scripts/generate-ag55c-end-to-end-release-candidate-validation.mjs",
  "scripts/validate-ag55c-end-to-end-release-candidate-validation.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag55bReview = readJson("data/content-intelligence/quality-reviews/ag55b-completed-repo-stack-reconciliation.json");
const ag55bSource = readJson("data/content-intelligence/release-candidate/ag55b-source-consumption-record.json");
const ag55bStream = readJson("data/content-intelligence/release-candidate/ag55b-completed-stream-inventory-record.json");
const ag55bDependency = readJson("data/content-intelligence/release-candidate/ag55b-dependency-reconciliation-record.json");
const ag55bRoadmap = readJson("data/content-intelligence/release-candidate/ag55b-roadmap-conflict-resolution-register.json");
const ag55bDocsQuality = readJson("data/content-intelligence/release-candidate/ag55b-docs-quality-reconciliation-record.json");
const ag55bStack = readJson("data/content-intelligence/release-candidate/ag55b-completed-repo-stack-reconciliation-record.json");
const ag55bBoundary = readJson("data/content-intelligence/release-candidate/ag55b-completed-stack-reconciliation-boundary.json");
const ag55bReadiness = readJson("data/content-intelligence/quality-registry/ag55b-ag55c-end-to-end-release-candidate-validation-readiness-record.json");
const ag55bBoundaryToC = readJson("data/content-intelligence/mutation-plans/ag55b-to-ag55c-end-to-end-release-candidate-validation-boundary.json");

if (ag55bReview.status !== "completed_repo_stack_reconciliation_ready_for_ag55c") fail("AG55B status mismatch.");
if (ag55bReview.summary.ready_for_ag55c_end_to_end_release_candidate_validation !== true) fail("AG55B must be ready for AG55C.");
if (ag55bSource.status !== "source_consumption_recorded") fail("AG55B source consumption mismatch.");
for (const audit of [ag55bStream, ag55bDependency, ag55bRoadmap, ag55bDocsQuality, ag55bStack]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
}
if (!ag55bBoundary.boundary_rules.includes("AG55B does not activate AG56.")) fail("AG55B AG56 boundary missing.");
if (ag55bReadiness.ready_for_ag55c !== true) fail("AG55B readiness must permit AG55C.");
if (ag55bBoundaryToC.next_stage_id !== "AG55C") fail("AG55B boundary must point to AG55C.");

for (const file of [
  "data/content-intelligence/backend-architecture/ag55b-no-controlled-dynamic-content-loop-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag55b-no-deployment-publishing-public-mutation-audit.json",
  "data/content-intelligence/backend-architecture/ag55b-no-backend-auth-rls-database-runtime-audit.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const ag55aReview = readJson("data/content-intelligence/quality-reviews/ag55a-v01-scope-freeze.json");
const ag55aFreeze = readJson("data/content-intelligence/release-candidate/ag55a-v01-scope-freeze-register.json");
const ag55aIncluded = readJson("data/content-intelligence/release-candidate/ag55a-v01-included-module-register.json");
const ag55aDeferral = readJson("data/content-intelligence/release-candidate/ag55a-v02-deferral-register.json");
const ag55aDigest = readJson("data/content-intelligence/release-candidate/ag55a-ag42-to-ag54-completed-stage-digest.json");
const ag55aRepo = readJson("data/content-intelligence/release-candidate/ag55a-full-repo-inventory-digest.json");

if (ag55aReview.status !== "v01_scope_freeze_ready_for_ag55b") fail("AG55A status mismatch.");
if (ag55aFreeze.freeze_scope_status !== "v01_scope_frozen_for_reconciliation") fail("AG55A freeze status mismatch.");
if (ag55aIncluded.included_modules.length !== 13) fail("AG55A included modules must be 13.");
if (!JSON.stringify(ag55aDeferral.deferred_items).includes("controlled dynamic content-loop")) fail("AG55A dynamic-loop deferral missing.");
if (ag55aDigest.all_stage_outputs_present !== true) fail("AG55A completed stage digest must be true.");
if (ag55aRepo.audit_passed !== true) fail("AG55A repo inventory must pass.");

const ag54zReview = readJson("data/content-intelligence/quality-reviews/ag54z-release-operations-closure.json");
const ag53zReview = readJson("data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json");
const ag52zReview = readJson("data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json");
const ag51zReview = readJson("data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag54zReview.status !== "release_operations_closed_ready_for_ag55a") fail("AG54Z status mismatch.");
if (ag53zReview.status !== "public_quality_closed_ready_for_ag54a") fail("AG53Z status mismatch.");
if (ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") fail("AG52Z status mismatch.");
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") fail("AG51Z status mismatch.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag55c-end-to-end-release-candidate-validation.json");
const source = readJson("data/content-intelligence/release-candidate/ag55c-source-consumption-record.json");
const validateChain = readJson("data/content-intelligence/release-candidate/ag55c-validate-project-chain-record.json");
const surfaceValidation = readJson("data/content-intelligence/release-candidate/ag55c-v01-surface-validation-record.json");
const matrix = readJson("data/content-intelligence/release-candidate/ag55c-v01-module-readiness-matrix.json");
const securityPublic = readJson("data/content-intelligence/release-candidate/ag55c-security-public-release-readiness-record.json");
const validationBoundary = readJson("data/content-intelligence/release-candidate/ag55c-end-to-end-release-candidate-validation-boundary.json");
const noLive = readJson("data/content-intelligence/backend-architecture/ag55c-no-live-check-deployment-publishing-audit.json");
const noDynamic = readJson("data/content-intelligence/backend-architecture/ag55c-no-controlled-dynamic-content-loop-activation-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag55c-no-backend-auth-rls-database-runtime-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag55c-ag55d-release-candidate-go-no-go-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag55c-to-ag55d-release-candidate-go-no-go-boundary.json");
const preview = readJson("data/quality/ag55c-end-to-end-release-candidate-validation-preview.json");
const pkg = readJson("package.json");

if (review.status !== "end_to_end_release_candidate_validation_ready_for_ag55d") fail("AG55C review status mismatch.");

for (const key of [
  "ag55c_end_to_end_release_candidate_validation_recorded",
  "ag55b_consumed",
  "validate_project_chain_recorded",
  "v01_surface_validation_recorded",
  "module_readiness_matrix_recorded",
  "security_public_release_readiness_recorded",
  "release_candidate_validation_boundary_recorded",
  "ready_for_ag55d_release_candidate_go_no_go"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag55d !== 0) fail("AG55D blocker count must be zero.");
if (source.status !== "source_consumption_recorded") fail("Source consumption status mismatch.");

if (validateChain.audit_passed !== true) fail("Validate project chain must pass.");
if (validateChain.validate_project_present !== true) fail("validate:project must be present.");
if (validateChain.validation_position !== "chain_recorded_only_generator_does_not_execute_validate_project") fail("validate chain must not execute inside generator.");
for (const row of validateChain.completed_stage_validators) {
  if (row.validate_project_includes !== true) fail(`validate:project missing completed validator ${row.stage}`);
  if (row.package_script_present !== true) fail(`package script missing completed validator ${row.stage}`);
}

if (surfaceValidation.audit_passed !== true) fail("V01 surface validation must pass.");
if (surfaceValidation.surface_validation_matrix.length < 9) fail("Surface validation matrix must include core V01 surfaces.");
if (surfaceValidation.validation_position !== "static_release_candidate_surface_validation_only_no_live_public_check") fail("Surface validation must be static-only.");

if (matrix.audit_passed !== true) fail("Module readiness matrix must pass.");
if (matrix.hard_blocker_count_for_ag55d !== 0) fail("Module readiness hard blockers must be zero.");
if (matrix.module_rows.length < 10) fail("Module readiness matrix too small.");

if (securityPublic.audit_passed !== true) fail("Security/public/release readiness must pass.");
if (securityPublic.hard_blocker_count !== 0) fail("Security/public/release hard blockers must be zero.");
for (const stage of ["AG52Z", "AG53Z", "AG54Z", "AG55A", "AG55B"]) {
  if (!JSON.stringify(securityPublic.consumed_closures).includes(stage)) fail(`Security/public readiness missing ${stage}`);
}

for (const rule of [
  "AG55C does not execute validate:project inside the generator.",
  "AG55C does not run live public checks, browser automation or external audit APIs.",
  "AG55C does not activate AG56 or controlled dynamic content-loop.",
  "AG55C does not deploy, publish, mutate public pages or trigger Vercel/GitHub release."
]) {
  if (!validationBoundary.boundary_rules.includes(rule)) fail(`Validation boundary missing: ${rule}`);
}

for (const audit of [noLive, noDynamic, noBackend]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag55d_release_candidate_go_no_go") fail("AG55D readiness status mismatch.");
if (readiness.ready_for_ag55d !== true) fail("AG55D readiness must be true.");
if (readiness.next_stage_id !== "AG55D") fail("Readiness must point to AG55D.");
if (boundary.next_stage_id !== "AG55D") fail("Boundary must point to AG55D.");

for (const key of [
  "validate_project_executed_by_generator",
  "live_public_check_executed",
  "browser_automation_enabled",
  "external_audit_api_enabled",
  "controlled_dynamic_content_loop_activated",
  "ag56_dynamic_test_path_activated",
  "v02_item_activated",
  "actual_deployment_triggered",
  "vercel_deployment_triggered",
  "deployment_approved",
  "deployment_performed",
  "github_release_created",
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

if (!pkg.scripts?.["generate:ag55c"]) fail("Missing package script: generate:ag55c");
if (!pkg.scripts?.["validate:ag55c"]) fail("Missing package script: validate:ag55c");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag55c")) fail("validate:project must include validate:ag55c.");

pass("AG55C End-to-End Release Candidate Validation is present.");
pass("AG55B completed repo stack reconciliation is consumed.");
pass("validate:project chain record is valid.");
pass("V01 surface validation record is valid.");
pass("V01 module readiness matrix is valid.");
pass("Security/public quality/release readiness record is valid.");
pass("Release candidate validation boundary is valid.");
pass("No live check/deployment/publishing audit is valid.");
pass("No controlled dynamic content-loop activation audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("AG55D release candidate go/no-go readiness is valid.");
