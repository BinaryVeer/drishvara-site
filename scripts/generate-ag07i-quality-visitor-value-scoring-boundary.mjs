import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag07hReview: "data/content-intelligence/quality-reviews/ag07h-visual-data-enrichment-boundary-workbench.json",
  ag07hWorkbench: "data/content-intelligence/visual-registry/ag07h-visual-data-enrichment-workbench.json",
  ag07hSchema: "data/content-intelligence/schema/visual-data-enrichment-workbench.schema.json",
  ag07hLearning: "data/content-intelligence/learning/ag07h-visual-data-enrichment-boundary-learning.json",
  ag07gReview: "data/content-intelligence/quality-reviews/ag07g-reference-discovery-boundary-workbench.json",
  ag07gWorkbench: "data/content-intelligence/reference-registry/ag07g-reference-discovery-workbench.json",
  ag07fReview: "data/content-intelligence/quality-reviews/ag07f-preview-packet-schema-revision-boundary.json",
  ag07fBoundaryPlan: "data/content-intelligence/run-registry/ag07f-preview-packet-contract-boundary-plan.json",
  ag07cPacket: "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  ag06eLongFormStandard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  ag06iVisualStandard: "data/content-intelligence/visual-registry/visual-data-infographic-requirement-standard.json",
  ag06jReferenceStandard: "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  ag06kStoreManifest: "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  ag06lApprovalRegister: "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json"
};

const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "ag07i-quality-visitor-value-scoring-boundary.json");
const scoringModelPath = path.join(root, "data", "content-intelligence", "quality-registry", "ag07i-quality-visitor-value-scoring-model.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "quality-visitor-value-scoring-boundary.schema.json");
const learningPath = path.join(root, "data", "content-intelligence", "learning", "ag07i-quality-visitor-value-scoring-boundary-learning.json");
const registryPath = path.join(root, "data", "quality", "ag07i-quality-visitor-value-scoring-boundary.json");
const previewPath = path.join(root, "data", "quality", "ag07i-quality-visitor-value-scoring-boundary-preview.json");
const docPath = path.join(root, "docs", "quality", "AG07I_QUALITY_VISITOR_VALUE_SCORING_BOUNDARY.md");

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

function weightTotal(items) {
  return items.reduce((sum, item) => sum + Number(item.weight || 0), 0);
}

const noMutationControls = {
  quality_visitor_value_scoring_boundary_only: true,
  actual_score_calculation_performed: false,
  quality_score_calculated: false,
  visitor_value_score_calculated: false,
  combined_score_calculated: false,
  scoring_execution_performed: false,
  article_inference_created: false,
  article_inference_stored: false,
  publish_ready_approval_performed: false,
  approval_state_changed: false,
  publish_ready_set: false,
  article_prose_generated: false,
  narrative_text_generated: false,
  production_content_generated: false,
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
  reference_insertion_performed: false,
  reference_url_population_performed: false,
  visual_generation_performed: false,
  visual_asset_generation_performed: false,
  image_insertion_performed: false,
  data_unit_generation_performed: false,
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
  public_publishing_performed: false,
  publication_approval_granted: false
};

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG07I input ${name}: ${relativePath}`);
  }
}

const ag07hReview = readJson(inputs.ag07hReview);
const ag07hWorkbench = readJson(inputs.ag07hWorkbench);
const ag07hSchema = readJson(inputs.ag07hSchema);
const ag07hLearning = readJson(inputs.ag07hLearning);
const ag07gReview = readJson(inputs.ag07gReview);
const ag07gWorkbench = readJson(inputs.ag07gWorkbench);
const ag07fReview = readJson(inputs.ag07fReview);
const ag07fBoundaryPlan = readJson(inputs.ag07fBoundaryPlan);
const ag07cPacket = readJson(inputs.ag07cPacket);
const ag06eLongFormStandard = readJson(inputs.ag06eLongFormStandard);
const ag06iVisualStandard = readJson(inputs.ag06iVisualStandard);
const ag06jReferenceStandard = readJson(inputs.ag06jReferenceStandard);
const ag06kStoreManifest = readJson(inputs.ag06kStoreManifest);
const ag06lApprovalRegister = readJson(inputs.ag06lApprovalRegister);

const qualityDimensions = [
  {
    dimension_id: "AG07I-Q-001",
    dimension_name: "factual_integrity_and_evidence_alignment",
    weight: 25,
    purpose: "Future assessment of claim accuracy, source support, and non-invented evidence.",
    calculation_allowed_in_ag07i: false,
    dimension_status: "not_evaluated",
    calculated_score: null
  },
  {
    dimension_id: "AG07I-Q-002",
    dimension_name: "long_form_depth_and_structure",
    weight: 20,
    purpose: "Future assessment of 1500–2200 word long-form depth, sequencing, section logic, and completeness.",
    calculation_allowed_in_ag07i: false,
    dimension_status: "not_evaluated",
    calculated_score: null
  },
  {
    dimension_id: "AG07I-Q-003",
    dimension_name: "originality_context_and_synthesis",
    weight: 20,
    purpose: "Future assessment of whether the article adds meaningful synthesis beyond generic summary.",
    calculation_allowed_in_ag07i: false,
    dimension_status: "not_evaluated",
    calculated_score: null
  },
  {
    dimension_id: "AG07I-Q-004",
    dimension_name: "reference_and_source_readiness",
    weight: 20,
    purpose: "Future assessment of verified reference count, source credibility, link health, and reference placement.",
    calculation_allowed_in_ag07i: false,
    dimension_status: "not_evaluated",
    calculated_score: null
  },
  {
    dimension_id: "AG07I-Q-005",
    dimension_name: "visual_data_accessibility_readiness",
    weight: 15,
    purpose: "Future assessment of visual relevance, data-unit usefulness, caption, alt-text, image credit, and mobile safety.",
    calculation_allowed_in_ag07i: false,
    dimension_status: "not_evaluated",
    calculated_score: null
  }
];

const visitorValueDimensions = [
  {
    dimension_id: "AG07I-V-001",
    dimension_name: "reader_intent_alignment",
    weight: 25,
    purpose: "Future assessment of how clearly the article answers the reader's likely intent.",
    calculation_allowed_in_ag07i: false,
    dimension_status: "not_evaluated",
    calculated_score: null
  },
  {
    dimension_id: "AG07I-V-002",
    dimension_name: "clarity_and_readability",
    weight: 20,
    purpose: "Future assessment of accessible language, flow, scannability, and comprehension.",
    calculation_allowed_in_ag07i: false,
    dimension_status: "not_evaluated",
    calculated_score: null
  },
  {
    dimension_id: "AG07I-V-003",
    dimension_name: "practical_takeaway_value",
    weight: 20,
    purpose: "Future assessment of useful insights, explanatory payoff, and actionable reader value.",
    calculation_allowed_in_ag07i: false,
    dimension_status: "not_evaluated",
    calculated_score: null
  },
  {
    dimension_id: "AG07I-V-004",
    dimension_name: "trust_and_revisit_value",
    weight: 20,
    purpose: "Future assessment of whether the article feels credible, worth bookmarking, and worth sharing.",
    calculation_allowed_in_ag07i: false,
    dimension_status: "not_evaluated",
    calculated_score: null
  },
  {
    dimension_id: "AG07I-V-005",
    dimension_name: "engagement_and_presentation_value",
    weight: 15,
    purpose: "Future assessment of narrative pull, visual/data support, layout quality, and reader retention.",
    calculation_allowed_in_ag07i: false,
    dimension_status: "not_evaluated",
    calculated_score: null
  }
];

const scoringThresholds = {
  quality_score_minimum_for_publish_ready: 80,
  visitor_value_score_minimum_for_publish_ready: 75,
  combined_score_minimum_for_publish_ready: 78,
  minimum_reference_count_before_scoring: 2,
  maximum_reference_count_standard: 5,
  article_inference_required_before_score_calculation: true,
  revised_preview_packet_required_before_score_calculation: true,
  reference_readiness_required_before_publish_ready: true,
  visual_data_readiness_required_before_publish_ready: true,
  reviewer_approval_required_before_publish_ready: true,
  actual_threshold_evaluation_performed_in_ag07i: false
};

const readinessGateGroups = [
  {
    gate_group_id: "AG07I-GATE-001",
    gate_group_name: "article_inference_gate",
    purpose: "Structured article inference must exist before any actual scoring.",
    required_before_score_calculation: true,
    evaluated_in_ag07i: false,
    gate_status: "not_evaluated",
    next_stage_dependency: "AG07J"
  },
  {
    gate_group_id: "AG07I-GATE-002",
    gate_group_name: "revised_preview_packet_gate",
    purpose: "A revised preview packet with populated planned fields must exist before scoring.",
    required_before_score_calculation: true,
    evaluated_in_ag07i: false,
    gate_status: "not_evaluated",
    next_stage_dependency: "future_revised_preview_packet_stage"
  },
  {
    gate_group_id: "AG07I-GATE-003",
    gate_group_name: "reference_readiness_gate",
    purpose: "Candidate and approved reference readiness must be reviewed before scoring/publish readiness.",
    required_before_score_calculation: true,
    evaluated_in_ag07i: false,
    gate_status: "not_evaluated",
    next_stage_dependency: "future_reference_population_review_stage"
  },
  {
    gate_group_id: "AG07I-GATE-004",
    gate_group_name: "visual_data_readiness_gate",
    purpose: "Visual/data slots, captions, alt text and credits must be reviewed before publish readiness.",
    required_before_publish_ready: true,
    evaluated_in_ag07i: false,
    gate_status: "not_evaluated",
    next_stage_dependency: "future_visual_population_review_stage"
  },
  {
    gate_group_id: "AG07I-GATE-005",
    gate_group_name: "editorial_approval_gate",
    purpose: "Reviewer decision must remain separate from scoring and must occur only after scoring evidence exists.",
    required_before_publish_ready: true,
    evaluated_in_ag07i: false,
    gate_status: "not_evaluated",
    next_stage_dependency: "future_approval_stage"
  }
];

const reviewerDecisionFields = [
  {
    field_id: "reviewer_decision",
    allowed_values: ["not_started", "needs_article_inference", "needs_revision", "ready_for_scoring_later", "blocked", "rejected"],
    default_value_in_ag07i: "not_started",
    value_set_in_ag07i: false
  },
  {
    field_id: "score_review_notes",
    allowed_values: ["free_text_future_field"],
    default_value_in_ag07i: "",
    value_set_in_ag07i: false
  },
  {
    field_id: "failure_reason",
    allowed_values: [
      "article_inference_missing",
      "revised_packet_missing",
      "references_missing",
      "visual_data_missing",
      "quality_below_threshold",
      "visitor_value_below_threshold",
      "editorial_blocker"
    ],
    default_value_in_ag07i: "",
    value_set_in_ag07i: false
  },
  {
    field_id: "approval_state",
    allowed_values: ["not_started", "review_pending", "approved_later", "rejected_later"],
    default_value_in_ag07i: "not_started",
    value_set_in_ag07i: false
  }
];

const scoringWorkflow = [
  {
    step_id: "AG07I-WF-001",
    step_name: "define_scoring_dimensions",
    description: "Define quality and visitor-value dimensions and weights.",
    performed_in_ag07i: true,
    calculation_step: false
  },
  {
    step_id: "AG07I-WF-002",
    step_name: "define_thresholds",
    description: "Define future thresholds for publish-readiness gates.",
    performed_in_ag07i: true,
    calculation_step: false
  },
  {
    step_id: "AG07I-WF-003",
    step_name: "require_article_inference_store",
    description: "Route next stage to AG07J Article Inference Store Boundary before any scoring.",
    performed_in_ag07i: true,
    calculation_step: false
  },
  {
    step_id: "AG07I-WF-004",
    step_name: "calculate_scores",
    description: "Future score calculation after article inference and revised packet exist.",
    performed_in_ag07i: false,
    calculation_step: true,
    future_approval_required: true
  },
  {
    step_id: "AG07I-WF-005",
    step_name: "set_publish_ready",
    description: "Future approval step only after scoring, references, visuals and editorial review pass.",
    performed_in_ag07i: false,
    calculation_step: false,
    future_approval_required: true
  }
];

const summary = {
  ag07h_boundary_consumed: ag07hReview.status === "visual_data_enrichment_boundary_defined",
  ag07g_boundary_consumed: ag07gReview.status === "reference_discovery_boundary_defined",
  ag07f_boundary_consumed: ag07fReview.status === "schema_contract_boundary_defined",
  ag07c_packet_present: true,
  ag07c_packet_unchanged: true,
  quality_dimension_count: qualityDimensions.length,
  visitor_value_dimension_count: visitorValueDimensions.length,
  quality_weight_total: weightTotal(qualityDimensions),
  visitor_value_weight_total: weightTotal(visitorValueDimensions),
  scoring_thresholds_defined: true,
  readiness_gate_group_count: readinessGateGroups.length,
  reviewer_decision_field_count: reviewerDecisionFields.length,
  scoring_workflow_step_count: scoringWorkflow.length,
  article_inference_store_required_before_actual_scoring: true,
  next_stage_id: "AG07J",
  next_stage_title: "Article Inference Store Boundary",
  actual_score_calculation_performed: false,
  quality_score_calculated: false,
  visitor_value_score_calculated: false,
  combined_score_calculated: false,
  calculated_quality_score: null,
  calculated_visitor_value_score: null,
  calculated_combined_score: null,
  publish_ready_approval_performed: false,
  approval_state_changed: false,
  publish_ready_set: false,
  production_readiness_after_ag07i: "not_ready",
  publish_readiness_after_ag07i: "blocked",
  public_article_mutation_allowed: false,
  article_prose_generated: false,
  reference_insertion_allowed: false,
  visual_generation_allowed: false,
  jsonl_production_append_allowed: false,
  database_write_allowed: false,
  publishing_allowed: false,
  backend_auth_supabase_allowed: false
};

const scoringModel = {
  module_id: "AG07I",
  title: "Quality and Visitor-Value Scoring Boundary Model",
  status: "scoring_boundary_defined",
  quality_visitor_value_scoring_boundary_only: true,
  generated_from: inputs,
  summary,
  source_packet_snapshot: {
    content_packet_id: ag07cPacket.content_packet_id,
    status: ag07cPacket.status,
    preview_only: ag07cPacket.preview_only,
    production_packet: ag07cPacket.production_packet,
    publish_ready: ag07cPacket.publish_ready,
    publication_allowed: ag07cPacket.publication_allowed,
    packet_modified_in_ag07i: false
  },
  upstream_boundary_snapshot: {
    ag07h_visual_generation_performed: ag07hReview.summary?.visual_generation_performed,
    ag07h_image_insertion_performed: ag07hReview.summary?.image_insertion_performed,
    ag07g_reference_url_population_performed: ag07gReview.summary?.reference_url_population_performed,
    ag07g_reference_insertion_performed: ag07gReview.summary?.reference_insertion_performed
  },
  long_form_standard_snapshot: {
    word_count_min: ag06eLongFormStandard.summary?.word_count_min || 1500,
    word_count_max: ag06eLongFormStandard.summary?.word_count_max || 2200,
    verified_reference_min: ag06eLongFormStandard.summary?.verified_reference_min || 2,
    verified_reference_max: ag06eLongFormStandard.summary?.verified_reference_max || 5,
    quality_score_gate_required: true,
    visitor_value_score_gate_required: true
  },
  quality_dimensions: qualityDimensions,
  visitor_value_dimensions: visitorValueDimensions,
  scoring_thresholds: scoringThresholds,
  readiness_gate_groups: readinessGateGroups,
  reviewer_decision_fields: reviewerDecisionFields,
  scoring_workflow: scoringWorkflow,
  actual_scores: {
    quality_score: null,
    visitor_value_score: null,
    combined_score: null,
    calculation_status: "not_calculated_in_ag07i",
    score_calculation_allowed_in_ag07i: false
  },
  future_stage_handoff: [
    {
      stage_id: "AG07J",
      title: "Article Inference Store Boundary",
      receives_from_ag07i: [
        "quality_dimensions",
        "visitor_value_dimensions",
        "scoring_thresholds",
        "readiness_gate_groups",
        "reviewer_decision_fields"
      ],
      allowed_scope: "article inference schema/store boundary only with explicit approval",
      blocked_actions: [
        "actual_score_calculation",
        "publish_ready_set",
        "approval_state_change",
        "public_article_mutation",
        "jsonl_production_append",
        "publishing",
        "backend_auth_supabase_activation"
      ]
    }
  ],
  ...noMutationControls
};

const schema = {
  schema_id: "drishvara/ag07i/quality-visitor-value-scoring-boundary.schema.json",
  module_id: "AG07I",
  title: "Quality and Visitor-Value Scoring Boundary Schema",
  status: "schema_boundary_only",
  description: "Schema for future quality and visitor-value scoring. AG07I defines dimensions, weights, thresholds and gate logic only; it does not calculate actual scores.",
  required_top_level_fields: [
    "source_packet_snapshot",
    "quality_dimensions",
    "visitor_value_dimensions",
    "scoring_thresholds",
    "readiness_gate_groups",
    "reviewer_decision_fields",
    "scoring_workflow",
    "actual_scores",
    "mutation_controls"
  ],
  required_dimension_fields: [
    "dimension_id",
    "dimension_name",
    "weight",
    "purpose",
    "calculation_allowed_in_ag07i",
    "dimension_status",
    "calculated_score"
  ],
  allowed_dimension_statuses: [
    "not_evaluated",
    "blocked_missing_inference",
    "blocked_missing_revised_packet",
    "ready_for_future_scoring",
    "calculated_later"
  ],
  quality_weight_total_required: 100,
  visitor_value_weight_total_required: 100,
  actual_score_calculation_allowed_in_ag07i: false,
  publish_ready_approval_allowed_in_ag07i: false,
  approval_state_change_allowed_in_ag07i: false,
  article_inference_creation_allowed_in_ag07i: false,
  article_mutation_allowed_in_ag07i: false,
  reference_insertion_allowed_in_ag07i: false,
  visual_generation_allowed_in_ag07i: false,
  jsonl_append_allowed_in_ag07i: false,
  database_write_allowed_in_ag07i: false,
  publishing_allowed_in_ag07i: false,
  backend_auth_supabase_allowed_in_ag07i: false,
  ...noMutationControls
};

const learning = {
  module_id: "AG07I",
  title: "Quality and Visitor-Value Scoring Boundary Learning",
  status: "learning_record_only",
  quality_visitor_value_scoring_boundary_only: true,
  generated_from: inputs,
  summary,
  learning_points_from_ag07h: asArray(ag07hLearning.ag07h_learning_points),
  ag07i_learning_points: [
    "Scoring dimensions and thresholds must be defined before scoring execution begins.",
    "Actual scoring is not meaningful while the preview packet remains a skeleton and reference/visual fields remain empty.",
    "Article inference must be introduced before score calculation so the system scores intent, gaps and reader value in a structured way.",
    "Publish-ready approval must remain separate from score calculation.",
    "AG07J Article Inference Store Boundary must come before any actual scoring execution."
  ],
  carried_forward_doctrine: [
    "Scoring boundary is not score calculation.",
    "A scoring model is not a publish-ready approval.",
    "Article inference is required before actual scoring.",
    "No approval state may change in AG07I.",
    "No public article mutation may occur in AG07I."
  ],
  ...noMutationControls
};

const review = {
  module_id: "AG07I",
  title: "Quality and Visitor-Value Scoring Boundary",
  status: "scoring_boundary_defined",
  governance_only: true,
  quality_visitor_value_scoring_boundary_only: true,
  depends_on: ["AG07H", "AG07G", "AG07F", "AG07C", "AG06E", "AG06I", "AG06J", "AG06K", "AG06L"],
  generated_from: inputs,
  summary,
  alignment_with_ag07h: {
    ag07h_status: ag07hReview.status,
    ag07h_decision: ag07hReview.closure_decision?.decision,
    ag07i_requires_explicit_approval: ag07hReview.closure_decision?.proceed_to_ag07i_only_with_explicit_user_approval,
    visual_generation_performed: ag07hReview.closure_decision?.visual_generation_performed,
    image_insertion_performed: ag07hReview.closure_decision?.image_insertion_performed,
    public_article_mutation_allowed: ag07hReview.closure_decision?.public_article_mutation_allowed,
    reference_insertion_allowed: ag07hReview.closure_decision?.reference_insertion_allowed,
    jsonl_production_append_allowed: ag07hReview.closure_decision?.jsonl_production_append_allowed,
    backend_auth_supabase_allowed: ag07hReview.closure_decision?.backend_auth_supabase_allowed
  },
  upstream_readiness_context: {
    ag07g_candidate_reference_slot_count: asArray(ag07gWorkbench.candidate_reference_slots).length,
    ag07h_visual_need_slot_count: asArray(ag07hWorkbench.visual_need_slots).length,
    ag07h_data_unit_slot_count: asArray(ag07hWorkbench.data_unit_slots).length,
    visual_generation_blocked_by_ag07h_schema: ag07hSchema.visual_generation_allowed_in_ag07h === false,
    image_insertion_blocked_by_ag07h_schema: ag07hSchema.image_insertion_allowed_in_ag07h === false
  },
  scoring_model_file: "data/content-intelligence/quality-registry/ag07i-quality-visitor-value-scoring-model.json",
  schema_file: "data/content-intelligence/schema/quality-visitor-value-scoring-boundary.schema.json",
  learning_file: "data/content-intelligence/learning/ag07i-quality-visitor-value-scoring-boundary-learning.json",
  foundation_alignment: {
    ag06e_long_form_standard_consumed: true,
    ag06i_visual_standard_consumed: Boolean(ag06iVisualStandard),
    ag06j_reference_standard_consumed: Boolean(ag06jReferenceStandard),
    jsonl_store_count: asArray(ag06kStoreManifest.stores).length,
    approval_register_count: asArray(ag06lApprovalRegister.approval_queue_entries).length
  },
  closure_decision: {
    decision: "ag07i_quality_visitor_value_scoring_boundary_closed",
    proceed_to_ag07j_only_with_explicit_user_approval: true,
    ag07j_article_inference_store_boundary_required_before_actual_score_calculation: true,
    quality_visitor_value_scoring_boundary_defined: true,
    actual_score_calculation_performed: false,
    quality_score_calculated: false,
    visitor_value_score_calculated: false,
    combined_score_calculated: false,
    article_inference_created: false,
    article_inference_stored: false,
    publish_ready_approval_performed: false,
    approval_state_changed: false,
    publish_ready_set: false,
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
  module_id: "AG07I",
  title: "Quality and Visitor-Value Scoring Boundary",
  governance_only: true,
  quality_visitor_value_scoring_boundary_only: true,
  depends_on: ["AG07H"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag07i-quality-visitor-value-scoring-boundary.json",
    scoring_model: "data/content-intelligence/quality-registry/ag07i-quality-visitor-value-scoring-model.json",
    schema: "data/content-intelligence/schema/quality-visitor-value-scoring-boundary.schema.json",
    learning: "data/content-intelligence/learning/ag07i-quality-visitor-value-scoring-boundary-learning.json",
    preview: "data/quality/ag07i-quality-visitor-value-scoring-boundary-preview.json",
    document: "docs/quality/AG07I_QUALITY_VISITOR_VALUE_SCORING_BOUNDARY.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG07J",
    title: "Article Inference Store Boundary",
    allowed_scope: "article inference schema/store boundary only unless explicitly expanded",
    blocked_scope: "actual score calculation, publish-ready approval, approval-state change, article prose generation, public mutation, reference insertion, visual generation, JSONL production append, publishing, backend/Auth/Supabase activation"
  },
  ...noMutationControls
};

const preview = {
  module_id: "AG07I",
  preview_only: true,
  quality_visitor_value_scoring_boundary_only: true,
  summary,
  source_packet_snapshot: scoringModel.source_packet_snapshot,
  quality_dimensions: qualityDimensions.map((dimension) => ({
    dimension_id: dimension.dimension_id,
    dimension_name: dimension.dimension_name,
    weight: dimension.weight,
    calculation_allowed_in_ag07i: dimension.calculation_allowed_in_ag07i,
    dimension_status: dimension.dimension_status,
    calculated_score: dimension.calculated_score
  })),
  visitor_value_dimensions: visitorValueDimensions.map((dimension) => ({
    dimension_id: dimension.dimension_id,
    dimension_name: dimension.dimension_name,
    weight: dimension.weight,
    calculation_allowed_in_ag07i: dimension.calculation_allowed_in_ag07i,
    dimension_status: dimension.dimension_status,
    calculated_score: dimension.calculated_score
  })),
  scoring_thresholds: scoringThresholds,
  readiness_gate_groups: readinessGateGroups,
  reviewer_decision_fields: reviewerDecisionFields,
  actual_scores: scoringModel.actual_scores,
  next_stage_id: "AG07J",
  next_stage_title: "Article Inference Store Boundary",
  ...noMutationControls
};

const doc = `# AG07I — Quality and Visitor-Value Scoring Boundary

## Purpose

AG07I defines the quality and visitor-value scoring boundary for future long-form content packets.

This stage defines scoring dimensions, weights, thresholds, readiness gates, reviewer decision fields and workflow only. It does not calculate actual scores, approve publish-readiness, change approval state, generate article prose, mutate public articles, insert references, generate visuals, append JSONL records, publish content, write to a database, or activate backend/Auth/Supabase/API functionality.

## Why Actual Scores Are Not Calculated in AG07I

Actual scoring is intentionally blocked because the current AG07C packet is still a preview-only skeleton, while AG07G and AG07H keep reference, visual, caption, alt-text, image-credit and data-unit fields empty.

A real score must be based on a revised packet and a structured article inference record. Therefore, AG07J Article Inference Store Boundary is identified as the next controlled stage before any actual score calculation.

## Inputs

AG07I consumes:

- AG07H Visual and Data Enrichment Boundary / Workbench.
- AG07G Reference Discovery Boundary / Workbench.
- AG07F Preview Packet Schema Revision Boundary.
- AG07C preview-only packet skeleton.
- AG06E long-form article standard.
- AG06I visual/data/infographic requirement standard.
- AG06J reference/source credibility standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Scoring Boundary

AG07I defines:

- quality scoring dimensions;
- visitor-value scoring dimensions;
- scoring weights;
- publish-readiness thresholds;
- article inference requirement before actual scoring;
- readiness gate groups;
- reviewer decision fields;
- failure reason fields;
- future scoring workflow.

Both quality and visitor-value weights total 100.

## Scoring Status

AG07I does not calculate:

- quality score;
- visitor-value score;
- combined score;
- publish-readiness score;
- approval decision.

All dimension statuses remain not_evaluated.

All calculated score fields remain null.

## Production Readiness Decision

AG07I does not make the packet production-ready.

Production readiness remains not_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07I does not:

- calculate actual scores;
- create or store article inference records;
- approve publish-readiness;
- change approval state;
- set publish_ready=true;
- generate article prose;
- generate production content packets;
- mutate public article HTML;
- insert references into article HTML;
- generate visual assets or infographics;
- insert images;
- copy, move, delete or import scaffold outputs;
- create or append production JSONL records;
- write to any database;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Acceptance Criteria

AG07I is acceptable only if:

- AG07H boundary is consumed;
- scoring dimensions are defined;
- quality scoring weights total 100;
- visitor-value scoring weights total 100;
- scoring thresholds are defined;
- article inference is required before actual scoring;
- actual score calculation remains false;
- all calculated score fields remain null;
- publish-ready approval remains false;
- approval-state change remains false;
- production readiness remains not_ready;
- publish readiness remains blocked;
- AG07J Article Inference Store Boundary is identified as next before any actual score calculation;
- package scripts for generate:ag07i and validate:ag07i are present;
- validate:project includes validate:ag07i;
- no actual score calculation, approval-state change, article prose generation, public mutation, reference insertion, visual generation, scaffold import, JSONL production append, database write, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07J — Article Inference Store Boundary.

AG07J must not start automatically. It requires explicit approval.
`;

writeJson(reviewPath, review);
writeJson(scoringModelPath, scoringModel);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG07I quality and visitor-value scoring boundary artifacts generated.");
