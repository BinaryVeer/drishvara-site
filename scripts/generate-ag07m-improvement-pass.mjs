import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag07lReview: "data/content-intelligence/quality-reviews/ag07l-revised-preview-packet-dry-run-scoring.json",
  ag07lPacket: "data/content-intelligence/content-packets/ag07l-revised-preview-packet-dry-run.json",
  ag07lScoring: "data/content-intelligence/quality-registry/ag07l-dry-run-scoring-result.json",
  ag07lSchema: "data/content-intelligence/schema/revised-preview-packet-dry-run-scoring.schema.json",
  ag07lLearning: "data/content-intelligence/learning/ag07l-revised-preview-packet-dry-run-scoring-learning.json",
  ag07kInferenceRecord: "data/content-intelligence/inference-records/ag07k-preview-only-article-inference-record.json",
  ag07iScoringModel: "data/content-intelligence/quality-registry/ag07i-quality-visitor-value-scoring-model.json",
  ag07gWorkbench: "data/content-intelligence/reference-registry/ag07g-reference-discovery-workbench.json",
  ag07hWorkbench: "data/content-intelligence/visual-registry/ag07h-visual-data-enrichment-workbench.json",
  ag06eLongFormStandard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  ag06kStoreManifest: "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  ag06lApprovalRegister: "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json"
};

const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "ag07m-improvement-pass.json");
const improvedPacketPath = path.join(root, "data", "content-intelligence", "content-packets", "ag07m-improved-preview-packet.json");
const improvementRecordPath = path.join(root, "data", "content-intelligence", "quality-registry", "ag07m-improvement-pass-record.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "improvement-pass.schema.json");
const learningPath = path.join(root, "data", "content-intelligence", "learning", "ag07m-improvement-pass-learning.json");
const registryPath = path.join(root, "data", "quality", "ag07m-improvement-pass.json");
const previewPath = path.join(root, "data", "quality", "ag07m-improvement-pass-preview.json");
const docPath = path.join(root, "docs", "quality", "AG07M_IMPROVEMENT_PASS.md");

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
    throw new Error(`Missing required AG07M input ${name}: ${relativePath}`);
  }
}

const ag07lReview = readJson(inputs.ag07lReview);
const ag07lPacket = readJson(inputs.ag07lPacket);
const ag07lScoring = readJson(inputs.ag07lScoring);
const ag07lSchema = readJson(inputs.ag07lSchema);
const ag07lLearning = readJson(inputs.ag07lLearning);
const ag07kInferenceRecord = readJson(inputs.ag07kInferenceRecord);
const ag07iScoringModel = readJson(inputs.ag07iScoringModel);
const ag07gWorkbench = readJson(inputs.ag07gWorkbench);
const ag07hWorkbench = readJson(inputs.ag07hWorkbench);
const ag06eLongFormStandard = readJson(inputs.ag06eLongFormStandard);
const ag06kStoreManifest = readJson(inputs.ag06kStoreManifest);
const ag06lApprovalRegister = readJson(inputs.ag06lApprovalRegister);

const basePacketId = ag07lPacket.packet_id || "ag07l-revised-preview-packet-dry-run";
const improvedPacketId = `ag07m-improved-preview:${basePacketId}`;
const inference = ag07kInferenceRecord.inference_values || {};
const dryRunScores = ag07lScoring.dry_run_scores || {};
const thresholdResult = ag07lScoring.threshold_result || {};
const improvementPriorities = asArray(ag07lScoring.improvement_priorities);

const improvementActions = [
  {
    action_id: "AG07M-ACTION-001",
    action_name: "reference_readiness_improvement",
    priority: "critical",
    source_gap: "Reference readiness score is low because candidate URLs are not populated or verified.",
    targeted_dimensions: ["AG07I-Q-001", "AG07I-Q-004", "AG07I-V-004"],
    improvement_instruction: "Prepare future candidate-reference population with at least two credible sources, link-health check, source type and credibility status.",
    execution_status: "planned_preview_improvement",
    production_execution_performed: false
  },
  {
    action_id: "AG07M-ACTION-002",
    action_name: "evidence_alignment_improvement",
    priority: "critical",
    source_gap: "Evidence burden is clear but factual support remains incomplete.",
    targeted_dimensions: ["AG07I-Q-001", "AG07I-Q-003"],
    improvement_instruction: "Map claims to evidence slots before production packet candidacy.",
    execution_status: "planned_preview_improvement",
    production_execution_performed: false
  },
  {
    action_id: "AG07M-ACTION-003",
    action_name: "section_depth_improvement",
    priority: "high",
    source_gap: "Long-form section structure exists but actual prose is not generated.",
    targeted_dimensions: ["AG07I-Q-002", "AG07I-V-002", "AG07I-V-003"],
    improvement_instruction: "Strengthen section-level outline with context, explanation, evidence, takeaway and limitation prompts.",
    execution_status: "planned_preview_improvement",
    production_execution_performed: false
  },
  {
    action_id: "AG07M-ACTION-004",
    action_name: "visual_data_accessibility_improvement",
    priority: "high",
    source_gap: "Visual/data plan exists but no asset, caption, alt text, image credit or data-unit candidate exists.",
    targeted_dimensions: ["AG07I-Q-005", "AG07I-V-005"],
    improvement_instruction: "Define candidate visual/data requirements for hero visual, structured visual/data unit, caption, alt text, image credit and mobile-safe rendering.",
    execution_status: "planned_preview_improvement",
    production_execution_performed: false
  },
  {
    action_id: "AG07M-ACTION-005",
    action_name: "visitor_value_improvement",
    priority: "high",
    source_gap: "Reader value direction exists but actionable payoff is not yet strong enough.",
    targeted_dimensions: ["AG07I-V-001", "AG07I-V-003", "AG07I-V-004"],
    improvement_instruction: "Add reader takeaway prompts and trust/revisit-value checkpoints before production packet generation.",
    execution_status: "planned_preview_improvement",
    production_execution_performed: false
  },
  {
    action_id: "AG07M-ACTION-006",
    action_name: "static_live_readiness_forward_compatibility",
    priority: "medium",
    source_gap: "Static-live fields exist only as preview placeholders.",
    targeted_dimensions: ["AG07I-Q-002", "AG07I-V-005"],
    improvement_instruction: "Carry target article path, backup need, mutation sections, rollback and post-mutation checklist into AG07N/AG07O without mutating static files now.",
    execution_status: "planned_preview_improvement",
    production_execution_performed: false
  }
];

const improvedSections = asArray(ag07lPacket.revised_sections).map((section) => ({
  ...section,
  section_status: "improved_preview_only",
  prose_generated: false,
  improvement_applied_in_ag07m: true,
  improvement_focus: [
    "clarity",
    "evidence_alignment",
    "reader_value",
    "production_packet_readiness_later"
  ],
  production_execution_performed: false
}));

const improvedReferencePlan = {
  ...ag07lPacket.reference_plan,
  improvement_status: "improved_preview_plan",
  required_future_reference_actions: [
    "populate_candidate_reference_urls_later",
    "verify_source_credibility_later",
    "perform_link_health_check_later",
    "approve_reference_slots_later"
  ],
  reference_urls_populated_in_ag07m: false,
  reference_insertion_performed: false,
  production_execution_performed: false
};

const improvedVisualDataPlan = {
  ...ag07lPacket.visual_data_plan,
  improvement_status: "improved_preview_plan",
  required_future_visual_actions: [
    "select_or_generate_candidate_hero_visual_later",
    "prepare_structured_visual_or_data_unit_later",
    "populate_caption_alt_text_image_credit_later",
    "perform_mobile_safe_layout_review_later"
  ],
  visual_generation_performed: false,
  image_insertion_performed: false,
  data_unit_generation_performed: false,
  production_execution_performed: false
};

const improvedStaticLiveReadinessPreview = {
  ...ag07lPacket.static_live_readiness_preview,
  improvement_status: "forward_compatible_preview",
  target_article_path_required_before_ag07o: true,
  rollback_plan_required_before_ag07p: true,
  post_mutation_validation_required_before_ag07q: true,
  static_live_mutation_allowed_in_ag07m: false,
  production_execution_performed: false
};

const noProductionControls = {
  improvement_pass_only: true,
  improved_preview_packet_created: true,
  improvement_actions_created: true,
  dry_run_scores_consumed: true,
  dry_run_score_recalculation_performed: false,
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
  static_live_mutation_performed: false,
  scaffold_import_performed: false,
  scaffold_file_copy_performed: false,
  scaffold_file_move_performed: false,
  scaffold_file_delete_performed: false,
  backend_activation_performed: false,
  api_route_created: false,
  public_publishing_performed: false,
  publication_approval_granted: false
};

const improvedPreviewPacket = {
  module_id: "AG07M",
  packet_id: improvedPacketId,
  title: "Improved Preview Packet",
  status: "improved_preview_packet_created",
  preview_only: true,
  production_packet: false,
  publish_ready: false,
  publication_allowed: false,
  source_stage: "AG07M",
  generated_from: inputs,
  source_packet_snapshot: {
    packet_id: ag07lPacket.packet_id,
    status: ag07lPacket.status,
    preview_only: ag07lPacket.preview_only,
    production_packet: ag07lPacket.production_packet,
    publish_ready: ag07lPacket.publish_ready,
    publication_allowed: ag07lPacket.publication_allowed,
    packet_modified_in_ag07m: false
  },
  source_dry_run_scoring_snapshot: {
    quality_score: dryRunScores.quality_score,
    visitor_value_score: dryRunScores.visitor_value_score,
    combined_score: dryRunScores.combined_score,
    publish_ready_recommended: thresholdResult.publish_ready_recommended,
    threshold_reason: thresholdResult.reason
  },
  article_inference_summary: ag07lPacket.article_inference_summary,
  improved_sections: improvedSections,
  improved_reference_plan: improvedReferencePlan,
  improved_visual_data_plan: improvedVisualDataPlan,
  improved_static_live_readiness_preview: improvedStaticLiveReadinessPreview,
  production_candidate_readiness_preview: {
    ready_for_ag07n_production_packet_candidate: true,
    reason: "Improvement pass has mapped score gaps into forward-compatible production-packet requirements, but production creation remains blocked until AG07N approval.",
    remaining_blockers: [
      "reference_url_population",
      "reference_credibility_review",
      "visual_or_data_candidate_population",
      "caption_alt_text_image_credit_population",
      "target_static_article_path_selection",
      "human_approval_gate"
    ]
  },
  ...noProductionControls
};

const improvementRecord = {
  module_id: "AG07M",
  title: "Improvement Pass Record",
  status: "improvement_actions_created",
  preview_only: true,
  production_record: false,
  source_packet_id: ag07lPacket.packet_id,
  improved_packet_id: improvedPacketId,
  source_scoring_record: "data/content-intelligence/quality-registry/ag07l-dry-run-scoring-result.json",
  baseline_dry_run_scores: {
    quality_score: dryRunScores.quality_score,
    visitor_value_score: dryRunScores.visitor_value_score,
    combined_score: dryRunScores.combined_score
  },
  threshold_result_before_improvement: thresholdResult,
  source_improvement_priorities: improvementPriorities,
  improvement_actions: improvementActions,
  improvement_pass_result: {
    improved_preview_packet_created: true,
    production_packet_created: false,
    score_recalculated: false,
    publish_ready_recommended: false,
    next_review_stage: "AG07N"
  },
  ...noProductionControls
};

const summary = {
  ag07l_revised_preview_packet_consumed: ag07lReview.status === "revised_preview_packet_and_dry_run_scores_created",
  ag07k_preview_inference_record_consumed: true,
  ag07i_scoring_boundary_consumed: true,
  ag07g_reference_boundary_consumed: true,
  ag07h_visual_boundary_consumed: true,
  improved_preview_packet_created: true,
  improvement_actions_created: true,
  improvement_action_count: improvementActions.length,
  improved_section_count: improvedSections.length,
  dry_run_scores_consumed: true,
  baseline_dry_run_quality_score: dryRunScores.quality_score,
  baseline_dry_run_visitor_value_score: dryRunScores.visitor_value_score,
  baseline_dry_run_combined_score: dryRunScores.combined_score,
  dry_run_score_recalculation_performed: false,
  actual_score_calculation_performed: false,
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
  reference_url_population_performed: false,
  visual_generation_allowed: false,
  static_live_mutation_allowed: false,
  production_readiness_after_ag07m: "not_ready",
  publish_readiness_after_ag07m: "blocked",
  next_stage_id: "AG07N",
  next_stage_title: "Production Packet Candidate"
};

const schema = {
  schema_id: "drishvara/ag07m/improvement-pass.schema.json",
  module_id: "AG07M",
  title: "Improvement Pass Schema",
  status: "schema_preview_improvement_only",
  description: "Schema for using AG07L dry-run scoring gaps to create one improved preview packet. AG07M does not create production packet, recalculate scores, mutate articles or persist production records.",
  required_top_level_fields: [
    "improved_preview_packet",
    "improvement_record",
    "summary",
    "mutation_controls"
  ],
  improved_packet_required_fields: [
    "packet_id",
    "preview_only",
    "production_packet",
    "publish_ready",
    "publication_allowed",
    "improved_sections",
    "improved_reference_plan",
    "improved_visual_data_plan",
    "improved_static_live_readiness_preview"
  ],
  improvement_record_required_fields: [
    "baseline_dry_run_scores",
    "threshold_result_before_improvement",
    "source_improvement_priorities",
    "improvement_actions",
    "improvement_pass_result"
  ],
  improved_preview_packet_creation_allowed_in_ag07m: true,
  improvement_actions_creation_allowed_in_ag07m: true,
  dry_run_score_recalculation_allowed_in_ag07m: false,
  actual_score_calculation_allowed_in_ag07m: false,
  production_packet_creation_allowed_in_ag07m: false,
  production_score_record_creation_allowed_in_ag07m: false,
  publish_ready_approval_allowed_in_ag07m: false,
  approval_state_change_allowed_in_ag07m: false,
  production_jsonl_append_allowed_in_ag07m: false,
  database_write_allowed_in_ag07m: false,
  supabase_write_allowed_in_ag07m: false,
  article_prose_generation_allowed_in_ag07m: false,
  article_mutation_allowed_in_ag07m: false,
  reference_insertion_allowed_in_ag07m: false,
  reference_url_population_allowed_in_ag07m: false,
  visual_generation_allowed_in_ag07m: false,
  static_live_mutation_allowed_in_ag07m: false,
  publishing_allowed_in_ag07m: false,
  backend_auth_supabase_allowed_in_ag07m: false,
  ...noProductionControls
};

const learning = {
  module_id: "AG07M",
  title: "Improvement Pass Learning",
  status: "learning_record_only",
  improvement_pass_only: true,
  generated_from: inputs,
  summary,
  learning_points_from_ag07l: asArray(ag07lLearning.ag07l_learning_points),
  ag07m_learning_points: [
    "AG07L dry-run scoring gaps can be converted into concrete improvement actions without creating production output.",
    "Reference readiness and evidence alignment remain the main blockers before production packet candidacy.",
    "Visual/data readiness must be carried forward into candidate asset and accessibility fields.",
    "Static-live compatibility fields should remain forward-compatible but inactive until AG07O/AG07P.",
    "AG07N can now create a production packet candidate, but not publish or mutate public files without later approval."
  ],
  carried_forward_doctrine: [
    "Improvement pass is not production packet creation.",
    "Improved preview packet is not publish-ready approval.",
    "No public article mutation may occur in AG07M.",
    "No reference URL population or insertion may occur in AG07M.",
    "No visual generation or static-live mutation may occur in AG07M."
  ],
  compressed_path_after_ag07m: [
    "AG07N — Production Packet Candidate",
    "AG07O — Approval + Controlled Single-Article Mutation Plan",
    "AG07P — One-Article Controlled Apply",
    "AG07Q — Post-Mutation Audit",
    "AG07Z — Closure / Repeatable Production Readiness"
  ],
  ...noProductionControls
};

const review = {
  module_id: "AG07M",
  title: "Improvement Pass",
  status: "improvement_pass_created",
  governance_only: true,
  improvement_pass_only: true,
  depends_on: ["AG07L", "AG07K", "AG07I", "AG07H", "AG07G", "AG06E", "AG06K", "AG06L"],
  generated_from: inputs,
  summary,
  alignment_with_ag07l: {
    ag07l_status: ag07lReview.status,
    ag07l_decision: ag07lReview.closure_decision?.decision,
    ag07m_requires_explicit_approval: ag07lReview.closure_decision?.proceed_to_ag07m_only_with_explicit_user_approval,
    revised_preview_packet_created: ag07lReview.closure_decision?.revised_preview_packet_created,
    dry_run_score_calculation_performed: ag07lReview.closure_decision?.dry_run_score_calculation_performed,
    production_packet_created_in_ag07l: ag07lReview.closure_decision?.production_packet_created,
    public_article_mutation_performed_in_ag07l: ag07lReview.closure_decision?.public_article_mutation_performed,
    reference_insertion_performed_in_ag07l: ag07lReview.closure_decision?.reference_insertion_performed,
    visual_generation_performed_in_ag07l: ag07lReview.closure_decision?.visual_generation_performed
  },
  improved_packet_file: "data/content-intelligence/content-packets/ag07m-improved-preview-packet.json",
  improvement_record_file: "data/content-intelligence/quality-registry/ag07m-improvement-pass-record.json",
  schema_file: "data/content-intelligence/schema/improvement-pass.schema.json",
  learning_file: "data/content-intelligence/learning/ag07m-improvement-pass-learning.json",
  foundation_alignment: {
    ag06e_long_form_standard_consumed: true,
    word_count_standard: {
      min: ag06eLongFormStandard.summary?.word_count_min || 1500,
      max: ag06eLongFormStandard.summary?.word_count_max || 2200
    },
    reference_slots_available: asArray(ag07gWorkbench.candidate_reference_slots).length,
    visual_slots_available: asArray(ag07hWorkbench.visual_need_slots).length,
    data_unit_slots_available: asArray(ag07hWorkbench.data_unit_slots).length,
    jsonl_store_count: asArray(ag06kStoreManifest.stores).length,
    approval_register_count: asArray(ag06lApprovalRegister.approval_queue_entries).length
  },
  closure_decision: {
    decision: "ag07m_improvement_pass_closed",
    proceed_to_ag07n_only_with_explicit_user_approval: true,
    improved_preview_packet_created: true,
    improvement_actions_created: true,
    dry_run_scores_consumed: true,
    dry_run_score_recalculation_performed: false,
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
    reference_url_population_performed: false,
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
  module_id: "AG07M",
  title: "Improvement Pass",
  governance_only: true,
  improvement_pass_only: true,
  depends_on: ["AG07L"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag07m-improvement-pass.json",
    improved_packet: "data/content-intelligence/content-packets/ag07m-improved-preview-packet.json",
    improvement_record: "data/content-intelligence/quality-registry/ag07m-improvement-pass-record.json",
    schema: "data/content-intelligence/schema/improvement-pass.schema.json",
    learning: "data/content-intelligence/learning/ag07m-improvement-pass-learning.json",
    preview: "data/quality/ag07m-improvement-pass-preview.json",
    document: "docs/quality/AG07M_IMPROVEMENT_PASS.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG07N",
    title: "Production Packet Candidate",
    allowed_scope: "create one production-packet candidate record only with explicit approval",
    blocked_scope: "production JSONL append, database/Supabase write, publish-ready approval, approval-state change, public mutation, reference insertion, visual generation, publishing, backend/Auth/Supabase activation"
  },
  ...noProductionControls
};

const preview = {
  module_id: "AG07M",
  preview_only: true,
  improvement_pass_only: true,
  summary,
  improved_packet_snapshot: {
    packet_id: improvedPreviewPacket.packet_id,
    status: improvedPreviewPacket.status,
    preview_only: improvedPreviewPacket.preview_only,
    production_packet: improvedPreviewPacket.production_packet,
    publish_ready: improvedPreviewPacket.publish_ready,
    improved_section_count: improvedPreviewPacket.improved_sections.length,
    ready_for_ag07n_production_packet_candidate: improvedPreviewPacket.production_candidate_readiness_preview.ready_for_ag07n_production_packet_candidate
  },
  improvement_record_snapshot: {
    status: improvementRecord.status,
    improvement_action_count: improvementRecord.improvement_actions.length,
    baseline_dry_run_scores: improvementRecord.baseline_dry_run_scores,
    score_recalculated: improvementRecord.improvement_pass_result.score_recalculated,
    production_packet_created: improvementRecord.improvement_pass_result.production_packet_created
  },
  next_stage_id: "AG07N",
  next_stage_title: "Production Packet Candidate",
  ...noProductionControls
};

const doc = `# AG07M — Improvement Pass

## Purpose

AG07M uses AG07L dry-run scoring gaps to create one improved preview packet and one improvement pass record.

This stage improves the preview plan only. It does not create a production packet, recalculate scores, approve publish-readiness, change approval state, append production JSONL, write to database or Supabase, generate article prose, mutate public articles, insert references, populate reference URLs, generate visuals, perform static-live mutation, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07M consumes:

- AG07L Revised Preview Packet + Dry-Run Scoring.
- AG07K Article Inference Preview Record Dry Run.
- AG07I Quality and Visitor-Value Scoring Boundary.
- AG07H Visual and Data Enrichment Boundary / Workbench.
- AG07G Reference Discovery Boundary / Workbench.
- AG06E long-form article standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Improvement Scope

AG07M creates:

- one improved preview packet;
- one improvement pass record;
- improvement actions mapped to AG07L score gaps;
- improved reference-readiness plan;
- improved visual/data-readiness plan;
- forward-compatible static-live readiness preview.

## Scoring Status

AG07M consumes AG07L dry-run scores but does not recalculate scores.

Dry-run scoring remains a non-production input.

No publish-ready approval is created.

## Production Readiness Decision

AG07M does not make the packet production-ready.

Production readiness remains not_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07M does not:

- create a production packet;
- create production score records;
- recalculate dry-run scores;
- calculate actual scores;
- approve publish-readiness;
- change approval state;
- set publish_ready=true;
- append production JSONL records;
- write to database or Supabase;
- generate article prose;
- generate production content;
- mutate public article HTML;
- insert references into article HTML;
- populate reference URLs;
- generate visual assets or infographics;
- insert images;
- perform static-live mutation;
- copy, move, delete or import scaffold outputs;
- publish content;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup or public dynamic output.

## Static-Live Compatibility Note

AG07M carries static-live readiness requirements forward, including target article path, backup requirement, mutation sections, rollback plan and post-mutation validation checklist. These remain preview-only and inactive.

## Acceptance Criteria

AG07M is acceptable only if:

- AG07L revised preview packet and dry-run scoring are consumed;
- one improved preview packet is created;
- improvement actions are created;
- dry-run scores are consumed but not recalculated;
- production packet creation remains false;
- publish-ready approval remains false;
- approval-state change remains false;
- production JSONL append remains false;
- database/Supabase write remains false;
- article prose generation remains false;
- public article mutation remains false;
- reference insertion and reference URL population remain false;
- visual generation remains false;
- static-live mutation remains false;
- production readiness remains not_ready;
- publish readiness remains blocked;
- AG07N Production Packet Candidate is identified as next only with explicit approval;
- package scripts for generate:ag07m and validate:ag07m are present;
- validate:project includes validate:ag07m.

## Next Stage

The next possible stage is AG07N — Production Packet Candidate.

AG07N must not start automatically. It requires explicit approval.
`;

writeJson(reviewPath, review);
writeJson(improvedPacketPath, improvedPreviewPacket);
writeJson(improvementRecordPath, improvementRecord);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG07M improvement pass artifacts generated.");
