import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG54A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json",
  "data/content-intelligence/public-quality/ag53z-public-quality-closure-record.json",
  "data/content-intelligence/public-quality/ag53z-public-quality-posture-record.json",
  "data/content-intelligence/public-quality/ag53z-carry-forward-public-quality-deferral-register.json",
  "data/content-intelligence/ag-roadmap/ag53z-to-ag54-release-operations-handoff.json",
  "data/content-intelligence/quality-registry/ag53z-ag54a-backup-restore-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag53z-to-ag54a-backup-restore-boundary.json",
  "data/content-intelligence/backend-architecture/ag53z-no-browser-automation-external-api-audit.json",
  "data/content-intelligence/backend-architecture/ag53z-no-public-mutation-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag53z-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  "data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json",
  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

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
  "data/quality/ag54a-backup-restore-plan.json",
  "data/quality/ag54a-backup-restore-plan-preview.json",
  "docs/quality/AG54A_BACKUP_RESTORE_PLAN.md",
  "scripts/generate-ag54a-backup-restore-plan.mjs",
  "scripts/validate-ag54a-backup-restore-plan.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag53zReview = readJson("data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json");
const ag53zClosure = readJson("data/content-intelligence/public-quality/ag53z-public-quality-closure-record.json");
const ag53zPosture = readJson("data/content-intelligence/public-quality/ag53z-public-quality-posture-record.json");
const ag53zCarryForward = readJson("data/content-intelligence/public-quality/ag53z-carry-forward-public-quality-deferral-register.json");
const ag53zHandoff = readJson("data/content-intelligence/ag-roadmap/ag53z-to-ag54-release-operations-handoff.json");
const ag53zReadiness = readJson("data/content-intelligence/quality-registry/ag53z-ag54a-backup-restore-readiness-record.json");
const ag53zBoundary = readJson("data/content-intelligence/mutation-plans/ag53z-to-ag54a-backup-restore-boundary.json");

if (ag53zReview.status !== "public_quality_closed_ready_for_ag54a") fail("AG53Z review status mismatch.");
if (ag53zClosure.status !== "public_quality_closure_completed") fail("AG53Z closure mismatch.");
if (ag53zPosture.posture_summary.release_operations !== "ready_for_AG54_planning_only") fail("AG53Z release posture mismatch.");
if (!ag53zCarryForward.deferred_items.includes("deployment")) fail("AG53Z deployment deferral missing.");
if (ag53zHandoff.next_stage_id !== "AG54A") fail("AG53Z handoff must point to AG54A.");
if (ag53zReadiness.ready_for_ag54a !== true) fail("AG53Z readiness must permit AG54A.");
if (ag53zBoundary.next_stage_id !== "AG54A") fail("AG53Z boundary must point to AG54A.");

for (const file of [
  "data/content-intelligence/backend-architecture/ag53z-no-browser-automation-external-api-audit.json",
  "data/content-intelligence/backend-architecture/ag53z-no-public-mutation-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag53z-no-backend-auth-rls-database-runtime-audit.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const ag52zReview = readJson("data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json");
const ag52zCarryForward = readJson("data/content-intelligence/security-compliance/ag52z-carry-forward-security-deferral-register.json");
const ag51zReview = readJson("data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") fail("AG52Z status mismatch.");
if (!ag52zCarryForward.deferred_items.includes("backend/Auth/Supabase activation")) fail("AG52Z backend deferral missing.");
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") fail("AG51Z status mismatch.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag54a-backup-restore-plan.json");
const sourceConsumption = readJson("data/content-intelligence/release-operations/ag54a-source-consumption-record.json");
const gitBaseline = readJson("data/content-intelligence/release-operations/ag54a-git-baseline-record.json");
const backupScope = readJson("data/content-intelligence/release-operations/ag54a-repo-content-static-artifact-backup-scope.json");
const restorePlan = readJson("data/content-intelligence/release-operations/ag54a-restore-method-plan.json");
const verification = readJson("data/content-intelligence/release-operations/ag54a-backup-restore-verification-sequence.json");
const supabaseDeferral = readJson("data/content-intelligence/release-operations/ag54a-supabase-backend-deferral-continuity-record.json");
const backupBoundary = readJson("data/content-intelligence/release-operations/ag54a-backup-restore-boundary.json");
const noExternalBackup = readJson("data/content-intelligence/backend-architecture/ag54a-no-external-backup-service-activation-audit.json");
const noPublicMutation = readJson("data/content-intelligence/backend-architecture/ag54a-no-public-mutation-publishing-deployment-audit.json");
const noBackendRuntime = readJson("data/content-intelligence/backend-architecture/ag54a-no-backend-auth-rls-database-runtime-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag54a-ag54b-deployment-release-checklist-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag54a-to-ag54b-deployment-release-checklist-boundary.json");
const preview = readJson("data/quality/ag54a-backup-restore-plan-preview.json");
const pkg = readJson("package.json");

if (review.status !== "backup_restore_plan_ready_for_ag54b") fail("AG54A review status mismatch.");

for (const key of [
  "ag54a_backup_restore_plan_recorded",
  "ag53z_consumed",
  "git_baseline_recorded",
  "repo_content_static_backup_scope_recorded",
  "restore_method_plan_recorded",
  "backup_restore_verification_sequence_recorded",
  "supabase_backend_deferral_continuity_recorded",
  "backup_restore_boundary_recorded",
  "ready_for_ag54b_deployment_release_checklist"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag54b !== 0) fail("AG54B blocker count must be zero.");
if (sourceConsumption.status !== "source_consumption_recorded") fail("Source consumption status mismatch.");
if (!Object.prototype.hasOwnProperty.call(sourceConsumption.discovered_prior_context, "ag53_public_quality_context")) fail("AG53 prior context must be recorded.");

for (const audit of [gitBaseline, backupScope, restorePlan, verification, supabaseDeferral]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
}

if (gitBaseline.baseline_rule.indexOf("no rollback, restore, deploy or mutation") === -1) fail("Git baseline rule must block restore/deploy/mutation.");
if (!backupScope.backup_scope.includes("data/content-intelligence governance records")) fail("Backup scope must include content-intelligence records.");
if (restorePlan.restore_executed_now !== false) fail("Restore must not be executed.");
if (verification.verification_run_now !== "generate_and_validate_only") fail("Verification mode mismatch.");
if (!supabaseDeferral.continuity_rules.includes("No service-role key is used.")) fail("Service-role deferral missing.");

if (!backupBoundary.boundary_rules.includes("No backup archive is created.")) fail("No backup archive boundary missing.");
if (!backupBoundary.boundary_rules.includes("No restore operation is executed.")) fail("No restore operation boundary missing.");

for (const audit of [noExternalBackup, noPublicMutation, noBackendRuntime]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag54b_deployment_release_checklist") fail("AG54B readiness status mismatch.");
if (readiness.ready_for_ag54b !== true) fail("AG54B readiness must be true.");
if (readiness.next_stage_id !== "AG54B") fail("Readiness must point to AG54B.");
if (boundary.next_stage_id !== "AG54B") fail("Boundary must point to AG54B.");

for (const key of [
  "actual_backup_archive_created",
  "external_backup_service_enabled",
  "restore_operation_executed",
  "file_system_mutation_beyond_governance_records",
  "deployment_approved",
  "deployment_performed",
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

if (!pkg.scripts?.["generate:ag54a"]) fail("Missing package script: generate:ag54a");
if (!pkg.scripts?.["validate:ag54a"]) fail("Missing package script: validate:ag54a");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag54a")) fail("validate:project must include validate:ag54a.");

pass("AG54A Backup and Restore Plan is present.");
pass("AG53Z public quality closure is consumed.");
pass("Git baseline record is valid.");
pass("Repo/content/static artifact backup scope is valid.");
pass("Restore method plan is valid.");
pass("Backup/restore verification sequence is valid.");
pass("Supabase/backend deferral continuity is valid.");
pass("Backup/restore boundary is valid.");
pass("No external backup service activation audit is valid.");
pass("No public mutation/publishing/deployment audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("AG54B deployment/release checklist readiness is valid.");
