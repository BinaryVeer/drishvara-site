import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag07kReview: "data/content-intelligence/quality-reviews/ag07k-article-inference-preview-record-dry-run.json",
  ag07kInferenceRecord: "data/content-intelligence/inference-records/ag07k-preview-only-article-inference-record.json",
  ag07kSchema: "data/content-intelligence/schema/article-inference-preview-record.schema.json",
  ag07kLearning: "data/content-intelligence/learning/ag07k-article-inference-preview-record-learning.json",
  ag07jReview: "data/content-intelligence/quality-reviews/ag07j-article-inference-store-boundary.json",
  ag07iReview: "data/content-intelligence/quality-reviews/ag07i-quality-visitor-value-scoring-boundary.json",
  ag07iScoringModel: "data/content-intelligence/quality-registry/ag07i-quality-visitor-value-scoring-model.json",
  ag07hReview: "data/content-intelligence/quality-reviews/ag07h-visual-data-enrichment-boundary-workbench.json",
  ag07hWorkbench: "data/content-intelligence/visual-registry/ag07h-visual-data-enrichment-workbench.json",
  ag07gReview: "data/content-intelligence/quality-reviews/ag07g-reference-discovery-boundary-workbench.json",
  ag07gWorkbench: "data/content-intelligence/reference-registry/ag07g-reference-discovery-workbench.json",
  ag07cPacket: "data/content-intelligence/content-packets/ag07c-preview-only-dry-run-content-packet.json",
  ag06eLongFormStandard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  ag06kStoreManifest: "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  ag06lApprovalRegister: "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json"
};

const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "ag07l-revised-preview-packet-dry-run-scoring.json");
const packetPath = path.join(root, "data", "content-intelligence", "content-packets", "ag07l-revised-preview-packet-dry-run.json");
const scoringPath = path.join(root, "data", "content-intelligence", "quality-registry", "ag07l-dry-run-scoring-result.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "revised-preview-packet-dry-run-scoring.schema.json");
const learningPath = path.join(root, "data", "content-intelligence", "learning", "ag07l-revised-preview-packet-dry-run-scoring-learning.json");
const registryPath = path.join(root, "data", "quality", "ag07l-revised-preview-packet-dry-run-scoring.json");
const previewPath = path.join(root, "data", "quality", "ag07l-revised-preview-packet-dry-run-scoring-preview.json");
const docPath = path.join(root, "docs", "quality", "AG07L_REVISED_PREVIEW_PACKET_DRY_RUN_SCORING.md");

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

function weightedScore(items) {
  const totalWeight = items.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  if (!totalWeight) return 0;
  const weighted = items.reduce((sum, item) => sum + Number(item.weight || 0) * Number(item.dry_run_score || 0), 0);
  return Number((weighted / totalWeight).toFixed(2));
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG07L input ${name}: ${relativePath}`);
  }
}

const ag07kReview = readJson(inputs.ag07kReview);
const ag07kInferenceRecord = readJson(inputs.ag07kInferenceRecord);
const ag07kSchema = readJson(inputs.ag07kSchema);
const ag07kLearning = readJson(inputs.ag07kLearning);
const ag07jReview = readJson(inputs.ag07jReview);
const ag07iReview = readJson(inputs.ag07iReview);
const ag07iScoringModel = readJson(inputs.ag07iScoringModel);
const ag07hReview = readJson(inputs.ag07hReview);
const ag07hWorkbench = readJson(inputs.ag07hWorkbench);
const ag07gReview = readJson(inputs.ag07gReview);
const ag07gWorkbench = readJson(inputs.ag07gWorkbench);
const ag07cPacket = readJson(inputs.ag07cPacket);
const ag06eLongFormStandard = readJson(inputs.ag06eLongFormStandard);
const ag06kStoreManifest = readJson(inputs.ag06kStoreManifest);
const ag06lApprovalRegister = readJson(inputs.ag06lApprovalRegister);

const contentPacketId = ag07cPacket.content_packet_id || "ag07c-preview-only-dry-run-content-packet";
const revisedPacketId = `ag07l-revised-preview:${contentPacketId}`;

const inference = ag07kInferenceRecord.inference_values || {};
const thresholds = ag07iScoringModel.scoring_thresholds || {};

const revisedSections = [
  {
    section_id: "opening_context",
    section_title: "Opening Context",
    purpose: "Frame the topic, reader problem and why the subject deserves long-form treatment.",
    derived_from_inference: ["article_theme", "reader_intent", "target_audience"],
    section_status: "planned_preview_only",
    prose_generated: false,
    outline_note: inference.article_theme?.content_angle || ""
  },
  {
    section_id: "background_and_core_explanation",
    section_title: "Background and Core Explanation",
    purpose: "Move from basic context to deeper explanation without assuming expert knowledge.",
    derived_from_inference: ["knowledge_depth", "target_audience"],
    section_status: "planned_preview_only",
    prose_generated: false,
    outline_note: inference.knowledge_depth?.background_needed || ""
  },
  {
    section_id: "evidence_and_reference_context",
    section_title: "Evidence and Reference Context",
    purpose: "Identify the evidence burden and source types needed before public release.",
    derived_from_inference: ["evidence_requirement", "reference_need"],
    section_status: "planned_preview_only",
    prose_generated: false,
    outline_note: inference.reference_need?.reference_gap_notes || ""
  },
  {
    section_id: "visual_data_support_plan",
    section_title: "Visual and Data Support Plan",
    purpose: "Define where hero visual, structured visual/data unit and accessibility fields will support the article.",
    derived_from_inference: ["visual_data_need"],
    section_status: "planned_preview_only",
    prose_generated: false,
    outline_note: inference.visual_data_need?.structured_visual_need || ""
  },
  {
    section_id: "reader_value_and_takeaways",
    section_title: "Reader Value and Takeaways",
    purpose: "Convert the article from generic summary into useful reflective insight.",
    derived_from_inference: ["reader_intent", "originality_improvement_inference", "recommended_upgrade_direction"],
    section_status: "planned_preview_only",
    prose_generated: false,
    outline_note: inference.originality_improvement_inference?.synthesis_opportunity || ""
  },
  {
    section_id: "limitations_and_next_revision_needs",
    section_title: "Limitations and Next Revision Needs",
    purpose: "Record what remains missing before production packet creation.",
    derived_from_inference: ["gap_summary", "future_scoring_dependency"],
    section_status: "planned_preview_only",
    prose_generated: false,
    outline_note: inference.gap_summary?.content_gap_summary || ""
  }
];

const referencePlan = {
  preview_only: true,
  minimum_reference_need: inference.reference_need?.minimum_reference_need || 2,
  preferred_source_types: inference.reference_need?.preferred_source_types || [],
  candidate_reference_slots_available_from_ag07g: asArray(ag07gWorkbench.candidate_reference_slots).length,
  reference_urls_populated_in_ag07l: false,
  reference_insertion_performed: false,
  reference_readiness_status: "not_ready_candidate_population_required",
  reference_gap_notes: inference.reference_need?.reference_gap_notes || ""
};

const visualDataPlan = {
  preview_only: true,
  visual_need_slots_available_from_ag07h: asArray(ag07hWorkbench.visual_need_slots).length,
  data_unit_slots_available_from_ag07h: asArray(ag07hWorkbench.data_unit_slots).length,
  hero_visual_need: inference.visual_data_need?.hero_visual_need || "",
  structured_visual_need: inference.visual_data_need?.structured_visual_need || "",
  data_unit_need: inference.visual_data_need?.data_unit_need || "",
  accessibility_need: inference.visual_data_need?.accessibility_need || "",
  visual_generation_performed: false,
  image_insertion_performed: false,
  visual_data_readiness_status: "not_ready_candidate_visual_data_population_required"
};

const staticLiveReadinessPreview = {
  preview_only: true,
  target_article_path: "",
  target_category: "",
  existing_article_backup_required: true,
  html_mutation_sections: [
    "article_body",
    "reference_block",
    "hero_visual_block",
    "image_credit_block",
    "metadata_block"
  ],
  reference_block_insertion_point: "future_static_live_stage",
  hero_image_insertion_point: "future_static_live_stage",
  image_credit_block_required: true,
  alt_text_required: true,
  meta_title_required: true,
  meta_description_required: true,
  rollback_plan_required: true,
  post_mutation_validation_checklist_required: true,
  static_live_mutation_allowed_in_ag07l: false
};

const revisedPreviewPacket = {
  module_id: "AG07L",
  packet_id: revisedPacketId,
  title: "Revised Preview Packet Dry Run",
  status: "revised_preview_packet_created",
  preview_only: true,
  production_packet: false,
  publish_ready: false,
  publication_allowed: false,
  source_stage: "AG07L",
  generated_from: inputs,
  source_packet_snapshot: {
    content_packet_id: contentPacketId,
    status: ag07cPacket.status,
    preview_only: ag07cPacket.preview_only,
    production_packet: ag07cPacket.production_packet,
    publish_ready: ag07cPacket.publish_ready,
    publication_allowed: ag07cPacket.publication_allowed,
    packet_modified_in_ag07l: false
  },
  source_inference_record: {
    record_id: ag07kInferenceRecord.record_id,
    status: ag07kInferenceRecord.status,
    preview_only: ag07kInferenceRecord.preview_only,
    production_record: ag07kInferenceRecord.production_record
  },
  article_inference_summary: {
    theme_label: inference.article_theme?.theme_label || "",
    primary_reader_intent: inference.reader_intent?.primary_reader_intent || "",
    audience_segment: inference.target_audience?.audience_segment || "",
    required_depth_level: inference.knowledge_depth?.required_depth_level || "",
    evidence_burden: inference.evidence_requirement?.evidence_burden || "",
    upgrade_strategy: inference.recommended_upgrade_direction?.upgrade_strategy || ""
  },
  revised_sections: revisedSections,
  reference_plan: referencePlan,
  visual_data_plan: visualDataPlan,
  static_live_readiness_preview: staticLiveReadinessPreview,
  article_prose_generated: false,
  production_content_generated: false,
  public_article_mutation_performed: false,
  reference_insertion_performed: false,
  visual_generation_performed: false,
  jsonl_production_record_created: false,
  database_write_performed: false,
  supabase_write_performed: false
};

const qualityDimensionScores = [
  {
    dimension_id: "AG07I-Q-001",
    dimension_name: "factual_integrity_and_evidence_alignment",
    weight: 25,
    dry_run_score: 58,
    rationale: "Evidence need is clearly inferred, but reference URLs remain unpopulated and link-health review is pending."
  },
  {
    dimension_id: "AG07I-Q-002",
    dimension_name: "long_form_depth_and_structure",
    weight: 20,
    dry_run_score: 76,
    rationale: "Revised preview structure is defined with long-form section logic, but prose is not generated."
  },
  {
    dimension_id: "AG07I-Q-003",
    dimension_name: "originality_context_and_synthesis",
    weight: 20,
    dry_run_score: 72,
    rationale: "Synthesis opportunity and upgrade strategy are present, but final narrative still requires improvement."
  },
  {
    dimension_id: "AG07I-Q-004",
    dimension_name: "reference_and_source_readiness",
    weight: 20,
    dry_run_score: 45,
    rationale: "Reference need is clear, but candidate references remain empty and not reviewed."
  },
  {
    dimension_id: "AG07I-Q-005",
    dimension_name: "visual_data_accessibility_readiness",
    weight: 15,
    dry_run_score: 62,
    rationale: "Visual/data need and accessibility need are identified, but no assets, captions, alt text or credits exist."
  }
];

const visitorValueDimensionScores = [
  {
    dimension_id: "AG07I-V-001",
    dimension_name: "reader_intent_alignment",
    weight: 25,
    dry_run_score: 78,
    rationale: "Reader intent is now explicit and mapped to revised sections."
  },
  {
    dimension_id: "AG07I-V-002",
    dimension_name: "clarity_and_readability",
    weight: 20,
    dry_run_score: 74,
    rationale: "Section structure supports clarity, but article prose is not yet available for readability review."
  },
  {
    dimension_id: "AG07I-V-003",
    dimension_name: "practical_takeaway_value",
    weight: 20,
    dry_run_score: 70,
    rationale: "Takeaway direction is planned, but final actionable content is pending."
  },
  {
    dimension_id: "AG07I-V-004",
    dimension_name: "trust_and_revisit_value",
    weight: 20,
    dry_run_score: 58,
    rationale: "Trust remains limited because references are not populated or verified."
  },
  {
    dimension_id: "AG07I-V-005",
    dimension_name: "engagement_and_presentation_value",
    weight: 15,
    dry_run_score: 66,
    rationale: "Visual/data support is planned but not yet produced or inserted."
  }
];

const dryRunQualityScore = weightedScore(qualityDimensionScores);
const dryRunVisitorValueScore = weightedScore(visitorValueDimensionScores);
const dryRunCombinedScore = Number(((dryRunQualityScore + dryRunVisitorValueScore) / 2).toFixed(2));

const dryRunScoringResult = {
  module_id: "AG07L",
  title: "Dry-Run Quality and Visitor-Value Scoring Result",
  status: "dry_run_scores_calculated",
  preview_only: true,
  production_score_record: false,
  source_packet_id: revisedPacketId,
  source_inference_record_id: ag07kInferenceRecord.record_id,
  scoring_model_source: "AG07I",
  scoring_scope: "dry_run_only",
  quality_dimension_scores: qualityDimensionScores,
  visitor_value_dimension_scores: visitorValueDimensionScores,
  dry_run_scores: {
    quality_score: dryRunQualityScore,
    visitor_value_score: dryRunVisitorValueScore,
    combined_score: dryRunCombinedScore
  },
  threshold_snapshot: {
    quality_score_minimum_for_publish_ready: thresholds.quality_score_minimum_for_publish_ready || 80,
    visitor_value_score_minimum_for_publish_ready: thresholds.visitor_value_score_minimum_for_publish_ready || 75,
    combined_score_minimum_for_publish_ready: thresholds.combined_score_minimum_for_publish_ready || 78
  },
  threshold_result: {
    quality_threshold_met: dryRunQualityScore >= (thresholds.quality_score_minimum_for_publish_ready || 80),
    visitor_value_threshold_met: dryRunVisitorValueScore >= (thresholds.visitor_value_score_minimum_for_publish_ready || 75),
    combined_threshold_met: dryRunCombinedScore >= (thresholds.combined_score_minimum_for_publish_ready || 78),
    publish_ready_recommended: false,
    reason: "Dry-run scores are below threshold and reference/visual readiness remains incomplete."
  },
  improvement_priorities: [
    "Populate and verify at least two credible references.",
    "Strengthen evidence alignment before factual integrity can pass.",
    "Develop actual article prose from the revised preview section plan.",
    "Prepare hero visual, structured visual/data unit, caption, alt text and image credit.",
    "Improve trust and revisit value through verified references and stronger synthesis."
  ],
  score_calculation_type: "dry_run_non_production",
  actual_score_calculation_performed: false,
  publish_ready_approval_performed: false,
  approval_state_changed: false,
  publish_ready_set: false
};

const noProductionControls = {
  revised_preview_packet_created: true,
  dry_run_score_calculation_performed: true,
  dry_run_quality_score_calculated: true,
  dry_run_visitor_value_score_calculated: true,
  dry_run_combined_score_calculated: true,
  actual_score_calculation_performed: false,
  production_score_record_created: false,
  production_packet_created: false,
  publish_ready_approval_performed: false,
  approval_state_changed: false,
  publish_ready_set: false,
  production_jsonl_append_performed: false,
  jsonl_append_performed: false,
  jsonl_production_record_created: false,
  database_write_performed: false,
  supabase_write_performed: false,
  supabase_enabled: false,
  auth_enabled: false,
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
  backend_activation_performed: false,
  api_route_created: false,
  public_publishing_performed: false,
  publication_approval_granted: false,
  static_live_mutation_performed: false
};

Object.assign(revisedPreviewPacket, noProductionControls);
Object.assign(dryRunScoringResult, noProductionControls);

const summary = {
  ag07k_preview_inference_record_consumed: ag07kReview.status === "preview_inference_record_created",
  ag07j_boundary_consumed: ag07jReview.status === "article_inference_store_boundary_defined",
  ag07i_scoring_boundary_consumed: ag07iReview.status === "scoring_boundary_defined",
  ag07h_visual_boundary_consumed: ag07hReview.status === "visual_data_enrichment_boundary_defined",
  ag07g_reference_boundary_consumed: ag07gReview.status === "reference_discovery_boundary_defined",
  ag07c_packet_present: true,
  ag07c_packet_unchanged: true,
  revised_preview_packet_created: true,
  revised_preview_section_count: revisedSections.length,
  dry_run_score_calculation_performed: true,
  dry_run_quality_score_calculated: true,
  dry_run_visitor_value_score_calculated: true,
  dry_run_combined_score_calculated: true,
  dry_run_quality_score: dryRunQualityScore,
  dry_run_visitor_value_score: dryRunVisitorValueScore,
  dry_run_combined_score: dryRunCombinedScore,
  dry_run_thresholds_met: false,
  publish_ready_recommended: false,
  actual_score_calculation_performed: false,
  production_score_record_created: false,
  production_packet_created: false,
  publish_ready_approval_performed: false,
  approval_state_changed: false,
  publish_ready_set: false,
  production_jsonl_append_performed: false,
  database_write_performed: false,
  supabase_write_performed: false,
  public_article_mutation_allowed: false,
  article_prose_generated: false,
  reference_insertion_allowed: false,
  visual_generation_allowed: false,
  static_live_mutation_allowed: false,
  production_readiness_after_ag07l: "not_ready",
  publish_readiness_after_ag07l: "blocked",
  next_stage_id: "AG07M",
  next_stage_title: "Improvement Pass"
};

const schema = {
  schema_id: "drishvara/ag07l/revised-preview-packet-dry-run-scoring.schema.json",
  module_id: "AG07L",
  title: "Revised Preview Packet + Dry-Run Scoring Schema",
  status: "schema_preview_dry_run_only",
  description: "Schema for one revised preview packet and dry-run quality/visitor-value scoring. AG07L does not create production packets, approve publishing, mutate public articles or persist to production stores.",
  required_top_level_fields: [
    "revised_preview_packet",
    "dry_run_scoring_result",
    "summary",
    "mutation_controls"
  ],
  revised_packet_required_fields: [
    "packet_id",
    "preview_only",
    "production_packet",
    "publish_ready",
    "publication_allowed",
    "revised_sections",
    "reference_plan",
    "visual_data_plan",
    "static_live_readiness_preview"
  ],
  scoring_required_fields: [
    "quality_dimension_scores",
    "visitor_value_dimension_scores",
    "dry_run_scores",
    "threshold_snapshot",
    "threshold_result",
    "improvement_priorities"
  ],
  revised_preview_packet_creation_allowed_in_ag07l: true,
  dry_run_score_calculation_allowed_in_ag07l: true,
  actual_score_calculation_allowed_in_ag07l: false,
  production_score_record_creation_allowed_in_ag07l: false,
  production_packet_creation_allowed_in_ag07l: false,
  publish_ready_approval_allowed_in_ag07l: false,
  approval_state_change_allowed_in_ag07l: false,
  production_jsonl_append_allowed_in_ag07l: false,
  database_write_allowed_in_ag07l: false,
  supabase_write_allowed_in_ag07l: false,
  article_prose_generation_allowed_in_ag07l: false,
  article_mutation_allowed_in_ag07l: false,
  reference_insertion_allowed_in_ag07l: false,
  visual_generation_allowed_in_ag07l: false,
  static_live_mutation_allowed_in_ag07l: false,
  publishing_allowed_in_ag07l: false,
  backend_auth_supabase_allowed_in_ag07l: false,
  ...noProductionControls
};

const learning = {
  module_id: "AG07L",
  title: "Revised Preview Packet + Dry-Run Scoring Learning",
  status: "learning_record_only",
  revised_preview_packet_dry_run_scoring_only: true,
  generated_from: inputs,
  summary,
  learning_points_from_ag07k: asArray(ag07kLearning.ag07k_learning_points),
  ag07l_learning_points: [
    "A revised preview packet can be generated from inference without creating production content.",
    "Dry-run scores are useful for improvement planning but are not publish-ready approval.",
    "Reference readiness is currently the largest scoring blocker.",
    "Visual/data readiness must improve before production packet candidacy.",
    "Static-live readiness fields are now previewed for future mutation planning but no static mutation is allowed."
  ],
  carried_forward_doctrine: [
    "Dry-run score is not production approval.",
    "Revised preview packet is not production packet.",
    "No public article mutation may occur in AG07L.",
    "No production JSONL/database/Supabase write may occur in AG07L.",
    "AG07M must improve the packet before production-packet candidacy."
  ],
  compressed_path_after_ag07l: [
    "AG07M — Improvement Pass",
    "AG07N — Production Packet Candidate",
    "AG07O — Approval + Controlled Single-Article Mutation Plan",
    "AG07P — One-Article Controlled Apply",
    "AG07Q — Post-Mutation Audit",
    "AG07Z — Closure / Repeatable Production Readiness"
  ],
  ...noProductionControls
};

const review = {
  module_id: "AG07L",
  title: "Revised Preview Packet + Dry-Run Scoring",
  status: "revised_preview_packet_and_dry_run_scores_created",
  governance_only: true,
  revised_preview_packet_dry_run_scoring_only: true,
  depends_on: ["AG07K", "AG07J", "AG07I", "AG07H", "AG07G", "AG07C", "AG06E", "AG06K", "AG06L"],
  generated_from: inputs,
  summary,
  alignment_with_ag07k: {
    ag07k_status: ag07kReview.status,
    ag07k_decision: ag07kReview.closure_decision?.decision,
    ag07l_requires_explicit_approval: ag07kReview.closure_decision?.proceed_to_ag07l_only_with_explicit_user_approval,
    preview_article_inference_record_created: ag07kReview.closure_decision?.preview_article_inference_record_created,
    production_jsonl_append_performed_in_ag07k: ag07kReview.closure_decision?.production_jsonl_append_performed,
    database_write_performed_in_ag07k: ag07kReview.closure_decision?.database_write_performed,
    supabase_write_performed_in_ag07k: ag07kReview.closure_decision?.supabase_write_performed,
    actual_score_calculation_performed_in_ag07k: ag07kReview.closure_decision?.actual_score_calculation_performed
  },
  revised_packet_file: "data/content-intelligence/content-packets/ag07l-revised-preview-packet-dry-run.json",
  dry_run_scoring_file: "data/content-intelligence/quality-registry/ag07l-dry-run-scoring-result.json",
  schema_file: "data/content-intelligence/schema/revised-preview-packet-dry-run-scoring.schema.json",
  learning_file: "data/content-intelligence/learning/ag07l-revised-preview-packet-dry-run-scoring-learning.json",
  foundation_alignment: {
    ag06e_long_form_standard_consumed: true,
    word_count_standard: {
      min: ag06eLongFormStandard.summary?.word_count_min || 1500,
      max: ag06eLongFormStandard.summary?.word_count_max || 2200
    },
    jsonl_store_count: asArray(ag06kStoreManifest.stores).length,
    approval_register_count: asArray(ag06lApprovalRegister.approval_queue_entries).length
  },
  closure_decision: {
    decision: "ag07l_revised_preview_packet_dry_run_scoring_closed",
    proceed_to_ag07m_only_with_explicit_user_approval: true,
    revised_preview_packet_created: true,
    dry_run_score_calculation_performed: true,
    dry_run_quality_score_calculated: true,
    dry_run_visitor_value_score_calculated: true,
    dry_run_combined_score_calculated: true,
    actual_score_calculation_performed: false,
    production_score_record_created: false,
    production_packet_created: false,
    publish_ready_approval_performed: false,
    approval_state_changed: false,
    publish_ready_set: false,
    production_jsonl_append_performed: false,
    database_write_performed: false,
    supabase_write_performed: false,
    article_prose_generated: false,
    public_article_mutation_performed: false,
    reference_insertion_performed: false,
    visual_generation_performed: false,
    static_live_mutation_performed: false,
    production_readiness: "not_ready",
    publish_readiness: "blocked",
    article_prose_generation_allowed: false,
    public_article_mutation_allowed: false,
    reference_insertion_allowed: false,
    visual_generation_allowed: false,
    scaffold_import_allowed: false,
    jsonl_production_append_allowed: false,
    database_write_allowed: false,
    supabase_write_allowed: false,
    publishing_allowed: false,
    backend_auth_supabase_allowed: false
  },
  ...noProductionControls
};

const registry = {
  module_id: "AG07L",
  title: "Revised Preview Packet + Dry-Run Scoring",
  governance_only: true,
  revised_preview_packet_dry_run_scoring_only: true,
  depends_on: ["AG07K"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag07l-revised-preview-packet-dry-run-scoring.json",
    revised_packet: "data/content-intelligence/content-packets/ag07l-revised-preview-packet-dry-run.json",
    dry_run_scoring_result: "data/content-intelligence/quality-registry/ag07l-dry-run-scoring-result.json",
    schema: "data/content-intelligence/schema/revised-preview-packet-dry-run-scoring.schema.json",
    learning: "data/content-intelligence/learning/ag07l-revised-preview-packet-dry-run-scoring-learning.json",
    preview: "data/quality/ag07l-revised-preview-packet-dry-run-scoring-preview.json",
    document: "docs/quality/AG07L_REVISED_PREVIEW_PACKET_DRY_RUN_SCORING.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG07M",
    title: "Improvement Pass",
    allowed_scope: "use dry-run scoring gaps to improve the preview packet only with explicit approval",
    blocked_scope: "production JSONL append, database/Supabase write, publish-ready approval, approval-state change, public mutation, reference insertion, visual generation, publishing, backend/Auth/Supabase activation"
  },
  ...noProductionControls
};

const preview = {
  module_id: "AG07L",
  preview_only: true,
  revised_preview_packet_dry_run_scoring_only: true,
  summary,
  revised_packet_snapshot: {
    packet_id: revisedPreviewPacket.packet_id,
    status: revisedPreviewPacket.status,
    preview_only: revisedPreviewPacket.preview_only,
    production_packet: revisedPreviewPacket.production_packet,
    publish_ready: revisedPreviewPacket.publish_ready,
    revised_section_count: revisedPreviewPacket.revised_sections.length,
    static_live_mutation_allowed: revisedPreviewPacket.static_live_readiness_preview.static_live_mutation_allowed_in_ag07l
  },
  dry_run_scoring_snapshot: dryRunScoringResult.dry_run_scores,
  threshold_result: dryRunScoringResult.threshold_result,
  improvement_priorities: dryRunScoringResult.improvement_priorities,
  next_stage_id: "AG07M",
  next_stage_title: "Improvement Pass",
  ...noProductionControls
};

const doc = `# AG07L — Revised Preview Packet + Dry-Run Scoring

## Purpose

AG07L creates one revised preview packet using the AG07K preview-only article inference record and calculates dry-run quality and visitor-value scores.

This stage is still non-production. It does not create a production packet, approve publish-readiness, change approval state, append production JSONL, write to database or Supabase, generate article prose, mutate public articles, insert references, generate visuals, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07L consumes:

- AG07K Article Inference Preview Record Dry Run.
- AG07J Article Inference Store Boundary.
- AG07I Quality and Visitor-Value Scoring Boundary.
- AG07H Visual and Data Enrichment Boundary / Workbench.
- AG07G Reference Discovery Boundary / Workbench.
- AG07C preview-only packet skeleton.
- AG06E long-form article standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Revised Preview Packet Scope

AG07L defines a revised preview packet with:

- article inference summary;
- planned revised sections;
- reference plan;
- visual/data plan;
- static-live readiness preview fields.

The packet is not a production packet.

## Dry-Run Scoring Scope

AG07L calculates dry-run-only scores for:

- quality score;
- visitor-value score;
- combined score.

The scores are not production approval and do not change publish readiness.

## Production Readiness Decision

AG07L does not make the packet production-ready.

Production readiness remains not_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07L does not:

- create a production packet;
- create production score records;
- approve publish-readiness;
- change approval state;
- set publish_ready=true;
- append production JSONL records;
- write to database or Supabase;
- generate article prose;
- generate production content;
- mutate public article HTML;
- insert references into article HTML;
- generate visual assets or infographics;
- insert images;
- copy, move, delete or import scaffold outputs;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Static-Live Compatibility Note

AG07L introduces static-live readiness preview fields only. These fields are for future controlled static-live stages and do not permit HTML mutation in AG07L.

## Acceptance Criteria

AG07L is acceptable only if:

- AG07K preview inference record is consumed;
- one revised preview packet is created;
- dry-run quality score is calculated;
- dry-run visitor-value score is calculated;
- dry-run combined score is calculated;
- production packet creation remains false;
- publish-ready approval remains false;
- approval-state change remains false;
- production JSONL append remains false;
- database/Supabase write remains false;
- public article mutation remains false;
- reference insertion remains false;
- visual generation remains false;
- production readiness remains not_ready;
- publish readiness remains blocked;
- AG07M Improvement Pass is identified as next only with explicit approval;
- package scripts for generate:ag07l and validate:ag07l are present;
- validate:project includes validate:ag07l.

## Next Stage

The next possible stage is AG07M — Improvement Pass.

AG07M must not start automatically. It requires explicit approval.
`;

writeJson(reviewPath, review);
writeJson(packetPath, revisedPreviewPacket);
writeJson(scoringPath, dryRunScoringResult);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG07L revised preview packet and dry-run scoring artifacts generated.");
