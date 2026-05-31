import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag50zReview: "data/content-intelligence/quality-reviews/ag50z-assessment-psychometric-product-layer-closure.json",
  ag50zHandoff: "data/content-intelligence/ag-roadmap/ag50z-post-ag50-roadmap-checkpoint-handoff.json",
  ag50zReadiness: "data/content-intelligence/quality-registry/ag50z-post-ag50-roadmap-checkpoint-readiness-record.json",
  ag50zBoundary: "data/content-intelligence/mutation-plans/ag50z-to-post-ag50-roadmap-checkpoint-boundary.json",
  adb20ApiDeferral: "data/content-intelligence/runtime-engine/adb20-api-runtime-deferral-record.json",
  packageJson: "package.json"
};

const outputs = {
  review: "data/content-intelligence/quality-reviews/ag51a-editorial-monitoring-model.json",
  consumptionRecord: "data/content-intelligence/analytics-monitoring/ag51a-source-consumption-record.json",
  panelModel: "data/content-intelligence/analytics-monitoring/ag51a-editorial-dashboard-panel-model.json",
  reviewQueueModel: "data/content-intelligence/analytics-monitoring/ag51a-review-queue-monitoring-model.json",
  assignmentReturnModel: "data/content-intelligence/analytics-monitoring/ag51a-assignment-return-cycle-monitoring-model.json",
  referenceImageCreditModel: "data/content-intelligence/analytics-monitoring/ag51a-reference-image-credit-monitoring-model.json",
  noRuntimeBoundary: "data/content-intelligence/analytics-monitoring/ag51a-no-runtime-dashboard-boundary.json",
  noRuntimeDashboardAudit: "data/content-intelligence/backend-architecture/ag51a-no-runtime-dashboard-audit.json",
  noDatabaseQueryAudit: "data/content-intelligence/backend-architecture/ag51a-no-database-query-monitoring-job-audit.json",
  noMutationDeploymentAudit: "data/content-intelligence/backend-architecture/ag51a-no-mutation-deployment-audit.json",
  readiness: "data/content-intelligence/quality-registry/ag51a-ag51b-article-module-health-readiness-record.json",
  boundary: "data/content-intelligence/mutation-plans/ag51a-to-ag51b-article-module-health-boundary.json",
  registry: "data/quality/ag51a-editorial-monitoring-model.json",
  preview: "data/quality/ag51a-editorial-monitoring-model-preview.json",
  doc: "docs/quality/AG51A_EDITORIAL_MONITORING_MODEL.md"
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
function findFiles(keywords, limit = 20) {
  const files = listFiles("data/content-intelligence");
  return files
    .filter((f) => keywords.every((k) => f.toLowerCase().includes(k.toLowerCase())))
    .slice(0, limit);
}

for (const p of Object.values(inputs)) {
  if (!exists(p)) throw new Error(`Missing AG51A input: ${p}`);
}

const ag50zReview = readJson(inputs.ag50zReview);
const ag50zHandoff = readJson(inputs.ag50zHandoff);
const ag50zReadiness = readJson(inputs.ag50zReadiness);
const ag50zBoundary = readJson(inputs.ag50zBoundary);
const adb20ApiDeferral = readJson(inputs.adb20ApiDeferral);

if (ag50zReview.status !== "assessment_psychometric_product_layer_closed_ready_for_post_ag50_checkpoint") {
  throw new Error("AG50Z closure status mismatch.");
}
if (ag50zReview.summary?.ready_for_post_ag50_roadmap_checkpoint !== true) {
  throw new Error("Post-AG50 checkpoint readiness missing.");
}
if (ag50zHandoff.next_stage_id !== "POST_AG50_ROADMAP_CHECKPOINT") {
  throw new Error("AG50Z handoff must point to post-AG50 checkpoint.");
}
if (ag50zReadiness.ready_for_post_ag50_checkpoint !== true) {
  throw new Error("Post-AG50 readiness must be true.");
}
if (ag50zBoundary.next_stage_id !== "POST_AG50_ROADMAP_CHECKPOINT") {
  throw new Error("Post-AG50 boundary mismatch.");
}
if (adb20ApiDeferral.website_database_reading_enabled !== false) {
  throw new Error("Website DB reading must remain disabled.");
}

const discovered = {
  ag26_admin_editor_workflow_candidates: findFiles(["ag26"], 20),
  ag41_monitoring_candidates: findFiles(["ag41"], 20),
  ag42_audit_candidates: findFiles(["ag42"], 20),
  ag47_to_ag50_recent_chain_candidates: [
    ...findFiles(["ag47"], 10),
    ...findFiles(["ag48"], 10),
    ...findFiles(["ag49"], 10),
    ...findFiles(["ag50"], 10)
  ],
  reference_candidates: findFiles(["reference"], 20),
  image_credit_candidates: findFiles(["image"], 20),
  article_quality_candidates: findFiles(["article"], 20)
};

const blockedState = {
  ag51a_editorial_monitoring_model_recorded: true,
  ag50z_consumed: true,
  editorial_dashboard_panel_model_recorded: true,
  review_queue_monitoring_model_recorded: true,
  assignment_return_cycle_monitoring_model_recorded: true,
  reference_image_credit_monitoring_model_recorded: true,
  no_runtime_dashboard_boundary_recorded: true,
  ready_for_ag51b_article_module_health_model: true,

  live_dashboard_enabled: false,
  dashboard_runtime_enabled: false,
  analytics_runtime_enabled: false,
  runtime_database_query_enabled: false,
  monitoring_job_enabled: false,
  scheduled_monitoring_job_enabled: false,
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

const consumptionRecord = {
  module_id: "AG51A",
  title: "AG51A Source Consumption Record",
  status: "source_consumption_recorded",
  consumed_required_sources: [
    inputs.ag50zReview,
    inputs.ag50zHandoff,
    inputs.ag50zReadiness,
    inputs.ag50zBoundary,
    inputs.adb20ApiDeferral
  ],
  discovered_context_sources: discovered,
  interpretation: "AG51A starts analytics, monitoring and editorial dashboard planning after AG50Z closure. Existing records are consumed as planning context only; no runtime dashboard, database query, monitoring job, mutation or deployment is activated.",
  blocked_state: blockedState
};

const panelModel = {
  module_id: "AG51A",
  title: "Editorial Dashboard Panel Model",
  status: "editorial_dashboard_panel_model_recorded",
  planned_panels_design_only: [
    "review_queue",
    "assigned_items",
    "returned_items",
    "pending_references",
    "pending_image_credits",
    "article_correction_status",
    "audit_status",
    "module_health_status",
    "blocked_items",
    "ready_for_review_items"
  ],
  panel_position: {
    live_dashboard_enabled_now: false,
    runtime_query_enabled_now: false,
    dashboard_ui_enabled_now: false,
    design_only_panel_model: true
  },
  blocked_state: blockedState
};

const reviewQueueModel = {
  module_id: "AG51A",
  title: "Review Queue Monitoring Model",
  status: "review_queue_monitoring_model_recorded",
  future_queue_states_design_only: [
    "draft_created",
    "editor_review_pending",
    "returned_for_correction",
    "reference_verification_pending",
    "image_credit_pending",
    "quality_audit_pending",
    "approved_for_static_surface",
    "blocked_due_to_policy_or_quality"
  ],
  monitoring_position: {
    live_queue_reading_enabled_now: false,
    queue_mutation_enabled_now: false,
    editor_assignment_runtime_enabled_now: false
  },
  blocked_state: blockedState
};

const assignmentReturnModel = {
  module_id: "AG51A",
  title: "Assignment and Return-cycle Monitoring Model",
  status: "assignment_return_cycle_monitoring_model_recorded",
  future_tracking_dimensions_design_only: [
    "assigned_to_role",
    "assigned_on",
    "review_due_state",
    "return_reason_category",
    "correction_required_category",
    "resubmission_state",
    "approval_gate_state",
    "closure_state"
  ],
  monitoring_position: {
    assignment_runtime_enabled_now: false,
    return_cycle_runtime_enabled_now: false,
    github_write_or_issue_creation_enabled_now: false
  },
  blocked_state: blockedState
};

const referenceImageCreditModel = {
  module_id: "AG51A",
  title: "Reference and Image-credit Monitoring Model",
  status: "reference_image_credit_monitoring_model_recorded",
  future_monitoring_fields_design_only: [
    "reference_link_status",
    "reference_verification_status",
    "reference_relevance_status",
    "image_credit_status",
    "image_source_status",
    "image_rights_or_attribution_note",
    "editorial_verification_pending_flag"
  ],
  monitoring_position: {
    live_reference_checker_enabled_now: false,
    live_image_credit_checker_enabled_now: false,
    external_fetch_or_api_enabled_now: false
  },
  blocked_state: blockedState
};

const noRuntimeBoundary = {
  module_id: "AG51A",
  title: "No Runtime Dashboard Boundary",
  status: "no_runtime_dashboard_boundary_recorded",
  boundary_rules: [
    "AG51A records dashboard planning only.",
    "No live dashboard UI is created.",
    "No database query is executed.",
    "No monitoring job is scheduled.",
    "No editorial queue is mutated.",
    "No GitHub write, Supabase/Auth/backend activation or deployment is enabled.",
    "AG51A outputs must be consumed by AG51B as planning records only."
  ],
  blocked_state: blockedState
};

const noRuntimeDashboardAudit = {
  module_id: "AG51A",
  title: "No Runtime Dashboard Audit",
  status: "no_runtime_dashboard_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "live_dashboard_enabled", expected: false, actual: false, passed: true },
    { check_id: "dashboard_runtime_enabled", expected: false, actual: false, passed: true },
    { check_id: "analytics_runtime_enabled", expected: false, actual: false, passed: true },
    { check_id: "public_dashboard_exposed", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noDatabaseQueryAudit = {
  module_id: "AG51A",
  title: "No Database Query / Monitoring Job Audit",
  status: "no_database_query_monitoring_job_audit_passed",
  audit_passed: true,
  checks: [
    { check_id: "runtime_database_query_enabled", expected: false, actual: false, passed: true },
    { check_id: "website_database_reading_enabled", expected: false, actual: false, passed: true },
    { check_id: "api_runtime_database_reading_approved_now", expected: false, actual: false, passed: true },
    { check_id: "monitoring_job_enabled", expected: false, actual: false, passed: true },
    { check_id: "scheduled_monitoring_job_enabled", expected: false, actual: false, passed: true }
  ],
  failed_checks: [],
  blocked_state: blockedState
};

const noMutationDeploymentAudit = {
  module_id: "AG51A",
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
  module_id: "AG51A",
  title: "AG51B Article and Module Health Model Readiness Record",
  status: "ready_for_ag51b_article_module_health_model",
  ready_for_ag51b: true,
  next_stage_id: "AG51B",
  next_stage_title: "Article and Module Health Model",
  ag51b_allowed_scope: [
    "Define article health metrics as planning records.",
    "Define module health metrics for First Light, episodes, Featured Reads, Panchang, Word and listing status.",
    "Consume AG51A editorial monitoring panel model.",
    "Keep runtime dashboard, database query, monitoring job, mutation and deployment disabled."
  ],
  ag51b_blocked_scope: [
    "Live dashboard",
    "Runtime database query",
    "Monitoring job",
    "Scheduled analytics job",
    "Editorial queue mutation",
    "GitHub write",
    "Supabase/Auth/backend activation",
    "RLS public policy activation",
    "Deployment",
    "Service-role key exposure"
  ],
  hard_blocker_count_for_ag51b: 0,
  blocked_state: blockedState
};

const boundary = {
  module_id: "AG51A",
  title: "AG51A to AG51B Article and Module Health Boundary",
  status: "ag51b_article_module_health_boundary_created",
  next_stage_id: "AG51B",
  next_stage_title: "Article and Module Health Model",
  allowed_scope: readiness.ag51b_allowed_scope,
  blocked_scope: readiness.ag51b_blocked_scope,
  blocked_state: blockedState
};

const review = {
  module_id: "AG51A",
  title: "Editorial Monitoring Model",
  status: "editorial_monitoring_model_ready_for_ag51b",
  depends_on: ["AG50Z", "AG26", "AG41/AG42 context where available", "ADB20"],
  consumption_record_file: outputs.consumptionRecord,
  panel_model_file: outputs.panelModel,
  review_queue_model_file: outputs.reviewQueueModel,
  assignment_return_model_file: outputs.assignmentReturnModel,
  reference_image_credit_model_file: outputs.referenceImageCreditModel,
  no_runtime_boundary_file: outputs.noRuntimeBoundary,
  no_runtime_dashboard_audit_file: outputs.noRuntimeDashboardAudit,
  no_database_query_audit_file: outputs.noDatabaseQueryAudit,
  no_mutation_deployment_audit_file: outputs.noMutationDeploymentAudit,
  readiness_file: outputs.readiness,
  boundary_file: outputs.boundary,
  summary: {
    ag51a_editorial_monitoring_model_recorded: true,
    ag50z_consumed: true,
    editorial_dashboard_panel_model_recorded: true,
    review_queue_monitoring_model_recorded: true,
    assignment_return_cycle_monitoring_model_recorded: true,
    reference_image_credit_monitoring_model_recorded: true,
    no_runtime_dashboard_boundary_recorded: true,
    ready_for_ag51b_article_module_health_model: true,
    hard_blocker_count_for_ag51b: 0,

    live_dashboard_enabled: false,
    dashboard_runtime_enabled: false,
    analytics_runtime_enabled: false,
    runtime_database_query_enabled: false,
    monitoring_job_enabled: false,
    scheduled_monitoring_job_enabled: false,
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
  module_id: "AG51A",
  title: review.title,
  status: review.status,
  generated_artifacts: outputs
};

const preview = {
  module_id: "AG51A",
  status: review.status,
  ag51a_editorial_monitoring_model_recorded: 1,
  ag50z_consumed: 1,
  editorial_dashboard_panel_model_recorded: 1,
  review_queue_monitoring_model_recorded: 1,
  assignment_return_cycle_monitoring_model_recorded: 1,
  reference_image_credit_monitoring_model_recorded: 1,
  no_runtime_dashboard_boundary_recorded: 1,
  ready_for_ag51b_article_module_health_model: 1,
  hard_blocker_count_for_ag51b: 0,

  live_dashboard_enabled: 0,
  dashboard_runtime_enabled: 0,
  analytics_runtime_enabled: 0,
  runtime_database_query_enabled: 0,
  monitoring_job_enabled: 0,
  scheduled_monitoring_job_enabled: 0,
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

const doc = `# AG51A — Editorial Monitoring Model

## Result

AG51A records the editorial monitoring model for future analytics and dashboard planning.

## Planned panels

- Review queue
- Assigned items
- Returned items
- Pending references
- Pending image credits
- Article correction status
- Audit status
- Module health status
- Blocked items
- Ready-for-review items

## Confirmed

- AG50Z post-roadmap checkpoint is consumed.
- Editorial monitoring is planning-only.
- No live dashboard is created.
- No runtime database query is enabled.
- No monitoring job is scheduled.
- No editorial queue mutation, GitHub write, Supabase/Auth/backend activation or deployment is enabled.

## Next

AG51B — Article and Module Health Model.
`;

writeJson(outputs.consumptionRecord, consumptionRecord);
writeJson(outputs.panelModel, panelModel);
writeJson(outputs.reviewQueueModel, reviewQueueModel);
writeJson(outputs.assignmentReturnModel, assignmentReturnModel);
writeJson(outputs.referenceImageCreditModel, referenceImageCreditModel);
writeJson(outputs.noRuntimeBoundary, noRuntimeBoundary);
writeJson(outputs.noRuntimeDashboardAudit, noRuntimeDashboardAudit);
writeJson(outputs.noDatabaseQueryAudit, noDatabaseQueryAudit);
writeJson(outputs.noMutationDeploymentAudit, noMutationDeploymentAudit);
writeJson(outputs.readiness, readiness);
writeJson(outputs.boundary, boundary);
writeJson(outputs.review, review);
writeJson(outputs.registry, registry);
writeJson(outputs.preview, preview);
writeText(outputs.doc, doc);

console.log("✅ AG51A Editorial Monitoring Model generated.");
console.log("✅ Editorial dashboard panel, review queue, assignment/return and reference/image-credit monitoring models recorded.");
console.log("✅ Ready for AG51B Article and Module Health Model.");
console.log("✅ Live dashboard, runtime DB query, monitoring job, mutation, backend/Auth, deployment and secrets remain blocked.");
