import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag16aReview: "data/content-intelligence/quality-reviews/ag16a-public-visibility-publish-control-preparation.json",
  ag16bReview: "data/content-intelligence/quality-reviews/ag16b-public-visibility-publish-filter-schema-plan.json",
  ag16cReview: "data/content-intelligence/quality-reviews/ag16c-public-visibility-filter-schema-dry-run.json",
  ag16dReview: "data/content-intelligence/quality-reviews/ag16d-public-visibility-filter-schema-dry-run-audit.json",
  ag16eReview: "data/content-intelligence/quality-reviews/ag16e-non-active-public-filter-implementation-scaffold.json",
  ag16fReview: "data/content-intelligence/quality-reviews/ag16f-non-active-public-filter-scaffold-audit.json",
  ag16fAudit: "data/content-intelligence/audit-records/ag16f-non-active-public-filter-scaffold-audit-report.json",
  ag16fClosure: "data/content-intelligence/closure-records/ag16f-non-active-public-filter-scaffold-closure.json",
  ag16fSafety: "data/content-intelligence/quality-registry/ag16f-non-active-public-filter-scaffold-safety-record.json",
  ag16fReadiness: "data/content-intelligence/quality-registry/ag16f-public-visibility-publish-control-closure-readiness-record.json",
  ag16fBoundary: "data/content-intelligence/mutation-plans/ag16f-to-ag16z-public-visibility-publish-control-closure-boundary.json",
  ag16aVisibilityModel: "data/content-intelligence/content-pipeline/ag16a-public-visibility-state-model.json",
  ag16bFilterContract: "data/content-intelligence/content-pipeline/ag16b-public-surface-filter-contract.json",
  ag16cValidationReport: "data/content-intelligence/audit-records/ag16c-public-visibility-filter-schema-dry-run-validation-report.json",
  ag16eInventory: "data/content-intelligence/content-pipeline/ag16e-non-active-public-filter-scaffold-inventory.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag16z-public-visibility-publish-control-closure.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag16z-public-visibility-publish-control-closure.json");
const summaryPath = path.join(root, "data/content-intelligence/content-pipeline/ag16z-public-visibility-publish-control-summary.json");
const blockedPath = path.join(root, "data/content-intelligence/quality-registry/ag16z-public-exposure-blocked-register.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag16z-next-path-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag16z-to-ag17a-controlled-go-live-implementation-path-decision-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/public-visibility-publish-control-closure.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag16z-public-visibility-publish-control-closure-learning.json");
const registryPath = path.join(root, "data/quality/ag16z-public-visibility-publish-control-closure.json");
const previewPath = path.join(root, "data/quality/ag16z-public-visibility-publish-control-closure-preview.json");
const docPath = path.join(root, "docs/quality/AG16Z_PUBLIC_VISIBILITY_PUBLISH_CONTROL_CLOSURE.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG16Z input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, readJson(v)]));

if (data.ag16fReview.status !== "non_active_public_filter_scaffold_audit_passed_ready_for_ag16z_closure") {
  throw new Error("AG16Z requires AG16F review readiness.");
}
if (data.ag16fAudit.failed_checks.length !== 0) {
  throw new Error("AG16Z requires AG16F audit to pass with zero failed checks.");
}
if (data.ag16fReadiness.ready_for_ag16z !== true) {
  throw new Error("AG16Z requires AG16F readiness.");
}
if (data.ag16fBoundary.next_stage_id !== "AG16Z" || data.ag16fBoundary.explicit_approval_required !== true) {
  throw new Error("AG16Z requires AG16F to AG16Z explicit boundary.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG16Z requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  public_visibility_publish_control_closure_only: true,
  ag16_chain_closure_created_in_ag16z: true,
  public_visibility_publish_control_summary_created_in_ag16z: true,
  public_exposure_blocked_register_created_in_ag16z: true,
  ag17a_boundary_created_in_ag16z: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag16z: false,
  article_mutation_performed_in_ag16z: false,
  queue_mutation_performed_in_ag16z: false,
  active_admin_review_queue_record_created_in_ag16z: false,
  queue_index_mutation_performed_in_ag16z: false,
  admin_action_execution_performed_in_ag16z: false,
  editor_action_execution_performed_in_ag16z: false,
  real_credential_created_in_ag16z: false,
  hardcoded_password_created_in_repo_in_ag16z: false,
  password_hash_created_in_repo_in_ag16z: false,
  auth_activation_performed_in_ag16z: false,
  backend_activation_performed_in_ag16z: false,
  supabase_activation_performed_in_ag16z: false,
  database_write_performed_in_ag16z: false,
  github_token_created_or_exposed_in_ag16z: false,
  github_write_operation_performed_in_ag16z: false,
  active_action_handler_created_in_ag16z: false,
  api_endpoint_created_in_ag16z: false,
  public_visibility_switch_performed_in_ag16z: false,
  public_index_mutation_performed_in_ag16z: false,
  public_publishing_operation_performed_in_ag16z: false,
  deployment_trigger_performed_in_ag16z: false
};

const completedStages = [
  {
    stage_id: "AG16A",
    title: "Public Visibility and Publish-Control Preparation",
    result: "Defined public visibility model, publish-control model, Featured Reads public filter doctrine and archive/internal-intelligence retention plan."
  },
  {
    stage_id: "AG16B",
    title: "Public Visibility and Publish Filter Schema Plan",
    result: "Converted doctrine into visibility fields, publish-control fields, public surface filter contract, exclusion contract and validation plan."
  },
  {
    stage_id: "AG16C",
    title: "Public Visibility and Publish Filter Schema Dry-run",
    result: "Dry-ran seed, excluded and hypothetical public states; confirmed non-approved states fail and public states pass only under strict controls."
  },
  {
    stage_id: "AG16D",
    title: "Public Visibility and Publish Filter Schema Dry-run Audit",
    result: "Audited dry-run with zero failed checks and approved only a non-active public filter scaffold."
  },
  {
    stage_id: "AG16E",
    title: "Non-active Public Filter Implementation Scaffold",
    result: "Created non-active public filter helper, templates and validation fixtures outside /api."
  },
  {
    stage_id: "AG16F",
    title: "Non-active Public Filter Implementation Scaffold Audit",
    result: "Audited scaffold with zero failed checks and confirmed no active exposure endpoint, visibility switch, public index mutation or publishing path."
  }
];

const summary = {
  module_id: "AG16Z",
  title: "Public Visibility Publish-Control Summary",
  status: "ag16_public_visibility_publish_control_preparation_completed",
  completed_stage_count: completedStages.length,
  completed_stages: completedStages,
  seed_candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  final_public_control_state: {
    public_visibility_model_defined: true,
    publish_control_model_defined: true,
    public_surface_filter_contract_defined: true,
    public_surface_exclusion_contract_defined: true,
    schema_dry_run_passed: true,
    dry_run_audit_passed: true,
    non_active_public_filter_scaffold_created: true,
    non_active_public_filter_scaffold_audited: true,
    public_exposure_requires_public_visibility_true: true,
    public_exposure_requires_publish_approved_true: true,
    public_exposure_requires_public_index_allowed_true: true,
    public_exposure_requires_hash_integrity: true,
    public_visibility_switch_enabled: false,
    public_index_mutation_enabled: false,
    publishing_enabled: false
  },
  ...stageControls
};

const blockedRegister = {
  module_id: "AG16Z",
  title: "Public Exposure Blocked Register",
  status: "public_exposure_operations_remain_blocked",
  blocked_items_after_ag16_closure: [
    "Actual public visibility switch.",
    "Actual public index mutation.",
    "Actual Featured Reads public listing mutation.",
    "Actual category listing mutation.",
    "Actual homepage article card mutation.",
    "Actual sitemap/feed/search index mutation.",
    "Article mutation.",
    "Admin/Editor action execution.",
    "Real credentials.",
    "Auth/backend/Supabase activation.",
    "GitHub write token wiring.",
    "Publishing operation.",
    "Deployment trigger."
  ],
  allowed_after_ag16z_without_new_approval: [
    "Review AG16 public visibility and publish-control records.",
    "Review non-active public filter scaffold.",
    "Proceed to controlled go-live implementation path decision planning."
  ],
  not_allowed_after_ag16z_without_new_approval: [
    "Switch public_visibility to true.",
    "Mutate public indexes.",
    "Publish an article.",
    "Expose Admin-approved content to public surfaces.",
    "Enable live Admin/Editor action execution.",
    "Create real credentials or activate Auth/backend."
  ],
  ...stageControls
};

const readiness = {
  module_id: "AG16Z",
  title: "Next Path Readiness Record",
  status: "ready_for_ag17a_controlled_go_live_implementation_path_decision",
  ready_for_ag17a: true,
  ag17a_explicit_approval_required: true,
  ag16_chain_closed: true,
  recommended_next_stage: "AG17A",
  recommended_next_stage_title: "Controlled Go-live Implementation Path Decision",
  reason: "AG16 completes public visibility and publish-control preparation at governed non-active level. The next missing layer is a controlled decision on the real go-live implementation path without bypassing Auth, handler, public index, visibility and publishing controls.",
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
  ...stageControls
};

const boundary = {
  module_id: "AG16Z",
  title: "AG16Z to AG17A Controlled Go-live Implementation Path Decision Boundary",
  status: "ag17a_boundary_created_not_started",
  next_stage_id: "AG17A",
  next_stage_title: "Controlled Go-live Implementation Path Decision",
  explicit_approval_required: true,
  ag17a_allowed_scope: [
    "Compare go-live implementation options.",
    "Decide whether to proceed with GitHub-backed static controlled path, Supabase/Auth-backed path, or hybrid staged path.",
    "Define real activation blockers.",
    "Define production secret and credential requirements without creating secrets.",
    "Define public exposure execution sequence.",
    "Define rollback and audit requirements.",
    "Keep all real implementation actions blocked."
  ],
  ag17a_blocked_scope: [
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

const closure = {
  module_id: "AG16Z",
  title: "Public Visibility and Publish-Control Closure",
  status: "public_visibility_publish_control_chain_closed_future_public_exposure_blocked",
  closure_scope: [
    "Public visibility doctrine.",
    "Publish-control doctrine.",
    "Featured Reads public filter plan.",
    "Archive/internal-intelligence retention plan.",
    "Public visibility field schema.",
    "Publish-control field schema.",
    "Public surface filter contract.",
    "Public surface exclusion contract.",
    "Public visibility filter dry-run.",
    "Public visibility filter dry-run audit.",
    "Non-active public filter scaffold.",
    "Non-active public filter scaffold audit."
  ],
  final_decision: {
    ag16_chain_closed: true,
    future_public_exposure_blocked: true,
    proceed_to_ag17a_controlled_go_live_implementation_path_decision: true,
    public_visibility_switch_enabled: false,
    public_index_mutation_enabled: false,
    public_publishing_enabled: false
  },
  ...stageControls
};

const schema = {
  module_id: "AG16Z",
  title: "Public Visibility Publish-Control Closure Schema",
  status: "schema_public_visibility_publish_control_closure_only",
  chain_closure_allowed_in_ag16z: true,
  preparation_summary_allowed_in_ag16z: true,
  blocked_register_allowed_in_ag16z: true,
  next_path_boundary_allowed_in_ag16z: true,

  article_generation_allowed_in_ag16z: false,
  article_mutation_allowed_in_ag16z: false,
  queue_mutation_allowed_in_ag16z: false,
  active_admin_review_queue_record_creation_allowed_in_ag16z: false,
  queue_index_mutation_allowed_in_ag16z: false,
  admin_action_execution_allowed_in_ag16z: false,
  editor_action_execution_allowed_in_ag16z: false,
  real_credential_creation_allowed_in_ag16z: false,
  hardcoded_password_allowed_in_ag16z: false,
  password_hash_commit_allowed_in_ag16z: false,
  auth_activation_allowed_in_ag16z: false,
  backend_activation_allowed_in_ag16z: false,
  supabase_activation_allowed_in_ag16z: false,
  database_write_allowed_in_ag16z: false,
  github_token_creation_or_exposure_allowed_in_ag16z: false,
  github_write_operation_allowed_in_ag16z: false,
  active_action_handler_creation_allowed_in_ag16z: false,
  api_endpoint_creation_allowed_in_ag16z: false,
  public_visibility_switch_allowed_in_ag16z: false,
  public_index_mutation_allowed_in_ag16z: false,
  public_publishing_operation_allowed_in_ag16z: false,
  deployment_trigger_allowed_in_ag16z: false,
  ...stageControls
};

const review = {
  module_id: "AG16Z",
  title: "Public Visibility and Publish-Control Closure",
  status: "public_visibility_publish_control_chain_closed_future_public_exposure_blocked",
  depends_on: ["AG16A", "AG16B", "AG16C", "AG16D", "AG16E", "AG16F"],
  generated_from: inputs,
  closure_file: "data/content-intelligence/closure-records/ag16z-public-visibility-publish-control-closure.json",
  summary_file: "data/content-intelligence/content-pipeline/ag16z-public-visibility-publish-control-summary.json",
  blocked_register_file: "data/content-intelligence/quality-registry/ag16z-public-exposure-blocked-register.json",
  readiness_file: "data/content-intelligence/quality-registry/ag16z-next-path-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag16z-to-ag17a-controlled-go-live-implementation-path-decision-boundary.json",
  schema_file: "data/content-intelligence/schema/public-visibility-publish-control-closure.schema.json",
  summary: {
    completed_stage_count: completedStages.length,
    ag16_chain_closed: true,
    ready_for_ag17a: true,
    public_visibility_switch_ready: false,
    public_index_mutation_ready: false,
    publish_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG16Z",
  title: "Public Visibility Publish-Control Closure Learning",
  status: "learning_record_only",
  learning_points: [
    "Public visibility and publishing controls are now governed through doctrine, schema, dry-run, audit and non-active scaffold.",
    "No article can appear publicly unless public_visibility, publish_approved, public_index_allowed, hash, quality and preview controls pass.",
    "Public exposure must remain separate from Admin approval.",
    "AG16 closes preparation only; real go-live still requires a controlled implementation path decision.",
    "AG17A should compare implementation options without creating credentials, activating backend/Auth or publishing."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG16Z",
  title: "Public Visibility and Publish-Control Closure",
  status: "public_visibility_publish_control_chain_closed_future_public_exposure_blocked",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag16z-public-visibility-publish-control-closure.json",
    closure: "data/content-intelligence/closure-records/ag16z-public-visibility-publish-control-closure.json",
    summary: "data/content-intelligence/content-pipeline/ag16z-public-visibility-publish-control-summary.json",
    blocked_register: "data/content-intelligence/quality-registry/ag16z-public-exposure-blocked-register.json",
    readiness: "data/content-intelligence/quality-registry/ag16z-next-path-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag16z-to-ag17a-controlled-go-live-implementation-path-decision-boundary.json",
    schema: "data/content-intelligence/schema/public-visibility-publish-control-closure.schema.json",
    learning: "data/content-intelligence/learning/ag16z-public-visibility-publish-control-closure-learning.json",
    preview: "data/quality/ag16z-public-visibility-publish-control-closure-preview.json",
    document: "docs/quality/AG16Z_PUBLIC_VISIBILITY_PUBLISH_CONTROL_CLOSURE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG16Z",
  preview_only: true,
  status: "public_visibility_publish_control_chain_closed_future_public_exposure_blocked",
  completed_stage_count: completedStages.length,
  ag16_chain_closed: true,
  ready_for_ag17a: true,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG16Z — Public Visibility and Publish-Control Closure

## Purpose

AG16Z closes the public visibility and publish-control preparation chain.

AG16Z is closure only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, switch public visibility, mutate public indexes or publish anything.

## Completed Chain

- AG16A — public visibility and publish-control preparation.
- AG16B — public visibility and publish-filter schema plan.
- AG16C — public visibility and publish-filter schema dry-run.
- AG16D — public visibility and publish-filter schema dry-run audit.
- AG16E — non-active public filter implementation scaffold.
- AG16F — non-active public filter scaffold audit.

## Final Decision

AG16 chain is closed. Future public exposure remains blocked until a controlled go-live implementation path is selected and separately approved.

## Next Stage

AG17A — Controlled Go-live Implementation Path Decision — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(closurePath, closure);
writeJson(summaryPath, summary);
writeJson(blockedPath, blockedRegister);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG16Z Public Visibility and Publish-Control Closure generated.");
console.log("✅ AG16A to AG16F chain closed.");
console.log("✅ Future public exposure remains blocked.");
console.log("✅ Visibility switch, public index mutation and publishing remain blocked.");
console.log("✅ AG17A Controlled Go-live Implementation Path Decision boundary created.");
