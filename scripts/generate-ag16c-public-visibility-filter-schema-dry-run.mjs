import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag16bReview: "data/content-intelligence/quality-reviews/ag16b-public-visibility-publish-filter-schema-plan.json",
  ag16bVisibilitySchema: "data/content-intelligence/content-pipeline/ag16b-public-visibility-field-schema-plan.json",
  ag16bPublishSchema: "data/content-intelligence/content-pipeline/ag16b-publish-control-field-schema-plan.json",
  ag16bFilterContract: "data/content-intelligence/content-pipeline/ag16b-public-surface-filter-contract.json",
  ag16bExclusionContract: "data/content-intelligence/content-pipeline/ag16b-public-surface-exclusion-contract.json",
  ag16bValidationPlan: "data/content-intelligence/content-pipeline/ag16b-public-visibility-filter-validation-plan.json",
  ag16bReadiness: "data/content-intelligence/quality-registry/ag16b-public-visibility-filter-schema-dry-run-readiness-record.json",
  ag16bBoundary: "data/content-intelligence/mutation-plans/ag16b-to-ag16c-public-visibility-filter-schema-dry-run-boundary.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag16c-public-visibility-filter-schema-dry-run.json");
const seedDryRunPath = path.join(root, "data/content-intelligence/content-pipeline/dry-runs/ag16c-seed-candidate-public-filter-dry-run.json");
const stateMatrixPath = path.join(root, "data/content-intelligence/content-pipeline/dry-runs/ag16c-public-visibility-state-matrix-dry-run.json");
const publicPassShapePath = path.join(root, "data/content-intelligence/content-pipeline/dry-runs/ag16c-hypothetical-public-published-shape-dry-run.json");
const validationReportPath = path.join(root, "data/content-intelligence/audit-records/ag16c-public-visibility-filter-schema-dry-run-validation-report.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag16c-public-visibility-filter-schema-dry-run-audit-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag16c-to-ag16d-public-visibility-filter-schema-dry-run-audit-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/public-visibility-filter-schema-dry-run.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag16c-public-visibility-filter-schema-dry-run-learning.json");
const registryPath = path.join(root, "data/quality/ag16c-public-visibility-filter-schema-dry-run.json");
const previewPath = path.join(root, "data/quality/ag16c-public-visibility-filter-schema-dry-run-preview.json");
const docPath = path.join(root, "docs/quality/AG16C_PUBLIC_VISIBILITY_FILTER_SCHEMA_DRY_RUN.md");

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

function evaluatePublicFilter(record, surface = "featured_reads") {
  const includeChecks = [
    record.public_visibility === true,
    record.publish_approved === true,
    record.public_index_allowed === true,
    ["public_published", "published_closed"].includes(record.status),
    typeof record.article_path === "string" && record.article_path.length > 0,
    typeof record.article_hash === "string" && record.article_hash.length > 0,
    record.article_hash === record.approved_hash,
    ["complete", "not_applicable"].includes(record.quality_evidence_status),
    record.preview_status === "passed",
    record.hash_integrity_status === "matched"
  ];

  if (surface === "featured_reads") {
    includeChecks.push(record.featured_reads_allowed === true);
  }

  const passed = includeChecks.every(Boolean);

  return {
    surface,
    passed,
    reason: passed
      ? "Record satisfies public visibility and publish filter."
      : "Record does not satisfy public visibility and publish filter.",
    evaluated_conditions: {
      public_visibility_true: record.public_visibility === true,
      publish_approved_true: record.publish_approved === true,
      public_index_allowed_true: record.public_index_allowed === true,
      featured_reads_allowed_true: surface === "featured_reads" ? record.featured_reads_allowed === true : "not_applicable",
      status_public: ["public_published", "published_closed"].includes(record.status),
      article_path_present: typeof record.article_path === "string" && record.article_path.length > 0,
      hash_matches_approved_hash: record.article_hash === record.approved_hash,
      quality_evidence_passed: ["complete", "not_applicable"].includes(record.quality_evidence_status),
      preview_passed: record.preview_status === "passed",
      hash_integrity_matched: record.hash_integrity_status === "matched"
    }
  };
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing AG16C input ${name}: ${relativePath}`);
}

const ag16bReview = readJson(inputs.ag16bReview);
const ag16bVisibilitySchema = readJson(inputs.ag16bVisibilitySchema);
const ag16bPublishSchema = readJson(inputs.ag16bPublishSchema);
const ag16bFilterContract = readJson(inputs.ag16bFilterContract);
const ag16bExclusionContract = readJson(inputs.ag16bExclusionContract);
const ag16bValidationPlan = readJson(inputs.ag16bValidationPlan);
const ag16bReadiness = readJson(inputs.ag16bReadiness);
const ag16bBoundary = readJson(inputs.ag16bBoundary);
const ag13zCandidate = readJson(inputs.ag13zCandidate);

if (ag16bReview.status !== "public_visibility_publish_filter_schema_plan_defined") {
  throw new Error("AG16C requires AG16B review.");
}
if (ag16bReadiness.ready_for_ag16c !== true) {
  throw new Error("AG16C requires AG16B readiness.");
}
if (ag16bBoundary.next_stage_id !== "AG16C" || ag16bBoundary.explicit_approval_required !== true) {
  throw new Error("AG16C requires AG16B to AG16C explicit boundary.");
}

const articlePath = ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG16C requires seed candidate article hash to remain unchanged.");
}

const timestamp = nowIso();

const stageControls = {
  public_visibility_filter_schema_dry_run_only: true,
  seed_candidate_public_filter_dry_run_created_in_ag16c: true,
  public_visibility_state_matrix_dry_run_created_in_ag16c: true,
  hypothetical_public_published_shape_dry_run_created_in_ag16c: true,
  dry_run_validation_report_created_in_ag16c: true,
  ag16d_boundary_created_in_ag16c: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag16c: false,
  article_mutation_performed_in_ag16c: false,
  queue_mutation_performed_in_ag16c: false,
  active_admin_review_queue_record_created_in_ag16c: false,
  queue_index_mutation_performed_in_ag16c: false,
  admin_action_execution_performed_in_ag16c: false,
  editor_action_execution_performed_in_ag16c: false,
  real_credential_created_in_ag16c: false,
  hardcoded_password_created_in_repo_in_ag16c: false,
  password_hash_created_in_repo_in_ag16c: false,
  auth_activation_performed_in_ag16c: false,
  backend_activation_performed_in_ag16c: false,
  supabase_activation_performed_in_ag16c: false,
  database_write_performed_in_ag16c: false,
  github_token_created_or_exposed_in_ag16c: false,
  github_write_operation_performed_in_ag16c: false,
  active_action_handler_created_in_ag16c: false,
  api_endpoint_created_in_ag16c: false,
  public_visibility_switch_performed_in_ag16c: false,
  public_index_mutation_performed_in_ag16c: false,
  public_publishing_operation_performed_in_ag16c: false,
  deployment_trigger_performed_in_ag16c: false
};

const seedRecord = {
  article_id: ag13zCandidate.article_id || "enhancing-public-healthcare-delivery-digital-innovation",
  slug: ag13zCandidate.slug || "enhancing-public-healthcare-delivery-digital-innovation",
  title: ag13zCandidate.title || "Enhancing Public Healthcare Delivery through Digital Innovation",
  article_path: articlePath,
  article_hash: currentArticleHash,
  approved_hash: null,
  status: "ready_for_admin_review",
  public_visibility: false,
  publish_approved: false,
  public_index_allowed: false,
  featured_reads_allowed: false,
  admin_decision_status: "pending_admin_review",
  quality_evidence_status: "complete",
  preview_status: "passed",
  hash_integrity_status: "matched",
  publish_execution_status: "not_executed"
};

const seedEvaluation = evaluatePublicFilter(seedRecord);

const seedDryRun = {
  module_id: "AG16C",
  title: "Seed Candidate Public Filter Dry-run",
  status: "seed_candidate_public_filter_dry_run_failed_as_expected",
  dry_run_only: true,
  source_candidate_file: inputs.ag13zCandidate,
  source_validation_plan_file: inputs.ag16bValidationPlan,
  record_under_test: seedRecord,
  expected_public_filter_result: false,
  actual_public_filter_result: seedEvaluation.passed,
  dry_run_passed: seedEvaluation.passed === false,
  evaluation: seedEvaluation,
  created_at: timestamp,
  updated_at: timestamp,
  ...stageControls
};

const stateRecords = [
  {
    label: "internal_generated_fails",
    expected_public_filter_result: false,
    record: { ...seedRecord, status: "internal_generated", quality_evidence_status: "partial", preview_status: "present", approved_hash: null }
  },
  {
    label: "ready_for_admin_review_fails",
    expected_public_filter_result: false,
    record: { ...seedRecord, status: "ready_for_admin_review", approved_hash: null }
  },
  {
    label: "returned_for_correction_fails",
    expected_public_filter_result: false,
    record: { ...seedRecord, status: "returned_for_correction", admin_decision_status: "returned_for_correction", approved_hash: null }
  },
  {
    label: "archived_internal_fails",
    expected_public_filter_result: false,
    record: { ...seedRecord, status: "archived_internal", admin_decision_status: "archived", approved_hash: null }
  },
  {
    label: "publish_approved_pending_exposure_fails",
    expected_public_filter_result: false,
    record: {
      ...seedRecord,
      status: "publish_approved_pending_exposure",
      admin_decision_status: "publish",
      publish_approved: true,
      public_visibility: false,
      public_index_allowed: false,
      featured_reads_allowed: false,
      approved_hash: currentArticleHash
    }
  },
  {
    label: "visibility_without_publish_approval_fails",
    expected_public_filter_result: false,
    record: {
      ...seedRecord,
      status: "public_published",
      public_visibility: true,
      publish_approved: false,
      public_index_allowed: true,
      featured_reads_allowed: true,
      approved_hash: currentArticleHash
    }
  },
  {
    label: "publish_approval_without_public_index_fails",
    expected_public_filter_result: false,
    record: {
      ...seedRecord,
      status: "public_published",
      public_visibility: true,
      publish_approved: true,
      public_index_allowed: false,
      featured_reads_allowed: true,
      approved_hash: currentArticleHash
    }
  },
  {
    label: "hash_mismatch_fails",
    expected_public_filter_result: false,
    record: {
      ...seedRecord,
      status: "public_published",
      public_visibility: true,
      publish_approved: true,
      public_index_allowed: true,
      featured_reads_allowed: true,
      approved_hash: "hash-mismatch"
    }
  },
  {
    label: "public_published_passes",
    expected_public_filter_result: true,
    record: {
      ...seedRecord,
      status: "public_published",
      admin_decision_status: "publish",
      public_visibility: true,
      publish_approved: true,
      public_index_allowed: true,
      featured_reads_allowed: true,
      approved_hash: currentArticleHash
    }
  },
  {
    label: "published_closed_passes",
    expected_public_filter_result: true,
    record: {
      ...seedRecord,
      status: "published_closed",
      admin_decision_status: "publish_and_close",
      public_visibility: true,
      publish_approved: true,
      public_index_allowed: true,
      featured_reads_allowed: true,
      approved_hash: currentArticleHash
    }
  }
];

const stateMatrixRows = stateRecords.map((item) => {
  const evaluation = evaluatePublicFilter(item.record);
  return {
    label: item.label,
    record: item.record,
    expected_public_filter_result: item.expected_public_filter_result,
    actual_public_filter_result: evaluation.passed,
    dry_run_passed: evaluation.passed === item.expected_public_filter_result,
    evaluation
  };
});

const stateMatrixDryRun = {
  module_id: "AG16C",
  title: "Public Visibility State Matrix Dry-run",
  status: "public_visibility_state_matrix_dry_run_passed",
  dry_run_only: true,
  matrix_rows: stateMatrixRows,
  failed_rows: stateMatrixRows.filter((row) => row.dry_run_passed !== true),
  result_summary: {
    total_rows: stateMatrixRows.length,
    passed_rows: stateMatrixRows.filter((row) => row.dry_run_passed === true).length,
    failed_rows: stateMatrixRows.filter((row) => row.dry_run_passed !== true).length
  },
  created_at: timestamp,
  updated_at: timestamp,
  ...stageControls
};

const publicPassRecord = stateRecords.find((item) => item.label === "public_published_passes").record;
const publicPassEvaluation = evaluatePublicFilter(publicPassRecord);

const publicPassShapeDryRun = {
  module_id: "AG16C",
  title: "Hypothetical Public Published Shape Dry-run",
  status: "hypothetical_public_published_shape_dry_run_passed",
  dry_run_only: true,
  record_under_test: publicPassRecord,
  expected_public_filter_result: true,
  actual_public_filter_result: publicPassEvaluation.passed,
  dry_run_passed: publicPassEvaluation.passed === true,
  evaluation: publicPassEvaluation,
  important_note: "This is only a hypothetical dry-run shape. AG16C does not switch visibility, mutate public index or publish.",
  created_at: timestamp,
  updated_at: timestamp,
  ...stageControls
};

const validationChecks = [
  {
    check_id: "AG16C-DRYRUN-001",
    area: "ag16b_dependency",
    status: "passed",
    note: "AG16B schema plan, filter contract, exclusion contract, validation plan and boundary are present."
  },
  {
    check_id: "AG16C-DRYRUN-002",
    area: "seed_hash_integrity",
    status: currentArticleHash === ag13zCandidate.article_hash ? "passed" : "failed",
    note: "Seed candidate article hash must remain unchanged."
  },
  {
    check_id: "AG16C-DRYRUN-003",
    area: "seed_candidate_filter",
    status: seedDryRun.expected_public_filter_result === false && seedDryRun.actual_public_filter_result === false ? "passed" : "failed",
    note: "Seed/pre-publication candidate must fail public filter."
  },
  {
    check_id: "AG16C-DRYRUN-004",
    area: "internal_state_exclusion",
    status: stateMatrixRows.filter((row) => ["internal_generated_fails", "ready_for_admin_review_fails", "returned_for_correction_fails", "archived_internal_fails"].includes(row.label)).every((row) => row.actual_public_filter_result === false) ? "passed" : "failed",
    note: "Internal, review, returned and archived states must fail public filter."
  },
  {
    check_id: "AG16C-DRYRUN-005",
    area: "pending_exposure_exclusion",
    status: stateMatrixRows.find((row) => row.label === "publish_approved_pending_exposure_fails")?.actual_public_filter_result === false ? "passed" : "failed",
    note: "publish_approved_pending_exposure must fail until public_visibility=true and public_index_allowed=true."
  },
  {
    check_id: "AG16C-DRYRUN-006",
    area: "bad_combo_exclusion",
    status: stateMatrixRows.filter((row) => ["visibility_without_publish_approval_fails", "publish_approval_without_public_index_fails", "hash_mismatch_fails"].includes(row.label)).every((row) => row.actual_public_filter_result === false) ? "passed" : "failed",
    note: "Bad combinations must fail public filter."
  },
  {
    check_id: "AG16C-DRYRUN-007",
    area: "public_published_pass",
    status: publicPassShapeDryRun.actual_public_filter_result === true ? "passed" : "failed",
    note: "Hypothetical public_published shape passes only when all required public exposure controls are true."
  },
  {
    check_id: "AG16C-DRYRUN-008",
    area: "published_closed_pass",
    status: stateMatrixRows.find((row) => row.label === "published_closed_passes")?.actual_public_filter_result === true ? "passed" : "failed",
    note: "published_closed shape must pass only under true visibility/approval/index/hash/evidence controls."
  },
  {
    check_id: "AG16C-DRYRUN-009",
    area: "contract_alignment",
    status:
      ag16bFilterContract.include_contract.include_article_only_if_all_true.includes("record.public_visibility === true") &&
      ag16bFilterContract.include_contract.include_article_only_if_all_true.includes("record.publish_approved === true") &&
      ag16bExclusionContract.excluded_states.some((state) => state.status === "archived_internal" && state.public_exposure_allowed === false)
        ? "passed"
        : "failed",
    note: "AG16C dry-run must align with AG16B filter and exclusion contracts."
  },
  {
    check_id: "AG16C-DRYRUN-010",
    area: "forbidden_operations",
    status: "passed",
    note: "AG16C performs dry-run records only and does not mutate public visibility, public index or publishing state."
  }
];

const failedChecks = validationChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG16C dry-run failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const validationReport = {
  module_id: "AG16C",
  title: "Public Visibility Filter Schema Dry-run Validation Report",
  status: "public_visibility_filter_schema_dry_run_validation_passed",
  dry_run_only: true,
  checks: validationChecks,
  failed_checks: failedChecks,
  validation_summary: {
    total_checks: validationChecks.length,
    passed: validationChecks.filter((check) => check.status === "passed").length,
    failed: failedChecks.length
  },
  public_visibility_switch_performed: false,
  public_index_mutation_performed: false,
  publishing_operation_performed: false,
  article_mutation_performed: false,
  ...stageControls
};

const readiness = {
  module_id: "AG16C",
  title: "Public Visibility Filter Schema Dry-run Audit Readiness Record",
  status: "ready_for_ag16d_public_visibility_filter_schema_dry_run_audit",
  ready_for_ag16d: true,
  ag16d_explicit_approval_required: true,
  schema_dry_run_passed: true,
  failed_checks: 0,
  seed_candidate_failed_public_filter_as_expected: true,
  internal_states_failed_public_filter_as_expected: true,
  hypothetical_public_shape_passed_as_expected: true,
  active_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  article_generation_ready: false,
  article_mutation_ready: false,
  queue_mutation_ready: false,
  admin_action_execution_ready: false,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  github_write_ready: false,
  publish_ready: false,
  reason: "AG16C proves the public filter schema through dry-run only. AG16D should audit dry-run records before any public filter implementation scaffold.",
  ...stageControls
};

const boundary = {
  module_id: "AG16C",
  title: "AG16C to AG16D Public Visibility Filter Schema Dry-run Audit Boundary",
  status: "ag16d_boundary_created_not_started",
  next_stage_id: "AG16D",
  next_stage_title: "Public Visibility and Publish Filter Schema Dry-run Audit",
  explicit_approval_required: true,
  ag16d_allowed_scope: [
    "Audit AG16C dry-run records.",
    "Confirm seed/pre-publication candidate fails public filter.",
    "Confirm returned, archived and pending-exposure states fail public filter.",
    "Confirm public_published and published_closed pass only under strict controls.",
    "Confirm no visibility switch, public index mutation or publishing occurred.",
    "Decide readiness for a non-active public filter implementation scaffold."
  ],
  ag16d_blocked_scope: [
    "No new article generation.",
    "No article mutation.",
    "No active queue mutation.",
    "No active Admin Review Queue record creation.",
    "No queue-index mutation.",
    "No Admin/Editor action execution.",
    "No real credentials.",
    "No Auth/backend/Supabase activation.",
    "No GitHub write token wiring.",
    "No public visibility switch.",
    "No public index mutation.",
    "No publishing operation.",
    "No deployment trigger."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG16C",
  title: "Public Visibility Filter Schema Dry-run Schema",
  status: "schema_public_visibility_filter_schema_dry_run_only",
  seed_candidate_dry_run_allowed_in_ag16c: true,
  state_matrix_dry_run_allowed_in_ag16c: true,
  hypothetical_public_shape_dry_run_allowed_in_ag16c: true,
  validation_report_allowed_in_ag16c: true,
  ag16d_boundary_allowed_in_ag16c: true,

  article_generation_allowed_in_ag16c: false,
  article_mutation_allowed_in_ag16c: false,
  queue_mutation_allowed_in_ag16c: false,
  active_admin_review_queue_record_creation_allowed_in_ag16c: false,
  queue_index_mutation_allowed_in_ag16c: false,
  admin_action_execution_allowed_in_ag16c: false,
  editor_action_execution_allowed_in_ag16c: false,
  real_credential_creation_allowed_in_ag16c: false,
  hardcoded_password_allowed_in_ag16c: false,
  password_hash_commit_allowed_in_ag16c: false,
  auth_activation_allowed_in_ag16c: false,
  backend_activation_allowed_in_ag16c: false,
  supabase_activation_allowed_in_ag16c: false,
  database_write_allowed_in_ag16c: false,
  github_token_creation_or_exposure_allowed_in_ag16c: false,
  github_write_operation_allowed_in_ag16c: false,
  active_action_handler_creation_allowed_in_ag16c: false,
  public_visibility_switch_allowed_in_ag16c: false,
  public_index_mutation_allowed_in_ag16c: false,
  public_publishing_operation_allowed_in_ag16c: false,
  deployment_trigger_allowed_in_ag16c: false,
  ...stageControls
};

const review = {
  module_id: "AG16C",
  title: "Public Visibility and Publish Filter Schema Dry-run",
  status: "public_visibility_filter_schema_dry_run_passed",
  depends_on: ["AG16B"],
  generated_from: inputs,
  seed_dry_run_file: "data/content-intelligence/content-pipeline/dry-runs/ag16c-seed-candidate-public-filter-dry-run.json",
  state_matrix_dry_run_file: "data/content-intelligence/content-pipeline/dry-runs/ag16c-public-visibility-state-matrix-dry-run.json",
  public_pass_shape_dry_run_file: "data/content-intelligence/content-pipeline/dry-runs/ag16c-hypothetical-public-published-shape-dry-run.json",
  validation_report_file: "data/content-intelligence/audit-records/ag16c-public-visibility-filter-schema-dry-run-validation-report.json",
  readiness_file: "data/content-intelligence/quality-registry/ag16c-public-visibility-filter-schema-dry-run-audit-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag16c-to-ag16d-public-visibility-filter-schema-dry-run-audit-boundary.json",
  schema_file: "data/content-intelligence/schema/public-visibility-filter-schema-dry-run.schema.json",
  summary: {
    dry_run_passed: true,
    failed_checks: 0,
    seed_candidate_public_filter_result: false,
    public_published_shape_result: true,
    ready_for_ag16d: true,
    publish_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG16C",
  title: "Public Visibility Filter Schema Dry-run Learning",
  status: "learning_record_only",
  learning_points: [
    "The seed/pre-publication candidate correctly fails public filters.",
    "Returned, archived and pending-exposure states remain non-public.",
    "publish_approved alone is insufficient for public exposure.",
    "public_published and published_closed pass only when visibility, approval, index, hash, quality and preview controls all pass.",
    "AG16D should audit the dry-run before any non-active public filter scaffold."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG16C",
  title: "Public Visibility and Publish Filter Schema Dry-run",
  status: "public_visibility_filter_schema_dry_run_passed",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag16c-public-visibility-filter-schema-dry-run.json",
    seed_dry_run: "data/content-intelligence/content-pipeline/dry-runs/ag16c-seed-candidate-public-filter-dry-run.json",
    state_matrix_dry_run: "data/content-intelligence/content-pipeline/dry-runs/ag16c-public-visibility-state-matrix-dry-run.json",
    public_pass_shape_dry_run: "data/content-intelligence/content-pipeline/dry-runs/ag16c-hypothetical-public-published-shape-dry-run.json",
    validation_report: "data/content-intelligence/audit-records/ag16c-public-visibility-filter-schema-dry-run-validation-report.json",
    readiness: "data/content-intelligence/quality-registry/ag16c-public-visibility-filter-schema-dry-run-audit-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag16c-to-ag16d-public-visibility-filter-schema-dry-run-audit-boundary.json",
    schema: "data/content-intelligence/schema/public-visibility-filter-schema-dry-run.schema.json",
    learning: "data/content-intelligence/learning/ag16c-public-visibility-filter-schema-dry-run-learning.json",
    preview: "data/quality/ag16c-public-visibility-filter-schema-dry-run-preview.json",
    document: "docs/quality/AG16C_PUBLIC_VISIBILITY_FILTER_SCHEMA_DRY_RUN.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG16C",
  preview_only: true,
  status: "public_visibility_filter_schema_dry_run_passed",
  seed_candidate_public_filter_result: false,
  public_published_shape_result: true,
  failed_checks: 0,
  ready_for_ag16d: true,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG16C — Public Visibility and Publish Filter Schema Dry-run

## Purpose

AG16C dry-runs the AG16B public visibility and publish-filter schema.

AG16C is dry-run only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, switch public visibility, mutate public indexes or publish anything.

## Dry-run Result

- Seed/pre-publication candidate fails public filter as expected.
- Returned, archived and pending-exposure states fail public filter.
- Hypothetical public_published state passes only when public_visibility=true and publish_approved=true with index, hash, quality and preview controls satisfied.

## Validation Result

Dry-run validation passed with zero failed checks.

## Next Stage

AG16D — Public Visibility and Publish Filter Schema Dry-run Audit — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(seedDryRunPath, seedDryRun);
writeJson(stateMatrixPath, stateMatrixDryRun);
writeJson(publicPassShapePath, publicPassShapeDryRun);
writeJson(validationReportPath, validationReport);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG16C Public Visibility and Publish Filter Schema Dry-run completed.");
console.log("✅ Seed/pre-publication candidate fails public filter as expected.");
console.log("✅ Returned, archived and pending-exposure states fail public filter.");
console.log("✅ Hypothetical public_published shape passes only under strict controls.");
console.log("✅ Dry-run validation passed with zero failed checks.");
console.log("✅ AG16D dry-run audit boundary created.");
console.log("✅ No visibility switch, public index mutation or publishing performed.");
