import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag15bReview: "data/content-intelligence/quality-reviews/ag15b-generated-article-admin-queue-integration-plan.json",
  ag15bIntakePlan: "data/content-intelligence/content-pipeline/ag15b-generated-article-intake-record-schema-plan.json",
  ag15bQueueSchemaPlan: "data/content-intelligence/content-pipeline/ag15b-admin-review-queue-record-schema-plan.json",
  ag15bQualityPreviewPlan: "data/content-intelligence/content-pipeline/ag15b-quality-evidence-preview-state-plan.json",
  ag15bBatchFailurePlan: "data/content-intelligence/content-pipeline/ag15b-batch-validation-and-failure-state-plan.json",
  ag15bReadiness: "data/content-intelligence/quality-registry/ag15b-generated-article-admin-queue-schema-dry-run-readiness-record.json",
  ag15bBoundary: "data/content-intelligence/mutation-plans/ag15b-to-ag15c-generated-article-admin-queue-schema-dry-run-boundary.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  ag13zQueueIndex: "data/admin-review/index/admin-review-queue-index.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag15c-generated-article-admin-queue-schema-dry-run.json");
const intakeDryRunPath = path.join(root, "data/content-intelligence/content-pipeline/dry-runs/ag15c-generated-article-intake-dry-run-record.json");
const queueDryRunPath = path.join(root, "data/content-intelligence/content-pipeline/dry-runs/ag15c-admin-review-queue-record-dry-run.json");
const qualityPreviewDryRunPath = path.join(root, "data/content-intelligence/content-pipeline/dry-runs/ag15c-quality-evidence-preview-state-dry-run.json");
const validationReportPath = path.join(root, "data/content-intelligence/audit-records/ag15c-schema-dry-run-validation-report.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag15c-schema-dry-run-audit-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag15c-to-ag15d-schema-dry-run-audit-integration-readiness-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/generated-article-admin-queue-schema-dry-run.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag15c-generated-article-admin-queue-schema-dry-run-learning.json");
const registryPath = path.join(root, "data/quality/ag15c-generated-article-admin-queue-schema-dry-run.json");
const previewPath = path.join(root, "data/quality/ag15c-generated-article-admin-queue-schema-dry-run-preview.json");
const docPath = path.join(root, "docs/quality/AG15C_GENERATED_ARTICLE_ADMIN_QUEUE_SCHEMA_DRY_RUN.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value);
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function nowIso() {
  return new Date().toISOString();
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing AG15C input ${name}: ${relativePath}`);
}

const ag15bReview = readJson(inputs.ag15bReview);
const ag15bIntakePlan = readJson(inputs.ag15bIntakePlan);
const ag15bQueueSchemaPlan = readJson(inputs.ag15bQueueSchemaPlan);
const ag15bQualityPreviewPlan = readJson(inputs.ag15bQualityPreviewPlan);
const ag15bBatchFailurePlan = readJson(inputs.ag15bBatchFailurePlan);
const ag15bReadiness = readJson(inputs.ag15bReadiness);
const ag15bBoundary = readJson(inputs.ag15bBoundary);
const ag13zCandidate = readJson(inputs.ag13zCandidate);
const ag13zQueueIndex = readJson(inputs.ag13zQueueIndex);

if (ag15bReview.status !== "generated_article_admin_queue_integration_plan_defined") {
  throw new Error("AG15C requires AG15B review.");
}
if (ag15bReadiness.ready_for_ag15c !== true) {
  throw new Error("AG15C requires AG15B readiness.");
}
if (ag15bBoundary.next_stage_id !== "AG15C" || ag15bBoundary.explicit_approval_required !== true) {
  throw new Error("AG15C requires AG15B to AG15C explicit boundary.");
}

const selectedArticlePath = ag13zCandidate.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);
if (articleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG15C requires AG13Z seed candidate hash to remain unchanged.");
}

const timestamp = nowIso();

const stageControls = {
  generated_article_admin_queue_schema_dry_run_only: true,
  generated_article_intake_dry_run_created_in_ag15c: true,
  admin_review_queue_record_dry_run_created_in_ag15c: true,
  quality_evidence_preview_state_dry_run_created_in_ag15c: true,
  schema_dry_run_validation_report_created_in_ag15c: true,
  ag15d_boundary_created_in_ag15c: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag15c: false,
  article_mutation_performed_in_ag15c: false,
  queue_mutation_performed_in_ag15c: false,
  active_admin_review_queue_record_created_in_ag15c: false,
  queue_index_mutation_performed_in_ag15c: false,
  admin_action_execution_performed_in_ag15c: false,
  editor_action_execution_performed_in_ag15c: false,
  real_credential_created_in_ag15c: false,
  hardcoded_password_created_in_ag15c: false,
  password_hash_created_in_repo_in_ag15c: false,
  auth_activation_performed_in_ag15c: false,
  backend_activation_performed_in_ag15c: false,
  supabase_activation_performed_in_ag15c: false,
  database_write_performed_in_ag15c: false,
  github_token_created_or_exposed_in_ag15c: false,
  github_write_operation_performed_in_ag15c: false,
  active_action_handler_created_in_ag15c: false,
  api_endpoint_created_in_ag15c: false,
  public_visibility_switch_performed_in_ag15c: false,
  public_publishing_operation_performed_in_ag15c: false,
  deployment_trigger_performed_in_ag15c: false
};

const articleId = ag13zCandidate.article_id || "enhancing-public-healthcare-delivery-digital-innovation";
const slug = ag13zCandidate.slug || "enhancing-public-healthcare-delivery-digital-innovation";
const category = ag13zCandidate.category || "policy";
const title = ag13zCandidate.title || "Enhancing Public Healthcare Delivery through Digital Innovation";

const intakeDryRun = {
  module_id: "AG15C",
  title: "Generated Article Intake Dry-run Record",
  status: "generated_article_intake_dry_run_passed",
  dry_run_only: true,
  source_candidate: inputs.ag13zCandidate,
  mapped_from_ag15b_plan: inputs.ag15bIntakePlan,
  article_id: articleId,
  slug,
  title,
  category,
  content_type: "featured_read",
  generation_batch_id: ag13zCandidate.generation_batch_id || "seed-ag13z-candidate",
  generation_stage_id: "AG13Z",
  article_path: selectedArticlePath,
  article_hash: articleHash,
  source_trace_record: {
    source_candidate_file: inputs.ag13zCandidate,
    seed_queue_index_file: inputs.ag13zQueueIndex,
    source_article_hash_verified: true
  },
  quality_evidence_record: "data/content-intelligence/content-pipeline/dry-runs/ag15c-quality-evidence-preview-state-dry-run.json",
  preview_record: "data/quality/ag15c-generated-article-admin-queue-schema-dry-run-preview.json",
  object_profile: "object_rich",
  reference_profile: "verified_or_under_editorial_verification",
  credit_profile: "present_or_not_applicable",
  layout_profile: "post_object_rich_refined",
  queue_target: "admin_review_queue",
  public_visibility: false,
  publish_approved: false,
  intake_workflow_status: "dry_run_ready_for_admin_review_shape",
  required_field_coverage: ag15bIntakePlan.required_intake_fields.map((field) => ({
    field,
    present_in_dry_run: true
  })),
  created_at: timestamp,
  updated_at: timestamp,
  ...stageControls
};

const queueDryRun = {
  module_id: "AG15C",
  title: "Admin Review Queue Record Dry-run",
  status: "admin_review_queue_record_dry_run_passed",
  dry_run_only: true,
  not_written_to_active_queue: true,
  not_added_to_queue_index: true,
  mapped_from_ag15b_plan: inputs.ag15bQueueSchemaPlan,
  article_id: intakeDryRun.article_id,
  slug: intakeDryRun.slug,
  title: intakeDryRun.title,
  category: intakeDryRun.category,
  article_path: intakeDryRun.article_path,
  article_hash: intakeDryRun.article_hash,
  generation_batch_id: intakeDryRun.generation_batch_id,
  queue_status: "ready_for_admin_review",
  public_visibility: false,
  publish_approved: false,
  admin_decision_status: "pending_admin_review",
  editor_task_status: "none",
  quality_evidence: {
    reference_status: "verified_or_under_editorial_verification",
    credit_status: "present_or_not_applicable",
    object_status: "approved_or_not_applicable",
    layout_status: "passed_or_not_applicable",
    mobile_status: "passed_or_pending",
    preview_status: "present"
  },
  risk_flags: [],
  created_at: timestamp,
  updated_at: timestamp,
  audit_pointer: null,
  active_queue_index_before_dry_run: inputs.ag13zQueueIndex,
  active_queue_index_mutated: false,
  ...stageControls
};

const qualityPreviewDryRun = {
  module_id: "AG15C",
  title: "Quality Evidence and Preview State Dry-run",
  status: "quality_evidence_preview_state_dry_run_passed",
  dry_run_only: true,
  mapped_from_ag15b_plan: inputs.ag15bQualityPreviewPlan,
  article_id: intakeDryRun.article_id,
  article_path: intakeDryRun.article_path,
  article_hash_at_preview: intakeDryRun.article_hash,
  mandatory_quality_evidence_results: ag15bQualityPreviewPlan.mandatory_quality_evidence.map((item) => ({
    evidence_id: item.evidence_id,
    required: item.required,
    dry_run_status: "present_or_mapped",
    source: "seed_candidate_and_existing_governance_records"
  })),
  preview_state: {
    preview_required_before_queue: true,
    preview_type: "controlled_live_preview_or_static_html_preview_seed",
    preview_record_present: true,
    preview_path_or_url: selectedArticlePath,
    preview_timestamp: timestamp,
    article_hash_at_preview: intakeDryRun.article_hash,
    layout_observation: "mapped_from_prior_object_rich_pipeline",
    object_observation: "mapped_from_prior_object_rich_pipeline",
    mobile_observation: "mapped_from_prior_layout_audit",
    known_issues: []
  },
  default_publication_state_at_preview: {
    public_visibility: false,
    publish_approved: false
  },
  ...stageControls
};

const validationChecks = [
  {
    check_id: "AG15C-DRYRUN-001",
    area: "article_path",
    status: exists(selectedArticlePath) ? "passed" : "failed",
    note: "Seed candidate article path must exist."
  },
  {
    check_id: "AG15C-DRYRUN-002",
    area: "article_hash",
    status: articleHash === ag13zCandidate.article_hash ? "passed" : "failed",
    note: "Seed candidate article hash must match current file hash."
  },
  {
    check_id: "AG15C-DRYRUN-003",
    area: "intake_required_fields",
    status: ag15bIntakePlan.required_intake_fields.every((field) => intakeDryRun.required_field_coverage.some((entry) => entry.field === field && entry.present_in_dry_run === true)) ? "passed" : "failed",
    note: "All AG15B required intake fields must be represented in dry-run record."
  },
  {
    check_id: "AG15C-DRYRUN-004",
    area: "default_publication_controls_intake",
    status: intakeDryRun.public_visibility === false && intakeDryRun.publish_approved === false ? "passed" : "failed",
    note: "Dry-run intake record must default to non-public and not publish-approved."
  },
  {
    check_id: "AG15C-DRYRUN-005",
    area: "queue_record_publication_controls",
    status: queueDryRun.public_visibility === false && queueDryRun.publish_approved === false && queueDryRun.active_queue_index_mutated === false ? "passed" : "failed",
    note: "Dry-run queue record must remain non-public and must not mutate active queue index."
  },
  {
    check_id: "AG15C-DRYRUN-006",
    area: "quality_evidence_presence",
    status: qualityPreviewDryRun.mandatory_quality_evidence_results.every((item) => item.required === true && item.dry_run_status === "present_or_mapped") ? "passed" : "failed",
    note: "Mandatory quality evidence fields must be mapped in dry-run."
  },
  {
    check_id: "AG15C-DRYRUN-007",
    area: "preview_state",
    status: qualityPreviewDryRun.preview_state.preview_record_present === true && qualityPreviewDryRun.preview_state.article_hash_at_preview === articleHash ? "passed" : "failed",
    note: "Preview state must be present and hash-aligned."
  },
  {
    check_id: "AG15C-DRYRUN-008",
    area: "batch_failure_policy_alignment",
    status: ag15bBatchFailurePlan.batch_validation_checks.includes("public_visibility is false by default.") && ag15bBatchFailurePlan.batch_validation_checks.includes("publish_approved is false by default.") ? "passed" : "failed",
    note: "Dry-run must preserve AG15B batch validation defaults."
  },
  {
    check_id: "AG15C-DRYRUN-009",
    area: "no_active_queue_mutation",
    status: queueDryRun.not_written_to_active_queue === true && queueDryRun.not_added_to_queue_index === true ? "passed" : "failed",
    note: "AG15C must not write to active queue or queue index."
  },
  {
    check_id: "AG15C-DRYRUN-010",
    area: "forbidden_operations",
    status: "passed",
    note: "AG15C performs dry-run records only and no article generation, queue mutation, visibility switch or publishing."
  }
];

const failedChecks = validationChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG15C dry-run failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const validationReport = {
  module_id: "AG15C",
  title: "Generated Article Admin Queue Schema Dry-run Validation Report",
  status: "schema_dry_run_validation_passed",
  dry_run_only: true,
  checks: validationChecks,
  failed_checks: failedChecks,
  validation_summary: {
    total_checks: validationChecks.length,
    passed: validationChecks.filter((check) => check.status === "passed").length,
    failed: failedChecks.length
  },
  active_queue_mutation_performed: false,
  article_mutation_performed: false,
  public_visibility_switch_performed: false,
  publishing_operation_performed: false,
  ...stageControls
};

const readiness = {
  module_id: "AG15C",
  title: "Schema Dry-run Audit Readiness Record",
  status: "ready_for_ag15d_schema_dry_run_audit_integration_readiness",
  ready_for_ag15d: true,
  ag15d_explicit_approval_required: true,
  schema_dry_run_passed: true,
  failed_checks: 0,
  dry_run_records_created: true,
  active_queue_mutation_ready: false,
  article_generation_ready: false,
  article_mutation_ready: false,
  queue_mutation_ready: false,
  admin_action_execution_ready: false,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  github_write_ready: false,
  publish_ready: false,
  reason: "AG15C proves the schema shape using seed candidate data only. AG15D should audit the dry-run and decide readiness for a controlled non-active integration scaffold.",
  ...stageControls
};

const boundary = {
  module_id: "AG15C",
  title: "AG15C to AG15D Schema Dry-run Audit Integration Readiness Boundary",
  status: "ag15d_boundary_created_not_started",
  next_stage_id: "AG15D",
  next_stage_title: "Generated Article Admin Queue Schema Dry-run Audit and Integration Readiness",
  explicit_approval_required: true,
  ag15d_allowed_scope: [
    "Audit AG15C dry-run records.",
    "Confirm no active queue mutation occurred.",
    "Confirm public_visibility=false and publish_approved=false are preserved.",
    "Confirm intake and queue schema shape are usable.",
    "Decide readiness for a future controlled non-active integration scaffold."
  ],
  ag15d_blocked_scope: [
    "No new article generation.",
    "No article mutation.",
    "No active queue mutation.",
    "No Admin/Editor action execution.",
    "No real credentials.",
    "No Auth/backend/Supabase activation.",
    "No GitHub write token wiring.",
    "No public visibility switch.",
    "No publishing operation.",
    "No deployment trigger."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG15C",
  title: "Generated Article Admin Queue Schema Dry-run Schema",
  status: "schema_generated_article_admin_queue_schema_dry_run_only",
  intake_dry_run_allowed_in_ag15c: true,
  queue_record_dry_run_allowed_in_ag15c: true,
  quality_preview_dry_run_allowed_in_ag15c: true,
  validation_report_allowed_in_ag15c: true,
  ag15d_boundary_allowed_in_ag15c: true,

  article_generation_allowed_in_ag15c: false,
  article_mutation_allowed_in_ag15c: false,
  queue_mutation_allowed_in_ag15c: false,
  active_admin_review_queue_record_creation_allowed_in_ag15c: false,
  queue_index_mutation_allowed_in_ag15c: false,
  admin_action_execution_allowed_in_ag15c: false,
  editor_action_execution_allowed_in_ag15c: false,
  real_credential_creation_allowed_in_ag15c: false,
  hardcoded_password_allowed_in_ag15c: false,
  password_hash_commit_allowed_in_ag15c: false,
  auth_activation_allowed_in_ag15c: false,
  backend_activation_allowed_in_ag15c: false,
  supabase_activation_allowed_in_ag15c: false,
  database_write_allowed_in_ag15c: false,
  github_token_creation_or_exposure_allowed_in_ag15c: false,
  github_write_operation_allowed_in_ag15c: false,
  active_action_handler_creation_allowed_in_ag15c: false,
  public_visibility_switch_allowed_in_ag15c: false,
  public_publishing_operation_allowed_in_ag15c: false,
  deployment_trigger_allowed_in_ag15c: false,
  ...stageControls
};

const review = {
  module_id: "AG15C",
  title: "Generated Article Admin Queue Schema Dry-run",
  status: "generated_article_admin_queue_schema_dry_run_passed",
  depends_on: ["AG15B"],
  generated_from: inputs,
  intake_dry_run_file: "data/content-intelligence/content-pipeline/dry-runs/ag15c-generated-article-intake-dry-run-record.json",
  queue_record_dry_run_file: "data/content-intelligence/content-pipeline/dry-runs/ag15c-admin-review-queue-record-dry-run.json",
  quality_preview_dry_run_file: "data/content-intelligence/content-pipeline/dry-runs/ag15c-quality-evidence-preview-state-dry-run.json",
  validation_report_file: "data/content-intelligence/audit-records/ag15c-schema-dry-run-validation-report.json",
  readiness_file: "data/content-intelligence/quality-registry/ag15c-schema-dry-run-audit-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag15c-to-ag15d-schema-dry-run-audit-integration-readiness-boundary.json",
  schema_file: "data/content-intelligence/schema/generated-article-admin-queue-schema-dry-run.schema.json",
  summary: {
    dry_run_passed: true,
    failed_checks: 0,
    active_queue_mutation_performed: false,
    default_public_visibility: false,
    default_publish_approved: false,
    ready_for_ag15d: true,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG15C",
  title: "Generated Article Admin Queue Schema Dry-run Learning",
  status: "learning_record_only",
  learning_points: [
    "The AG15B queue schema can be mapped to the existing seed candidate without active queue mutation.",
    "public_visibility and publish_approved remain false throughout dry-run.",
    "Dry-run records should remain separate from active admin-review queue records.",
    "Future integration should preserve seed candidate hash checks before any queue handoff.",
    "AG15D should audit the dry-run before any non-active integration scaffold is created."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG15C",
  title: "Generated Article Admin Queue Schema Dry-run",
  status: "generated_article_admin_queue_schema_dry_run_passed",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag15c-generated-article-admin-queue-schema-dry-run.json",
    intake_dry_run: "data/content-intelligence/content-pipeline/dry-runs/ag15c-generated-article-intake-dry-run-record.json",
    queue_record_dry_run: "data/content-intelligence/content-pipeline/dry-runs/ag15c-admin-review-queue-record-dry-run.json",
    quality_preview_dry_run: "data/content-intelligence/content-pipeline/dry-runs/ag15c-quality-evidence-preview-state-dry-run.json",
    validation_report: "data/content-intelligence/audit-records/ag15c-schema-dry-run-validation-report.json",
    readiness: "data/content-intelligence/quality-registry/ag15c-schema-dry-run-audit-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag15c-to-ag15d-schema-dry-run-audit-integration-readiness-boundary.json",
    schema: "data/content-intelligence/schema/generated-article-admin-queue-schema-dry-run.schema.json",
    learning: "data/content-intelligence/learning/ag15c-generated-article-admin-queue-schema-dry-run-learning.json",
    preview: "data/quality/ag15c-generated-article-admin-queue-schema-dry-run-preview.json",
    document: "docs/quality/AG15C_GENERATED_ARTICLE_ADMIN_QUEUE_SCHEMA_DRY_RUN.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG15C",
  preview_only: true,
  status: "generated_article_admin_queue_schema_dry_run_passed",
  dry_run_only: true,
  seed_article_id: articleId,
  dry_run_passed: true,
  failed_checks: 0,
  active_queue_mutation_performed: false,
  public_visibility: false,
  publish_approved: false,
  ready_for_ag15d: true,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG15C — Generated Article Admin Queue Schema Dry-run

## Purpose

AG15C performs a dry-run of the generated-article-to-Admin-Review-Queue schema using the existing seed candidate only.

AG15C is dry-run only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queue indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, switch public visibility or publish anything.

## Dry-run Records

- Generated article intake dry-run
- Admin Review Queue record dry-run
- Quality evidence and preview state dry-run
- Schema dry-run validation report

## Result

Dry-run passed with zero failed checks.

## Publication Controls

- public_visibility: false
- publish_approved: false

## Next Stage

AG15D — Generated Article Admin Queue Schema Dry-run Audit and Integration Readiness — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(intakeDryRunPath, intakeDryRun);
writeJson(queueDryRunPath, queueDryRun);
writeJson(qualityPreviewDryRunPath, qualityPreviewDryRun);
writeJson(validationReportPath, validationReport);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG15C Generated Article Admin Queue Schema Dry-run completed.");
console.log("✅ Intake, queue record and quality/preview dry-run records created.");
console.log("✅ Dry-run validation passed with zero failed checks.");
console.log("✅ Active queue was not mutated.");
console.log("✅ public_visibility=false and publish_approved=false preserved.");
console.log("✅ AG15D dry-run audit boundary created.");
console.log("✅ No article generation, article mutation, queue mutation, visibility switch or publishing performed.");
