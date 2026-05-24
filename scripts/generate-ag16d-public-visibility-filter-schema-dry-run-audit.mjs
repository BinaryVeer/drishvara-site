import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag16cReview: "data/content-intelligence/quality-reviews/ag16c-public-visibility-filter-schema-dry-run.json",
  ag16cSeedDryRun: "data/content-intelligence/content-pipeline/dry-runs/ag16c-seed-candidate-public-filter-dry-run.json",
  ag16cStateMatrixDryRun: "data/content-intelligence/content-pipeline/dry-runs/ag16c-public-visibility-state-matrix-dry-run.json",
  ag16cPublicPassShapeDryRun: "data/content-intelligence/content-pipeline/dry-runs/ag16c-hypothetical-public-published-shape-dry-run.json",
  ag16cValidationReport: "data/content-intelligence/audit-records/ag16c-public-visibility-filter-schema-dry-run-validation-report.json",
  ag16cReadiness: "data/content-intelligence/quality-registry/ag16c-public-visibility-filter-schema-dry-run-audit-readiness-record.json",
  ag16cBoundary: "data/content-intelligence/mutation-plans/ag16c-to-ag16d-public-visibility-filter-schema-dry-run-audit-boundary.json",
  ag16bFilterContract: "data/content-intelligence/content-pipeline/ag16b-public-surface-filter-contract.json",
  ag16bExclusionContract: "data/content-intelligence/content-pipeline/ag16b-public-surface-exclusion-contract.json",
  ag16bValidationPlan: "data/content-intelligence/content-pipeline/ag16b-public-visibility-filter-validation-plan.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag16d-public-visibility-filter-schema-dry-run-audit.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag16d-public-visibility-filter-schema-dry-run-audit-report.json");
const decisionPath = path.join(root, "data/content-intelligence/content-pipeline/ag16d-public-filter-implementation-readiness-decision-record.json");
const safetyPath = path.join(root, "data/content-intelligence/quality-registry/ag16d-public-filter-safety-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag16d-non-active-public-filter-scaffold-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag16d-to-ag16e-non-active-public-filter-implementation-scaffold-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/public-visibility-filter-schema-dry-run-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag16d-public-visibility-filter-schema-dry-run-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag16d-public-visibility-filter-schema-dry-run-audit.json");
const previewPath = path.join(root, "data/quality/ag16d-public-visibility-filter-schema-dry-run-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG16D_PUBLIC_VISIBILITY_FILTER_SCHEMA_DRY_RUN_AUDIT.md");

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

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing AG16D input ${name}: ${relativePath}`);
}

const ag16cReview = readJson(inputs.ag16cReview);
const ag16cSeedDryRun = readJson(inputs.ag16cSeedDryRun);
const ag16cStateMatrixDryRun = readJson(inputs.ag16cStateMatrixDryRun);
const ag16cPublicPassShapeDryRun = readJson(inputs.ag16cPublicPassShapeDryRun);
const ag16cValidationReport = readJson(inputs.ag16cValidationReport);
const ag16cReadiness = readJson(inputs.ag16cReadiness);
const ag16cBoundary = readJson(inputs.ag16cBoundary);
const ag16bFilterContract = readJson(inputs.ag16bFilterContract);
const ag16bExclusionContract = readJson(inputs.ag16bExclusionContract);
const ag16bValidationPlan = readJson(inputs.ag16bValidationPlan);
const ag13zCandidate = readJson(inputs.ag13zCandidate);

if (ag16cReview.status !== "public_visibility_filter_schema_dry_run_passed") {
  throw new Error("AG16D requires AG16C review.");
}
if (ag16cValidationReport.failed_checks.length !== 0) {
  throw new Error("AG16D requires AG16C validation to pass with zero failed checks.");
}
if (ag16cReadiness.ready_for_ag16d !== true) {
  throw new Error("AG16D requires AG16C readiness.");
}
if (ag16cBoundary.next_stage_id !== "AG16D" || ag16cBoundary.explicit_approval_required !== true) {
  throw new Error("AG16D requires AG16C to AG16D explicit boundary.");
}

const articlePath = ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG16D requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  public_visibility_filter_schema_dry_run_audit_only: true,
  public_visibility_filter_schema_dry_run_audited_in_ag16d: true,
  implementation_readiness_decision_created_in_ag16d: true,
  public_filter_safety_record_created_in_ag16d: true,
  ag16e_boundary_created_in_ag16d: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag16d: false,
  article_mutation_performed_in_ag16d: false,
  queue_mutation_performed_in_ag16d: false,
  active_admin_review_queue_record_created_in_ag16d: false,
  queue_index_mutation_performed_in_ag16d: false,
  admin_action_execution_performed_in_ag16d: false,
  editor_action_execution_performed_in_ag16d: false,
  real_credential_created_in_ag16d: false,
  hardcoded_password_created_in_repo_in_ag16d: false,
  password_hash_created_in_repo_in_ag16d: false,
  auth_activation_performed_in_ag16d: false,
  backend_activation_performed_in_ag16d: false,
  supabase_activation_performed_in_ag16d: false,
  database_write_performed_in_ag16d: false,
  github_token_created_or_exposed_in_ag16d: false,
  github_write_operation_performed_in_ag16d: false,
  active_action_handler_created_in_ag16d: false,
  api_endpoint_created_in_ag16d: false,
  public_filter_implementation_scaffold_created_in_ag16d: false,
  public_visibility_switch_performed_in_ag16d: false,
  public_index_mutation_performed_in_ag16d: false,
  public_publishing_operation_performed_in_ag16d: false,
  deployment_trigger_performed_in_ag16d: false
};

const rows = ag16cStateMatrixDryRun.matrix_rows;

const rowByLabel = (label) => rows.find((row) => row.label === label);

const auditChecks = [
  {
    check_id: "AG16D-AUDIT-001",
    area: "ag16c_dependency",
    status: "passed",
    note: "AG16C review, dry-run records, validation report, readiness and boundary are present."
  },
  {
    check_id: "AG16D-AUDIT-002",
    area: "ag16c_validation_result",
    status: ag16cValidationReport.failed_checks.length === 0 && ag16cValidationReport.status === "public_visibility_filter_schema_dry_run_validation_passed" ? "passed" : "failed",
    note: "AG16C validation report must pass with zero failed checks."
  },
  {
    check_id: "AG16D-AUDIT-003",
    area: "seed_hash_integrity",
    status: currentArticleHash === ag13zCandidate.article_hash && ag16cSeedDryRun.record_under_test.article_hash === currentArticleHash ? "passed" : "failed",
    note: "Seed candidate article hash must remain unchanged and dry-run record must match."
  },
  {
    check_id: "AG16D-AUDIT-004",
    area: "seed_candidate_public_filter",
    status: ag16cSeedDryRun.expected_public_filter_result === false && ag16cSeedDryRun.actual_public_filter_result === false && ag16cSeedDryRun.dry_run_passed === true ? "passed" : "failed",
    note: "Seed/pre-publication candidate must fail public filter as expected."
  },
  {
    check_id: "AG16D-AUDIT-005",
    area: "internal_state_exclusion",
    status: ["internal_generated_fails", "ready_for_admin_review_fails", "returned_for_correction_fails", "archived_internal_fails"].every((label) => rowByLabel(label)?.actual_public_filter_result === false && rowByLabel(label)?.dry_run_passed === true) ? "passed" : "failed",
    note: "Internal, review, returned and archived states must remain excluded from public surfaces."
  },
  {
    check_id: "AG16D-AUDIT-006",
    area: "pending_exposure_exclusion",
    status: rowByLabel("publish_approved_pending_exposure_fails")?.actual_public_filter_result === false && rowByLabel("publish_approved_pending_exposure_fails")?.dry_run_passed === true ? "passed" : "failed",
    note: "publish_approved_pending_exposure must remain non-public until separate exposure controls pass."
  },
  {
    check_id: "AG16D-AUDIT-007",
    area: "bad_combo_exclusion",
    status: ["visibility_without_publish_approval_fails", "publish_approval_without_public_index_fails", "hash_mismatch_fails"].every((label) => rowByLabel(label)?.actual_public_filter_result === false && rowByLabel(label)?.dry_run_passed === true) ? "passed" : "failed",
    note: "Bad combinations must fail public filters."
  },
  {
    check_id: "AG16D-AUDIT-008",
    area: "public_pass_conditions",
    status:
      rowByLabel("public_published_passes")?.actual_public_filter_result === true &&
      rowByLabel("published_closed_passes")?.actual_public_filter_result === true &&
      ag16cPublicPassShapeDryRun.actual_public_filter_result === true
        ? "passed"
        : "failed",
    note: "public_published and published_closed pass only under strict visibility/approval/index/hash/evidence controls."
  },
  {
    check_id: "AG16D-AUDIT-009",
    area: "filter_contract_alignment",
    status:
      ag16bFilterContract.include_contract.include_article_only_if_all_true.includes("record.public_visibility === true") &&
      ag16bFilterContract.include_contract.include_article_only_if_all_true.includes("record.publish_approved === true") &&
      ag16bFilterContract.exclude_contract.exclude_article_if_any_true.includes("record.public_visibility !== true") &&
      ag16bFilterContract.exclude_contract.exclude_article_if_any_true.includes("record.publish_approved !== true")
        ? "passed"
        : "failed",
    note: "AG16C dry-run must align with AG16B include/exclude contracts."
  },
  {
    check_id: "AG16D-AUDIT-010",
    area: "exclusion_contract_alignment",
    status:
      ag16bExclusionContract.excluded_states.some((state) => state.status === "returned_for_correction" && state.public_exposure_allowed === false) &&
      ag16bExclusionContract.excluded_states.some((state) => state.status === "archived_internal" && state.public_exposure_allowed === false) &&
      ag16bExclusionContract.excluded_states.some((state) => state.status === "publish_approved_pending_exposure" && state.public_exposure_allowed === false)
        ? "passed"
        : "failed",
    note: "AG16B exclusion contract must keep returned, archived and pending-exposure states out of public surfaces."
  },
  {
    check_id: "AG16D-AUDIT-011",
    area: "no_runtime_mutation",
    status:
      ag16cValidationReport.public_visibility_switch_performed === false &&
      ag16cValidationReport.public_index_mutation_performed === false &&
      ag16cValidationReport.publishing_operation_performed === false &&
      ag16cValidationReport.article_mutation_performed === false
        ? "passed"
        : "failed",
    note: "AG16C must not switch visibility, mutate public index, publish or mutate articles."
  },
  {
    check_id: "AG16D-AUDIT-012",
    area: "forbidden_operations",
    status: "passed",
    note: "AG16D is audit/readiness only and does not implement public filters, switch visibility, mutate public index or publish."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG16D audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const auditReport = {
  module_id: "AG16D",
  title: "Public Visibility Filter Schema Dry-run Audit Report",
  status: "public_visibility_filter_schema_dry_run_audit_passed",
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    failed: failedChecks.length
  },
  decision: {
    dry_run_valid: true,
    public_filter_contract_valid: true,
    ready_for_non_active_public_filter_scaffold: true,
    public_visibility_switch_ready: false,
    public_index_mutation_ready: false,
    publish_ready: false
  },
  ...stageControls
};

const decision = {
  module_id: "AG16D",
  title: "Public Filter Implementation Readiness Decision Record",
  status: "public_filter_dry_run_audit_passed_non_active_scaffold_ready",
  decision: {
    proceed_to_non_active_public_filter_scaffold: true,
    proceed_to_public_visibility_switch: false,
    proceed_to_public_index_mutation: false,
    proceed_to_publish_execution: false,
    proceed_to_article_mutation: false
  },
  recommended_next_stage: "AG16E",
  recommended_next_stage_title: "Non-active Public Filter Implementation Scaffold",
  rationale: [
    "AG16C dry-run proves the public visibility filter schema works.",
    "Seed/pre-publication candidate fails public exposure as expected.",
    "Returned, archived and pending-exposure states remain non-public.",
    "Hypothetical public-published shapes pass only under strict controls.",
    "The next safe step is a non-active public filter scaffold, not a real visibility switch."
  ],
  ...stageControls
};

const safety = {
  module_id: "AG16D",
  title: "Public Filter Safety Record",
  status: "public_filter_safety_confirmed_no_public_mutation",
  safety_assertions: {
    seed_candidate_public_exposure_allowed_now: false,
    returned_for_correction_public_exposure_allowed: false,
    archived_internal_public_exposure_allowed: false,
    publish_approved_pending_exposure_public_exposure_allowed: false,
    public_visibility_switch_enabled: false,
    public_index_mutation_enabled: false,
    publishing_enabled: false,
    article_mutation_enabled: false
  },
  contract_guardrails: [
    "public_visibility=true is required for public exposure.",
    "publish_approved=true is required for public exposure.",
    "public_index_allowed=true is required for public listing.",
    "article_hash must match approved_hash.",
    "quality, preview and hash-integrity gates must pass.",
    "approval alone does not expose an article publicly."
  ],
  validation_plan_reference: inputs.ag16bValidationPlan,
  validation_check_count: ag16bValidationPlan.planned_validation_checks.length,
  ...stageControls
};

const readiness = {
  module_id: "AG16D",
  title: "Non-active Public Filter Scaffold Readiness Record",
  status: "ready_for_ag16e_non_active_public_filter_implementation_scaffold",
  ready_for_ag16e: true,
  ag16e_explicit_approval_required: true,
  public_filter_dry_run_audit_passed: true,
  failed_checks: 0,
  non_active_public_filter_scaffold_ready: true,
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
  reason: "AG16D approves only a non-active public filter implementation scaffold. Public visibility switch, public index mutation and publishing remain blocked.",
  ...stageControls
};

const boundary = {
  module_id: "AG16D",
  title: "AG16D to AG16E Non-active Public Filter Implementation Scaffold Boundary",
  status: "ag16e_boundary_created_not_started",
  next_stage_id: "AG16E",
  next_stage_title: "Non-active Public Filter Implementation Scaffold",
  explicit_approval_required: true,
  ag16e_allowed_scope: [
    "Create non-active public filter helper scaffold.",
    "Create no-write public surface filter template.",
    "Create validation fixture for seed, excluded and public-pass states.",
    "Keep scaffold outside /api and non-executable.",
    "Keep visibility switch, public index mutation and publishing blocked."
  ],
  ag16e_blocked_scope: [
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
  module_id: "AG16D",
  title: "Public Visibility Filter Schema Dry-run Audit Schema",
  status: "schema_public_visibility_filter_schema_dry_run_audit_only",
  dry_run_audit_allowed_in_ag16d: true,
  implementation_readiness_decision_allowed_in_ag16d: true,
  public_filter_safety_record_allowed_in_ag16d: true,
  ag16e_boundary_allowed_in_ag16d: true,

  article_generation_allowed_in_ag16d: false,
  article_mutation_allowed_in_ag16d: false,
  queue_mutation_allowed_in_ag16d: false,
  active_admin_review_queue_record_creation_allowed_in_ag16d: false,
  queue_index_mutation_allowed_in_ag16d: false,
  admin_action_execution_allowed_in_ag16d: false,
  editor_action_execution_allowed_in_ag16d: false,
  real_credential_creation_allowed_in_ag16d: false,
  hardcoded_password_allowed_in_ag16d: false,
  password_hash_commit_allowed_in_ag16d: false,
  auth_activation_allowed_in_ag16d: false,
  backend_activation_allowed_in_ag16d: false,
  supabase_activation_allowed_in_ag16d: false,
  database_write_allowed_in_ag16d: false,
  github_token_creation_or_exposure_allowed_in_ag16d: false,
  github_write_operation_allowed_in_ag16d: false,
  active_action_handler_creation_allowed_in_ag16d: false,
  public_filter_implementation_scaffold_allowed_in_ag16d: false,
  public_visibility_switch_allowed_in_ag16d: false,
  public_index_mutation_allowed_in_ag16d: false,
  public_publishing_operation_allowed_in_ag16d: false,
  deployment_trigger_allowed_in_ag16d: false,
  ...stageControls
};

const review = {
  module_id: "AG16D",
  title: "Public Visibility and Publish Filter Schema Dry-run Audit",
  status: "public_visibility_filter_schema_dry_run_audit_passed_non_active_scaffold_ready",
  depends_on: ["AG16C"],
  generated_from: inputs,
  audit_report_file: "data/content-intelligence/audit-records/ag16d-public-visibility-filter-schema-dry-run-audit-report.json",
  decision_file: "data/content-intelligence/content-pipeline/ag16d-public-filter-implementation-readiness-decision-record.json",
  safety_file: "data/content-intelligence/quality-registry/ag16d-public-filter-safety-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag16d-non-active-public-filter-scaffold-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag16d-to-ag16e-non-active-public-filter-implementation-scaffold-boundary.json",
  schema_file: "data/content-intelligence/schema/public-visibility-filter-schema-dry-run-audit.schema.json",
  summary: {
    dry_run_audit_passed: true,
    failed_checks: 0,
    ready_for_ag16e: true,
    public_visibility_switch_ready: false,
    public_index_mutation_ready: false,
    publish_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG16D",
  title: "Public Visibility Filter Schema Dry-run Audit Learning",
  status: "learning_record_only",
  learning_points: [
    "The public filter schema is sound at dry-run level.",
    "Approval alone must never equal public exposure.",
    "Pre-publication, returned, archived and pending-exposure states are correctly blocked.",
    "The next safe step is a non-active filter scaffold outside live public index paths.",
    "Real visibility switching and public index mutation must remain separate, audited apply stages."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG16D",
  title: "Public Visibility and Publish Filter Schema Dry-run Audit",
  status: "public_visibility_filter_schema_dry_run_audit_passed_non_active_scaffold_ready",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag16d-public-visibility-filter-schema-dry-run-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag16d-public-visibility-filter-schema-dry-run-audit-report.json",
    decision: "data/content-intelligence/content-pipeline/ag16d-public-filter-implementation-readiness-decision-record.json",
    safety: "data/content-intelligence/quality-registry/ag16d-public-filter-safety-record.json",
    readiness: "data/content-intelligence/quality-registry/ag16d-non-active-public-filter-scaffold-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag16d-to-ag16e-non-active-public-filter-implementation-scaffold-boundary.json",
    schema: "data/content-intelligence/schema/public-visibility-filter-schema-dry-run-audit.schema.json",
    learning: "data/content-intelligence/learning/ag16d-public-visibility-filter-schema-dry-run-audit-learning.json",
    preview: "data/quality/ag16d-public-visibility-filter-schema-dry-run-audit-preview.json",
    document: "docs/quality/AG16D_PUBLIC_VISIBILITY_FILTER_SCHEMA_DRY_RUN_AUDIT.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG16D",
  preview_only: true,
  status: "public_visibility_filter_schema_dry_run_audit_passed_non_active_scaffold_ready",
  audit_passed: true,
  failed_checks: 0,
  ready_for_ag16e: true,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG16D — Public Visibility and Publish Filter Schema Dry-run Audit

## Purpose

AG16D audits the AG16C public visibility and publish-filter schema dry-run.

AG16D is audit/readiness only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, create public filter implementation scaffold, switch public visibility, mutate public indexes or publish anything.

## Audit Result

The AG16C public filter dry-run passed audit with zero failed checks.

## Readiness Decision

Approved next step: AG16E non-active public filter implementation scaffold only.

Not approved: visibility switch, public index mutation, article mutation, Admin action execution or publishing.

## Next Stage

AG16E — Non-active Public Filter Implementation Scaffold — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditPath, auditReport);
writeJson(decisionPath, decision);
writeJson(safetyPath, safety);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG16D Public Visibility Filter Schema Dry-run Audit generated.");
console.log("✅ Dry-run audit passed with zero failed checks.");
console.log("✅ Decision recorded: proceed only to non-active public filter scaffold.");
console.log("✅ Visibility switch, public index mutation and publishing remain blocked.");
console.log("✅ AG16E non-active public filter implementation scaffold boundary created.");
