import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag15dReview: "data/content-intelligence/quality-reviews/ag15d-schema-dry-run-audit-integration-readiness.json",
  ag15dAudit: "data/content-intelligence/audit-records/ag15d-schema-dry-run-audit-report.json",
  ag15dDecision: "data/content-intelligence/content-pipeline/ag15d-integration-readiness-decision-record.json",
  ag15dBlockers: "data/content-intelligence/content-pipeline/ag15d-active-integration-blocker-register.json",
  ag15dReadiness: "data/content-intelligence/quality-registry/ag15d-non-active-integration-scaffold-readiness-record.json",
  ag15dBoundary: "data/content-intelligence/mutation-plans/ag15d-to-ag15e-non-active-admin-queue-integration-scaffold-boundary.json",
  ag15cIntakeDryRun: "data/content-intelligence/content-pipeline/dry-runs/ag15c-generated-article-intake-dry-run-record.json",
  ag15cQueueDryRun: "data/content-intelligence/content-pipeline/dry-runs/ag15c-admin-review-queue-record-dry-run.json",
  ag15cQualityPreviewDryRun: "data/content-intelligence/content-pipeline/dry-runs/ag15c-quality-evidence-preview-state-dry-run.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  ag13zQueueIndex: "data/admin-review/index/admin-review-queue-index.json"
};

const scaffoldDir = "internal-scaffolds/ag15e-generated-article-admin-queue-non-active";
const scaffoldMapper = `${scaffoldDir}/candidate-to-admin-queue.non-active.mjs`;
const intakeTemplate = `${scaffoldDir}/generated-article-intake.template.json`;
const queueTemplate = `${scaffoldDir}/admin-review-queue-record.template.json`;
const fixtureFile = `${scaffoldDir}/validation-fixture.seed-candidate.json`;
const scaffoldReadme = `${scaffoldDir}/README.md`;

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag15e-non-active-admin-queue-integration-scaffold.json");
const applyPath = path.join(root, "data/content-intelligence/apply-records/ag15e-non-active-admin-queue-integration-scaffold-apply.json");
const inventoryPath = path.join(root, "data/content-intelligence/content-pipeline/ag15e-non-active-integration-scaffold-inventory.json");
const mappingRecordPath = path.join(root, "data/content-intelligence/content-pipeline/ag15e-candidate-to-queue-mapping-template-record.json");
const guardPath = path.join(root, "data/content-intelligence/quality-registry/ag15e-non-active-integration-guard-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag15e-non-active-integration-scaffold-audit-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag15e-to-ag15f-non-active-integration-scaffold-audit-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/non-active-admin-queue-integration-scaffold.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag15e-non-active-admin-queue-integration-scaffold-learning.json");
const registryPath = path.join(root, "data/quality/ag15e-non-active-admin-queue-integration-scaffold.json");
const previewPath = path.join(root, "data/quality/ag15e-non-active-admin-queue-integration-scaffold-preview.json");
const docPath = path.join(root, "docs/quality/AG15E_NON_ACTIVE_ADMIN_QUEUE_INTEGRATION_SCAFFOLD.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG15E input ${name}: ${relativePath}`);
}

const ag15dReview = readJson(inputs.ag15dReview);
const ag15dAudit = readJson(inputs.ag15dAudit);
const ag15dDecision = readJson(inputs.ag15dDecision);
const ag15dReadiness = readJson(inputs.ag15dReadiness);
const ag15dBoundary = readJson(inputs.ag15dBoundary);
const ag15cIntakeDryRun = readJson(inputs.ag15cIntakeDryRun);
const ag15cQueueDryRun = readJson(inputs.ag15cQueueDryRun);
const ag15cQualityPreviewDryRun = readJson(inputs.ag15cQualityPreviewDryRun);
const ag13zCandidate = readJson(inputs.ag13zCandidate);

if (ag15dReview.status !== "schema_dry_run_audit_passed_non_active_integration_scaffold_ready") {
  throw new Error("AG15E requires AG15D review readiness.");
}
if (ag15dAudit.failed_checks.length !== 0) {
  throw new Error("AG15E requires AG15D audit to pass with zero failed checks.");
}
if (ag15dDecision.decision.proceed_to_non_active_integration_scaffold !== true) {
  throw new Error("AG15E requires AG15D decision to proceed only to non-active integration scaffold.");
}
if (ag15dDecision.decision.proceed_to_active_queue_mutation !== false) {
  throw new Error("AG15E requires active queue mutation to remain blocked.");
}
if (ag15dReadiness.ready_for_ag15e !== true) {
  throw new Error("AG15E requires AG15D readiness.");
}
if (ag15dBoundary.next_stage_id !== "AG15E" || ag15dBoundary.explicit_approval_required !== true) {
  throw new Error("AG15E requires AG15D to AG15E explicit boundary.");
}

const articlePath = ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG15E requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  non_active_admin_queue_integration_scaffold_only: true,
  scaffold_files_created_in_ag15e: true,
  candidate_to_queue_mapping_template_created_in_ag15e: true,
  no_write_queue_handoff_template_created_in_ag15e: true,
  validation_fixture_created_in_ag15e: true,
  guard_record_created_in_ag15e: true,
  ag15f_boundary_created_in_ag15e: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag15e: false,
  article_mutation_performed_in_ag15e: false,
  queue_mutation_performed_in_ag15e: false,
  active_admin_review_queue_record_created_in_ag15e: false,
  queue_index_mutation_performed_in_ag15e: false,
  admin_action_execution_performed_in_ag15e: false,
  editor_action_execution_performed_in_ag15e: false,
  real_credential_created_in_ag15e: false,
  hardcoded_password_created_in_ag15e: false,
  password_hash_created_in_repo_in_ag15e: false,
  auth_activation_performed_in_ag15e: false,
  backend_activation_performed_in_ag15e: false,
  supabase_activation_performed_in_ag15e: false,
  database_write_performed_in_ag15e: false,
  github_token_created_or_exposed_in_ag15e: false,
  github_write_operation_performed_in_ag15e: false,
  active_action_handler_created_in_ag15e: false,
  api_endpoint_created_in_ag15e: false,
  public_visibility_switch_performed_in_ag15e: false,
  public_publishing_operation_performed_in_ag15e: false,
  deployment_trigger_performed_in_ag15e: false
};

const mapperCode = `// AG15E — Generated Article Admin Queue Non-active Integration Scaffold
// This file is intentionally outside /api and is not a live endpoint.
// It must not write files, mutate queues, publish articles, trigger deployment,
// access secrets, use network services, activate Auth, or execute Admin/Editor actions.

export const AG15E_NON_ACTIVE_INTEGRATION = Object.freeze({
  module_id: "AG15E",
  status: "NON_ACTIVE_INTEGRATION_SCAFFOLD_ONLY",
  integration_execution_enabled: false,
  active_queue_write_enabled: false,
  queue_index_write_enabled: false,
  article_mutation_enabled: false,
  public_visibility_switch_enabled: false,
  publish_enabled: false,
  admin_action_execution_enabled: false
});

export function mapCandidateToQueueRecordNonActive(candidate) {
  const source = candidate && typeof candidate === "object" ? candidate : {};

  return Object.freeze({
    ok: false,
    blocked: true,
    module_id: "AG15E",
    status: "NON_ACTIVE_INTEGRATION_SCAFFOLD_ONLY",
    reason: "This scaffold maps shape only and never writes to the active Admin Review Queue.",
    dry_run_only: true,
    article_id: source.article_id || null,
    slug: source.slug || null,
    title: source.title || null,
    category: source.category || null,
    article_path: source.selected_article_path || source.article_path || null,
    article_hash: source.article_hash || null,
    queue_status: "ready_for_admin_review",
    public_visibility: false,
    publish_approved: false,
    admin_decision_status: "pending_admin_review",
    active_queue_write_enabled: false,
    queue_index_write_enabled: false,
    public_visibility_switch_enabled: false,
    publish_enabled: false
  });
}

export function validateNonActiveQueueHandoffScaffold(record) {
  return Object.freeze({
    ok: false,
    blocked: true,
    module_id: "AG15E",
    status: "NON_ACTIVE_VALIDATION_ONLY",
    reason: "Validation scaffold is non-active and cannot create or mutate queue records.",
    public_visibility_is_false: record?.public_visibility === false,
    publish_approved_is_false: record?.publish_approved === false,
    active_queue_write_enabled: false,
    queue_index_write_enabled: false
  });
}
`;

const intakeTemplateJson = {
  module_id: "AG15E",
  title: "Generated Article Intake Template",
  status: "non_active_template_only",
  dry_run_only: true,
  template_type: "generated_article_intake",
  required_fields: [
    "article_id",
    "slug",
    "title",
    "category",
    "content_type",
    "generation_batch_id",
    "generation_stage_id",
    "article_path",
    "article_hash",
    "source_trace_record",
    "quality_evidence_record",
    "preview_record",
    "object_profile",
    "reference_profile",
    "credit_profile",
    "layout_profile",
    "queue_target",
    "public_visibility",
    "publish_approved",
    "status"
  ],
  default_values: {
    queue_target: "admin_review_queue",
    public_visibility: false,
    publish_approved: false,
    status: "generated_pending_quality_evidence"
  },
  active_queue_write_enabled: false
};

const queueTemplateJson = {
  module_id: "AG15E",
  title: "Admin Review Queue Record Template",
  status: "non_active_template_only",
  dry_run_only: true,
  template_type: "admin_review_queue_record",
  required_fields: [
    "article_id",
    "slug",
    "title",
    "category",
    "article_path",
    "article_hash",
    "generation_batch_id",
    "queue_status",
    "public_visibility",
    "publish_approved",
    "admin_decision_status",
    "editor_task_status",
    "quality_evidence",
    "risk_flags",
    "created_at",
    "updated_at",
    "audit_pointer"
  ],
  default_values: {
    queue_status: "ready_for_admin_review",
    public_visibility: false,
    publish_approved: false,
    admin_decision_status: "pending_admin_review",
    editor_task_status: "none",
    audit_pointer: null
  },
  active_queue_write_enabled: false,
  queue_index_write_enabled: false
};

const fixtureJson = {
  module_id: "AG15E",
  title: "Seed Candidate Validation Fixture",
  status: "non_active_fixture_only",
  dry_run_only: true,
  source_candidate_file: inputs.ag13zCandidate,
  source_intake_dry_run_file: inputs.ag15cIntakeDryRun,
  source_queue_dry_run_file: inputs.ag15cQueueDryRun,
  source_quality_preview_dry_run_file: inputs.ag15cQualityPreviewDryRun,
  seed_candidate: {
    article_id: ag15cIntakeDryRun.article_id,
    slug: ag15cIntakeDryRun.slug,
    title: ag15cIntakeDryRun.title,
    category: ag15cIntakeDryRun.category,
    article_path: ag15cIntakeDryRun.article_path,
    article_hash: ag15cIntakeDryRun.article_hash,
    public_visibility: false,
    publish_approved: false
  },
  mapped_queue_shape: {
    article_id: ag15cQueueDryRun.article_id,
    slug: ag15cQueueDryRun.slug,
    title: ag15cQueueDryRun.title,
    category: ag15cQueueDryRun.category,
    article_path: ag15cQueueDryRun.article_path,
    article_hash: ag15cQueueDryRun.article_hash,
    queue_status: "ready_for_admin_review",
    public_visibility: false,
    publish_approved: false,
    admin_decision_status: "pending_admin_review",
    active_queue_index_mutated: false
  },
  quality_preview_shape: {
    preview_record_present: ag15cQualityPreviewDryRun.preview_state.preview_record_present,
    article_hash_at_preview: ag15cQualityPreviewDryRun.preview_state.article_hash_at_preview,
    public_visibility: false,
    publish_approved: false
  },
  active_queue_write_enabled: false,
  queue_index_write_enabled: false
};

const readmeText = `# AG15E — Generated Article Admin Queue Non-active Integration Scaffold

This scaffold is intentionally non-active.

It provides mapping templates and validation fixtures for future generated article to Admin Review Queue handoff, but it does not write to the active Admin Review Queue, mutate the queue index, generate articles, switch visibility, or publish anything.

## Files

- candidate-to-admin-queue.non-active.mjs
- generated-article-intake.template.json
- admin-review-queue-record.template.json
- validation-fixture.seed-candidate.json

## Hard Boundary

No article generation, article mutation, active queue mutation, queue-index mutation, Admin/Editor action execution, Auth/backend activation, external service activation, GitHub write, visibility switch, deployment trigger or publishing is performed.
`;

writeText(path.join(root, scaffoldMapper), mapperCode);
writeJson(path.join(root, intakeTemplate), intakeTemplateJson);
writeJson(path.join(root, queueTemplate), queueTemplateJson);
writeJson(path.join(root, fixtureFile), fixtureJson);
writeText(path.join(root, scaffoldReadme), readmeText);

const scaffoldFiles = [scaffoldMapper, intakeTemplate, queueTemplate, fixtureFile, scaffoldReadme];

const fileRecords = scaffoldFiles.map((file) => {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  return {
    file,
    hash: sha256(text),
    active_queue_write_enabled: false,
    queue_index_write_enabled: false,
    deployable_api_route: false
  };
});

const inventory = {
  module_id: "AG15E",
  title: "Non-active Integration Scaffold Inventory",
  status: "non_active_integration_scaffold_files_created",
  scaffold_directory: scaffoldDir,
  files: fileRecords,
  handler_file_intentionally_outside_api: true,
  no_active_endpoint_created: true,
  no_active_queue_record_created: true,
  no_queue_index_mutation_performed: true,
  ...stageControls
};

const mappingRecord = {
  module_id: "AG15E",
  title: "Candidate to Queue Mapping Template Record",
  status: "candidate_to_queue_mapping_template_created_non_active",
  dry_run_only: true,
  mapper_file: scaffoldMapper,
  intake_template_file: intakeTemplate,
  queue_template_file: queueTemplate,
  fixture_file: fixtureFile,
  mapping_contract: {
    source: "generated_article_candidate_or_intake_record",
    target: "admin_review_queue_record_shape",
    active_write_allowed: false,
    public_visibility_default: false,
    publish_approved_default: false
  },
  field_mapping: [
    ["article_id", "article_id"],
    ["slug", "slug"],
    ["title", "title"],
    ["category", "category"],
    ["article_path", "article_path"],
    ["article_hash", "article_hash"],
    ["quality_evidence", "quality_evidence"],
    ["public_visibility", false],
    ["publish_approved", false],
    ["admin_decision_status", "pending_admin_review"]
  ],
  ...stageControls
};

const guard = {
  module_id: "AG15E",
  title: "Non-active Integration Guard Record",
  status: "non_active_integration_guards_confirmed",
  guard_assertions: {
    integration_execution_enabled: false,
    active_queue_write_enabled: false,
    queue_index_write_enabled: false,
    article_mutation_enabled: false,
    public_visibility_switch_enabled: false,
    publish_enabled: false,
    admin_action_execution_enabled: false
  },
  prohibited_runtime_behaviour: [
    "No active Admin Review Queue record creation.",
    "No queue-index mutation.",
    "No article generation.",
    "No article mutation.",
    "No Admin/Editor action execution.",
    "No public visibility switch.",
    "No publishing operation.",
    "No deployment trigger.",
    "No secret access.",
    "No network write service."
  ],
  ...stageControls
};

const apply = {
  module_id: "AG15E",
  title: "Generated Article Admin Queue Non-active Integration Scaffold Apply Record",
  status: "non_active_integration_scaffold_created_pending_audit",
  created_files: scaffoldFiles,
  scaffold_inventory_file: "data/content-intelligence/content-pipeline/ag15e-non-active-integration-scaffold-inventory.json",
  mapping_record_file: "data/content-intelligence/content-pipeline/ag15e-candidate-to-queue-mapping-template-record.json",
  guard_record_file: "data/content-intelligence/quality-registry/ag15e-non-active-integration-guard-record.json",
  ...stageControls
};

const readiness = {
  module_id: "AG15E",
  title: "Non-active Integration Scaffold Audit Readiness Record",
  status: "ready_for_ag15f_non_active_integration_scaffold_audit",
  ready_for_ag15f: true,
  ag15f_explicit_approval_required: true,
  non_active_scaffold_created: true,
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
  reason: "AG15E creates only non-active scaffold files and templates. AG15F should audit that no active queue or visibility behaviour was introduced.",
  ...stageControls
};

const boundary = {
  module_id: "AG15E",
  title: "AG15E to AG15F Non-active Integration Scaffold Audit Boundary",
  status: "ag15f_boundary_created_not_started",
  next_stage_id: "AG15F",
  next_stage_title: "Generated Article Admin Queue Non-active Integration Scaffold Audit",
  explicit_approval_required: true,
  ag15f_allowed_scope: [
    "Audit non-active integration scaffold files.",
    "Confirm scaffold remains outside /api.",
    "Confirm mapper cannot write active queue records.",
    "Confirm queue-index mutation remains blocked.",
    "Confirm public_visibility=false and publish_approved=false defaults remain enforced.",
    "Confirm readiness for controlled integration closure or later apply planning."
  ],
  ag15f_blocked_scope: [
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
    "No publishing operation.",
    "No deployment trigger."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG15E",
  title: "Non-active Admin Queue Integration Scaffold Schema",
  status: "schema_non_active_admin_queue_integration_scaffold_only",
  non_active_scaffold_file_creation_allowed_in_ag15e: true,
  candidate_to_queue_mapping_template_allowed_in_ag15e: true,
  no_write_queue_handoff_template_allowed_in_ag15e: true,
  validation_fixture_allowed_in_ag15e: true,
  ag15f_boundary_allowed_in_ag15e: true,

  article_generation_allowed_in_ag15e: false,
  article_mutation_allowed_in_ag15e: false,
  queue_mutation_allowed_in_ag15e: false,
  active_admin_review_queue_record_creation_allowed_in_ag15e: false,
  queue_index_mutation_allowed_in_ag15e: false,
  admin_action_execution_allowed_in_ag15e: false,
  editor_action_execution_allowed_in_ag15e: false,
  real_credential_creation_allowed_in_ag15e: false,
  hardcoded_password_allowed_in_ag15e: false,
  password_hash_commit_allowed_in_ag15e: false,
  auth_activation_allowed_in_ag15e: false,
  backend_activation_allowed_in_ag15e: false,
  supabase_activation_allowed_in_ag15e: false,
  database_write_allowed_in_ag15e: false,
  github_token_creation_or_exposure_allowed_in_ag15e: false,
  github_write_operation_allowed_in_ag15e: false,
  active_action_handler_creation_allowed_in_ag15e: false,
  public_visibility_switch_allowed_in_ag15e: false,
  public_publishing_operation_allowed_in_ag15e: false,
  deployment_trigger_allowed_in_ag15e: false,
  ...stageControls
};

const review = {
  module_id: "AG15E",
  title: "Generated Article Admin Queue Non-active Integration Scaffold",
  status: "non_active_integration_scaffold_created_pending_audit",
  depends_on: ["AG15D"],
  generated_from: inputs,
  apply_record_file: "data/content-intelligence/apply-records/ag15e-non-active-admin-queue-integration-scaffold-apply.json",
  inventory_file: "data/content-intelligence/content-pipeline/ag15e-non-active-integration-scaffold-inventory.json",
  mapping_record_file: "data/content-intelligence/content-pipeline/ag15e-candidate-to-queue-mapping-template-record.json",
  guard_record_file: "data/content-intelligence/quality-registry/ag15e-non-active-integration-guard-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag15e-non-active-integration-scaffold-audit-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag15e-to-ag15f-non-active-integration-scaffold-audit-boundary.json",
  schema_file: "data/content-intelligence/schema/non-active-admin-queue-integration-scaffold.schema.json",
  summary: {
    scaffold_directory: scaffoldDir,
    created_file_count: scaffoldFiles.length,
    active_queue_mutation_performed: false,
    public_visibility_default: false,
    publish_approved_default: false,
    ready_for_ag15f: true,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG15E",
  title: "Non-active Admin Queue Integration Scaffold Learning",
  status: "learning_record_only",
  learning_points: [
    "A candidate-to-queue mapper should be scaffolded outside active queue paths before any apply stage.",
    "The mapper must default public_visibility and publish_approved to false.",
    "No-write templates reduce future implementation ambiguity while keeping active queue safe.",
    "The seed candidate fixture demonstrates mapping shape without mutating the Admin Review Queue.",
    "AG15F should audit scaffold safety before any controlled apply planning."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG15E",
  title: "Generated Article Admin Queue Non-active Integration Scaffold",
  status: "non_active_integration_scaffold_created_pending_audit",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag15e-non-active-admin-queue-integration-scaffold.json",
    apply_record: "data/content-intelligence/apply-records/ag15e-non-active-admin-queue-integration-scaffold-apply.json",
    inventory: "data/content-intelligence/content-pipeline/ag15e-non-active-integration-scaffold-inventory.json",
    mapping_record: "data/content-intelligence/content-pipeline/ag15e-candidate-to-queue-mapping-template-record.json",
    guard_record: "data/content-intelligence/quality-registry/ag15e-non-active-integration-guard-record.json",
    readiness: "data/content-intelligence/quality-registry/ag15e-non-active-integration-scaffold-audit-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag15e-to-ag15f-non-active-integration-scaffold-audit-boundary.json",
    schema: "data/content-intelligence/schema/non-active-admin-queue-integration-scaffold.schema.json",
    learning: "data/content-intelligence/learning/ag15e-non-active-admin-queue-integration-scaffold-learning.json",
    preview: "data/quality/ag15e-non-active-admin-queue-integration-scaffold-preview.json",
    document: "docs/quality/AG15E_NON_ACTIVE_ADMIN_QUEUE_INTEGRATION_SCAFFOLD.md",
    scaffold_files: scaffoldFiles
  },
  ...stageControls
};

const preview = {
  module_id: "AG15E",
  preview_only: true,
  status: "non_active_integration_scaffold_created_pending_audit",
  scaffold_directory: scaffoldDir,
  scaffold_files: scaffoldFiles,
  active_queue_mutation_performed: false,
  queue_index_mutation_performed: false,
  public_visibility: false,
  publish_approved: false,
  ready_for_ag15f: true,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG15E — Generated Article Admin Queue Non-active Integration Scaffold

## Purpose

AG15E creates a non-active scaffold for future generated article to Admin Review Queue handoff.

AG15E does not generate articles, mutate articles, create active Admin Review Queue records, mutate queue indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, switch public visibility or publish anything.

## Scaffold Location

\`${scaffoldDir}\`

## Created Scaffold Files

- \`${scaffoldMapper}\`
- \`${intakeTemplate}\`
- \`${queueTemplate}\`
- \`${fixtureFile}\`
- \`${scaffoldReadme}\`

## Default Controls

- public_visibility: false
- publish_approved: false
- active_queue_write_enabled: false
- queue_index_write_enabled: false

## Next Stage

AG15F — Generated Article Admin Queue Non-active Integration Scaffold Audit — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(applyPath, apply);
writeJson(inventoryPath, inventory);
writeJson(mappingRecordPath, mappingRecord);
writeJson(guardPath, guard);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG15E non-active Admin Queue integration scaffold generated.");
console.log("✅ Candidate-to-queue mapper, no-write templates and seed validation fixture created.");
console.log("✅ Scaffold remains outside /api and does not write active queue records.");
console.log("✅ public_visibility=false and publish_approved=false preserved.");
console.log("✅ AG15F non-active integration scaffold audit boundary created.");
console.log("✅ No article generation, article mutation, queue mutation, visibility switch or publishing performed.");
