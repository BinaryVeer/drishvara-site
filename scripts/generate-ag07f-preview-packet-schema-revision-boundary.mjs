import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag07eReview: "data/content-intelligence/quality-reviews/ag07e-preview-packet-revision-plan.json",
  ag07eRoadmap: "data/content-intelligence/run-registry/ag07e-preview-packet-revision-roadmap.json",
  ag07eSchema: "data/content-intelligence/schema/preview-packet-revision-plan.schema.json",
  ag07eLearning: "data/content-intelligence/learning/ag07e-preview-packet-revision-planning-learning.json",
  ag07dReview: "data/content-intelligence/quality-reviews/ag07d-preview-packet-review-gap-audit.json",
  ag07dGapMatrix: "data/content-intelligence/run-registry/ag07d-preview-packet-gap-matrix.json",
  ag07cPacket: "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  ag07cSchema: "data/content-intelligence/schema/content-packet-preview-dry-run.schema.json",
  ag06bContentPacketSchema: "data/content-intelligence/schema/content-packet.schema.json",
  ag06eStandard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  ag06iVisualStandard: "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  ag06jReferenceStandard: "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  ag06kStoreManifest: "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  ag06lApprovalRegister: "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json"
};

const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "ag07f-preview-packet-schema-revision-boundary.json");
const boundaryPlanPath = path.join(root, "data", "content-intelligence", "run-registry", "ag07f-preview-packet-contract-boundary-plan.json");
const revisedSchemaPath = path.join(root, "data", "content-intelligence", "schema", "preview-packet-revised-contract.schema.json");
const learningPath = path.join(root, "data", "content-intelligence", "learning", "ag07f-preview-packet-schema-boundary-learning.json");
const registryPath = path.join(root, "data", "quality", "ag07f-preview-packet-schema-revision-boundary.json");
const previewPath = path.join(root, "data", "quality", "ag07f-preview-packet-schema-revision-boundary-preview.json");
const docPath = path.join(root, "docs", "quality", "AG07F_PREVIEW_PACKET_SCHEMA_REVISION_BOUNDARY.md");

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
  schema_contract_revision_boundary_only: true,
  packet_revision_execution_performed: false,
  preview_packet_modified: false,
  current_ag07c_packet_modified: false,
  revised_packet_created: false,
  article_prose_generated: false,
  narrative_text_generated: false,
  production_content_generated: false,
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
  reference_insertion_performed: false,
  reference_url_population_performed: false,
  reference_url_change_performed: false,
  visual_generation_performed: false,
  visual_asset_generation_performed: false,
  infographic_generation_performed: false,
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
    throw new Error(`Missing required AG07F input ${name}: ${relativePath}`);
  }
}

const ag07eReview = readJson(inputs.ag07eReview);
const ag07eRoadmap = readJson(inputs.ag07eRoadmap);
const ag07eSchema = readJson(inputs.ag07eSchema);
const ag07eLearning = readJson(inputs.ag07eLearning);
const ag07dReview = readJson(inputs.ag07dReview);
const ag07dGapMatrix = readJson(inputs.ag07dGapMatrix);
const ag07cPacket = readJson(inputs.ag07cPacket);
const ag07cSchema = readJson(inputs.ag07cSchema);
const ag06bSchema = readJson(inputs.ag06bContentPacketSchema);
const ag06eStandard = readJson(inputs.ag06eStandard);
const ag06iVisualStandard = readJson(inputs.ag06iVisualStandard);
const ag06jReferenceStandard = readJson(inputs.ag06jReferenceStandard);
const ag06kManifest = readJson(inputs.ag06kStoreManifest);
const ag06lApprovalRegister = readJson(inputs.ag06lApprovalRegister);

const revisionItems = asArray(ag07eRoadmap.revision_items);
const gapItems = asArray(ag07dGapMatrix.gap_items);
const existingPacketSections = asArray(ag07cPacket.packet_sections);
const approvalEntries = asArray(ag06lApprovalRegister.approval_queue_entries);

const proposedContractSections = [
  {
    section_id: "identity",
    purpose: "Identify the packet, source article, category, source queue id and preview/production status.",
    required_fields: [
      "content_packet_id",
      "source_article_path",
      "source_queue_id",
      "category",
      "detected_title",
      "preview_only",
      "production_packet",
      "publish_ready"
    ],
    revision_source: ["AG07E-REV-001"],
    applies_to_current_ag07c_packet_in_ag07f: false
  },
  {
    section_id: "source_context",
    purpose: "Record source article context, existing limitations, intended upgrade reason and reader context.",
    required_fields: [
      "source_summary_placeholder",
      "existing_article_limitations",
      "upgrade_reason",
      "target_reader_context",
      "source_context_confidence"
    ],
    revision_source: ["AG07E-REV-001"],
    applies_to_current_ag07c_packet_in_ag07f: false
  },
  {
    section_id: "reader_value",
    purpose: "Define the user value proposition before drafting begins.",
    required_fields: [
      "reader_problem",
      "reader_takeaway",
      "practical_value",
      "trust_value",
      "revisit_value"
    ],
    revision_source: ["AG07E-REV-001", "AG07E-REV-005"],
    applies_to_current_ag07c_packet_in_ag07f: false
  },
  {
    section_id: "long_form_structure",
    purpose: "Define the planned long-form structure without generating article prose.",
    required_fields: [
      "planned_intro_role",
      "planned_section_sequence",
      "depth_targets",
      "evidence_needs",
      "transition_notes",
      "prose_generation_allowed"
    ],
    revision_source: ["AG07E-REV-001", "AG07E-REV-002"],
    applies_to_current_ag07c_packet_in_ag07f: false
  },
  {
    section_id: "reference_plan",
    purpose: "Define reference needs, credibility filters and future review handoff without URL population.",
    required_fields: [
      "required_reference_count_min",
      "required_reference_count_max",
      "source_type_targets",
      "credibility_tier_targets",
      "reference_discovery_status",
      "candidate_urls",
      "approved_urls",
      "insertion_allowed"
    ],
    revision_source: ["AG07E-REV-003"],
    applies_to_current_ag07c_packet_in_ag07f: false
  },
  {
    section_id: "visual_data_plan",
    purpose: "Define visual/data needs, mobile-safe layout and attribution requirements without generating visuals.",
    required_fields: [
      "primary_hero_visual_need",
      "structured_visual_or_data_unit_need",
      "caption_context_need",
      "alt_text_need",
      "image_credit_need",
      "visual_generation_allowed"
    ],
    revision_source: ["AG07E-REV-004"],
    applies_to_current_ag07c_packet_in_ag07f: false
  },
  {
    section_id: "quality_value_gates",
    purpose: "Define future quality and visitor-value gates before production readiness.",
    required_fields: [
      "quality_score_required",
      "visitor_value_score_required",
      "quality_score_status",
      "visitor_value_score_status",
      "minimum_quality_threshold",
      "minimum_visitor_value_threshold"
    ],
    revision_source: ["AG07E-REV-005"],
    applies_to_current_ag07c_packet_in_ag07f: false
  },
  {
    section_id: "publish_approval_gate",
    purpose: "Keep approval and publish-readiness states explicit and blocked until later approval.",
    required_fields: [
      "approval_state",
      "publication_allowed",
      "publish_ready",
      "approval_state_changed",
      "publish_ready_set",
      "publication_approval_granted"
    ],
    revision_source: ["AG07E-REV-006"],
    applies_to_current_ag07c_packet_in_ag07f: false
  },
  {
    section_id: "persistence_mapping",
    purpose: "Preserve schema-to-JSONL/database/Supabase mapping readiness without enabling persistence.",
    required_fields: [
      "jsonl_record_family",
      "future_table_candidate",
      "database_write_allowed",
      "jsonl_append_allowed",
      "supabase_enabled",
      "schema_mapping_status"
    ],
    revision_source: ["AG07E-REV-007"],
    applies_to_current_ag07c_packet_in_ag07f: false
  },
  {
    section_id: "audit_trace",
    purpose: "Record consumed governance stages, blocked actions and future approval dependencies.",
    required_fields: [
      "created_by_stage",
      "consumed_foundation_stages",
      "blocked_actions",
      "next_stage_requires_explicit_approval",
      "reviewer_notes_placeholder"
    ],
    revision_source: ["AG07E-REV-001", "AG07E-REV-006", "AG07E-REV-007"],
    applies_to_current_ag07c_packet_in_ag07f: false
  }
];

const contractRules = [
  {
    rule_id: "AG07F-RULE-001",
    rule: "A preview packet may contain schema/contract placeholders, but must not be treated as production content.",
    enforcement_status: "boundary_defined_not_executed"
  },
  {
    rule_id: "AG07F-RULE-002",
    rule: "Article prose fields must remain blocked unless a later approved drafting stage explicitly enables them.",
    enforcement_status: "boundary_defined_not_executed"
  },
  {
    rule_id: "AG07F-RULE-003",
    rule: "Reference fields may define needs and source criteria, but candidate_urls and approved_urls must remain empty until a later reference workbench.",
    enforcement_status: "boundary_defined_not_executed"
  },
  {
    rule_id: "AG07F-RULE-004",
    rule: "Visual fields may define needs and layout requirements, but visual generation remains blocked.",
    enforcement_status: "boundary_defined_not_executed"
  },
  {
    rule_id: "AG07F-RULE-005",
    rule: "Publish readiness must remain blocked until approval state, reference, visual, quality and editorial gates are separately closed.",
    enforcement_status: "boundary_defined_not_executed"
  },
  {
    rule_id: "AG07F-RULE-006",
    rule: "Schema-to-database mapping may be defined, but no JSONL append, database write or Supabase activation is allowed.",
    enforcement_status: "boundary_defined_not_executed"
  }
];

const proposedSchemaDelta = [
  {
    delta_id: "AG07F-DELTA-001",
    target: "packet_sections",
    proposed_change: "Replace generic placeholder sections with typed section contracts containing required fields and status guards.",
    source_revision_id: "AG07E-REV-001",
    applied_in_ag07f: false
  },
  {
    delta_id: "AG07F-DELTA-002",
    target: "long_form_structure",
    proposed_change: "Add explicit prose_generation_allowed=false guard inside the long-form structure contract.",
    source_revision_id: "AG07E-REV-002",
    applied_in_ag07f: false
  },
  {
    delta_id: "AG07F-DELTA-003",
    target: "reference_plan",
    proposed_change: "Add reference needs, credibility targets and URL arrays that must remain empty until later workbench approval.",
    source_revision_id: "AG07E-REV-003",
    applied_in_ag07f: false
  },
  {
    delta_id: "AG07F-DELTA-004",
    target: "visual_data_plan",
    proposed_change: "Add hero visual, structured visual/data unit, caption, alt-text and credit readiness fields.",
    source_revision_id: "AG07E-REV-004",
    applied_in_ag07f: false
  },
  {
    delta_id: "AG07F-DELTA-005",
    target: "quality_value_gates",
    proposed_change: "Add quality score and visitor-value gate statuses without calculating scores.",
    source_revision_id: "AG07E-REV-005",
    applied_in_ag07f: false
  },
  {
    delta_id: "AG07F-DELTA-006",
    target: "publish_approval_gate",
    proposed_change: "Add explicit approval-state and publish-readiness guards.",
    source_revision_id: "AG07E-REV-006",
    applied_in_ag07f: false
  },
  {
    delta_id: "AG07F-DELTA-007",
    target: "persistence_mapping",
    proposed_change: "Add future JSONL/database/Supabase mapping fields while keeping writes blocked.",
    source_revision_id: "AG07E-REV-007",
    applied_in_ag07f: false
  }
];

const futureStageHandoff = [
  {
    stage_id: "AG07G",
    title: "Reference Discovery Boundary / Workbench",
    receives_from_ag07f: ["reference_plan"],
    allowed_scope: "reference discovery planning/review only with explicit approval",
    blocked_in_handoff: ["reference_insertion", "public_article_mutation", "publishing"]
  },
  {
    stage_id: "AG07H",
    title: "Visual and Data Enrichment Boundary / Workbench",
    receives_from_ag07f: ["visual_data_plan"],
    allowed_scope: "visual/data planning/review only with explicit approval",
    blocked_in_handoff: ["public_visual_generation", "public_article_mutation", "publishing"]
  },
  {
    stage_id: "AG07I",
    title: "Quality and Visitor-Value Scoring Boundary",
    receives_from_ag07f: ["quality_value_gates"],
    allowed_scope: "scoring boundary/design only with explicit approval",
    blocked_in_handoff: ["publish_ready_set", "approval_state_change", "publishing"]
  },
  {
    stage_id: "AG07J",
    title: "Preview Packet Contract Revision Dry Run",
    receives_from_ag07f: ["proposed_contract_sections", "contract_rules", "proposed_schema_delta"],
    allowed_scope: "create a new preview-only revised packet skeleton only with explicit approval",
    blocked_in_handoff: ["article_prose_generation", "public_mutation", "jsonl_append", "publishing", "backend_auth_supabase_activation"]
  }
];

const summary = {
  ag07e_revision_plan_consumed: ag07eReview.status === "revision_plan_completed",
  ag07d_gap_audit_consumed: ag07dReview.status === "gap_audit_completed",
  ag07c_packet_present: true,
  ag07c_packet_unchanged: true,
  ag07c_packet_preview_only: ag07cPacket.preview_only === true,
  ag07c_packet_production_packet: ag07cPacket.production_packet === true,
  ag07c_packet_publish_ready: ag07cPacket.publish_ready === true,
  source_revision_item_count: revisionItems.length,
  proposed_contract_section_count: proposedContractSections.length,
  contract_rule_count: contractRules.length,
  proposed_schema_delta_count: proposedSchemaDelta.length,
  future_stage_handoff_count: futureStageHandoff.length,
  schema_contract_revision_boundary_defined: true,
  schema_contract_revision_executed: false,
  packet_revision_execution_performed: false,
  revised_packet_created: false,
  production_readiness_after_ag07f: "not_ready",
  publish_readiness_after_ag07f: "blocked",
  article_prose_generated: false,
  public_article_mutation_allowed: false,
  reference_insertion_allowed: false,
  visual_generation_allowed: false,
  jsonl_production_append_allowed: false,
  database_write_allowed: false,
  publishing_allowed: false,
  backend_auth_supabase_allowed: false,
  next_stage_id: "AG07G"
};

const boundaryPlan = {
  module_id: "AG07F",
  title: "Preview Packet Contract Boundary Plan",
  status: "schema_contract_boundary_defined",
  schema_contract_revision_boundary_only: true,
  generated_from: inputs,
  summary,
  current_packet_snapshot: {
    content_packet_id: ag07cPacket.content_packet_id,
    status: ag07cPacket.status,
    preview_only: ag07cPacket.preview_only,
    production_packet: ag07cPacket.production_packet,
    publish_ready: ag07cPacket.publish_ready,
    publication_allowed: ag07cPacket.publication_allowed,
    section_count: existingPacketSections.length,
    current_packet_modified_in_ag07f: false
  },
  source_revision_items: revisionItems.map((item) => ({
    revision_id: item.revision_id,
    revision_area: item.revision_area,
    execution_status_in_ag07e: item.execution_status_in_ag07e,
    packet_revision_execution_allowed_in_ag07e: item.packet_revision_execution_allowed_in_ag07e
  })),
  proposed_contract_sections: proposedContractSections,
  contract_rules: contractRules,
  proposed_schema_delta: proposedSchemaDelta,
  future_stage_handoff: futureStageHandoff,
  ...noMutationControls
};

const revisedContractSchema = {
  schema_id: "drishvara/ag07f/preview-packet-revised-contract.schema.json",
  module_id: "AG07F",
  title: "Preview Packet Revised Contract Schema",
  status: "schema_contract_boundary_only",
  description: "Proposed strengthened contract for future preview packet revisions. AG07F defines the contract but does not apply it to the AG07C packet.",
  applies_to_current_ag07c_packet_in_ag07f: false,
  future_application_requires_explicit_approval: true,
  required_top_level_fields_for_future_revised_preview_packet: [
    "identity",
    "source_context",
    "reader_value",
    "long_form_structure",
    "reference_plan",
    "visual_data_plan",
    "quality_value_gates",
    "publish_approval_gate",
    "persistence_mapping",
    "audit_trace",
    "mutation_controls"
  ],
  proposed_contract_sections: proposedContractSections,
  contract_rules: contractRules,
  required_global_guards: {
    preview_only: true,
    production_packet: false,
    publish_ready: false,
    publication_allowed: false,
    article_prose_generation_allowed: false,
    public_article_mutation_allowed: false,
    reference_insertion_allowed: false,
    visual_generation_allowed: false,
    jsonl_production_append_allowed: false,
    database_write_allowed: false,
    backend_auth_supabase_allowed: false
  },
  reference_contract_from_ag06j: {
    verified_reference_min: ag06eStandard.summary?.verified_reference_min || 2,
    verified_reference_max: ag06eStandard.summary?.verified_reference_max || 5,
    source_taxonomy_available: Array.isArray(ag06jReferenceStandard.source_type_taxonomy),
    candidate_urls_must_remain_empty_until_reference_workbench: true,
    approved_urls_must_remain_empty_until_reference_approval: true
  },
  visual_contract_from_ag06i: {
    visual_type_count: asArray(ag06iVisualStandard.visual_types).length,
    primary_hero_visual_required: true,
    structured_visual_or_data_unit_required: true,
    visual_generation_blocked_in_ag07f: true
  },
  persistence_contract_from_ag06k: {
    jsonl_store_count: asArray(ag06kManifest.stores).length,
    jsonl_append_blocked_in_ag07f: true,
    database_write_blocked_in_ag07f: true,
    supabase_activation_blocked_in_ag07f: true
  },
  approval_contract_from_ag06l: {
    approval_register_count: approvalEntries.length,
    approval_state_change_blocked_in_ag07f: true,
    publish_ready_set_blocked_in_ag07f: true
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG07F",
  title: "Preview Packet Schema Boundary Learning",
  status: "learning_record_only",
  schema_contract_revision_boundary_only: true,
  generated_from: inputs,
  summary,
  learning_points_from_ag07e: asArray(ag07eLearning.ag07e_learning_points),
  ag07f_learning_points: [
    "AG07E revision items can be converted into a stronger future packet contract without modifying the current AG07C packet.",
    "The next practical improvement is a typed preview packet schema with explicit section-level fields.",
    "Reference, visual, quality, approval and persistence contracts should remain separate gates inside the packet contract.",
    "Schema-to-database compatibility can be preserved through persistence mapping fields without enabling Supabase/database writes.",
    "A future revised preview packet should be created only in a separately approved dry-run stage."
  ],
  carried_forward_doctrine: [
    "Schema/contract boundary is not packet revision execution.",
    "The AG07C preview packet remains unchanged in AG07F.",
    "Future contract fields do not authorize article prose generation.",
    "Future reference fields do not authorize URL discovery or insertion.",
    "Future persistence fields do not authorize JSONL append, database write or Supabase activation."
  ],
  ...noMutationControls
};

const review = {
  module_id: "AG07F",
  title: "Preview Packet Schema Revision Boundary",
  status: "schema_contract_boundary_defined",
  governance_only: true,
  schema_contract_revision_boundary_only: true,
  depends_on: ["AG07E", "AG07D", "AG07C", "AG06B", "AG06E", "AG06I", "AG06J", "AG06K", "AG06L"],
  generated_from: inputs,
  summary,
  alignment_with_ag07e: {
    ag07e_status: ag07eReview.status,
    ag07e_decision: ag07eReview.closure_decision?.decision,
    ag07f_requires_explicit_approval: ag07eReview.closure_decision?.proceed_to_ag07f_only_with_explicit_user_approval,
    packet_revision_execution_allowed: ag07eReview.closure_decision?.packet_revision_execution_allowed,
    article_prose_generation_allowed: ag07eReview.closure_decision?.article_prose_generation_allowed,
    public_article_mutation_allowed: ag07eReview.closure_decision?.public_article_mutation_allowed,
    reference_insertion_allowed: ag07eReview.closure_decision?.reference_insertion_allowed,
    visual_generation_allowed: ag07eReview.closure_decision?.visual_generation_allowed,
    jsonl_production_append_allowed: ag07eReview.closure_decision?.jsonl_production_append_allowed,
    backend_auth_supabase_allowed: ag07eReview.closure_decision?.backend_auth_supabase_allowed
  },
  foundation_alignment: {
    ag06b_schema_available: ag06bSchema.module_id === "AG06B" || Boolean(ag06bSchema.schema_id),
    ag07c_schema_status: ag07cSchema.status,
    ag07e_schema_status: ag07eSchema.status,
    ag07d_gap_count: gapItems.length,
    ag07e_revision_item_count: revisionItems.length,
    long_form_word_count_min: ag06eStandard.summary?.word_count_min || 1500,
    long_form_word_count_max: ag06eStandard.summary?.word_count_max || 2200,
    visual_type_count: asArray(ag06iVisualStandard.visual_types).length,
    source_type_count: asArray(ag06jReferenceStandard.source_type_taxonomy).length,
    jsonl_store_count: asArray(ag06kManifest.stores).length,
    approval_register_count: approvalEntries.length
  },
  boundary_plan_file: "data/content-intelligence/run-registry/ag07f-preview-packet-contract-boundary-plan.json",
  revised_contract_schema_file: "data/content-intelligence/schema/preview-packet-revised-contract.schema.json",
  learning_file: "data/content-intelligence/learning/ag07f-preview-packet-schema-boundary-learning.json",
  closure_decision: {
    decision: "ag07f_preview_packet_schema_revision_boundary_closed",
    proceed_to_ag07g_only_with_explicit_user_approval: true,
    schema_contract_revision_boundary_defined: true,
    schema_contract_revision_executed: false,
    packet_revision_execution_performed: false,
    revised_packet_created: false,
    production_readiness: "not_ready",
    publish_readiness: "blocked",
    article_prose_generation_allowed: false,
    public_article_mutation_allowed: false,
    reference_insertion_allowed: false,
    visual_generation_allowed: false,
    scaffold_import_allowed: false,
    jsonl_production_append_allowed: false,
    database_write_allowed: false,
    publishing_allowed: false,
    backend_auth_supabase_allowed: false
  },
  ...noMutationControls
};

const registry = {
  module_id: "AG07F",
  title: "Preview Packet Schema Revision Boundary",
  governance_only: true,
  schema_contract_revision_boundary_only: true,
  depends_on: ["AG07E"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag07f-preview-packet-schema-revision-boundary.json",
    boundary_plan: "data/content-intelligence/run-registry/ag07f-preview-packet-contract-boundary-plan.json",
    revised_contract_schema: "data/content-intelligence/schema/preview-packet-revised-contract.schema.json",
    learning: "data/content-intelligence/learning/ag07f-preview-packet-schema-boundary-learning.json",
    preview: "data/quality/ag07f-preview-packet-schema-revision-boundary-preview.json",
    document: "docs/quality/AG07F_PREVIEW_PACKET_SCHEMA_REVISION_BOUNDARY.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG07G",
    title: "Reference Discovery Boundary / Workbench",
    allowed_scope: "reference discovery planning/review only unless explicitly expanded",
    blocked_scope: "packet revision execution, article prose generation, public mutation, reference insertion, visual generation, JSONL production append, publishing, backend/Auth/Supabase activation"
  },
  ...noMutationControls
};

const preview = {
  module_id: "AG07F",
  preview_only: true,
  schema_contract_revision_boundary_only: true,
  summary,
  current_packet_snapshot: boundaryPlan.current_packet_snapshot,
  proposed_contract_sections: proposedContractSections.map((section) => ({
    section_id: section.section_id,
    required_field_count: section.required_fields.length,
    applies_to_current_ag07c_packet_in_ag07f: section.applies_to_current_ag07c_packet_in_ag07f
  })),
  proposed_schema_delta: proposedSchemaDelta,
  contract_rules: contractRules,
  future_stage_handoff: futureStageHandoff,
  next_stage_id: "AG07G",
  ...noMutationControls
};

const doc = `# AG07F — Preview Packet Schema Revision Boundary

## Purpose

AG07F defines a strengthened preview packet schema and contract boundary based on the AG07E revision plan.

This stage is schema/contract boundary only. It does not revise the AG07C packet, create a revised packet, generate article prose, mutate public articles, insert references, generate visuals, append JSONL records, publish content, write to a database, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07F consumes:

- AG07E Preview Packet Revision Plan.
- AG07E revision roadmap.
- AG07E schema and learning record.
- AG07D Preview Packet Review and Gap Audit.
- AG07C preview-only packet skeleton.
- AG07C preview packet schema.
- AG06B content packet schema.
- AG06E long-form article standard.
- AG06I visual/data standard.
- AG06J reference/source credibility standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Contract Boundary

AG07F defines proposed future packet contract sections for:

- identity;
- source context;
- reader value;
- long-form structure;
- reference plan;
- visual/data plan;
- quality and visitor-value gates;
- publish approval gate;
- persistence mapping;
- audit trace.

These are proposed contract sections only. They are not applied to the AG07C packet in AG07F.

## Packet Status

The AG07C preview packet remains:

- unchanged;
- preview-only;
- non-production;
- not publish-ready;
- not publication-allowed;
- without generated article prose;
- without reference URLs;
- without visual assets;
- without JSONL/database persistence.

## Production Readiness Decision

AG07F does not make the preview packet production-ready.

Production readiness remains not_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07F does not:

- execute packet revision;
- modify the AG07C preview packet;
- create a revised packet;
- generate article prose;
- generate production content packets;
- mutate public article HTML;
- insert, populate or change reference URLs;
- fetch live URLs;
- generate visual assets or infographics;
- copy, move, delete or import scaffold outputs;
- create or append production JSONL records;
- write to any database;
- change approval states;
- set publish_ready=true;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Acceptance Criteria

AG07F is acceptable only if:

- AG07E revision plan is consumed;
- AG07D gaps and AG07E revisions are represented;
- proposed contract sections are defined;
- proposed schema deltas are recorded but not applied;
- AG07C packet remains unchanged and preview-only;
- production readiness remains not_ready;
- publish readiness remains blocked;
- AG07G is identified as next only with explicit approval;
- package scripts for generate:ag07f and validate:ag07f are present;
- validate:project includes validate:ag07f;
- no packet revision execution, article prose generation, public mutation, reference insertion, visual generation, scaffold import, JSONL production append, database write, approval-state change, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07G — Reference Discovery Boundary / Workbench.

AG07G must not start automatically. It requires explicit approval.
`;

writeJson(reviewPath, review);
writeJson(boundaryPlanPath, boundaryPlan);
writeJson(revisedSchemaPath, revisedContractSchema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG07F preview packet schema revision boundary artifacts generated.");
