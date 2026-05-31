import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG51B validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag51a-editorial-monitoring-model.json",
  "data/content-intelligence/analytics-monitoring/ag51a-source-consumption-record.json",
  "data/content-intelligence/analytics-monitoring/ag51a-editorial-dashboard-panel-model.json",
  "data/content-intelligence/analytics-monitoring/ag51a-review-queue-monitoring-model.json",
  "data/content-intelligence/analytics-monitoring/ag51a-assignment-return-cycle-monitoring-model.json",
  "data/content-intelligence/analytics-monitoring/ag51a-reference-image-credit-monitoring-model.json",
  "data/content-intelligence/analytics-monitoring/ag51a-no-runtime-dashboard-boundary.json",
  "data/content-intelligence/backend-architecture/ag51a-no-runtime-dashboard-audit.json",
  "data/content-intelligence/backend-architecture/ag51a-no-database-query-monitoring-job-audit.json",
  "data/content-intelligence/backend-architecture/ag51a-no-mutation-deployment-audit.json",
  "data/content-intelligence/quality-registry/ag51a-ag51b-article-module-health-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag51a-to-ag51b-article-module-health-boundary.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

  "data/content-intelligence/quality-reviews/ag51b-article-module-health-model.json",
  "data/content-intelligence/analytics-monitoring/ag51b-article-health-metric-model.json",
  "data/content-intelligence/analytics-monitoring/ag51b-module-health-metric-model.json",
  "data/content-intelligence/analytics-monitoring/ag51b-content-surface-status-model.json",
  "data/content-intelligence/analytics-monitoring/ag51b-reference-image-credit-health-model.json",
  "data/content-intelligence/analytics-monitoring/ag51b-quality-gate-health-model.json",
  "data/content-intelligence/analytics-monitoring/ag51b-health-score-planning-boundary.json",
  "data/content-intelligence/backend-architecture/ag51b-no-runtime-health-dashboard-audit.json",
  "data/content-intelligence/backend-architecture/ag51b-no-database-query-monitoring-job-audit.json",
  "data/content-intelligence/backend-architecture/ag51b-no-mutation-deployment-audit.json",
  "data/content-intelligence/quality-registry/ag51b-ag51c-audit-error-exception-tracking-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag51b-to-ag51c-audit-error-exception-tracking-boundary.json",
  "data/quality/ag51b-article-module-health-model.json",
  "data/quality/ag51b-article-module-health-model-preview.json",
  "docs/quality/AG51B_ARTICLE_MODULE_HEALTH_MODEL.md",
  "scripts/generate-ag51b-article-module-health-model.mjs",
  "scripts/validate-ag51b-article-module-health-model.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag51aReview = readJson("data/content-intelligence/quality-reviews/ag51a-editorial-monitoring-model.json");
const ag51aPanelModel = readJson("data/content-intelligence/analytics-monitoring/ag51a-editorial-dashboard-panel-model.json");
const ag51aReviewQueue = readJson("data/content-intelligence/analytics-monitoring/ag51a-review-queue-monitoring-model.json");
const ag51aReferenceImageCredit = readJson("data/content-intelligence/analytics-monitoring/ag51a-reference-image-credit-monitoring-model.json");
const ag51aNoRuntimeDashboard = readJson("data/content-intelligence/backend-architecture/ag51a-no-runtime-dashboard-audit.json");
const ag51aNoDatabaseQuery = readJson("data/content-intelligence/backend-architecture/ag51a-no-database-query-monitoring-job-audit.json");
const ag51aNoMutationDeployment = readJson("data/content-intelligence/backend-architecture/ag51a-no-mutation-deployment-audit.json");
const ag51aReadiness = readJson("data/content-intelligence/quality-registry/ag51a-ag51b-article-module-health-readiness-record.json");
const ag51aBoundary = readJson("data/content-intelligence/mutation-plans/ag51a-to-ag51b-article-module-health-boundary.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag51aReview.status !== "editorial_monitoring_model_ready_for_ag51b") fail("AG51A review status mismatch.");
if (!ag51aPanelModel.planned_panels_design_only.includes("module_health_status")) fail("AG51A module health panel missing.");
if (!ag51aReviewQueue.future_queue_states_design_only.includes("quality_audit_pending")) fail("AG51A quality audit queue state missing.");
if (!ag51aReferenceImageCredit.future_monitoring_fields_design_only.includes("image_credit_status")) fail("AG51A image credit field missing.");
if (ag51aNoRuntimeDashboard.audit_passed !== true) fail("AG51A no runtime dashboard audit must pass.");
if (ag51aNoDatabaseQuery.audit_passed !== true) fail("AG51A no database query audit must pass.");
if (ag51aNoMutationDeployment.audit_passed !== true) fail("AG51A no mutation/deployment audit must pass.");
if (ag51aReadiness.ready_for_ag51b !== true) fail("AG51A readiness must permit AG51B.");
if (ag51aBoundary.next_stage_id !== "AG51B") fail("AG51A boundary must point to AG51B.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag51b-article-module-health-model.json");
const articleHealthMetricModel = readJson("data/content-intelligence/analytics-monitoring/ag51b-article-health-metric-model.json");
const moduleHealthMetricModel = readJson("data/content-intelligence/analytics-monitoring/ag51b-module-health-metric-model.json");
const contentSurfaceStatusModel = readJson("data/content-intelligence/analytics-monitoring/ag51b-content-surface-status-model.json");
const referenceImageCreditHealthModel = readJson("data/content-intelligence/analytics-monitoring/ag51b-reference-image-credit-health-model.json");
const qualityGateHealthModel = readJson("data/content-intelligence/analytics-monitoring/ag51b-quality-gate-health-model.json");
const healthScoreBoundary = readJson("data/content-intelligence/analytics-monitoring/ag51b-health-score-planning-boundary.json");
const noRuntimeHealthAudit = readJson("data/content-intelligence/backend-architecture/ag51b-no-runtime-health-dashboard-audit.json");
const noDatabaseQueryAudit = readJson("data/content-intelligence/backend-architecture/ag51b-no-database-query-monitoring-job-audit.json");
const noMutationDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag51b-no-mutation-deployment-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag51b-ag51c-audit-error-exception-tracking-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag51b-to-ag51c-audit-error-exception-tracking-boundary.json");
const preview = readJson("data/quality/ag51b-article-module-health-model-preview.json");
const pkg = readJson("package.json");

if (review.status !== "article_module_health_model_ready_for_ag51c") fail("AG51B review status mismatch.");

for (const key of [
  "ag51b_article_module_health_model_recorded",
  "ag51a_consumed",
  "article_health_metric_model_recorded",
  "module_health_metric_model_recorded",
  "content_surface_status_model_recorded",
  "reference_image_credit_health_model_recorded",
  "quality_gate_health_model_recorded",
  "health_score_planning_boundary_recorded",
  "ready_for_ag51c_audit_error_exception_tracking_model"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag51c !== 0) fail("AG51C blocker count must be zero.");

for (const key of [
  "live_dashboard_enabled",
  "dashboard_runtime_enabled",
  "analytics_runtime_enabled",
  "article_health_runtime_enabled",
  "module_health_runtime_enabled",
  "health_score_runtime_enabled",
  "runtime_database_query_enabled",
  "monitoring_job_enabled",
  "scheduled_monitoring_job_enabled",
  "external_fetch_or_api_enabled",
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

if (articleHealthMetricModel.status !== "article_health_metric_model_recorded") fail("Article health model status mismatch.");
for (const dimension of ["reference_verification_status", "image_credit_status", "article_quality_audit_status", "category_listing_status"]) {
  if (!articleHealthMetricModel.planned_article_health_dimensions_design_only.includes(dimension)) fail(`Article health dimension missing: ${dimension}`);
}
if (articleHealthMetricModel.runtime_position.live_article_health_runtime_enabled_now !== false) fail("Article health runtime must remain disabled.");

if (moduleHealthMetricModel.status !== "module_health_metric_model_recorded") fail("Module health model status mismatch.");
for (const moduleName of ["First Light", "Episodes", "Featured Reads", "Panchang", "Word of the Day", "Reflection"]) {
  if (!moduleHealthMetricModel.planned_modules_design_only.includes(moduleName)) fail(`Module missing: ${moduleName}`);
}
if (moduleHealthMetricModel.runtime_position.live_module_health_runtime_enabled_now !== false) fail("Module health runtime must remain disabled.");

if (contentSurfaceStatusModel.status !== "content_surface_status_model_recorded") fail("Content surface status model status mismatch.");
if (!JSON.stringify(contentSurfaceStatusModel.planned_surface_statuses_design_only).includes("Panchang/Festival")) fail("Panchang/Festival surface missing.");
if (!JSON.stringify(contentSurfaceStatusModel.planned_surface_statuses_design_only).includes("Word/Reflection")) fail("Word/Reflection surface missing.");
if (contentSurfaceStatusModel.runtime_position.surface_runtime_query_enabled_now !== false) fail("Surface runtime query must remain disabled.");

if (referenceImageCreditHealthModel.status !== "reference_image_credit_health_model_recorded") fail("Reference/image-credit health status mismatch.");
if (!referenceImageCreditHealthModel.planned_reference_health_fields_design_only.includes("reference_verification_status")) fail("Reference verification field missing.");
if (!referenceImageCreditHealthModel.planned_image_credit_health_fields_design_only.includes("image_credit_presence")) fail("Image credit presence field missing.");
if (referenceImageCreditHealthModel.runtime_position.external_fetch_or_api_enabled_now !== false) fail("External fetch/API must remain disabled.");

if (qualityGateHealthModel.status !== "quality_gate_health_model_recorded") fail("Quality gate health model status mismatch.");
if (!qualityGateHealthModel.planned_quality_gate_states_design_only.includes("blocked_due_to_policy_or_quality")) fail("Blocked quality gate state missing.");
if (qualityGateHealthModel.runtime_position.queue_mutation_enabled_now !== false) fail("Queue mutation must remain disabled.");

if (healthScoreBoundary.status !== "health_score_planning_boundary_recorded") fail("Health score boundary status mismatch.");
if (!healthScoreBoundary.planning_rules.includes("No score is computed in AG51B.")) fail("No score computed rule missing.");
if (!healthScoreBoundary.prohibited_runtime_actions.includes("compute_article_health_score")) fail("Compute article health score must be prohibited.");
if (!healthScoreBoundary.prohibited_runtime_actions.includes("query_database_for_health_status")) fail("DB health query must be prohibited.");

if (noRuntimeHealthAudit.audit_passed !== true) fail("No runtime health audit must pass.");
if (noRuntimeHealthAudit.failed_checks.length !== 0) fail("No runtime health failed checks must be zero.");

if (noDatabaseQueryAudit.audit_passed !== true) fail("No database query audit must pass.");
if (noDatabaseQueryAudit.failed_checks.length !== 0) fail("No database query failed checks must be zero.");

if (noMutationDeploymentAudit.audit_passed !== true) fail("No mutation/deployment audit must pass.");
if (noMutationDeploymentAudit.failed_checks.length !== 0) fail("No mutation/deployment failed checks must be zero.");

if (readiness.status !== "ready_for_ag51c_audit_error_exception_tracking_model") fail("AG51C readiness status mismatch.");
if (readiness.ready_for_ag51c !== true) fail("AG51C readiness must be true.");
if (readiness.next_stage_id !== "AG51C") fail("Readiness must point to AG51C.");
if (!readiness.ag51c_allowed_scope.includes("Define broken URL exception categories.")) fail("AG51C broken URL scope missing.");
if (!readiness.ag51c_blocked_scope.includes("Automated link checking")) fail("AG51C must block automated link checking.");

if (boundary.next_stage_id !== "AG51C") fail("Boundary must point to AG51C.");

for (const key of [
  "ag51b_article_module_health_model_recorded",
  "ag51a_consumed",
  "article_health_metric_model_recorded",
  "module_health_metric_model_recorded",
  "content_surface_status_model_recorded",
  "reference_image_credit_health_model_recorded",
  "quality_gate_health_model_recorded",
  "health_score_planning_boundary_recorded",
  "ready_for_ag51c_audit_error_exception_tracking_model"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "live_dashboard_enabled",
  "dashboard_runtime_enabled",
  "analytics_runtime_enabled",
  "article_health_runtime_enabled",
  "module_health_runtime_enabled",
  "health_score_runtime_enabled",
  "runtime_database_query_enabled",
  "monitoring_job_enabled",
  "scheduled_monitoring_job_enabled",
  "external_fetch_or_api_enabled",
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

if (!pkg.scripts?.["generate:ag51b"]) fail("Missing package script: generate:ag51b");
if (!pkg.scripts?.["validate:ag51b"]) fail("Missing package script: validate:ag51b");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag51b")) fail("validate:project must include validate:ag51b.");

pass("AG51B Article and Module Health Model is present.");
pass("AG51A inputs are consumed.");
pass("Article health metric model is valid.");
pass("Module health metric model is valid.");
pass("Content surface status model is valid.");
pass("Reference and image-credit health model is valid.");
pass("Quality gate health model is valid.");
pass("Health score planning boundary is valid.");
pass("No runtime health dashboard audit is valid.");
pass("No database query / monitoring job audit is valid.");
pass("No mutation / deployment audit is valid.");
pass("AG51C audit/error/exception tracking readiness is valid.");
