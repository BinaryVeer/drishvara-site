import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG51C validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
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
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

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
  "data/quality/ag51c-audit-error-exception-tracking-model.json",
  "data/quality/ag51c-audit-error-exception-tracking-model-preview.json",
  "docs/quality/AG51C_AUDIT_ERROR_EXCEPTION_TRACKING_MODEL.md",
  "scripts/generate-ag51c-audit-error-exception-tracking-model.mjs",
  "scripts/validate-ag51c-audit-error-exception-tracking-model.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag51bReview = readJson("data/content-intelligence/quality-reviews/ag51b-article-module-health-model.json");
const ag51bArticleHealth = readJson("data/content-intelligence/analytics-monitoring/ag51b-article-health-metric-model.json");
const ag51bModuleHealth = readJson("data/content-intelligence/analytics-monitoring/ag51b-module-health-metric-model.json");
const ag51bSurfaceStatus = readJson("data/content-intelligence/analytics-monitoring/ag51b-content-surface-status-model.json");
const ag51bReferenceImageHealth = readJson("data/content-intelligence/analytics-monitoring/ag51b-reference-image-credit-health-model.json");
const ag51bQualityGate = readJson("data/content-intelligence/analytics-monitoring/ag51b-quality-gate-health-model.json");
const ag51bHealthScoreBoundary = readJson("data/content-intelligence/analytics-monitoring/ag51b-health-score-planning-boundary.json");
const ag51bNoRuntimeHealth = readJson("data/content-intelligence/backend-architecture/ag51b-no-runtime-health-dashboard-audit.json");
const ag51bNoDatabaseQuery = readJson("data/content-intelligence/backend-architecture/ag51b-no-database-query-monitoring-job-audit.json");
const ag51bNoMutationDeployment = readJson("data/content-intelligence/backend-architecture/ag51b-no-mutation-deployment-audit.json");
const ag51bReadiness = readJson("data/content-intelligence/quality-registry/ag51b-ag51c-audit-error-exception-tracking-readiness-record.json");
const ag51bBoundary = readJson("data/content-intelligence/mutation-plans/ag51b-to-ag51c-audit-error-exception-tracking-boundary.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag51bReview.status !== "article_module_health_model_ready_for_ag51c") fail("AG51B review status mismatch.");
if (!ag51bArticleHealth.planned_health_flags_design_only.includes("broken_or_unverified_reference")) fail("AG51B broken reference flag missing.");
if (!ag51bModuleHealth.planned_modules_design_only.includes("Featured Reads")) fail("AG51B Featured Reads module missing.");
if (!JSON.stringify(ag51bSurfaceStatus.planned_surface_statuses_design_only).includes("Word/Reflection")) fail("AG51B Word/Reflection surface missing.");
if (!ag51bReferenceImageHealth.planned_reference_health_fields_design_only.includes("reference_broken_or_unreachable_flag")) fail("AG51B reference broken flag missing.");
if (!ag51bQualityGate.planned_quality_gate_states_design_only.includes("blocked_due_to_policy_or_quality")) fail("AG51B blocked quality gate state missing.");
if (!ag51bHealthScoreBoundary.planning_rules.includes("No score is computed in AG51B.")) fail("AG51B no-score boundary missing.");
if (ag51bNoRuntimeHealth.audit_passed !== true) fail("AG51B no runtime health audit must pass.");
if (ag51bNoDatabaseQuery.audit_passed !== true) fail("AG51B no database query audit must pass.");
if (ag51bNoMutationDeployment.audit_passed !== true) fail("AG51B no mutation/deployment audit must pass.");
if (ag51bReadiness.ready_for_ag51c !== true) fail("AG51B readiness must permit AG51C.");
if (ag51bBoundary.next_stage_id !== "AG51C") fail("AG51B boundary must point to AG51C.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag51c-audit-error-exception-tracking-model.json");
const exceptionTaxonomy = readJson("data/content-intelligence/analytics-monitoring/ag51c-audit-error-exception-taxonomy.json");
const brokenUrlReferenceExceptionModel = readJson("data/content-intelligence/analytics-monitoring/ag51c-broken-url-reference-exception-model.json");
const imageCreditExceptionModel = readJson("data/content-intelligence/analytics-monitoring/ag51c-image-credit-exception-model.json");
const layoutLanguageSafetyExceptionModel = readJson("data/content-intelligence/analytics-monitoring/ag51c-layout-language-safety-exception-model.json");
const moduleHealthExceptionRoutingModel = readJson("data/content-intelligence/analytics-monitoring/ag51c-module-health-exception-routing-model.json");
const rollbackManualReviewBoundary = readJson("data/content-intelligence/analytics-monitoring/ag51c-rollback-manual-review-exception-boundary.json");
const noAutomatedCheckingAudit = readJson("data/content-intelligence/backend-architecture/ag51c-no-automated-checking-external-fetch-audit.json");
const noRuntimeExceptionDashboardAudit = readJson("data/content-intelligence/backend-architecture/ag51c-no-runtime-exception-dashboard-audit.json");
const noDatabaseQueryMonitoringAudit = readJson("data/content-intelligence/backend-architecture/ag51c-no-database-query-monitoring-job-audit.json");
const noMutationDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag51c-no-mutation-deployment-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag51c-ag51d-dashboard-planning-audit-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag51c-to-ag51d-dashboard-planning-audit-boundary.json");
const preview = readJson("data/quality/ag51c-audit-error-exception-tracking-model-preview.json");
const pkg = readJson("package.json");

if (review.status !== "audit_error_exception_tracking_model_ready_for_ag51d") fail("AG51C review status mismatch.");

for (const key of [
  "ag51c_audit_error_exception_tracking_model_recorded",
  "ag51b_consumed",
  "audit_error_exception_taxonomy_recorded",
  "broken_url_reference_exception_model_recorded",
  "image_credit_exception_model_recorded",
  "layout_language_safety_exception_model_recorded",
  "module_health_exception_routing_model_recorded",
  "rollback_manual_review_exception_boundary_recorded",
  "ready_for_ag51d_dashboard_planning_audit"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag51d !== 0) fail("AG51D blocker count must be zero.");

for (const key of [
  "live_dashboard_enabled",
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

if (exceptionTaxonomy.status !== "audit_error_exception_taxonomy_recorded") fail("Exception taxonomy status mismatch.");
for (const group of ["reference_exceptions", "image_credit_exceptions", "layout_language_exceptions", "quality_safety_exceptions", "module_health_exceptions", "rollback_exception"]) {
  if (!JSON.stringify(exceptionTaxonomy.exception_groups_design_only).includes(group)) fail(`Exception group missing: ${group}`);
}
if (exceptionTaxonomy.runtime_position.exception_tracking_runtime_enabled_now !== false) fail("Exception tracking runtime must remain disabled.");

if (brokenUrlReferenceExceptionModel.status !== "broken_url_reference_exception_model_recorded") fail("Broken URL/reference model status mismatch.");
if (!brokenUrlReferenceExceptionModel.planned_exception_categories_design_only.includes("broken_or_unreachable_reference")) fail("Broken reference exception missing.");
if (brokenUrlReferenceExceptionModel.runtime_position.automated_link_checking_enabled_now !== false) fail("Automated link checking must remain disabled.");

if (imageCreditExceptionModel.status !== "image_credit_exception_model_recorded") fail("Image credit model status mismatch.");
if (!imageCreditExceptionModel.planned_exception_categories_design_only.includes("missing_image_credit")) fail("Missing image credit exception missing.");
if (imageCreditExceptionModel.runtime_position.automated_image_checking_enabled_now !== false) fail("Automated image checking must remain disabled.");

if (layoutLanguageSafetyExceptionModel.status !== "layout_language_safety_exception_model_recorded") fail("Layout/language/safety model status mismatch.");
if (!layoutLanguageSafetyExceptionModel.planned_exception_categories_design_only.includes("diagnostic_or_deterministic_language_risk")) fail("Diagnostic/deterministic language risk exception missing.");
if (layoutLanguageSafetyExceptionModel.runtime_position.automated_policy_checker_enabled_now !== false) fail("Automated policy checker must remain disabled.");

if (moduleHealthExceptionRoutingModel.status !== "module_health_exception_routing_model_recorded") fail("Module health exception routing status mismatch.");
if (!JSON.stringify(moduleHealthExceptionRoutingModel.planned_module_exception_routes_design_only).includes("Featured Reads")) fail("Featured Reads exception route missing.");
if (!JSON.stringify(moduleHealthExceptionRoutingModel.planned_module_exception_routes_design_only).includes("Panchang/Festival")) fail("Panchang/Festival exception route missing.");
if (moduleHealthExceptionRoutingModel.runtime_position.routing_job_enabled_now !== false) fail("Routing job must remain disabled.");

if (rollbackManualReviewBoundary.status !== "rollback_manual_review_exception_boundary_recorded") fail("Rollback/manual review boundary status mismatch.");
if (!rollbackManualReviewBoundary.boundary_rules.includes("No rollback is executed.")) fail("No rollback rule missing.");
if (!rollbackManualReviewBoundary.boundary_rules.includes("No GitHub issue or branch is created.")) fail("No GitHub issue/branch rule missing.");

if (noAutomatedCheckingAudit.audit_passed !== true) fail("No automated checking audit must pass.");
if (noAutomatedCheckingAudit.failed_checks.length !== 0) fail("No automated checking failed checks must be zero.");

if (noRuntimeExceptionDashboardAudit.audit_passed !== true) fail("No runtime exception dashboard audit must pass.");
if (noRuntimeExceptionDashboardAudit.failed_checks.length !== 0) fail("No runtime exception dashboard failed checks must be zero.");

if (noDatabaseQueryMonitoringAudit.audit_passed !== true) fail("No database query monitoring audit must pass.");
if (noDatabaseQueryMonitoringAudit.failed_checks.length !== 0) fail("No database query monitoring failed checks must be zero.");

if (noMutationDeploymentAudit.audit_passed !== true) fail("No mutation/deployment audit must pass.");
if (noMutationDeploymentAudit.failed_checks.length !== 0) fail("No mutation/deployment failed checks must be zero.");

if (readiness.status !== "ready_for_ag51d_dashboard_planning_audit") fail("AG51D readiness status mismatch.");
if (readiness.ready_for_ag51d !== true) fail("AG51D readiness must be true.");
if (readiness.next_stage_id !== "AG51D") fail("Readiness must point to AG51D.");
if (!readiness.ag51d_allowed_scope.includes("Audit AG51C exception tracking planning.")) fail("AG51D AG51C audit scope missing.");
if (!readiness.ag51d_blocked_scope.includes("Exception auto-resolution")) fail("AG51D must block exception auto-resolution.");

if (boundary.next_stage_id !== "AG51D") fail("Boundary must point to AG51D.");

for (const key of [
  "ag51c_audit_error_exception_tracking_model_recorded",
  "ag51b_consumed",
  "audit_error_exception_taxonomy_recorded",
  "broken_url_reference_exception_model_recorded",
  "image_credit_exception_model_recorded",
  "layout_language_safety_exception_model_recorded",
  "module_health_exception_routing_model_recorded",
  "rollback_manual_review_exception_boundary_recorded",
  "ready_for_ag51d_dashboard_planning_audit"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "live_dashboard_enabled",
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

if (!pkg.scripts?.["generate:ag51c"]) fail("Missing package script: generate:ag51c");
if (!pkg.scripts?.["validate:ag51c"]) fail("Missing package script: validate:ag51c");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag51c")) fail("validate:project must include validate:ag51c.");

pass("AG51C Audit / Error / Exception Tracking Model is present.");
pass("AG51B inputs are consumed.");
pass("Audit/error/exception taxonomy is valid.");
pass("Broken URL and reference exception model is valid.");
pass("Image-credit exception model is valid.");
pass("Layout/language/safety exception model is valid.");
pass("Module health exception routing model is valid.");
pass("Rollback/manual review exception boundary is valid.");
pass("No automated checking / external fetch audit is valid.");
pass("No runtime exception dashboard audit is valid.");
pass("No database query / monitoring job audit is valid.");
pass("No mutation / deployment audit is valid.");
pass("AG51D dashboard planning audit readiness is valid.");
