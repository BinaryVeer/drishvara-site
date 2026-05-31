import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG51D validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag51a-editorial-monitoring-model.json",
  "data/content-intelligence/analytics-monitoring/ag51a-editorial-dashboard-panel-model.json",
  "data/content-intelligence/backend-architecture/ag51a-no-runtime-dashboard-audit.json",
  "data/content-intelligence/backend-architecture/ag51a-no-database-query-monitoring-job-audit.json",
  "data/content-intelligence/backend-architecture/ag51a-no-mutation-deployment-audit.json",

  "data/content-intelligence/quality-reviews/ag51b-article-module-health-model.json",
  "data/content-intelligence/analytics-monitoring/ag51b-article-health-metric-model.json",
  "data/content-intelligence/analytics-monitoring/ag51b-module-health-metric-model.json",
  "data/content-intelligence/analytics-monitoring/ag51b-content-surface-status-model.json",
  "data/content-intelligence/analytics-monitoring/ag51b-health-score-planning-boundary.json",
  "data/content-intelligence/backend-architecture/ag51b-no-runtime-health-dashboard-audit.json",
  "data/content-intelligence/backend-architecture/ag51b-no-database-query-monitoring-job-audit.json",
  "data/content-intelligence/backend-architecture/ag51b-no-mutation-deployment-audit.json",

  "data/content-intelligence/quality-reviews/ag51c-audit-error-exception-tracking-model.json",
  "data/content-intelligence/analytics-monitoring/ag51c-audit-error-exception-taxonomy.json",
  "data/content-intelligence/analytics-monitoring/ag51c-broken-url-reference-exception-model.json",
  "data/content-intelligence/analytics-monitoring/ag51c-image-credit-exception-model.json",
  "data/content-intelligence/analytics-monitoring/ag51c-layout-language-safety-exception-model.json",
  "data/content-intelligence/analytics-monitoring/ag51c-module-health-exception-routing-model.json",
  "data/content-intelligence/analytics-monitoring/ag51c-rollback-manual-review-exception-boundary.json",
  "data/content-intelligence/backend-architecture/ag51c-no-automated-checking-external-fetch-audit.json",
  "data/content-intelligence/backend-architecture/ag51c-no-runtime-exception-dashboard-audit.json",
  "data/content-intelligence/backend-architecture/ag51c-no-database-query-monitoring-job-audit.json",
  "data/content-intelligence/backend-architecture/ag51c-no-mutation-deployment-audit.json",
  "data/content-intelligence/quality-registry/ag51c-ag51d-dashboard-planning-audit-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag51c-to-ag51d-dashboard-planning-audit-boundary.json",

  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag51d-dashboard-planning-audit.json",
  "data/content-intelligence/analytics-monitoring/ag51d-dashboard-planning-audit-record.json",
  "data/content-intelligence/analytics-monitoring/ag51d-ag51a-editorial-monitoring-audit.json",
  "data/content-intelligence/analytics-monitoring/ag51d-ag51b-article-module-health-audit.json",
  "data/content-intelligence/analytics-monitoring/ag51d-ag51c-exception-tracking-audit.json",
  "data/content-intelligence/analytics-monitoring/ag51d-dashboard-panel-readiness-audit.json",
  "data/content-intelligence/analytics-monitoring/ag51d-runtime-blocker-continuity-audit.json",
  "data/content-intelligence/backend-architecture/ag51d-no-live-dashboard-activation-audit.json",
  "data/content-intelligence/backend-architecture/ag51d-no-runtime-query-monitoring-job-audit.json",
  "data/content-intelligence/backend-architecture/ag51d-no-mutation-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag51d-no-secret-exposure-audit.json",
  "data/content-intelligence/quality-registry/ag51d-ag51z-analytics-monitoring-closure-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag51d-to-ag51z-analytics-monitoring-closure-boundary.json",
  "data/quality/ag51d-dashboard-planning-audit.json",
  "data/quality/ag51d-dashboard-planning-audit-preview.json",
  "docs/quality/AG51D_DASHBOARD_PLANNING_AUDIT.md",
  "scripts/generate-ag51d-dashboard-planning-audit.mjs",
  "scripts/validate-ag51d-dashboard-planning-audit.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag51aReview = readJson("data/content-intelligence/quality-reviews/ag51a-editorial-monitoring-model.json");
const ag51aPanelModel = readJson("data/content-intelligence/analytics-monitoring/ag51a-editorial-dashboard-panel-model.json");
const ag51aNoRuntimeDashboard = readJson("data/content-intelligence/backend-architecture/ag51a-no-runtime-dashboard-audit.json");
const ag51aNoDatabaseQuery = readJson("data/content-intelligence/backend-architecture/ag51a-no-database-query-monitoring-job-audit.json");
const ag51aNoMutationDeployment = readJson("data/content-intelligence/backend-architecture/ag51a-no-mutation-deployment-audit.json");

const ag51bReview = readJson("data/content-intelligence/quality-reviews/ag51b-article-module-health-model.json");
const ag51bArticleHealth = readJson("data/content-intelligence/analytics-monitoring/ag51b-article-health-metric-model.json");
const ag51bModuleHealth = readJson("data/content-intelligence/analytics-monitoring/ag51b-module-health-metric-model.json");
const ag51bHealthScoreBoundary = readJson("data/content-intelligence/analytics-monitoring/ag51b-health-score-planning-boundary.json");
const ag51bNoRuntimeHealth = readJson("data/content-intelligence/backend-architecture/ag51b-no-runtime-health-dashboard-audit.json");
const ag51bNoDatabaseQuery = readJson("data/content-intelligence/backend-architecture/ag51b-no-database-query-monitoring-job-audit.json");
const ag51bNoMutationDeployment = readJson("data/content-intelligence/backend-architecture/ag51b-no-mutation-deployment-audit.json");

const ag51cReview = readJson("data/content-intelligence/quality-reviews/ag51c-audit-error-exception-tracking-model.json");
const ag51cTaxonomy = readJson("data/content-intelligence/analytics-monitoring/ag51c-audit-error-exception-taxonomy.json");
const ag51cBrokenUrlReference = readJson("data/content-intelligence/analytics-monitoring/ag51c-broken-url-reference-exception-model.json");
const ag51cImageCredit = readJson("data/content-intelligence/analytics-monitoring/ag51c-image-credit-exception-model.json");
const ag51cLayoutLanguageSafety = readJson("data/content-intelligence/analytics-monitoring/ag51c-layout-language-safety-exception-model.json");
const ag51cRollbackBoundary = readJson("data/content-intelligence/analytics-monitoring/ag51c-rollback-manual-review-exception-boundary.json");
const ag51cNoAutomatedChecking = readJson("data/content-intelligence/backend-architecture/ag51c-no-automated-checking-external-fetch-audit.json");
const ag51cNoRuntimeExceptionDashboard = readJson("data/content-intelligence/backend-architecture/ag51c-no-runtime-exception-dashboard-audit.json");
const ag51cNoDatabaseQuery = readJson("data/content-intelligence/backend-architecture/ag51c-no-database-query-monitoring-job-audit.json");
const ag51cNoMutationDeployment = readJson("data/content-intelligence/backend-architecture/ag51c-no-mutation-deployment-audit.json");
const ag51cReadiness = readJson("data/content-intelligence/quality-registry/ag51c-ag51d-dashboard-planning-audit-readiness-record.json");
const ag51cBoundary = readJson("data/content-intelligence/mutation-plans/ag51c-to-ag51d-dashboard-planning-audit-boundary.json");

const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag51aReview.status !== "editorial_monitoring_model_ready_for_ag51b") fail("AG51A review status mismatch.");
if (!ag51aPanelModel.planned_panels_design_only.includes("module_health_status")) fail("AG51A module health panel missing.");
if (ag51aNoRuntimeDashboard.audit_passed !== true) fail("AG51A no runtime dashboard audit must pass.");
if (ag51aNoDatabaseQuery.audit_passed !== true) fail("AG51A no DB query audit must pass.");
if (ag51aNoMutationDeployment.audit_passed !== true) fail("AG51A no mutation/deployment audit must pass.");

if (ag51bReview.status !== "article_module_health_model_ready_for_ag51c") fail("AG51B review status mismatch.");
if (!ag51bArticleHealth.planned_article_health_dimensions_design_only.includes("article_quality_audit_status")) fail("AG51B article quality dimension missing.");
if (!ag51bModuleHealth.planned_modules_design_only.includes("Featured Reads")) fail("AG51B Featured Reads module missing.");
if (!ag51bHealthScoreBoundary.planning_rules.includes("No score is computed in AG51B.")) fail("AG51B no-score rule missing.");
if (ag51bNoRuntimeHealth.audit_passed !== true) fail("AG51B no runtime health audit must pass.");
if (ag51bNoDatabaseQuery.audit_passed !== true) fail("AG51B no DB query audit must pass.");
if (ag51bNoMutationDeployment.audit_passed !== true) fail("AG51B no mutation/deployment audit must pass.");

if (ag51cReview.status !== "audit_error_exception_tracking_model_ready_for_ag51d") fail("AG51C review status mismatch.");
if (!JSON.stringify(ag51cTaxonomy.exception_groups_design_only).includes("reference_exceptions")) fail("AG51C reference exception taxonomy missing.");
if (!ag51cBrokenUrlReference.planned_exception_categories_design_only.includes("broken_or_unreachable_reference")) fail("AG51C broken reference exception missing.");
if (!ag51cImageCredit.planned_exception_categories_design_only.includes("missing_image_credit")) fail("AG51C missing image credit exception missing.");
if (!ag51cLayoutLanguageSafety.planned_exception_categories_design_only.includes("diagnostic_or_deterministic_language_risk")) fail("AG51C safety language exception missing.");
if (!ag51cRollbackBoundary.boundary_rules.includes("No rollback is executed.")) fail("AG51C no rollback boundary missing.");
if (ag51cNoAutomatedChecking.audit_passed !== true) fail("AG51C no automated checking audit must pass.");
if (ag51cNoRuntimeExceptionDashboard.audit_passed !== true) fail("AG51C no runtime exception dashboard audit must pass.");
if (ag51cNoDatabaseQuery.audit_passed !== true) fail("AG51C no database query audit must pass.");
if (ag51cNoMutationDeployment.audit_passed !== true) fail("AG51C no mutation/deployment audit must pass.");
if (ag51cReadiness.ready_for_ag51d !== true) fail("AG51C readiness must permit AG51D.");
if (ag51cBoundary.next_stage_id !== "AG51D") fail("AG51C boundary must point to AG51D.");

if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag51d-dashboard-planning-audit.json");
const dashboardPlanningAudit = readJson("data/content-intelligence/analytics-monitoring/ag51d-dashboard-planning-audit-record.json");
const editorialMonitoringAudit = readJson("data/content-intelligence/analytics-monitoring/ag51d-ag51a-editorial-monitoring-audit.json");
const articleModuleHealthAudit = readJson("data/content-intelligence/analytics-monitoring/ag51d-ag51b-article-module-health-audit.json");
const exceptionTrackingAudit = readJson("data/content-intelligence/analytics-monitoring/ag51d-ag51c-exception-tracking-audit.json");
const panelReadinessAudit = readJson("data/content-intelligence/analytics-monitoring/ag51d-dashboard-panel-readiness-audit.json");
const runtimeBlockerContinuityAudit = readJson("data/content-intelligence/analytics-monitoring/ag51d-runtime-blocker-continuity-audit.json");
const noLiveDashboardAudit = readJson("data/content-intelligence/backend-architecture/ag51d-no-live-dashboard-activation-audit.json");
const noRuntimeQueryJobAudit = readJson("data/content-intelligence/backend-architecture/ag51d-no-runtime-query-monitoring-job-audit.json");
const noMutationDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag51d-no-mutation-deployment-audit.json");
const noSecretExposureAudit = readJson("data/content-intelligence/backend-architecture/ag51d-no-secret-exposure-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag51d-ag51z-analytics-monitoring-closure-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag51d-to-ag51z-analytics-monitoring-closure-boundary.json");
const preview = readJson("data/quality/ag51d-dashboard-planning-audit-preview.json");
const pkg = readJson("package.json");

if (review.status !== "dashboard_planning_audit_ready_for_ag51z") fail("AG51D review status mismatch.");

for (const key of [
  "ag51d_dashboard_planning_audit_recorded",
  "ag51a_ag51b_ag51c_consumed",
  "editorial_monitoring_audit_passed",
  "article_module_health_audit_passed",
  "exception_tracking_audit_passed",
  "dashboard_panel_readiness_audit_passed",
  "runtime_blocker_continuity_audit_passed",
  "ready_for_ag51z_analytics_monitoring_closure"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag51z !== 0) fail("AG51Z blocker count must be zero.");

for (const key of [
  "live_dashboard_enabled",
  "dashboard_runtime_enabled",
  "exception_dashboard_runtime_enabled",
  "analytics_runtime_enabled",
  "article_health_runtime_enabled",
  "module_health_runtime_enabled",
  "health_score_runtime_enabled",
  "runtime_database_query_enabled",
  "monitoring_job_enabled",
  "scheduled_monitoring_job_enabled",
  "automated_link_checking_enabled",
  "automated_reference_checking_enabled",
  "automated_image_checking_enabled",
  "external_fetch_or_api_enabled",
  "exception_auto_resolution_enabled",
  "editorial_assignment_mutation_enabled",
  "queue_mutation_enabled",
  "github_write_enabled",
  "public_content_mutation_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "supabase_auth_backend_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_dashboard_exposed"
]) {
  if (review.summary[key] !== false) fail(`${key} must remain false.`);
}

if (dashboardPlanningAudit.status !== "dashboard_planning_audit_recorded") fail("Dashboard planning audit status mismatch.");
if (dashboardPlanningAudit.audit_result !== "passed") fail("Dashboard planning audit must pass.");
if (dashboardPlanningAudit.audit_position !== "planning_only_no_runtime_dashboard") fail("Dashboard audit must remain planning-only.");

for (const audit of [editorialMonitoringAudit, articleModuleHealthAudit, exceptionTrackingAudit, panelReadinessAudit, runtimeBlockerContinuityAudit]) {
  if (audit.audit_result !== "passed") fail(`${audit.title} must pass.`);
  if (Array.isArray(audit.blocking_gaps) && audit.blocking_gaps.length !== 0) fail(`${audit.title} blocking gaps must be zero.`);
}

if (!panelReadinessAudit.dashboard_panels_ready_as_planning_only.includes("exception_tracking_status")) fail("Exception tracking panel readiness missing.");
if (panelReadinessAudit.readiness_position.dashboard_runtime_enabled_now !== false) fail("Dashboard runtime must remain disabled.");

if (!runtimeBlockerContinuityAudit.blockers_verified.includes("service-role key exposure remains blocked")) fail("Service-role blocker continuity missing.");

if (noLiveDashboardAudit.audit_passed !== true) fail("No live dashboard audit must pass.");
if (noLiveDashboardAudit.failed_checks.length !== 0) fail("No live dashboard failed checks must be zero.");

if (noRuntimeQueryJobAudit.audit_passed !== true) fail("No runtime query/job audit must pass.");
if (noRuntimeQueryJobAudit.failed_checks.length !== 0) fail("No runtime query/job failed checks must be zero.");

if (noMutationDeploymentAudit.audit_passed !== true) fail("No mutation/deployment audit must pass.");
if (noMutationDeploymentAudit.failed_checks.length !== 0) fail("No mutation/deployment failed checks must be zero.");

if (noSecretExposureAudit.audit_passed !== true) fail("No secret exposure audit must pass.");
if (noSecretExposureAudit.service_role_key_exposed !== false) fail("Service-role key must not be exposed.");

if (readiness.status !== "ready_for_ag51z_analytics_monitoring_closure") fail("AG51Z readiness status mismatch.");
if (readiness.ready_for_ag51z !== true) fail("AG51Z readiness must be true.");
if (readiness.next_stage_id !== "AG51Z") fail("Readiness must point to AG51Z.");
if (!readiness.ag51z_allowed_scope.includes("Close AG51 analytics and monitoring planning.")) fail("AG51Z closure scope missing.");
if (!readiness.ag51z_blocked_scope.includes("Live dashboard")) fail("AG51Z must block live dashboard.");

if (boundary.next_stage_id !== "AG51Z") fail("Boundary must point to AG51Z.");

for (const key of [
  "ag51d_dashboard_planning_audit_recorded",
  "ag51a_ag51b_ag51c_consumed",
  "editorial_monitoring_audit_passed",
  "article_module_health_audit_passed",
  "exception_tracking_audit_passed",
  "dashboard_panel_readiness_audit_passed",
  "runtime_blocker_continuity_audit_passed",
  "ready_for_ag51z_analytics_monitoring_closure"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "live_dashboard_enabled",
  "dashboard_runtime_enabled",
  "exception_dashboard_runtime_enabled",
  "analytics_runtime_enabled",
  "article_health_runtime_enabled",
  "module_health_runtime_enabled",
  "health_score_runtime_enabled",
  "runtime_database_query_enabled",
  "monitoring_job_enabled",
  "scheduled_monitoring_job_enabled",
  "automated_link_checking_enabled",
  "automated_reference_checking_enabled",
  "automated_image_checking_enabled",
  "external_fetch_or_api_enabled",
  "exception_auto_resolution_enabled",
  "editorial_assignment_mutation_enabled",
  "queue_mutation_enabled",
  "github_write_enabled",
  "public_content_mutation_enabled",
  "website_database_reading_enabled",
  "api_runtime_database_reading_approved_now",
  "supabase_auth_backend_activation_approved",
  "backend_auth_supabase_activation_performed",
  "rls_public_policy_activation_approved",
  "deployment_approved",
  "deployment_performed",
  "service_role_key_exposed",
  "public_dashboard_exposed"
]) {
  if (preview[key] !== 0) fail(`Preview ${key} must be zero.`);
}

if (!pkg.scripts?.["generate:ag51d"]) fail("Missing package script: generate:ag51d");
if (!pkg.scripts?.["validate:ag51d"]) fail("Missing package script: validate:ag51d");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag51d")) fail("validate:project must include validate:ag51d.");

pass("AG51D Dashboard Planning Audit is present.");
pass("AG51A, AG51B and AG51C outputs are consumed.");
pass("Dashboard planning audit is valid.");
pass("Editorial monitoring audit is valid.");
pass("Article/module health audit is valid.");
pass("Exception tracking audit is valid.");
pass("Dashboard panel readiness audit is valid.");
pass("Runtime blocker continuity audit is valid.");
pass("No live dashboard activation audit is valid.");
pass("No runtime query / monitoring job audit is valid.");
pass("No mutation / deployment audit is valid.");
pass("No secret exposure audit is valid.");
pass("AG51Z analytics and monitoring closure readiness is valid.");
