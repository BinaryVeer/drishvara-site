import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag07jReview: "data/content-intelligence/quality-reviews/ag07j-article-inference-store-boundary.json",
  ag07jStoreBoundary: "data/content-intelligence/inference-registry/ag07j-article-inference-store-boundary.json",
  ag07jSchema: "data/content-intelligence/schema/article-inference-store-boundary.schema.json",
  ag07jLearning: "data/content-intelligence/learning/ag07j-article-inference-store-boundary-learning.json",
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

const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "ag07k-article-inference-preview-record-dry-run.json");
const recordPath = path.join(root, "data", "content-intelligence", "inference-records", "ag07k-preview-only-article-inference-record.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "article-inference-preview-record.schema.json");
const learningPath = path.join(root, "data", "content-intelligence", "learning", "ag07k-article-inference-preview-record-learning.json");
const registryPath = path.join(root, "data", "quality", "ag07k-article-inference-preview-record-dry-run.json");
const previewPath = path.join(root, "data", "quality", "ag07k-article-inference-preview-record-dry-run-preview.json");
const docPath = path.join(root, "docs", "quality", "AG07K_ARTICLE_INFERENCE_PREVIEW_RECORD_DRY_RUN.md");

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

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG07K input ${name}: ${relativePath}`);
  }
}

const ag07jReview = readJson(inputs.ag07jReview);
const ag07jStoreBoundary = readJson(inputs.ag07jStoreBoundary);
const ag07jSchema = readJson(inputs.ag07jSchema);
const ag07jLearning = readJson(inputs.ag07jLearning);
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
const inferenceRecordId = `article-inference-preview:${contentPacketId}:ag07k`;

const inferenceValues = {
  article_theme: {
    theme_label: "Long-form upgrade readiness for an existing Drishvara public article",
    topic_category: "content_intelligence_preview",
    core_question: "What must be known before this article can be revised, scored and prepared for controlled production?",
    content_angle: "Structured upgrade inference for quality, credibility, visitor value, reference readiness and visual/data planning."
  },
  reader_intent: {
    primary_reader_intent: "Understand the subject clearly with trustworthy context and useful takeaways.",
    secondary_reader_intent: "Find credible references, structured explanation and visual/data support without generic filler.",
    intent_depth: "medium_to_deep_long_form",
    reader_problem: "The existing article needs stronger evidence, clearer reader value and production-ready structure."
  },
  target_audience: {
    audience_segment: "General informed readers seeking reflective, credible and accessible long-form insight.",
    assumed_prior_knowledge: "basic_context_only",
    reading_context: "public_featured_read_or_topic_explainer",
    language_sensitivity: "clear_non_jargon_explanation_with_respectful_tone"
  },
  knowledge_depth: {
    required_depth_level: "long_form_explanatory_depth",
    conceptual_layers_needed: [
      "context",
      "core_explanation",
      "evidence_support",
      "reader_takeaways",
      "limitations_or_uncertainty"
    ],
    background_needed: "brief_background_before_deeper_analysis",
    expertise_level: "accessible_expert_synthesis"
  },
  evidence_requirement: {
    claim_density: "moderate_to_high",
    evidence_burden: "verified_references_required_before_publish",
    source_sensitivity: "credible_or_authoritative_sources_preferred",
    verification_risk: "medium_until_references_are_populated_and_reviewed"
  },
  reference_need: {
    minimum_reference_need: 2,
    preferred_source_types: [
      "primary_or_authoritative_source",
      "credible_context_source",
      "data_or_evidence_source_where_relevant"
    ],
    primary_source_need: "required_where_available",
    reference_gap_notes: "AG07G slots remain empty; future candidate population and link-health review are required."
  },
  visual_data_need: {
    hero_visual_need: "primary_hero_visual_required_before_public_article_apply",
    structured_visual_need: "structured_visual_or_infographic_recommended_where_reader_clarity_improves",
    data_unit_need: "key_fact_box_or_timeline_needed_if evidence/context supports it",
    accessibility_need: "caption_alt_text_image_credit_and_mobile_safe_layout_required"
  },
  seo_search_intent_signals: {
    search_intent_type: "informational_explainer",
    primary_query_family: "topic_background_and_explanation",
    secondary_query_family: "evidence_based_context_and_takeaways",
    metadata_direction: "clear_title_meta_description_and_topic_category_after_revised_packet"
  },
  originality_improvement_inference: {
    originality_gap: "Needs synthesis, stronger framing and non-generic interpretation before production.",
    synthesis_opportunity: "Connect evidence, reader intent, visual support and practical takeaway into a coherent long-form article.",
    generic_content_risk: "medium_until_revised_packet_and_scoring_pass",
    improvement_priority: "Improve structure, evidence plan, reader-value framing and visual/data readiness."
  },
  gap_summary: {
    content_gap_summary: "Current preview packet remains skeletal and requires revised sections before scoring.",
    evidence_gap_summary: "Reference URLs are not populated; source credibility and link-health checks remain future gates.",
    visual_gap_summary: "Visual/data slots exist but asset path, URL, caption, alt text and credit remain future fields.",
    reader_value_gap_summary: "Visitor value cannot be scored until revised content and inference are aligned."
  },
  recommended_upgrade_direction: {
    upgrade_strategy: "Create revised preview packet using inference, reference boundary, visual/data boundary and scoring model.",
    section_improvement_direction: "Move from placeholder sections to structured long-form explanation with evidence and reader takeaways.",
    reference_strategy: "Populate at least two credible references in a future controlled reference-population stage.",
    visual_data_strategy: "Plan hero visual, structured visual/data unit, caption, alt text, credit and mobile-safe layout before public apply."
  },
  future_scoring_dependency: {
    required_for_quality_score: [
      "revised_preview_packet",
      "reference_plan_or_candidates",
      "visual_data_plan",
      "article_inference_record"
    ],
    required_for_visitor_value_score: [
      "reader_intent",
      "target_audience",
      "knowledge_depth",
      "gap_summary",
      "recommended_upgrade_direction"
    ],
    required_for_combined_score: [
      "quality_score_inputs",
      "visitor_value_score_inputs",
      "reviewer_decision_context"
    ],
    score_execution_allowed_after: "AG07L revised preview packet plus dry-run scoring stage, with explicit approval."
  }
};

const inferenceFieldGroups = asArray(ag07jStoreBoundary.inference_field_groups).map((group) => ({
  group_id: group.group_id,
  group_name: group.group_name,
  required_before_actual_scoring: group.required_before_actual_scoring,
  populated_in_ag07k_preview: true,
  production_persisted: false,
  value_population_scope: "preview_only",
  fields: group.fields,
  values: inferenceValues[group.group_name] || group.template_values || {}
}));

const noProductionControls = {
  article_inference_preview_record_dry_run_only: true,
  preview_article_inference_record_created: true,
  preview_inference_values_populated: true,
  actual_article_inference_record_created: false,
  production_article_inference_record_created: false,
  article_inference_persisted: false,
  production_jsonl_append_performed: false,
  jsonl_append_performed: false,
  jsonl_production_record_created: false,
  database_write_performed: false,
  supabase_write_performed: false,
  supabase_enabled: false,
  auth_enabled: false,
  actual_score_calculation_performed: false,
  quality_score_calculated: false,
  visitor_value_score_calculated: false,
  combined_score_calculated: false,
  scoring_execution_performed: false,
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
  backend_activation_performed: false,
  api_route_created: false,
  public_publishing_performed: false,
  publication_approval_granted: false
};

const previewInferenceRecord = {
  module_id: "AG07K",
  record_id: inferenceRecordId,
  title: "Preview-Only Article Inference Record",
  status: "preview_inference_record_created",
  preview_only: true,
  production_record: false,
  source_stage: "AG07K",
  generated_from: inputs,
  source_packet_snapshot: {
    content_packet_id: contentPacketId,
    status: ag07cPacket.status,
    preview_only: ag07cPacket.preview_only,
    production_packet: ag07cPacket.production_packet,
    publish_ready: ag07cPacket.publish_ready,
    publication_allowed: ag07cPacket.publication_allowed,
    packet_modified_in_ag07k: false
  },
  upstream_contract_snapshot: {
    ag07j_store_boundary_status: ag07jStoreBoundary.status,
    ag07j_record_contract_family: ag07jStoreBoundary.record_contract?.record_family,
    ag07j_template_only: ag07jStoreBoundary.record_contract?.template_only_in_ag07j,
    ag07i_actual_score_calculation_performed: ag07iReview.summary?.actual_score_calculation_performed,
    ag07h_visual_generation_performed: ag07hReview.summary?.visual_generation_performed,
    ag07g_reference_url_population_performed: ag07gReview.summary?.reference_url_population_performed
  },
  inference_field_groups: inferenceFieldGroups,
  inference_values: inferenceValues,
  scoring_dependency_status: {
    score_calculation_allowed_in_ag07k: false,
    quality_score: null,
    visitor_value_score: null,
    combined_score: null,
    next_scoring_stage: "AG07L",
    scoring_note: "Inference exists as preview-only input. Actual score calculation remains blocked until AG07L is explicitly approved."
  },
  persistence_status: {
    production_jsonl_appended: false,
    database_written: false,
    supabase_written: false,
    public_article_mutated: false,
    production_persistence_allowed_in_ag07k: false
  },
  ...noProductionControls
};

const summary = {
  ag07j_boundary_consumed: ag07jReview.status === "article_inference_store_boundary_defined",
  ag07i_boundary_consumed: ag07iReview.status === "scoring_boundary_defined",
  ag07h_boundary_consumed: ag07hReview.status === "visual_data_enrichment_boundary_defined",
  ag07g_boundary_consumed: ag07gReview.status === "reference_discovery_boundary_defined",
  ag07c_packet_present: true,
  ag07c_packet_unchanged: true,
  inference_field_group_count: inferenceFieldGroups.length,
  preview_article_inference_record_created: true,
  preview_inference_values_populated: true,
  actual_article_inference_record_created: false,
  production_article_inference_record_created: false,
  article_inference_persisted: false,
  production_jsonl_append_performed: false,
  database_write_performed: false,
  supabase_write_performed: false,
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
  production_readiness_after_ag07k: "not_ready",
  publish_readiness_after_ag07k: "blocked",
  public_article_mutation_allowed: false,
  article_prose_generated: false,
  reference_insertion_allowed: false,
  visual_generation_allowed: false,
  jsonl_production_append_allowed: false,
  publishing_allowed: false,
  backend_auth_supabase_allowed: false,
  next_stage_id: "AG07L",
  next_stage_title: "Revised Preview Packet + Dry-Run Scoring"
};

const schema = {
  schema_id: "drishvara/ag07k/article-inference-preview-record.schema.json",
  module_id: "AG07K",
  title: "Article Inference Preview Record Schema",
  status: "schema_preview_dry_run_only",
  description: "Schema for one preview-only article inference record. AG07K may populate preview inference values but must not persist production records or calculate scores.",
  required_top_level_fields: [
    "record_id",
    "preview_only",
    "production_record",
    "source_packet_snapshot",
    "inference_field_groups",
    "inference_values",
    "scoring_dependency_status",
    "persistence_status",
    "mutation_controls"
  ],
  required_inference_groups: asArray(ag07jStoreBoundary.record_contract?.required_field_groups),
  preview_record_creation_allowed_in_ag07k: true,
  preview_inference_value_population_allowed_in_ag07k: true,
  production_record_creation_allowed_in_ag07k: false,
  production_jsonl_append_allowed_in_ag07k: false,
  database_write_allowed_in_ag07k: false,
  supabase_write_allowed_in_ag07k: false,
  actual_score_calculation_allowed_in_ag07k: false,
  publish_ready_approval_allowed_in_ag07k: false,
  approval_state_change_allowed_in_ag07k: false,
  article_mutation_allowed_in_ag07k: false,
  reference_insertion_allowed_in_ag07k: false,
  visual_generation_allowed_in_ag07k: false,
  publishing_allowed_in_ag07k: false,
  backend_auth_supabase_allowed_in_ag07k: false,
  ...noProductionControls
};

const learning = {
  module_id: "AG07K",
  title: "Article Inference Preview Record Dry Run Learning",
  status: "learning_record_only",
  article_inference_preview_record_dry_run_only: true,
  generated_from: inputs,
  summary,
  learning_points_from_ag07j: asArray(ag07jLearning.ag07j_learning_points),
  ag07k_learning_points: [
    "A preview-only inference record can be created without production persistence.",
    "Structured inference helps connect reader intent, reference need, visual/data need and future scoring.",
    "AG07K creates useful dry-run input but does not make the packet production-ready.",
    "Actual score calculation should be merged into AG07L with revised preview packet generation under the compressed path.",
    "Static-live readiness fields should be introduced in the later production packet and mutation-plan stages, not inside AG07K."
  ],
  carried_forward_doctrine: [
    "Preview inference is not production inference.",
    "Inference values are not article prose.",
    "No score calculation may occur in AG07K.",
    "No JSONL/database/Supabase write may occur in AG07K.",
    "No public article mutation may occur in AG07K."
  ],
  compressed_path_after_ag07k: [
    "AG07L — Revised Preview Packet + Dry-Run Scoring",
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
  module_id: "AG07K",
  title: "Article Inference Preview Record Dry Run",
  status: "preview_inference_record_created",
  governance_only: true,
  article_inference_preview_record_dry_run_only: true,
  depends_on: ["AG07J", "AG07I", "AG07H", "AG07G", "AG07C", "AG06E", "AG06K", "AG06L"],
  generated_from: inputs,
  summary,
  alignment_with_ag07j: {
    ag07j_status: ag07jReview.status,
    ag07j_decision: ag07jReview.closure_decision?.decision,
    ag07k_requires_explicit_approval: ag07jReview.closure_decision?.proceed_to_ag07k_only_with_explicit_user_approval,
    actual_article_inference_record_created_in_ag07j: ag07jReview.closure_decision?.actual_article_inference_record_created,
    production_jsonl_append_performed_in_ag07j: ag07jReview.closure_decision?.production_jsonl_append_performed,
    database_write_performed_in_ag07j: ag07jReview.closure_decision?.database_write_performed,
    supabase_write_performed_in_ag07j: ag07jReview.closure_decision?.supabase_write_performed,
    actual_score_calculation_performed_in_ag07j: ag07jReview.closure_decision?.actual_score_calculation_performed
  },
  alignment_with_ag07i_scoring_boundary: {
    ag07i_actual_scores: ag07iScoringModel.actual_scores,
    ag07i_actual_score_calculation_allowed: ag07iScoringModel.actual_scores?.score_calculation_allowed_in_ag07i,
    ag07i_article_inference_required_before_score_calculation: ag07iScoringModel.scoring_thresholds?.article_inference_required_before_score_calculation
  },
  preview_record_file: "data/content-intelligence/inference-records/ag07k-preview-only-article-inference-record.json",
  schema_file: "data/content-intelligence/schema/article-inference-preview-record.schema.json",
  learning_file: "data/content-intelligence/learning/ag07k-article-inference-preview-record-learning.json",
  foundation_alignment: {
    ag06e_long_form_standard_consumed: true,
    jsonl_store_count: asArray(ag06kStoreManifest.stores).length,
    approval_register_count: asArray(ag06lApprovalRegister.approval_queue_entries).length
  },
  closure_decision: {
    decision: "ag07k_article_inference_preview_record_dry_run_closed",
    proceed_to_ag07l_only_with_explicit_user_approval: true,
    preview_article_inference_record_created: true,
    preview_inference_values_populated: true,
    actual_article_inference_record_created: false,
    production_article_inference_record_created: false,
    article_inference_persisted: false,
    actual_score_calculation_performed: false,
    quality_score_calculated: false,
    visitor_value_score_calculated: false,
    combined_score_calculated: false,
    production_jsonl_append_performed: false,
    database_write_performed: false,
    supabase_write_performed: false,
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
    supabase_write_allowed: false,
    publishing_allowed: false,
    backend_auth_supabase_allowed: false
  },
  ...noProductionControls
};

const registry = {
  module_id: "AG07K",
  title: "Article Inference Preview Record Dry Run",
  governance_only: true,
  article_inference_preview_record_dry_run_only: true,
  depends_on: ["AG07J"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag07k-article-inference-preview-record-dry-run.json",
    preview_record: "data/content-intelligence/inference-records/ag07k-preview-only-article-inference-record.json",
    schema: "data/content-intelligence/schema/article-inference-preview-record.schema.json",
    learning: "data/content-intelligence/learning/ag07k-article-inference-preview-record-learning.json",
    preview: "data/quality/ag07k-article-inference-preview-record-dry-run-preview.json",
    document: "docs/quality/AG07K_ARTICLE_INFERENCE_PREVIEW_RECORD_DRY_RUN.md"
  },
  summary,
  compressed_path_after_ag07k: learning.compressed_path_after_ag07k,
  next_recommended_stage: {
    module_id: "AG07L",
    title: "Revised Preview Packet + Dry-Run Scoring",
    allowed_scope: "create one revised preview packet and calculate dry-run quality/visitor-value scores only with explicit approval",
    blocked_scope: "production JSONL append, database/Supabase write, publish-ready approval, public mutation, reference insertion, visual generation, publishing, backend/Auth/Supabase activation"
  },
  ...noProductionControls
};

const preview = {
  module_id: "AG07K",
  preview_only: true,
  article_inference_preview_record_dry_run_only: true,
  summary,
  preview_record_snapshot: {
    record_id: previewInferenceRecord.record_id,
    status: previewInferenceRecord.status,
    preview_only: previewInferenceRecord.preview_only,
    production_record: previewInferenceRecord.production_record,
    inference_group_count: previewInferenceRecord.inference_field_groups.length,
    scoring_allowed: previewInferenceRecord.scoring_dependency_status.score_calculation_allowed_in_ag07k,
    persisted: previewInferenceRecord.persistence_status.production_jsonl_appended || previewInferenceRecord.persistence_status.database_written || previewInferenceRecord.persistence_status.supabase_written
  },
  inference_field_groups: inferenceFieldGroups.map((group) => ({
    group_id: group.group_id,
    group_name: group.group_name,
    populated_in_ag07k_preview: group.populated_in_ag07k_preview,
    production_persisted: group.production_persisted,
    field_count: group.fields.length
  })),
  next_stage_id: "AG07L",
  next_stage_title: "Revised Preview Packet + Dry-Run Scoring",
  ...noProductionControls
};

const doc = `# AG07K — Article Inference Preview Record Dry Run

## Purpose

AG07K creates one preview-only article inference record from the AG07J article inference store boundary.

This stage may populate structured preview inference values for the dry-run record. It does not create a production inference record, append production JSONL, write to database or Supabase, calculate actual scores, approve publish-readiness, change approval state, generate article prose, mutate public articles, insert references, generate visuals, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07K consumes:

- AG07J Article Inference Store Boundary.
- AG07I Quality and Visitor-Value Scoring Boundary.
- AG07H Visual and Data Enrichment Boundary / Workbench.
- AG07G Reference Discovery Boundary / Workbench.
- AG07C preview-only packet skeleton.
- AG06E long-form article standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Preview Record Scope

AG07K creates one preview-only inference record covering:

- article theme;
- reader intent;
- target audience;
- knowledge depth;
- evidence requirement;
- reference need;
- visual/data need;
- SEO/search intent signals;
- originality/improvement inference;
- gap summary;
- recommended upgrade direction;
- future scoring dependency.

The record is a dry-run artifact only.

## Production and Scoring Status

AG07K does not calculate quality score, visitor-value score or combined score.

AG07K does not make the packet production-ready.

Production readiness remains not_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07K does not:

- create a production inference record;
- append production JSONL records;
- write to database or Supabase;
- calculate actual scores;
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
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Compressed Path After AG07K

After AG07K, the remaining path is compressed as follows:

1. AG07L — Revised Preview Packet + Dry-Run Scoring.
2. AG07M — Improvement Pass.
3. AG07N — Production Packet Candidate.
4. AG07O — Approval + Controlled Single-Article Mutation Plan.
5. AG07P — One-Article Controlled Apply.
6. AG07Q — Post-Mutation Audit.
7. AG07Z — Closure / Repeatable Production Readiness.

## Acceptance Criteria

AG07K is acceptable only if:

- AG07J boundary is consumed;
- exactly one preview-only inference record is created;
- inference field groups are populated as preview values only;
- production inference record creation remains false;
- production JSONL append remains false;
- database/Supabase write remains false;
- actual score calculation remains false;
- publish-ready approval remains false;
- approval-state change remains false;
- production readiness remains not_ready;
- publish readiness remains blocked;
- AG07L Revised Preview Packet + Dry-Run Scoring is identified as next only with explicit approval;
- package scripts for generate:ag07k and validate:ag07k are present;
- validate:project includes validate:ag07k;
- no production JSONL append, database/Supabase write, score calculation, publish-ready approval, approval-state change, article prose generation, public mutation, reference insertion, visual generation, publishing or backend/Auth/Supabase activation is performed.

## Next Stage

The next possible stage is AG07L — Revised Preview Packet + Dry-Run Scoring.

AG07L must not start automatically. It requires explicit approval.
`;

writeJson(reviewPath, review);
writeJson(recordPath, previewInferenceRecord);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG07K article inference preview record dry-run artifacts generated.");
