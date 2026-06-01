import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG55D validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
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

  "data/content-intelligence/quality-reviews/ag55b-completed-repo-stack-reconciliation.json",
  "data/content-intelligence/release-candidate/ag55b-completed-repo-stack-reconciliation-record.json",
  "data/content-intelligence/release-candidate/ag55b-dependency-reconciliation-record.json",
  "data/content-intelligence/release-candidate/ag55b-roadmap-conflict-resolution-register.json",
  "data/content-intelligence/quality-reviews/ag55a-v01-scope-freeze.json",
  "data/content-intelligence/release-candidate/ag55a-v01-scope-freeze-register.json",
  "data/content-intelligence/release-candidate/ag55a-v02-deferral-register.json",
  "data/content-intelligence/quality-reviews/ag54z-release-operations-closure.json",
  "data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json",
  "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag55d-release-candidate-go-no-go-readiness-review.json",
  "data/content-intelligence/release-candidate/ag55d-source-consumption-record.json",
  "data/content-intelligence/release-candidate/ag55d-go-no-go-criteria-register.json",
  "data/content-intelligence/release-candidate/ag55d-release-candidate-blocker-register.json",
  "data/content-intelligence/release-candidate/ag55d-go-no-go-recommendation-record.json",
  "data/content-intelligence/release-candidate/ag55d-final-pre-closure-risk-register.json",
  "data/content-intelligence/release-candidate/ag55d-release-candidate-go-no-go-boundary.json",
  "data/content-intelligence/backend-architecture/ag55d-no-go-live-deployment-publishing-audit.json",
  "data/content-intelligence/backend-architecture/ag55d-no-controlled-dynamic-content-loop-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag55d-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag55d-ag55z-v01-release-candidate-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag55d-to-ag55z-v01-release-candidate-closure-boundary.json",
  "data/quality/ag55d-release-candidate-go-no-go-readiness-review.json",
  "data/quality/ag55d-release-candidate-go-no-go-readiness-review-preview.json",
  "docs/quality/AG55D_RELEASE_CANDIDATE_GO_NO_GO_READINESS_REVIEW.md",
  "scripts/generate-ag55d-release-candidate-go-no-go-readiness-review.mjs",
  "scripts/validate-ag55d-release-candidate-go-no-go-readiness-review.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag55cReview = readJson("data/content-intelligence/quality-reviews/ag55c-end-to-end-release-candidate-validation.json");
const ag55cSource = readJson("data/content-intelligence/release-candidate/ag55c-source-consumption-record.json");
const ag55cValidate = readJson("data/content-intelligence/release-candidate/ag55c-validate-project-chain-record.json");
const ag55cSurface = readJson("data/content-intelligence/release-candidate/ag55c-v01-surface-validation-record.json");
const ag55cMatrix = readJson("data/content-intelligence/release-candidate/ag55c-v01-module-readiness-matrix.json");
const ag55cSecurity = readJson("data/content-intelligence/release-candidate/ag55c-security-public-release-readiness-record.json");
const ag55cBoundary = readJson("data/content-intelligence/release-candidate/ag55c-end-to-end-release-candidate-validation-boundary.json");
const ag55cReadiness = readJson("data/content-intelligence/quality-registry/ag55c-ag55d-release-candidate-go-no-go-readiness-record.json");
const ag55cBoundaryToD = readJson("data/content-intelligence/mutation-plans/ag55c-to-ag55d-release-candidate-go-no-go-boundary.json");

if (ag55cReview.status !== "end_to_end_release_candidate_validation_ready_for_ag55d") fail("AG55C status mismatch.");
if (ag55cReview.summary.ready_for_ag55d_release_candidate_go_no_go !== true) fail("AG55C must be ready for AG55D.");
if (ag55cSource.status !== "source_consumption_recorded") fail("AG55C source consumption mismatch.");

for (const audit of [ag55cValidate, ag55cSurface, ag55cMatrix, ag55cSecurity]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
}

if (!ag55cBoundary.boundary_rules.includes("AG55C does not activate AG56 or controlled dynamic content-loop.")) fail("AG55C AG56 boundary missing.");
if (ag55cReadiness.ready_for_ag55d !== true) fail("AG55C readiness must permit AG55D.");
if (ag55cBoundaryToD.next_stage_id !== "AG55D") fail("AG55C boundary must point to AG55D.");

for (const file of [
  "data/content-intelligence/backend-architecture/ag55c-no-live-check-deployment-publishing-audit.json",
  "data/content-intelligence/backend-architecture/ag55c-no-controlled-dynamic-content-loop-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag55c-no-backend-auth-rls-database-runtime-audit.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const ag55bReview = readJson("data/content-intelligence/quality-reviews/ag55b-completed-repo-stack-reconciliation.json");
const ag55bStack = readJson("data/content-intelligence/release-candidate/ag55b-completed-repo-stack-reconciliation-record.json");
const ag55bDependency = readJson("data/content-intelligence/release-candidate/ag55b-dependency-reconciliation-record.json");
const ag55bRoadmap = readJson("data/content-intelligence/release-candidate/ag55b-roadmap-conflict-resolution-register.json");

if (ag55bReview.status !== "completed_repo_stack_reconciliation_ready_for_ag55c") fail("AG55B status mismatch.");
if (ag55bStack.audit_passed !== true) fail("AG55B repo stack must pass.");
if (ag55bDependency.audit_passed !== true) fail("AG55B dependency must pass.");
if (ag55bRoadmap.audit_passed !== true) fail("AG55B roadmap conflict must pass.");

const ag55aReview = readJson("data/content-intelligence/quality-reviews/ag55a-v01-scope-freeze.json");
const ag55aFreeze = readJson("data/content-intelligence/release-candidate/ag55a-v01-scope-freeze-register.json");
const ag55aDeferral = readJson("data/content-intelligence/release-candidate/ag55a-v02-deferral-register.json");

if (ag55aReview.status !== "v01_scope_freeze_ready_for_ag55b") fail("AG55A status mismatch.");
if (ag55aFreeze.freeze_scope_status !== "v01_scope_frozen_for_reconciliation") fail("AG55A freeze status mismatch.");
if (!JSON.stringify(ag55aDeferral.deferred_items).includes("controlled dynamic content-loop")) fail("AG55A controlled dynamic loop deferral missing.");

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

const review = readJson("data/content-intelligence/quality-reviews/ag55d-release-candidate-go-no-go-readiness-review.json");
const source = readJson("data/content-intelligence/release-candidate/ag55d-source-consumption-record.json");
const criteria = readJson("data/content-intelligence/release-candidate/ag55d-go-no-go-criteria-register.json");
const blockers = readJson("data/content-intelligence/release-candidate/ag55d-release-candidate-blocker-register.json");
const recommendation = readJson("data/content-intelligence/release-candidate/ag55d-go-no-go-recommendation-record.json");
const risks = readJson("data/content-intelligence/release-candidate/ag55d-final-pre-closure-risk-register.json");
const goNoGoBoundary = readJson("data/content-intelligence/release-candidate/ag55d-release-candidate-go-no-go-boundary.json");
const noGoLive = readJson("data/content-intelligence/backend-architecture/ag55d-no-go-live-deployment-publishing-audit.json");
const noDynamic = readJson("data/content-intelligence/backend-architecture/ag55d-no-controlled-dynamic-content-loop-activation-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag55d-no-backend-auth-rls-database-runtime-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag55d-ag55z-v01-release-candidate-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag55d-to-ag55z-v01-release-candidate-closure-boundary.json");
const preview = readJson("data/quality/ag55d-release-candidate-go-no-go-readiness-review-preview.json");
const pkg = readJson("package.json");

if (review.status !== "release_candidate_go_no_go_ready_for_ag55z") fail("AG55D review status mismatch.");

for (const key of [
  "ag55d_release_candidate_go_no_go_readiness_recorded",
  "ag55c_consumed",
  "go_no_go_criteria_recorded",
  "release_candidate_blocker_register_recorded",
  "go_no_go_recommendation_recorded",
  "final_pre_closure_risk_register_recorded",
  "go_no_go_boundary_recorded",
  "ready_for_ag55z_v01_release_candidate_closure"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag55z !== 0) fail("AG55Z blocker count must be zero.");
if (source.status !== "source_consumption_recorded") fail("Source consumption status mismatch.");

if (criteria.audit_passed !== true) fail("Go/no-go criteria must pass.");
if (criteria.hard_blocker_count !== 0) fail("Go/no-go hard blockers must be zero.");
if (criteria.decision_position !== "ready_for_ag55z_closure_not_actual_go_live") fail("Decision position must not be actual go-live.");

if (blockers.audit_passed !== true) fail("Blocker register must pass.");
if (blockers.hard_blocker_count !== 0) fail("Blocker register hard blockers must be zero.");
if (blockers.hard_blockers.length !== 0) fail("Hard blockers array must be empty.");

if (recommendation.audit_passed !== true) fail("Recommendation record must pass.");
if (recommendation.recommendation !== "GO_FOR_AG55Z_V01_RELEASE_CANDIDATE_CLOSURE_ONLY") fail("Recommendation must be closure-only.");
if (recommendation.actual_go_live_approval_granted_now !== false) fail("Actual go-live approval must not be granted.");
if (!recommendation.recommendation_scope.includes("not a go-live")) fail("Recommendation scope must deny go-live approval.");

if (risks.audit_passed !== true) fail("Final risk register must pass.");
if (risks.current_hard_blocker_count !== 0) fail("Final risk hard blockers must be zero.");
if (!JSON.stringify(risks.residual_risks_carried_forward).includes("deployment_not_yet_approved")) fail("Deployment residual risk must be carried forward.");

for (const rule of [
  "AG55D does not grant actual go-live approval.",
  "AG55D does not deploy or trigger Vercel/GitHub release.",
  "AG55D does not publish content or mutate public pages.",
  "AG55D does not activate AG56 or controlled dynamic content-loop.",
  "AG55D does not activate backend/Auth/Supabase/RLS/API/database runtime."
]) {
  if (!goNoGoBoundary.boundary_rules.includes(rule)) fail(`Go/no-go boundary missing: ${rule}`);
}

for (const audit of [noGoLive, noDynamic, noBackend]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag55z_v01_release_candidate_closure") fail("AG55Z readiness status mismatch.");
if (readiness.ready_for_ag55z !== true) fail("AG55Z readiness must be true.");
if (readiness.next_stage_id !== "AG55Z") fail("Readiness must point to AG55Z.");
if (boundary.next_stage_id !== "AG55Z") fail("Boundary must point to AG55Z.");

for (const key of [
  "actual_go_live_approval_granted",
  "actual_deployment_triggered",
  "vercel_deployment_triggered",
  "deployment_approved",
  "deployment_performed",
  "github_release_created",
  "live_public_check_executed",
  "browser_automation_enabled",
  "external_audit_api_enabled",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "public_page_mutation_enabled",
  "controlled_dynamic_content_loop_activated",
  "ag56_dynamic_test_path_activated",
  "v02_item_activated",
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

if (!pkg.scripts?.["generate:ag55d"]) fail("Missing package script: generate:ag55d");
if (!pkg.scripts?.["validate:ag55d"]) fail("Missing package script: validate:ag55d");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag55d")) fail("validate:project must include validate:ag55d.");

pass("AG55D Release Candidate Go/No-Go Readiness Review is present.");
pass("AG55C end-to-end release candidate validation is consumed.");
pass("Go/no-go criteria register is valid.");
pass("Release candidate blocker register is valid.");
pass("Go/no-go recommendation record is valid and closure-only.");
pass("Final pre-closure risk register is valid.");
pass("Go/no-go boundary is valid.");
pass("No go-live/deployment/publishing audit is valid.");
pass("No controlled dynamic content-loop activation audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("AG55Z V01 release candidate closure readiness is valid.");
