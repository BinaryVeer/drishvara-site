import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag10gReview: "data/content-intelligence/quality-reviews/ag10g-map-geographic-object-pipeline-planning.json",
  ag10gPlan: "data/content-intelligence/mutation-plans/ag10g-map-geographic-object-pipeline-planning.json",
  ag10gInclusionGate: "data/content-intelligence/quality-registry/ag10g-new-aspect-inclusion-gate.json",
  ag10gReadiness: "data/content-intelligence/quality-registry/ag10g-map-geographic-object-pipeline-readiness.json",
  ag10gBoundary: "data/content-intelligence/mutation-plans/ag10g-to-ag10h-generated-image-editorial-visual-pipeline-planning-boundary.json",
  ag10bNormalizedTaxonomy: "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
  ag10bScoring: "data/content-intelligence/object-registry/ag10b-object-selection-scoring-doctrine.json",
  ag10bEligibility: "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
  ag10aThemeLayout: "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  ag10aOwnership: "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag10h-generated-image-editorial-visual-pipeline-planning.json");
const planPath = path.join(root, "data/content-intelligence/mutation-plans/ag10h-generated-image-editorial-visual-pipeline-planning.json");
const familyRegistryPath = path.join(root, "data/content-intelligence/object-registry/ag10h-generated-image-editorial-visual-family-registry.json");
const promptSchemaPath = path.join(root, "data/content-intelligence/object-registry/ag10h-image-prompt-concept-schema.json");
const templateDoctrinePath = path.join(root, "data/content-intelligence/object-registry/ag10h-reusable-image-concept-render-instance-doctrine.json");
const visualDoctrinePath = path.join(root, "data/content-intelligence/object-registry/ag10h-image-theme-credit-mobile-doctrine.json");
const gateReadinessPath = path.join(root, "data/content-intelligence/quality-registry/ag10h-image-generation-gate-readiness.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag10h-generated-image-editorial-visual-pipeline-readiness.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag10h-to-ag10i-generated-image-candidate-selection-prompt-finalisation-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/generated-image-editorial-visual-pipeline-planning.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag10h-generated-image-editorial-visual-pipeline-planning-learning.json");
const registryPath = path.join(root, "data/quality/ag10h-generated-image-editorial-visual-pipeline-planning.json");
const previewPath = path.join(root, "data/quality/ag10h-generated-image-editorial-visual-pipeline-planning-preview.json");
const docPath = path.join(root, "docs/quality/AG10H_GENERATED_IMAGE_EDITORIAL_VISUAL_PIPELINE_PLANNING.md");

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
  if (!exists(relativePath)) throw new Error(`Missing required AG10H input ${name}: ${relativePath}`);
}

const ag10gReview = readJson(inputs.ag10gReview);
const ag10gPlan = readJson(inputs.ag10gPlan);
const ag10gInclusionGate = readJson(inputs.ag10gInclusionGate);
const ag10gReadiness = readJson(inputs.ag10gReadiness);
const ag10gBoundary = readJson(inputs.ag10gBoundary);
const ag10bNormalizedTaxonomy = readJson(inputs.ag10bNormalizedTaxonomy);
const ag10bScoring = readJson(inputs.ag10bScoring);
const ag10bEligibility = readJson(inputs.ag10bEligibility);
const ag10aThemeLayout = readJson(inputs.ag10aThemeLayout);
const ag10aOwnership = readJson(inputs.ag10aOwnership);
const ag09cApply = readJson(inputs.ag09cApply);

if (ag10gReview.status !== "map_geographic_object_pipeline_planning_created_not_executed") {
  throw new Error("AG10H requires AG10G review.");
}
if (ag10gReadiness.ready_for_ag10h !== true) {
  throw new Error("AG10H requires AG10G readiness.");
}
if (ag10gBoundary.next_stage_id !== "AG10H" || ag10gBoundary.explicit_approval_required !== true) {
  throw new Error("AG10H requires AG10G to AG10H explicit boundary.");
}
if (!Array.isArray(ag10gInclusionGate.gate_questions) || ag10gInclusionGate.gate_questions.length !== 5) {
  throw new Error("AG10H requires AG10G New Aspect Inclusion Gate.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag09cApply.post_correction_hash) {
  throw new Error("AG10H selected article hash must match AG09C post-correction hash.");
}

const noMutationControls = {
  generated_image_editorial_visual_pipeline_planning_only: true,
  selected_article_read_performed: true,
  article_mutation_performed_in_ag10h: false,
  selected_article_file_write_performed_in_ag10h: false,
  homepage_mutation_performed_in_ag10h: false,
  css_mutation_performed_in_ag10h: false,
  js_mutation_performed_in_ag10h: false,
  reference_insertion_performed_in_ag10h: false,
  reference_url_change_performed_in_ag10h: false,
  image_generation_performed_in_ag10h: false,
  external_image_api_call_performed_in_ag10h: false,
  image_asset_creation_performed_in_ag10h: false,
  rendered_image_creation_performed_in_ag10h: false,
  visual_generation_performed_in_ag10h: false,
  prompt_finalisation_performed_in_ag10h: false,
  candidate_image_selection_performed_in_ag10h: false,
  image_concept_template_creation_performed_in_ag10h: false,
  object_insertion_performed_in_ag10h: false,
  chart_generation_performed_in_ag10h: false,
  infographic_generation_performed_in_ag10h: false,
  table_generation_performed_in_ag10h: false,
  figure_generation_performed_in_ag10h: false,
  diagram_generation_performed_in_ag10h: false,
  map_generation_performed_in_ag10h: false,
  data_fetch_performed_in_ag10h: false,
  dataset_creation_performed_in_ag10h: false,
  live_url_fetch_performed_in_ag10h: false,
  deployment_trigger_performed_in_ag10h: false,
  production_jsonl_append_performed_in_ag10h: false,
  database_write_performed_in_ag10h: false,
  supabase_write_performed_in_ag10h: false,
  backend_auth_supabase_activation_performed_in_ag10h: false,
  rollback_execution_performed_in_ag10h: false,
  public_publishing_operation_performed_in_ag10h: false
};

const imageObjects = ag10bNormalizedTaxonomy.normalized_objects.filter(
  (item) => item.family === "generated_and_editorial_images"
);

const gateReadiness = {
  module_id: "AG10H",
  title: "Image Generation Gate Readiness",
  status: "image_generation_gate_readiness_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10h: articleHash,
  source_gate_file: inputs.ag10gInclusionGate,
  gate_questions_carried_forward: ag10gInclusionGate.gate_questions,
  ag10h_gate_assessment: {
    generated_image_editorial_visual_pipeline_planning: {
      visitor_value: "yes",
      trust_value: "yes_with_conditions",
      memory_value: "yes",
      cost_value: "yes_with_conditions",
      intelligence_value: "yes",
      inclusion_decision: "allowed_for_planning_only",
      condition_notes: [
        "Trust value depends on prompt provenance, rights metadata, source/reference separation, visible credit and avoiding misleading visuals before any future generation.",
        "Cost value depends on reusable concept templates, prompt templates, rendered-instance records and reuse checks before new generation."
      ]
    }
  },
  pass_rule: "Generated image/editorial visual features may proceed only when all five New Aspect Inclusion Gate questions are answered yes or yes_with_conditions.",
  no_image_generation_in_ag10h: true,
  no_external_image_api_call_in_ag10h: true,
  ...noMutationControls
};

const imageFamilies = [
  {
    family_id: "AG10H-IMG-HERO",
    family_name: "Hero and Cover Editorial Visuals",
    image_types: ["hero_image", "data_backed_visual_cover", "single_image_editorial_visual"],
    best_for: ["article identity", "first impression", "category tone", "visual memorability"],
    minimum_concept_inputs: ["article_type", "core_theme", "visual_metaphor", "aspect_ratio", "caption", "credit"],
    avoid_when: ["visual is decorative only", "concept is misleading", "asset duplicates existing visual without added value"]
  },
  {
    family_id: "AG10H-IMG-SECTION",
    family_name: "Section Support and Editorial Illustrations",
    image_types: ["section_support_image", "editorial_illustration"],
    best_for: ["section transition", "concept support", "article rhythm", "reader retention"],
    minimum_concept_inputs: ["section_context", "visual_role", "composition_hint", "caption", "alt_text"],
    avoid_when: ["breaks article flow", "too many visuals in article", "adds cost without comprehension value"]
  },
  {
    family_id: "AG10H-IMG-CONCEPTUAL",
    family_name: "Conceptual and Stylized Generated Visuals",
    image_types: ["conceptual_illustration", "stylized_generated_image"],
    best_for: ["abstract idea", "reflective article", "symbolic expression", "brand recall"],
    minimum_concept_inputs: ["concept", "symbolic_elements", "style_constraints", "theme_alignment", "negative_constraints"],
    avoid_when: ["style imitation risk", "unclear symbolism", "visual may look generic or unrelated"]
  },
  {
    family_id: "AG10H-IMG-PHOTO",
    family_name: "Photo-style Generated Visuals",
    image_types: ["photo_style_generated_image"],
    best_for: ["realistic scene support", "human-scale context", "policy/service situation illustration"],
    minimum_concept_inputs: ["scene_description", "setting", "subject_type", "realism_constraints", "rights_safety_note"],
    avoid_when: ["could imply real event/person", "sensitive identity risk", "requires documentary accuracy"]
  },
  {
    family_id: "AG10H-IMG-ANNOTATED",
    family_name: "Annotated and Quote Hybrid Visuals",
    image_types: ["annotated_image", "quote_image_hybrid"],
    best_for: ["explain visual element", "highlight insight", "brand quote card", "reader takeaway"],
    minimum_concept_inputs: ["base_visual_or_concept", "annotation_text", "quote_or_takeaway", "text_hierarchy", "credit"],
    avoid_when: ["text becomes unreadable", "quote source unclear", "annotation clutters visual"]
  },
  {
    family_id: "AG10H-IMG-MULTIPANEL",
    family_name: "Multi-panel Editorial Visuals",
    image_types: ["multi_panel_editorial_visual"],
    best_for: ["story sequence", "before-after logic", "multi-step editorial scene", "visual explainer"],
    minimum_concept_inputs: ["panel_count", "panel_sequence", "visual_storyline", "caption", "mobile_fallback_text"],
    avoid_when: ["too dense for mobile", "better suited as infographic", "requires excessive generation cost"]
  }
];

const familyRegistry = {
  module_id: "AG10H",
  title: "Generated Image and Editorial Visual Family Registry",
  status: "generated_image_editorial_visual_family_registry_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10h: articleHash,
  source_image_object_count: imageObjects.length,
  image_families: imageFamilies,
  universal_image_schema: {
    required_metadata: [
      "image_type",
      "article_id",
      "concept_template_id",
      "prompt_or_concept_record",
      "generation_method",
      "rights_controller",
      "ownership_status",
      "credit_display",
      "caption",
      "alt_text",
      "mobile_fallback_text",
      "layout_zone",
      "theme_variant",
      "reuse_eligibility_status"
    ],
    required_concept_fields: [
      "editorial_purpose",
      "core_message",
      "visual_metaphor_or_scene",
      "composition_guidance",
      "style_constraints",
      "negative_constraints",
      "source_reference_policy",
      "cost_control_note"
    ],
    optional_concept_fields: [
      "aspect_ratio",
      "dimension_target",
      "category_style",
      "symbolic_elements",
      "annotation_plan",
      "text_overlay_plan",
      "human_or_likeness_risk_note",
      "brand_or_logo_risk_note",
      "freshness_or_context_note",
      "fallback_summary"
    ]
  },
  no_image_generation_in_ag10h: true,
  no_external_image_api_call_in_ag10h: true,
  ...noMutationControls
};

const promptConceptSchema = {
  module_id: "AG10H",
  title: "Image Prompt and Concept Schema",
  status: "image_prompt_concept_schema_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10h: articleHash,
  schema_components: [
    {
      component_type: "concept_record",
      required_fields: ["concept_id", "article_id", "image_type", "editorial_purpose", "core_message"],
      optional_fields: ["article_section", "category", "reader_effect", "reuse_note"]
    },
    {
      component_type: "prompt_record",
      required_fields: ["prompt_id", "concept_id", "prompt_intent", "composition_guidance", "style_constraints"],
      optional_fields: ["negative_prompt_or_constraints", "aspect_ratio", "dimension_target", "seed_or_version_note"]
    },
    {
      component_type: "source_reference_record",
      required_fields: ["reference_policy", "external_reference_used", "source_or_inspiration_note"],
      optional_fields: ["source_url_or_record_id", "licence_note", "attribution_requirement"]
    },
    {
      component_type: "rights_provenance_record",
      required_fields: ["rights_controller", "ownership_status", "generation_method", "commercial_use_note"],
      optional_fields: ["tool_terms_note", "human_editorial_contribution", "third_party_risk_note"]
    },
    {
      component_type: "safety_risk_record",
      required_fields: ["human_likeness_risk", "brand_logo_risk", "artist_style_risk", "misleading_visual_risk"],
      optional_fields: ["mitigation_note", "review_required"]
    },
    {
      component_type: "rendered_visual_record",
      required_fields: ["rendered_visual_id", "concept_template_id", "asset_path", "asset_hash"],
      optional_fields: ["dimensions", "format", "version", "cost_marker"]
    },
    {
      component_type: "accessibility_record",
      required_fields: ["alt_text", "caption", "mobile_fallback_text"],
      optional_fields: ["long_description", "screen_reader_note"]
    },
    {
      component_type: "reuse_record",
      required_fields: ["reuse_status", "reuse_scope", "context_validity_note"],
      optional_fields: ["prior_article_ids", "expiry_or_refresh_note", "do_not_reuse_reason"]
    }
  ],
  validation_rules: [
    "Every image concept must pass the New Aspect Inclusion Gate before future generation.",
    "Prompt/concept records must separate editorial intent from rendered output.",
    "External references must not be copied without rights clearance.",
    "Avoid identifiable real-person likeness unless rights and consent are confirmed.",
    "Avoid third-party brand/logo usage unless legally allowed.",
    "Avoid living-artist style imitation or protected style risk.",
    "Every rendered visual must have caption, alt text, credit, hash and reuse status before insertion.",
    "No prompt is finalised in AG10H."
  ],
  ...noMutationControls
};

const templateDoctrine = {
  module_id: "AG10H",
  title: "Reusable Image Concept and Rendered Visual Instance Doctrine",
  status: "reusable_image_concept_template_doctrine_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10h: articleHash,
  pipeline_model: [
    "image_concept_template",
    "prompt_or_concept_binding",
    "rendered_visual_instance",
    "article_placement",
    "post_insertion_layout_audit",
    "reuse_log"
  ],
  distinction: {
    image_concept_template: "Reusable Drishvara-owned/controlled editorial visual concept such as hero cover, section illustration, conceptual visual or quote-image layout.",
    prompt_or_concept_binding: "Article-specific concept, scene, visual metaphor, text overlay, style constraints and negative constraints mapped into the template.",
    rendered_visual_instance: "Specific output produced from one concept template and one approved prompt/concept binding.",
    article_placement: "Controlled insertion zone, caption/credit handling, responsive behavior and fallback text in the article."
  },
  image_concept_template_fields: [
    "concept_template_id",
    "image_family",
    "image_type",
    "theme_variant",
    "composition_rule",
    "mobile_rule",
    "caption_rule",
    "credit_rule",
    "prompt_schema_required",
    "created_by",
    "rights_controller",
    "ownership_status",
    "reuse_allowed",
    "version",
    "template_hash"
  ],
  rendered_visual_fields: [
    "rendered_visual_id",
    "concept_template_id",
    "article_id",
    "prompt_record_id",
    "generation_method",
    "asset_path",
    "asset_hash",
    "dimensions",
    "caption",
    "credit",
    "alt_text",
    "mobile_fallback_text",
    "approval_status",
    "reuse_status",
    "rendered_hash"
  ],
  reuse_rules: [
    {
      reuse_type: "concept_template_reuse",
      rule: "Allowed broadly after template is approved, versioned and aligned with Drishvara visual identity."
    },
    {
      reuse_type: "rendered_visual_reuse",
      rule: "Allowed only when article context, rights/provenance, caption, credit, freshness and visual relevance remain valid."
    },
    {
      reuse_type: "prompt_pattern_reuse",
      rule: "Allowed only when it reduces cost, preserves quality and avoids repetitive-looking articles."
    }
  ],
  no_concept_template_creation_in_ag10h: true,
  no_rendered_visual_creation_in_ag10h: true,
  ...noMutationControls
};

const visualDoctrine = {
  module_id: "AG10H",
  title: "Image Theme, Ownership, Credit, Mobile and Cost Doctrine",
  status: "image_theme_credit_mobile_doctrine_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10h: articleHash,
  theme_source_status: ag10aThemeLayout.status,
  ownership_source_status: ag10aOwnership.status,
  image_theme_rules: [
    "Generated/editorial visuals must inherit Drishvara article theme and editorial tone.",
    "Visuals should feel intelligent, calm, memorable and native to Drishvara.",
    "Avoid random stock-like imagery and generic AI gloss.",
    "Use controlled composition, muted elegance and clear visual hierarchy.",
    "Hero, support, annotated and quote visuals must have distinct roles."
  ],
  ownership_rules: [
    "Internally generated/editorial visuals may be treated as Drishvara-owned/controlled assets when created through Drishvara workflow and recorded with provenance.",
    "External references, source images or third-party assets must remain separately attributed and rights-checked.",
    "AI-assisted images require prompt/concept lineage, human editorial contribution and generation-method metadata.",
    "Rendered visuals must have hash, version, caption, credit, alt text and reuse status."
  ],
  credit_rules: [
    {
      condition: "internally generated editorial visual",
      credit: "Visual: Drishvara."
    },
    {
      condition: "internally generated image",
      credit: "Generated visual: Drishvara."
    },
    {
      condition: "editorial illustration created through Drishvara workflow",
      credit: "Illustration: Drishvara."
    },
    {
      condition: "external reference/source influences the visual",
      credit: "Source/reference: [source]. Visual: Drishvara."
    }
  ],
  mobile_rules: [
    "No uncontrolled horizontal overflow.",
    "Visual must scale within article column.",
    "Text embedded inside visual must remain readable on mobile or be avoided.",
    "Multi-panel visuals require stacked mobile fallback.",
    "Caption and credit must remain visible and must not overlap the image."
  ],
  placement_rules: [
    "Hero image may be placed near the top as article identity.",
    "Section support visuals must not interrupt paragraph continuity without editorial reason.",
    "Article text should remain justified and readable around visual placement.",
    "Non-hero images should use central placement unless controlled wrap is specifically approved.",
    "Images must not deform article shape or mobile layout."
  ],
  cost_rules: [
    "Do not generate a new image if an approved reusable asset or concept template satisfies the article need.",
    "Prefer internal SVG/simple editorial visual workflows where sufficient.",
    "Expensive generation requires inclusion-gate pass and explicit future-stage approval.",
    "Prompt templates and concept templates must be reused before creating new ones.",
    "Rendered assets must be stored with cost marker and reuse eligibility."
  ],
  accessibility_rules: [
    "Alt text must describe the editorial purpose and main visual message.",
    "Captions must explain why the image matters to the article.",
    "Text inside images must not be essential unless repeated outside the image.",
    "Do not rely only on visual symbolism for core meaning."
  ],
  ...noMutationControls
};

const plan = {
  module_id: "AG10H",
  title: "Generated Image and Editorial Visual Pipeline Planning",
  status: "generated_image_editorial_visual_pipeline_planning_created_not_executed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10h: articleHash,
  generated_from: inputs,
  gate_readiness_file: "data/content-intelligence/quality-registry/ag10h-image-generation-gate-readiness.json",
  family_registry_file: "data/content-intelligence/object-registry/ag10h-generated-image-editorial-visual-family-registry.json",
  prompt_concept_schema_file: "data/content-intelligence/object-registry/ag10h-image-prompt-concept-schema.json",
  template_doctrine_file: "data/content-intelligence/object-registry/ag10h-reusable-image-concept-render-instance-doctrine.json",
  visual_doctrine_file: "data/content-intelligence/object-registry/ag10h-image-theme-credit-mobile-doctrine.json",
  carried_forward: {
    ag10g_plan_status: ag10gPlan.status,
    ag10g_inclusion_gate_status: ag10gInclusionGate.status,
    ag10b_scoring_status: ag10bScoring.status,
    ag10b_eligibility_status: ag10bEligibility.status
  },
  stage_principle: "AG10H plans generated image and editorial visual governance only. No image generation, API call, asset creation or insertion is performed.",
  ...noMutationControls
};

const readiness = {
  module_id: "AG10H",
  title: "Generated Image and Editorial Visual Pipeline Readiness",
  status: "generated_image_editorial_visual_pipeline_planning_ready_pending_explicit_ag10i",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10h: articleHash,
  image_generation_gate_readiness_created: true,
  image_family_registry_created: true,
  prompt_concept_schema_created: true,
  reusable_concept_render_instance_doctrine_created: true,
  theme_credit_mobile_cost_doctrine_created: true,
  ready_for_ag10i: true,
  image_generation_ready: false,
  external_image_api_call_ready: false,
  image_asset_creation_ready: false,
  prompt_finalisation_ready: false,
  candidate_selection_ready: false,
  object_insertion_ready: false,
  article_mutation_ready: false,
  backend_activation_ready: false,
  ...noMutationControls
};

const boundary = {
  module_id: "AG10H",
  title: "AG10H to AG10I Generated Image Candidate Selection and Prompt Finalisation Boundary",
  status: "ag10i_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10h: articleHash,
  next_stage_id: "AG10I",
  next_stage_title: "Generated Image Candidate Selection and Prompt Finalisation",
  explicit_approval_required: true,
  ag10i_allowed_scope: [
    "Select image/editorial visual candidate family for a controlled target article or article type.",
    "Apply New Aspect Inclusion Gate to the selected candidate.",
    "Prepare reusable concept candidate record.",
    "Prepare draft prompt/concept record.",
    "Prepare source/reference and rights/provenance checks.",
    "Prepare cost and reuse decision before any generation."
  ],
  ag10i_blocked_scope: [
    "No image generation.",
    "No external image API call.",
    "No image asset creation.",
    "No article mutation.",
    "No object insertion.",
    "No CSS/JS mutation.",
    "No database/Supabase/backend/Auth activation.",
    "No publishing operation."
  ],
  ...noMutationControls
};

const schema = {
  module_id: "AG10H",
  title: "Generated Image and Editorial Visual Pipeline Planning Schema",
  status: "schema_generated_image_editorial_visual_pipeline_planning_only",
  image_generation_gate_readiness_allowed_in_ag10h: true,
  image_family_registry_allowed_in_ag10h: true,
  prompt_concept_schema_allowed_in_ag10h: true,
  reusable_image_concept_doctrine_allowed_in_ag10h: true,
  image_theme_credit_mobile_doctrine_allowed_in_ag10h: true,
  ag10i_boundary_allowed_in_ag10h: true,
  article_mutation_allowed_in_ag10h: false,
  homepage_mutation_allowed_in_ag10h: false,
  css_js_mutation_allowed_in_ag10h: false,
  image_generation_allowed_in_ag10h: false,
  external_image_api_call_allowed_in_ag10h: false,
  image_asset_creation_allowed_in_ag10h: false,
  rendered_image_creation_allowed_in_ag10h: false,
  visual_generation_allowed_in_ag10h: false,
  prompt_finalisation_allowed_in_ag10h: false,
  candidate_image_selection_allowed_in_ag10h: false,
  image_concept_template_creation_allowed_in_ag10h: false,
  object_insertion_allowed_in_ag10h: false,
  chart_generation_allowed_in_ag10h: false,
  infographic_generation_allowed_in_ag10h: false,
  table_generation_allowed_in_ag10h: false,
  figure_generation_allowed_in_ag10h: false,
  diagram_generation_allowed_in_ag10h: false,
  map_generation_allowed_in_ag10h: false,
  data_fetch_allowed_in_ag10h: false,
  dataset_creation_allowed_in_ag10h: false,
  live_url_fetch_allowed_in_ag10h: false,
  deployment_trigger_allowed_in_ag10h: false,
  production_jsonl_append_allowed_in_ag10h: false,
  database_write_allowed_in_ag10h: false,
  supabase_write_allowed_in_ag10h: false,
  backend_auth_supabase_activation_allowed_in_ag10h: false,
  public_publishing_operation_allowed_in_ag10h: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10h: articleHash,
  source_image_object_count: imageObjects.length,
  image_family_count: imageFamilies.length,
  prompt_schema_component_count: promptConceptSchema.schema_components.length,
  gate_question_count: gateReadiness.gate_questions_carried_forward.length,
  template_pipeline_steps: templateDoctrine.pipeline_model.length,
  next_stage_id: "AG10I",
  next_stage_title: "Generated Image Candidate Selection and Prompt Finalisation",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const review = {
  module_id: "AG10H",
  title: "Generated Image and Editorial Visual Pipeline Planning",
  status: "generated_image_editorial_visual_pipeline_planning_created_not_executed",
  depends_on: ["AG10G", "AG10F", "AG10E", "AG10D", "AG10C", "AG10B", "AG10A"],
  generated_from: inputs,
  summary,
  gate_readiness_file: "data/content-intelligence/quality-registry/ag10h-image-generation-gate-readiness.json",
  plan_file: "data/content-intelligence/mutation-plans/ag10h-generated-image-editorial-visual-pipeline-planning.json",
  family_registry_file: "data/content-intelligence/object-registry/ag10h-generated-image-editorial-visual-family-registry.json",
  prompt_concept_schema_file: "data/content-intelligence/object-registry/ag10h-image-prompt-concept-schema.json",
  template_doctrine_file: "data/content-intelligence/object-registry/ag10h-reusable-image-concept-render-instance-doctrine.json",
  visual_doctrine_file: "data/content-intelligence/object-registry/ag10h-image-theme-credit-mobile-doctrine.json",
  readiness_file: "data/content-intelligence/quality-registry/ag10h-generated-image-editorial-visual-pipeline-readiness.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag10h-to-ag10i-generated-image-candidate-selection-prompt-finalisation-boundary.json",
  schema_file: "data/content-intelligence/schema/generated-image-editorial-visual-pipeline-planning.schema.json",
  learning_file: "data/content-intelligence/learning/ag10h-generated-image-editorial-visual-pipeline-planning-learning.json",
  closure_decision: {
    decision: "ag10h_generated_image_editorial_visual_planning_created_pending_explicit_ag10i",
    proceed_to_ag10i_only_with_explicit_user_approval: true,
    image_generation_performed: false,
    external_image_api_call_performed: false,
    image_asset_creation_performed: false,
    object_insertion_performed: false,
    article_mutation_performed: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG10H",
  title: "Generated Image and Editorial Visual Pipeline Planning Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "Generated images must be governed as reusable editorial visual concepts, not one-off decorative assets.",
    "Prompt/concept records must be separated from rendered visual instances.",
    "Drishvara-owned/controlled visual logic requires provenance, rights, credit, hash and reuse metadata.",
    "The New Aspect Inclusion Gate applies before adding any image-generation workflow.",
    "Image generation should occur only when visitor value, trust, memorability, future cost reduction and reusable intelligence are all satisfied."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG10H",
  title: "Generated Image and Editorial Visual Pipeline Planning",
  status: "generated_image_editorial_visual_pipeline_planning_created_not_executed",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag10h-generated-image-editorial-visual-pipeline-planning.json",
    plan: "data/content-intelligence/mutation-plans/ag10h-generated-image-editorial-visual-pipeline-planning.json",
    gate_readiness: "data/content-intelligence/quality-registry/ag10h-image-generation-gate-readiness.json",
    family_registry: "data/content-intelligence/object-registry/ag10h-generated-image-editorial-visual-family-registry.json",
    prompt_concept_schema: "data/content-intelligence/object-registry/ag10h-image-prompt-concept-schema.json",
    template_doctrine: "data/content-intelligence/object-registry/ag10h-reusable-image-concept-render-instance-doctrine.json",
    visual_doctrine: "data/content-intelligence/object-registry/ag10h-image-theme-credit-mobile-doctrine.json",
    readiness: "data/content-intelligence/quality-registry/ag10h-generated-image-editorial-visual-pipeline-readiness.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag10h-to-ag10i-generated-image-candidate-selection-prompt-finalisation-boundary.json",
    schema: "data/content-intelligence/schema/generated-image-editorial-visual-pipeline-planning.schema.json",
    learning: "data/content-intelligence/learning/ag10h-generated-image-editorial-visual-pipeline-planning-learning.json",
    preview: "data/quality/ag10h-generated-image-editorial-visual-pipeline-planning-preview.json",
    document: "docs/quality/AG10H_GENERATED_IMAGE_EDITORIAL_VISUAL_PIPELINE_PLANNING.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG10H",
  preview_only: true,
  status: "generated_image_editorial_visual_pipeline_planning_created_not_executed",
  summary,
  gate_preview: gateReadiness.gate_questions_carried_forward,
  image_families_preview: imageFamilies,
  prompt_schema_preview: promptConceptSchema.schema_components,
  template_pipeline_preview: templateDoctrine.pipeline_model,
  ag10i_handoff: boundary,
  ...noMutationControls
};

const doc = `# AG10H — Generated Image and Editorial Visual Pipeline Planning

## Purpose

AG10H defines the governed generated image and editorial visual pipeline for Drishvara.

It covers hero images, section support images, editorial illustrations, conceptual illustrations, data-backed visual covers, photo-style generated visuals, stylized visuals, annotated images, quote-image hybrids, prompt/concept schema, reusable image-concept doctrine, rendered visual instance doctrine, Drishvara ownership/credit rules, mobile/layout/accessibility rules, and cost-control gates.

AG10H is planning-only. It does not generate images, call external image APIs, create image assets, create rendered visuals, insert objects, mutate articles, modify CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## New Aspect Inclusion Gate

Before image-generation or editorial visual features proceed, Drishvara must ask:

1. Will this improve what a visitor sees?
2. Will this make articles more trustworthy?
3. Will this make Drishvara memorable?
4. Will this reduce future cost?
5. Will this create reusable intelligence?

AG10H records image/editorial visual pipeline planning as allowed for planning only.

## Image Families

AG10H records governance scope for hero/cover visuals, section-support visuals, conceptual/stylized visuals, photo-style visuals, annotated/quote hybrids and multi-panel visuals.

## Prompt and Concept Schema

Future generated visuals require concept, prompt, source/reference, rights/provenance, safety-risk, rendered visual, accessibility and reuse records.

## Template and Rendered Instance Model

Reusable image concept templates are separated from rendered visual instances.

Template reuse may be broad after approval. Rendered visual reuse is allowed only when article context, rights/provenance, caption, credit, freshness and visual relevance remain valid.

## Credit Logic

Default patterns include:

- Visual: Drishvara.
- Generated visual: Drishvara.
- Illustration: Drishvara.
- Source/reference: [source]. Visual: Drishvara.

## Next Stage

AG10I — Generated Image Candidate Selection and Prompt Finalisation — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(planPath, plan);
writeJson(gateReadinessPath, gateReadiness);
writeJson(familyRegistryPath, familyRegistry);
writeJson(promptSchemaPath, promptConceptSchema);
writeJson(templateDoctrinePath, templateDoctrine);
writeJson(visualDoctrinePath, visualDoctrine);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHashAfter !== articleHash) {
  throw new Error("AG10H attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG10H generated image and editorial visual pipeline planning artifacts generated.");
console.log(`✅ Image/editorial visual objects carried forward: ${imageObjects.length}`);
console.log(`✅ Image families recorded: ${imageFamilies.length}`);
console.log("✅ New Aspect Inclusion Gate applied to image/editorial visual pipeline planning.");
console.log("✅ Prompt/concept schema, reusable image concept doctrine and theme/credit/mobile doctrine created.");
console.log("✅ No image generation, external image API call, asset creation, object insertion, article mutation, backend activation or publishing operation performed.");
console.log("✅ AG10I handoff created with explicit approval required.");
