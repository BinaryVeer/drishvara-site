import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function fail(message) {
  console.error(`❌ AG51A validation failed: ${message}`);
  process.exit(1);
}
function pass(message) { console.log(`✅ ${message}`); }

const required = [
  "data/content-intelligence/quality-reviews/ag50z-assessment-psychometric-product-layer-closure.json",
  "data/content-intelligence/ag-roadmap/ag50z-post-ag50-roadmap-checkpoint-handoff.json",
  "data/content-intelligence/quality-registry/ag50z-post-ag50-roadmap-checkpoint-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag50z-to-post-ag50-roadmap-checkpoint-boundary.json",
  "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",

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
  "data/quality/ag51a-editorial-monitoring-model.json",
  "data/quality/ag51a-editorial-monitoring-model-preview.json",
  "docs/quality/AG51A_EDITORIAL_MONITORING_MODEL.md",
  "scripts/generate-ag51a-editorial-monitoring-model.mjs",
  "scripts/validate-ag51a-editorial-monitoring-model.mjs",
  "package.json"
];

for (const file of required) {
  if (!exists(file)) fail(`Missing file: ${file}`);
}

const ag50zReview = readJson("data/content-intelligence/quality-reviews/ag50z-assessment-psychometric-product-layer-closure.json");
const ag50zHandoff = readJson("data/content-intelligence/ag-roadmap/ag50z-post-ag50-roadmap-checkpoint-handoff.json");
const ag50zReadiness = readJson("data/content-intelligence/quality-registry/ag50z-post-ag50-roadmap-checkpoint-readiness-record.json");
const ag50zBoundary = readJson("data/content-intelligence/mutation-plans/ag50z-to-post-ag50-roadmap-checkpoint-boundary.json");
const adb20Api = readJson("data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json");

if (ag50zReview.status !== "assessment_psychometric_product_layer_closed_ready_for_post_ag50_checkpoint") fail("AG50Z review status mismatch.");
if (ag50zHandoff.next_stage_id !== "POST_AG50_ROADMAP_CHECKPOINT") fail("AG50Z handoff must point to checkpoint.");
if (ag50zReadiness.ready_for_post_ag50_checkpoint !== true) fail("Post-AG50 readiness must be true.");
if (ag50zBoundary.next_stage_id !== "POST_AG50_ROADMAP_CHECKPOINT") fail("Post-AG50 boundary mismatch.");
if (adb20Api.website_database_reading_enabled !== false) fail("Website DB reading must remain disabled.");

const review = readJson("data/content-intelligence/quality-reviews/ag51a-editorial-monitoring-model.json");
const consumptionRecord = readJson("data/content-intelligence/analytics-monitoring/ag51a-source-consumption-record.json");
const panelModel = readJson("data/content-intelligence/analytics-monitoring/ag51a-editorial-dashboard-panel-model.json");
const reviewQueueModel = readJson("data/content-intelligence/analytics-monitoring/ag51a-review-queue-monitoring-model.json");
const assignmentReturnModel = readJson("data/content-intelligence/analytics-monitoring/ag51a-assignment-return-cycle-monitoring-model.json");
const referenceImageCreditModel = readJson("data/content-intelligence/analytics-monitoring/ag51a-reference-image-credit-monitoring-model.json");
const noRuntimeBoundary = readJson("data/content-intelligence/analytics-monitoring/ag51a-no-runtime-dashboard-boundary.json");
const noRuntimeDashboardAudit = readJson("data/content-intelligence/backend-architecture/ag51a-no-runtime-dashboard-audit.json");
const noDatabaseQueryAudit = readJson("data/content-intelligence/backend-architecture/ag51a-no-database-query-monitoring-job-audit.json");
const noMutationDeploymentAudit = readJson("data/content-intelligence/backend-architecture/ag51a-no-mutation-deployment-audit.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag51a-ag51b-article-module-health-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag51a-to-ag51b-article-module-health-boundary.json");
const preview = readJson("data/quality/ag51a-editorial-monitoring-model-preview.json");
const pkg = readJson("package.json");

if (review.status !== "editorial_monitoring_model_ready_for_ag51b") fail("AG51A review status mismatch.");

for (const key of [
  "ag51a_editorial_monitoring_model_recorded",
  "ag50z_consumed",
  "editorial_dashboard_panel_model_recorded",
  "review_queue_monitoring_model_recorded",
  "assignment_return_cycle_monitoring_model_recorded",
  "reference_image_credit_monitoring_model_recorded",
  "no_runtime_dashboard_boundary_recorded",
  "ready_for_ag51b_article_module_health_model"
]) {
  if (review.summary[key] !== true) fail(`${key} summary missing.`);
}

if (review.summary.hard_blocker_count_for_ag51b !== 0) fail("AG51B blocker count must be zero.");

for (const key of [
  "live_dashboard_enabled",
  "dashboard_runtime_enabled",
  "analytics_runtime_enabled",
  "runtime_database_query_enabled",
  "monitoring_job_enabled",
  "scheduled_monitoring_job_enabled",
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

if (consumptionRecord.status !== "source_consumption_recorded") fail("Consumption record status mismatch.");
if (!consumptionRecord.consumed_required_sources.includes("data/content-intelligence/quality-reviews/ag50z-assessment-psychometric-product-layer-closure.json")) fail("AG50Z review must be consumed.");

if (panelModel.status !== "editorial_dashboard_panel_model_recorded") fail("Panel model status mismatch.");
for (const panel of ["review_queue", "assigned_items", "returned_items", "pending_references", "pending_image_credits", "audit_status", "module_health_status"]) {
  if (!panelModel.planned_panels_design_only.includes(panel)) fail(`Panel missing: ${panel}`);
}
if (panelModel.panel_position.live_dashboard_enabled_now !== false) fail("Live dashboard must remain disabled.");
if (panelModel.panel_position.design_only_panel_model !== true) fail("Panel model must be design-only.");

if (reviewQueueModel.status !== "review_queue_monitoring_model_recorded") fail("Review queue model status mismatch.");
if (!reviewQueueModel.future_queue_states_design_only.includes("returned_for_correction")) fail("Returned-for-correction state missing.");
if (reviewQueueModel.monitoring_position.queue_mutation_enabled_now !== false) fail("Queue mutation must remain disabled.");

if (assignmentReturnModel.status !== "assignment_return_cycle_monitoring_model_recorded") fail("Assignment return model status mismatch.");
if (!assignmentReturnModel.future_tracking_dimensions_design_only.includes("return_reason_category")) fail("Return reason category missing.");
if (assignmentReturnModel.monitoring_position.github_write_or_issue_creation_enabled_now !== false) fail("GitHub write must remain disabled.");

if (referenceImageCreditModel.status !== "reference_image_credit_monitoring_model_recorded") fail("Reference/image-credit model status mismatch.");
if (!referenceImageCreditModel.future_monitoring_fields_design_only.includes("image_credit_status")) fail("Image credit status field missing.");
if (referenceImageCreditModel.monitoring_position.external_fetch_or_api_enabled_now !== false) fail("External fetch/API must remain disabled.");

if (noRuntimeBoundary.status !== "no_runtime_dashboard_boundary_recorded") fail("No runtime boundary status mismatch.");
if (!noRuntimeBoundary.boundary_rules.includes("No database query is executed.")) fail("No DB query boundary rule missing.");

if (noRuntimeDashboardAudit.audit_passed !== true) fail("No runtime dashboard audit must pass.");
if (noRuntimeDashboardAudit.failed_checks.length !== 0) fail("No runtime dashboard failed checks must be zero.");

if (noDatabaseQueryAudit.audit_passed !== true) fail("No database query audit must pass.");
if (noDatabaseQueryAudit.failed_checks.length !== 0) fail("No database query failed checks must be zero.");

if (noMutationDeploymentAudit.audit_passed !== true) fail("No mutation/deployment audit must pass.");
if (noMutationDeploymentAudit.failed_checks.length !== 0) fail("No mutation/deployment failed checks must be zero.");

if (readiness.status !== "ready_for_ag51b_article_module_health_model") fail("AG51B readiness status mismatch.");
if (readiness.ready_for_ag51b !== true) fail("AG51B readiness must be true.");
if (readiness.next_stage_id !== "AG51B") fail("Readiness must point to AG51B.");
if (!readiness.ag51b_allowed_scope.includes("Define article health metrics as planning records.")) fail("AG51B article-health scope missing.");
if (!readiness.ag51b_blocked_scope.includes("Runtime database query")) fail("AG51B must block runtime database query.");

if (boundary.next_stage_id !== "AG51B") fail("Boundary must point to AG51B.");

for (const key of [
  "ag51a_editorial_monitoring_model_recorded",
  "ag50z_consumed",
  "editorial_dashboard_panel_model_recorded",
  "review_queue_monitoring_model_recorded",
  "assignment_return_cycle_monitoring_model_recorded",
  "reference_image_credit_monitoring_model_recorded",
  "no_runtime_dashboard_boundary_recorded",
  "ready_for_ag51b_article_module_health_model"
]) {
  if (preview[key] !== 1) fail(`Preview ${key} must be 1.`);
}

for (const key of [
  "live_dashboard_enabled",
  "dashboard_runtime_enabled",
  "analytics_runtime_enabled",
  "runtime_database_query_enabled",
  "monitoring_job_enabled",
  "scheduled_monitoring_job_enabled",
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

if (!pkg.scripts?.["generate:ag51a"]) fail("Missing package script: generate:ag51a");
if (!pkg.scripts?.["validate:ag51a"]) fail("Missing package script: validate:ag51a");
if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag51a")) fail("validate:project must include validate:ag51a.");

pass("AG51A Editorial Monitoring Model is present.");
pass("AG50Z post-roadmap checkpoint is consumed.");
pass("Editorial dashboard panel model is valid.");
pass("Review queue monitoring model is valid.");
pass("Assignment and return-cycle monitoring model is valid.");
pass("Reference and image-credit monitoring model is valid.");
pass("No runtime dashboard boundary is valid.");
pass("No runtime dashboard audit is valid.");
pass("No database query / monitoring job audit is valid.");
pass("No mutation / deployment audit is valid.");
pass("AG51B article and module health readiness is valid.");
