import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG51Z validation failed: ${message}`);
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

  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json",
  "data/content-intelligence/analytics-monitoring/ag51z-analytics-monitoring-closure-record.json",
  "data/content-intelligence/analytics-monitoring/ag51z-ag51a-to-ag51d-consumption-summary.json",
  "data/content-intelligence/analytics-monitoring/ag51z-carry-forward-deferral-register.json",
  "data/content-intelligence/analytics-monitoring/ag51z-dashboard-surface-closure-position.json",
  "data/content-intelligence/ag-roadmap/ag51z-post-ag51-roadmap-checkpoint-handoff.json",
  "data/content-intelligence/backend-architecture/ag51z-no-live-dashboard-audit.json",
  "data/content-intelligence/backend-architecture/ag51z-no-runtime-query-monitoring-job-audit.json",
  "data/content-intelligence/backend-architecture/ag51z-no-automated-checking-audit.json",
  "data/content-intelligence/backend-architecture/ag51z-no-mutation-deployment-audit.json",
  "data/content-intelligence/backend-architecture/ag51z-no-secret-exposure-audit.json",
  "data/content-intelligence/quality-registry/ag51z-post-ag51-roadmap-checkpoint-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag51z-to-post-ag51-roadmap-checkpoint-boundary.json",
  "data/quality/ag51z-analytics-monitoring-closure.json",
  "data/quality/ag51z-analytics-monitoring-closure-preview.json",
  "docs/quality/AG51Z_ANALYTICS_MONITORING_CLOSURE.md",
  "scripts/generate-ag51z-analytics-monitoring-closure.mjs",
  "scripts/validate-ag51z-analytics-monitoring-closure.mjs",
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
const ag51cNoAutomatedChecking = readJson("data/content-intelligence/backend-architecture/ag51c-no-automated-checking-external-fetch-audit.json");
const ag51cNoRuntimeExceptionDashboard = readJson("data/content-intelligence/backend-architecture/ag51c-no-runtime-exception-dashboard-audit.json");
const ag51cNoDatabaseQuery = readJson("data/content-intelligence/backend-architecture/ag51c-no-database-query-monitoring-job-audit.json");
const ag51cNoMutationDeployment = readJson("data/content-intelligence/backend-architecture/ag51c-no-mutation-deployment-audit.json");

const ag51dReview = readJson("data/content-intelligence/quality-reviews/ag51d-dashboard-planning-audit.json");
const ag51dDashboardPlanningAudit = readJson("data/content-intelligence/analytics-monitoring/ag51d-dashboard-planning-audit-record.json");
const ag51dRuntimeBlockerAudit = readJson("data/content-intelligence/analytics-monitoring/ag51d-runtime-blocker-continuity-audit.json");
const ag51dNoLiveDashboard = readJson("data/content-intelligence/backend-architecture/ag51d-no-live-dashboard-activation-audit.json");
const ag51dNoRuntimeQueryJob = readJson("data/content-intelligence/backend-architecture/ag51d-no-runtime-query-monitoring-job-audit.json");
const ag51dNoMutationDeployment = readJson("data/content-intelligence/backend-architecture/ag51d-no-mutation-deployment-audit.json");
const ag51dNoSecretExposure = readJson("data/content-intelligence/backend-architecture/ag51d-no-secret-exposure-audit.json");
const ag51dReadiness = readJson("data/content-intelligence/quality-registry/ag51d-ag51z-analytics-monitoring-closure-readiness-record.json");
const ag51dBoundary = readJson("data/content-intelligence/mutation-plans/ag51d-to-ag51z-analytics-monitoring-closure-boundary.json");

const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag51aReview.status !== "editorial_monitoring_model_ready_for_ag51b") fail("AG51A review status mismatch.");
if (!ag51aPanelModel.planned_panels_design_only.includes("module_health_status")) fail("AG51A module-health panel missing.");
if (ag51aNoRuntimeDashboard.audit_passed !== true) fail("AG51A no runtime dashboard audit must pass.");
if (ag51aNoDatabaseQuery.audit_passed !== true) fail("AG51A no database query audit must pass.");
if (ag51aNoMutationDeployment.audit_passed !== true) fail("AG51A no mutation/deployment audit must pass.");

if (ag51bReview.status !== "article_module_health_model_ready_for_ag51c") fail("AG51B review status mismatch.");
if (!ag51bArticleHealth.planned_article_health_dimensions_design_only.includes("article_quality_audit_status")) fail("AG51B article-quality dimension missing.");
if (!ag51bModuleHealth.planned_modules_design_only.includes("Featured Reads")) fail("AG51B Featured Reads module missing.");
if (!ag51bHealthScoreBoundary.planning_rules.includes("No score is computed in AG51B.")) fail("AG51B no-score boundary missing.");
if (ag51bNoRuntimeHealth.audit_passed !== true) fail("AG51B no runtime health audit must pass.");
if (ag51bNoDatabaseQuery.audit_passed !== true) fail("AG51B no database query audit must pass.");
if (ag51bNoMutationDeployment.audit_passed !== true) fail("AG51B no mutation/deployment audit must pass.");

if (ag51cReview.status !== "audit_error_exception_tracking_model_ready_for_ag51d") fail("AG51C review status mismatch.");
if (!JSON.stringify(ag51cTaxonomy.exception_groups_design_only).includes("reference_exceptions")) fail("AG51C reference exception taxonomy missing.");
if (!ag51cBrokenUrlReference.planned_exception_categories_design_only.includes("broken_or_unreachable_reference")) fail("AG51C broken reference exception missing.");
if (!ag51cImageCredit.planned_exception_categories_design_only.includes("missing_image_credit")) fail("AG51C missing image credit exception missing.");
if (ag51cNoAutomatedChecking.audit_passed !== true) fail("AG51C no automated checking audit must pass.");
if (ag51cNoRuntimeExceptionDashboard.audit_passed !== true) fail("AG51C no runtime exception dashboard audit must pass.");
if (ag51cNoDatabaseQuery.audit_passed !== true) fail("AG51C no database query audit must pass.");
if (ag51cNoMutationDeployment.audit_passed !== true) fail("AG51C no mutation/deployment audit must pass.");

if (ag51dReview.status !== "dashboard_planning_audit_ready_for_ag51z") fail("AG51D review status mismatch.");
if (ag51dDashboardPlanningAudit.audit_result !== "passed") fail("AG51D dashboard audit must pass.");
if (ag51dRuntimeBlockerAudit.audit_result !== "passed") fail("AG51D runtime blocker audit must pass.");
if (ag51dNoLiveDashboard.audit_passed !== true) fail("AG51D no live dashboard audit must pass.");
if (ag51dNoRuntimeQueryJob.audit_passed !== true) fail("AG51D no runtime query/job audit must pass.");
if (ag51dNoMutationDeployment.audit_passed !== true) fail("AG51D no mutation/deployment audit must pass.");
if (ag51dNoSecretExposure.audit_passed !== true) fail("AG51D no secret exposure audit must pass.");
if (ag51dReadiness.ready_for_ag51z !== true) fail("AG51D readiness must permit AG51Z.");
if (ag51dBoundary.next_stage_id !== "AG51Z") fail("AG51D boundary must point to AG51Z.");

if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag51z-analytics-monitoring-closure.json");
const closureRecord = readJson("data/content-intelligence/analytics-monitoring/ag51z-analytics-monitoring-closure-record.json");
const consumptionSummary = readJson("data/content-intelligence/analytics-monitoring/ag51z-ag51a-to-ag51d-consumption-summary.json");
const carryForwardDeferralRegister = readJson("data/content-intelligence/analytics-monitoring/ag51z-carry-forward-deferral-register.json");
const dashboardSurfaceClosure = readJson("data/content-intelligence/analytics-monitoring/ag51z-dashboard-surface-closure-position.json");
const postAg51Handoff = readJson("data/content-intelligence/ag-roadmap/ag51z-post-ag51-roadmap-checkpoint-handoff.json");
const noLiveDashboardAudit = readJson("data/content-intelligence/backend-architecture/ag51z-no-live-dashboard-audit.json");
const noRuntimeQueryJobAudit = readJson("data/content-intelligence/backend-architecture/ag51z-no-runtime-query-monitoring-job-audit.json");
const noAutomatedCheckingAudit = readJson("data/content-intelligence/backend-architecture/ag51z-no-automated-checking-audit.json");
const noMutationDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag51z-no-mutation-deployment-audit.json");
const noSecretExposureAudit = readJson("data/content-intelligence/backend-architecture/ag51z-no-secret-exposure-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag51z-post-ag51-roadmap-checkpoint-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag51z-to-post-ag51-roadmap-checkpoint-boundary.json");
const preview = readJson("data/quality/ag51z-analytics-monitoring-closure-preview.json");
const pkg = readJson("package.json");

if (review.status !== "analytics_monitoring_closed_ready_for_post_ag51_checkpoint") fail("AG51Z review status mismatch.");

for (const key of [
  "ag51z_analytics_monitoring_closed",
  "ag51a_ag51b_ag51c_ag51d_consumed",
  "analytics_monitoring_closure_completed",
  "post_ag51_roadmap_checkpoint_handoff_created",
  "ready_for_post_ag51_roadmap_checkpoint"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_post_ag51_checkpoint !== 0) fail("Post-AG51 checkpoint blocker count must be zero.");

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

if (closureRecord.status !== "analytics_monitoring_closure_completed") fail("Closure record status mismatch.");
if (closureRecord.closure_allowed !== true) fail("Closure must be allowed.");

for (const stage of ["AG51A", "AG51B", "AG51C", "AG51D"]) {
  if (!JSON.stringify(consumptionSummary.consumed_outputs).includes(stage)) fail(`Consumption summary missing ${stage}.`);
}

for (const item of ["live dashboard", "runtime database query", "monitoring job", "automated link checking", "exception auto-resolution", "deployment"]) {
  if (!carryForwardDeferralRegister.deferred_items.includes(item)) fail(`Carry-forward deferral missing: ${item}`);
}

if (!dashboardSurfaceClosure.blocked_without_later_approval.includes("live dashboard UI")) fail("Live dashboard UI must remain blocked.");
if (!dashboardSurfaceClosure.blocked_without_later_approval.includes("runtime database query")) fail("Runtime database query must remain blocked.");

if (postAg51Handoff.next_stage_id !== "POST_AG51_ROADMAP_CHECKPOINT") fail("Post-AG51 handoff must point to checkpoint.");

for (const audit of [noLiveDashboardAudit, noRuntimeQueryJobAudit, noAutomatedCheckingAudit, noMutationDeploymentAudit, noSecretExposureAudit]) {
  if (audit.audit_passed !== true) fail(`${audit.title} must pass.`);
}

if (noSecretExposureAudit.service_role_key_exposed !== false) fail("Service-role key must not be exposed.");

if (readiness.status !== "ready_for_post_ag51_roadmap_checkpoint") fail("Post-AG51 readiness status mismatch.");
if (readiness.ready_for_post_ag51_checkpoint !== true) fail("Post-AG51 readiness must be true.");
if (readiness.next_stage_id !== "POST_AG51_ROADMAP_CHECKPOINT") fail("Readiness must point to post-AG51 checkpoint.");

if (boundary.next_stage_id !== "POST_AG51_ROADMAP_CHECKPOINT") fail("Boundary must point to post-AG51 checkpoint.");

for (const key of [
  "ag51z_analytics_monitoring_closed",
  "ag51a_ag51b_ag51c_ag51d_consumed",
  "analytics_monitoring_closure_completed",
  "post_ag51_roadmap_checkpoint_handoff_created",
  "ready_for_post_ag51_roadmap_checkpoint"
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

if (!pkg.scripts?.["generate:ag51z"]) fail("Missing package script: generate:ag51z");
if (!pkg.scripts?.["validate:ag51z"]) fail("Missing package script: validate:ag51z");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag51z")) fail("validate:project must include validate:ag51z.");

pass("AG51Z Analytics and Monitoring Closure is present.");
pass("AG51A–AG51D outputs are consumed.");
pass("Analytics and monitoring closure record is valid.");
pass("Carry-forward deferral register is valid.");
pass("Dashboard surface closure position is valid.");
pass("Post-AG51 roadmap checkpoint handoff is valid.");
pass("No live dashboard audit is valid.");
pass("No runtime query / monitoring job audit is valid.");
pass("No automated checking audit is valid.");
pass("No mutation / deployment audit is valid.");
pass("No secret exposure audit is valid.");
pass("Post-AG51 roadmap checkpoint readiness is valid.");
