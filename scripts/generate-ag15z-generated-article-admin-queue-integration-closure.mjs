import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag15aReview: "data/content-intelligence/quality-reviews/ag15a-next-path-decision-after-admin-editor-chain-closure.json",
  ag15bReview: "data/content-intelligence/quality-reviews/ag15b-generated-article-admin-queue-integration-plan.json",
  ag15cReview: "data/content-intelligence/quality-reviews/ag15c-generated-article-admin-queue-schema-dry-run.json",
  ag15dReview: "data/content-intelligence/quality-reviews/ag15d-schema-dry-run-audit-integration-readiness.json",
  ag15eReview: "data/content-intelligence/quality-reviews/ag15e-non-active-admin-queue-integration-scaffold.json",
  ag15fReview: "data/content-intelligence/quality-reviews/ag15f-non-active-admin-queue-integration-scaffold-audit.json",
  ag15fAudit: "data/content-intelligence/audit-records/ag15f-non-active-integration-scaffold-audit-report.json",
  ag15fClosure: "data/content-intelligence/closure-records/ag15f-non-active-admin-queue-integration-scaffold-closure.json",
  ag15fSafety: "data/content-intelligence/quality-registry/ag15f-non-active-integration-scaffold-safety-record.json",
  ag15fReadiness: "data/content-intelligence/quality-registry/ag15f-generated-article-admin-queue-integration-closure-readiness-record.json",
  ag15fBoundary: "data/content-intelligence/mutation-plans/ag15f-to-ag15z-generated-article-admin-queue-integration-closure-boundary.json",
  ag15dBlockers: "data/content-intelligence/content-pipeline/ag15d-active-integration-blocker-register.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  ag13zQueueIndex: "data/admin-review/index/admin-review-queue-index.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag15z-generated-article-admin-queue-integration-closure.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag15z-generated-article-admin-queue-integration-closure.json");
const summaryPath = path.join(root, "data/content-intelligence/content-pipeline/ag15z-generated-article-admin-queue-preparation-summary.json");
const blockedPath = path.join(root, "data/content-intelligence/quality-registry/ag15z-active-integration-blocked-register.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag15z-next-path-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag15z-to-ag16a-public-visibility-publish-control-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/generated-article-admin-queue-integration-closure.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag15z-generated-article-admin-queue-integration-closure-learning.json");
const registryPath = path.join(root, "data/quality/ag15z-generated-article-admin-queue-integration-closure.json");
const previewPath = path.join(root, "data/quality/ag15z-generated-article-admin-queue-integration-closure-preview.json");
const docPath = path.join(root, "docs/quality/AG15Z_GENERATED_ARTICLE_ADMIN_QUEUE_INTEGRATION_CLOSURE.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG15Z input ${name}: ${relativePath}`);
}

const data = Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, readJson(v)]));

if (data.ag15fReview.status !== "non_active_integration_scaffold_audit_passed_ready_for_ag15z_closure") {
  throw new Error("AG15Z requires AG15F review readiness.");
}
if (data.ag15fAudit.failed_checks.length !== 0) {
  throw new Error("AG15Z requires AG15F audit to pass with zero failed checks.");
}
if (data.ag15fReadiness.ready_for_ag15z !== true) {
  throw new Error("AG15Z requires AG15F readiness.");
}
if (data.ag15fBoundary.next_stage_id !== "AG15Z" || data.ag15fBoundary.explicit_approval_required !== true) {
  throw new Error("AG15Z requires AG15F to AG15Z explicit boundary.");
}

const articlePath = data.ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== data.ag13zCandidate.article_hash) {
  throw new Error("AG15Z requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  generated_article_admin_queue_integration_closure_only: true,
  ag15_chain_closure_created_in_ag15z: true,
  preparation_summary_created_in_ag15z: true,
  active_integration_blocked_register_created_in_ag15z: true,
  ag16a_boundary_created_in_ag15z: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag15z: false,
  article_mutation_performed_in_ag15z: false,
  queue_mutation_performed_in_ag15z: false,
  active_admin_review_queue_record_created_in_ag15z: false,
  queue_index_mutation_performed_in_ag15z: false,
  admin_action_execution_performed_in_ag15z: false,
  editor_action_execution_performed_in_ag15z: false,
  real_credential_created_in_ag15z: false,
  hardcoded_password_created_in_ag15z: false,
  password_hash_created_in_repo_in_ag15z: false,
  auth_activation_performed_in_ag15z: false,
  backend_activation_performed_in_ag15z: false,
  supabase_activation_performed_in_ag15z: false,
  database_write_performed_in_ag15z: false,
  github_token_created_or_exposed_in_ag15z: false,
  github_write_operation_performed_in_ag15z: false,
  active_action_handler_created_in_ag15z: false,
  api_endpoint_created_in_ag15z: false,
  public_visibility_switch_performed_in_ag15z: false,
  public_publishing_operation_performed_in_ag15z: false,
  deployment_trigger_performed_in_ag15z: false
};

const completedStages = [
  {
    stage_id: "AG15A",
    title: "Next Path Decision after Admin Editor Chain Closure",
    result: "Selected generated article to Admin Review Queue integration as the next path."
  },
  {
    stage_id: "AG15B",
    title: "Generated Article to Admin Review Queue Integration Plan",
    result: "Defined article intake schema, queue record schema, quality/preview evidence and batch/failure-state plan."
  },
  {
    stage_id: "AG15C",
    title: "Generated Article Admin Queue Schema Dry-run",
    result: "Mapped existing seed candidate into intake, queue and quality/preview dry-run records without active queue mutation."
  },
  {
    stage_id: "AG15D",
    title: "Schema Dry-run Audit and Integration Readiness",
    result: "Audited schema dry-run and approved only a non-active integration scaffold."
  },
  {
    stage_id: "AG15E",
    title: "Non-active Admin Queue Integration Scaffold",
    result: "Created non-active candidate-to-queue mapper, no-write templates and validation fixture outside /api."
  },
  {
    stage_id: "AG15F",
    title: "Non-active Admin Queue Integration Scaffold Audit",
    result: "Audited scaffold with zero failed checks and confirmed no active queue write, queue-index mutation, visibility switch or publishing."
  }
];

const preparationSummary = {
  module_id: "AG15Z",
  title: "Generated Article Admin Queue Preparation Summary",
  status: "ag15_generated_article_admin_queue_preparation_completed",
  completed_stage_count: completedStages.length,
  completed_stages: completedStages,
  seed_candidate: {
    article_path: articlePath,
    article_hash: currentArticleHash,
    hash_verified: true
  },
  final_preparation_state: {
    generated_article_conveyor_defined: true,
    intake_schema_planned: true,
    admin_queue_record_schema_planned: true,
    quality_evidence_preview_state_planned: true,
    schema_dry_run_passed: true,
    non_active_integration_scaffold_created: true,
    non_active_integration_scaffold_audited: true,
    public_visibility_default: false,
    publish_approved_default: false,
    active_queue_mutation_enabled: false,
    public_visibility_switch_enabled: false,
    publish_execution_enabled: false
  },
  ...stageControls
};

const blockedRegister = {
  module_id: "AG15Z",
  title: "Active Generated Article Queue Integration Blocked Register",
  status: "active_queue_integration_remains_blocked",
  blockers_inherited_from_ag15d: data.ag15dBlockers.blockers_before_active_queue_integration,
  final_ag15_blocked_items: [
    "New article generation.",
    "Article mutation.",
    "Active Admin Review Queue record creation.",
    "Queue-index mutation.",
    "Admin/Editor action execution.",
    "Real credentials.",
    "Auth/backend/Supabase activation.",
    "GitHub write token wiring.",
    "Public visibility switch.",
    "Publishing operation.",
    "Deployment trigger."
  ],
  allowed_after_ag15z_without_new_approval: [
    "Review AG15 planning records.",
    "Review AG15 dry-run records.",
    "Review non-active scaffold files.",
    "Proceed to public visibility and publish-control preparation planning."
  ],
  not_allowed_after_ag15z_without_new_approval: [
    "Generate new articles.",
    "Write active Admin Review Queue records.",
    "Mutate queue index.",
    "Make article publicly visible.",
    "Publish article.",
    "Enable Admin/Editor action execution."
  ],
  ...stageControls
};

const readiness = {
  module_id: "AG15Z",
  title: "Next Path Readiness Record",
  status: "ready_for_ag16a_public_visibility_publish_control_preparation",
  ready_for_ag16a: true,
  ag16a_explicit_approval_required: true,
  ag15_chain_closed: true,
  recommended_next_stage: "AG16A",
  recommended_next_stage_title: "Public Visibility and Publish-Control Preparation",
  reason: "Generated article to Admin Review Queue preparation is complete at governed non-active level. The next missing layer is public visibility and publish-control preparation before any real live publishing.",
  active_queue_mutation_ready: false,
  article_generation_ready: false,
  article_mutation_ready: false,
  queue_mutation_ready: false,
  admin_action_execution_ready: false,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  github_write_ready: false,
  public_visibility_switch_ready: false,
  publish_ready: false,
  ...stageControls
};

const boundary = {
  module_id: "AG15Z",
  title: "AG15Z to AG16A Public Visibility and Publish-Control Boundary",
  status: "ag16a_boundary_created_not_started",
  next_stage_id: "AG16A",
  next_stage_title: "Public Visibility and Publish-Control Preparation",
  explicit_approval_required: true,
  ag16a_allowed_scope: [
    "Plan public visibility state model.",
    "Plan publish-control state model.",
    "Define Featured Reads public/private filtering rules.",
    "Define archive/retain/internal-intelligence behaviour.",
    "Define publish-approved article exposure conditions.",
    "Define public index exclusion rules for non-approved content.",
    "Keep actual visibility switch and publishing blocked."
  ],
  ag16a_blocked_scope: [
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

const closure = {
  module_id: "AG15Z",
  title: "Generated Article Admin Queue Integration Closure",
  status: "generated_article_admin_queue_integration_chain_closed_future_active_integration_blocked",
  closure_scope: [
    "Generated article to Admin Review Queue path selection.",
    "Generated article intake and queue schema planning.",
    "Quality evidence and preview state planning.",
    "Batch validation and failure state planning.",
    "Seed candidate schema dry-run.",
    "Schema dry-run audit.",
    "Non-active candidate-to-queue scaffold.",
    "Non-active scaffold audit."
  ],
  final_decision: {
    ag15_chain_closed: true,
    future_active_queue_integration_blocked: true,
    proceed_to_ag16a_public_visibility_publish_control_preparation: true,
    public_publishing_enabled: false
  },
  ...stageControls
};

const schema = {
  module_id: "AG15Z",
  title: "Generated Article Admin Queue Integration Closure Schema",
  status: "schema_generated_article_admin_queue_integration_closure_only",
  chain_closure_allowed_in_ag15z: true,
  preparation_summary_allowed_in_ag15z: true,
  blocked_register_allowed_in_ag15z: true,
  next_path_boundary_allowed_in_ag15z: true,

  article_generation_allowed_in_ag15z: false,
  article_mutation_allowed_in_ag15z: false,
  queue_mutation_allowed_in_ag15z: false,
  active_admin_review_queue_record_creation_allowed_in_ag15z: false,
  queue_index_mutation_allowed_in_ag15z: false,
  admin_action_execution_allowed_in_ag15z: false,
  editor_action_execution_allowed_in_ag15z: false,
  real_credential_creation_allowed_in_ag15z: false,
  hardcoded_password_allowed_in_ag15z: false,
  password_hash_commit_allowed_in_ag15z: false,
  auth_activation_allowed_in_ag15z: false,
  backend_activation_allowed_in_ag15z: false,
  supabase_activation_allowed_in_ag15z: false,
  database_write_allowed_in_ag15z: false,
  github_token_creation_or_exposure_allowed_in_ag15z: false,
  github_write_operation_allowed_in_ag15z: false,
  active_action_handler_creation_allowed_in_ag15z: false,
  public_visibility_switch_allowed_in_ag15z: false,
  public_publishing_operation_allowed_in_ag15z: false,
  deployment_trigger_allowed_in_ag15z: false,
  ...stageControls
};

const review = {
  module_id: "AG15Z",
  title: "Generated Article Admin Queue Integration Closure",
  status: "generated_article_admin_queue_integration_chain_closed_future_active_integration_blocked",
  depends_on: ["AG15A", "AG15B", "AG15C", "AG15D", "AG15E", "AG15F"],
  generated_from: inputs,
  closure_file: "data/content-intelligence/closure-records/ag15z-generated-article-admin-queue-integration-closure.json",
  preparation_summary_file: "data/content-intelligence/content-pipeline/ag15z-generated-article-admin-queue-preparation-summary.json",
  blocked_register_file: "data/content-intelligence/quality-registry/ag15z-active-integration-blocked-register.json",
  readiness_file: "data/content-intelligence/quality-registry/ag15z-next-path-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag15z-to-ag16a-public-visibility-publish-control-boundary.json",
  schema_file: "data/content-intelligence/schema/generated-article-admin-queue-integration-closure.schema.json",
  summary: {
    completed_stage_count: completedStages.length,
    ag15_chain_closed: true,
    ready_for_ag16a: true,
    active_queue_mutation_ready: false,
    public_visibility_switch_ready: false,
    publish_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG15Z",
  title: "Generated Article Admin Queue Integration Closure Learning",
  status: "learning_record_only",
  learning_points: [
    "Generated article to Admin Review Queue preparation is complete at non-active governed level.",
    "The system now has a deterministic article → evidence → preview → queue schema path.",
    "Active queue mutation remains intentionally blocked until a future controlled apply stage.",
    "The next critical production layer is public visibility and publish-control modelling.",
    "Before real go-live, Drishvara must ensure non-approved articles cannot appear in public indexes."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG15Z",
  title: "Generated Article Admin Queue Integration Closure",
  status: "generated_article_admin_queue_integration_chain_closed_future_active_integration_blocked",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag15z-generated-article-admin-queue-integration-closure.json",
    closure: "data/content-intelligence/closure-records/ag15z-generated-article-admin-queue-integration-closure.json",
    preparation_summary: "data/content-intelligence/content-pipeline/ag15z-generated-article-admin-queue-preparation-summary.json",
    blocked_register: "data/content-intelligence/quality-registry/ag15z-active-integration-blocked-register.json",
    readiness: "data/content-intelligence/quality-registry/ag15z-next-path-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag15z-to-ag16a-public-visibility-publish-control-boundary.json",
    schema: "data/content-intelligence/schema/generated-article-admin-queue-integration-closure.schema.json",
    learning: "data/content-intelligence/learning/ag15z-generated-article-admin-queue-integration-closure-learning.json",
    preview: "data/quality/ag15z-generated-article-admin-queue-integration-closure-preview.json",
    document: "docs/quality/AG15Z_GENERATED_ARTICLE_ADMIN_QUEUE_INTEGRATION_CLOSURE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG15Z",
  preview_only: true,
  status: "generated_article_admin_queue_integration_chain_closed_future_active_integration_blocked",
  completed_stage_count: completedStages.length,
  ag15_chain_closed: true,
  ready_for_ag16a: true,
  active_queue_mutation_ready: false,
  public_visibility_switch_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG15Z — Generated Article Admin Queue Integration Closure

## Purpose

AG15Z closes the generated-article-to-Admin-Review-Queue preparation chain.

AG15Z is closure only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queue indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, switch public visibility or publish anything.

## Completed Chain

- AG15A — next path decision.
- AG15B — generated article to Admin Review Queue integration plan.
- AG15C — schema dry-run.
- AG15D — schema dry-run audit and integration readiness.
- AG15E — non-active integration scaffold.
- AG15F — non-active scaffold audit.

## Final Decision

AG15 chain is closed. Future active queue integration remains blocked.

## Next Stage

AG16A — Public Visibility and Publish-Control Preparation — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(closurePath, closure);
writeJson(summaryPath, preparationSummary);
writeJson(blockedPath, blockedRegister);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG15Z Generated Article Admin Queue Integration Closure generated.");
console.log("✅ AG15A to AG15F chain closed.");
console.log("✅ Active queue integration remains blocked.");
console.log("✅ Public visibility switch and publishing remain blocked.");
console.log("✅ AG16A Public Visibility and Publish-Control boundary created.");
