import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const inputs = {
  ag07mReview: "data/content-intelligence/quality-reviews/ag07m-improvement-pass.json",
  ag07mImprovedPacket: "data/content-intelligence/content-packets/ag07m-improved-preview-packet.json",
  ag07mImprovementRecord: "data/content-intelligence/quality-registry/ag07m-improvement-pass-record.json",
  ag07mSchema: "data/content-intelligence/schema/improvement-pass.schema.json",
  ag07mLearning: "data/content-intelligence/learning/ag07m-improvement-pass-learning.json",
  ag07lScoring: "data/content-intelligence/quality-registry/ag07l-dry-run-scoring-result.json",
  ag07kInferenceRecord: "data/content-intelligence/inference-records/ag07k-preview-only-article-inference-record.json",
  ag07gWorkbench: "data/content-intelligence/reference-registry/ag07g-reference-discovery-workbench.json",
  ag07hWorkbench: "data/content-intelligence/visual-registry/ag07h-visual-data-enrichment-workbench.json",
  ag06eLongFormStandard: "data/content-intelligence/quality-reviews/long-form-article-standard.json",
  ag06jReferenceStandard: "data/content-intelligence/reference-registry/reference-source-credibility-standard.json",
  ag06kStoreManifest: "data/content-intelligence/run-registry/jsonl-first-content-intelligence-store-manifest.json",
  ag06lApprovalRegister: "data/content-intelligence/publish-queue/publish-queue-approval-state-register.json"
};

const reviewPath = path.join(root, "data", "content-intelligence", "quality-reviews", "ag07n-production-packet-candidate.json");
const candidatePath = path.join(root, "data", "content-intelligence", "content-packets", "ag07n-production-packet-candidate.json");
const readinessPath = path.join(root, "data", "content-intelligence", "quality-registry", "ag07n-production-packet-candidate-readiness.json");
const schemaPath = path.join(root, "data", "content-intelligence", "schema", "production-packet-candidate.schema.json");
const learningPath = path.join(root, "data", "content-intelligence", "learning", "ag07n-production-packet-candidate-learning.json");
const registryPath = path.join(root, "data", "quality", "ag07n-production-packet-candidate.json");
const previewPath = path.join(root, "data", "quality", "ag07n-production-packet-candidate-preview.json");
const docPath = path.join(root, "docs", "quality", "AG07N_PRODUCTION_PACKET_CANDIDATE.md");

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
    throw new Error(`Missing required AG07N input ${name}: ${relativePath}`);
  }
}

const ag07mReview = readJson(inputs.ag07mReview);
const ag07mImprovedPacket = readJson(inputs.ag07mImprovedPacket);
const ag07mImprovementRecord = readJson(inputs.ag07mImprovementRecord);
const ag07mSchema = readJson(inputs.ag07mSchema);
const ag07mLearning = readJson(inputs.ag07mLearning);
const ag07lScoring = readJson(inputs.ag07lScoring);
const ag07kInferenceRecord = readJson(inputs.ag07kInferenceRecord);
const ag07gWorkbench = readJson(inputs.ag07gWorkbench);
const ag07hWorkbench = readJson(inputs.ag07hWorkbench);
const ag06eLongFormStandard = readJson(inputs.ag06eLongFormStandard);
const ag06jReferenceStandard = readJson(inputs.ag06jReferenceStandard);
const ag06kStoreManifest = readJson(inputs.ag06kStoreManifest);
const ag06lApprovalRegister = readJson(inputs.ag06lApprovalRegister);

const improvedPacketId = ag07mImprovedPacket.packet_id || "ag07m-improved-preview-packet";
const candidateId = `ag07n-production-candidate:${improvedPacketId}`;

const referenceCandidatePlan = {
  candidate_plan_only: true,
  reference_standard_source: "AG06J",
  minimum_reference_required: ag07mImprovedPacket.improved_reference_plan?.minimum_reference_need || 2,
  candidate_reference_slots_available: asArray(ag07gWorkbench.candidate_reference_slots).length,
  source_quality_standard_present: Boolean(ag06jReferenceStandard),
  candidate_reference_url_population_allowed_in_ag07n: false,
  candidate_reference_url_population_performed: false,
  approved_reference_url_population_performed: false,
  reference_insertion_performed: false,
  readiness_status: "candidate_plan_ready_population_pending",
  required_next_actions: [
    "populate_candidate_reference_urls_later",
    "verify_link_health_later",
    "classify_source_credibility_later",
    "approve_reference_slots_later"
  ]
};

const visualCandidatePlan = {
  candidate_plan_only: true,
  visual_need_slots_available: asArray(ag07hWorkbench.visual_need_slots).length,
  data_unit_slots_available: asArray(ag07hWorkbench.data_unit_slots).length,
  hero_visual_need: ag07mImprovedPacket.improved_visual_data_plan?.hero_visual_need || "",
  structured_visual_need: ag07mImprovedPacket.improved_visual_data_plan?.structured_visual_need || "",
  data_unit_need: ag07mImprovedPacket.improved_visual_data_plan?.data_unit_need || "",
  accessibility_need: ag07mImprovedPacket.improved_visual_data_plan?.accessibility_need || "",
  visual_generation_allowed_in_ag07n: false,
  visual_generation_performed: false,
  image_insertion_performed: false,
  data_unit_generation_performed: false,
  caption_alt_credit_population_performed: false,
  readiness_status: "candidate_plan_ready_asset_population_pending",
  required_next_actions: [
    "select_or_generate_candidate_visual_later",
    "prepare_candidate_data_unit_later",
    "populate_caption_alt_text_image_credit_later",
    "perform_mobile_layout_review_later"
  ]
};

const staticLiveCandidatePlan = {
  candidate_plan_only: true,
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
  reference_block_insertion_point: "future_ag07o_or_ag07p",
  hero_image_insertion_point: "future_ag07o_or_ag07p",
  image_credit_block_required: true,
  alt_text_required: true,
  meta_title_required: true,
  meta_description_required: true,
  rollback_plan_required: true,
  post_mutation_validation_checklist_required: true,
  static_live_mutation_allowed_in_ag07n: false,
  static_live_mutation_performed: false,
  readiness_status: "candidate_plan_only_target_article_pending"
};

const candidateSections = asArray(ag07mImprovedPacket.improved_sections).map((section) => ({
  section_id: section.section_id,
  section_title: section.section_title,
  source_section_status: section.section_status,
  candidate_section_status: "production_candidate_section_planned",
  derived_from_improvement_pass: true,
  prose_generated_in_ag07n: false,
  production_execution_performed: false,
  candidate_readiness_notes: [
    "section outline improved in AG07M",
    "article prose generation remains blocked",
    "production packet creation remains blocked until later approval"
  ]
}));

const approvalCandidateChecklist = [
  {
    checkpoint_id: "AG07N-CHK-001",
    checkpoint_name: "reference_candidate_readiness",
    status: "pending_future_review",
    required_before_publish_ready: true,
    passed_in_ag07n: false
  },
  {
    checkpoint_id: "AG07N-CHK-002",
    checkpoint_name: "visual_data_candidate_readiness",
    status: "pending_future_review",
    required_before_publish_ready: true,
    passed_in_ag07n: false
  },
  {
    checkpoint_id: "AG07N-CHK-003",
    checkpoint_name: "static_live_target_selection",
    status: "pending_future_review",
    required_before_public_mutation: true,
    passed_in_ag07n: false
  },
  {
    checkpoint_id: "AG07N-CHK-004",
    checkpoint_name: "human_approval_gate",
    status: "pending_future_review",
    required_before_publish_ready: true,
    passed_in_ag07n: false
  },
  {
    checkpoint_id: "AG07N-CHK-005",
    checkpoint_name: "rollback_and_audit_plan",
    status: "pending_future_review",
    required_before_static_live_apply: true,
    passed_in_ag07n: false
  }
];

const noProductionControls = {
  production_packet_candidate_only: true,
  production_packet_candidate_record_created: true,
  actual_production_packet_created: false,
  production_packet_created: false,
  production_content_generated: false,
  article_prose_generated: false,
  narrative_text_generated: false,
  dry_run_score_recalculation_performed: false,
  actual_score_calculation_performed: false,
  production_score_record_created: false,
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
  public_article_mutation_performed: false,
  article_html_mutation_performed: false,
  reference_insertion_performed: false,
  reference_url_population_performed: false,
  approved_reference_url_population_performed: false,
  visual_generation_performed: false,
  visual_asset_generation_performed: false,
  image_insertion_performed: false,
  data_unit_generation_performed: false,
  caption_alt_credit_population_performed: false,
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

const productionPacketCandidate = {
  module_id: "AG07N",
  candidate_id: candidateId,
  title: "Production Packet Candidate",
  status: "production_packet_candidate_created",
  candidate_only: true,
  preview_only: true,
  production_packet: false,
  publish_ready: false,
  publication_allowed: false,
  source_stage: "AG07N",
  generated_from: inputs,
  source_improved_packet_snapshot: {
    packet_id: improvedPacketId,
    status: ag07mImprovedPacket.status,
    preview_only: ag07mImprovedPacket.preview_only,
    production_packet: ag07mImprovedPacket.production_packet,
    publish_ready: ag07mImprovedPacket.publish_ready,
    publication_allowed: ag07mImprovedPacket.publication_allowed
  },
  source_improvement_record_snapshot: {
    status: ag07mImprovementRecord.status,
    improvement_action_count: asArray(ag07mImprovementRecord.improvement_actions).length,
    production_packet_created: ag07mImprovementRecord.improvement_pass_result?.production_packet_created,
    score_recalculated: ag07mImprovementRecord.improvement_pass_result?.score_recalculated
  },
  inference_record_snapshot: {
    record_id: ag07kInferenceRecord.record_id,
    status: ag07kInferenceRecord.status,
    preview_only: ag07kInferenceRecord.preview_only,
    production_record: ag07kInferenceRecord.production_record
  },
  dry_run_score_snapshot: {
    source: "AG07L",
    quality_score: ag07lScoring.dry_run_scores?.quality_score,
    visitor_value_score: ag07lScoring.dry_run_scores?.visitor_value_score,
    combined_score: ag07lScoring.dry_run_scores?.combined_score,
    publish_ready_recommended: ag07lScoring.threshold_result?.publish_ready_recommended,
    threshold_reason: ag07lScoring.threshold_result?.reason
  },
  candidate_sections: candidateSections,
  reference_candidate_plan: referenceCandidatePlan,
  visual_candidate_plan: visualCandidatePlan,
  static_live_candidate_plan: staticLiveCandidatePlan,
  approval_candidate_checklist: approvalCandidateChecklist,
  candidate_readiness_assessment: {
    candidate_record_created: true,
    ready_for_ag07o_approval_and_mutation_plan: true,
    ready_for_publish_ready_approval: false,
    ready_for_static_live_apply: false,
    reason: "AG07N creates the candidate record only; reference URL population, visual/data population, target article selection and human approval remain pending."
  },
  ...noProductionControls
};

const candidateReadinessRecord = {
  module_id: "AG07N",
  title: "Production Packet Candidate Readiness Record",
  status: "candidate_readiness_record_created",
  preview_only: true,
  production_record: false,
  candidate_id: candidateId,
  baseline_scores: productionPacketCandidate.dry_run_score_snapshot,
  improvement_actions_carried_forward: asArray(ag07mImprovementRecord.improvement_actions).map((action) => ({
    action_id: action.action_id,
    action_name: action.action_name,
    priority: action.priority,
    production_execution_performed: false
  })),
  readiness_gates: {
    reference_candidate_plan_ready: true,
    visual_candidate_plan_ready: true,
    static_live_plan_fields_present: true,
    approval_checklist_present: true,
    production_packet_created: false,
    publish_ready_approved: false,
    public_mutation_allowed: false
  },
  blocking_items_before_ag07p_apply: [
    "target_article_path_not_selected",
    "reference_urls_not_populated",
    "reference_credibility_not_approved",
    "visual_assets_not_populated",
    "caption_alt_credit_not_populated",
    "publish_ready_not_approved",
    "rollback_plan_not_finalized"
  ],
  next_stage_recommendation: {
    module_id: "AG07O",
    title: "Approval + Controlled Single-Article Mutation Plan",
    allowed_scope: "approval and mutation plan only; no apply unless separately approved"
  },
  ...noProductionControls
};

const summary = {
  ag07m_improvement_pass_consumed: ag07mReview.status === "improvement_pass_created",
  ag07m_improved_preview_packet_consumed: ag07mImprovedPacket.status === "improved_preview_packet_created",
  production_packet_candidate_record_created: true,
  actual_production_packet_created: false,
  production_packet_created: false,
  candidate_section_count: candidateSections.length,
  approval_checklist_count: approvalCandidateChecklist.length,
  reference_candidate_plan_created: true,
  visual_candidate_plan_created: true,
  static_live_candidate_plan_created: true,
  dry_run_scores_carried_forward: true,
  dry_run_score_recalculation_performed: false,
  actual_score_calculation_performed: false,
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
  production_readiness_after_ag07n: "candidate_created_not_production_ready",
  publish_readiness_after_ag07n: "blocked",
  next_stage_id: "AG07O",
  next_stage_title: "Approval + Controlled Single-Article Mutation Plan"
};

const schema = {
  schema_id: "drishvara/ag07n/production-packet-candidate.schema.json",
  module_id: "AG07N",
  title: "Production Packet Candidate Schema",
  status: "schema_candidate_only",
  description: "Schema for one production-packet candidate record. AG07N does not create an actual production packet, publish-ready approval, public mutation, reference insertion, visual generation or production persistence.",
  required_top_level_fields: [
    "production_packet_candidate",
    "candidate_readiness_record",
    "summary",
    "mutation_controls"
  ],
  candidate_required_fields: [
    "candidate_id",
    "candidate_only",
    "preview_only",
    "production_packet",
    "publish_ready",
    "publication_allowed",
    "candidate_sections",
    "reference_candidate_plan",
    "visual_candidate_plan",
    "static_live_candidate_plan",
    "approval_candidate_checklist"
  ],
  production_packet_candidate_record_creation_allowed_in_ag07n: true,
  actual_production_packet_creation_allowed_in_ag07n: false,
  production_packet_creation_allowed_in_ag07n: false,
  production_content_generation_allowed_in_ag07n: false,
  article_prose_generation_allowed_in_ag07n: false,
  dry_run_score_recalculation_allowed_in_ag07n: false,
  actual_score_calculation_allowed_in_ag07n: false,
  production_score_record_creation_allowed_in_ag07n: false,
  publish_ready_approval_allowed_in_ag07n: false,
  approval_state_change_allowed_in_ag07n: false,
  production_jsonl_append_allowed_in_ag07n: false,
  database_write_allowed_in_ag07n: false,
  supabase_write_allowed_in_ag07n: false,
  article_mutation_allowed_in_ag07n: false,
  reference_insertion_allowed_in_ag07n: false,
  reference_url_population_allowed_in_ag07n: false,
  visual_generation_allowed_in_ag07n: false,
  static_live_mutation_allowed_in_ag07n: false,
  publishing_allowed_in_ag07n: false,
  backend_auth_supabase_allowed_in_ag07n: false,
  ...noProductionControls
};

const learning = {
  module_id: "AG07N",
  title: "Production Packet Candidate Learning",
  status: "learning_record_only",
  production_packet_candidate_only: true,
  generated_from: inputs,
  summary,
  learning_points_from_ag07m: asArray(ag07mLearning.ag07m_learning_points),
  ag07n_learning_points: [
    "A production-packet candidate can be structured without creating an actual production packet.",
    "Reference, visual/data and static-live requirements must be carried into the approval/mutation plan before any apply step.",
    "Candidate creation is not publish-ready approval.",
    "Static-live mutation still requires a separate approval and single-article plan.",
    "AG07O should convert this candidate into an approval and controlled mutation plan, not apply it yet."
  ],
  carried_forward_doctrine: [
    "Candidate record is not production packet.",
    "Production-packet candidate is not publish-ready approval.",
    "No public article mutation may occur in AG07N.",
    "No reference URL population or insertion may occur in AG07N.",
    "No visual generation or static-live mutation may occur in AG07N."
  ],
  compressed_path_after_ag07n: [
    "AG07O — Approval + Controlled Single-Article Mutation Plan",
    "AG07P — One-Article Controlled Apply",
    "AG07Q — Post-Mutation Audit",
    "AG07Z — Closure / Repeatable Production Readiness"
  ],
  ...noProductionControls
};

const review = {
  module_id: "AG07N",
  title: "Production Packet Candidate",
  status: "production_packet_candidate_created",
  governance_only: true,
  production_packet_candidate_only: true,
  depends_on: ["AG07M", "AG07L", "AG07K", "AG07H", "AG07G", "AG06E", "AG06J", "AG06K", "AG06L"],
  generated_from: inputs,
  summary,
  alignment_with_ag07m: {
    ag07m_status: ag07mReview.status,
    ag07m_decision: ag07mReview.closure_decision?.decision,
    ag07n_requires_explicit_approval: ag07mReview.closure_decision?.proceed_to_ag07n_only_with_explicit_user_approval,
    improved_preview_packet_created: ag07mReview.closure_decision?.improved_preview_packet_created,
    production_packet_created_in_ag07m: ag07mReview.closure_decision?.production_packet_created,
    public_article_mutation_performed_in_ag07m: ag07mReview.closure_decision?.public_article_mutation_performed,
    reference_url_population_performed_in_ag07m: ag07mReview.closure_decision?.reference_url_population_performed,
    visual_generation_performed_in_ag07m: ag07mReview.closure_decision?.visual_generation_performed,
    static_live_mutation_performed_in_ag07m: ag07mReview.closure_decision?.static_live_mutation_performed
  },
  candidate_file: "data/content-intelligence/content-packets/ag07n-production-packet-candidate.json",
  readiness_file: "data/content-intelligence/quality-registry/ag07n-production-packet-candidate-readiness.json",
  schema_file: "data/content-intelligence/schema/production-packet-candidate.schema.json",
  learning_file: "data/content-intelligence/learning/ag07n-production-packet-candidate-learning.json",
  foundation_alignment: {
    ag06e_long_form_standard_consumed: true,
    word_count_standard: {
      min: ag06eLongFormStandard.summary?.word_count_min || 1500,
      max: ag06eLongFormStandard.summary?.word_count_max || 2200
    },
    ag06j_reference_standard_consumed: true,
    jsonl_store_count: asArray(ag06kStoreManifest.stores).length,
    approval_register_count: asArray(ag06lApprovalRegister.approval_queue_entries).length
  },
  closure_decision: {
    decision: "ag07n_production_packet_candidate_closed",
    proceed_to_ag07o_only_with_explicit_user_approval: true,
    production_packet_candidate_record_created: true,
    actual_production_packet_created: false,
    production_packet_created: false,
    production_content_generated: false,
    article_prose_generated: false,
    dry_run_score_recalculation_performed: false,
    actual_score_calculation_performed: false,
    production_score_record_created: false,
    publish_ready_approval_performed: false,
    approval_state_changed: false,
    publish_ready_set: false,
    production_jsonl_append_performed: false,
    database_write_performed: false,
    supabase_write_performed: false,
    public_article_mutation_performed: false,
    reference_insertion_performed: false,
    reference_url_population_performed: false,
    visual_generation_performed: false,
    static_live_mutation_performed: false,
    production_readiness: "candidate_created_not_production_ready",
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
  module_id: "AG07N",
  title: "Production Packet Candidate",
  governance_only: true,
  production_packet_candidate_only: true,
  depends_on: ["AG07M"],
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag07n-production-packet-candidate.json",
    candidate: "data/content-intelligence/content-packets/ag07n-production-packet-candidate.json",
    readiness: "data/content-intelligence/quality-registry/ag07n-production-packet-candidate-readiness.json",
    schema: "data/content-intelligence/schema/production-packet-candidate.schema.json",
    learning: "data/content-intelligence/learning/ag07n-production-packet-candidate-learning.json",
    preview: "data/quality/ag07n-production-packet-candidate-preview.json",
    document: "docs/quality/AG07N_PRODUCTION_PACKET_CANDIDATE.md"
  },
  summary,
  next_recommended_stage: {
    module_id: "AG07O",
    title: "Approval + Controlled Single-Article Mutation Plan",
    allowed_scope: "approval and single-article mutation plan only with explicit approval",
    blocked_scope: "apply/mutation, production JSONL append, database/Supabase write, publishing, backend/Auth/Supabase activation"
  },
  ...noProductionControls
};

const preview = {
  module_id: "AG07N",
  preview_only: true,
  production_packet_candidate_only: true,
  summary,
  candidate_snapshot: {
    candidate_id: productionPacketCandidate.candidate_id,
    status: productionPacketCandidate.status,
    candidate_only: productionPacketCandidate.candidate_only,
    production_packet: productionPacketCandidate.production_packet,
    publish_ready: productionPacketCandidate.publish_ready,
    publication_allowed: productionPacketCandidate.publication_allowed,
    candidate_section_count: productionPacketCandidate.candidate_sections.length,
    reference_candidate_plan_ready: candidateReadinessRecord.readiness_gates.reference_candidate_plan_ready,
    visual_candidate_plan_ready: candidateReadinessRecord.readiness_gates.visual_candidate_plan_ready,
    static_live_plan_fields_present: candidateReadinessRecord.readiness_gates.static_live_plan_fields_present
  },
  blocking_items_before_ag07p_apply: candidateReadinessRecord.blocking_items_before_ag07p_apply,
  next_stage_id: "AG07O",
  next_stage_title: "Approval + Controlled Single-Article Mutation Plan",
  ...noProductionControls
};

const doc = `# AG07N — Production Packet Candidate

## Purpose

AG07N creates one production-packet candidate record using the AG07M improved preview packet.

This stage creates a candidate record only. It does not create an actual production packet, generate production content, approve publish-readiness, change approval state, append production JSONL, write to database or Supabase, generate article prose, mutate public articles, insert references, populate reference URLs, generate visuals, perform static-live mutation, publish content, or activate backend/Auth/Supabase/API functionality.

## Inputs

AG07N consumes:

- AG07M Improvement Pass.
- AG07L Revised Preview Packet + Dry-Run Scoring.
- AG07K Article Inference Preview Record Dry Run.
- AG07H Visual and Data Enrichment Boundary / Workbench.
- AG07G Reference Discovery Boundary / Workbench.
- AG06E long-form article standard.
- AG06J reference/source credibility standard.
- AG06K JSONL-first store manifest.
- AG06L publish queue approval state register.

## Candidate Scope

AG07N creates:

- one production-packet candidate record;
- candidate section structure;
- reference candidate plan;
- visual/data candidate plan;
- static-live candidate plan;
- approval candidate checklist;
- readiness record.

The candidate is not a production packet.

## Production Readiness Decision

AG07N does not make the packet production-ready.

Production readiness becomes candidate_created_not_production_ready.

Publish readiness remains blocked.

## Explicit Exclusions

AG07N does not:

- create an actual production packet;
- generate production content;
- generate article prose;
- recalculate scores;
- calculate actual scores;
- create production score records;
- approve publish-readiness;
- change approval state;
- set publish_ready=true;
- append production JSONL records;
- write to database or Supabase;
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

AG07N carries static-live candidate fields forward, including target article path, backup requirement, mutation sections, rollback plan and post-mutation validation checklist. These remain candidate-only and inactive.

## Acceptance Criteria

AG07N is acceptable only if:

- AG07M improved preview packet is consumed;
- one production-packet candidate record is created;
- actual production packet creation remains false;
- production content generation remains false;
- article prose generation remains false;
- publish-ready approval remains false;
- approval-state change remains false;
- production JSONL append remains false;
- database/Supabase write remains false;
- public article mutation remains false;
- reference insertion and reference URL population remain false;
- visual generation remains false;
- static-live mutation remains false;
- production readiness remains candidate_created_not_production_ready;
- publish readiness remains blocked;
- AG07O Approval + Controlled Single-Article Mutation Plan is identified as next only with explicit approval;
- package scripts for generate:ag07n and validate:ag07n are present;
- validate:project includes validate:ag07n.

## Next Stage

The next possible stage is AG07O — Approval + Controlled Single-Article Mutation Plan.

AG07O must not start automatically. It requires explicit approval.
`;

writeJson(reviewPath, review);
writeJson(candidatePath, productionPacketCandidate);
writeJson(readinessPath, candidateReadinessRecord);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG07N production packet candidate artifacts generated.");
