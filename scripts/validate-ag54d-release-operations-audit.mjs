import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG54D validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag54a-backup-restore-plan.json",
  "data/content-intelligence/quality-reviews/ag54b-deployment-release-checklist.json",
  "data/content-intelligence/quality-reviews/ag54c-rollback-incident-response-plan.json",
  "data/content-intelligence/release-operations/ag54a-git-baseline-record.json",
  "data/content-intelligence/release-operations/ag54a-repo-content-static-artifact-backup-scope.json",
  "data/content-intelligence/release-operations/ag54a-restore-method-plan.json",
  "data/content-intelligence/release-operations/ag54a-backup-restore-verification-sequence.json",
  "data/content-intelligence/release-operations/ag54a-supabase-backend-deferral-continuity-record.json",
  "data/content-intelligence/release-operations/ag54b-validate-git-commit-push-checklist.json",
  "data/content-intelligence/release-operations/ag54b-static-release-path-checklist.json",
  "data/content-intelligence/release-operations/ag54b-vercel-live-check-sequence-plan.json",
  "data/content-intelligence/release-operations/ag54b-release-gate-criteria.json",
  "data/content-intelligence/release-operations/ag54c-rollback-trigger-register.json",
  "data/content-intelligence/release-operations/ag54c-incident-response-action-path.json",
  "data/content-intelligence/release-operations/ag54c-homepage-article-listing-route-breakage-plan.json",
  "data/content-intelligence/release-operations/ag54c-privacy-security-incident-plan.json",
  "data/content-intelligence/release-operations/ag54c-communication-escalation-plan.json",
  "data/content-intelligence/backend-architecture/ag54a-no-external-backup-service-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag54a-no-public-mutation-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag54a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag54b-no-deployment-trigger-audit.json",
  "data/content-intelligence/backend-architecture/ag54b-no-public-mutation-publishing-audit.json",
  "data/content-intelligence/backend-architecture/ag54b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag54c-no-rollback-execution-audit.json",
  "data/content-intelligence/backend-architecture/ag54c-no-public-mutation-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag54c-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag54c-ag54d-release-operations-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag54c-to-ag54d-release-operations-audit-boundary.json",
  "data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json",
  "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

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
  "data/quality/ag54d-release-operations-audit.json",
  "data/quality/ag54d-release-operations-audit-preview.json",
  "docs/quality/AG54D_RELEASE_OPERATIONS_AUDIT.md",
  "scripts/generate-ag54d-release-operations-audit.mjs",
  "scripts/validate-ag54d-release-operations-audit.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag54aReview = readJson("data/content-intelligence/quality-reviews/ag54a-backup-restore-plan.json");
const ag54bReview = readJson("data/content-intelligence/quality-reviews/ag54b-deployment-release-checklist.json");
const ag54cReview = readJson("data/content-intelligence/quality-reviews/ag54c-rollback-incident-response-plan.json");
const ag54cReadiness = readJson("data/content-intelligence/quality-registry/ag54c-ag54d-release-operations-audit-readiness-record.json");
const ag54cBoundary = readJson("data/content-intelligence/mutation-plans/ag54c-to-ag54d-release-operations-audit-boundary.json");

if (ag54aReview.status !== "backup_restore_plan_ready_for_ag54b") fail("AG54A status mismatch.");
if (ag54bReview.status !== "deployment_release_checklist_ready_for_ag54c") fail("AG54B status mismatch.");
if (ag54cReview.status !== "rollback_incident_response_plan_ready_for_ag54d") fail("AG54C status mismatch.");
if (ag54cReview.summary.ready_for_ag54d_release_operations_audit !== true) fail("AG54C must be ready for AG54D.");
if (ag54cReadiness.ready_for_ag54d !== true) fail("AG54C readiness must permit AG54D.");
if (ag54cBoundary.next_stage_id !== "AG54D") fail("AG54C boundary must point to AG54D.");

for (const file of [
  "data/content-intelligence/release-operations/ag54a-git-baseline-record.json",
  "data/content-intelligence/release-operations/ag54a-repo-content-static-artifact-backup-scope.json",
  "data/content-intelligence/release-operations/ag54a-restore-method-plan.json",
  "data/content-intelligence/release-operations/ag54a-backup-restore-verification-sequence.json",
  "data/content-intelligence/release-operations/ag54a-supabase-backend-deferral-continuity-record.json",
  "data/content-intelligence/release-operations/ag54b-validate-git-commit-push-checklist.json",
  "data/content-intelligence/release-operations/ag54b-static-release-path-checklist.json",
  "data/content-intelligence/release-operations/ag54b-vercel-live-check-sequence-plan.json",
  "data/content-intelligence/release-operations/ag54b-release-gate-criteria.json",
  "data/content-intelligence/release-operations/ag54c-rollback-trigger-register.json",
  "data/content-intelligence/release-operations/ag54c-incident-response-action-path.json",
  "data/content-intelligence/release-operations/ag54c-homepage-article-listing-route-breakage-plan.json",
  "data/content-intelligence/release-operations/ag54c-privacy-security-incident-plan.json",
  "data/content-intelligence/release-operations/ag54c-communication-escalation-plan.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

for (const file of [
  "data/content-intelligence/backend-architecture/ag54a-no-external-backup-service-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag54a-no-public-mutation-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag54a-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag54b-no-deployment-trigger-audit.json",
  "data/content-intelligence/backend-architecture/ag54b-no-public-mutation-publishing-audit.json",
  "data/content-intelligence/backend-architecture/ag54b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/backend-architecture/ag54c-no-rollback-execution-audit.json",
  "data/content-intelligence/backend-architecture/ag54c-no-public-mutation-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag54c-no-backend-auth-rls-database-runtime-audit.json"
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

const review = readJson("data/content-intelligence/quality-reviews/ag54d-release-operations-audit.json");
const ag54aAudit = readJson("data/content-intelligence/release-operations/ag54d-ag54a-backup-restore-audit.json");
const ag54bAudit = readJson("data/content-intelligence/release-operations/ag54d-ag54b-deployment-release-checklist-audit.json");
const ag54cAudit = readJson("data/content-intelligence/release-operations/ag54d-ag54c-rollback-incident-response-audit.json");
const riskRegister = readJson("data/content-intelligence/release-operations/ag54d-combined-release-operations-risk-register.json");
const operationsReadiness = readJson("data/content-intelligence/release-operations/ag54d-release-operations-readiness-audit-record.json");
const noDeploymentRollback = readJson("data/content-intelligence/backend-architecture/ag54d-no-deployment-rollback-publishing-audit.json");
const noBackendRuntime = readJson("data/content-intelligence/backend-architecture/ag54d-no-backend-auth-rls-database-runtime-audit.json");
const noServiceRolePublicMutation = readJson("data/content-intelligence/backend-architecture/ag54d-no-service-role-public-mutation-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag54d-ag54z-release-operations-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag54d-to-ag54z-release-operations-closure-boundary.json");
const preview = readJson("data/quality/ag54d-release-operations-audit-preview.json");
const pkg = readJson("package.json");

if (review.status !== "release_operations_audit_ready_for_ag54z") fail("AG54D review status mismatch.");

for (const key of [
  "ag54d_release_operations_audit_recorded",
  "ag54a_ag54b_ag54c_consumed",
  "ag54a_backup_restore_audit_passed",
  "ag54b_deployment_release_checklist_audit_passed",
  "ag54c_rollback_incident_response_audit_passed",
  "combined_release_operations_risk_register_recorded",
  "release_operations_readiness_audit_passed",
  "ready_for_ag54z_release_operations_closure"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag54z !== 0) fail("AG54Z blocker count must be zero.");

for (const audit of [ag54aAudit, ag54bAudit, ag54cAudit, operationsReadiness]) {
  if (audit.audit_result !== "passed") fail(`${audit.title} must pass.`);
  if (Array.isArray(audit.blocking_gaps) && audit.blocking_gaps.length !== 0) fail(`${audit.title} blocking gaps must be zero.`);
}

if (riskRegister.current_hard_blocker_count !== 0) fail("Release operations risk blockers must be zero.");
if (!JSON.stringify(riskRegister.residual_risks_carried_forward).includes("future_deployment_execution")) fail("Future deployment residual risk must be carried forward.");

for (const audit of [noDeploymentRollback, noBackendRuntime, noServiceRolePublicMutation]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag54z_release_operations_closure") fail("AG54Z readiness status mismatch.");
if (readiness.ready_for_ag54z !== true) fail("AG54Z readiness must be true.");
if (readiness.next_stage_id !== "AG54Z") fail("Readiness must point to AG54Z.");
if (boundary.next_stage_id !== "AG54Z") fail("Boundary must point to AG54Z.");

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

if (!pkg.scripts?.["generate:ag54d"]) fail("Missing package script: generate:ag54d");
if (!pkg.scripts?.["validate:ag54d"]) fail("Missing package script: validate:ag54d");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag54d")) fail("validate:project must include validate:ag54d.");

pass("AG54D Release Operations Audit is present.");
pass("AG54A backup/restore plan is consumed and audited.");
pass("AG54B deployment/release checklist is consumed and audited.");
pass("AG54C rollback/incident response plan is consumed and audited.");
pass("Combined release operations risk register is valid.");
pass("Release operations readiness audit is valid.");
pass("No deployment/rollback/publishing audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("No service-role/public mutation audit is valid.");
pass("AG54Z release operations closure readiness is valid.");
