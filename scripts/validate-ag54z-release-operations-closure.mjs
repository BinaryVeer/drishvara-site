import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG54Z validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag54a-backup-restore-plan.json",
  "data/content-intelligence/quality-reviews/ag54b-deployment-release-checklist.json",
  "data/content-intelligence/quality-reviews/ag54c-rollback-incident-response-plan.json",
  "data/content-intelligence/quality-reviews/ag54d-release-operations-audit.json",
  "data/content-intelligence/release-operations/ag54d-ag54a-backup-restore-audit.json",
  "data/content-intelligence/release-operations/ag54d-ag54b-deployment-release-checklist-audit.json",
  "data/content-intelligence/release-operations/ag54d-ag54c-rollback-incident-response-audit.json",
  "data/content-intelligence/release-operations/ag54d-combined-release-operations-risk-register.json",
  "data/content-intelligence/release-operations/ag54d-release-operations-readiness-audit-record.json",
  "data/content-intelligence/backend-architecture/ag54d-no-deployment-rollback-publishing-audit.json",
  "data/content-intelligence/backend-architecture/ag54d-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag54d-no-service-role-public-mutation-audit.json",
  "data/content-intelligence/quality-registry/ag54d-ag54z-release-operations-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag54d-to-ag54z-release-operations-closure-boundary.json",
  "data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json",
  "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

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
  "data/quality/ag54z-release-operations-closure.json",
  "data/quality/ag54z-release-operations-closure-preview.json",
  "docs/quality/AG54Z_RELEASE_OPERATIONS_CLOSURE.md",
  "scripts/generate-ag54z-release-operations-closure.mjs",
  "scripts/validate-ag54z-release-operations-closure.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag54aReview = readJson("data/content-intelligence/quality-reviews/ag54a-backup-restore-plan.json");
const ag54bReview = readJson("data/content-intelligence/quality-reviews/ag54b-deployment-release-checklist.json");
const ag54cReview = readJson("data/content-intelligence/quality-reviews/ag54c-rollback-incident-response-plan.json");
const ag54dReview = readJson("data/content-intelligence/quality-reviews/ag54d-release-operations-audit.json");
const ag54dRisk = readJson("data/content-intelligence/release-operations/ag54d-combined-release-operations-risk-register.json");
const ag54dReadiness = readJson("data/content-intelligence/quality-registry/ag54d-ag54z-release-operations-closure-readiness-record.json");
const ag54dBoundary = readJson("data/content-intelligence/mutation-plans/ag54d-to-ag54z-release-operations-closure-boundary.json");

if (ag54aReview.status !== "backup_restore_plan_ready_for_ag54b") fail("AG54A status mismatch.");
if (ag54bReview.status !== "deployment_release_checklist_ready_for_ag54c") fail("AG54B status mismatch.");
if (ag54cReview.status !== "rollback_incident_response_plan_ready_for_ag54d") fail("AG54C status mismatch.");
if (ag54dReview.status !== "release_operations_audit_ready_for_ag54z") fail("AG54D status mismatch.");
if (ag54dReview.summary.ready_for_ag54z_release_operations_closure !== true) fail("AG54D must be ready for AG54Z.");
if (ag54dRisk.current_hard_blocker_count !== 0) fail("AG54D risk blockers must be zero.");
if (ag54dReadiness.ready_for_ag54z !== true) fail("AG54D readiness must permit AG54Z.");
if (ag54dBoundary.next_stage_id !== "AG54Z") fail("AG54D boundary must point to AG54Z.");

for (const file of [
  "data/content-intelligence/release-operations/ag54d-ag54a-backup-restore-audit.json",
  "data/content-intelligence/release-operations/ag54d-ag54b-deployment-release-checklist-audit.json",
  "data/content-intelligence/release-operations/ag54d-ag54c-rollback-incident-response-audit.json",
  "data/content-intelligence/release-operations/ag54d-release-operations-readiness-audit-record.json"
]) {
  const audit = readJson(file);
  if (audit.audit_result !== "passed") fail(`${file} must pass.`);
}

for (const file of [
  "data/content-intelligence/backend-architecture/ag54d-no-deployment-rollback-publishing-audit.json",
  "data/content-intelligence/backend-architecture/ag54d-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag54d-no-service-role-public-mutation-audit.json"
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

const review = readJson("data/content-intelligence/quality-reviews/ag54z-release-operations-closure.json");
const closure = readJson("data/content-intelligence/release-operations/ag54z-release-operations-closure-record.json");
const consumption = readJson("data/content-intelligence/release-operations/ag54z-ag54a-to-ag54d-consumption-summary.json");
const posture = readJson("data/content-intelligence/release-operations/ag54z-release-operations-posture-record.json");
const carryForward = readJson("data/content-intelligence/release-operations/ag54z-carry-forward-release-operations-deferral-register.json");
const handoff = readJson("data/content-intelligence/ag-roadmap/ag54z-to-ag55-v01-release-candidate-freeze-handoff.json");
const noDeploymentRollback = readJson("data/content-intelligence/backend-architecture/ag54z-no-deployment-rollback-publishing-audit.json");
const noBackendRuntime = readJson("data/content-intelligence/backend-architecture/ag54z-no-backend-auth-rls-database-runtime-audit.json");
const noServiceRolePublicMutation = readJson("data/content-intelligence/backend-architecture/ag54z-no-service-role-public-mutation-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag54z-ag55a-v01-scope-freeze-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag54z-to-ag55a-v01-scope-freeze-boundary.json");
const preview = readJson("data/quality/ag54z-release-operations-closure-preview.json");
const pkg = readJson("package.json");

if (review.status !== "release_operations_closed_ready_for_ag55a") fail("AG54Z review status mismatch.");

for (const key of [
  "ag54z_release_operations_closed",
  "ag54a_ag54b_ag54c_ag54d_consumed",
  "release_operations_closure_completed",
  "ag55a_v01_scope_freeze_handoff_created",
  "ready_for_ag55a_v01_scope_freeze"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag55a !== 0) fail("AG55A blocker count must be zero.");
if (closure.status !== "release_operations_closure_completed") fail("Closure status mismatch.");
if (closure.closure_allowed !== true) fail("Closure must be allowed.");

for (const stage of ["AG54A", "AG54B", "AG54C", "AG54D"]) {
  if (!JSON.stringify(consumption.consumed_outputs).includes(stage)) fail(`Consumption summary missing ${stage}.`);
}

if (posture.posture_summary.v01_scope_freeze !== "ready_for_AG55A_planning_only") fail("AG55A posture handoff mismatch.");
if (handoff.next_stage_id !== "AG55A") fail("Handoff must point to AG55A.");
if (readiness.ready_for_ag55a !== true) fail("AG55A readiness must be true.");
if (readiness.next_stage_id !== "AG55A") fail("Readiness must point to AG55A.");
if (boundary.next_stage_id !== "AG55A") fail("Boundary must point to AG55A.");

for (const item of [
  "actual deployment",
  "Vercel deployment trigger",
  "GitHub release/tag creation",
  "actual rollback execution",
  "restore operation",
  "content publishing",
  "public page mutation",
  "backend/Auth/Supabase activation",
  "runtime database/API reading",
  "RLS/grant mutation",
  "service-role use"
]) {
  if (!carryForward.deferred_items.includes(item)) fail(`Carry-forward missing: ${item}`);
}

for (const audit of [noDeploymentRollback, noBackendRuntime, noServiceRolePublicMutation]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

for (const key of [
  "actual_backup_archive_created",
  "restore_operation_executed",
  "actual_rollback_executed",
  "git_revert_or_reset_executed",
  "incident_action_executed",
  "actual_deployment_triggered",
  "vercel_deployment_triggered",
  "deployment_approved",
  "deployment_performed",
  "github_release_created",
  "live_public_check_executed",
  "external_release_automation_enabled",
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

if (!pkg.scripts?.["generate:ag54z"]) fail("Missing package script: generate:ag54z");
if (!pkg.scripts?.["validate:ag54z"]) fail("Missing package script: validate:ag54z");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag54z")) fail("validate:project must include validate:ag54z.");

pass("AG54Z Release Operations Closure is present.");
pass("AG54A–AG54D outputs are consumed.");
pass("Release operations closure record is valid.");
pass("Release operations posture and carry-forward deferral register are valid.");
pass("AG55A V01 scope freeze handoff is valid.");
pass("No deployment/rollback/publishing audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("No service-role/public mutation audit is valid.");
pass("AG55A V01 scope freeze readiness is valid.");
