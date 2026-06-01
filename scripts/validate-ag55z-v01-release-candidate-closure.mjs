import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG55Z validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
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

  "data/content-intelligence/quality-reviews/ag55c-end-to-end-release-candidate-validation.json",
  "data/content-intelligence/release-candidate/ag55c-v01-module-readiness-matrix.json",
  "data/content-intelligence/release-candidate/ag55c-security-public-release-readiness-record.json",
  "data/content-intelligence/quality-reviews/ag55b-completed-repo-stack-reconciliation.json",
  "data/content-intelligence/release-candidate/ag55b-completed-repo-stack-reconciliation-record.json",
  "data/content-intelligence/quality-reviews/ag55a-v01-scope-freeze.json",
  "data/content-intelligence/release-candidate/ag55a-v01-scope-freeze-register.json",
  "data/content-intelligence/release-candidate/ag55a-v02-deferral-register.json",
  "data/content-intelligence/quality-reviews/ag54z-release-operations-closure.json",
  "data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json",
  "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag55z-v01-release-candidate-closure.json",
  "data/content-intelligence/release-candidate/ag55z-v01-release-candidate-closure-record.json",
  "data/content-intelligence/release-candidate/ag55z-ag55a-to-ag55d-consumption-summary.json",
  "data/content-intelligence/release-candidate/ag55z-final-v01-release-candidate-posture-record.json",
  "data/content-intelligence/release-candidate/ag55z-carry-forward-release-candidate-deferral-register.json",
  "data/content-intelligence/ag-roadmap/ag55z-to-ag56-1-controlled-dynamic-article-generation-handoff.json",
  "data/content-intelligence/backend-architecture/ag55z-no-go-live-deployment-publishing-audit.json",
  "data/content-intelligence/backend-architecture/ag55z-no-ag56-dynamic-execution-audit.json",
  "data/content-intelligence/backend-architecture/ag55z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag55z-ag56-1-controlled-dynamic-article-generation-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag55z-to-ag56-1-controlled-dynamic-article-generation-boundary.json",
  "data/quality/ag55z-v01-release-candidate-closure.json",
  "data/quality/ag55z-v01-release-candidate-closure-preview.json",
  "docs/quality/AG55Z_V01_RELEASE_CANDIDATE_CLOSURE.md",
  "scripts/generate-ag55z-v01-release-candidate-closure.mjs",
  "scripts/validate-ag55z-v01-release-candidate-closure.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag55dReview = readJson("data/content-intelligence/quality-reviews/ag55d-release-candidate-go-no-go-readiness-review.json");
const ag55dCriteria = readJson("data/content-intelligence/release-candidate/ag55d-go-no-go-criteria-register.json");
const ag55dBlockers = readJson("data/content-intelligence/release-candidate/ag55d-release-candidate-blocker-register.json");
const ag55dRecommendation = readJson("data/content-intelligence/release-candidate/ag55d-go-no-go-recommendation-record.json");
const ag55dRisks = readJson("data/content-intelligence/release-candidate/ag55d-final-pre-closure-risk-register.json");
const ag55dBoundary = readJson("data/content-intelligence/release-candidate/ag55d-release-candidate-go-no-go-boundary.json");
const ag55dReadiness = readJson("data/content-intelligence/quality-registry/ag55d-ag55z-v01-release-candidate-closure-readiness-record.json");
const ag55dBoundaryToZ = readJson("data/content-intelligence/mutation-plans/ag55d-to-ag55z-v01-release-candidate-closure-boundary.json");

if (ag55dReview.status !== "release_candidate_go_no_go_ready_for_ag55z") fail("AG55D status mismatch.");
if (ag55dReview.summary.ready_for_ag55z_v01_release_candidate_closure !== true) fail("AG55D must be ready for AG55Z.");
if (ag55dCriteria.audit_passed !== true || ag55dCriteria.hard_blocker_count !== 0) fail("AG55D criteria must pass with zero hard blockers.");
if (ag55dBlockers.audit_passed !== true || ag55dBlockers.hard_blocker_count !== 0) fail("AG55D blocker register must pass with zero hard blockers.");
if (ag55dRecommendation.recommendation !== "GO_FOR_AG55Z_V01_RELEASE_CANDIDATE_CLOSURE_ONLY") fail("AG55D recommendation mismatch.");
if (ag55dRecommendation.actual_go_live_approval_granted_now !== false) fail("AG55D must not grant go-live.");
if (ag55dRisks.current_hard_blocker_count !== 0) fail("AG55D risk blockers must be zero.");
if (!ag55dBoundary.boundary_rules.includes("AG55D does not grant actual go-live approval.")) fail("AG55D go-live boundary missing.");
if (ag55dReadiness.ready_for_ag55z !== true) fail("AG55D readiness must permit AG55Z.");
if (ag55dBoundaryToZ.next_stage_id !== "AG55Z") fail("AG55D boundary must point to AG55Z.");

for (const file of [
  "data/content-intelligence/backend-architecture/ag55d-no-go-live-deployment-publishing-audit.json",
  "data/content-intelligence/backend-architecture/ag55d-no-controlled-dynamic-content-loop-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag55d-no-backend-auth-rls-database-runtime-audit.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const ag55cReview = readJson("data/content-intelligence/quality-reviews/ag55c-end-to-end-release-candidate-validation.json");
const ag55cMatrix = readJson("data/content-intelligence/release-candidate/ag55c-v01-module-readiness-matrix.json");
const ag55cSecurity = readJson("data/content-intelligence/release-candidate/ag55c-security-public-release-readiness-record.json");

if (ag55cReview.status !== "end_to_end_release_candidate_validation_ready_for_ag55d") fail("AG55C status mismatch.");
if (ag55cMatrix.audit_passed !== true || ag55cMatrix.hard_blocker_count_for_ag55d !== 0) fail("AG55C module matrix must pass.");
if (ag55cSecurity.audit_passed !== true || ag55cSecurity.hard_blocker_count !== 0) fail("AG55C security/public readiness must pass.");

const ag55bReview = readJson("data/content-intelligence/quality-reviews/ag55b-completed-repo-stack-reconciliation.json");
const ag55bStack = readJson("data/content-intelligence/release-candidate/ag55b-completed-repo-stack-reconciliation-record.json");

if (ag55bReview.status !== "completed_repo_stack_reconciliation_ready_for_ag55c") fail("AG55B status mismatch.");
if (ag55bStack.audit_passed !== true) fail("AG55B stack reconciliation must pass.");

const ag55aReview = readJson("data/content-intelligence/quality-reviews/ag55a-v01-scope-freeze.json");
const ag55aFreeze = readJson("data/content-intelligence/release-candidate/ag55a-v01-scope-freeze-register.json");
const ag55aDeferral = readJson("data/content-intelligence/release-candidate/ag55a-v02-deferral-register.json");

if (ag55aReview.status !== "v01_scope_freeze_ready_for_ag55b") fail("AG55A status mismatch.");
if (ag55aFreeze.freeze_scope_status !== "v01_scope_frozen_for_reconciliation") fail("AG55A freeze mismatch.");
if (!JSON.stringify(ag55aDeferral.deferred_items).includes("controlled dynamic content-loop")) fail("AG55A dynamic loop deferral missing.");

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

const review = readJson("data/content-intelligence/quality-reviews/ag55z-v01-release-candidate-closure.json");
const closure = readJson("data/content-intelligence/release-candidate/ag55z-v01-release-candidate-closure-record.json");
const consumption = readJson("data/content-intelligence/release-candidate/ag55z-ag55a-to-ag55d-consumption-summary.json");
const posture = readJson("data/content-intelligence/release-candidate/ag55z-final-v01-release-candidate-posture-record.json");
const carryForward = readJson("data/content-intelligence/release-candidate/ag55z-carry-forward-release-candidate-deferral-register.json");
const handoff = readJson("data/content-intelligence/ag-roadmap/ag55z-to-ag56-1-controlled-dynamic-article-generation-handoff.json");
const noGoLive = readJson("data/content-intelligence/backend-architecture/ag55z-no-go-live-deployment-publishing-audit.json");
const noDynamicExecution = readJson("data/content-intelligence/backend-architecture/ag55z-no-ag56-dynamic-execution-audit.json");
const noBackend = readJson("data/content-intelligence/backend-architecture/ag55z-no-backend-auth-rls-database-runtime-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag55z-ag56-1-controlled-dynamic-article-generation-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag55z-to-ag56-1-controlled-dynamic-article-generation-boundary.json");
const preview = readJson("data/quality/ag55z-v01-release-candidate-closure-preview.json");
const pkg = readJson("package.json");

if (review.status !== "v01_release_candidate_closed_ready_for_ag56_1") fail("AG55Z review status mismatch.");

for (const key of [
  "ag55z_v01_release_candidate_closed",
  "ag55a_ag55b_ag55c_ag55d_consumed",
  "v01_release_candidate_closure_completed",
  "ag56_1_controlled_dynamic_article_generation_handoff_created",
  "ready_for_ag56_1_controlled_dynamic_article_generation_test"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag56_1 !== 0) fail("AG56.1 blocker count must be zero.");
if (closure.status !== "v01_release_candidate_closure_completed") fail("Closure status mismatch.");
if (closure.closure_allowed !== true) fail("Closure must be allowed.");

for (const stage of ["AG55A", "AG55B", "AG55C", "AG55D"]) {
  if (!JSON.stringify(consumption.consumed_outputs).includes(stage)) fail(`Consumption summary missing ${stage}.`);
}

if (posture.posture_summary.v01_release_candidate !== "closed_ready_for_AG56_1_controlled_test") fail("Posture must be ready for AG56.1.");
if (posture.posture_summary.actual_go_live !== "not_approved") fail("Actual go-live must remain not approved.");
if (posture.posture_summary.ag56_publish_or_live_decision !== "not_approved") fail("AG56 publish/go-live decision must remain not approved.");

for (const item of [
  "actual go-live approval",
  "deployment or Vercel trigger",
  "content publishing",
  "public page/content mutation",
  "AG56.3 controlled publish test approval",
  "AG56.8 go-live decision",
  "backend/Auth/Supabase activation",
  "runtime database/API reading",
  "service-role use",
  "V02 expansion items"
]) {
  if (!carryForward.deferred_items.includes(item)) fail(`Carry-forward missing: ${item}`);
}

if (handoff.next_stage_id !== "AG56.1") fail("Handoff must point to AG56.1.");
if (!JSON.stringify(handoff.handoff_basis).includes("AG56.3 publish test requires separate explicit approval")) fail("AG56.3 approval gate missing.");

for (const audit of [noGoLive, noDynamicExecution, noBackend]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag56_1_controlled_dynamic_article_generation_test") fail("AG56.1 readiness status mismatch.");
if (readiness.ready_for_ag56_1 !== true) fail("AG56.1 readiness must be true.");
if (readiness.next_stage_id !== "AG56.1") fail("Readiness must point to AG56.1.");
if (boundary.next_stage_id !== "AG56.1") fail("Boundary must point to AG56.1.");

for (const blocked of [
  "publishing the article",
  "AG56.3 controlled publish test",
  "deployment or Vercel trigger",
  "go-live decision",
  "backend/Auth/Supabase activation",
  "runtime database/API reading",
  "service-role use",
  "V02 expansion"
]) {
  if (!readiness.ag56_1_blocked_scope.includes(blocked)) fail(`AG56.1 blocked scope missing: ${blocked}`);
}

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
  "ag56_1_generation_test_executed",
  "controlled_dynamic_content_loop_activated",
  "ag56_publish_test_approved",
  "ag56_publish_test_executed",
  "ag56_go_live_decision_made",
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

if (!pkg.scripts?.["generate:ag55z"]) fail("Missing package script: generate:ag55z");
if (!pkg.scripts?.["validate:ag55z"]) fail("Missing package script: validate:ag55z");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag55z")) fail("validate:project must include validate:ag55z.");

pass("AG55Z V01 Release Candidate Closure is present.");
pass("AG55A–AG55D outputs are consumed.");
pass("V01 release candidate closure record is valid.");
pass("Final V01 posture record is valid.");
pass("Carry-forward release candidate deferral register is valid.");
pass("AG56.1 controlled dynamic article generation handoff is valid.");
pass("No go-live/deployment/publishing audit is valid.");
pass("No AG56 dynamic execution audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("AG56.1 controlled dynamic article generation readiness is valid.");
