import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag07bReview: "data/content-intelligence/quality-reviews/ag07b-content-packet-generator-dry-run-implementation-plan.json",
  ag07bPlan: "data/content-intelligence/run-registry/ag07b-content-packet-generator-dry-run-implementation-plan.json",
  ag07bSchema: "data/content-intelligence/schema/content-packet-generator-dry-run-implementation-plan.schema.json",
  ag07aReview: "data/content-intelligence/quality-reviews/ag07a-long-form-content-packet-generator-design-dry-run-boundary.json",
  ag06zClosure: "data/content-intelligence/quality-reviews/content-intelligence-foundation-closure.json",
  ag06bContentPacketSchema: "data/content-intelligence/schema/content-packet.schema.json",
  ag06eStandard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  ag06fUpgradeQueue: "data/content-intelligence/publish-queue/long-form-upgrade-queue.json",
  ag06hBatchPlanning: "data/content-intelligence/publish-queue/long-form-batch-01-content-packet-planning.json",
  ag06iVisualStandard: "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  ag06jReferenceStandard: "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  ag06kStoreManifest: "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  ag06lApprovalRegister: "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json"
};

const packetPath = path.join(root, "data", "content-intelligence", "content-packets", "ag07c-preview-only-dry-run-content-packet.json");
const executionPath = path.join(root, "data", "content-intelligence", "run-registry", "ag07c-preview-only-dry-run-execution-record.json");
const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "ag07c-content-packet-generator-preview-only-dry-run.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "content-packet-preview-dry-run.schema.json");
const registryPath = path.join(root, "data", "quality", "ag07c-content-packet-generator-preview-only-dry-run.json");
const previewPath = path.join(root, "data", "quality", "ag07c-content-packet-generator-preview-only-dry-run-preview.json");
const docPath = path.join(root, "docs", "quality", "AG07C_CONTENT_PACKET_GENERATOR_PREVIEW_ONLY_DRY_RUN.md");

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

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

const productionBlocks = {
  mutation_performed: false,
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
  homepage_mutation_performed: false,
  css_mutation_performed: false,
  javascript_mutation_performed: false,
  reference_url_change_performed: false,
  reference_insertion_performed: false,
  reference_url_population_performed: false,
  verified_reference_population_performed: false,
  candidate_reference_population_performed: false,
  external_fetch_performed_by_script: false,
  live_url_fetch_performed: false,
  link_health_fetch_performed: false,
  backend_activation_performed: false,
  api_route_created: false,
  supabase_enabled: false,
  auth_enabled: false,
  real_login_enabled: false,
  real_signup_enabled: false,
  user_account_collection_enabled: false,
  frontend_deployment_performed: false,
  scaffold_file_copy_performed: false,
  scaffold_file_move_performed: false,
  scaffold_file_delete_performed: false,
  scaffold_import_performed: false,
  file_deletion_performed: false,
  file_move_performed: false,
  public_article_archive_performed: false,
  public_article_delete_performed: false,
  public_publishing_performed: false,
  production_content_packet_generation_performed: false,
  production_content_packet_created: false,
  article_rewrite_performed: false,
  visual_asset_generation_performed: false,
  infographic_generation_performed: false,
  quality_scoring_performed: false,
  visitor_value_scoring_performed: false,
  jsonl_file_created: false,
  jsonl_production_record_created: false,
  jsonl_append_performed: false,
  jsonl_import_performed: false,
  database_write_performed: false,
  approval_state_changed: false,
  publish_ready_set: false,
  publish_queue_transition_performed: false,
  publication_approval_granted: false,
  production_generator_implemented: false,
  production_generator_runtime_created: false,
  production_output_written: false
};

const previewAllowed = {
  preview_only_dry_run_performed: true,
  preview_only_packet_skeleton_created: true,
  preview_only_output_written: true,
  preview_only_registry_written: true,
  preview_only_validation_artifacts_created: true
};

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG07C input ${name}: ${relativePath}`);
  }
}

const ag07bReview = readJson(inputs.ag07bReview);
const ag07bPlan = readJson(inputs.ag07bPlan);
const ag07bSchema = readJson(inputs.ag07bSchema);
const ag07aReview = readJson(inputs.ag07aReview);
const ag06zClosure = readJson(inputs.ag06zClosure);
const ag06bSchema = readJson(inputs.ag06bContentPacketSchema);
const ag06eStandard = readJson(inputs.ag06eStandard);
const ag06fQueue = readJson(inputs.ag06fUpgradeQueue);
const ag06hPlanning = readJson(inputs.ag06hBatchPlanning);
const ag06iVisualStandard = readJson(inputs.ag06iVisualStandard);
const ag06jReferenceStandard = readJson(inputs.ag06jReferenceStandard);
const ag06kManifest = readJson(inputs.ag06kStoreManifest);
const ag06lApprovalRegister = readJson(inputs.ag06lApprovalRegister);

const articleQueue = asArray(
  ag06fQueue.article_upgrade_queue ||
  ag06fQueue.queue_entries ||
  ag06fQueue.entries ||
  ag06fQueue.long_form_upgrade_queue ||
  ag06fQueue.upgrade_queue ||
  ag06fQueue.items
);

const planningEntries = asArray(
  ag06hPlanning.planning_queue ||
  ag06hPlanning.content_packet_planning_queue ||
  ag06hPlanning.batch_01_planning_entries ||
  ag06hPlanning.entries ||
  ag06hPlanning.items
);

const approvalEntries = asArray(ag06lApprovalRegister.approval_queue_entries);
const ag07bCandidates = asArray(ag07bPlan.candidate_preview);

if (ag07bCandidates.length < 1) {
  throw new Error("AG07B candidate preview is empty. AG07C requires one preview candidate.");
}

const selectedCandidate = ag07bCandidates[0];
const sourceArticlePath = selectedCandidate.source_article_path;
const sourceQueueId = selectedCandidate.source_queue_id;

const sourceQueueEntry =
  articleQueue.find((entry) => entry.source_article_path === sourceArticlePath || entry.queue_id === sourceQueueId) ||
  articleQueue[0] ||
  {};

const planningEntry =
  planningEntries.find((entry) => entry.source_article_path === sourceArticlePath || entry.source_queue_id === sourceQueueId || entry.queue_id === sourceQueueId) ||
  planningEntries[0] ||
  {};

const approvalEntry =
  approvalEntries.find((entry) => entry.source_article_path === sourceArticlePath || entry.source_queue_id === sourceQueueId) ||
  approvalEntries[0] ||
  {};

const requiredSections = asArray(ag06bSchema.required_sections).length
  ? asArray(ag06bSchema.required_sections)
  : [
      "identity",
      "source_context",
      "reader_value",
      "long_form_structure",
      "reference_plan",
      "visual_plan",
      "quality_gates",
      "publish_readiness",
      "audit_trace"
    ];

const packetSections = requiredSections.map((section, index) => {
  const sectionId = typeof section === "string"
    ? section
    : section.section_id || section.id || section.name || `section_${String(index + 1).padStart(2, "0")}`;

  return {
    section_id: sectionId,
    order: index + 1,
    required_by_schema: true,
    preview_content_status: "placeholder_only",
    narrative_text_generated: false,
    public_article_text_generated: false,
    production_ready: false,
    note: "AG07C records the section skeleton only. No article prose is generated."
  };
});

const packet = {
  module_id: "AG07C",
  content_packet_id: "ag07c_preview_only_packet_001",
  title: "Preview-Only Dry Run Content Packet Skeleton",
  status: "preview_only_dry_run",
  preview_only: true,
  production_packet: false,
  publication_allowed: false,
  publish_ready: false,
  approval_state_changed: false,
  generated_from: inputs,
  selected_candidate: {
    source_article_path: sourceArticlePath,
    source_queue_id: sourceQueueId,
    category: selectedCandidate.category || sourceQueueEntry.category || null,
    detected_title: selectedCandidate.detected_title || sourceQueueEntry.detected_title || null,
    upgrade_priority: sourceQueueEntry.upgrade_priority || null,
    selected_for_preview_only_dry_run: true,
    selected_for_public_mutation: false,
    selected_for_publishing: false
  },
  source_queue_entry_snapshot: {
    queue_id: sourceQueueEntry.queue_id || sourceQueueId || null,
    source_article_path: sourceQueueEntry.source_article_path || sourceArticlePath || null,
    category: sourceQueueEntry.category || null,
    detected_title: sourceQueueEntry.detected_title || null,
    upgrade_priority: sourceQueueEntry.upgrade_priority || null,
    publish_ready: sourceQueueEntry.publish_ready ?? false
  },
  planning_entry_snapshot: {
    planning_id: planningEntry.planning_id || planningEntry.queue_id || planningEntry.id || null,
    source_article_path: planningEntry.source_article_path || sourceArticlePath || null,
    generation_status: planningEntry.generation_status || planningEntry.current_status || "not_generated",
    publish_ready: planningEntry.publish_ready ?? false
  },
  approval_state_snapshot: {
    approval_queue_id: approvalEntry.approval_queue_id || null,
    current_state: approvalEntry.current_state || "queued_for_upgrade_review",
    approval_state: approvalEntry.approval_state || "not_approved",
    publish_ready: approvalEntry.publish_ready ?? false,
    publication_allowed: approvalEntry.publication_allowed ?? false
  },
  target_article_standard: {
    word_count_min: ag06eStandard.summary?.word_count_min || 1500,
    word_count_max: ag06eStandard.summary?.word_count_max || 2200,
    verified_reference_min: ag06eStandard.summary?.verified_reference_min || 2,
    verified_reference_max: ag06eStandard.summary?.verified_reference_max || 5,
    quality_score_required: true,
    visitor_value_score_required: true,
    publish_readiness_required: true
  },
  packet_sections: packetSections,
  reference_requirement_preview: {
    min_verified_references: ag06eStandard.summary?.verified_reference_min || 2,
    max_verified_references: ag06eStandard.summary?.verified_reference_max || 5,
    source_taxonomy_available: asArray(ag06jReferenceStandard.source_type_taxonomy).length > 0,
    reference_discovery_performed: false,
    reference_url_population_performed: false,
    reference_insertion_performed: false,
    approved_reference_count: 0,
    candidate_reference_count: 0,
    urls: []
  },
  visual_requirement_preview: {
    visual_standard_available: true,
    visual_type_count: asArray(ag06iVisualStandard.visual_types).length,
    primary_hero_visual_required: true,
    structured_visual_or_data_unit_required: true,
    visual_asset_generation_performed: false,
    infographic_generation_performed: false,
    image_credit_generated: false,
    alt_text_generated: false
  },
  jsonl_database_boundary: {
    jsonl_store_count: asArray(ag06kManifest.stores).length,
    jsonl_append_performed: false,
    jsonl_production_record_created: false,
    database_write_performed: false,
    supabase_enabled: false
  },
  mutation_controls: {
    public_article_mutation_performed: false,
    reference_insertion_performed: false,
    visual_asset_generation_performed: false,
    scaffold_import_performed: false,
    jsonl_append_performed: false,
    database_write_performed: false,
    approval_state_changed: false,
    publish_ready_set: false,
    public_publishing_performed: false,
    backend_activation_performed: false,
    supabase_enabled: false,
    auth_enabled: false
  },
  audit_trace: {
    created_by_stage: "AG07C",
    dry_run_type: "preview_only_skeleton",
    consumed_ag07b_plan: true,
    consumed_ag07a_boundary: true,
    consumed_ag06z_foundation: true,
    created_public_output: false,
    changed_public_article: false,
    inserted_reference: false,
    appended_jsonl: false,
    activated_backend: false
  },
  ...productionBlocks,
  ...previewAllowed
};

const executionRecord = {
  module_id: "AG07C",
  title: "Content Packet Generator Preview-Only Dry Run Execution Record",
  status: "preview_only_dry_run_completed",
  governance_only: true,
  generated_from: inputs,
  selected_candidate: packet.selected_candidate,
  execution_scope: {
    one_candidate_only: true,
    preview_only_packet_skeleton_created: true,
    production_packet_created: false,
    public_article_mutation_allowed: false,
    reference_insertion_allowed: false,
    jsonl_production_append_allowed: false,
    publishing_allowed: false,
    backend_auth_supabase_allowed: false
  },
  output_files: {
    preview_packet: "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
    review: "data/content-intelligence/quality-reviews/ag07c-content-packet-generator-preview-only-dry-run.json",
    schema: "data/content-intelligence/schema/content-packet-preview-dry-run.schema.json",
    preview: "data/quality/ag07c-content-packet-generator-preview-only-dry-run-preview.json",
    document: "docs/quality/AG07C_CONTENT_PACKET_GENERATOR_PREVIEW_ONLY_DRY_RUN.md"
  },
  packet_integrity_summary: {
    section_count: packetSections.length,
    all_sections_placeholder_only: packetSections.every((section) => section.preview_content_status === "placeholder_only"),
    narrative_text_generated: false,
    article_text_generated: false,
    approved_reference_count: 0,
    candidate_reference_count: 0,
    visual_asset_count: 0,
    production_ready: false,
    publish_ready: false
  },
  ...productionBlocks,
  ...previewAllowed
};

const schema = {
  schema_id: "drishvara/ag07c/content-packet-preview-dry-run.schema.json",
  module_id: "AG07C",
  title: "Content Packet Preview-Only Dry Run Schema",
  status: "schema_only",
  description: "Schema for a preview-only dry-run content packet skeleton. It does not authorize production packet generation, public article mutation, reference insertion, JSONL append, database write or publishing.",
  required_top_level_fields: [
    "content_packet_id",
    "status",
    "preview_only",
    "production_packet",
    "selected_candidate",
    "target_article_standard",
    "packet_sections",
    "reference_requirement_preview",
    "visual_requirement_preview",
    "jsonl_database_boundary",
    "mutation_controls",
    "audit_trace"
  ],
  required_section_fields: [
    "section_id",
    "order",
    "required_by_schema",
    "preview_content_status",
    "narrative_text_generated",
    "public_article_text_generated",
    "production_ready"
  ],
  allowed_statuses: [
    "preview_only_dry_run",
    "preview_only_review_required",
    "preview_only_rejected",
    "preview_only_accepted_for_next_planning_stage"
  ],
  preview_only_output_allowed_in_ag07c: true,
  production_packet_allowed_in_ag07c: false,
  public_article_mutation_allowed_in_ag07c: false,
  reference_insertion_allowed_in_ag07c: false,
  jsonl_production_append_allowed_in_ag07c: false,
  database_write_allowed_in_ag07c: false,
  publishing_allowed_in_ag07c: false,
  backend_auth_supabase_allowed_in_ag07c: false,
  ...productionBlocks,
  ...previewAllowed
};

const summary = {
  ag06z_foundation_closed: ag06zClosure.summary?.content_intelligence_foundation_closed === true,
  ag07a_boundary_closed: ag07aReview.status === "design_dry_run_boundary_only",
  ag07b_plan_closed: ag07bReview.status === "implementation_plan_only",
  preview_only_dry_run_completed: true,
  preview_packet_created: true,
  preview_packet_path: "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  selected_candidate_count: 1,
  section_count: packetSections.length,
  all_sections_placeholder_only: true,
  narrative_text_generated: false,
  article_text_generated: false,
  approved_reference_count: 0,
  candidate_reference_count: 0,
  visual_asset_count: 0,
  production_packet_created: false,
  production_content_packet_generation_performed: false,
  public_article_mutation_allowed: false,
  reference_insertion_allowed: false,
  visual_generation_allowed: false,
  scaffold_import_allowed: false,
  jsonl_append_allowed: false,
  database_write_allowed: false,
  publishing_allowed: false,
  backend_auth_supabase_allowed: false,
  next_stage_id: "AG07D"
};

const review = {
  module_id: "AG07C",
  title: "Content Packet Generator Preview-Only Dry Run Review",
  status: "preview_only_dry_run_completed",
  governance_only: true,
  preview_only: true,
  depends_on: ["AG07B", "AG07A", "AG06Z", "AG06B", "AG06E", "AG06I", "AG06J", "AG06K", "AG06L"],
  generated_from: inputs,
  summary,
  alignment_with_ag07b: {
    ag07b_status: ag07bReview.status,
    ag07c_requires_explicit_approval: ag07bReview.closure_decision?.proceed_to_ag07c_only_with_explicit_user_approval,
    ag07b_generator_code_creation_allowed: ag07bReview.closure_decision?.generator_code_creation_allowed,
    ag07b_public_article_mutation_allowed: ag07bReview.closure_decision?.public_article_mutation_allowed,
    ag07b_reference_insertion_allowed: ag07bReview.closure_decision?.reference_insertion_allowed
  },
  dry_run_decision: {
    decision: "ag07c_preview_only_dry_run_completed",
    proceed_to_ag07d_review_only_with_explicit_user_approval: true,
    preview_only_packet_created: true,
    production_packet_created: false,
    production_content_generation_allowed: false,
    public_article_mutation_allowed: false,
    reference_insertion_allowed: false,
    visual_generation_allowed: false,
    scaffold_import_allowed: false,
    jsonl_production_append_allowed: false,
    database_write_allowed: false,
    publishing_allowed: false,
    backend_auth_supabase_allowed: false
  },
  packet_file: "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  execution_record_file: "data/content-intelligence/run-registry/ag07c-preview-only-dry-run-execution-record.json",
  schema_file: "data/content-intelligence/schema/content-packet-preview-dry-run.schema.json",
  ...productionBlocks,
  ...previewAllowed
};

const registry = {
  module_id: "AG07C",
  title: "Content Packet Generator Preview-Only Dry Run",
  governance_only: true,
  preview_only_dry_run: true,
  depends_on: ["AG07B"],
  generated_artifacts: {
    preview_packet: "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
    execution_record: "data/content-intelligence/run-registry/ag07c-preview-only-dry-run-execution-record.json",
    review: "data/content-intelligence/quality-reviews/ag07c-content-packet-generator-preview-only-dry-run.json",
    schema: "data/content-intelligence/schema/content-packet-preview-dry-run.schema.json",
    preview: "data/quality/ag07c-content-packet-generator-preview-only-dry-run-preview.json",
    document: "docs/quality/AG07C_CONTENT_PACKET_GENERATOR_PREVIEW_ONLY_DRY_RUN.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG07D",
    title: "Preview Packet Review and Gap Audit",
    allowed_scope: "review/audit only unless explicitly expanded",
    blocked_scope: "public mutation, reference insertion, visual generation, JSONL production append, publishing, backend/Auth/Supabase activation"
  },
  ...productionBlocks,
  ...previewAllowed
};

const preview = {
  module_id: "AG07C",
  preview_only: true,
  summary,
  selected_candidate: packet.selected_candidate,
  packet_preview: {
    content_packet_id: packet.content_packet_id,
    status: packet.status,
    section_count: packet.packet_sections.length,
    first_sections: packet.packet_sections.slice(0, 6),
    reference_requirement_preview: packet.reference_requirement_preview,
    visual_requirement_preview: packet.visual_requirement_preview,
    mutation_controls: packet.mutation_controls
  },
  no_public_mutation_summary: {
    public_article_mutation_performed: false,
    reference_insertion_performed: false,
    visual_asset_generation_performed: false,
    scaffold_import_performed: false,
    jsonl_append_performed: false,
    database_write_performed: false,
    approval_state_changed: false,
    publish_ready_set: false,
    public_publishing_performed: false,
    backend_activation_performed: false,
    supabase_enabled: false,
    auth_enabled: false
  },
  next_stage_id: "AG07D"
};

const doc = `# AG07C — Content Packet Generator Preview-Only Dry Run

## Purpose

AG07C performs the first controlled preview-only dry run for the Drishvara long-form content packet generator pathway.

This stage creates one non-public content packet skeleton for review. The packet is preview-only and contains placeholders, contracts and audit fields only. It does not generate final article prose, mutate public article HTML, insert references, generate visuals, append JSONL records, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07C consumes:

- AG07B Content Packet Generator Dry-Run Implementation Plan.
- AG07A Long-Form Content Packet Generator Design / Dry-Run Boundary.
- AG06Z Content Intelligence Foundation Closure.
- AG06B Content Packet Schema.
- AG06E Long-Form Article Standard.
- AG06I Visual/Data/Infographic Requirement Standard.
- AG06J Reference and Source Credibility Standard.
- AG06K JSONL-first Store Manifest.
- AG06L Publish Queue and Approval State Register.

## Dry-Run Output

AG07C creates one preview-only packet skeleton:

- content packet ID;
- selected source article metadata;
- source queue snapshot;
- planning snapshot;
- approval-state snapshot;
- target article standard;
- required section skeleton;
- reference requirement preview;
- visual requirement preview;
- JSONL/database boundary;
- mutation controls;
- audit trace.

## Preview-Only Boundary

The AG07C packet is not a production packet.

It is not publish-ready.

It contains no generated article prose.

It contains no verified reference URLs.

It contains no generated visual assets.

It does not change any approval state.

## Explicit Exclusions

AG07C does not:

- mutate current public article HTML;
- insert, populate or change reference URLs;
- fetch live URLs;
- generate article prose;
- generate final content packets for production;
- generate visual assets or infographics;
- copy, move, delete or import scaffold outputs;
- create or append production JSONL records;
- write to any database;
- change approval states;
- set publish_ready=true;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Acceptance Criteria

AG07C is acceptable only if:

- AG07B is present and closed as implementation-plan only;
- AG07A boundary and AG06Z foundation are present;
- exactly one preview-only packet skeleton is created;
- packet status is preview_only_dry_run;
- production_packet=false;
- publication_allowed=false;
- publish_ready=false;
- all packet sections are placeholder-only;
- no article prose is generated;
- reference counts remain zero and URLs are empty;
- visual asset count remains zero;
- mutation controls remain false;
- package scripts for generate:ag07c and validate:ag07c are present;
- validate:project includes validate:ag07c;
- no public mutation, reference insertion, visual generation, scaffold import, JSONL production append, database write, approval-state change, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07D — Preview Packet Review and Gap Audit.

AG07D must not start automatically. It requires explicit approval.
`;

writeJson(packetPath, packet);
writeJson(executionPath, executionRecord);
writeJson(reviewPath, review);
writeJson(schemaPath, schema);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG07C content packet generator preview-only dry run artifacts generated.");
