import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag15aReview: "data/content-intelligence/quality-reviews/ag15a-next-path-decision-after-admin-editor-chain-closure.json",
  ag15aDecision: "data/content-intelligence/content-pipeline/ag15a-next-path-decision-record.json",
  ag15aConveyor: "data/content-intelligence/content-pipeline/ag15a-generated-article-admin-queue-conveyor-scope-record.json",
  ag15aReadiness: "data/content-intelligence/quality-registry/ag15a-generated-article-admin-queue-integration-readiness-record.json",
  ag15aBoundary: "data/content-intelligence/mutation-plans/ag15a-to-ag15b-generated-article-admin-queue-integration-plan-boundary.json",
  ag14zBlocked: "data/content-intelligence/quality-registry/ag14z-live-implementation-blocked-register.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  ag13zQueueIndex: "data/admin-review/index/admin-review-queue-index.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag15b-generated-article-admin-queue-integration-plan.json");
const intakePlanPath = path.join(root, "data/content-intelligence/content-pipeline/ag15b-generated-article-intake-record-schema-plan.json");
const queueSchemaPlanPath = path.join(root, "data/content-intelligence/content-pipeline/ag15b-admin-review-queue-record-schema-plan.json");
const qualityPreviewPlanPath = path.join(root, "data/content-intelligence/content-pipeline/ag15b-quality-evidence-preview-state-plan.json");
const batchFailurePlanPath = path.join(root, "data/content-intelligence/content-pipeline/ag15b-batch-validation-and-failure-state-plan.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag15b-generated-article-admin-queue-schema-dry-run-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag15b-to-ag15c-generated-article-admin-queue-schema-dry-run-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/generated-article-admin-queue-integration-plan.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag15b-generated-article-admin-queue-integration-plan-learning.json");
const registryPath = path.join(root, "data/quality/ag15b-generated-article-admin-queue-integration-plan.json");
const previewPath = path.join(root, "data/quality/ag15b-generated-article-admin-queue-integration-plan-preview.json");
const docPath = path.join(root, "docs/quality/AG15B_GENERATED_ARTICLE_ADMIN_QUEUE_INTEGRATION_PLAN.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG15B input ${name}: ${relativePath}`);
}

const ag15aReview = readJson(inputs.ag15aReview);
const ag15aDecision = readJson(inputs.ag15aDecision);
const ag15aConveyor = readJson(inputs.ag15aConveyor);
const ag15aReadiness = readJson(inputs.ag15aReadiness);
const ag15aBoundary = readJson(inputs.ag15aBoundary);
const ag14zBlocked = readJson(inputs.ag14zBlocked);
const ag13zCandidate = readJson(inputs.ag13zCandidate);
const ag13zQueueIndex = readJson(inputs.ag13zQueueIndex);

if (ag15aReview.status !== "next_path_decision_completed_content_queue_integration_selected") {
  throw new Error("AG15B requires AG15A review.");
}
if (ag15aDecision.selected_path.next_stage_id !== "AG15B") {
  throw new Error("AG15B requires AG15A to select AG15B.");
}
if (ag15aReadiness.ready_for_ag15b !== true) {
  throw new Error("AG15B requires AG15A readiness.");
}
if (ag15aBoundary.next_stage_id !== "AG15B" || ag15aBoundary.explicit_approval_required !== true) {
  throw new Error("AG15B requires AG15A to AG15B explicit boundary.");
}

const selectedArticlePath = ag13zCandidate.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG15B requires AG13Z seed candidate hash to remain unchanged.");
}

const stageControls = {
  generated_article_admin_queue_integration_plan_only: true,
  generated_article_intake_schema_plan_created_in_ag15b: true,
  admin_review_queue_record_schema_plan_created_in_ag15b: true,
  quality_evidence_preview_state_plan_created_in_ag15b: true,
  batch_validation_failure_state_plan_created_in_ag15b: true,
  ag15c_boundary_created_in_ag15b: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag15b: false,
  article_mutation_performed_in_ag15b: false,
  queue_mutation_performed_in_ag15b: false,
  admin_review_queue_record_created_in_ag15b: false,
  queue_index_mutation_performed_in_ag15b: false,
  admin_action_execution_performed_in_ag15b: false,
  editor_action_execution_performed_in_ag15b: false,
  real_credential_created_in_ag15b: false,
  hardcoded_password_created_in_ag15b: false,
  password_hash_created_in_repo_in_ag15b: false,
  auth_activation_performed_in_ag15b: false,
  backend_activation_performed_in_ag15b: false,
  supabase_activation_performed_in_ag15b: false,
  database_write_performed_in_ag15b: false,
  github_token_created_or_exposed_in_ag15b: false,
  github_write_operation_performed_in_ag15b: false,
  active_action_handler_created_in_ag15b: false,
  api_endpoint_created_in_ag15b: false,
  public_visibility_switch_performed_in_ag15b: false,
  public_publishing_operation_performed_in_ag15b: false,
  deployment_trigger_performed_in_ag15b: false
};

const intakePlan = {
  module_id: "AG15B",
  title: "Generated Article Intake Record Schema Plan",
  status: "generated_article_intake_schema_plan_defined",
  purpose: "Define the minimum intake metadata every future generated article must carry before Admin Review Queue handoff.",
  intake_principle: "A generated article is not queue-ready unless it has identity, source, category, article path, quality evidence pointer, preview state and default non-public visibility.",
  required_intake_fields: [
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
    public_visibility: false,
    publish_approved: false,
    queue_target: "admin_review_queue",
    status: "generated_pending_quality_evidence"
  },
  object_profile_values: [
    "text_only",
    "image_only",
    "object_light",
    "object_rich",
    "data_supported"
  ],
  source_trace_requirement: "Every generated article must retain traceability to generation source, content plan, references, object decisions and quality evidence.",
  ...stageControls
};

const queueSchemaPlan = {
  module_id: "AG15B",
  title: "Admin Review Queue Record Schema Plan",
  status: "admin_review_queue_record_schema_plan_defined",
  purpose: "Define the planned queue record shape for every future generated article that passes intake and quality evidence gates.",
  planned_queue_record_schema: {
    article_id: "string",
    slug: "string",
    title: "string",
    category: "string",
    article_path: "string",
    article_hash: "sha256",
    generation_batch_id: "string",
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
    created_at: "iso_timestamp",
    updated_at: "iso_timestamp",
    audit_pointer: "future_audit_path_or_null"
  },
  required_default_publication_controls: {
    public_visibility: false,
    publish_approved: false,
    public_publish_execution_active: false
  },
  planned_statuses: [
    "generated_pending_quality_evidence",
    "quality_evidence_ready",
    "ready_for_admin_review",
    "returned_for_correction",
    "editor_revision",
    "resubmitted_to_admin",
    "archived",
    "published",
    "published_closed"
  ],
  queue_index_policy: "Queue index should include only metadata needed for Admin listing; detailed evidence should remain in the candidate record.",
  ...stageControls
};

const qualityPreviewPlan = {
  module_id: "AG15B",
  title: "Quality Evidence and Preview State Plan",
  status: "quality_evidence_preview_state_plan_defined",
  purpose: "Define required evidence before a generated article can be routed to Admin Review Queue.",
  mandatory_quality_evidence: [
    {
      evidence_id: "reference_evidence",
      required: true,
      description: "Reference links verified, or explicitly marked under editorial verification."
    },
    {
      evidence_id: "credit_evidence",
      required: true,
      description: "Image/object credits present where applicable."
    },
    {
      evidence_id: "object_evidence",
      required: true,
      description: "Generated image/chart/infographic/diagram/table/map/composite objects have approval or not-applicable status."
    },
    {
      evidence_id: "layout_evidence",
      required: true,
      description: "Article layout and object placement have passed readability and mobile-safety checks."
    },
    {
      evidence_id: "preview_evidence",
      required: true,
      description: "Local or live preview observation record exists before Admin queue handoff."
    },
    {
      evidence_id: "hash_evidence",
      required: true,
      description: "Article hash recorded at queue handoff."
    }
  ],
  preview_state_model: {
    preview_required_before_queue: true,
    preview_type_allowed: ["local_preview", "controlled_live_preview", "static_html_preview"],
    preview_record_required_fields: [
      "preview_path_or_url",
      "preview_timestamp",
      "article_hash_at_preview",
      "layout_observation",
      "object_observation",
      "mobile_observation",
      "known_issues"
    ]
  },
  default_publication_state_at_preview: {
    public_visibility: false,
    publish_approved: false
  },
  ...stageControls
};

const batchFailurePlan = {
  module_id: "AG15B",
  title: "Batch Validation and Failure State Plan",
  status: "batch_validation_failure_state_plan_defined",
  purpose: "Define checks needed when multiple generated articles are routed toward Admin Review Queue.",
  batch_validation_checks: [
    "No duplicate article_id.",
    "No duplicate slug in same category.",
    "Article path exists.",
    "Article hash exists and matches file.",
    "Title and category exist.",
    "Reference evidence present.",
    "Credit evidence present where applicable.",
    "Object evidence present where applicable.",
    "Preview evidence present.",
    "public_visibility is false by default.",
    "publish_approved is false by default.",
    "Queue status is non-public before Admin decision.",
    "Queue index and candidate records are consistent.",
    "Broken-link risk is flagged where verification is incomplete.",
    "Mobile/layout risk is flagged where unresolved."
  ],
  failure_states: [
    {
      state: "blocked_missing_required_metadata",
      public_visibility: false,
      publish_approved: false,
      action: "do_not_queue_until_fixed"
    },
    {
      state: "blocked_missing_quality_evidence",
      public_visibility: false,
      publish_approved: false,
      action: "hold_in_generation_output"
    },
    {
      state: "blocked_reference_under_verification",
      public_visibility: false,
      publish_approved: false,
      action: "queue_only_if_editorial_verification_note_present"
    },
    {
      state: "blocked_layout_mobile_risk",
      public_visibility: false,
      publish_approved: false,
      action: "return_to_layout_review"
    },
    {
      state: "archived_non_public",
      public_visibility: false,
      publish_approved: false,
      action: "retain_for_intelligence_not_publication"
    }
  ],
  object_routing_logic: [
    {
      object_profile: "text_only",
      required_evidence: ["reference_evidence", "preview_evidence", "hash_evidence"]
    },
    {
      object_profile: "image_only",
      required_evidence: ["reference_evidence", "credit_evidence", "object_evidence", "preview_evidence", "hash_evidence"]
    },
    {
      object_profile: "object_rich",
      required_evidence: ["reference_evidence", "credit_evidence", "object_evidence", "layout_evidence", "preview_evidence", "hash_evidence"]
    },
    {
      object_profile: "data_supported",
      required_evidence: ["source_data_evidence", "reference_evidence", "object_evidence", "layout_evidence", "preview_evidence", "hash_evidence"]
    }
  ],
  ...stageControls
};

const readiness = {
  module_id: "AG15B",
  title: "Generated Article Admin Queue Schema Dry-run Readiness Record",
  status: "ready_for_ag15c_generated_article_admin_queue_schema_dry_run",
  ready_for_ag15c: true,
  ag15c_explicit_approval_required: true,
  integration_plan_complete: true,
  intake_schema_plan_defined: true,
  queue_record_schema_plan_defined: true,
  quality_preview_plan_defined: true,
  batch_failure_plan_defined: true,
  article_generation_ready: false,
  article_mutation_ready: false,
  queue_mutation_ready: false,
  admin_action_execution_ready: false,
  real_auth_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  github_write_ready: false,
  publish_ready: false,
  reason: "AG15B defines the plan only. AG15C should perform a schema dry-run using existing seed candidate data without generating or mutating articles/queues.",
  ...stageControls
};

const boundary = {
  module_id: "AG15B",
  title: "AG15B to AG15C Generated Article Admin Queue Schema Dry-run Boundary",
  status: "ag15c_boundary_created_not_started",
  next_stage_id: "AG15C",
  next_stage_title: "Generated Article Admin Queue Schema Dry-run",
  explicit_approval_required: true,
  ag15c_allowed_scope: [
    "Create dry-run schema records using existing seed candidate data.",
    "Validate intake schema shape without queue mutation.",
    "Validate Admin queue record shape without writing to active queue.",
    "Validate default public_visibility false and publish_approved false.",
    "Validate quality-evidence and preview-state field completeness.",
    "Record dry-run readiness for future integration."
  ],
  ag15c_blocked_scope: [
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
  module_id: "AG15B",
  title: "Generated Article Admin Queue Integration Plan Schema",
  status: "schema_generated_article_admin_queue_integration_plan_only",
  intake_schema_plan_allowed_in_ag15b: true,
  admin_queue_record_schema_plan_allowed_in_ag15b: true,
  quality_preview_state_plan_allowed_in_ag15b: true,
  batch_validation_failure_state_plan_allowed_in_ag15b: true,
  ag15c_boundary_allowed_in_ag15b: true,

  article_generation_allowed_in_ag15b: false,
  article_mutation_allowed_in_ag15b: false,
  queue_mutation_allowed_in_ag15b: false,
  admin_review_queue_record_creation_allowed_in_ag15b: false,
  queue_index_mutation_allowed_in_ag15b: false,
  admin_action_execution_allowed_in_ag15b: false,
  editor_action_execution_allowed_in_ag15b: false,
  real_credential_creation_allowed_in_ag15b: false,
  hardcoded_password_allowed_in_ag15b: false,
  password_hash_commit_allowed_in_ag15b: false,
  auth_activation_allowed_in_ag15b: false,
  backend_activation_allowed_in_ag15b: false,
  supabase_activation_allowed_in_ag15b: false,
  database_write_allowed_in_ag15b: false,
  github_token_creation_or_exposure_allowed_in_ag15b: false,
  github_write_operation_allowed_in_ag15b: false,
  active_action_handler_creation_allowed_in_ag15b: false,
  public_visibility_switch_allowed_in_ag15b: false,
  public_publishing_operation_allowed_in_ag15b: false,
  deployment_trigger_allowed_in_ag15b: false,
  ...stageControls
};

const review = {
  module_id: "AG15B",
  title: "Generated Article to Admin Review Queue Integration Plan",
  status: "generated_article_admin_queue_integration_plan_defined",
  depends_on: ["AG15A"],
  generated_from: inputs,
  intake_plan_file: "data/content-intelligence/content-pipeline/ag15b-generated-article-intake-record-schema-plan.json",
  queue_schema_plan_file: "data/content-intelligence/content-pipeline/ag15b-admin-review-queue-record-schema-plan.json",
  quality_preview_plan_file: "data/content-intelligence/content-pipeline/ag15b-quality-evidence-preview-state-plan.json",
  batch_failure_plan_file: "data/content-intelligence/content-pipeline/ag15b-batch-validation-and-failure-state-plan.json",
  readiness_file: "data/content-intelligence/quality-registry/ag15b-generated-article-admin-queue-schema-dry-run-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag15b-to-ag15c-generated-article-admin-queue-schema-dry-run-boundary.json",
  schema_file: "data/content-intelligence/schema/generated-article-admin-queue-integration-plan.schema.json",
  summary: {
    conveyor: "generated_article_to_quality_evidence_to_preview_state_to_admin_queue",
    default_public_visibility: false,
    default_publish_approved: false,
    ready_for_ag15c: true,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG15B",
  title: "Generated Article Admin Queue Integration Plan Learning",
  status: "learning_record_only",
  learning_points: [
    "Generated article quality is strong; the key production need is deterministic queue handoff.",
    "Every generated article should enter Admin Review Queue only after quality evidence and preview state are recorded.",
    "public_visibility and publish_approved must default to false.",
    "Object-rich articles require stronger evidence than text-only articles.",
    "Rejected or archived generated articles should remain useful as internal intelligence, not be deleted."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG15B",
  title: "Generated Article to Admin Review Queue Integration Plan",
  status: "generated_article_admin_queue_integration_plan_defined",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag15b-generated-article-admin-queue-integration-plan.json",
    intake_plan: "data/content-intelligence/content-pipeline/ag15b-generated-article-intake-record-schema-plan.json",
    queue_schema_plan: "data/content-intelligence/content-pipeline/ag15b-admin-review-queue-record-schema-plan.json",
    quality_preview_plan: "data/content-intelligence/content-pipeline/ag15b-quality-evidence-preview-state-plan.json",
    batch_failure_plan: "data/content-intelligence/content-pipeline/ag15b-batch-validation-and-failure-state-plan.json",
    readiness: "data/content-intelligence/quality-registry/ag15b-generated-article-admin-queue-schema-dry-run-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag15b-to-ag15c-generated-article-admin-queue-schema-dry-run-boundary.json",
    schema: "data/content-intelligence/schema/generated-article-admin-queue-integration-plan.schema.json",
    learning: "data/content-intelligence/learning/ag15b-generated-article-admin-queue-integration-plan-learning.json",
    preview: "data/quality/ag15b-generated-article-admin-queue-integration-plan-preview.json",
    document: "docs/quality/AG15B_GENERATED_ARTICLE_ADMIN_QUEUE_INTEGRATION_PLAN.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG15B",
  preview_only: true,
  status: "generated_article_admin_queue_integration_plan_defined",
  conveyor: "generated article → quality evidence → preview state → Admin Review Queue",
  default_public_visibility: false,
  default_publish_approved: false,
  ready_for_ag15c: true,
  article_generation_ready: false,
  queue_mutation_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG15B — Generated Article to Admin Review Queue Integration Plan

## Purpose

AG15B defines the production conveyor from future generated article to Admin Review Queue.

AG15B is planning only. It does not generate articles, mutate articles, mutate queues, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, switch public visibility or publish anything.

## Conveyor

Generated article → quality evidence → preview state → Admin Review Queue.

## Default Publication Controls

- public_visibility: false
- publish_approved: false

## Planned Evidence Gates

- Reference evidence
- Credit evidence
- Object evidence
- Layout evidence
- Preview evidence
- Hash evidence

## Next Stage

AG15C — Generated Article Admin Queue Schema Dry-run — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(intakePlanPath, intakePlan);
writeJson(queueSchemaPlanPath, queueSchemaPlan);
writeJson(qualityPreviewPlanPath, qualityPreviewPlan);
writeJson(batchFailurePlanPath, batchFailurePlan);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG15B Generated Article to Admin Review Queue Integration Plan generated.");
console.log("✅ Intake schema plan, queue record schema plan, quality/preview plan and batch/failure plan created.");
console.log("✅ Default controls recorded: public_visibility=false, publish_approved=false.");
console.log("✅ AG15C schema dry-run boundary created.");
console.log("✅ No article generation, article mutation, queue mutation, visibility switch or publishing performed.");
