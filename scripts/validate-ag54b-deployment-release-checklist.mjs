import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG54B validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag54a-backup-restore-plan.json",
  "data/content-intelligence/release-operations/ag54a-source-consumption-record.json",
  "data/content-intelligence/release-operations/ag54a-git-baseline-record.json",
  "data/content-intelligence/release-operations/ag54a-repo-content-static-artifact-backup-scope.json",
  "data/content-intelligence/release-operations/ag54a-restore-method-plan.json",
  "data/content-intelligence/release-operations/ag54a-backup-restore-verification-sequence.json",
  "data/content-intelligence/release-operations/ag54a-supabase-backend-deferral-continuity-record.json",
  "data/content-intelligence/release-operations/ag54a-backup-restore-boundary.json",
  "data/content-intelligence/backend-architecture/ag54a-no-external-backup-service-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag54a-no-public-mutation-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag54a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag54a-ag54b-deployment-release-checklist-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag54a-to-ag54b-deployment-release-checklist-boundary.json",
  "data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json",
  "data/content-intelligence/public-quality/ag53z-carry-forward-public-quality-deferral-register.json",
  "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  "data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json",
  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag54b-deployment-release-checklist.json",
  "data/content-intelligence/release-operations/ag54b-source-consumption-record.json",
  "data/content-intelligence/release-operations/ag54b-validate-git-commit-push-checklist.json",
  "data/content-intelligence/release-operations/ag54b-static-release-path-checklist.json",
  "data/content-intelligence/release-operations/ag54b-vercel-live-check-sequence-plan.json",
  "data/content-intelligence/release-operations/ag54b-release-gate-criteria.json",
  "data/content-intelligence/release-operations/ag54b-deployment-release-checklist-boundary.json",
  "data/content-intelligence/backend-architecture/ag54b-no-deployment-trigger-audit.json",
  "data/content-intelligence/backend-architecture/ag54b-no-public-mutation-publishing-audit.json",
  "data/content-intelligence/backend-architecture/ag54b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag54b-ag54c-rollback-incident-response-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag54b-to-ag54c-rollback-incident-response-boundary.json",
  "data/quality/ag54b-deployment-release-checklist.json",
  "data/quality/ag54b-deployment-release-checklist-preview.json",
  "docs/quality/AG54B_DEPLOYMENT_RELEASE_CHECKLIST.md",
  "scripts/generate-ag54b-deployment-release-checklist.mjs",
  "scripts/validate-ag54b-deployment-release-checklist.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag54aReview = readJson("data/content-intelligence/quality-reviews/ag54a-backup-restore-plan.json");
const ag54aReadiness = readJson("data/content-intelligence/quality-registry/ag54a-ag54b-deployment-release-checklist-readiness-record.json");
const ag54aBoundaryToB = readJson("data/content-intelligence/mutation-plans/ag54a-to-ag54b-deployment-release-checklist-boundary.json");
if (ag54aReview.status !== "backup_restore_plan_ready_for_ag54b") fail("AG54A status mismatch.");
if (ag54aReview.summary.ready_for_ag54b_deployment_release_checklist !== true) fail("AG54A must be ready for AG54B.");
if (ag54aReadiness.ready_for_ag54b !== true) fail("AG54A readiness must permit AG54B.");
if (ag54aBoundaryToB.next_stage_id !== "AG54B") fail("AG54A boundary must point to AG54B.");

for (const file of [
  "data/content-intelligence/release-operations/ag54a-git-baseline-record.json",
  "data/content-intelligence/release-operations/ag54a-repo-content-static-artifact-backup-scope.json",
  "data/content-intelligence/release-operations/ag54a-restore-method-plan.json",
  "data/content-intelligence/release-operations/ag54a-backup-restore-verification-sequence.json",
  "data/content-intelligence/release-operations/ag54a-supabase-backend-deferral-continuity-record.json",
  "data/content-intelligence/backend-architecture/ag54a-no-external-backup-service-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag54a-no-public-mutation-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag54a-no-backend-auth-rls-database-runtime-audit.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const ag53zReview = readJson("data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json");
const ag53zCarryForward = readJson("data/content-intelligence/public-quality/ag53z-carry-forward-public-quality-deferral-register.json");
const ag52zReview = readJson("data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json");
const ag52zCarryForward = readJson("data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json");
const ag51zReview = readJson("data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag53zReview.status !== "public_quality_closed_ready_for_ag54a") fail("AG53Z status mismatch.");
if (!ag53zCarryForward.deferred_items.includes("deployment")) fail("AG53Z deployment deferral missing.");
if (ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") fail("AG52Z status mismatch.");
if (!ag52zCarryForward.deferred_items.includes("backend/Auth/Supabase activation")) fail("AG52Z backend deferral missing.");
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") fail("AG51Z status mismatch.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag54b-deployment-release-checklist.json");
const sourceConsumption = readJson("data/content-intelligence/release-operations/ag54b-source-consumption-record.json");
const validateChecklist = readJson("data/content-intelligence/release-operations/ag54b-validate-git-commit-push-checklist.json");
const staticRelease = readJson("data/content-intelligence/release-operations/ag54b-static-release-path-checklist.json");
const vercelLive = readJson("data/content-intelligence/release-operations/ag54b-vercel-live-check-sequence-plan.json");
const releaseGate = readJson("data/content-intelligence/release-operations/ag54b-release-gate-criteria.json");
const releaseBoundary = readJson("data/content-intelligence/release-operations/ag54b-deployment-release-checklist-boundary.json");
const noDeployment = readJson("data/content-intelligence/backend-architecture/ag54b-no-deployment-trigger-audit.json");
const noPublicMutation = readJson("data/content-intelligence/backend-architecture/ag54b-no-public-mutation-publishing-audit.json");
const noBackendRuntime = readJson("data/content-intelligence/backend-architecture/ag54b-no-backend-auth-rls-database-runtime-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag54b-ag54c-rollback-incident-response-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag54b-to-ag54c-rollback-incident-response-boundary.json");
const preview = readJson("data/quality/ag54b-deployment-release-checklist-preview.json");
const pkg = readJson("package.json");

if (review.status !== "deployment_release_checklist_ready_for_ag54c") fail("AG54B review status mismatch.");

for (const key of [
  "ag54b_deployment_release_checklist_recorded",
  "ag54a_consumed",
  "validate_git_commit_push_checklist_recorded",
  "static_release_path_checklist_recorded",
  "vercel_live_check_sequence_recorded",
  "release_gate_criteria_recorded",
  "deployment_release_boundary_recorded",
  "ready_for_ag54c_rollback_incident_response_plan"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag54c !== 0) fail("AG54C blocker count must be zero.");
if (sourceConsumption.status !== "source_consumption_recorded") fail("Source consumption status mismatch.");

for (const audit of [validateChecklist, staticRelease, vercelLive, releaseGate]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
}

if (validateChecklist.checklist_position !== "planning_only_no_git_action_executed_by_generator") fail("Git checklist must be planning-only.");
if (staticRelease.release_path_position !== "checklist_only_no_release_or_deployment") fail("Static release checklist must be planning-only.");
if (vercelLive.live_check_executed_now !== false) fail("Live check must not run.");
if (vercelLive.vercel_deployment_triggered_now !== false) fail("Vercel deployment must not be triggered.");
if (releaseGate.release_gate_open_now !== false) fail("Release gate must not be open.");

if (!releaseBoundary.boundary_rules.includes("No deployment is triggered.")) fail("No deployment boundary missing.");
if (!releaseBoundary.boundary_rules.includes("No Vercel deployment is triggered.")) fail("No Vercel boundary missing.");
if (!releaseBoundary.boundary_rules.includes("No live public check is executed.")) fail("No live check boundary missing.");

for (const audit of [noDeployment, noPublicMutation, noBackendRuntime]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag54c_rollback_incident_response_plan") fail("AG54C readiness status mismatch.");
if (readiness.ready_for_ag54c !== true) fail("AG54C readiness must be true.");
if (readiness.next_stage_id !== "AG54C") fail("Readiness must point to AG54C.");
if (boundary.next_stage_id !== "AG54C") fail("Boundary must point to AG54C.");

for (const key of [
  "actual_deployment_triggered",
  "vercel_deployment_triggered",
  "github_release_created",
  "live_public_check_executed",
  "external_release_automation_enabled",
  "content_publishing_enabled",
  "public_content_mutation_enabled",
  "public_page_mutation_enabled",
  "deployment_approved",
  "deployment_performed",
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

if (!pkg.scripts?.["generate:ag54b"]) fail("Missing package script: generate:ag54b");
if (!pkg.scripts?.["validate:ag54b"]) fail("Missing package script: validate:ag54b");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag54b")) fail("validate:project must include validate:ag54b.");

pass("AG54B Deployment and Release Checklist is present.");
pass("AG54A backup/restore plan is consumed.");
pass("Validate/git/commit/push checklist is valid.");
pass("Static release path checklist is valid.");
pass("Vercel/live check sequence plan is valid.");
pass("Release gate criteria are valid.");
pass("Deployment/release boundary is valid.");
pass("No deployment trigger audit is valid.");
pass("No public mutation/publishing audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("AG54C rollback/incident response readiness is valid.");
