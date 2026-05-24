import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag16aReview: "data/content-intelligence/quality-reviews/ag16a-public-visibility-publish-control-preparation.json",
  ag16aVisibilityModel: "data/content-intelligence/content-pipeline/ag16a-public-visibility-state-model.json",
  ag16aPublishControlModel: "data/content-intelligence/content-pipeline/ag16a-publish-control-state-model.json",
  ag16aFeaturedReadsFilterPlan: "data/content-intelligence/content-pipeline/ag16a-featured-reads-public-filter-plan.json",
  ag16aArchivePlan: "data/content-intelligence/content-pipeline/ag16a-archive-internal-intelligence-plan.json",
  ag16aReadiness: "data/content-intelligence/quality-registry/ag16a-public-visibility-publish-control-schema-readiness-record.json",
  ag16aBoundary: "data/content-intelligence/mutation-plans/ag16a-to-ag16b-public-visibility-publish-filter-schema-plan-boundary.json",
  ag15zReadiness: "data/content-intelligence/quality-registry/ag15z-next-path-readiness-record.json",
  ag13zCandidate: "data/admin-review/queue/enhancing-public-healthcare-delivery-digital-innovation.json",
  ag13zQueueIndex: "data/admin-review/index/admin-review-queue-index.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag16b-public-visibility-publish-filter-schema-plan.json");
const visibilityFieldSchemaPath = path.join(root, "data/content-intelligence/content-pipeline/ag16b-public-visibility-field-schema-plan.json");
const publishFieldSchemaPath = path.join(root, "data/content-intelligence/content-pipeline/ag16b-publish-control-field-schema-plan.json");
const publicSurfaceFilterPath = path.join(root, "data/content-intelligence/content-pipeline/ag16b-public-surface-filter-contract.json");
const exclusionContractPath = path.join(root, "data/content-intelligence/content-pipeline/ag16b-public-surface-exclusion-contract.json");
const validationPlanPath = path.join(root, "data/content-intelligence/content-pipeline/ag16b-public-visibility-filter-validation-plan.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag16b-public-visibility-filter-schema-dry-run-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag16b-to-ag16c-public-visibility-filter-schema-dry-run-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/public-visibility-publish-filter-schema-plan.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag16b-public-visibility-publish-filter-schema-plan-learning.json");
const registryPath = path.join(root, "data/quality/ag16b-public-visibility-publish-filter-schema-plan.json");
const previewPath = path.join(root, "data/quality/ag16b-public-visibility-publish-filter-schema-plan-preview.json");
const docPath = path.join(root, "docs/quality/AG16B_PUBLIC_VISIBILITY_PUBLISH_FILTER_SCHEMA_PLAN.md");

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
  if (!exists(relativePath)) throw new Error(`Missing AG16B input ${name}: ${relativePath}`);
}

const ag16aReview = readJson(inputs.ag16aReview);
const ag16aVisibilityModel = readJson(inputs.ag16aVisibilityModel);
const ag16aPublishControlModel = readJson(inputs.ag16aPublishControlModel);
const ag16aFeaturedReadsFilterPlan = readJson(inputs.ag16aFeaturedReadsFilterPlan);
const ag16aArchivePlan = readJson(inputs.ag16aArchivePlan);
const ag16aReadiness = readJson(inputs.ag16aReadiness);
const ag16aBoundary = readJson(inputs.ag16aBoundary);
const ag15zReadiness = readJson(inputs.ag15zReadiness);
const ag13zCandidate = readJson(inputs.ag13zCandidate);

if (ag16aReview.status !== "public_visibility_publish_control_preparation_defined") {
  throw new Error("AG16B requires AG16A review.");
}
if (ag16aReadiness.ready_for_ag16b !== true) {
  throw new Error("AG16B requires AG16A readiness.");
}
if (ag16aBoundary.next_stage_id !== "AG16B" || ag16aBoundary.explicit_approval_required !== true) {
  throw new Error("AG16B requires AG16A to AG16B explicit boundary.");
}
if (ag15zReadiness.ready_for_ag16a !== true) {
  throw new Error("AG16B requires AG15Z readiness lineage.");
}

const articlePath = ag13zCandidate.selected_article_path;
if (!exists(articlePath)) throw new Error(`Selected article missing: ${articlePath}`);

const currentArticleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
if (currentArticleHash !== ag13zCandidate.article_hash) {
  throw new Error("AG16B requires seed candidate article hash to remain unchanged.");
}

const stageControls = {
  public_visibility_publish_filter_schema_plan_only: true,
  public_visibility_field_schema_plan_created_in_ag16b: true,
  publish_control_field_schema_plan_created_in_ag16b: true,
  public_surface_filter_contract_created_in_ag16b: true,
  public_surface_exclusion_contract_created_in_ag16b: true,
  validation_plan_created_in_ag16b: true,
  ag16c_boundary_created_in_ag16b: true,
  selected_article_read_performed: true,

  article_generation_performed_in_ag16b: false,
  article_mutation_performed_in_ag16b: false,
  queue_mutation_performed_in_ag16b: false,
  active_admin_review_queue_record_created_in_ag16b: false,
  queue_index_mutation_performed_in_ag16b: false,
  admin_action_execution_performed_in_ag16b: false,
  editor_action_execution_performed_in_ag16b: false,
  real_credential_created_in_ag16b: false,
  hardcoded_password_created_in_repo_in_ag16b: false,
  password_hash_created_in_repo_in_ag16b: false,
  auth_activation_performed_in_ag16b: false,
  backend_activation_performed_in_ag16b: false,
  supabase_activation_performed_in_ag16b: false,
  database_write_performed_in_ag16b: false,
  github_token_created_or_exposed_in_ag16b: false,
  github_write_operation_performed_in_ag16b: false,
  active_action_handler_created_in_ag16b: false,
  api_endpoint_created_in_ag16b: false,
  public_visibility_switch_performed_in_ag16b: false,
  public_index_mutation_performed_in_ag16b: false,
  public_publishing_operation_performed_in_ag16b: false,
  deployment_trigger_performed_in_ag16b: false
};

const visibilityFieldSchema = {
  module_id: "AG16B",
  title: "Public Visibility Field Schema Plan",
  status: "public_visibility_field_schema_plan_defined",
  purpose: "Define the minimum fields required to evaluate whether an article may appear on public Drishvara surfaces.",
  required_fields: [
    {
      field: "article_id",
      type: "string",
      required: true
    },
    {
      field: "article_path",
      type: "string",
      required: true
    },
    {
      field: "article_hash",
      type: "sha256",
      required: true
    },
    {
      field: "status",
      type: "enum",
      required: true,
      allowed_values: [
        "internal_generated",
        "ready_for_admin_review",
        "returned_for_correction",
        "archived_internal",
        "publish_approved_pending_exposure",
        "public_published",
        "published_closed"
      ]
    },
    {
      field: "public_visibility",
      type: "boolean",
      required: true,
      default: false
    },
    {
      field: "publish_approved",
      type: "boolean",
      required: true,
      default: false
    },
    {
      field: "public_index_allowed",
      type: "boolean",
      required: true,
      default: false
    },
    {
      field: "featured_reads_allowed",
      type: "boolean",
      required: true,
      default: false
    },
    {
      field: "approved_hash",
      type: "sha256_or_null",
      required: true,
      default: null
    },
    {
      field: "visibility_decision_record",
      type: "path_or_null",
      required: true,
      default: null
    }
  ],
  invariant_rules: [
    "public_visibility defaults to false.",
    "publish_approved defaults to false.",
    "public_index_allowed defaults to false.",
    "featured_reads_allowed defaults to false.",
    "public_index_allowed can be true only when public_visibility=true and publish_approved=true.",
    "featured_reads_allowed can be true only when public_visibility=true and publish_approved=true.",
    "approved_hash must match article_hash before public exposure."
  ],
  source_doctrine: inputs.ag16aVisibilityModel,
  ...stageControls
};

const publishFieldSchema = {
  module_id: "AG16B",
  title: "Publish-Control Field Schema Plan",
  status: "publish_control_field_schema_plan_defined",
  purpose: "Define the minimum fields required to evaluate publish approval before public exposure.",
  required_fields: [
    {
      field: "admin_decision_status",
      type: "enum",
      required: true,
      allowed_values: [
        "pending_admin_review",
        "returned_for_correction",
        "archived",
        "publish",
        "publish_and_close"
      ]
    },
    {
      field: "admin_decision_by",
      type: "string_or_null",
      required: true,
      default: null
    },
    {
      field: "admin_decision_at",
      type: "iso_timestamp_or_null",
      required: true,
      default: null
    },
    {
      field: "quality_evidence_status",
      type: "enum",
      required: true,
      allowed_values: [
        "missing",
        "partial",
        "complete",
        "not_applicable"
      ]
    },
    {
      field: "preview_status",
      type: "enum",
      required: true,
      allowed_values: [
        "missing",
        "present",
        "passed"
      ]
    },
    {
      field: "hash_integrity_status",
      type: "enum",
      required: true,
      allowed_values: [
        "missing",
        "mismatch",
        "matched"
      ]
    },
    {
      field: "publish_approved",
      type: "boolean",
      required: true,
      default: false
    },
    {
      field: "publish_execution_status",
      type: "enum",
      required: true,
      default: "not_executed",
      allowed_values: [
        "not_executed",
        "blocked",
        "ready_for_later_execution",
        "executed"
      ]
    }
  ],
  publish_approval_rule: {
    publish_approved_can_be_true_only_if_all_true: [
      "admin_decision_status in ['publish', 'publish_and_close']",
      "quality_evidence_status in ['complete', 'not_applicable']",
      "preview_status === 'passed'",
      "hash_integrity_status === 'matched'"
    ],
    public_visibility_still_requires_separate_switch: true
  },
  source_doctrine: inputs.ag16aPublishControlModel,
  ...stageControls
};

const publicSurfaceFilterContract = {
  module_id: "AG16B",
  title: "Public Surface Filter Contract",
  status: "public_surface_filter_contract_defined",
  purpose: "Define the exact inclusion and exclusion contract for Featured Reads and other public article surfaces.",
  public_surfaces_covered: [
    "Featured Reads listing",
    "Category article listing",
    "Homepage article cards",
    "Public article sitemap if activated later",
    "Public article feed/search if activated later"
  ],
  include_contract: {
    include_article_only_if_all_true: [
      "record.public_visibility === true",
      "record.publish_approved === true",
      "record.public_index_allowed === true",
      "record.featured_reads_allowed === true for Featured Reads surfaces",
      "record.status in ['public_published', 'published_closed']",
      "record.article_path exists",
      "record.article_hash === record.approved_hash",
      "record.quality_evidence_status in ['complete', 'not_applicable']",
      "record.preview_status === 'passed'",
      "record.hash_integrity_status === 'matched'"
    ]
  },
  exclude_contract: {
    exclude_article_if_any_true: [
      "record.public_visibility !== true",
      "record.publish_approved !== true",
      "record.public_index_allowed !== true",
      "record.status in ['internal_generated', 'ready_for_admin_review', 'returned_for_correction', 'archived_internal']",
      "record.quality_evidence_status in ['missing', 'partial']",
      "record.preview_status in ['missing', 'present']",
      "record.hash_integrity_status in ['missing', 'mismatch']",
      "record.article_hash !== record.approved_hash"
    ]
  },
  source_doctrine: inputs.ag16aFeaturedReadsFilterPlan,
  ...stageControls
};

const exclusionContract = {
  module_id: "AG16B",
  title: "Public Surface Exclusion Contract",
  status: "public_surface_exclusion_contract_defined",
  purpose: "Ensure every non-approved article state is explicitly excluded from public surfaces while preserving internal intelligence.",
  excluded_states: [
    {
      status: "internal_generated",
      public_visibility: false,
      publish_approved: false,
      public_exposure_allowed: false,
      retain_in_internal_intelligence: true
    },
    {
      status: "ready_for_admin_review",
      public_visibility: false,
      publish_approved: false,
      public_exposure_allowed: false,
      retain_in_internal_intelligence: true
    },
    {
      status: "returned_for_correction",
      public_visibility: false,
      publish_approved: false,
      public_exposure_allowed: false,
      retain_in_internal_intelligence: true
    },
    {
      status: "archived_internal",
      public_visibility: false,
      publish_approved: false,
      public_exposure_allowed: false,
      retain_in_internal_intelligence: true
    },
    {
      status: "publish_approved_pending_exposure",
      public_visibility: false,
      publish_approved: true,
      public_exposure_allowed: false,
      retain_in_internal_intelligence: true,
      reason: "Approval alone is not public exposure. Visibility switch/public index update must be separately controlled."
    }
  ],
  archive_internal_intelligence_rule: ag16aArchivePlan.retention_principle,
  ...stageControls
};

const validationPlan = {
  module_id: "AG16B",
  title: "Public Visibility Filter Validation Plan",
  status: "public_visibility_filter_validation_plan_defined",
  purpose: "Define validation checks for AG16C schema dry-run.",
  planned_validation_checks: [
    "Required visibility fields are present.",
    "Required publish-control fields are present.",
    "public_visibility defaults to false.",
    "publish_approved defaults to false.",
    "public_index_allowed defaults to false.",
    "featured_reads_allowed defaults to false.",
    "Only public_published and published_closed may pass public filter.",
    "ready_for_admin_review must fail public filter.",
    "returned_for_correction must fail public filter.",
    "archived_internal must fail public filter.",
    "publish_approved_pending_exposure must fail public filter until public_visibility=true.",
    "Article hash must match approved_hash before public exposure.",
    "Quality evidence and preview status must pass before public exposure."
  ],
  dry_run_seed: {
    source_candidate_file: inputs.ag13zCandidate,
    article_path: articlePath,
    article_hash: currentArticleHash,
    expected_public_filter_result_for_seed_candidate_now: false,
    reason: "Seed candidate is review/pre-publication state and must not pass public filter yet."
  },
  ...stageControls
};

const readiness = {
  module_id: "AG16B",
  title: "Public Visibility Filter Schema Dry-run Readiness Record",
  status: "ready_for_ag16c_public_visibility_filter_schema_dry_run",
  ready_for_ag16c: true,
  ag16c_explicit_approval_required: true,
  visibility_field_schema_defined: true,
  publish_control_field_schema_defined: true,
  public_surface_filter_contract_defined: true,
  public_surface_exclusion_contract_defined: true,
  validation_plan_defined: true,
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
  reason: "AG16B defines schema/filter contracts only. AG16C should dry-run these rules against seed/pre-publication states without mutating public indexes or publishing.",
  ...stageControls
};

const boundary = {
  module_id: "AG16B",
  title: "AG16B to AG16C Public Visibility Filter Schema Dry-run Boundary",
  status: "ag16c_boundary_created_not_started",
  next_stage_id: "AG16C",
  next_stage_title: "Public Visibility and Publish Filter Schema Dry-run",
  explicit_approval_required: true,
  ag16c_allowed_scope: [
    "Create dry-run visibility records.",
    "Create dry-run publish-control records.",
    "Validate seed candidate fails public filter while non-approved.",
    "Validate hypothetical public-published shape passes only when public_visibility=true and publish_approved=true.",
    "Validate archived/returned/internal states fail public filters.",
    "Record dry-run readiness for later public filter implementation."
  ],
  ag16c_blocked_scope: [
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
  module_id: "AG16B",
  title: "Public Visibility Publish Filter Schema Plan Schema",
  status: "schema_public_visibility_publish_filter_schema_plan_only",
  visibility_field_schema_plan_allowed_in_ag16b: true,
  publish_control_field_schema_plan_allowed_in_ag16b: true,
  public_surface_filter_contract_allowed_in_ag16b: true,
  public_surface_exclusion_contract_allowed_in_ag16b: true,
  validation_plan_allowed_in_ag16b: true,
  ag16c_boundary_allowed_in_ag16b: true,

  article_generation_allowed_in_ag16b: false,
  article_mutation_allowed_in_ag16b: false,
  queue_mutation_allowed_in_ag16b: false,
  active_admin_review_queue_record_creation_allowed_in_ag16b: false,
  queue_index_mutation_allowed_in_ag16b: false,
  admin_action_execution_allowed_in_ag16b: false,
  editor_action_execution_allowed_in_ag16b: false,
  real_credential_creation_allowed_in_ag16b: false,
  hardcoded_password_allowed_in_ag16b: false,
  password_hash_commit_allowed_in_ag16b: false,
  auth_activation_allowed_in_ag16b: false,
  backend_activation_allowed_in_ag16b: false,
  supabase_activation_allowed_in_ag16b: false,
  database_write_allowed_in_ag16b: false,
  github_token_creation_or_exposure_allowed_in_ag16b: false,
  github_write_operation_allowed_in_ag16b: false,
  active_action_handler_creation_allowed_in_ag16b: false,
  public_visibility_switch_allowed_in_ag16b: false,
  public_index_mutation_allowed_in_ag16b: false,
  public_publishing_operation_allowed_in_ag16b: false,
  deployment_trigger_allowed_in_ag16b: false,
  ...stageControls
};

const review = {
  module_id: "AG16B",
  title: "Public Visibility and Publish Filter Schema Plan",
  status: "public_visibility_publish_filter_schema_plan_defined",
  depends_on: ["AG16A"],
  generated_from: inputs,
  visibility_field_schema_file: "data/content-intelligence/content-pipeline/ag16b-public-visibility-field-schema-plan.json",
  publish_field_schema_file: "data/content-intelligence/content-pipeline/ag16b-publish-control-field-schema-plan.json",
  public_surface_filter_contract_file: "data/content-intelligence/content-pipeline/ag16b-public-surface-filter-contract.json",
  exclusion_contract_file: "data/content-intelligence/content-pipeline/ag16b-public-surface-exclusion-contract.json",
  validation_plan_file: "data/content-intelligence/content-pipeline/ag16b-public-visibility-filter-validation-plan.json",
  readiness_file: "data/content-intelligence/quality-registry/ag16b-public-visibility-filter-schema-dry-run-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag16b-to-ag16c-public-visibility-filter-schema-dry-run-boundary.json",
  schema_file: "data/content-intelligence/schema/public-visibility-publish-filter-schema-plan.schema.json",
  summary: {
    public_exposure_requires_public_visibility_true: true,
    public_exposure_requires_publish_approved_true: true,
    seed_candidate_expected_public_filter_result_now: false,
    ready_for_ag16c: true,
    publish_ready: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG16B",
  title: "Public Visibility Publish Filter Schema Plan Learning",
  status: "learning_record_only",
  learning_points: [
    "Public exposure must be expressed as a filter contract, not just a status label.",
    "Admin approval and public visibility are separate control gates.",
    "A seed candidate in review/pre-publication state must fail public filters by default.",
    "publish_approved_pending_exposure must still remain non-public until a visibility switch is separately executed.",
    "AG16C should dry-run both failing and passing states before any public index implementation."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG16B",
  title: "Public Visibility and Publish Filter Schema Plan",
  status: "public_visibility_publish_filter_schema_plan_defined",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag16b-public-visibility-publish-filter-schema-plan.json",
    visibility_field_schema: "data/content-intelligence/content-pipeline/ag16b-public-visibility-field-schema-plan.json",
    publish_field_schema: "data/content-intelligence/content-pipeline/ag16b-publish-control-field-schema-plan.json",
    public_surface_filter_contract: "data/content-intelligence/content-pipeline/ag16b-public-surface-filter-contract.json",
    exclusion_contract: "data/content-intelligence/content-pipeline/ag16b-public-surface-exclusion-contract.json",
    validation_plan: "data/content-intelligence/content-pipeline/ag16b-public-visibility-filter-validation-plan.json",
    readiness: "data/content-intelligence/quality-registry/ag16b-public-visibility-filter-schema-dry-run-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag16b-to-ag16c-public-visibility-filter-schema-dry-run-boundary.json",
    schema: "data/content-intelligence/schema/public-visibility-publish-filter-schema-plan.schema.json",
    learning: "data/content-intelligence/learning/ag16b-public-visibility-publish-filter-schema-plan-learning.json",
    preview: "data/quality/ag16b-public-visibility-publish-filter-schema-plan-preview.json",
    document: "docs/quality/AG16B_PUBLIC_VISIBILITY_PUBLISH_FILTER_SCHEMA_PLAN.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG16B",
  preview_only: true,
  status: "public_visibility_publish_filter_schema_plan_defined",
  public_exposure_requires_both_true: true,
  seed_candidate_expected_public_filter_result_now: false,
  ready_for_ag16c: true,
  public_visibility_switch_ready: false,
  public_index_mutation_ready: false,
  publish_ready: false,
  next_stage_boundary: boundary,
  ...stageControls
};

const doc = `# AG16B — Public Visibility and Publish Filter Schema Plan

## Purpose

AG16B converts the AG16A public visibility and publish-control doctrine into concrete schema and filter contracts.

AG16B is schema planning only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, switch public visibility, mutate public indexes or publish anything.

## Public Exposure Contract

An article may appear on public Drishvara surfaces only when all required public filter conditions pass, including:

- public_visibility === true
- publish_approved === true
- public_index_allowed === true
- status is public_published or published_closed
- article_hash matches approved_hash
- quality, preview and hash checks pass

## Planned Outputs

- Public visibility field schema
- Publish-control field schema
- Public surface filter contract
- Public surface exclusion contract
- Public visibility filter validation plan

## Next Stage

AG16C — Public Visibility and Publish Filter Schema Dry-run — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(visibilityFieldSchemaPath, visibilityFieldSchema);
writeJson(publishFieldSchemaPath, publishFieldSchema);
writeJson(publicSurfaceFilterPath, publicSurfaceFilterContract);
writeJson(exclusionContractPath, exclusionContract);
writeJson(validationPlanPath, validationPlan);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG16B Public Visibility and Publish Filter Schema Plan generated.");
console.log("✅ Public visibility field schema plan created.");
console.log("✅ Publish-control field schema plan created.");
console.log("✅ Public surface filter and exclusion contracts created.");
console.log("✅ Validation plan created for AG16C dry-run.");
console.log("✅ AG16C public visibility filter schema dry-run boundary created.");
console.log("✅ No visibility switch, public index mutation or publishing performed.");
