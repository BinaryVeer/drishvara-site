import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag16eReview: "data/content-intelligence/quality-reviews/ag16e-non-active-public-filter-implementation-scaffold.json",
  ag16eApply: "data/content-intelligence/apply-records/ag16e-non-active-public-filter-implementation-scaffold-apply.json",
  ag16eInventory: "data/content-intelligence/content-pipeline/ag16e-non-active-public-filter-scaffold-inventory.json",
  ag16eHelperContract: "data/content-intelligence/content-pipeline/ag16e-public-filter-helper-contract-record.json",
  ag16eGuard: "data/content-intelligence/quality-registry/ag16e-non-active-public-filter-guard-record.json",
  ag16eReadiness: "data/content-intelligence/quality-registry/ag16e-non-active-public-filter-scaffold-audit-readiness-record.json",
  ag16eBoundary: "data/content-intelligence/mutation-plans/ag16e-to-ag16f-non-active-public-filter-scaffold-audit-boundary.json",
  ag16dSafety: "data/content-intelligence/quality-registry/ag16d-public-filter-safety-record.json"
};

const scaffoldFiles = [
  "internal-scaffolds/ag16e-non-active-public-filter/public-surface-filter.non-active.mjs",
  "internal-scaffolds/ag16e-non-active-public-filter/public-filter-record.template.json",
  "internal-scaffolds/ag16e-non-active-public-filter/public-filter-fixture.seed-and-state-matrix.json",
  "internal-scaffolds/ag16e-non-active-public-filter/public-index-exposure.template.json",
  "internal-scaffolds/ag16e-non-active-public-filter/README.md"
];

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag16f-non-active-public-filter-scaffold-audit.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag16f-non-active-public-filter-scaffold-audit-report.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag16f-non-active-public-filter-scaffold-closure.json");
const safetyPath = path.join(root, "data/content-intelligence/quality-registry/ag16f-non-active-public-filter-scaffold-safety-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag16f-public-visibility-publish-control-closure-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag16f-to-ag16z-public-visibility-publish-control-closure-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/non-active-public-filter-scaffold-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag16f-non-active-public-filter-scaffold-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag16f-non-active-public-filter-scaffold-audit.json");
const previewPath = path.join(root, "data/quality/ag16f-non-active-public-filter-scaffold-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG16F_NON_ACTIVE_PUBLIC_FILTER_SCAFFOLD_AUDIT.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
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
  if (!exists(relativePath)) throw new Error(`Missing AG16F input ${name}: ${relativePath}`);
}
for (const file of scaffoldFiles) {
  if (!exists(file)) throw new Error(`Missing AG16E scaffold file: ${file}`);
}

const ag16eReview = readJson(inputs.ag16eReview);
const ag16eApply = readJson(inputs.ag16eApply);
const ag16eInventory = readJson(inputs.ag16eInventory);
const ag16eHelperContract = readJson(inputs.ag16eHelperContract);
const ag16eGuard = readJson(inputs.ag16eGuard);
const ag16eReadiness = readJson(inputs.ag16eReadiness);
const ag16eBoundary = readJson(inputs.ag16eBoundary);
const ag16dSafety = readJson(inputs.ag16dSafety);

if (ag16eReview.status !== "non_active_public_filter_scaffold_created_pending_audit") {
  throw new Error("AG16F requires AG16E review.");
}
if (ag16eApply.status !== "non_active_public_filter_scaffold_created_pending_audit") {
  throw new Error("AG16F requires AG16E apply record.");
}
if (ag16eReadiness.ready_for_ag16f !== true) {
  throw new Error("AG16F requires AG16E readiness.");
}
if (ag16eBoundary.next_stage_id !== "AG16F" || ag16eBoundary.explicit_approval_required !== true) {
  throw new Error("AG16F requires AG16E to AG16F explicit boundary.");
}

const helperPath = "internal-scaffolds/ag16e-non-active-public-filter/public-surface-filter.non-active.mjs";
const recordTemplatePath = "internal-scaffolds/ag16e-non-active-public-filter/public-filter-record.template.json";
const fixturePath = "internal-scaffolds/ag16e-non-active-public-filter/public-filter-fixture.seed-and-state-matrix.json";
const publicIndexTemplatePath = "internal-scaffolds/ag16e-non-active-public-filter/public-index-exposure.template.json";

const helperText = readText(helperPath);
const recordTemplate = readJson(recordTemplatePath);
const fixture = readJson(fixturePath);
const publicIndexTemplate = readJson(publicIndexTemplatePath);

const prohibitedHelperPattern = /from\s+["']node:fs["']|from\s+["']fs["']|writeFile|appendFile|fetch\(|Octokit|process\.env|child_process|createWriteStream|rmSync|unlinkSync/i;

const activeApiEndpointExists =
  exists("api/public-surface-filter.js") ||
  exists("api/public-surface-filter.mjs") ||
  exists("api/public-surface-filter.ts") ||
  exists("api/public-index-exposure.js") ||
  exists("api/public-index-exposure.mjs") ||
  exists("api/public-index-exposure.ts");

const fileRecords = scaffoldFiles.map((file) => ({
  file,
  hash: sha256(readText(file)),
  inside_api: file.startsWith("api/") || file.includes("/api/"),
  exists: true
}));

const stageControls = {
  non_active_public_filter_scaffold_audit_only: true,
  non_active_public_filter_scaffold_audited_in_ag16f: true,
  non_active_public_filter_scaffold_closure_created_in_ag16f: true,
  public_filter_scaffold_safety_record_created_in_ag16f: true,
  ag16z_boundary_created_in_ag16f: true,

  scaffold_file_mutation_performed_in_ag16f: false,
  article_generation_performed_in_ag16f: false,
  article_mutation_performed_in_ag16f: false,
  queue_mutation_performed_in_ag16f: false,
  active_admin_review_queue_record_created_in_ag16f: false,
  queue_index_mutation_performed_in_ag16f: false,
  admin_action_execution_performed_in_ag16f: false,
  editor_action_execution_performed_in_ag16f: false,
  real_credential_created_in_ag16f: false,
  hardcoded_password_created_in_repo_in_ag16f: false,
  password_hash_created_in_repo_in_ag16f: false,
  auth_activation_performed_in_ag16f: false,
  backend_activation_performed_in_ag16f: false,
  supabase_activation_performed_in_ag16f: false,
  database_write_performed_in_ag16f: false,
  github_token_created_or_exposed_in_ag16f: false,
  github_write_operation_performed_in_ag16f: false,
  active_action_handler_created_in_ag16f: false,
  api_endpoint_created_in_ag16f: false,
  public_visibility_switch_performed_in_ag16f: false,
  public_index_mutation_performed_in_ag16f: false,
  public_publishing_operation_performed_in_ag16f: false,
  deployment_trigger_performed_in_ag16f: false
};

const auditChecks = [
  {
    check_id: "AG16F-AUDIT-001",
    area: "ag16e_dependency",
    status: "passed",
    note: "AG16E review, apply, inventory, helper contract, guard, readiness and boundary are present."
  },
  {
    check_id: "AG16F-AUDIT-002",
    area: "scaffold_file_presence",
    status: scaffoldFiles.every((file) => exists(file)) ? "passed" : "failed",
    note: "All AG16E scaffold files must exist."
  },
  {
    check_id: "AG16F-AUDIT-003",
    area: "scaffold_outside_api",
    status: fileRecords.every((record) => record.inside_api === false) && activeApiEndpointExists === false ? "passed" : "failed",
    note: "Scaffold files must remain outside /api and no active public filter endpoint may exist."
  },
  {
    check_id: "AG16F-AUDIT-004",
    area: "helper_non_active_guard",
    status:
      helperText.includes("NON_ACTIVE_PUBLIC_FILTER_SCAFFOLD_ONLY") &&
      helperText.includes("public_visibility_switch_enabled: false") &&
      helperText.includes("public_index_update_enabled: false") &&
      helperText.includes("publishing_enabled: false") &&
      helperText.includes("article_mutation_enabled: false")
        ? "passed"
        : "failed",
    note: "Helper must remain non-active and block visibility switch, public index update, publishing and article mutation."
  },
  {
    check_id: "AG16F-AUDIT-005",
    area: "helper_prohibited_runtime_text",
    status: prohibitedHelperPattern.test(helperText) ? "failed" : "passed",
    note: "Helper must not import fs, access env, call fetch, use GitHub clients or write files."
  },
  {
    check_id: "AG16F-AUDIT-006",
    area: "record_template_defaults",
    status:
      recordTemplate.default_values.public_visibility === false &&
      recordTemplate.default_values.publish_approved === false &&
      recordTemplate.default_values.public_index_allowed === false &&
      recordTemplate.default_values.featured_reads_allowed === false
        ? "passed"
        : "failed",
    note: "Record template must preserve non-public defaults."
  },
  {
    check_id: "AG16F-AUDIT-007",
    area: "record_template_runtime_guards",
    status:
      recordTemplate.public_visibility_switch_enabled === false &&
      recordTemplate.public_index_update_enabled === false &&
      recordTemplate.publishing_enabled === false
        ? "passed"
        : "failed",
    note: "Record template must block visibility switch, public index update and publishing."
  },
  {
    check_id: "AG16F-AUDIT-008",
    area: "fixture_safety",
    status:
      fixture.seed_candidate_case.actual_public_filter_result === false &&
      fixture.public_pass_case.actual_public_filter_result === true &&
      fixture.public_visibility_switch_enabled === false &&
      fixture.public_index_update_enabled === false &&
      fixture.publishing_enabled === false
        ? "passed"
        : "failed",
    note: "Fixture must preserve non-public seed case and hypothetical-only public-pass case."
  },
  {
    check_id: "AG16F-AUDIT-009",
    area: "public_index_template_guard",
    status:
      publicIndexTemplate.public_index_update_enabled === false &&
      publicIndexTemplate.public_surface_update_enabled === false &&
      publicIndexTemplate.sitemap_update_enabled === false &&
      publicIndexTemplate.feed_update_enabled === false &&
      publicIndexTemplate.publish_execution_enabled === false
        ? "passed"
        : "failed",
    note: "Public index exposure template must block all live public surface updates."
  },
  {
    check_id: "AG16F-AUDIT-010",
    area: "inventory_alignment",
    status:
      ag16eInventory.helper_file_intentionally_outside_api === true &&
      ag16eInventory.no_active_endpoint_created === true &&
      ag16eInventory.no_public_index_mutation_path_created === true &&
      ag16eInventory.no_visibility_switch_created === true &&
      ag16eInventory.no_publishing_operation_created === true
        ? "passed"
        : "failed",
    note: "AG16E inventory must confirm no endpoint, public index mutation, visibility switch or publishing."
  },
  {
    check_id: "AG16F-AUDIT-011",
    area: "helper_contract_alignment",
    status:
      ag16eHelperContract.helper_contract.active_public_exposure_allowed === false &&
      ag16eHelperContract.helper_contract.public_visibility_switch_allowed === false &&
      ag16eHelperContract.helper_contract.public_index_update_allowed === false &&
      ag16eHelperContract.helper_contract.publish_allowed === false
        ? "passed"
        : "failed",
    note: "Helper contract must block active public exposure, visibility switch, index update and publishing."
  },
  {
    check_id: "AG16F-AUDIT-012",
    area: "guard_alignment",
    status:
      ag16eGuard.guard_assertions.public_visibility_switch_enabled === false &&
      ag16eGuard.guard_assertions.public_index_update_enabled === false &&
      ag16eGuard.guard_assertions.publishing_enabled === false &&
      ag16eGuard.guard_assertions.article_mutation_enabled === false
        ? "passed"
        : "failed",
    note: "AG16E guard must block visibility switch, public index update, publishing and article mutation."
  },
  {
    check_id: "AG16F-AUDIT-013",
    area: "ag16d_safety_inheritance",
    status:
      ag16dSafety.safety_assertions.public_visibility_switch_enabled === false &&
      ag16dSafety.safety_assertions.public_index_mutation_enabled === false &&
      ag16dSafety.safety_assertions.publishing_enabled === false
        ? "passed"
        : "failed",
    note: "AG16D safety controls must remain inherited."
  },
  {
    check_id: "AG16F-AUDIT-014",
    area: "forbidden_operations",
    status: "passed",
    note: "AG16F is audit-only and does not mutate scaffold files, articles, public visibility, public indexes or publishing state."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG16F audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const auditReport = {
  module_id: "AG16F",
  title: "Non-active Public Filter Scaffold Audit Report",
  status: "non_active_public_filter_scaffold_audit_passed",
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    failed: failedChecks.length
  },
  decision: {
    non_active_public_filter_scaffold_safe: true,
    active_public_filter_endpoint_present: false,
    public_visibility_switch_present: false,
    public_index_mutation_present: false,
    publishing_operation_present: false,
    ready_for_ag16z_closure: true
  },
  file_records: fileRecords,
  ...stageControls
};

const closure = {
  module_id: "AG16F",
  title: "Non-active Public Filter Scaffold Closure",
  status: "non_active_public_filter_scaffold_audit_passed_ready_for_ag16z_closure",
  closed_scope: [
    "AG16E non-active public filter helper scaffold.",
    "No-write public filter record template.",
    "Seed and state-matrix validation fixture.",
    "No-write public index exposure template.",
    "Non-active public filter guard."
  ],
  unresolved_for_active_public_exposure: [
    "Actual public visibility switch.",
    "Actual public index mutation.",
    "Actual Featured Reads update.",
    "Actual sitemap/feed/search index update.",
    "Publish execution.",
    "Deployment trigger."
  ],
  closure_decision: {
    close_ag16e_scaffold: true,
    proceed_to_ag16z_public_visibility_publish_control_closure: true,
    proceed_to_public_visibility_switch: false,
    proceed_to_public_index_mutation: false,
    proceed_to_publish_execution: false
  },
  ...stageControls
};

const safety = {
  module_id: "AG16F",
  title: "Non-active Public Filter Scaffold Safety Record",
  status: "non_active_public_filter_scaffold_safe_no_public_mutation_paths",
  safety_assertions: {
    scaffold_outside_api: true,
    active_api_endpoint_present: false,
    public_visibility_switch_enabled: false,
    public_index_update_enabled: false,
    public_surface_update_enabled: false,
    publishing_enabled: false,
    article_mutation_enabled: false,
    admin_action_execution_enabled: false
  },
  helper_hash: sha256(helperText),
  ...stageControls
};

const readiness = {
  module_id: "AG16F",
  title: "Public Visibility Publish-Control Closure Readiness Record",
  status: "ready_for_ag16z_public_visibility_publish_control_closure",
  ready_for_ag16z: true,
  ag16z_explicit_approval_required: true,
  non_active_public_filter_scaffold_audit_passed: true,
  failed_checks: 0,
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
  reason: "AG16F safely audits the non-active public filter scaffold. AG16Z should close the public visibility and publish-control preparation chain.",
  ...stageControls
};

const boundary = {
  module_id: "AG16F",
  title: "AG16F to AG16Z Public Visibility Publish-Control Closure Boundary",
  status: "ag16z_boundary_created_not_started",
  next_stage_id: "AG16Z",
  next_stage_title: "Public Visibility and Publish-Control Closure",
  explicit_approval_required: true,
  ag16z_allowed_scope: [
    "Close AG16 public visibility and publish-control preparation chain.",
    "Summarise AG16A to AG16F outputs.",
    "Record readiness and blockers for future controlled public exposure implementation.",
    "Create next boundary for go-live implementation planning."
  ],
  ag16z_blocked_scope: [
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
  module_id: "AG16F",
  title: "Non-active Public Filter Scaffold Audit Schema",
  status: "schema_non_active_public_filter_scaffold_audit_only",
  scaffold_audit_allowed_in_ag16f: true,
  closure_record_allowed_in_ag16f: true,
  safety_record_allowed_in_ag16f: true,
  ag16z_boundary_allowed_in_ag16f: true,

  scaffold_file_mutation_allowed_in_ag16f: false,
  article_generation_allowed_in_ag16f: false,
  article_mutation_allowed_in_ag16f: false,
  queue_mutation_allowed_in_ag16f: false,
  active_admin_review_queue_record_creation_allowed_in_ag16f: false,
  queue_index_mutation_allowed_in_ag16f: false,
  admin_action_execution_allowed_in_ag16f: false,
  editor_action_execution_allowed_in_ag16f: false,
  real_credential_creation_allowed_in_ag16f: false,
  hardcoded_password_allowed_in_ag16f: false,
  password_hash_commit_allowed_in_ag16f: false,
  auth_activation_allowed_in_ag16f: false,
  backend_activation_allowed_in_ag16f: false,
  supabase_activation_allowed_in_ag16f: false,
  database_write_allowed_in_ag16f: false,
  github_token_creation_or_exposure_allowed_in_ag16f: false,
  github_write_operation_allowed_in_ag16f: false,
  active_action_handler_creation_allowed_in_ag16f: false,
  api_endpoint_creation_allowed_in_ag16f: false,
  public_visibility_switch_allowed_in_ag16f: false,
  public_index_mutation_allowed_in_ag16f: false,
  public_publishing_operation_allowed_in_ag16f: false,
  deployment_trigger_allowed_in_ag16f: false,
  ...stageControls
};

const review = {
  module_id: "AG16F",
  title: "Non-active Public Filter Implementation Scaffold Audit",
  status: "non_active_public_filter_scaffold_audit_passed_ready_for_ag16z_closure",
  depends_on: ["AG16E"],
  generated_from: inputs,
  audit_report_file: "data/content-intelligence/audit-records/ag16f-non-active-public-filter-scaffold-audit-report.json",
  closure_file: "data/content-intelligence/closure-records/ag16f-non-active-public-filter-scaffold-closure.json",
  safety_file: "data/content-intelligence/quality-registry/ag16f-non-active-public-filter-scaffold-safety-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag16f-public-visibility-publish-control-closure-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag16f-to-ag16z-public-visibility-publish-control-closure-boundary.json",
  schema_file: "data/content-intelligence/schema/non-active-public-filter-scaffold-audit.schema.json",
  summary: {
    audit_passed: true,
    failed_checks: 0,
    ready_for_ag16z: true,
    public_visibility_switch_ready: false,
    public_index_mutation_ready: false,
    publish_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG16F",
  title: "Non-active Public Filter Scaffold Audit Learning",
  status: "learning_record_only",
  learning_points: [
    "The public visibility filter scaffold is safe only as non-active logic outside /api.",
    "Eligibility evaluation must remain separate from public index mutation.",
    "No public exposure path should exist before a later controlled apply stage.",
    "AG16Z can close the public visibility and publish-control preparation chain.",
    "The next major layer should decide go-live implementation sequencing without bypassing controls."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG16F",
  title: "Non-active Public Filter Implementation Scaffold Audit",
  status: "non_active_public_filter_scaffold_audit_passed_ready_for_ag16z_closure",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag16f-non-active-public-filter-scaffold-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag16f-non-active-public-filter-scaffold-audit-report.json",
    closure: "data/content-intelligence/closure-records/ag16f-non-active-public-filter-scaffold-closure.json",
    safety: "data/content-intelligence/quality-registry/ag16f-non-active-public-filter-scaffold-safety-record.json",
    readiness: "data/content-intelligence/quality-registry/ag16f-public-visibility-publish-control-closure-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag16f-to-ag16z-public-visibility-publish-control-closure-boundary.json",
    schema: "data/content-intelligence/schema/non-active-public-filter-scaffold-audit.schema.json",
    learning: "data/content-intelligence/learning/ag16f-non-active-public-filter-scaffold-audit-learning.json",
    preview: "data/quality/ag16f-non-active-public-filter-scaffold-audit-preview.json",
    document: "docs/quality/AG16F_NON_ACTIVE_PUBLIC_FILTER_SCAFFOLD_AUDIT.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG16F",
  preview_only: true,
  status: "non_active_public_filter_scaffold_audit_passed_ready_for_ag16z_closure",
  audit_passed: true,
  failed_checks: 0,
  ready_for_ag16z: true,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG16F — Non-active Public Filter Implementation Scaffold Audit

## Purpose

AG16F audits the AG16E non-active public filter implementation scaffold.

AG16F is audit-only. It does not mutate scaffold files, generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, switch public visibility, mutate public indexes or publish anything.

## Audit Result

The non-active public filter scaffold passed audit with zero failed checks.

## Closure Decision

AG16E non-active public filter scaffold is safe and ready for AG16Z closure.

## Next Stage

AG16Z — Public Visibility and Publish-Control Closure — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditPath, auditReport);
writeJson(closurePath, closure);
writeJson(safetyPath, safety);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG16F non-active public filter scaffold audit generated.");
console.log("✅ Scaffold audit passed with zero failed checks.");
console.log("✅ Scaffold remains outside /api and no active public exposure path exists.");
console.log("✅ Visibility switch, public index mutation and publishing remain blocked.");
console.log("✅ AG16Z public visibility and publish-control closure boundary created.");
