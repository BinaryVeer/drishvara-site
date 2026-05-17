import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag07gReview: "data/content-intelligence/quality-reviews/ag07g-reference-discovery-boundary-workbench.json",
  ag07gWorkbench: "data/content-intelligence/reference-registry/ag07g-reference-discovery-workbench.json",
  ag07gSchema: "data/content-intelligence/schema/reference-discovery-workbench.schema.json",
  ag07gLearning: "data/content-intelligence/learning/ag07g-reference-discovery-boundary-learning.json",
  ag07fReview: "data/content-intelligence/quality-reviews/ag07f-preview-packet-schema-revision-boundary.json",
  ag07fBoundaryPlan: "data/content-intelligence/run-registry/ag07f-preview-packet-contract-boundary-plan.json",
  ag07fRevisedSchema: "data/content-intelligence/schema/preview-packet-revised-contract.schema.json",
  ag07cPacket: "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  ag06iVisualStandard: "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  ag06eLongFormStandard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  ag06kStoreManifest: "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  ag06lApprovalRegister: "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json"
};

const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "ag07h-visual-data-enrichment-boundary-workbench.json");
const workbenchPath = path.join(root, "data", "content-intelligence", "visual-registry", "ag07h-visual-data-enrichment-workbench.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "visual-data-enrichment-workbench.schema.json");
const learningPath = path.join(root, "data", "content-intelligence", "learning", "ag07h-visual-data-enrichment-boundary-learning.json");
const registryPath = path.join(root, "data", "quality", "ag07h-visual-data-enrichment-boundary-workbench.json");
const previewPath = path.join(root, "data", "quality", "ag07h-visual-data-enrichment-boundary-workbench-preview.json");
const docPath = path.join(root, "docs", "quality", "AG07H_VISUAL_DATA_ENRICHMENT_BOUNDARY_WORKBENCH.md");

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

const noMutationControls = {
  visual_data_enrichment_boundary_only: true,
  visual_generation_performed: false,
  visual_asset_generation_performed: false,
  infographic_generation_performed: false,
  data_unit_generation_performed: false,
  image_insertion_performed: false,
  hero_image_insertion_performed: false,
  article_image_mutation_performed: false,
  image_credit_population_performed: false,
  alt_text_population_performed: false,
  caption_population_performed: false,
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
  article_prose_generated: false,
  narrative_text_generated: false,
  production_content_generated: false,
  reference_insertion_performed: false,
  reference_url_population_performed: false,
  live_url_fetch_performed: false,
  web_fetch_performed: false,
  link_health_fetch_performed: false,
  scaffold_import_performed: false,
  scaffold_file_copy_performed: false,
  scaffold_file_move_performed: false,
  scaffold_file_delete_performed: false,
  jsonl_append_performed: false,
  jsonl_production_record_created: false,
  database_write_performed: false,
  supabase_enabled: false,
  auth_enabled: false,
  backend_activation_performed: false,
  api_route_created: false,
  approval_state_changed: false,
  publish_ready_set: false,
  public_publishing_performed: false,
  publication_approval_granted: false
};

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG07H input ${name}: ${relativePath}`);
  }
}

const ag07gReview = readJson(inputs.ag07gReview);
const ag07gWorkbench = readJson(inputs.ag07gWorkbench);
const ag07gSchema = readJson(inputs.ag07gSchema);
const ag07gLearning = readJson(inputs.ag07gLearning);
const ag07fReview = readJson(inputs.ag07fReview);
const ag07fBoundaryPlan = readJson(inputs.ag07fBoundaryPlan);
const ag07fRevisedSchema = readJson(inputs.ag07fRevisedSchema);
const ag07cPacket = readJson(inputs.ag07cPacket);
const ag06iVisualStandard = readJson(inputs.ag06iVisualStandard);
const ag06eLongFormStandard = readJson(inputs.ag06eLongFormStandard);
const ag06kStoreManifest = readJson(inputs.ag06kStoreManifest);
const ag06lApprovalRegister = readJson(inputs.ag06lApprovalRegister);

const proposedContractSections = asArray(ag07fBoundaryPlan.proposed_contract_sections);
const visualContractSection = proposedContractSections.find((section) => section.section_id === "visual_data_plan") || {};
const approvalEntries = asArray(ag06lApprovalRegister.approval_queue_entries);

const visualTypes = asArray(
  ag06iVisualStandard.visual_types ||
  ag06iVisualStandard.allowed_visual_types ||
  ag06iVisualStandard.allowed_visual_and_data_enrichment_types ||
  []
);

const visualQualityWeights = ag06iVisualStandard.visual_quality_scoring_weights || ag06iVisualStandard.scoring_weights || {};

const visualNeedSlots = [
  {
    slot_id: "AG07H-VISUAL-001",
    visual_need_type: "primary_hero_visual",
    purpose: "Represent the central article idea through a safe, relevant and credited hero visual.",
    required_before_publish: true,
    visual_generation_allowed_in_ag07h: false,
    image_insertion_allowed_in_ag07h: false,
    asset_path: "",
    asset_url: "",
    caption: "",
    alt_text: "",
    image_credit: "",
    review_status: "boundary_slot_empty"
  },
  {
    slot_id: "AG07H-VISUAL-002",
    visual_need_type: "structured_visual_or_infographic",
    purpose: "Plan a simple infographic, flow, table, diagram or structured visual support where useful.",
    required_before_publish: true,
    visual_generation_allowed_in_ag07h: false,
    image_insertion_allowed_in_ag07h: false,
    asset_path: "",
    asset_url: "",
    caption: "",
    alt_text: "",
    image_credit: "",
    review_status: "boundary_slot_empty"
  },
  {
    slot_id: "AG07H-VISUAL-003",
    visual_need_type: "supporting_context_visual",
    purpose: "Optional supporting visual, map, timeline, quote-card or data callout where editorially justified.",
    required_before_publish: false,
    visual_generation_allowed_in_ag07h: false,
    image_insertion_allowed_in_ag07h: false,
    asset_path: "",
    asset_url: "",
    caption: "",
    alt_text: "",
    image_credit: "",
    review_status: "boundary_slot_empty"
  }
];

const dataUnitSlots = [
  {
    slot_id: "AG07H-DATA-001",
    data_unit_type: "key_fact_box",
    purpose: "Future structured key fact box based on verified content and references.",
    required_before_publish: false,
    data_generation_allowed_in_ag07h: false,
    data_values: [],
    source_dependency: "future_reference_or_editorial_review_required",
    review_status: "boundary_slot_empty"
  },
  {
    slot_id: "AG07H-DATA-002",
    data_unit_type: "timeline_or_sequence",
    purpose: "Future timeline or process sequence where the article benefits from ordered explanation.",
    required_before_publish: false,
    data_generation_allowed_in_ag07h: false,
    data_values: [],
    source_dependency: "future_reference_or_editorial_review_required",
    review_status: "boundary_slot_empty"
  },
  {
    slot_id: "AG07H-DATA-003",
    data_unit_type: "comparison_or_matrix",
    purpose: "Future comparison table or matrix for reader clarity, where supported by credible sources.",
    required_before_publish: false,
    data_generation_allowed_in_ag07h: false,
    data_values: [],
    source_dependency: "future_reference_or_editorial_review_required",
    review_status: "boundary_slot_empty"
  }
];

const accessibilityAndAttributionFields = [
  {
    field_id: "caption_context",
    required_before_publish: true,
    populated_in_ag07h: false,
    value: "",
    purpose: "Explain why the visual/data unit is relevant to the article."
  },
  {
    field_id: "alt_text",
    required_before_publish: true,
    populated_in_ag07h: false,
    value: "",
    purpose: "Provide accessible text for screen readers and low-bandwidth contexts."
  },
  {
    field_id: "image_credit",
    required_before_publish: true,
    populated_in_ag07h: false,
    value: "",
    purpose: "Record source, creator, license or editorial attribution status."
  },
  {
    field_id: "mobile_safe_layout_note",
    required_before_publish: true,
    populated_in_ag07h: false,
    value: "",
    purpose: "Ensure visual/data unit does not break mobile reading surface."
  }
];

const mobileSafeLayoutRules = [
  {
    rule_id: "AG07H-MOBILE-001",
    rule: "Visual/data units must be readable on narrow mobile screens.",
    evaluated_in_ag07h: false,
    future_approval_required: true
  },
  {
    rule_id: "AG07H-MOBILE-002",
    rule: "Captions and credits must remain visible and non-overlapping.",
    evaluated_in_ag07h: false,
    future_approval_required: true
  },
  {
    rule_id: "AG07H-MOBILE-003",
    rule: "Images must not displace verified references, article footer or navigation.",
    evaluated_in_ag07h: false,
    future_approval_required: true
  },
  {
    rule_id: "AG07H-MOBILE-004",
    rule: "Infographics must have a text-equivalent or summary fallback.",
    evaluated_in_ag07h: false,
    future_approval_required: true
  }
];

const reviewWorkflow = [
  {
    step_id: "AG07H-WF-001",
    step_name: "visual_need_review",
    description: "Future editorial review of whether a visual/data unit is needed.",
    allowed_in_ag07h: false,
    future_approval_required: true
  },
  {
    step_id: "AG07H-WF-002",
    step_name: "visual_asset_selection_or_generation",
    description: "Future selection or generation of a visual asset.",
    allowed_in_ag07h: false,
    future_approval_required: true
  },
  {
    step_id: "AG07H-WF-003",
    step_name: "caption_alt_credit_review",
    description: "Future caption, alt-text and credit review before insertion.",
    allowed_in_ag07h: false,
    future_approval_required: true
  },
  {
    step_id: "AG07H-WF-004",
    step_name: "mobile_layout_review",
    description: "Future mobile-safe layout review.",
    allowed_in_ag07h: false,
    future_approval_required: true
  },
  {
    step_id: "AG07H-WF-005",
    step_name: "article_visual_insertion",
    description: "Future public article image/visual insertion step; explicitly blocked in AG07H.",
    allowed_in_ag07h: false,
    future_approval_required: true
  }
];

const futureStageHandoff = [
  {
    stage_id: "AG07I",
    title: "Quality and Visitor-Value Scoring Boundary",
    receives_from_ag07h: ["visual_need_slots", "data_unit_slots", "accessibility_and_attribution_fields"],
    allowed_scope: "quality/visitor-value scoring boundary only with explicit approval",
    blocked_actions: ["publish_ready_set", "approval_state_change", "publishing"]
  },
  {
    stage_id: "AG07J",
    title: "Preview Packet Contract Revision Dry Run",
    receives_from_ag07h: ["visual_data_plan_boundary", "reference_boundary", "schema_contract_boundary"],
    allowed_scope: "create a revised preview-only packet skeleton only with explicit approval",
    blocked_actions: ["article_prose_generation", "public_mutation", "jsonl_append", "publishing", "backend_auth_supabase_activation"]
  },
  {
    stage_id: "AG07K",
    title: "Visual Candidate Population Dry Run",
    receives_from_ag07h: ["visual_need_slots", "data_unit_slots", "review_workflow"],
    allowed_scope: "populate candidate visual/data planning fields only if explicitly approved later",
    blocked_actions: ["public_image_insertion", "article_mutation", "publishing", "backend_auth_supabase_activation"]
  }
];

const summary = {
  ag07g_boundary_consumed: ag07gReview.status === "reference_discovery_boundary_defined",
  ag07f_boundary_consumed: ag07fReview.status === "schema_contract_boundary_defined",
  ag07c_packet_present: true,
  ag07c_packet_unchanged: true,
  visual_contract_section_present: Boolean(visualContractSection.section_id),
  visual_standard_consumed: true,
  visual_type_count: visualTypes.length,
  visual_need_slot_count: visualNeedSlots.length,
  data_unit_slot_count: dataUnitSlots.length,
  accessibility_field_count: accessibilityAndAttributionFields.length,
  mobile_safe_rule_count: mobileSafeLayoutRules.length,
  review_workflow_step_count: reviewWorkflow.length,
  visual_generation_performed: false,
  visual_asset_generation_performed: false,
  image_insertion_performed: false,
  image_credit_population_performed: false,
  alt_text_population_performed: false,
  caption_population_performed: false,
  data_unit_generation_performed: false,
  produced_visual_asset_count: 0,
  inserted_image_count: 0,
  generated_data_unit_count: 0,
  production_readiness_after_ag07h: "not_ready",
  publish_readiness_after_ag07h: "blocked",
  public_article_mutation_allowed: false,
  article_prose_generated: false,
  reference_insertion_allowed: false,
  jsonl_production_append_allowed: false,
  database_write_allowed: false,
  publishing_allowed: false,
  backend_auth_supabase_allowed: false,
  next_stage_id: "AG07I"
};

const workbench = {
  module_id: "AG07H",
  title: "Visual and Data Enrichment Boundary Workbench",
  status: "visual_data_enrichment_boundary_defined",
  visual_data_enrichment_boundary_only: true,
  generated_from: inputs,
  summary,
  source_packet_snapshot: {
    content_packet_id: ag07cPacket.content_packet_id,
    status: ag07cPacket.status,
    preview_only: ag07cPacket.preview_only,
    production_packet: ag07cPacket.production_packet,
    publish_ready: ag07cPacket.publish_ready,
    publication_allowed: ag07cPacket.publication_allowed,
    packet_modified_in_ag07h: false
  },
  visual_standard_snapshot: {
    visual_type_count: visualTypes.length,
    visual_types: visualTypes,
    visual_quality_scoring_weights: visualQualityWeights,
    primary_hero_visual_required: true,
    structured_visual_or_data_unit_required: true,
    image_credit_required: true,
    alt_text_required: true,
    caption_context_required: true,
    mobile_safe_layout_required: true
  },
  reference_boundary_snapshot: {
    ag07g_candidate_reference_slot_count: asArray(ag07gWorkbench.candidate_reference_slots).length,
    ag07g_reference_url_population_performed: ag07gReview.summary?.reference_url_population_performed,
    ag07g_reference_insertion_performed: ag07gReview.summary?.reference_insertion_performed
  },
  visual_need_slots: visualNeedSlots,
  data_unit_slots: dataUnitSlots,
  accessibility_and_attribution_fields: accessibilityAndAttributionFields,
  mobile_safe_layout_rules: mobileSafeLayoutRules,
  review_workflow: reviewWorkflow,
  future_stage_handoff: futureStageHandoff,
  ...noMutationControls
};

const schema = {
  schema_id: "drishvara/ag07h/visual-data-enrichment-workbench.schema.json",
  module_id: "AG07H",
  title: "Visual and Data Enrichment Workbench Schema",
  status: "schema_boundary_only",
  description: "Schema for a future visual/data enrichment workbench. AG07H defines slots, accessibility, attribution and review fields only; it does not generate visuals or insert images.",
  required_top_level_fields: [
    "source_packet_snapshot",
    "visual_standard_snapshot",
    "visual_need_slots",
    "data_unit_slots",
    "accessibility_and_attribution_fields",
    "mobile_safe_layout_rules",
    "review_workflow",
    "mutation_controls"
  ],
  visual_slot_required_fields: [
    "slot_id",
    "visual_need_type",
    "purpose",
    "required_before_publish",
    "visual_generation_allowed_in_ag07h",
    "image_insertion_allowed_in_ag07h",
    "asset_path",
    "asset_url",
    "caption",
    "alt_text",
    "image_credit",
    "review_status"
  ],
  data_unit_slot_required_fields: [
    "slot_id",
    "data_unit_type",
    "purpose",
    "required_before_publish",
    "data_generation_allowed_in_ag07h",
    "data_values",
    "source_dependency",
    "review_status"
  ],
  allowed_visual_review_statuses: [
    "boundary_slot_empty",
    "candidate_pending",
    "candidate_under_review",
    "approved_later",
    "rejected_later"
  ],
  visual_generation_allowed_in_ag07h: false,
  image_insertion_allowed_in_ag07h: false,
  data_unit_generation_allowed_in_ag07h: false,
  image_credit_population_allowed_in_ag07h: false,
  alt_text_population_allowed_in_ag07h: false,
  caption_population_allowed_in_ag07h: false,
  article_mutation_allowed_in_ag07h: false,
  reference_insertion_allowed_in_ag07h: false,
  jsonl_append_allowed_in_ag07h: false,
  database_write_allowed_in_ag07h: false,
  publishing_allowed_in_ag07h: false,
  backend_auth_supabase_allowed_in_ag07h: false,
  ...noMutationControls
};

const learning = {
  module_id: "AG07H",
  title: "Visual and Data Enrichment Boundary Learning",
  status: "learning_record_only",
  visual_data_enrichment_boundary_only: true,
  generated_from: inputs,
  summary,
  learning_points_from_ag07g: asArray(ag07gLearning.ag07g_learning_points),
  ag07h_learning_points: [
    "Visual/data enrichment can be structured without generating or inserting visual assets.",
    "Hero visual, structured visual/data unit, caption, alt-text and credit fields should exist before visual production begins.",
    "Mobile-safe layout rules should be part of the packet contract before any image insertion.",
    "Reference readiness and visual readiness must remain separate but connected gates.",
    "No JSONL/database/Supabase persistence is required for AG07H boundary planning."
  ],
  carried_forward_doctrine: [
    "Visual/data boundary is not visual generation.",
    "Visual slots are not visual assets.",
    "Data-unit slots are not generated data outputs.",
    "Image credit, alt text and caption fields are not populated in AG07H.",
    "No public article mutation may occur in AG07H."
  ],
  ...noMutationControls
};

const review = {
  module_id: "AG07H",
  title: "Visual and Data Enrichment Boundary / Workbench",
  status: "visual_data_enrichment_boundary_defined",
  governance_only: true,
  visual_data_enrichment_boundary_only: true,
  depends_on: ["AG07G", "AG07F", "AG07C", "AG06I", "AG06E", "AG06K", "AG06L"],
  generated_from: inputs,
  summary,
  alignment_with_ag07g: {
    ag07g_status: ag07gReview.status,
    ag07g_decision: ag07gReview.closure_decision?.decision,
    ag07h_requires_explicit_approval: ag07gReview.closure_decision?.proceed_to_ag07h_only_with_explicit_user_approval,
    reference_url_population_performed: ag07gReview.closure_decision?.reference_url_population_performed,
    reference_insertion_performed: ag07gReview.closure_decision?.reference_insertion_performed,
    public_article_mutation_allowed: ag07gReview.closure_decision?.public_article_mutation_allowed,
    visual_generation_allowed: ag07gReview.closure_decision?.visual_generation_allowed,
    jsonl_production_append_allowed: ag07gReview.closure_decision?.jsonl_production_append_allowed,
    backend_auth_supabase_allowed: ag07gReview.closure_decision?.backend_auth_supabase_allowed
  },
  alignment_with_ag07f_contract: {
    visual_data_plan_section_present: Boolean(visualContractSection.section_id),
    revised_schema_applies_to_current_ag07c_packet_in_ag07f: ag07fRevisedSchema.applies_to_current_ag07c_packet_in_ag07f,
    visual_generation_blocked_by_schema: ag07fRevisedSchema.required_global_guards?.visual_generation_allowed === false,
    article_mutation_blocked_by_schema: ag07fRevisedSchema.required_global_guards?.public_article_mutation_allowed === false
  },
  workbench_file: "data/content-intelligence/visual-registry/ag07h-visual-data-enrichment-workbench.json",
  schema_file: "data/content-intelligence/schema/visual-data-enrichment-workbench.schema.json",
  learning_file: "data/content-intelligence/learning/ag07h-visual-data-enrichment-boundary-learning.json",
  foundation_alignment: {
    ag06i_visual_standard_consumed: true,
    ag06e_visual_requirement_carried_forward: Boolean(ag06eLongFormStandard.summary?.visual_plan_required ?? true),
    jsonl_store_count: asArray(ag06kStoreManifest.stores).length,
    approval_register_count: approvalEntries.length
  },
  closure_decision: {
    decision: "ag07h_visual_data_enrichment_boundary_closed",
    proceed_to_ag07i_only_with_explicit_user_approval: true,
    visual_data_enrichment_boundary_defined: true,
    visual_generation_performed: false,
    visual_asset_generation_performed: false,
    image_insertion_performed: false,
    data_unit_generation_performed: false,
    image_credit_population_performed: false,
    alt_text_population_performed: false,
    caption_population_performed: false,
    production_readiness: "not_ready",
    publish_readiness: "blocked",
    article_prose_generation_allowed: false,
    public_article_mutation_allowed: false,
    reference_insertion_allowed: false,
    visual_generation_allowed: false,
    image_insertion_allowed: false,
    scaffold_import_allowed: false,
    jsonl_production_append_allowed: false,
    database_write_allowed: false,
    publishing_allowed: false,
    backend_auth_supabase_allowed: false
  },
  ...noMutationControls
};

const registry = {
  module_id: "AG07H",
  title: "Visual and Data Enrichment Boundary / Workbench",
  governance_only: true,
  visual_data_enrichment_boundary_only: true,
  depends_on: ["AG07G"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag07h-visual-data-enrichment-boundary-workbench.json",
    workbench: "data/content-intelligence/visual-registry/ag07h-visual-data-enrichment-workbench.json",
    schema: "data/content-intelligence/schema/visual-data-enrichment-workbench.schema.json",
    learning: "data/content-intelligence/learning/ag07h-visual-data-enrichment-boundary-learning.json",
    preview: "data/quality/ag07h-visual-data-enrichment-boundary-workbench-preview.json",
    document: "docs/quality/AG07H_VISUAL_DATA_ENRICHMENT_BOUNDARY_WORKBENCH.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG07I",
    title: "Quality and Visitor-Value Scoring Boundary",
    allowed_scope: "quality/visitor-value scoring boundary only unless explicitly expanded",
    blocked_scope: "visual generation, image insertion, article prose generation, public mutation, reference insertion, JSONL production append, publishing, backend/Auth/Supabase activation"
  },
  ...noMutationControls
};

const preview = {
  module_id: "AG07H",
  preview_only: true,
  visual_data_enrichment_boundary_only: true,
  summary,
  source_packet_snapshot: workbench.source_packet_snapshot,
  visual_need_slots: visualNeedSlots.map((slot) => ({
    slot_id: slot.slot_id,
    visual_need_type: slot.visual_need_type,
    required_before_publish: slot.required_before_publish,
    asset_path_empty: slot.asset_path === "",
    asset_url_empty: slot.asset_url === "",
    caption_empty: slot.caption === "",
    alt_text_empty: slot.alt_text === "",
    image_credit_empty: slot.image_credit === "",
    visual_generation_allowed_in_ag07h: slot.visual_generation_allowed_in_ag07h,
    image_insertion_allowed_in_ag07h: slot.image_insertion_allowed_in_ag07h
  })),
  data_unit_slots: dataUnitSlots.map((slot) => ({
    slot_id: slot.slot_id,
    data_unit_type: slot.data_unit_type,
    data_values_count: slot.data_values.length,
    data_generation_allowed_in_ag07h: slot.data_generation_allowed_in_ag07h
  })),
  accessibility_and_attribution_fields: accessibilityAndAttributionFields.map((field) => ({
    field_id: field.field_id,
    required_before_publish: field.required_before_publish,
    populated_in_ag07h: field.populated_in_ag07h,
    value_empty: field.value === ""
  })),
  review_workflow: reviewWorkflow,
  future_stage_handoff: futureStageHandoff,
  next_stage_id: "AG07I",
  ...noMutationControls
};

const doc = `# AG07H — Visual and Data Enrichment Boundary / Workbench

## Purpose

AG07H defines the visual and data enrichment boundary for future long-form content packets.

This stage is visual/data boundary only. It does not generate visual assets, insert images, populate image credits, populate alt text, populate captions, create data-unit outputs, mutate public articles, insert references, generate article prose, append JSONL records, publish content, write to a database, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07H consumes:

- AG07G Reference Discovery Boundary / Workbench.
- AG07G workbench, schema and learning record.
- AG07F Preview Packet Schema Revision Boundary.
- AG07F contract boundary plan and revised contract schema.
- AG07C preview-only packet skeleton.
- AG06I visual/data/infographic requirement standard.
- AG06E long-form article standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Workbench Boundary

AG07H defines:

- hero visual need slot;
- structured visual / infographic need slot;
- optional supporting context visual slot;
- data-unit slots;
- caption context field;
- alt-text field;
- image-credit field;
- mobile-safe layout rules;
- visual/data review workflow;
- future handoff to later controlled stages.

All asset paths, asset URLs, captions, alt text, image credits and data values remain empty in AG07H.

## Visual and Data Status

AG07H does not create visual assets.

It does not generate infographics.

It does not insert images into article HTML.

It does not populate captions, alt text or image credits.

It does not create data-unit outputs.

## Production Readiness Decision

AG07H does not make the packet production-ready.

Production readiness remains not_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07H does not:

- generate visual assets;
- generate infographics;
- insert hero images;
- insert article images;
- populate image credits;
- populate alt text;
- populate captions;
- generate data-unit outputs;
- insert references into article HTML;
- generate article prose;
- generate production content packets;
- mutate public article HTML;
- copy, move, delete or import scaffold outputs;
- create or append production JSONL records;
- write to any database;
- change approval states;
- set publish_ready=true;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Acceptance Criteria

AG07H is acceptable only if:

- AG07G boundary is consumed;
- AG06I visual/data standard is consumed;
- visual need slots are created as empty boundary slots;
- asset_path, asset_url, caption, alt_text and image_credit fields remain empty;
- data-unit slots are created with empty data_values arrays;
- visual generation remains false;
- image insertion remains false;
- data-unit generation remains false;
- production readiness remains not_ready;
- publish readiness remains blocked;
- AG07I is identified as next only with explicit approval;
- package scripts for generate:ag07h and validate:ag07h are present;
- validate:project includes validate:ag07h;
- no visual generation, image insertion, article prose generation, public mutation, reference insertion, scaffold import, JSONL production append, database write, approval-state change, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07I — Quality and Visitor-Value Scoring Boundary.

AG07I must not start automatically. It requires explicit approval.
`;

writeJson(reviewPath, review);
writeJson(workbenchPath, workbench);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG07H visual and data enrichment boundary/workbench artifacts generated.");
