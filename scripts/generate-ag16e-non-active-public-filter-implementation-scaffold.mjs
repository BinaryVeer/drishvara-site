import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag16dReview: "data/content-intelligence/quality-reviews/ag16d-public-visibility-filter-schema-dry-run-audit.json",
  ag16dAudit: "data/content-intelligence/audit-records/ag16d-public-visibility-filter-schema-dry-run-audit-report.json",
  ag16dDecision: "data/content-intelligence/content-pipeline/ag16d-public-filter-implementation-readiness-decision-record.json",
  ag16dSafety: "data/content-intelligence/quality-registry/ag16d-public-filter-safety-record.json",
  ag16dReadiness: "data/content-intelligence/quality-registry/ag16d-non-active-public-filter-scaffold-readiness-record.json",
  ag16dBoundary: "data/content-intelligence/mutation-plans/ag16d-to-ag16e-non-active-public-filter-implementation-scaffold-boundary.json",
  ag16cSeedDryRun: "data/content-intelligence/content-pipeline/dry-runs/ag16c-seed-candidate-public-filter-dry-run.json",
  ag16cStateMatrixDryRun: "data/content-intelligence/content-pipeline/dry-runs/ag16c-public-visibility-state-matrix-dry-run.json",
  ag16cPublicPassShapeDryRun: "data/content-intelligence/content-pipeline/dry-runs/ag16c-hypothetical-public-published-shape-dry-run.json",
  ag16bFilterContract: "data/content-intelligence/content-pipeline/ag16b-public-surface-filter-contract.json",
  ag16bExclusionContract: "data/content-intelligence/content-pipeline/ag16b-public-surface-exclusion-contract.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const scaffoldDir = "internal-scaffolds/ag16e-non-active-public-filter";
const helperFile = `${scaffoldDir}/public-surface-filter.non-active.mjs`;
const recordTemplateFile = `${scaffoldDir}/public-filter-record.template.json`;
const fixtureFile = `${scaffoldDir}/public-filter-fixture.seed-and-state-matrix.json`;
const noPublicIndexTemplateFile = `${scaffoldDir}/public-index-exposure.template.json`;
const readmeFile = `${scaffoldDir}/README.md`;

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag16e-non-active-public-filter-implementation-scaffold.json");
const applyPath = path.join(root, "data/content-intelligence/apply-records/ag16e-non-active-public-filter-implementation-scaffold-apply.json");
const inventoryPath = path.join(root, "data/content-intelligence/content-pipeline/ag16e-non-active-public-filter-scaffold-inventory.json");
const helperContractPath = path.join(root, "data/content-intelligence/content-pipeline/ag16e-public-filter-helper-contract-record.json");
const guardPath = path.join(root, "data/content-intelligence/quality-registry/ag16e-non-active-public-filter-guard-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag16e-non-active-public-filter-scaffold-audit-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag16e-to-ag16f-non-active-public-filter-scaffold-audit-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/non-active-public-filter-implementation-scaffold.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag16e-non-active-public-filter-implementation-scaffold-learning.json");
const registryPath = path.join(root, "data/quality/ag16e-non-active-public-filter-implementation-scaffold.json");
const previewPath = path.join(root, "data/quality/ag16e-non-active-public-filter-implementation-scaffold-preview.json");
const docPath = path.join(root, "docs/quality/AG16E_NON_ACTIVE_PUBLIC_FILTER_IMPLEMENTATION_SCAFFOLD.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG16E input ${name}: ${relativePath}`);
}

const ag16dReview = readJson(inputs.ag16dReview);
const ag16dAudit = readJson(inputs.ag16dAudit);
const ag16dDecision = readJson(inputs.ag16dDecision);
const ag16dSafety = readJson(inputs.ag16dSafety);
const ag16dReadiness = readJson(inputs.ag16dReadiness);
const ag16dBoundary = readJson(inputs.ag16dBoundary);
const ag16cSeedDryRun = readJson(inputs.ag16cSeedDryRun);
const ag16cStateMatrixDryRun = readJson(inputs.ag16cStateMatrixDryRun);
const ag16cPublicPassShapeDryRun = readJson(inputs.ag16cPublicPassShapeDryRun);
const ag16bFilterContract = readJson(inputs.ag16bFilterContract);
const ag16bExclusionContract = readJson(inputs.ag16bExclusionContract);
const ag13zCandidate = readJson(inputs.ag13zCandidate);

if (ag16dReview.status !== "public_visibility_filter_schema_dry_run_audit_passed_non_active_scaffold_ready") {
  throw new Error("AG16E requires AG16D review readiness.");
}
if (ag16dAudit.failed_checks.length !== 0) {
  throw new Error("AG16E requires AG16D audit to pass with zero failed checks.");
}
if (ag16dDecision.decision.proceed_to_non_active_public_filter_scaffold !== true) {
  throw new Error("AG16E requires AG16D decision to proceed to non-active public filter scaffold.");
}
if (ag16dDecision.decision.proceed_to_public_visibility_switch !== false) {
  throw new Error("AG16E requires visibility switch to remain blocked.");
}
if (ag16dDecision.decision.proceed_to_public_index_mutation !== false) {
  throw new Error("AG16E requires public index mutation to remain blocked.");
}
if (ag16dDecision.decision.proceed_to_publish_execution !== false) {
  throw new Error("AG16E requires publishing to remain blocked.");
}
if (ag16dReadiness.ready_for_ag16e !== true) {
  throw new Error("AG16E requires AG16D readiness.");
}
if (ag16dBoundary.next_stage_id !== "AG16E" || ag16dBoundary.explicit_approval_required !== true) {
  throw new Error("AG16E requires AG16D to AG16E explicit boundary.");
}

const articlePath = ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG16E requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  non_active_public_filter_implementation_scaffold_only: true,
  scaffold_files_created_in_ag16e: true,
  public_filter_helper_created_in_ag16e: true,
  public_filter_templates_created_in_ag16e: true,
  public_filter_validation_fixture_created_in_ag16e: true,
  guard_record_created_in_ag16e: true,
  ag16f_boundary_created_in_ag16e: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag16e: false,
  article_mutation_performed_in_ag16e: false,
  queue_mutation_performed_in_ag16e: false,
  active_admin_review_queue_record_created_in_ag16e: false,
  queue_index_mutation_performed_in_ag16e: false,
  admin_action_execution_performed_in_ag16e: false,
  editor_action_execution_performed_in_ag16e: false,
  real_credential_created_in_ag16e: false,
  hardcoded_password_created_in_repo_in_ag16e: false,
  password_hash_created_in_repo_in_ag16e: false,
  auth_activation_performed_in_ag16e: false,
  backend_activation_performed_in_ag16e: false,
  supabase_activation_performed_in_ag16e: false,
  database_write_performed_in_ag16e: false,
  github_token_created_or_exposed_in_ag16e: false,
  github_write_operation_performed_in_ag16e: false,
  active_action_handler_created_in_ag16e: false,
  api_endpoint_created_in_ag16e: false,
  public_visibility_switch_performed_in_ag16e: false,
  public_index_mutation_performed_in_ag16e: false,
  public_publishing_operation_performed_in_ag16e: false,
  deployment_trigger_performed_in_ag16e: false
};

const helperCode = `// AG16E — Non-active Public Filter Implementation Scaffold
// This helper is intentionally non-active and outside /api.
// It evaluates shape only. It cannot expose content publicly, change public visibility,
// update public indexes, publish, call services, access secrets, or execute Admin actions.

export const AG16E_PUBLIC_FILTER_SCAFFOLD = Object.freeze({
  module_id: "AG16E",
  status: "NON_ACTIVE_PUBLIC_FILTER_SCAFFOLD_ONLY",
  public_filter_execution_enabled: false,
  public_visibility_switch_enabled: false,
  public_index_update_enabled: false,
  publishing_enabled: false,
  article_mutation_enabled: false,
  admin_action_execution_enabled: false
});

export function evaluatePublicSurfaceEligibilityNonActive(record, surface = "featured_reads") {
  const source = record && typeof record === "object" ? record : {};

  const baseChecks = [
    source.public_visibility === true,
    source.publish_approved === true,
    source.public_index_allowed === true,
    ["public_published", "published_closed"].includes(source.status),
    typeof source.article_path === "string" && source.article_path.length > 0,
    typeof source.article_hash === "string" && source.article_hash.length > 0,
    source.article_hash === source.approved_hash,
    ["complete", "not_applicable"].includes(source.quality_evidence_status),
    source.preview_status === "passed",
    source.hash_integrity_status === "matched"
  ];

  const surfaceCheck = surface === "featured_reads"
    ? source.featured_reads_allowed === true
    : true;

  const eligible = baseChecks.every(Boolean) && surfaceCheck;

  return Object.freeze({
    module_id: "AG16E",
    status: "NON_ACTIVE_PUBLIC_FILTER_EVALUATION_ONLY",
    dry_run_only: true,
    eligible,
    public_visibility_switch_enabled: false,
    public_index_update_enabled: false,
    publishing_enabled: false,
    reason: eligible
      ? "Record shape satisfies public filter conditions, but AG16E cannot expose or publish."
      : "Record shape does not satisfy public filter conditions."
  });
}

export function blockPublicExposureMutationNonActive() {
  return Object.freeze({
    module_id: "AG16E",
    status: "PUBLIC_EXPOSURE_MUTATION_BLOCKED",
    blocked: true,
    public_visibility_switch_enabled: false,
    public_index_update_enabled: false,
    publishing_enabled: false,
    article_mutation_enabled: false
  });
}
`;

const recordTemplate = {
  module_id: "AG16E",
  title: "Public Filter Record Template",
  status: "non_active_template_only",
  dry_run_only: true,
  required_fields: [
    "article_id",
    "article_path",
    "article_hash",
    "approved_hash",
    "status",
    "public_visibility",
    "publish_approved",
    "public_index_allowed",
    "featured_reads_allowed",
    "quality_evidence_status",
    "preview_status",
    "hash_integrity_status"
  ],
  default_values: {
    public_visibility: false,
    publish_approved: false,
    public_index_allowed: false,
    featured_reads_allowed: false,
    approved_hash: null,
    status: "ready_for_admin_review"
  },
  public_visibility_switch_enabled: false,
  public_index_update_enabled: false,
  publishing_enabled: false
};

const publicIndexTemplate = {
  module_id: "AG16E",
  title: "Public Index Exposure Template",
  status: "non_active_template_only",
  dry_run_only: true,
  public_index_update_enabled: false,
  public_surface_update_enabled: false,
  sitemap_update_enabled: false,
  feed_update_enabled: false,
  publish_execution_enabled: false,
  include_contract: ag16bFilterContract.include_contract,
  exclude_contract: ag16bFilterContract.exclude_contract
};

const fixture = {
  module_id: "AG16E",
  title: "Public Filter Fixture Seed and State Matrix",
  status: "non_active_fixture_only",
  dry_run_only: true,
  source_seed_dry_run_file: inputs.ag16cSeedDryRun,
  source_state_matrix_dry_run_file: inputs.ag16cStateMatrixDryRun,
  source_public_pass_shape_dry_run_file: inputs.ag16cPublicPassShapeDryRun,
  seed_candidate_case: {
    expected_public_filter_result: ag16cSeedDryRun.expected_public_filter_result,
    actual_public_filter_result: ag16cSeedDryRun.actual_public_filter_result,
    public_visibility: ag16cSeedDryRun.record_under_test.public_visibility,
    publish_approved: ag16cSeedDryRun.record_under_test.publish_approved
  },
  state_matrix_summary: ag16cStateMatrixDryRun.result_summary,
  public_pass_case: {
    expected_public_filter_result: ag16cPublicPassShapeDryRun.expected_public_filter_result,
    actual_public_filter_result: ag16cPublicPassShapeDryRun.actual_public_filter_result,
    public_visibility: ag16cPublicPassShapeDryRun.record_under_test.public_visibility,
    publish_approved: ag16cPublicPassShapeDryRun.record_under_test.publish_approved
  },
  public_visibility_switch_enabled: false,
  public_index_update_enabled: false,
  publishing_enabled: false
};

const readme = `# AG16E — Non-active Public Filter Implementation Scaffold

This scaffold is intentionally non-active.

It provides a public-surface eligibility helper, templates and fixtures for future public filtering, but it does not change visibility, update public indexes, publish articles, execute Admin/Editor actions or activate backend/Auth/Supabase.

## Files

- public-surface-filter.non-active.mjs
- public-filter-record.template.json
- public-filter-fixture.seed-and-state-matrix.json
- public-index-exposure.template.json

## Boundary

The scaffold must remain outside /api and outside live public-index mutation paths.
`;

writeText(path.join(root, helperFile), helperCode);
writeJson(path.join(root, recordTemplateFile), recordTemplate);
writeJson(path.join(root, fixtureFile), fixture);
writeJson(path.join(root, noPublicIndexTemplateFile), publicIndexTemplate);
writeText(path.join(root, readmeFile), readme);

const scaffoldFiles = [helperFile, recordTemplateFile, fixtureFile, noPublicIndexTemplateFile, readmeFile];

const fileRecords = scaffoldFiles.map((file) => ({
  file,
  hash: sha256(fs.readFileSync(path.join(root, file), "utf8")),
  inside_api: file.startsWith("api/") || file.includes("/api/"),
  public_index_mutation_path: false,
  deployable_endpoint: false
}));

const inventory = {
  module_id: "AG16E",
  title: "Non-active Public Filter Scaffold Inventory",
  status: "non_active_public_filter_scaffold_files_created",
  scaffold_directory: scaffoldDir,
  files: fileRecords,
  helper_file_intentionally_outside_api: true,
  no_active_endpoint_created: true,
  no_public_index_mutation_path_created: true,
  no_visibility_switch_created: true,
  no_publishing_operation_created: true,
  ...stageControls
};

const helperContract = {
  module_id: "AG16E",
  title: "Public Filter Helper Contract Record",
  status: "public_filter_helper_contract_created_non_active",
  helper_file: helperFile,
  record_template_file: recordTemplateFile,
  fixture_file: fixtureFile,
  public_index_template_file: noPublicIndexTemplateFile,
  helper_contract: {
    input: "article_visibility_record",
    output: "eligibility_evaluation_result",
    active_public_exposure_allowed: false,
    public_visibility_switch_allowed: false,
    public_index_update_allowed: false,
    publish_allowed: false
  },
  required_true_for_hypothetical_public_eligibility: [
    "public_visibility",
    "publish_approved",
    "public_index_allowed",
    "article_hash_equals_approved_hash",
    "quality_evidence_passed",
    "preview_passed",
    "hash_integrity_matched"
  ],
  excluded_states_reference: ag16bExclusionContract.excluded_states.map((state) => state.status),
  ...stageControls
};

const guard = {
  module_id: "AG16E",
  title: "Non-active Public Filter Guard Record",
  status: "non_active_public_filter_guards_confirmed",
  guard_assertions: {
    public_filter_execution_enabled: false,
    public_visibility_switch_enabled: false,
    public_index_update_enabled: false,
    publishing_enabled: false,
    article_mutation_enabled: false,
    admin_action_execution_enabled: false,
    backend_activation_enabled: false
  },
  prohibited_runtime_behaviour: [
    "No public visibility switch.",
    "No public index update.",
    "No Featured Reads mutation.",
    "No sitemap/feed/search index mutation.",
    "No article mutation.",
    "No publishing operation.",
    "No deployment trigger.",
    "No secret access.",
    "No external network write service."
  ],
  safety_inherited_from_ag16d: ag16dSafety.safety_assertions,
  ...stageControls
};

const apply = {
  module_id: "AG16E",
  title: "Non-active Public Filter Implementation Scaffold Apply Record",
  status: "non_active_public_filter_scaffold_created_pending_audit",
  created_files: scaffoldFiles,
  scaffold_inventory_file: "data/content-intelligence/content-pipeline/ag16e-non-active-public-filter-scaffold-inventory.json",
  helper_contract_file: "data/content-intelligence/content-pipeline/ag16e-public-filter-helper-contract-record.json",
  guard_record_file: "data/content-intelligence/quality-registry/ag16e-non-active-public-filter-guard-record.json",
  ...stageControls
};

const readiness = {
  module_id: "AG16E",
  title: "Non-active Public Filter Scaffold Audit Readiness Record",
  status: "ready_for_ag16f_non_active_public_filter_scaffold_audit",
  ready_for_ag16f: true,
  ag16f_explicit_approval_required: true,
  non_active_public_filter_scaffold_created: true,
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
  reason: "AG16E creates only a non-active public filter scaffold. AG16F should audit that no live visibility, index or publishing path was introduced.",
  ...stageControls
};

const boundary = {
  module_id: "AG16E",
  title: "AG16E to AG16F Non-active Public Filter Scaffold Audit Boundary",
  status: "ag16f_boundary_created_not_started",
  next_stage_id: "AG16F",
  next_stage_title: "Non-active Public Filter Implementation Scaffold Audit",
  explicit_approval_required: true,
  ag16f_allowed_scope: [
    "Audit non-active public filter scaffold files.",
    "Confirm scaffold remains outside /api.",
    "Confirm helper cannot switch visibility.",
    "Confirm helper cannot mutate public index.",
    "Confirm helper cannot publish.",
    "Confirm templates preserve false defaults.",
    "Confirm readiness for AG16Z closure or next governed public exposure planning."
  ],
  ag16f_blocked_scope: [
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
  module_id: "AG16E",
  title: "Non-active Public Filter Implementation Scaffold Schema",
  status: "schema_non_active_public_filter_implementation_scaffold_only",
  non_active_scaffold_file_creation_allowed_in_ag16e: true,
  public_filter_helper_allowed_in_ag16e: true,
  public_filter_templates_allowed_in_ag16e: true,
  validation_fixture_allowed_in_ag16e: true,
  ag16f_boundary_allowed_in_ag16e: true,

  article_generation_allowed_in_ag16e: false,
  article_mutation_allowed_in_ag16e: false,
  queue_mutation_allowed_in_ag16e: false,
  active_admin_review_queue_record_creation_allowed_in_ag16e: false,
  queue_index_mutation_allowed_in_ag16e: false,
  admin_action_execution_allowed_in_ag16e: false,
  editor_action_execution_allowed_in_ag16e: false,
  real_credential_creation_allowed_in_ag16e: false,
  hardcoded_password_allowed_in_ag16e: false,
  password_hash_commit_allowed_in_ag16e: false,
  auth_activation_allowed_in_ag16e: false,
  backend_activation_allowed_in_ag16e: false,
  supabase_activation_allowed_in_ag16e: false,
  database_write_allowed_in_ag16e: false,
  github_token_creation_or_exposure_allowed_in_ag16e: false,
  github_write_operation_allowed_in_ag16e: false,
  active_action_handler_creation_allowed_in_ag16e: false,
  public_visibility_switch_allowed_in_ag16e: false,
  public_index_mutation_allowed_in_ag16e: false,
  public_publishing_operation_allowed_in_ag16e: false,
  deployment_trigger_allowed_in_ag16e: false,
  ...stageControls
};

const review = {
  module_id: "AG16E",
  title: "Non-active Public Filter Implementation Scaffold",
  status: "non_active_public_filter_scaffold_created_pending_audit",
  depends_on: ["AG16D"],
  generated_from: inputs,
  apply_record_file: "data/content-intelligence/apply-records/ag16e-non-active-public-filter-implementation-scaffold-apply.json",
  inventory_file: "data/content-intelligence/content-pipeline/ag16e-non-active-public-filter-scaffold-inventory.json",
  helper_contract_file: "data/content-intelligence/content-pipeline/ag16e-public-filter-helper-contract-record.json",
  guard_record_file: "data/content-intelligence/quality-registry/ag16e-non-active-public-filter-guard-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag16e-non-active-public-filter-scaffold-audit-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag16e-to-ag16f-non-active-public-filter-scaffold-audit-boundary.json",
  schema_file: "data/content-intelligence/schema/non-active-public-filter-implementation-scaffold.schema.json",
  summary: {
    scaffold_directory: scaffoldDir,
    created_file_count: scaffoldFiles.length,
    public_visibility_switch_performed: false,
    public_index_mutation_performed: false,
    publishing_operation_performed: false,
    ready_for_ag16f: true,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG16E",
  title: "Non-active Public Filter Implementation Scaffold Learning",
  status: "learning_record_only",
  learning_points: [
    "A public filter helper can safely exist only when it is non-active and outside live public index paths.",
    "Eligibility evaluation must be separated from visibility switching and publishing.",
    "Templates must preserve public_visibility=false and publish_approved=false by default.",
    "Real public index mutation must remain a later controlled apply stage.",
    "AG16F should audit scaffold safety before AG16 closure."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG16E",
  title: "Non-active Public Filter Implementation Scaffold",
  status: "non_active_public_filter_scaffold_created_pending_audit",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag16e-non-active-public-filter-implementation-scaffold.json",
    apply_record: "data/content-intelligence/apply-records/ag16e-non-active-public-filter-implementation-scaffold-apply.json",
    inventory: "data/content-intelligence/content-pipeline/ag16e-non-active-public-filter-scaffold-inventory.json",
    helper_contract: "data/content-intelligence/content-pipeline/ag16e-public-filter-helper-contract-record.json",
    guard_record: "data/content-intelligence/quality-registry/ag16e-non-active-public-filter-guard-record.json",
    readiness: "data/content-intelligence/quality-registry/ag16e-non-active-public-filter-scaffold-audit-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag16e-to-ag16f-non-active-public-filter-scaffold-audit-boundary.json",
    schema: "data/content-intelligence/schema/non-active-public-filter-implementation-scaffold.schema.json",
    learning: "data/content-intelligence/learning/ag16e-non-active-public-filter-implementation-scaffold-learning.json",
    preview: "data/quality/ag16e-non-active-public-filter-implementation-scaffold-preview.json",
    document: "docs/quality/AG16E_NON_ACTIVE_PUBLIC_FILTER_IMPLEMENTATION_SCAFFOLD.md",
    scaffold_files: scaffoldFiles
  },
  ...stageControls
};

const preview = {
  module_id: "AG16E",
  preview_only: true,
  status: "non_active_public_filter_scaffold_created_pending_audit",
  scaffold_directory: scaffoldDir,
  scaffold_files: scaffoldFiles,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  publish_ready: false,
  ready_for_ag16f: true,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG16E — Non-active Public Filter Implementation Scaffold

## Purpose

AG16E creates a non-active public filter scaffold for future public surface eligibility checks.

AG16E does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, switch public visibility, mutate public indexes or publish anything.

## Scaffold Location

\`${scaffoldDir}\`

## Created Scaffold Files

- \`${helperFile}\`
- \`${recordTemplateFile}\`
- \`${fixtureFile}\`
- \`${noPublicIndexTemplateFile}\`
- \`${readmeFile}\`

## Default Controls

- public_visibility_switch_enabled: false
- public_index_update_enabled: false
- publishing_enabled: false
- article_mutation_enabled: false

## Next Stage

AG16F — Non-active Public Filter Implementation Scaffold Audit — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(applyPath, apply);
writeJson(inventoryPath, inventory);
writeJson(helperContractPath, helperContract);
writeJson(guardPath, guard);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG16E non-active public filter implementation scaffold generated.");
console.log("✅ Public filter helper, templates and validation fixture created outside /api.");
console.log("✅ Visibility switch, public index update and publishing remain blocked.");
console.log("✅ AG16F non-active public filter scaffold audit boundary created.");
