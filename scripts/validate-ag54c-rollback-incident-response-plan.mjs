import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG54C validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
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

  "data/content-intelligence/quality-reviews/ag54a-backup-restore-plan.json",
  "data/content-intelligence/release-operations/ag54a-git-baseline-record.json",
  "data/content-intelligence/release-operations/ag54a-restore-method-plan.json",
  "data/content-intelligence/release-operations/ag54a-backup-restore-verification-sequence.json",
  "data/content-intelligence/release-operations/ag54a-backup-restore-boundary.json",

  "data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json",
  "data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json",
  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag54c-rollback-incident-response-plan.json",
  "data/content-intelligence/release-operations/ag54c-source-consumption-record.json",
  "data/content-intelligence/release-operations/ag54c-rollback-trigger-register.json",
  "data/content-intelligence/release-operations/ag54c-incident-response-action-path.json",
  "data/content-intelligence/release-operations/ag54c-homepage-article-listing-route-breakage-plan.json",
  "data/content-intelligence/release-operations/ag54c-privacy-security-incident-plan.json",
  "data/content-intelligence/release-operations/ag54c-communication-escalation-plan.json",
  "data/content-intelligence/release-operations/ag54c-rollback-incident-response-boundary.json",
  "data/content-intelligence/backend-architecture/ag54c-no-rollback-execution-audit.json",
  "data/content-intelligence/backend-architecture/ag54c-no-public-mutation-publishing-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag54c-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/quality-registry/ag54c-ag54d-release-operations-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag54c-to-ag54d-release-operations-audit-boundary.json",
  "data/quality/ag54c-rollback-incident-response-plan.json",
  "data/quality/ag54c-rollback-incident-response-plan-preview.json",
  "docs/quality/AG54C_ROLLBACK_INCIDENT_RESPONSE_PLAN.md",
  "scripts/generate-ag54c-rollback-incident-response-plan.mjs",
  "scripts/validate-ag54c-rollback-incident-response-plan.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag54bReview = readJson("data/content-intelligence/quality-reviews/ag54b-deployment-release-checklist.json");
const ag54bReadiness = readJson("data/content-intelligence/quality-registry/ag54b-ag54c-rollback-incident-response-readiness-record.json");
const ag54bBoundary = readJson("data/content-intelligence/mutation-plans/ag54b-to-ag54c-rollback-incident-response-boundary.json");

if (ag54bReview.status !== "deployment_release_checklist_ready_for_ag54c") fail("AG54B review status mismatch.");
if (ag54bReview.summary.ready_for_ag54c_rollback_incident_response_plan !== true) fail("AG54B must be ready for AG54C.");
if (ag54bReadiness.ready_for_ag54c !== true) fail("AG54B readiness must permit AG54C.");
if (ag54bBoundary.next_stage_id !== "AG54C") fail("AG54B boundary must point to AG54C.");

for (const file of [
  "data/content-intelligence/release-operations/ag54b-validate-git-commit-push-checklist.json",
  "data/content-intelligence/release-operations/ag54b-static-release-path-checklist.json",
  "data/content-intelligence/release-operations/ag54b-vercel-live-check-sequence-plan.json",
  "data/content-intelligence/release-operations/ag54b-release-gate-criteria.json",
  "data/content-intelligence/backend-architecture/ag54b-no-deployment-trigger-audit.json",
  "data/content-intelligence/backend-architecture/ag54b-no-public-mutation-publishing-audit.json",
  "data/content-intelligence/backend-architecture/ag54b-no-backend-auth-rls-database-runtime-audit.json",
  "data/content-intelligence/release-operations/ag54a-git-baseline-record.json",
  "data/content-intelligence/release-operations/ag54a-restore-method-plan.json",
  "data/content-intelligence/release-operations/ag54a-backup-restore-verification-sequence.json"
]) {
  const audit = readJson(file);
  if (audit.audit_passed !== true) fail(`${file} must pass.`);
}

const ag54aReview = readJson("data/content-intelligence/quality-reviews/ag54a-backup-restore-plan.json");
const ag54aBoundary = readJson("data/content-intelligence/release-operations/ag54a-backup-restore-boundary.json");
if (ag54aReview.status !== "backup_restore_plan_ready_for_ag54b") fail("AG54A review status mismatch.");
if (!ag54aBoundary.boundary_rules.includes("No restore operation is executed.")) fail("AG54A restore boundary missing.");

const ag53zReview = readJson("data/content-intelligence/quality-reviews/ag53z-public-quality-closure.json");
const ag52zReview = readJson("data/content-intelligence/quality-reviews/ag52z-security-privacy-legal-closure.json");
const ag51zReview = readJson("data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag53zReview.status !== "public_quality_closed_ready_for_ag54a") fail("AG53Z status mismatch.");
if (ag52zReview.status !== "security_privacy_legal_closed_ready_for_ag53a") fail("AG52Z status mismatch.");
if (ag51zReview.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") fail("AG51Z status mismatch.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag54c-rollback-incident-response-plan.json");
const sourceConsumption = readJson("data/content-intelligence/release-operations/ag54c-source-consumption-record.json");
const triggerRegister = readJson("data/content-intelligence/release-operations/ag54c-rollback-trigger-register.json");
const actionPath = readJson("data/content-intelligence/release-operations/ag54c-incident-response-action-path.json");
const routePlan = readJson("data/content-intelligence/release-operations/ag54c-homepage-article-listing-route-breakage-plan.json");
const privacyPlan = readJson("data/content-intelligence/release-operations/ag54c-privacy-security-incident-plan.json");
const escalationPlan = readJson("data/content-intelligence/release-operations/ag54c-communication-escalation-plan.json");
const incidentBoundary = readJson("data/content-intelligence/release-operations/ag54c-rollback-incident-response-boundary.json");
const noRollback = readJson("data/content-intelligence/backend-architecture/ag54c-no-rollback-execution-audit.json");
const noPublicMutation = readJson("data/content-intelligence/backend-architecture/ag54c-no-public-mutation-publishing-deployment-audit.json");
const noBackendRuntime = readJson("data/content-intelligence/backend-architecture/ag54c-no-backend-auth-rls-database-runtime-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag54c-ag54d-release-operations-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag54c-to-ag54d-release-operations-audit-boundary.json");
const preview = readJson("data/quality/ag54c-rollback-incident-response-plan-preview.json");
const pkg = readJson("package.json");

if (review.status !== "rollback_incident_response_plan_ready_for_ag54d") fail("AG54C review status mismatch.");

for (const key of [
  "ag54c_rollback_incident_response_plan_recorded",
  "ag54b_consumed",
  "rollback_trigger_register_recorded",
  "incident_response_action_path_recorded",
  "route_breakage_plan_recorded",
  "privacy_security_incident_plan_recorded",
  "communication_escalation_plan_recorded",
  "rollback_incident_boundary_recorded",
  "ready_for_ag54d_release_operations_audit"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
  if (preview[key] !== 1) fail(`${key} preview missing.`);
}

if (review.summary.hard_blocker_count_for_ag54d !== 0) fail("AG54D blocker count must be zero.");
if (sourceConsumption.status !== "source_consumption_recorded") fail("Source consumption status mismatch.");
if (!Object.prototype.hasOwnProperty.call(sourceConsumption.discovered_prior_rollback_context, "ag42_rollback_dry_run_candidates")) fail("AG42 rollback context key must be recorded.");

for (const audit of [triggerRegister, actionPath, routePlan, privacyPlan, escalationPlan]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
}

if (triggerRegister.rollback_triggered_now !== false) fail("Rollback trigger must not execute.");
if (actionPath.incident_action_executed_now !== false) fail("Incident action must not execute.");
if (routePlan.route_fix_executed_now !== false) fail("Route fix must not execute.");
if (privacyPlan.security_incident_action_executed_now !== false) fail("Security incident action must not execute.");
if (escalationPlan.escalation_executed_now !== false) fail("Escalation must not execute.");

if (!incidentBoundary.boundary_rules.includes("No rollback is executed.")) fail("No rollback boundary missing.");
if (!incidentBoundary.boundary_rules.includes("No git revert/reset is executed.")) fail("No git revert/reset boundary missing.");
if (!incidentBoundary.boundary_rules.includes("No restore operation is executed.")) fail("No restore boundary missing.");

for (const audit of [noRollback, noPublicMutation, noBackendRuntime]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
  if (audit.failed_checks.length !== 0) fail(`${audit.title} failed checks must be zero.`);
}

if (readiness.status !== "ready_for_ag54d_release_operations_audit") fail("AG54D readiness status mismatch.");
if (readiness.ready_for_ag54d !== true) fail("AG54D readiness must be true.");
if (readiness.next_stage_id !== "AG54D") fail("Readiness must point to AG54D.");
if (boundary.next_stage_id !== "AG54D") fail("Boundary must point to AG54D.");

for (const key of [
  "actual_rollback_executed",
  "git_revert_or_reset_executed",
  "restore_operation_executed",
  "incident_action_executed",
  "live_public_check_executed",
  "deployment_approved",
  "deployment_performed",
  "vercel_deployment_triggered",
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

if (!pkg.scripts?.["generate:ag54c"]) fail("Missing package script: generate:ag54c");
if (!pkg.scripts?.["validate:ag54c"]) fail("Missing package script: validate:ag54c");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag54c")) fail("validate:project must include validate:ag54c.");

pass("AG54C Rollback and Incident Response Plan is present.");
pass("AG54B deployment/release checklist is consumed.");
pass("Rollback trigger register is valid.");
pass("Incident response action path is valid.");
pass("Homepage/article/listing/route breakage plan is valid.");
pass("Privacy/security incident plan is valid.");
pass("Communication and escalation plan is valid.");
pass("Rollback/incident boundary is valid.");
pass("No rollback execution audit is valid.");
pass("No public mutation/publishing/deployment audit is valid.");
pass("No backend/Auth/RLS/database runtime audit is valid.");
pass("AG54D release operations audit readiness is valid.");
