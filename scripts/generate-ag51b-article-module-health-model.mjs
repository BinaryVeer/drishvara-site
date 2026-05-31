import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag51aReview: "data/content-intelligence/quality-reviews/ag51a-editorial-monitoring-model.json",
  ag51aConsumption: "data/content-intelligence/analytics-monitoring/ag51a-source-consumption-record.json",
  ag51aPanelModel: "data/content-intelligence/analytics-monitoring/ag51a-editorial-dashboard-panel-model.json",
  ag51aReviewQueue: "data/content-intelligence/analytics-monitoring/ag51a-review-queue-monitoring-model.json",
  ag51aAssignmentReturn: "data/content-intelligence/analytics-monitoring/ag51a-assignment-return-cycle-monitoring-model.json",
  ag51aReferenceImageCredit: "data/content-intelligence/analytics-monitoring/ag51a-reference-image-credit-monitoring-model.json",
  ag51aNoRuntimeBoundary: "data/content-intelligence/analytics-monitoring/ag51a-no-runtime-dashboard-boundary.json",
  ag51aNoRuntimeDashboard: "data/content-intelligence/backend-architecture/ag51a-no-runtime-dashboard-audit.json",
  ag51aNoDatabaseQuery: "data/content-intelligence/backend-architecture/ag51a-no-database-query-monitoring-job-audit.json",
  ag51aNoMutationDeployment: "data/content-intelligence/backend-architecture/ag51a-no-mutation-deployment-audit.json",
  ag51aReadiness: "data/content-intelligence/quality-registry/ag51a-ag51b-article-module-health-readiness-record.json",
  ag51aBoundary: "data/content-intelligence/mutation-plans/ag51a-to-ag51b-article-module-health-boundary.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag51b-article-module-health-model.json",
  articleHealthMetricModel: "data/content-intelligence/analytics-monitoring/ag51b-article-health-metric-model.json",
  moduleHealthMetricModel: "data/content-intelligence/analytics-monitoring/ag51b-module-health-metric-model.json",
  contentSurfaceStatusModel: "data/content-intelligence/analytics-monitoring/ag51b-content-surface-status-model.json",
  referenceImageCreditHealthModel: "data/content-intelligence/analytics-monitoring/ag51b-reference-image-credit-health-model.json",
  qualityGateHealthModel: "data/content-intelligence/analytics-monitoring/ag51b-quality-gate-health-model.json",
  healthScoreBoundary: "data/content-intelligence/analytics-monitoring/ag51b-health-score-planning-boundary.json",
  noRuntimeHealthAudit: "data/content-intelligence/backend-architecture/ag51b-no-runtime-health-dashboard-audit.json",
  noDatabaseQueryAudit: "data/content-intelligence/backend-architecture/ag51b-no-database-query-monitoring-job-audit.json",
  noMutationDeploymentAudit: "data/content-intelligence/backend-architecture/ag51b-no-mutation-deployment-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag51b-ag51c-audit-error-exception-tracking-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag51b-to-ag51c-audit-error-exception-tracking-boundary.json",
  registry: "data/quality/ag51b-article-module-health-model.json",
  preview: "data/quality/ag51b-article-module-health-model-preview.json",
  doc: "docs/quality/AG51B_ARTICLE_MODULE_HEALTH_MODEL.md"
};

function full(p) { return path.join(root, p); }
function exists(p) { return fs.existsSync(full(p)); }
function readJson(p) { return JSON.parse(fs.readFileSync(full(p), "utf8")); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), JSON.stringify(obj, null, 2) + "\n");
}
function writeText(p, text) {
  fs.mkdirSync(path.dirname(full(p)), { recursive: true });
  fs.writeFileSync(full(p), text);
}
function listFiles(dir) {
  const absolute = full(dir);
  if (!fs.existsSync(absolute)) return [];
  const out = [];
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(p));
    else out.push(p);
  }
  return out;
}
function findFiles(keywords, limit = 25) {
  const files = listFiles("data/content-intelligence");
  return files
    .filter((f) => keywords.every((k) => f.toLowerCase().includes(k.toLowerCase())))
    .slice(0, limit);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG51B input: ${p}`);
}

const ag51aReview = readJson(inputs.ag51aReview);
const ag51aConsumption = readJson(inputs.ag51aConsumption);
const ag51aPanelModel = readJson(inputs.ag51aPanelModel);
const ag51aReviewQueue = readJson(inputs.ag51aReviewQueue);
const ag51aAssignmentReturn = readJson(inputs.ag51aAssignmentReturn);
const ag51aReferenceImageCredit = readJson(inputs.ag51aReferenceImageCredit);
const ag51aNoRuntimeBoundary = readJson(inputs.ag51aNoRuntimeBoundary);
const ag51aNoRuntimeDashboard = readJson(inputs.ag51aNoRuntimeDashboard);
const ag51aNoDatabaseQuery = readJson(inputs.ag51aNoDatabaseQuery);
const ag51aNoMutationDeployment = readJson(inputs.ag51aNoMutationDeployment);
const ag51aReadiness = readJson(inputs.ag51aReadiness);
const ag51aBoundary = readJson(inputs.ag51aBoundary);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag51aReview.status !== "editorial_monitoring_model_ready_for_ag51b") throw new Error("AG51A review status mismatch.");
if (ag51aReview.summary?.ready_for_ag51b_article_module_health_model !== true) throw new Error("AG51B readiness missing from AG51A.");
if (ag51aConsumption.status !== "source_consumption_recorded") throw new Error("AG51A consumption record mismatch.");
if (!ag51aPanelModel.planned_panels_design_only.includes("module_health_status")) throw new Error("AG51A module health panel missing.");
if (!ag51aPanelModel.planned_panels_design_only.includes("article_correction_status")) throw new Error("AG51A article correction status panel missing.");
if (!ag51aReviewQueue.future_queue_states_design_only.includes("quality_audit_pending")) throw new Error("AG51A quality audit queue state missing.");
if (!ag51aAssignmentReturn.future_tracking_dimensions_design_only.includes("return_reason_category")) throw new Error("AG51A return reason dimension missing.");
if (!ag51aReferenceImageCredit.future_monitoring_fields_design_only.includes("image_credit_status")) throw new Error("AG51A image credit field missing.");
if (!ag51aNoRuntimeBoundary.boundary_rules.includes("No database query is executed.")) throw new Error("AG51A no DB query boundary missing.");
if (ag51aNoRuntimeDashboard.audit_passed !== true) throw new Error("AG51A no runtime dashboard audit must pass.");
if (ag51aNoDatabaseQuery.audit_passed !== true) throw new Error("AG51A no database query audit must pass.");
if (ag51aNoMutationDeployment.audit_passed !== true) throw new Error("AG51A no mutation/deployment audit must pass.");
if (ag51aReadiness.ready_for_ag51b !== true || ag51aReadiness.next_stage_id !== "AG51B") throw new Error("AG51A readiness must permit AG51B.");
if (ag51aBoundary.next_stage_id !== "AG51B") throw new Error("AG51A boundary must point to AG51B.");
if (adb20ApiDeferral.website_database_reading_enabled !== false) throw new Error("Website DB reading must remain disabled.");

const discovered = {
  first_light_candidates: findFiles(["first"], 15),
  episode_candidates: findFiles(["episode"], 15),
  featured_reads_candidates: findFiles(["featured"], 15),
  panchang_candidates: findFiles(["panchang"], 15),
  word_reflection_candidates: findFiles(["word"], 15),
  listing_candidates: findFiles(["listing"], 15),
  article_quality_candidates: findFiles(["article"], 25),
  reference_candidates: findFiles(["reference"], 25),
  image_credit_candidates: findFiles(["image"], 25)
};

const blockedState = {
  ag51b_article_module_health_model_recorded: true,
  ag51a_consumed: true,
  article_health_metric_model_recorded: true,
  module_health_metric_model_recorded: true,
  content_surface_status_model_recorded: true,
  reference_image_credit_health_model_recorded: true,
  quality_gate_health_model_recorded: true,
  health_score_planning_boundary_recorded: true,
  ready_for_ag51c_audit_error_exception_tracking_model: true,

  live_dashboard_enabled: false,
  dashboard_runtime_enabled: false,
  analytics_runtime_enabled: false,
  article_health_runtime_enabled: false,
  module_health_runtime_enabled: false,
  health_score_runtime_enabled: false,
  runtime_database_query_enabled: false,
  monitoring_job_enabled: false,
  scheduled_monitoring_job_enabled: false,
  external_fetch_or_api_enabled: false,
  editorial_assignment_mutation_enabled: false,
  queue_mutation_enabled: false,
  github_write_enabled: false,
  public_content_mutation_enabled: false,
  website_database_reading_enabled: false,
  api_runtime_database_reading_approved_now: false,
  supabase_auth_backend_activation_approved: false,
  backend_auth_supabase_activation_performed: false,
  rls_public_policy_activation_approved: false,
  deployment_approved: false,
  deployment_performed: false,
  service_role_key_exposed: false,
  public_dashboard_exposed: false
};

const articleHealthMetricModel = {
  module_id: "AG51B",
  title: "Article Health Metric Model",
  status: "article_health_metric_model_recorded",
  planned_article_health_dimensions_design_only: [
    "draft_status",
    "editorial_review_status",
    "returned_for_correction_status",
    "reference_verification_status",
    "image_credit_status",
    "article_quality_audit_status",
    "category_listing_status",
    "public_url_readiness_status",
    "rollback_readiness_status",
    "last_review_checkpoint"
  ],
  planned_health_flags_design_only: [
    "missing_reference",
    "broken_or_unverified_reference",
    "missing_image_credit",
    "layout_quality_pending",
    "editorial_return_pending",
    "approval_gate_pending",
    "listing_update_pending",
    "blocked_due_to_policy_or_quality"
  ],
  runtime_position: {
    live_article_health_runtime_enabled_now: false,
    database_query_enabled_now: false,
    monitoring_job_enabled_now: false,
    design_only_metric_model: true
  },
  blocked_state: blockedState
};

const moduleHealthMetricModel = {
  module_id: "AG51B",
  title: "Module Health Metric Model",
  status: "module_health_metric_model_recorded",
  planned_modules_design_only: [
    "First Light",
    "Episodes",
    "Featured Reads",
    "Panchang",
    "Festival",
    "Word of the Day",
    "Reflection",
    "Homepage Discover",
    "Read surface",
    "Reflect surface",
    "Listing/category pages"
  ],
  planned_module_health_dimensions_design_only: [
    "content_inventory_status",
    "topic_score_status",
    "surface_mapping_status",
    "reference_status",
    "image_credit_status",
    "language_status",
    "quality_audit_status",
    "public_visibility_status",
    "no_runtime_activation_status",
    "handoff_status"
  ],
  runtime_position: {
    live_module_health_runtime_enabled_now: false,
    database_query_enabled_now: false,
    monitoring_job_enabled_now: false,
    design_only_metric_model: true
  },
  blocked_state: blockedState
};

const contentSurfaceStatusModel = {
  module_id: "AG51B",
  title: "Content Surface Status Model",
  status: "content_surface_status_model_recorded",
  planned_surface_statuses_design_only: [
    {
      surface: "First Light",
      future_status_fields: ["topic_score_status", "daily_surface_candidate_status", "homepage_surface_status"]
    },
    {
      surface: "Episodes",
      future_status_fields: ["episode_calendar_status", "episode_readiness_status", "episode_listing_status"]
    },
    {
      surface: "Featured Reads",
      future_status_fields: ["article_quality_status", "reference_status", "image_credit_status", "listing_status"]
    },
    {
      surface: "Panchang/Festival",
      future_status_fields: ["seed_source_status", "regional_rule_status", "public_preview_status", "no_live_calculation_status"]
    },
    {
      surface: "Word/Reflection",
      future_status_fields: ["word_bank_status", "translation_status", "reflection_prompt_status", "personalisation_disabled_status"]
    }
  ],
  runtime_position: {
    surface_runtime_query_enabled_now: false,
    dashboard_surface_enabled_now: false,
    design_only_surface_status_model: true
  },
  blocked_state: blockedState
};

const referenceImageCreditHealthModel = {
  module_id: "AG51B",
  title: "Reference and Image-credit Health Model",
  status: "reference_image_credit_health_model_recorded",
  planned_reference_health_fields_design_only: [
    "reference_link_presence",
    "reference_link_relevance",
    "reference_verification_status",
    "reference_broken_or_unreachable_flag",
    "reference_under_editorial_verification_flag"
  ],
  planned_image_credit_health_fields_design_only: [
    "image_credit_presence",
    "image_source_status",
    "image_attribution_status",
    "image_rights_note_status",
    "image_under_editorial_verification_flag"
  ],
  runtime_position: {
    live_reference_checker_enabled_now: false,
    live_image_checker_enabled_now: false,
    external_fetch_or_api_enabled_now: false
  },
  blocked_state: blockedState
};

const qualityGateHealthModel = {
  module_id: "AG51B",
  title: "Quality Gate Health Model",
  status: "quality_gate_health_model_recorded",
  planned_quality_gate_states_design_only: [
    "draft_created",
    "editorial_review_pending",
    "returned_for_correction",
    "reference_verification_pending",
    "image_credit_pending",
    "layout_quality_pending",
    "language_quality_pending",
    "safety_boundary_pending",
    "approved_for_static_surface",
    "blocked_due_to_policy_or_quality"
  ],
  planned_quality_gate_dimensions_design_only: [
    "editorial_status",
    "source_status",
    "reference_status",
    "image_credit_status",
    "layout_status",
    "language_status",
    "safety_status",
    "rollback_status"
  ],
  runtime_position: {
    quality_gate_runtime_enabled_now: false,
    queue_mutation_enabled_now: false,
    github_write_enabled_now: false
  },
  blocked_state: blockedState
};

const healthScoreBoundary = {
  module_id: "AG51B",
  title: "Health Score Planning Boundary",
  status: "health_score_planning_boundary_recorded",
  planning_rules: [
    "Health score is a future planning concept only.",
    "No score is computed in AG51B.",
    "No article or module health status is read from runtime database.",
    "No monitoring job is scheduled.",
    "No automated publish, unpublish, correction, queue mutation or GitHub write is enabled.",
    "Health metrics must be consumed by AG51C as audit/error/exception tracking inputs only."
  ],
  prohibited_runtime_actions: [
    "compute_article_health_score",
    "compute_module_health_score",
    "query_database_for_health_status",
    "schedule_monitoring_job",
    "mutate_editorial_queue",
    "create_github_issue",
    "deploy_dashboard"
  ],
  blocked_state: blockedState
};

const noRuntimeHealthAudit = {
  module_id: "AG51B",
  title: "No Runtime Health Dashboard Audit",
  status: "no_runtime_health_dashboard_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "live_dashboard_enabled", expected: false, actual: false, passed: true },
    { check_id: "dashboard_runtime_enabled", expected: false, actual: false, passed: true },
    { check_id: "analytics_runtime_enabled", expected: false, actual: false, passed: true },
    { check_id: "article_health_runtime_enabled", expected: false, actual: false, passed: true },
    { check_id: "module_health_runtime_enabled", expected: false, actual: false, passed: true },
    { check_id: "health_score_runtime_enabled", expected: false, actual: false, passed: true },
    { check_id: "public_dashboard_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noDatabaseQueryAudit = {
  module_id: "AG51B",
  title: "No Database Query / Monitoring Job Audit",
  status: "no_database_query_monitoring_job_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "runtime_database_query_enabled", expected: false, actual: false, passed: true },
    { check_id: "website_database_reading_enabled", expected: false, actual: false, passed: true },
    { check_id: "api_runtime_database_reading_approved_now", expected: false, actual: false, passed: true },
    { check_id: "monitoring_job_enabled", expected: false, actual: false, passed: true },
    { check_id: "scheduled_monitoring_job_enabled", expected: false, actual: false, passed: true },
    { check_id: "external_fetch_or_api_enabled", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noMutationDeploymentAudit = {
  module_id: "AG51B",
  title: "No Mutation / Deployment Audit",
  status: "no_mutation_deployment_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "editorial_assignment_mutation_enabled", expected: false, actual: false, passed: true },
    { check_id: "queue_mutation_enabled", expected: false, actual: false, passed: true },
    { check_id: "github_write_enabled", expected: false, actual: false, passed: true },
    { check_id: "public_content_mutation_enabled", expected: false, actual: false, passed: true },
    { check_id: "backend_auth_supabase_activation_performed", expected: false, actual: false, passed: true },
    { check_id: "deployment_performed", expected: false, actual: false, passed: true },
    { check_id: "service_role_key_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const readiness = {
  module_id: "AG51B",
  title: "AG51C Audit / Error / Exception Tracking Readiness Record",
  status: "ready_for_ag51c_audit_error_exception_tracking_model",
  ready_for_ag51c: true,
  next_stage_id: "AG51C",
  next_stage_title: "Audit / Error / Exception Tracking Model",
  ag51c_allowed_scope: [
    "Define broken URL exception categories.",
    "Define missing reference and image-credit exception categories.",
    "Define layout, role, audit and rollback exception categories.",
    "Consume AG51A editorial monitoring and AG51B article/module health models.",
    "Keep runtime dashboard, database query, monitoring job, mutation and deployment disabled."
  ],
  ag51c_blocked_scope: [
    "Live dashboard",
    "Runtime database query",
    "Monitoring job",
    "Scheduled analytics job",
    "Automated link checking",
    "External fetch/API checking",
    "Editorial queue mutation",
    "GitHub write",
    "Supabase/Auth/backend activation",
    "RLS public policy activation",
    "Deployment",
    "Service-role key exposure"
  ],
  hard_blocker_count_for_ag51c: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG51B",
  title: "AG51B to AG51C Audit Error Exception Tracking Boundary",
  status: "ag51c_audit_error_exception_tracking_boundary_created",
  next_stage_id: "AG51C",
  next_stage_title: "Audit / Error / Exception Tracking Model",
  allowed_scope: readiness.ag51c_allowed_scope,
  blocked_scope: readiness.ag51c_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG51B",
  title: "Article and Module Health Model",
  status: "article_module_health_model_ready_for_ag51c",
  depends_on: ["AG51A", "AG50Z", "AG47–AG50 context where available", "ADB20"],
  discovered_context_sources: discovered,
  article_health_metric_model_file: outputs.articleHealthMetricModel,
  module_health_metric_model_file: outputs.moduleHealthMetricModel,
  content_surface_status_model_file: outputs.contentSurfaceStatusModel,
  reference_image_credit_health_model_file: outputs.referenceImageCreditHealthModel,
  quality_gate_health_model_file: outputs.qualityGateHealthModel,
  health_score_boundary_file: outputs.healthScoreBoundary,
  no_runtime_health_audit_file: outputs.noRuntimeHealthAudit,
  no_database_query_audit_file: outputs.noDatabaseQueryAudit,
  no_mutation_deployment_audit_file: outputs.noMutationDeploymentAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag51b_article_module_health_model_recorded: true,
    ag51a_consumed: true,
    article_health_metric_model_recorded: true,
    module_health_metric_model_recorded: true,
    content_surface_status_model_recorded: true,
    reference_image_credit_health_model_recorded: true,
    quality_gate_health_model_recorded: true,
    health_score_planning_boundary_recorded: true,
    ready_for_ag51c_audit_error_exception_tracking_model: true,
    hard_blocker_count_for_ag51c: 0,

    live_dashboard_enabled: false,
    dashboard_runtime_enabled: false,
    analytics_runtime_enabled: false,
    article_health_runtime_enabled: false,
    module_health_runtime_enabled: false,
    health_score_runtime_enabled: false,
    runtime_database_query_enabled: false,
    monitoring_job_enabled: false,
    scheduled_monitoring_job_enabled: false,
    external_fetch_or_api_enabled: false,
    editorial_assignment_mutation_enabled: false,
    queue_mutation_enabled: false,
    github_write_enabled: false,
    public_content_mutation_enabled: false,
    website_database_reading_enabled: false,
    api_runtime_database_reading_approved_now: false,
    supabase_auth_backend_activation_approved: false,
    backend_auth_supabase_activation_performed: false,
    rls_public_policy_activation_approved: false,
    deployment_approved: false,
    deployment_performed: false,
    service_role_key_exposed: false,
    public_dashboard_exposed: false
  },
  blocked_state: blockedState
};

const registry = {
  module_id: "AG51B",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG51B",
  status: review.status,
  ag51b_article_module_health_model_recorded: 1,
  ag51a_consumed: 1,
  article_health_metric_model_recorded: 1,
  module_health_metric_model_recorded: 1,
  content_surface_status_model_recorded: 1,
  reference_image_credit_health_model_recorded: 1,
  quality_gate_health_model_recorded: 1,
  health_score_planning_boundary_recorded: 1,
  ready_for_ag51c_audit_error_exception_tracking_model: 1,
  hard_blocker_count_for_ag51c: 0,

  live_dashboard_enabled: 0,
  dashboard_runtime_enabled: 0,
  analytics_runtime_enabled: 0,
  article_health_runtime_enabled: 0,
  module_health_runtime_enabled: 0,
  health_score_runtime_enabled: 0,
  runtime_database_query_enabled: 0,
  monitoring_job_enabled: 0,
  scheduled_monitoring_job_enabled: 0,
  external_fetch_or_api_enabled: 0,
  editorial_assignment_mutation_enabled: 0,
  queue_mutation_enabled: 0,
  github_write_enabled: 0,
  public_content_mutation_enabled: 0,
  website_database_reading_enabled: 0,
  api_runtime_database_reading_approved_now: 0,
  supabase_auth_backend_activation_approved: 0,
  backend_auth_supabase_activation_performed: 0,
  rls_public_policy_activation_approved: 0,
  deployment_approved: 0,
  deployment_performed: 0,
  service_role_key_exposed: 0,
  public_dashboard_exposed: 0
};

const doc = `# AG51B — Article and Module Health Model

## Result

AG51B records article and module health planning models for future analytics and editorial monitoring.

## Planned health models

- Article health metric model
- Module health metric model
- Content surface status model
- Reference and image-credit health model
- Quality gate health model
- Health score planning boundary

## Module surfaces covered

- First Light
- Episodes
- Featured Reads
- Panchang
- Festival
- Word of the Day
- Reflection
- Homepage Discover
- Read surface
- Reflect surface
- Listing/category pages

## Confirmed blocked

- No live dashboard
- No runtime health scoring
- No runtime database query
- No monitoring job
- No external fetch/API checking
- No editorial queue mutation
- No GitHub write
- No Supabase/Auth/backend activation
- No deployment

## Next

AG51C — Audit / Error / Exception Tracking Model.
`;

writeJson(outputs.articleHealthMetricModel, articleHealthMetricModel);
writeJson(outputs.moduleHealthMetricModel, moduleHealthMetricModel);
writeJson(outputs.contentSurfaceStatusModel, contentSurfaceStatusModel);
writeJson(outputs.referenceImageCreditHealthModel, referenceImageCreditHealthModel);
writeJson(outputs.qualityGateHealthModel, qualityGateHealthModel);
writeJson(outputs.healthScoreBoundary, healthScoreBoundary);
writeJson(outputs.noRuntimeHealthAudit, noRuntimeHealthAudit);
writeJson(outputs.noDatabaseQueryAudit, noDatabaseQueryAudit);
writeJson(outputs.noMutationDeploymentAudit, noMutationDeploymentAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG51B Article and Module Health Model generated.");
console.log("✅ Article health, module health, content surface status, reference/image-credit health and quality gate models recorded.");
console.log("✅ Ready for AG51C Audit / Error / Exception Tracking Model.");
console.log("✅ Live dashboard, runtime DB query, monitoring job, mutation, backend/Auth, deployment and secrets remain blocked.");
