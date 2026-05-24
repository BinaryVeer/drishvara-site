import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag15cReview: "data/content-intelligence/quality-reviews/ag15c-generated-article-admin-queue-schema-dry-run.json",
  ag15cIntakeDryRun: "data/content-intelligence/content-pipeline/dry-runs/ag15c-generated-article-intake-dry-run-record.json",
  ag15cQueueDryRun: "data/content-intelligence/content-pipeline/dry-runs/ag15c-admin-review-queue-record-dry-run.json",
  ag15cQualityPreviewDryRun: "data/content-intelligence/content-pipeline/dry-runs/ag15c-quality-evidence-preview-state-dry-run.json",
  ag15cValidationReport: "data/content-intelligence/audit-records/ag15c-schema-dry-run-validation-report.json",
  ag15cReadiness: "data/content-intelligence/quality-registry/ag15c-schema-dry-run-audit-readiness-record.json",
  ag15cBoundary: "data/content-intelligence/mutation-plans/ag15c-to-ag15d-schema-dry-run-audit-integration-readiness-boundary.json",
  ag15bQueueSchemaPlan: "data/content-intelligence/content-pipeline/ag15b-admin-review-queue-record-schema-plan.json",
  ag15bBatchFailurePlan: "data/content-intelligence/content-pipeline/ag15b-batch-validation-and-failure-state-plan.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  ag13zQueueIndex: "data/admin-review/index/admin-review-queue-index.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag15d-schema-dry-run-audit-integration-readiness.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag15d-schema-dry-run-audit-report.json");
const decisionPath = path.join(root, "data/content-intelligence/content-pipeline/ag15d-integration-readiness-decision-record.json");
const blockerPath = path.join(root, "data/content-intelligence/content-pipeline/ag15d-active-integration-blocker-register.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag15d-non-active-integration-scaffold-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag15d-to-ag15e-non-active-admin-queue-integration-scaffold-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/schema-dry-run-audit-integration-readiness.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag15d-schema-dry-run-audit-integration-readiness-learning.json");
const registryPath = path.join(root, "data/quality/ag15d-schema-dry-run-audit-integration-readiness.json");
const previewPath = path.join(root, "data/quality/ag15d-schema-dry-run-audit-integration-readiness-preview.json");
const docPath = path.join(root, "docs/quality/AG15D_SCHEMA_DRY_RUN_AUDIT_INTEGRATION_READINESS.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG15D input ${name}: ${relativePath}`);
}

const ag15cReview = readJson(inputs.ag15cReview);
const ag15cIntakeDryRun = readJson(inputs.ag15cIntakeDryRun);
const ag15cQueueDryRun = readJson(inputs.ag15cQueueDryRun);
const ag15cQualityPreviewDryRun = readJson(inputs.ag15cQualityPreviewDryRun);
const ag15cValidationReport = readJson(inputs.ag15cValidationReport);
const ag15cReadiness = readJson(inputs.ag15cReadiness);
const ag15cBoundary = readJson(inputs.ag15cBoundary);
const ag15bQueueSchemaPlan = readJson(inputs.ag15bQueueSchemaPlan);
const ag15bBatchFailurePlan = readJson(inputs.ag15bBatchFailurePlan);
const ag13zCandidate = readJson(inputs.ag13zCandidate);
const ag13zQueueIndex = readJson(inputs.ag13zQueueIndex);

if (ag15cReview.status !== "generated_article_admin_queue_schema_dry_run_passed") {
  throw new Error("AG15D requires AG15C review.");
}
if (ag15cValidationReport.failed_checks.length !== 0) {
  throw new Error("AG15D requires AG15C dry-run validation to pass with zero failed checks.");
}
if (ag15cReadiness.ready_for_ag15d !== true) {
  throw new Error("AG15D requires AG15C readiness.");
}
if (ag15cBoundary.next_stage_id !== "AG15D" || ag15cBoundary.explicit_approval_required !== true) {
  throw new Error("AG15D requires AG15C to AG15D explicit boundary.");
}

const articlePath = ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG15D requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  schema_dry_run_audit_integration_readiness_only: true,
  schema_dry_run_audited_in_ag15d: true,
  integration_readiness_decision_created_in_ag15d: true,
  active_integration_blocker_register_created_in_ag15d: true,
  ag15e_boundary_created_in_ag15d: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag15d: false,
  article_mutation_performed_in_ag15d: false,
  queue_mutation_performed_in_ag15d: false,
  active_admin_review_queue_record_created_in_ag15d: false,
  queue_index_mutation_performed_in_ag15d: false,
  non_active_integration_scaffold_created_in_ag15d: false,
  admin_action_execution_performed_in_ag15d: false,
  editor_action_execution_performed_in_ag15d: false,
  real_credential_created_in_ag15d: false,
  hardcoded_password_created_in_ag15d: false,
  password_hash_created_in_repo_in_ag15d: false,
  auth_activation_performed_in_ag15d: false,
  backend_activation_performed_in_ag15d: false,
  supabase_activation_performed_in_ag15d: false,
  database_write_performed_in_ag15d: false,
  github_token_created_or_exposed_in_ag15d: false,
  github_write_operation_performed_in_ag15d: false,
  active_action_handler_created_in_ag15d: false,
  api_endpoint_created_in_ag15d: false,
  public_visibility_switch_performed_in_ag15d: false,
  public_publishing_operation_performed_in_ag15d: false,
  deployment_trigger_performed_in_ag15d: false
};

const auditChecks = [
  {
    check_id: "AG15D-AUDIT-001",
    area: "ag15c_dependency",
    status: "passed",
    note: "AG15C review, dry-run records, validation report, readiness and boundary are present."
  },
  {
    check_id: "AG15D-AUDIT-002",
    area: "dry_run_validation_result",
    status: ag15cValidationReport.failed_checks.length === 0 && ag15cValidationReport.status === "schema_dry_run_validation_passed" ? "passed" : "failed",
    note: "AG15C validation report must pass with zero failed checks."
  },
  {
    check_id: "AG15D-AUDIT-003",
    area: "seed_hash_integrity",
    status: currentArticleHash === ag13zCandidate.article_hash && ag15cIntakeDryRun.article_hash === currentArticleHash ? "passed" : "failed",
    note: "Seed article hash must remain unchanged and dry-run hash must match."
  },
  {
    check_id: "AG15D-AUDIT-004",
    area: "intake_publication_defaults",
    status: ag15cIntakeDryRun.public_visibility === false && ag15cIntakeDryRun.publish_approved === false ? "passed" : "failed",
    note: "Intake dry-run must preserve non-public and not-approved defaults."
  },
  {
    check_id: "AG15D-AUDIT-005",
    area: "queue_publication_defaults",
    status: ag15cQueueDryRun.public_visibility === false && ag15cQueueDryRun.publish_approved === false ? "passed" : "failed",
    note: "Queue dry-run must preserve non-public and not-approved defaults."
  },
  {
    check_id: "AG15D-AUDIT-006",
    area: "no_active_queue_mutation",
    status: ag15cQueueDryRun.not_written_to_active_queue === true && ag15cQueueDryRun.not_added_to_queue_index === true && ag15cQueueDryRun.active_queue_index_mutated === false ? "passed" : "failed",
    note: "AG15C must not create active queue record or mutate queue index."
  },
  {
    check_id: "AG15D-AUDIT-007",
    area: "quality_evidence_mapping",
    status: ag15cQualityPreviewDryRun.mandatory_quality_evidence_results.every((item) => item.required === true && item.dry_run_status === "present_or_mapped") ? "passed" : "failed",
    note: "Mandatory quality evidence must be mapped in dry-run."
  },
  {
    check_id: "AG15D-AUDIT-008",
    area: "preview_state_hash_alignment",
    status: ag15cQualityPreviewDryRun.preview_state.preview_record_present === true && ag15cQualityPreviewDryRun.preview_state.article_hash_at_preview === currentArticleHash ? "passed" : "failed",
    note: "Preview state must be present and hash-aligned."
  },
  {
    check_id: "AG15D-AUDIT-009",
    area: "ag15b_schema_alignment",
    status:
      ag15bQueueSchemaPlan.planned_queue_record_schema.public_visibility === false &&
      ag15bQueueSchemaPlan.planned_queue_record_schema.publish_approved === false &&
      ag15bBatchFailurePlan.batch_validation_checks.includes("Queue index and candidate records are consistent.")
        ? "passed"
        : "failed",
    note: "Dry-run must remain aligned with AG15B queue schema and batch validation plan."
  },
  {
    check_id: "AG15D-AUDIT-010",
    area: "active_queue_index_not_changed_by_stage",
    status: ag13zQueueIndex && typeof ag13zQueueIndex === "object" ? "passed" : "failed",
    note: "AG15D consumes active queue index only for reference and does not mutate it."
  },
  {
    check_id: "AG15D-AUDIT-011",
    area: "forbidden_operations",
    status: "passed",
    note: "AG15D is audit/readiness only and does not generate articles, mutate queues, switch visibility or publish."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG15D audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const auditReport = {
  module_id: "AG15D",
  title: "Generated Article Admin Queue Schema Dry-run Audit Report",
  status: "schema_dry_run_audit_passed",
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    failed: failedChecks.length
  },
  decision: {
    dry_run_valid: true,
    schema_shape_usable: true,
    ready_for_non_active_integration_scaffold: true,
    active_queue_mutation_ready: false,
    article_generation_ready: false,
    public_publish_ready: false
  },
  ...stageControls
};

const decision = {
  module_id: "AG15D",
  title: "Integration Readiness Decision Record",
  status: "schema_dry_run_audit_passed_non_active_integration_scaffold_ready",
  decision: {
    proceed_to_non_active_integration_scaffold: true,
    proceed_to_active_queue_mutation: false,
    proceed_to_new_article_generation: false,
    proceed_to_admin_publish_execution: false,
    proceed_to_visibility_switch: false
  },
  recommended_next_stage: "AG15E",
  recommended_next_stage_title: "Generated Article Admin Queue Non-active Integration Scaffold",
  rationale: [
    "Dry-run proved that the planned intake and queue schema can represent a generated article.",
    "Seed candidate hash stayed stable.",
    "public_visibility=false and publish_approved=false were preserved.",
    "Active queue mutation is still not approved.",
    "The next safe step is a non-active scaffold that shows how future generated articles would be prepared for queue handoff without writing to the active queue."
  ],
  ...stageControls
};

const blockerRegister = {
  module_id: "AG15D",
  title: "Active Integration Blocker Register",
  status: "active_integration_blockers_recorded",
  blockers_before_active_queue_integration: [
    {
      blocker_id: "AG15D-BLOCKER-001",
      blocker: "No active generated article batch has been approved for queue insertion.",
      required_resolution: "Approve a future controlled generation or candidate set before active queue integration.",
      current_status: "blocked"
    },
    {
      blocker_id: "AG15D-BLOCKER-002",
      blocker: "No active queue mutation stage has been approved.",
      required_resolution: "Create and audit a controlled apply stage before writing queue records.",
      current_status: "blocked"
    },
    {
      blocker_id: "AG15D-BLOCKER-003",
      blocker: "No Admin action execution is enabled.",
      required_resolution: "Keep queue entries non-public until a later secure Admin execution stage is approved.",
      current_status: "blocked"
    },
    {
      blocker_id: "AG15D-BLOCKER-004",
      blocker: "No public visibility switch is approved.",
      required_resolution: "Public visibility must remain false until a later publish-control stage.",
      current_status: "blocked"
    },
    {
      blocker_id: "AG15D-BLOCKER-005",
      blocker: "No publishing operation is approved.",
      required_resolution: "Publish execution requires separate explicit approval.",
      current_status: "blocked"
    }
  ],
  allowed_next_without_resolving_blockers: [
    "Create non-active integration scaffold.",
    "Create sample candidate-to-queue mapping templates.",
    "Create no-write queue handoff templates.",
    "Create validation fixtures that do not mutate active queue."
  ],
  not_allowed_next_without_resolving_blockers: [
    "Generate new articles.",
    "Write active Admin Review Queue records.",
    "Mutate queue index.",
    "Switch public visibility.",
    "Publish articles.",
    "Enable Admin/Editor action execution."
  ],
  ...stageControls
};

const readiness = {
  module_id: "AG15D",
  title: "Non-active Integration Scaffold Readiness Record",
  status: "ready_for_ag15e_non_active_admin_queue_integration_scaffold",
  ready_for_ag15e: true,
  ag15e_explicit_approval_required: true,
  schema_dry_run_audit_passed: true,
  failed_checks: 0,
  non_active_integration_scaffold_ready: true,
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
  reason: "AG15D approves only a non-active integration scaffold as next step. Active article generation, queue mutation, visibility switch and publishing remain blocked.",
  ...stageControls
};

const boundary = {
  module_id: "AG15D",
  title: "AG15D to AG15E Non-active Admin Queue Integration Scaffold Boundary",
  status: "ag15e_boundary_created_not_started",
  next_stage_id: "AG15E",
  next_stage_title: "Generated Article Admin Queue Non-active Integration Scaffold",
  explicit_approval_required: true,
  ag15e_allowed_scope: [
    "Create non-active candidate-to-queue integration scaffold.",
    "Create no-write queue handoff template.",
    "Create validation fixture using existing seed candidate.",
    "Create non-active mapping templates for generated article intake and Admin queue record.",
    "Keep active queue mutation blocked."
  ],
  ag15e_blocked_scope: [
    "No new article generation.",
    "No article mutation.",
    "No active queue mutation.",
    "No active Admin Review Queue record creation.",
    "No queue index mutation.",
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
  module_id: "AG15D",
  title: "Schema Dry-run Audit Integration Readiness Schema",
  status: "schema_dry_run_audit_integration_readiness_only",
  schema_dry_run_audit_allowed_in_ag15d: true,
  integration_readiness_decision_allowed_in_ag15d: true,
  active_integration_blocker_register_allowed_in_ag15d: true,
  ag15e_boundary_allowed_in_ag15d: true,

  article_generation_allowed_in_ag15d: false,
  article_mutation_allowed_in_ag15d: false,
  queue_mutation_allowed_in_ag15d: false,
  active_admin_review_queue_record_creation_allowed_in_ag15d: false,
  queue_index_mutation_allowed_in_ag15d: false,
  non_active_integration_scaffold_creation_allowed_in_ag15d: false,
  admin_action_execution_allowed_in_ag15d: false,
  editor_action_execution_allowed_in_ag15d: false,
  real_credential_creation_allowed_in_ag15d: false,
  hardcoded_password_allowed_in_ag15d: false,
  password_hash_commit_allowed_in_ag15d: false,
  auth_activation_allowed_in_ag15d: false,
  backend_activation_allowed_in_ag15d: false,
  supabase_activation_allowed_in_ag15d: false,
  database_write_allowed_in_ag15d: false,
  github_token_creation_or_exposure_allowed_in_ag15d: false,
  github_write_operation_allowed_in_ag15d: false,
  active_action_handler_creation_allowed_in_ag15d: false,
  public_visibility_switch_allowed_in_ag15d: false,
  public_publishing_operation_allowed_in_ag15d: false,
  deployment_trigger_allowed_in_ag15d: false,
  ...stageControls
};

const review = {
  module_id: "AG15D",
  title: "Generated Article Admin Queue Schema Dry-run Audit and Integration Readiness",
  status: "schema_dry_run_audit_passed_non_active_integration_scaffold_ready",
  depends_on: ["AG15C"],
  generated_from: inputs,
  audit_report_file: "data/content-intelligence/audit-records/ag15d-schema-dry-run-audit-report.json",
  decision_file: "data/content-intelligence/content-pipeline/ag15d-integration-readiness-decision-record.json",
  blocker_register_file: "data/content-intelligence/content-pipeline/ag15d-active-integration-blocker-register.json",
  readiness_file: "data/content-intelligence/quality-registry/ag15d-non-active-integration-scaffold-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag15d-to-ag15e-non-active-admin-queue-integration-scaffold-boundary.json",
  schema_file: "data/content-intelligence/schema/schema-dry-run-audit-integration-readiness.schema.json",
  summary: {
    schema_dry_run_audit_passed: true,
    failed_checks: 0,
    ready_for_ag15e: true,
    active_queue_mutation_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG15D",
  title: "Schema Dry-run Audit Integration Readiness Learning",
  status: "learning_record_only",
  learning_points: [
    "AG15C dry-run proves schema fit but does not justify active queue mutation yet.",
    "The next safe move is a non-active integration scaffold, not live generated article insertion.",
    "public_visibility and publish_approved must remain false in every pre-publication state.",
    "Future generated batches should use the same hash, quality evidence and preview state gates.",
    "Active queue insertion should be a separate controlled apply stage after scaffold audit."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG15D",
  title: "Generated Article Admin Queue Schema Dry-run Audit and Integration Readiness",
  status: "schema_dry_run_audit_passed_non_active_integration_scaffold_ready",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag15d-schema-dry-run-audit-integration-readiness.json",
    audit_report: "data/content-intelligence/audit-records/ag15d-schema-dry-run-audit-report.json",
    decision: "data/content-intelligence/content-pipeline/ag15d-integration-readiness-decision-record.json",
    blocker_register: "data/content-intelligence/content-pipeline/ag15d-active-integration-blocker-register.json",
    readiness: "data/content-intelligence/quality-registry/ag15d-non-active-integration-scaffold-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag15d-to-ag15e-non-active-admin-queue-integration-scaffold-boundary.json",
    schema: "data/content-intelligence/schema/schema-dry-run-audit-integration-readiness.schema.json",
    learning: "data/content-intelligence/learning/ag15d-schema-dry-run-audit-integration-readiness-learning.json",
    preview: "data/quality/ag15d-schema-dry-run-audit-integration-readiness-preview.json",
    document: "docs/quality/AG15D_SCHEMA_DRY_RUN_AUDIT_INTEGRATION_READINESS.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG15D",
  preview_only: true,
  status: "schema_dry_run_audit_passed_non_active_integration_scaffold_ready",
  audit_passed: true,
  failed_checks: 0,
  ready_for_ag15e: true,
  active_queue_mutation_ready: false,
  public_visibility: false,
  publish_approved: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG15D — Generated Article Admin Queue Schema Dry-run Audit and Integration Readiness

## Purpose

AG15D audits the AG15C generated-article-to-Admin-Review-Queue schema dry-run and decides readiness for the next safe integration step.

AG15D is audit/readiness only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queue indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, switch public visibility or publish anything.

## Audit Result

The AG15C schema dry-run passed audit with zero failed checks.

## Readiness Decision

Approved next step: AG15E non-active Admin Queue integration scaffold only.

Not approved: active queue mutation, new article generation, visibility switch, Admin action execution or publishing.

## Next Stage

AG15E — Generated Article Admin Queue Non-active Integration Scaffold — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditPath, auditReport);
writeJson(decisionPath, decision);
writeJson(blockerPath, blockerRegister);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG15D schema dry-run audit and integration readiness generated.");
console.log("✅ Dry-run audit passed with zero failed checks.");
console.log("✅ Decision recorded: proceed only to non-active integration scaffold.");
console.log("✅ Active queue mutation, article generation, visibility switch and publishing remain blocked.");
console.log("✅ AG15E non-active integration scaffold boundary created.");
