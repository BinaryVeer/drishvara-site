import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag15zReview: "data/content-intelligence/quality-reviews/ag15z-generated-article-admin-queue-integration-closure.json",
  ag15zClosure: "data/content-intelligence/closure-records/ag15z-generated-article-admin-queue-integration-closure.json",
  ag15zSummary: "data/content-intelligence/content-pipeline/ag15z-generated-article-admin-queue-preparation-summary.json",
  ag15zBlocked: "data/content-intelligence/quality-registry/ag15z-active-integration-blocked-register.json",
  ag15zReadiness: "data/content-intelligence/quality-registry/ag15z-next-path-readiness-record.json",
  ag15zBoundary: "data/content-intelligence/mutation-plans/ag15z-to-ag16a-public-visibility-publish-control-boundary.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  ag13zQueueIndex: "data/admin-review/index/admin-review-queue-index.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag16a-public-visibility-publish-control-preparation.json");
const visibilityModelPath = path.join(root, "data/content-intelligence/content-pipeline/ag16a-public-visibility-state-model.json");
const publishControlModelPath = path.join(root, "data/content-intelligence/content-pipeline/ag16a-publish-control-state-model.json");
const featuredReadsFilterPath = path.join(root, "data/content-intelligence/content-pipeline/ag16a-featured-reads-public-filter-plan.json");
const archiveInternalPlanPath = path.join(root, "data/content-intelligence/content-pipeline/ag16a-archive-internal-intelligence-plan.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag16a-public-visibility-publish-control-schema-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag16a-to-ag16b-public-visibility-publish-filter-schema-plan-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/public-visibility-publish-control-preparation.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag16a-public-visibility-publish-control-preparation-learning.json");
const registryPath = path.join(root, "data/quality/ag16a-public-visibility-publish-control-preparation.json");
const previewPath = path.join(root, "data/quality/ag16a-public-visibility-publish-control-preparation-preview.json");
const docPath = path.join(root, "docs/quality/AG16A_PUBLIC_VISIBILITY_PUBLISH_CONTROL_PREPARATION.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG16A input ${name}: ${relativePath}`);
}

const ag15zReview = readJson(inputs.ag15zReview);
const ag15zClosure = readJson(inputs.ag15zClosure);
const ag15zSummary = readJson(inputs.ag15zSummary);
const ag15zBlocked = readJson(inputs.ag15zBlocked);
const ag15zReadiness = readJson(inputs.ag15zReadiness);
const ag15zBoundary = readJson(inputs.ag15zBoundary);
const ag13zCandidate = readJson(inputs.ag13zCandidate);

if (ag15zReview.status !== "generated_article_admin_queue_integration_chain_closed_future_active_integration_blocked") {
  throw new Error("AG16A requires AG15Z review closure.");
}
if (ag15zClosure.final_decision.ag15_chain_closed !== true) {
  throw new Error("AG16A requires AG15 chain to be closed.");
}
if (ag15zReadiness.ready_for_ag16a !== true) {
  throw new Error("AG16A requires AG15Z readiness.");
}
if (ag15zBoundary.next_stage_id !== "AG16A" || ag15zBoundary.explicit_approval_required !== true) {
  throw new Error("AG16A requires AG15Z to AG16A explicit boundary.");
}

const articlePath = ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG16A requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  public_visibility_publish_control_preparation_only: true,
  public_visibility_state_model_created_in_ag16a: true,
  publish_control_state_model_created_in_ag16a: true,
  featured_reads_public_filter_plan_created_in_ag16a: true,
  archive_internal_intelligence_plan_created_in_ag16a: true,
  ag16b_boundary_created_in_ag16a: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag16a: false,
  article_mutation_performed_in_ag16a: false,
  queue_mutation_performed_in_ag16a: false,
  active_admin_review_queue_record_created_in_ag16a: false,
  queue_index_mutation_performed_in_ag16a: false,
  admin_action_execution_performed_in_ag16a: false,
  editor_action_execution_performed_in_ag16a: false,
  real_credential_created_in_ag16a: false,
  hardcoded_password_created_in_ag16a: false,
  password_hash_created_in_repo_in_ag16a: false,
  auth_activation_performed_in_ag16a: false,
  backend_activation_performed_in_ag16a: false,
  supabase_activation_performed_in_ag16a: false,
  database_write_performed_in_ag16a: false,
  github_token_created_or_exposed_in_ag16a: false,
  github_write_operation_performed_in_ag16a: false,
  active_action_handler_created_in_ag16a: false,
  api_endpoint_created_in_ag16a: false,
  public_visibility_switch_performed_in_ag16a: false,
  public_index_mutation_performed_in_ag16a: false,
  public_publishing_operation_performed_in_ag16a: false,
  deployment_trigger_performed_in_ag16a: false
};

const visibilityModel = {
  module_id: "AG16A",
  title: "Public Visibility State Model",
  status: "public_visibility_state_model_defined",
  purpose: "Define the public/private visibility states that control whether a generated article can appear in public Drishvara surfaces.",
  default_state: {
    public_visibility: false,
    publish_approved: false,
    public_index_allowed: false,
    featured_reads_allowed: false
  },
  visibility_states: [
    {
      state: "internal_generated",
      public_visibility: false,
      publish_approved: false,
      public_index_allowed: false,
      featured_reads_allowed: false,
      description: "Generated or prepared content not yet ready for Admin review."
    },
    {
      state: "ready_for_admin_review",
      public_visibility: false,
      publish_approved: false,
      public_index_allowed: false,
      featured_reads_allowed: false,
      description: "Candidate is available for Admin review only."
    },
    {
      state: "returned_for_correction",
      public_visibility: false,
      publish_approved: false,
      public_index_allowed: false,
      featured_reads_allowed: false,
      description: "Returned to Editor/manual correction; must not appear publicly."
    },
    {
      state: "archived_internal",
      public_visibility: false,
      publish_approved: false,
      public_index_allowed: false,
      featured_reads_allowed: false,
      description: "Retained as internal intelligence and not shown publicly."
    },
    {
      state: "publish_approved_pending_exposure",
      public_visibility: false,
      publish_approved: true,
      public_index_allowed: false,
      featured_reads_allowed: false,
      description: "Admin approval exists, but public exposure has not yet been executed."
    },
    {
      state: "public_published",
      public_visibility: true,
      publish_approved: true,
      public_index_allowed: true,
      featured_reads_allowed: true,
      description: "Only this state can appear in public Featured Reads and public indexes."
    },
    {
      state: "published_closed",
      public_visibility: true,
      publish_approved: true,
      public_index_allowed: true,
      featured_reads_allowed: true,
      description: "Published and closed from further ordinary workflow changes."
    }
  ],
  hard_rule: "No article may appear in public Featured Reads or public article indexes unless public_visibility=true and publish_approved=true.",
  ...stageControls
};

const publishControlModel = {
  module_id: "AG16A",
  title: "Publish-Control State Model",
  status: "publish_control_state_model_defined",
  purpose: "Define the planned controls that must be satisfied before an article can move from Admin review to public exposure.",
  publish_control_gates: [
    {
      gate_id: "admin_decision_gate",
      required: true,
      requirement: "Admin decision must be Publish or Publish and close."
    },
    {
      gate_id: "quality_evidence_gate",
      required: true,
      requirement: "Reference, credit, object, layout, preview and hash evidence must be present or explicitly not applicable."
    },
    {
      gate_id: "hash_integrity_gate",
      required: true,
      requirement: "Article hash at approval must match the candidate record."
    },
    {
      gate_id: "visibility_state_gate",
      required: true,
      requirement: "Candidate must not already be in returned, archived or blocked state."
    },
    {
      gate_id: "public_index_gate",
      required: true,
      requirement: "Public index update must be separately controlled and auditable."
    }
  ],
  allowed_admin_publish_actions_later: [
    "publish",
    "publish_and_close"
  ],
  blocked_until_later_stage: [
    "Actual Admin button execution.",
    "Article mutation.",
    "Queue mutation.",
    "Public index mutation.",
    "Visibility switch.",
    "Publishing operation.",
    "Deployment trigger."
  ],
  ...stageControls
};

const featuredReadsFilterPlan = {
  module_id: "AG16A",
  title: "Featured Reads Public Filter Plan",
  status: "featured_reads_public_filter_plan_defined",
  purpose: "Plan the filtering rule for public Featured Reads and article listing surfaces.",
  filter_rule: {
    include_if_all_true: [
      "public_visibility === true",
      "publish_approved === true",
      "status in ['public_published', 'published_closed']",
      "article_path exists",
      "article_hash matches latest approved record"
    ],
    exclude_if_any_true: [
      "public_visibility === false",
      "publish_approved === false",
      "status in ['internal_generated', 'ready_for_admin_review', 'returned_for_correction', 'archived_internal']",
      "quality_evidence missing",
      "preview_record missing",
      "hash mismatch"
    ]
  },
  affected_public_surfaces_planned: [
    "Featured Reads listing",
    "Category article listing",
    "Homepage article cards",
    "Search/discovery index if activated later",
    "Sitemap or public feed if activated later"
  ],
  non_public_surfaces_planned: [
    "Admin Review Queue",
    "Editor correction workspace",
    "Internal archive/intelligence registry",
    "Quality audit records"
  ],
  ...stageControls
};

const archiveInternalPlan = {
  module_id: "AG16A",
  title: "Archive and Internal Intelligence Plan",
  status: "archive_internal_intelligence_plan_defined",
  purpose: "Ensure rejected, returned or archived generated articles are retained for learning and intelligence without public exposure.",
  archive_states: [
    {
      state: "archived_internal",
      public_visibility: false,
      publish_approved: false,
      retain_content: true,
      retain_quality_records: true,
      retain_object_records: true,
      public_exposure_allowed: false
    },
    {
      state: "returned_for_correction",
      public_visibility: false,
      publish_approved: false,
      retain_content: true,
      retain_quality_records: true,
      retain_object_records: true,
      public_exposure_allowed: false
    },
    {
      state: "blocked_quality_issue",
      public_visibility: false,
      publish_approved: false,
      retain_content: true,
      retain_quality_records: true,
      retain_object_records: true,
      public_exposure_allowed: false
    }
  ],
  retention_principle: "Do not delete non-published generated articles by default; retain them as internal intelligence unless there is a separate deletion/legal/privacy reason.",
  ...stageControls
};

const readiness = {
  module_id: "AG16A",
  title: "Public Visibility Publish-Control Schema Readiness Record",
  status: "ready_for_ag16b_public_visibility_publish_filter_schema_plan",
  ready_for_ag16b: true,
  ag16b_explicit_approval_required: true,
  visibility_model_defined: true,
  publish_control_model_defined: true,
  featured_reads_filter_plan_defined: true,
  archive_internal_intelligence_plan_defined: true,
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
  reason: "AG16A defines the public visibility and publish-control doctrine only. AG16B should translate this into schema/filter rules without executing visibility or publishing.",
  ...stageControls
};

const boundary = {
  module_id: "AG16A",
  title: "AG16A to AG16B Public Visibility Publish Filter Schema Plan Boundary",
  status: "ag16b_boundary_created_not_started",
  next_stage_id: "AG16B",
  next_stage_title: "Public Visibility and Publish Filter Schema Plan",
  explicit_approval_required: true,
  ag16b_allowed_scope: [
    "Define public visibility schema fields.",
    "Define publish-control schema fields.",
    "Define Featured Reads filtering schema.",
    "Define public/private article listing contract.",
    "Define archive/internal-intelligence exclusion contract.",
    "Define validation checks for public exposure eligibility."
  ],
  ag16b_blocked_scope: [
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
  module_id: "AG16A",
  title: "Public Visibility Publish-Control Preparation Schema",
  status: "schema_public_visibility_publish_control_preparation_only",
  public_visibility_state_model_allowed_in_ag16a: true,
  publish_control_state_model_allowed_in_ag16a: true,
  featured_reads_filter_plan_allowed_in_ag16a: true,
  archive_internal_intelligence_plan_allowed_in_ag16a: true,
  ag16b_boundary_allowed_in_ag16a: true,

  article_generation_allowed_in_ag16a: false,
  article_mutation_allowed_in_ag16a: false,
  queue_mutation_allowed_in_ag16a: false,
  active_admin_review_queue_record_creation_allowed_in_ag16a: false,
  queue_index_mutation_allowed_in_ag16a: false,
  admin_action_execution_allowed_in_ag16a: false,
  editor_action_execution_allowed_in_ag16a: false,
  real_credential_creation_allowed_in_ag16a: false,
  hardcoded_password_allowed_in_ag16a: false,
  password_hash_commit_allowed_in_ag16a: false,
  auth_activation_allowed_in_ag16a: false,
  backend_activation_allowed_in_ag16a: false,
  supabase_activation_allowed_in_ag16a: false,
  database_write_allowed_in_ag16a: false,
  github_token_creation_or_exposure_allowed_in_ag16a: false,
  github_write_operation_allowed_in_ag16a: false,
  active_action_handler_creation_allowed_in_ag16a: false,
  public_visibility_switch_allowed_in_ag16a: false,
  public_index_mutation_allowed_in_ag16a: false,
  public_publishing_operation_allowed_in_ag16a: false,
  deployment_trigger_allowed_in_ag16a: false,
  ...stageControls
};

const review = {
  module_id: "AG16A",
  title: "Public Visibility and Publish-Control Preparation",
  status: "public_visibility_publish_control_preparation_defined",
  depends_on: ["AG15Z"],
  generated_from: inputs,
  visibility_model_file: "data/content-intelligence/content-pipeline/ag16a-public-visibility-state-model.json",
  publish_control_model_file: "data/content-intelligence/content-pipeline/ag16a-publish-control-state-model.json",
  featured_reads_filter_plan_file: "data/content-intelligence/content-pipeline/ag16a-featured-reads-public-filter-plan.json",
  archive_internal_plan_file: "data/content-intelligence/content-pipeline/ag16a-archive-internal-intelligence-plan.json",
  readiness_file: "data/content-intelligence/quality-registry/ag16a-public-visibility-publish-control-schema-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag16a-to-ag16b-public-visibility-publish-filter-schema-plan-boundary.json",
  schema_file: "data/content-intelligence/schema/public-visibility-publish-control-preparation.schema.json",
  summary: {
    public_visibility_default: false,
    publish_approved_default: false,
    only_public_if_visibility_and_approval_true: true,
    ready_for_ag16b: true,
    publish_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG16A",
  title: "Public Visibility Publish-Control Preparation Learning",
  status: "learning_record_only",
  learning_points: [
    "Generated article queue preparation is not enough for go-live; public exposure needs an independent visibility model.",
    "public_visibility and publish_approved must both be true before any public surface includes an article.",
    "Admin approval and public index mutation should remain separate control points.",
    "Archived or returned articles should remain internal intelligence, not public content.",
    "AG16B should convert this doctrine into schema and filter rules before any apply stage."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG16A",
  title: "Public Visibility and Publish-Control Preparation",
  status: "public_visibility_publish_control_preparation_defined",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag16a-public-visibility-publish-control-preparation.json",
    visibility_model: "data/content-intelligence/content-pipeline/ag16a-public-visibility-state-model.json",
    publish_control_model: "data/content-intelligence/content-pipeline/ag16a-publish-control-state-model.json",
    featured_reads_filter_plan: "data/content-intelligence/content-pipeline/ag16a-featured-reads-public-filter-plan.json",
    archive_internal_plan: "data/content-intelligence/content-pipeline/ag16a-archive-internal-intelligence-plan.json",
    readiness: "data/content-intelligence/quality-registry/ag16a-public-visibility-publish-control-schema-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag16a-to-ag16b-public-visibility-publish-filter-schema-plan-boundary.json",
    schema: "data/content-intelligence/schema/public-visibility-publish-control-preparation.schema.json",
    learning: "data/content-intelligence/learning/ag16a-public-visibility-publish-control-preparation-learning.json",
    preview: "data/quality/ag16a-public-visibility-publish-control-preparation-preview.json",
    document: "docs/quality/AG16A_PUBLIC_VISIBILITY_PUBLISH_CONTROL_PREPARATION.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG16A",
  preview_only: true,
  status: "public_visibility_publish_control_preparation_defined",
  public_visibility_default: false,
  publish_approved_default: false,
  public_exposure_requires_both_true: true,
  ready_for_ag16b: true,
  public_visibility_switch_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG16A — Public Visibility and Publish-Control Preparation

## Purpose

AG16A defines the public visibility and publish-control doctrine after AG15 closure.

AG16A is preparation only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, switch public visibility, mutate public indexes or publish anything.

## Core Rule

An article may appear in public Featured Reads or public article indexes only when both conditions are true:

- public_visibility: true
- publish_approved: true

## Planned Controls

- Public visibility state model
- Publish-control state model
- Featured Reads public filter plan
- Archive/internal-intelligence retention plan

## Next Stage

AG16B — Public Visibility and Publish Filter Schema Plan — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(visibilityModelPath, visibilityModel);
writeJson(publishControlModelPath, publishControlModel);
writeJson(featuredReadsFilterPath, featuredReadsFilterPlan);
writeJson(archiveInternalPlanPath, archiveInternalPlan);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG16A Public Visibility and Publish-Control Preparation generated.");
console.log("✅ Public visibility state model created.");
console.log("✅ Publish-control state model created.");
console.log("✅ Featured Reads public filter plan created.");
console.log("✅ Archive/internal-intelligence retention plan created.");
console.log("✅ AG16B public visibility and publish-filter schema boundary created.");
console.log("✅ No visibility switch, public index mutation or publishing performed.");
