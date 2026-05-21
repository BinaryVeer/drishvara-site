import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag10cReview: "data/content-intelligence/quality-reviews/ag10c-data-visualization-chart-pipeline-planning.json",
  ag10cPlan: "data/content-intelligence/mutation-plans/ag10c-data-visualization-chart-pipeline-planning.json",
  ag10cDataDoctrine: "data/content-intelligence/data-registry/ag10c-data-source-dataset-inference-doctrine.json",
  ag10cTemplateDoctrine: "data/content-intelligence/object-registry/ag10c-reusable-chart-template-render-instance-doctrine.json",
  ag10cVisualDoctrine: "data/content-intelligence/object-registry/ag10c-chart-theme-credit-mobile-doctrine.json",
  ag10cReadiness: "data/content-intelligence/quality-registry/ag10c-data-visualization-pipeline-readiness.json",
  ag10cBoundary: "data/content-intelligence/mutation-plans/ag10c-to-ag10d-infographic-pipeline-planning-boundary.json",
  ag10bNormalizedTaxonomy: "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
  ag10bEligibility: "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
  ag10aThemeLayout: "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  ag10aOwnership: "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag10d-infographic-pipeline-planning.json");
const planPath = path.join(root, "data/content-intelligence/mutation-plans/ag10d-infographic-pipeline-planning.json");
const familyRegistryPath = path.join(root, "data/content-intelligence/object-registry/ag10d-infographic-family-structure-registry.json");
const contentSchemaPath = path.join(root, "data/content-intelligence/object-registry/ag10d-infographic-content-block-schema.json");
const templateDoctrinePath = path.join(root, "data/content-intelligence/object-registry/ag10d-reusable-infographic-template-render-instance-doctrine.json");
const visualDoctrinePath = path.join(root, "data/content-intelligence/object-registry/ag10d-infographic-theme-credit-mobile-doctrine.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag10d-infographic-pipeline-readiness.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag10d-to-ag10e-figure-diagram-pipeline-planning-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/infographic-pipeline-planning.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag10d-infographic-pipeline-planning-learning.json");
const registryPath = path.join(root, "data/quality/ag10d-infographic-pipeline-planning.json");
const previewPath = path.join(root, "data/quality/ag10d-infographic-pipeline-planning-preview.json");
const docPath = path.join(root, "docs/quality/AG10D_INFOGRAPHIC_PIPELINE_PLANNING.md");

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
  if (!exists(relativePath)) throw new Error(`Missing required AG10D input ${name}: ${relativePath}`);
}

const ag10cReview = readJson(inputs.ag10cReview);
const ag10cPlan = readJson(inputs.ag10cPlan);
const ag10cDataDoctrine = readJson(inputs.ag10cDataDoctrine);
const ag10cTemplateDoctrine = readJson(inputs.ag10cTemplateDoctrine);
const ag10cVisualDoctrine = readJson(inputs.ag10cVisualDoctrine);
const ag10cReadiness = readJson(inputs.ag10cReadiness);
const ag10cBoundary = readJson(inputs.ag10cBoundary);
const ag10bNormalizedTaxonomy = readJson(inputs.ag10bNormalizedTaxonomy);
const ag10bEligibility = readJson(inputs.ag10bEligibility);
const ag10aThemeLayout = readJson(inputs.ag10aThemeLayout);
const ag10aOwnership = readJson(inputs.ag10aOwnership);
const ag09cApply = readJson(inputs.ag09cApply);

if (ag10cReview.status !== "data_visualization_chart_pipeline_planning_created_not_executed") {
  throw new Error("AG10D requires AG10C review.");
}

if (ag10cReadiness.ready_for_ag10d !== true) {
  throw new Error("AG10D requires AG10C readiness.");
}

if (ag10cBoundary.next_stage_id !== "AG10D" || ag10cBoundary.explicit_approval_required !== true) {
  throw new Error("AG10D requires AG10C to AG10D explicit boundary.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag09cApply.post_correction_hash) {
  throw new Error("AG10D selected article hash must match AG09C post-correction hash.");
}

const noMutationControls = {
  infographic_pipeline_planning_only: true,
  selected_article_read_performed: true,
  article_mutation_performed_in_ag10d: false,
  selected_article_file_write_performed_in_ag10d: false,
  homepage_mutation_performed_in_ag10d: false,
  css_mutation_performed_in_ag10d: false,
  js_mutation_performed_in_ag10d: false,
  reference_insertion_performed_in_ag10d: false,
  reference_url_change_performed_in_ag10d: false,
  data_fetch_performed_in_ag10d: false,
  dataset_creation_performed_in_ag10d: false,
  infographic_generation_performed_in_ag10d: false,
  infographic_render_performed_in_ag10d: false,
  infographic_template_creation_performed_in_ag10d: false,
  rendered_infographic_creation_performed_in_ag10d: false,
  svg_asset_creation_performed_in_ag10d: false,
  image_asset_creation_performed_in_ag10d: false,
  object_insertion_performed_in_ag10d: false,
  visual_generation_performed_in_ag10d: false,
  image_generation_performed_in_ag10d: false,
  chart_generation_performed_in_ag10d: false,
  table_generation_performed_in_ag10d: false,
  figure_generation_performed_in_ag10d: false,
  map_generation_performed_in_ag10d: false,
  live_url_fetch_performed_in_ag10d: false,
  deployment_trigger_performed_in_ag10d: false,
  production_jsonl_append_performed_in_ag10d: false,
  database_write_performed_in_ag10d: false,
  supabase_write_performed_in_ag10d: false,
  backend_auth_supabase_activation_performed_in_ag10d: false,
  rollback_execution_performed_in_ag10d: false,
  public_publishing_operation_performed_in_ag10d: false
};

const infographicObjects = ag10bNormalizedTaxonomy.normalized_objects.filter(
  (item) => item.family === "infographics"
);

const infographicFamilies = [
  {
    family_id: "AG10D-INFO-TIMELINE",
    family_name: "Timeline and Milestone Infographics",
    infographic_types: ["timeline_infographic", "milestone_infographic", "roadmap_infographic"],
    best_for: ["historical sequence", "policy evolution", "project journey", "future roadmap"],
    minimum_content_blocks: ["title", "time_points", "short_labels", "caption", "credit"],
    avoid_when: ["dates are unclear", "sequence is speculative", "too many milestones for mobile"]
  },
  {
    family_id: "AG10D-INFO-PROCESS",
    family_name: "Process and Step Infographics",
    infographic_types: ["process_flow_infographic", "step_by_step_infographic", "cycle_infographic"],
    best_for: ["workflow", "methodology", "implementation stages", "repeatable process"],
    minimum_content_blocks: ["title", "steps", "connector_logic", "caption", "credit"],
    avoid_when: ["process order is not confirmed", "too many branches", "workflow is better explained as text"]
  },
  {
    family_id: "AG10D-INFO-COMPARISON",
    family_name: "Comparison and Before-After Infographics",
    infographic_types: ["comparison_infographic", "before_after_infographic", "problem_solution_infographic"],
    best_for: ["contrast", "policy alternatives", "change explanation", "problem-response framing"],
    minimum_content_blocks: ["title", "comparison_axes", "left_right_or_before_after_blocks", "caption", "credit"],
    avoid_when: ["comparison is biased", "sides are not comparable", "requires dense table instead"]
  },
  {
    family_id: "AG10D-INFO-STRUCTURE",
    family_name: "Hierarchy, Pyramid and Decision Infographics",
    infographic_types: ["pyramid_infographic", "hierarchy_infographic", "decision_tree_infographic"],
    best_for: ["governance structure", "layered model", "decision path", "priority ladder"],
    minimum_content_blocks: ["title", "levels_or_nodes", "relationship_labels", "caption", "credit"],
    avoid_when: ["relationships are not stable", "tree becomes unreadable on mobile"]
  },
  {
    family_id: "AG10D-INFO-EXPLAINER",
    family_name: "Explainer, Policy Summary and Fact-Sheet Infographics",
    infographic_types: ["explainer_infographic", "policy_summary_infographic", "fact_sheet_infographic", "checklist_infographic"],
    best_for: ["reader guidance", "policy simplification", "summary facts", "quick comprehension"],
    minimum_content_blocks: ["title", "key_points", "icons_or_sections", "source_note", "caption", "credit"],
    avoid_when: ["facts are not verified", "too much text", "summary would oversimplify complex issue"]
  },
  {
    family_id: "AG10D-INFO-DATA-REGIONAL",
    family_name: "Statistical and Regional Insight Infographics",
    infographic_types: ["statistical_infographic", "regional_insight_infographic"],
    best_for: ["data-backed insight", "regional pattern", "indicator summary", "high-level numeric story"],
    minimum_content_blocks: ["title", "metrics", "source_note", "data_context", "caption", "credit"],
    avoid_when: ["data source is weak", "better suited for chart/table", "numbers are outdated"]
  },
  {
    family_id: "AG10D-INFO-STORY",
    family_name: "Storyboard and Cause-Effect Infographics",
    infographic_types: ["storyboard_infographic", "cause_effect_infographic"],
    best_for: ["narrative chain", "cause and response", "reader journey", "impact pathway"],
    minimum_content_blocks: ["title", "story_frames_or_causal_links", "short_text", "caption", "credit"],
    avoid_when: ["causality is not supported", "storyline becomes editorially forced"]
  }
];

const familyRegistry = {
  module_id: "AG10D",
  title: "Infographic Family Structure Registry",
  status: "infographic_family_structure_registry_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10d: articleHash,
  source_infographic_object_count: infographicObjects.length,
  infographic_families: infographicFamilies,
  universal_infographic_schema: {
    required_metadata: [
      "infographic_type",
      "article_id",
      "object_template_id",
      "source_or_logic_record",
      "rights_controller",
      "credit_display",
      "caption",
      "alt_text",
      "mobile_fallback_text",
      "layout_zone",
      "theme_variant",
      "reuse_eligibility_status"
    ],
    required_content_fields: [
      "title",
      "core_message",
      "content_blocks",
      "block_order",
      "visual_structure",
      "source_note",
      "editorial_purpose"
    ],
    optional_content_fields: [
      "icons",
      "labels",
      "connectors",
      "metrics",
      "time_points",
      "comparison_axes",
      "annotations",
      "regional_context",
      "reader_instruction"
    ]
  },
  no_infographic_generation_in_ag10d: true,
  no_infographic_rendering_in_ag10d: true,
  ...noMutationControls
};

const contentBlockSchema = {
  module_id: "AG10D",
  title: "Infographic Content Block Schema",
  status: "infographic_content_block_schema_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10d: articleHash,
  block_types: [
    {
      block_type: "headline_block",
      required_fields: ["title", "short_context"],
      max_text_guidance: "Short, direct and readable on mobile."
    },
    {
      block_type: "step_block",
      required_fields: ["step_number", "label", "description"],
      max_text_guidance: "One short phrase or sentence per step."
    },
    {
      block_type: "metric_block",
      required_fields: ["metric_label", "value", "unit", "source_note"],
      max_text_guidance: "Use only verified numeric values."
    },
    {
      block_type: "comparison_block",
      required_fields: ["comparison_axis", "left_value", "right_value", "interpretation_note"],
      max_text_guidance: "Keep both sides balanced."
    },
    {
      block_type: "timeline_block",
      required_fields: ["period_or_date", "event_label", "event_note"],
      max_text_guidance: "Avoid long event descriptions."
    },
    {
      block_type: "hierarchy_block",
      required_fields: ["level", "node_label", "relationship_note"],
      max_text_guidance: "Keep hierarchy labels compact."
    },
    {
      block_type: "cause_effect_block",
      required_fields: ["cause", "effect", "evidence_or_context"],
      max_text_guidance: "Do not imply unsupported causation."
    },
    {
      block_type: "callout_block",
      required_fields: ["callout_label", "callout_text"],
      max_text_guidance: "Use sparingly for emphasis."
    }
  ],
  content_validation_rules: [
    "Each infographic must have one clear core message.",
    "Each block must be independently readable.",
    "Text density must remain mobile-safe.",
    "Facts, metrics and dates must map to a source or internal inference record.",
    "Causality must not be implied without evidence.",
    "Caption and credit must be present before future rendering."
  ],
  ...noMutationControls
};

const templateDoctrine = {
  module_id: "AG10D",
  title: "Reusable Infographic Template and Rendered Instance Doctrine",
  status: "reusable_infographic_template_doctrine_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10d: articleHash,
  pipeline_model: [
    "infographic_template",
    "content_block_binding",
    "rendered_infographic_instance",
    "article_placement",
    "post_insertion_layout_audit",
    "reuse_log"
  ],
  distinction: {
    infographic_template: "Reusable Drishvara-owned/controlled structure such as timeline, process flow, comparison or hierarchy layout.",
    content_block_binding: "Article-specific content, data, labels, steps or facts mapped into the template.",
    rendered_infographic_instance: "Specific output produced from one template and one content/data binding.",
    article_placement: "Controlled insertion zone and layout behavior in the article."
  },
  infographic_template_fields: [
    "infographic_template_id",
    "infographic_family",
    "infographic_type",
    "theme_variant",
    "layout_rule",
    "mobile_rule",
    "caption_rule",
    "credit_rule",
    "content_block_schema_required",
    "created_by",
    "rights_controller",
    "ownership_status",
    "reuse_allowed",
    "version",
    "template_hash"
  ],
  rendered_infographic_fields: [
    "rendered_infographic_id",
    "infographic_template_id",
    "article_id",
    "content_binding_id",
    "source_record_ids",
    "asset_path",
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
      reuse_type: "template_reuse",
      rule: "Allowed widely after template is approved and versioned."
    },
    {
      reuse_type: "rendered_infographic_reuse",
      rule: "Allowed only when content, data, source freshness, article context and rights/credit remain valid."
    }
  ],
  no_template_creation_in_ag10d: true,
  no_rendered_infographic_creation_in_ag10d: true,
  ...noMutationControls
};

const visualDoctrine = {
  module_id: "AG10D",
  title: "Infographic Theme, Credit, Mobile and Cost Doctrine",
  status: "infographic_theme_credit_mobile_doctrine_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10d: articleHash,
  theme_source_status: ag10aThemeLayout.status,
  ownership_source_status: ag10aOwnership.status,
  data_doctrine_source_status: ag10cDataDoctrine.status,
  infographic_theme_rules: [
    "Infographics must inherit Drishvara article theme and editorial tone.",
    "Infographics must not look like unrelated stock graphics.",
    "Use controlled typography, spacing and Drishvara-compatible color roles.",
    "Avoid dense text and cluttered iconography.",
    "Every infographic requires caption, credit, alt text and mobile fallback text."
  ],
  credit_rules: [
    {
      condition: "internally created infographic with Drishvara logic",
      credit: "Infographic: Drishvara."
    },
    {
      condition: "external source data used",
      credit: "Data source: [source]. Infographic: Drishvara."
    },
    {
      condition: "derived metrics or analysis used",
      credit: "Data source: [source]. Analysis and infographic: Drishvara."
    },
    {
      condition: "mixed sources used",
      credit: "Sources: [source list]. Infographic: Drishvara."
    }
  ],
  mobile_rules: [
    "No horizontal overflow.",
    "Infographics must remain readable at 360px to 430px mobile width.",
    "Long infographics should be split into stacked blocks.",
    "Complex infographic must include text fallback summary.",
    "Captions and credits must not overlap the visual."
  ],
  placement_rules: [
    "Central placement is preferred for infographics.",
    "Controlled wrap may be considered only for small support infographics.",
    "Infographic must not deform article shape.",
    "Infographic must not interrupt paragraph continuity without editorial reason.",
    "Hero visual and infographic roles must remain distinct."
  ],
  cost_rules: [
    "Prefer reusable SVG/HTML infographic templates before external generation.",
    "Generate only after candidate planning, source/credit review and layout feasibility pass.",
    "Avoid generating infographics where a table, chart or callout block is sufficient.",
    "Record template reuse before creating a new template."
  ],
  accessibility_rules: [
    "Alt text must summarize the infographic's main message.",
    "Fallback text must explain sequence or structure.",
    "Color must not be the only carrier of meaning.",
    "Icons must be decorative unless labelled."
  ],
  ...noMutationControls
};

const plan = {
  module_id: "AG10D",
  title: "Infographic Pipeline Planning",
  status: "infographic_pipeline_planning_created_not_executed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10d: articleHash,
  generated_from: inputs,
  family_registry_file: "data/content-intelligence/object-registry/ag10d-infographic-family-structure-registry.json",
  content_block_schema_file: "data/content-intelligence/object-registry/ag10d-infographic-content-block-schema.json",
  template_doctrine_file: "data/content-intelligence/object-registry/ag10d-reusable-infographic-template-render-instance-doctrine.json",
  visual_doctrine_file: "data/content-intelligence/object-registry/ag10d-infographic-theme-credit-mobile-doctrine.json",
  carried_forward: {
    ag10c_plan_status: ag10cPlan.status,
    ag10c_template_doctrine_status: ag10cTemplateDoctrine.status,
    ag10c_visual_doctrine_status: ag10cVisualDoctrine.status,
    ag10b_eligibility_status: ag10bEligibility.status
  },
  stage_principle: "AG10D plans infographic governance only. No infographic generation, rendering, SVG/image creation or insertion is performed.",
  ...noMutationControls
};

const readiness = {
  module_id: "AG10D",
  title: "Infographic Pipeline Readiness",
  status: "infographic_pipeline_planning_ready_pending_explicit_ag10e",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10d: articleHash,
  infographic_family_registry_created: true,
  content_block_schema_created: true,
  reusable_template_render_instance_doctrine_created: true,
  theme_credit_mobile_cost_doctrine_created: true,
  ready_for_ag10e: true,
  infographic_generation_ready: false,
  infographic_render_ready: false,
  svg_asset_creation_ready: false,
  object_insertion_ready: false,
  article_mutation_ready: false,
  backend_activation_ready: false,
  ...noMutationControls
};

const boundary = {
  module_id: "AG10D",
  title: "AG10D to AG10E Figure and Diagram Pipeline Planning Boundary",
  status: "ag10e_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10d: articleHash,
  next_stage_id: "AG10E",
  next_stage_title: "Figure and Diagram Pipeline Planning",
  explicit_approval_required: true,
  ag10e_allowed_scope: [
    "Define governed figure and diagram pipeline.",
    "Classify framework, architecture, governance flow, system, hierarchy and logic diagrams.",
    "Define diagram node/edge/content schema.",
    "Define reusable diagram template and rendered-instance doctrine.",
    "Define theme, ownership, credit, mobile and accessibility rules.",
    "Define cost-control gates."
  ],
  ag10e_blocked_scope: [
    "No figure generation.",
    "No diagram generation.",
    "No SVG/image asset creation.",
    "No object insertion.",
    "No article mutation.",
    "No CSS/JS mutation.",
    "No database/Supabase/backend/Auth activation.",
    "No publishing operation."
  ],
  ...noMutationControls
};

const schema = {
  module_id: "AG10D",
  title: "Infographic Pipeline Planning Schema",
  status: "schema_infographic_pipeline_planning_only",
  infographic_family_registry_allowed_in_ag10d: true,
  content_block_schema_allowed_in_ag10d: true,
  reusable_infographic_template_doctrine_allowed_in_ag10d: true,
  infographic_theme_credit_mobile_doctrine_allowed_in_ag10d: true,
  ag10e_boundary_allowed_in_ag10d: true,
  article_mutation_allowed_in_ag10d: false,
  homepage_mutation_allowed_in_ag10d: false,
  css_js_mutation_allowed_in_ag10d: false,
  data_fetch_allowed_in_ag10d: false,
  dataset_creation_allowed_in_ag10d: false,
  infographic_generation_allowed_in_ag10d: false,
  infographic_render_allowed_in_ag10d: false,
  infographic_template_creation_allowed_in_ag10d: false,
  rendered_infographic_creation_allowed_in_ag10d: false,
  svg_asset_creation_allowed_in_ag10d: false,
  image_asset_creation_allowed_in_ag10d: false,
  object_insertion_allowed_in_ag10d: false,
  visual_generation_allowed_in_ag10d: false,
  image_generation_allowed_in_ag10d: false,
  chart_generation_allowed_in_ag10d: false,
  table_generation_allowed_in_ag10d: false,
  figure_generation_allowed_in_ag10d: false,
  map_generation_allowed_in_ag10d: false,
  live_url_fetch_allowed_in_ag10d: false,
  deployment_trigger_allowed_in_ag10d: false,
  production_jsonl_append_allowed_in_ag10d: false,
  database_write_allowed_in_ag10d: false,
  supabase_write_allowed_in_ag10d: false,
  backend_auth_supabase_activation_allowed_in_ag10d: false,
  public_publishing_operation_allowed_in_ag10d: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10d: articleHash,
  source_infographic_object_count: infographicObjects.length,
  infographic_family_count: infographicFamilies.length,
  content_block_type_count: contentBlockSchema.block_types.length,
  template_pipeline_steps: templateDoctrine.pipeline_model.length,
  next_stage_id: "AG10E",
  next_stage_title: "Figure and Diagram Pipeline Planning",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const review = {
  module_id: "AG10D",
  title: "Infographic Pipeline Planning",
  status: "infographic_pipeline_planning_created_not_executed",
  depends_on: ["AG10C", "AG10B", "AG10A"],
  generated_from: inputs,
  summary,
  plan_file: "data/content-intelligence/mutation-plans/ag10d-infographic-pipeline-planning.json",
  family_registry_file: "data/content-intelligence/object-registry/ag10d-infographic-family-structure-registry.json",
  content_block_schema_file: "data/content-intelligence/object-registry/ag10d-infographic-content-block-schema.json",
  template_doctrine_file: "data/content-intelligence/object-registry/ag10d-reusable-infographic-template-render-instance-doctrine.json",
  visual_doctrine_file: "data/content-intelligence/object-registry/ag10d-infographic-theme-credit-mobile-doctrine.json",
  readiness_file: "data/content-intelligence/quality-registry/ag10d-infographic-pipeline-readiness.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag10d-to-ag10e-figure-diagram-pipeline-planning-boundary.json",
  schema_file: "data/content-intelligence/schema/infographic-pipeline-planning.schema.json",
  learning_file: "data/content-intelligence/learning/ag10d-infographic-pipeline-planning-learning.json",
  closure_decision: {
    decision: "ag10d_infographic_planning_created_pending_explicit_ag10e",
    proceed_to_ag10e_only_with_explicit_user_approval: true,
    infographic_generation_performed: false,
    infographic_render_performed: false,
    object_insertion_performed: false,
    article_mutation_performed: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG10D",
  title: "Infographic Pipeline Planning Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "Infographics need separate governance because they combine text, structure, data, layout and visual meaning.",
    "Reusable infographic templates should be separated from rendered infographic instances.",
    "Infographic text density must be controlled for mobile readability.",
    "Source, credit, ownership and fallback text must be recorded before future rendering.",
    "Infographics should be generated only when they add comprehension value beyond chart, table or callout objects."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG10D",
  title: "Infographic Pipeline Planning",
  status: "infographic_pipeline_planning_created_not_executed",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag10d-infographic-pipeline-planning.json",
    plan: "data/content-intelligence/mutation-plans/ag10d-infographic-pipeline-planning.json",
    family_registry: "data/content-intelligence/object-registry/ag10d-infographic-family-structure-registry.json",
    content_block_schema: "data/content-intelligence/object-registry/ag10d-infographic-content-block-schema.json",
    template_doctrine: "data/content-intelligence/object-registry/ag10d-reusable-infographic-template-render-instance-doctrine.json",
    visual_doctrine: "data/content-intelligence/object-registry/ag10d-infographic-theme-credit-mobile-doctrine.json",
    readiness: "data/content-intelligence/quality-registry/ag10d-infographic-pipeline-readiness.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag10d-to-ag10e-figure-diagram-pipeline-planning-boundary.json",
    schema: "data/content-intelligence/schema/infographic-pipeline-planning.schema.json",
    learning: "data/content-intelligence/learning/ag10d-infographic-pipeline-planning-learning.json",
    preview: "data/quality/ag10d-infographic-pipeline-planning-preview.json",
    document: "docs/quality/AG10D_INFOGRAPHIC_PIPELINE_PLANNING.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG10D",
  preview_only: true,
  status: "infographic_pipeline_planning_created_not_executed",
  summary,
  infographic_families_preview: infographicFamilies,
  content_block_schema_preview: contentBlockSchema.block_types,
  template_pipeline_preview: templateDoctrine.pipeline_model,
  ag10e_handoff: boundary,
  ...noMutationControls
};

const doc = `# AG10D — Infographic Pipeline Planning

## Purpose

AG10D defines the governed infographic pipeline for Drishvara.

It covers infographic family classification, content-block schema, reusable infographic templates, rendered infographic instances, source/credit rules, theme/layout rules, mobile fallback rules and cost-control gates.

AG10D is planning-only. It does not generate infographics, render SVGs/images, create assets, insert objects, mutate articles, modify CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## Infographic Families

AG10D records governance scope for timeline, process, comparison, hierarchy, explainer, statistical, regional, storyboard and cause-effect infographic families.

## Content Block Schema

Infographics are composed from governed content blocks such as headline, step, metric, comparison, timeline, hierarchy, cause-effect and callout blocks.

## Template and Rendered Instance Model

Reusable infographic templates are separated from rendered infographic instances.

Template reuse may be broad after approval. Rendered infographic reuse is allowed only when content, data, source freshness, article context and rights/credit remain valid.

## Credit Logic

Default patterns include:

- Infographic: Drishvara.
- Data source: [source]. Infographic: Drishvara.
- Data source: [source]. Analysis and infographic: Drishvara.
- Sources: [source list]. Infographic: Drishvara.

## Next Stage

AG10E — Figure and Diagram Pipeline Planning — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(planPath, plan);
writeJson(familyRegistryPath, familyRegistry);
writeJson(contentSchemaPath, contentBlockSchema);
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
  throw new Error("AG10D attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG10D infographic pipeline planning artifacts generated.");
console.log(`✅ Infographic objects carried forward: ${infographicObjects.length}`);
console.log(`✅ Infographic families recorded: ${infographicFamilies.length}`);
console.log("✅ Content-block schema, reusable template doctrine and theme/credit/mobile doctrine created.");
console.log("✅ No infographic generation, asset creation, object insertion, article mutation, backend activation or publishing operation performed.");
console.log("✅ AG10E handoff created with explicit approval required.");
