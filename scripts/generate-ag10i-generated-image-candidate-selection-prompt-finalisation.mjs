import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag10hReview: "data/content-intelligence/quality-reviews/ag10h-generated-image-editorial-visual-pipeline-planning.json",
  ag10hPlan: "data/content-intelligence/mutation-plans/ag10h-generated-image-editorial-visual-pipeline-planning.json",
  ag10hGateReadiness: "data/content-intelligence/quality-registry/ag10h-image-generation-gate-readiness.json",
  ag10hFamilyRegistry: "data/content-intelligence/object-registry/ag10h-generated-image-editorial-visual-family-registry.json",
  ag10hPromptSchema: "data/content-intelligence/object-registry/ag10h-image-prompt-concept-schema.json",
  ag10hTemplateDoctrine: "data/content-intelligence/object-registry/ag10h-reusable-image-concept-render-instance-doctrine.json",
  ag10hVisualDoctrine: "data/content-intelligence/object-registry/ag10h-image-theme-credit-mobile-doctrine.json",
  ag10hReadiness: "data/content-intelligence/quality-registry/ag10h-generated-image-editorial-visual-pipeline-readiness.json",
  ag10hBoundary: "data/content-intelligence/mutation-plans/ag10h-to-ag10i-generated-image-candidate-selection-prompt-finalisation-boundary.json",
  ag10bScoring: "data/content-intelligence/object-registry/ag10b-object-selection-scoring-doctrine.json",
  ag10bEligibility: "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
  ag10aThemeLayout: "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  ag10aOwnership: "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag10i-generated-image-candidate-selection-prompt-finalisation.json");
const planPath = path.join(root, "data/content-intelligence/mutation-plans/ag10i-generated-image-candidate-selection-prompt-finalisation.json");
const candidateSelectionPath = path.join(root, "data/content-intelligence/object-registry/ag10i-generated-image-candidate-selection-record.json");
const conceptCandidatePath = path.join(root, "data/content-intelligence/object-registry/ag10i-reusable-image-concept-candidate-record.json");
const promptRecordPath = path.join(root, "data/content-intelligence/object-registry/ag10i-finalised-prompt-concept-record.json");
const rightsCheckPath = path.join(root, "data/content-intelligence/quality-registry/ag10i-rights-provenance-source-check-record.json");
const costReusePath = path.join(root, "data/content-intelligence/quality-registry/ag10i-cost-reuse-decision-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag10i-generated-image-candidate-readiness.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag10i-to-ag10j-controlled-generated-image-asset-creation-source-finalisation-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/generated-image-candidate-selection-prompt-finalisation.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag10i-generated-image-candidate-selection-prompt-finalisation-learning.json");
const registryPath = path.join(root, "data/quality/ag10i-generated-image-candidate-selection-prompt-finalisation.json");
const previewPath = path.join(root, "data/quality/ag10i-generated-image-candidate-selection-prompt-finalisation-preview.json");
const docPath = path.join(root, "docs/quality/AG10I_GENERATED_IMAGE_CANDIDATE_SELECTION_PROMPT_FINALISATION.md");

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
  if (!exists(relativePath)) throw new Error(`Missing required AG10I input ${name}: ${relativePath}`);
}

const ag10hReview = readJson(inputs.ag10hReview);
const ag10hPlan = readJson(inputs.ag10hPlan);
const ag10hGateReadiness = readJson(inputs.ag10hGateReadiness);
const ag10hFamilyRegistry = readJson(inputs.ag10hFamilyRegistry);
const ag10hPromptSchema = readJson(inputs.ag10hPromptSchema);
const ag10hTemplateDoctrine = readJson(inputs.ag10hTemplateDoctrine);
const ag10hVisualDoctrine = readJson(inputs.ag10hVisualDoctrine);
const ag10hReadiness = readJson(inputs.ag10hReadiness);
const ag10hBoundary = readJson(inputs.ag10hBoundary);
const ag10bScoring = readJson(inputs.ag10bScoring);
const ag10bEligibility = readJson(inputs.ag10bEligibility);
const ag10aThemeLayout = readJson(inputs.ag10aThemeLayout);
const ag10aOwnership = readJson(inputs.ag10aOwnership);
const ag09cApply = readJson(inputs.ag09cApply);

if (ag10hReview.status !== "generated_image_editorial_visual_pipeline_planning_created_not_executed") {
  throw new Error("AG10I requires AG10H review.");
}
if (ag10hReadiness.ready_for_ag10i !== true) {
  throw new Error("AG10I requires AG10H readiness.");
}
if (ag10hBoundary.next_stage_id !== "AG10I" || ag10hBoundary.explicit_approval_required !== true) {
  throw new Error("AG10I requires AG10H to AG10I explicit boundary.");
}
if (!Array.isArray(ag10hGateReadiness.gate_questions_carried_forward) || ag10hGateReadiness.gate_questions_carried_forward.length !== 5) {
  throw new Error("AG10I requires AG10H gate readiness with five questions.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag09cApply.post_correction_hash) {
  throw new Error("AG10I selected article hash must match AG09C post-correction hash.");
}

const stageControls = {
  generated_image_candidate_selection_prompt_finalisation_only: true,
  selected_article_read_performed: true,

  candidate_selection_record_created_in_ag10i: true,
  reusable_concept_candidate_record_created_in_ag10i: true,
  prompt_concept_record_finalised_in_ag10i: true,
  rights_provenance_source_check_record_created_in_ag10i: true,
  cost_reuse_decision_record_created_in_ag10i: true,

  image_generation_performed_in_ag10i: false,
  external_image_api_call_performed_in_ag10i: false,
  image_asset_creation_performed_in_ag10i: false,
  rendered_image_creation_performed_in_ag10i: false,
  visual_generation_performed_in_ag10i: false,
  object_insertion_performed_in_ag10i: false,
  article_mutation_performed_in_ag10i: false,
  selected_article_file_write_performed_in_ag10i: false,
  homepage_mutation_performed_in_ag10i: false,
  css_mutation_performed_in_ag10i: false,
  js_mutation_performed_in_ag10i: false,
  reference_insertion_performed_in_ag10i: false,
  reference_url_change_performed_in_ag10i: false,
  chart_generation_performed_in_ag10i: false,
  infographic_generation_performed_in_ag10i: false,
  table_generation_performed_in_ag10i: false,
  figure_generation_performed_in_ag10i: false,
  diagram_generation_performed_in_ag10i: false,
  map_generation_performed_in_ag10i: false,
  data_fetch_performed_in_ag10i: false,
  dataset_creation_performed_in_ag10i: false,
  live_url_fetch_performed_in_ag10i: false,
  deployment_trigger_performed_in_ag10i: false,
  production_jsonl_append_performed_in_ag10i: false,
  database_write_performed_in_ag10i: false,
  supabase_write_performed_in_ag10i: false,
  backend_auth_supabase_activation_performed_in_ag10i: false,
  rollback_execution_performed_in_ag10i: false,
  public_publishing_operation_performed_in_ag10i: false
};

const selectedFamily = ag10hFamilyRegistry.image_families.find((family) => family.family_id === "AG10H-IMG-SECTION");
if (!selectedFamily) throw new Error("Required AG10H section-support image family missing.");

const candidateSelection = {
  module_id: "AG10I",
  title: "Generated Image Candidate Selection Record",
  status: "generated_image_candidate_selected_not_generated",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10i: articleHash,
  candidate_id: "AG10I-IMG-CAND-001",
  selected_family_id: selectedFamily.family_id,
  selected_family_name: selectedFamily.family_name,
  selected_image_type: "section_support_image",
  secondary_image_type: "editorial_illustration",
  candidate_role: "mid_article_section_support_visual",
  candidate_positioning_logic: "The article already has a hero visual. The next image candidate should support comprehension inside the article rather than duplicate hero identity.",
  target_article_context: {
    article_category: "policy_public_programme",
    topic_focus: "enhancing public healthcare delivery through digital innovation",
    visitor_problem_addressed: "The reader may understand the article better if digital health service delivery is shown as a connected service pathway rather than only prose.",
    proposed_visual_function: "Support the article with a calm editorial illustration showing digital healthcare as a transparent, accountable and citizen-facing service flow."
  },
  five_gate_assessment: {
    visitor_value: {
      answer: "yes",
      reason: "A section-support visual can make the article easier to scan and more engaging."
    },
    trust_value: {
      answer: "yes_with_conditions",
      reason: "The visual must remain conceptual and must not imply a real facility, real dashboard or verified implementation unless source-backed."
    },
    memory_value: {
      answer: "yes",
      reason: "A consistent Drishvara-style digital public service visual can strengthen recall."
    },
    cost_value: {
      answer: "yes_with_conditions",
      reason: "Cost benefit depends on creating a reusable concept template and avoiding repeated one-off generation."
    },
    intelligence_value: {
      answer: "yes",
      reason: "The candidate creates reusable visual logic for policy/public programme articles on digital governance."
    },
    inclusion_decision: "approved_for_candidate_record_only"
  },
  object_selection_score: {
    score_total: 86,
    score_band: "strong_candidate_for_future_controlled_generation_or_insertion",
    dimensions: [
      { dimension: "editorial_relevance", weight: 25, score_awarded: 23 },
      { dimension: "evidence_or_data_strength", weight: 15, score_awarded: 11 },
      { dimension: "reader_comprehension_value", weight: 15, score_awarded: 14 },
      { dimension: "layout_feasibility", weight: 12, score_awarded: 11 },
      { dimension: "mobile_feasibility", weight: 12, score_awarded: 10 },
      { dimension: "theme_fit", weight: 8, score_awarded: 8 },
      { dimension: "rights_credit_confidence", weight: 8, score_awarded: 6 },
      { dimension: "cost_efficiency", weight: 5, score_awarded: 3 }
    ],
    scoring_source: inputs.ag10bScoring
  },
  generation_allowed_in_ag10i: false,
  asset_creation_allowed_in_ag10i: false,
  next_required_stage: "AG10J",
  ...stageControls
};

const conceptCandidate = {
  module_id: "AG10I",
  title: "Reusable Image Concept Candidate Record",
  status: "reusable_image_concept_candidate_created_not_rendered",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10i: articleHash,
  concept_template_candidate_id: "DRV-IMG-CONCEPT-POLICY-DIGITAL-SERVICE-PATHWAY-001",
  linked_candidate_id: candidateSelection.candidate_id,
  image_family: selectedFamily.family_name,
  image_type: candidateSelection.selected_image_type,
  reusable_for_article_types: [
    "policy_public_programme",
    "health_service_delivery",
    "digital_governance",
    "public_infrastructure",
    "citizen_service_reform"
  ],
  concept_name: "Digital Public Healthcare Service Pathway",
  concept_summary: "A calm editorial support visual showing healthcare service delivery as a connected digital pathway linking citizen, facility, data system and service assurance.",
  visual_metaphor: "A transparent digital service flow connecting patient/citizen touchpoint, health facility, secure data layer and service-quality feedback.",
  composition_guidance: [
    "Use a clean editorial layout, not a flashy technology poster.",
    "Show connected service nodes with subtle human/public-service context.",
    "Avoid real hospital names, real dashboards, real government logos or identifiable persons.",
    "Use Drishvara-compatible muted palette and article-page visual rhythm.",
    "Keep enough negative space for readability."
  ],
  layout_guidance: {
    preferred_placement: "mid_article_after_relevant_section",
    aspect_ratio_candidate: "16:9_or_3:2",
    width_policy: "constrained_article_column_or_safe_full_width",
    caption_required: true,
    visible_credit_required: true,
    mobile_fallback_required: true
  },
  reuse_logic: {
    template_reuse_allowed: true,
    rendered_asset_reuse_allowed: "only_if_context_and_rights_remain_valid",
    reuse_notes: [
      "The concept template may be reused for future digital governance/public service articles.",
      "Rendered image should not be reused if it becomes too article-specific or if caption/context changes."
    ]
  },
  ...stageControls
};

const promptRecord = {
  module_id: "AG10I",
  title: "Finalised Prompt Concept Record",
  status: "prompt_concept_finalised_for_future_controlled_generation_not_executed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10i: articleHash,
  prompt_record_id: "AG10I-PROMPT-001",
  linked_candidate_id: candidateSelection.candidate_id,
  linked_concept_template_candidate_id: conceptCandidate.concept_template_candidate_id,
  prompt_intent: "Create a Drishvara-style editorial section-support visual for an article on enhancing public healthcare delivery through digital innovation.",
  finalised_prompt_text: "A calm, intelligent editorial illustration showing public healthcare delivery as a connected digital service pathway: a citizen/patient access point, a modest healthcare facility, secure data nodes, service-quality feedback signals, and transparent governance flow. Use a restrained Drishvara-compatible palette, soft neutral background, subtle teal-blue accents, clean composition, professional public-service tone, no real logos, no identifiable people, no real dashboard text, no sensational technology imagery, no stock-photo look, suitable for a policy article page, with generous whitespace and mobile-safe readability.",
  negative_constraints: [
    "No real government emblem or logo.",
    "No identifiable real person.",
    "No hospital brand name.",
    "No fake dashboard numbers that appear factual.",
    "No cluttered UI screen.",
    "No cyberpunk/neon look.",
    "No dramatic emergency imagery.",
    "No medical procedure depiction.",
    "No misleading claim of real implementation."
  ],
  caption_candidate: "Digital tools can strengthen healthcare delivery when they connect service access, data visibility and accountability.",
  alt_text_candidate: "Editorial illustration of a digital public healthcare service pathway connecting citizen access, health facility, data systems and service feedback.",
  visible_credit_candidate: "Visual: Drishvara.",
  source_reference_policy: {
    external_reference_used: false,
    source_or_inspiration_note: "Concept derived from the article theme and Drishvara editorial-object doctrine; no external visual reference is used in AG10I.",
    future_source_requirement: "If any external reference or source image is used later, AG10J must record source, rights, licence and credit before generation or asset finalisation."
  },
  prompt_finalised_for_future_stage: true,
  generation_allowed_in_ag10i: false,
  external_image_api_call_allowed_in_ag10i: false,
  ...stageControls
};

const rightsCheck = {
  module_id: "AG10I",
  title: "Rights, Provenance and Source Check Record",
  status: "rights_provenance_source_check_prepared_not_generated",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10i: articleHash,
  linked_candidate_id: candidateSelection.candidate_id,
  rights_controller_candidate: "Drishvara, represented by its legal owner/operator",
  ownership_candidate: "Drishvara-owned/controlled if generated through future approved Drishvara workflow and recorded with prompt/concept lineage.",
  visible_credit_candidate: promptRecord.visible_credit_candidate,
  source_reference_status: "no_external_reference_used_in_ag10i",
  provenance_requirements_for_ag10j: [
    "Record final generation method/tool if used.",
    "Record prompt hash and concept hash.",
    "Record rendered asset hash.",
    "Record dimensions and format.",
    "Record caption, alt text and visible credit.",
    "Record cost marker.",
    "Record reuse eligibility.",
    "Confirm no prohibited likeness, logo, misleading real-world claim or style imitation issue."
  ],
  risk_checks: {
    human_likeness_risk: "low_if_future_generation_uses_generic_non_identifiable_figures_or_abstract_nodes",
    brand_logo_risk: "blocked",
    government_logo_risk: "blocked",
    real_dashboard_risk: "blocked",
    living_artist_style_risk: "blocked",
    misleading_real_world_evidence_risk: "blocked",
    medical_sensitivity_risk: "controlled_by_avoiding_procedure_or_emergency_depiction"
  },
  ag10j_rights_clearance_required_before_asset_creation: true,
  ...stageControls
};

const costReuseDecision = {
  module_id: "AG10I",
  title: "Cost and Reuse Decision Record",
  status: "cost_reuse_decision_prepared_not_generated",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10i: articleHash,
  linked_candidate_id: candidateSelection.candidate_id,
  inclusion_gate_summary: candidateSelection.five_gate_assessment,
  cost_decision: {
    future_generation_allowed_only_if_needed: true,
    prefer_existing_asset_before_generation: true,
    prefer_internal_svg_or_simple_editorial_workflow_before_external_generation: true,
    generation_cost_justification_required_in_ag10j: true,
    reason: "A reusable policy/digital-governance visual concept can reduce future article cost if stored as a template and reused across similar articles."
  },
  reuse_decision: {
    concept_template_reuse: "approved_for_future_template_library_after_ag10j_or_later_confirmation",
    rendered_asset_reuse: "not_applicable_until_asset_exists",
    prompt_pattern_reuse: "allowed_with_variation_to_avoid_repetitive_visuals",
    intelligence_value: "Creates reusable logic for policy/public programme article visuals."
  },
  ag10j_cost_gate_required_before_generation: true,
  ...stageControls
};

const plan = {
  module_id: "AG10I",
  title: "Generated Image Candidate Selection and Prompt Finalisation",
  status: "generated_image_candidate_prompt_finalised_not_generated",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10i: articleHash,
  generated_from: inputs,
  selected_candidate_file: "data/content-intelligence/object-registry/ag10i-generated-image-candidate-selection-record.json",
  concept_candidate_file: "data/content-intelligence/object-registry/ag10i-reusable-image-concept-candidate-record.json",
  prompt_record_file: "data/content-intelligence/object-registry/ag10i-finalised-prompt-concept-record.json",
  rights_check_file: "data/content-intelligence/quality-registry/ag10i-rights-provenance-source-check-record.json",
  cost_reuse_file: "data/content-intelligence/quality-registry/ag10i-cost-reuse-decision-record.json",
  carried_forward: {
    ag10h_plan_status: ag10hPlan.status,
    ag10h_gate_status: ag10hGateReadiness.status,
    ag10h_prompt_schema_status: ag10hPromptSchema.status,
    ag10h_template_doctrine_status: ag10hTemplateDoctrine.status,
    ag10h_visual_doctrine_status: ag10hVisualDoctrine.status,
    ag10b_scoring_status: ag10bScoring.status,
    ag10b_eligibility_status: ag10bEligibility.status,
    ag10a_theme_layout_status: ag10aThemeLayout.status,
    ag10a_ownership_status: ag10aOwnership.status
  },
  stage_principle: "AG10I selects a generated/editorial image candidate and finalises the prompt/concept record for future controlled asset creation only. No image is generated and no asset is created.",
  ...stageControls
};

const readiness = {
  module_id: "AG10I",
  title: "Generated Image Candidate Readiness",
  status: "generated_image_candidate_ready_pending_explicit_ag10j",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10i: articleHash,
  candidate_selection_record_created: true,
  reusable_concept_candidate_record_created: true,
  prompt_concept_record_finalised: true,
  rights_provenance_source_check_record_created: true,
  cost_reuse_decision_record_created: true,
  ready_for_ag10j: true,
  image_generation_ready: false,
  external_image_api_call_ready: false,
  image_asset_creation_ready: false,
  rendered_image_creation_ready: false,
  object_insertion_ready: false,
  article_mutation_ready: false,
  backend_activation_ready: false,
  ...stageControls
};

const boundary = {
  module_id: "AG10I",
  title: "AG10I to AG10J Controlled Generated Image Asset Creation Source Finalisation Boundary",
  status: "ag10j_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10i: articleHash,
  next_stage_id: "AG10J",
  next_stage_title: "Controlled Generated Image Asset Creation and Source Finalisation",
  explicit_approval_required: true,
  ag10j_allowed_scope: [
    "Create or prepare one controlled generated/editorial visual asset only after explicit approval.",
    "Use AG10I candidate and finalised prompt/concept record.",
    "Record source, rights, credit, caption, alt text, dimensions, hash and cost marker.",
    "Confirm no external reference or record any external reference/source if used.",
    "Create readiness handoff for future controlled insertion only."
  ],
  ag10j_blocked_scope: [
    "No article insertion.",
    "No article mutation unless a later insertion stage is explicitly approved.",
    "No homepage mutation.",
    "No CSS/JS mutation.",
    "No database/Supabase/backend/Auth activation.",
    "No publishing operation.",
    "No uncontrolled external image generation or unrecorded asset creation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG10I",
  title: "Generated Image Candidate Selection and Prompt Finalisation Schema",
  status: "schema_generated_image_candidate_selection_prompt_finalisation_only",
  candidate_selection_allowed_in_ag10i: true,
  reusable_concept_candidate_allowed_in_ag10i: true,
  prompt_concept_finalisation_allowed_in_ag10i: true,
  rights_provenance_source_check_allowed_in_ag10i: true,
  cost_reuse_decision_allowed_in_ag10i: true,
  ag10j_boundary_allowed_in_ag10i: true,

  image_generation_allowed_in_ag10i: false,
  external_image_api_call_allowed_in_ag10i: false,
  image_asset_creation_allowed_in_ag10i: false,
  rendered_image_creation_allowed_in_ag10i: false,
  visual_generation_allowed_in_ag10i: false,
  object_insertion_allowed_in_ag10i: false,
  article_mutation_allowed_in_ag10i: false,
  homepage_mutation_allowed_in_ag10i: false,
  css_js_mutation_allowed_in_ag10i: false,
  reference_insertion_allowed_in_ag10i: false,
  chart_generation_allowed_in_ag10i: false,
  infographic_generation_allowed_in_ag10i: false,
  table_generation_allowed_in_ag10i: false,
  figure_generation_allowed_in_ag10i: false,
  diagram_generation_allowed_in_ag10i: false,
  map_generation_allowed_in_ag10i: false,
  data_fetch_allowed_in_ag10i: false,
  dataset_creation_allowed_in_ag10i: false,
  live_url_fetch_allowed_in_ag10i: false,
  deployment_trigger_allowed_in_ag10i: false,
  production_jsonl_append_allowed_in_ag10i: false,
  database_write_allowed_in_ag10i: false,
  supabase_write_allowed_in_ag10i: false,
  backend_auth_supabase_activation_allowed_in_ag10i: false,
  public_publishing_operation_allowed_in_ag10i: false,
  ...stageControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10i: articleHash,
  selected_candidate_id: candidateSelection.candidate_id,
  selected_image_type: candidateSelection.selected_image_type,
  selected_family_id: candidateSelection.selected_family_id,
  object_selection_score: candidateSelection.object_selection_score.score_total,
  prompt_record_id: promptRecord.prompt_record_id,
  concept_template_candidate_id: conceptCandidate.concept_template_candidate_id,
  next_stage_id: "AG10J",
  next_stage_title: "Controlled Generated Image Asset Creation and Source Finalisation",
  next_stage_requires_explicit_approval: true,
  ...stageControls
};

const review = {
  module_id: "AG10I",
  title: "Generated Image Candidate Selection and Prompt Finalisation",
  status: "generated_image_candidate_prompt_finalised_not_generated",
  depends_on: ["AG10H", "AG10G", "AG10B", "AG10A"],
  generated_from: inputs,
  summary,
  plan_file: "data/content-intelligence/mutation-plans/ag10i-generated-image-candidate-selection-prompt-finalisation.json",
  candidate_selection_file: "data/content-intelligence/object-registry/ag10i-generated-image-candidate-selection-record.json",
  concept_candidate_file: "data/content-intelligence/object-registry/ag10i-reusable-image-concept-candidate-record.json",
  prompt_record_file: "data/content-intelligence/object-registry/ag10i-finalised-prompt-concept-record.json",
  rights_check_file: "data/content-intelligence/quality-registry/ag10i-rights-provenance-source-check-record.json",
  cost_reuse_file: "data/content-intelligence/quality-registry/ag10i-cost-reuse-decision-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag10i-generated-image-candidate-readiness.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag10i-to-ag10j-controlled-generated-image-asset-creation-source-finalisation-boundary.json",
  schema_file: "data/content-intelligence/schema/generated-image-candidate-selection-prompt-finalisation.schema.json",
  learning_file: "data/content-intelligence/learning/ag10i-generated-image-candidate-selection-prompt-finalisation-learning.json",
  closure_decision: {
    decision: "ag10i_candidate_prompt_finalised_pending_explicit_ag10j",
    proceed_to_ag10j_only_with_explicit_user_approval: true,
    image_generation_performed: false,
    external_image_api_call_performed: false,
    image_asset_creation_performed: false,
    object_insertion_performed: false,
    article_mutation_performed: false,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG10I",
  title: "Generated Image Candidate Selection and Prompt Finalisation Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "Image candidate selection must be separated from image generation.",
    "Prompt/concept finalisation can be recorded without calling any image-generation tool.",
    "The five-question inclusion gate must govern whether the image candidate should proceed.",
    "Rights, provenance, source/reference, cost and reuse checks must exist before asset creation.",
    "AG10J should create/finalise at most one controlled asset and must not insert it into the article."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG10I",
  title: "Generated Image Candidate Selection and Prompt Finalisation",
  status: "generated_image_candidate_prompt_finalised_not_generated",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag10i-generated-image-candidate-selection-prompt-finalisation.json",
    plan: "data/content-intelligence/mutation-plans/ag10i-generated-image-candidate-selection-prompt-finalisation.json",
    candidate_selection: "data/content-intelligence/object-registry/ag10i-generated-image-candidate-selection-record.json",
    concept_candidate: "data/content-intelligence/object-registry/ag10i-reusable-image-concept-candidate-record.json",
    prompt_record: "data/content-intelligence/object-registry/ag10i-finalised-prompt-concept-record.json",
    rights_check: "data/content-intelligence/quality-registry/ag10i-rights-provenance-source-check-record.json",
    cost_reuse: "data/content-intelligence/quality-registry/ag10i-cost-reuse-decision-record.json",
    readiness: "data/content-intelligence/quality-registry/ag10i-generated-image-candidate-readiness.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag10i-to-ag10j-controlled-generated-image-asset-creation-source-finalisation-boundary.json",
    schema: "data/content-intelligence/schema/generated-image-candidate-selection-prompt-finalisation.schema.json",
    learning: "data/content-intelligence/learning/ag10i-generated-image-candidate-selection-prompt-finalisation-learning.json",
    preview: "data/quality/ag10i-generated-image-candidate-selection-prompt-finalisation-preview.json",
    document: "docs/quality/AG10I_GENERATED_IMAGE_CANDIDATE_SELECTION_PROMPT_FINALISATION.md"
  },
  summary,
  ...stageControls
};

const preview = {
  module_id: "AG10I",
  preview_only: true,
  status: "generated_image_candidate_prompt_finalised_not_generated",
  summary,
  selected_candidate_preview: candidateSelection,
  prompt_preview: {
    prompt_record_id: promptRecord.prompt_record_id,
    prompt_intent: promptRecord.prompt_intent,
    caption_candidate: promptRecord.caption_candidate,
    alt_text_candidate: promptRecord.alt_text_candidate,
    credit_candidate: promptRecord.visible_credit_candidate
  },
  ag10j_handoff: boundary,
  ...stageControls
};

const doc = `# AG10I — Generated Image Candidate Selection and Prompt Finalisation

## Purpose

AG10I selects one generated/editorial image candidate and finalises the prompt/concept record for future controlled asset creation.

AG10I does not generate an image, call an external image API, create an asset, insert an object, mutate any article, modify CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## Selected Candidate

- Candidate ID: \`${candidateSelection.candidate_id}\`
- Image type: \`${candidateSelection.selected_image_type}\`
- Secondary type: \`${candidateSelection.secondary_image_type}\`
- Role: \`${candidateSelection.candidate_role}\`
- Concept: \`${conceptCandidate.concept_name}\`
- Selection score: \`${candidateSelection.object_selection_score.score_total}\`

## New Aspect Inclusion Gate

The candidate is allowed for candidate/prompt record only after answering the five gate questions:

1. Will this improve what a visitor sees?
2. Will this make articles more trustworthy?
3. Will this make Drishvara memorable?
4. Will this reduce future cost?
5. Will this create reusable intelligence?

## Prompt / Concept Record

AG10I records a finalised prompt/concept for future controlled generation, but no generation is performed in AG10I.

## Rights, Provenance and Cost

AG10I prepares rights/provenance/source checks and cost/reuse decision records. AG10J must verify these before any controlled asset creation.

## Next Stage

AG10J — Controlled Generated Image Asset Creation and Source Finalisation — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(planPath, plan);
writeJson(candidateSelectionPath, candidateSelection);
writeJson(conceptCandidatePath, conceptCandidate);
writeJson(promptRecordPath, promptRecord);
writeJson(rightsCheckPath, rightsCheck);
writeJson(costReusePath, costReuseDecision);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHashAfter !== articleHash) {
  throw new Error("AG10I attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG10I generated image candidate selection and prompt finalisation artifacts generated.");
console.log(`✅ Candidate selected: ${candidateSelection.candidate_id}`);
console.log(`✅ Selected image type: ${candidateSelection.selected_image_type}`);
console.log(`✅ Object selection score: ${candidateSelection.object_selection_score.score_total}`);
console.log("✅ Prompt/concept record finalised for future controlled generation only.");
console.log("✅ Rights/provenance/source and cost/reuse checks prepared.");
console.log("✅ No image generation, external image API call, asset creation, object insertion, article mutation, backend activation or publishing operation performed.");
console.log("✅ AG10J handoff created with explicit approval required.");
