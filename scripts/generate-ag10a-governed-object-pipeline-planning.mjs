import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag09zReview: "data/content-intelligence/quality-reviews/ag09z-final-chain-closure-next-system-handoff.json",
  ag09zClosure: "data/content-intelligence/closure-records/ag09z-final-chain-closure-next-system-handoff.json",
  ag09zReadiness: "data/content-intelligence/quality-registry/ag09z-final-public-experience-chain-readiness.json",
  ag09zHandoff: "data/content-intelligence/mutation-plans/ag09z-to-ag10a-governed-object-pipeline-planning-handoff.json",
  ag09hApproval: "data/content-intelligence/approval-registry/ag09h-final-editorial-publish-approval-decision.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag10a-governed-object-pipeline-planning.json");
const planPath = path.join(root, "data/content-intelligence/mutation-plans/ag10a-governed-object-pipeline-planning.json");
const taxonomyPath = path.join(root, "data/content-intelligence/object-registry/ag10a-object-taxonomy-registry.json");
const themeLayoutPath = path.join(root, "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json");
const ownershipPath = path.join(root, "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag10a-object-pipeline-planning-readiness.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag10a-to-ag10b-object-taxonomy-selection-doctrine-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/governed-object-pipeline-planning.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag10a-governed-object-pipeline-planning-learning.json");
const registryPath = path.join(root, "data/quality/ag10a-governed-object-pipeline-planning.json");
const previewPath = path.join(root, "data/quality/ag10a-governed-object-pipeline-planning-preview.json");
const docPath = path.join(root, "docs/quality/AG10A_GOVERNED_OBJECT_PIPELINE_PLANNING.md");

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
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG10A input ${name}: ${relativePath}`);
  }
}

const ag09zReview = readJson(inputs.ag09zReview);
const ag09zClosure = readJson(inputs.ag09zClosure);
const ag09zReadiness = readJson(inputs.ag09zReadiness);
const ag09zHandoff = readJson(inputs.ag09zHandoff);
const ag09hApproval = readJson(inputs.ag09hApproval);
const ag09cApply = readJson(inputs.ag09cApply);

if (ag09zReview.status !== "ag09_chain_closed_next_system_handoff_created") {
  throw new Error("AG10A requires AG09Z closure review.");
}

if (ag09zClosure.ag09_chain_closed !== true) {
  throw new Error("AG10A requires AG09 chain to be closed.");
}

if (ag09zReadiness.ready_for_future_object_pipeline !== true) {
  throw new Error("AG10A requires AG09Z future object pipeline readiness.");
}

if (ag09zHandoff.next_stage_id !== "AG10A" || ag09zHandoff.explicit_approval_required !== true) {
  throw new Error("AG10A requires AG09Z to AG10A handoff.");
}

if (ag09hApproval.final_editorial_publish_approved !== true) {
  throw new Error("AG10A requires AG09H final editorial approval.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) {
  throw new Error(`Selected article missing: ${selectedArticlePath}`);
}

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag09cApply.post_correction_hash) {
  throw new Error("AG10A selected article hash must match AG09C post-correction hash.");
}

const noMutationControls = {
  governed_object_pipeline_planning_only: true,
  selected_article_read_performed: true,
  article_mutation_performed_in_ag10a: false,
  selected_article_file_write_performed_in_ag10a: false,
  homepage_mutation_performed_in_ag10a: false,
  css_mutation_performed_in_ag10a: false,
  js_mutation_performed_in_ag10a: false,
  reference_insertion_performed_in_ag10a: false,
  reference_url_change_performed_in_ag10a: false,
  visual_generation_performed_in_ag10a: false,
  image_generation_performed_in_ag10a: false,
  image_asset_creation_performed_in_ag10a: false,
  image_insertion_performed_in_ag10a: false,
  infographic_generation_performed_in_ag10a: false,
  graph_generation_performed_in_ag10a: false,
  chart_generation_performed_in_ag10a: false,
  table_generation_performed_in_ag10a: false,
  figure_generation_performed_in_ag10a: false,
  map_generation_performed_in_ag10a: false,
  diagram_generation_performed_in_ag10a: false,
  object_insertion_performed_in_ag10a: false,
  live_url_fetch_performed_in_ag10a: false,
  deployment_trigger_performed_in_ag10a: false,
  production_jsonl_append_performed_in_ag10a: false,
  database_write_performed_in_ag10a: false,
  supabase_write_performed_in_ag10a: false,
  backend_auth_supabase_activation_performed_in_ag10a: false,
  rollback_execution_performed_in_ag10a: false,
  public_publishing_operation_performed_in_ag10a: false
};

const chartTaxonomy = [
  {
    family_id: "AG10A-CHART-FOUNDATIONAL",
    family_name: "Foundational Charts",
    object_types: [
      "bar_chart",
      "column_chart",
      "line_chart",
      "histogram",
      "pie_chart",
      "kpi_chart",
      "donut_chart"
    ],
    use_when: "Basic comparison, distribution, trend or single-metric display is required."
  },
  {
    family_id: "AG10A-CHART-COMPARISON",
    family_name: "Comparison Charts",
    object_types: [
      "treemap_chart",
      "pareto_chart",
      "radar_chart",
      "funnel_chart",
      "waterfall_chart",
      "stacked_bar_chart"
    ],
    use_when: "The article needs part-to-whole, staged comparison, layered comparison or ordered contribution analysis."
  },
  {
    family_id: "AG10A-CHART-RELATIONSHIP",
    family_name: "Relationship and Correlation Charts",
    object_types: [
      "scatter_plot",
      "bubble_chart",
      "sankey_chart",
      "area_chart"
    ],
    use_when: "The article needs relationship, correlation, flow, volume or comparative magnitude explanation."
  },
  {
    family_id: "AG10A-CHART-TIME",
    family_name: "Time and Trend Charts",
    object_types: [
      "step_chart",
      "candlestick_chart",
      "sparkline"
    ],
    use_when: "The article needs change over time, staged trend or compact time-series signal."
  },
  {
    family_id: "AG10A-CHART-GEO",
    family_name: "Geographic Insight Charts",
    object_types: [
      "geo_chart",
      "scatter_map",
      "geographic_bubble_chart",
      "heatmap_chart"
    ],
    use_when: "The article contains location, regional distribution, spatial concentration or geography-linked insights."
  },
  {
    family_id: "AG10A-CHART-SPECIAL",
    family_name: "Other Notable Charts and Graphs",
    object_types: [
      "box_plot_whisker_plot",
      "pictograph",
      "gantt_chart",
      "dot_plot"
    ],
    use_when: "The article requires distribution summary, project timeline, icon-based quantity display or dot-based comparison."
  }
];

const infographicTaxonomy = [
  "timeline_infographic",
  "process_flow_infographic",
  "step_by_step_infographic",
  "comparison_infographic",
  "before_after_infographic",
  "cause_effect_infographic",
  "pyramid_infographic",
  "hierarchy_infographic",
  "cycle_infographic",
  "decision_tree_infographic",
  "checklist_infographic",
  "roadmap_infographic",
  "milestone_infographic",
  "explainer_infographic",
  "policy_summary_infographic",
  "fact_sheet_infographic",
  "statistical_infographic",
  "problem_solution_infographic",
  "regional_insight_infographic",
  "storyboard_infographic"
];

const figureDiagramTaxonomy = [
  "concept_diagram",
  "framework_diagram",
  "architecture_diagram",
  "governance_flow_diagram",
  "system_diagram",
  "hierarchy_org_diagram",
  "network_diagram",
  "decision_flow",
  "logic_tree",
  "annotated_figure",
  "venn_diagram",
  "matrix_diagram",
  "quadrant_figure",
  "schematic_figure",
  "simplified_model_diagram",
  "process_figure",
  "explanatory_diagram",
  "swimlane_flow"
];

const tableTaxonomy = [
  "data_table",
  "comparison_table",
  "ranking_table",
  "timeline_table",
  "score_table",
  "summary_table",
  "feature_matrix",
  "facts_table",
  "policy_provision_table",
  "risk_matrix",
  "pros_cons_table",
  "glossary_table",
  "kpi_summary_table"
];

const mapTaxonomy = [
  "geographic_map",
  "regional_focus_map",
  "bubble_map",
  "heat_map",
  "location_insight_visual",
  "choropleth_thematic_map",
  "service_area_map",
  "route_or_flow_map"
];

const imageTaxonomy = [
  "hero_image",
  "section_support_image",
  "editorial_illustration",
  "conceptual_illustration",
  "data_backed_visual_cover",
  "photo_style_generated_image",
  "stylized_generated_image",
  "annotated_image",
  "quote_image_hybrid",
  "single_image_editorial_visual",
  "multi_panel_editorial_visual"
];

const supportObjectTaxonomy = [
  "pull_quote_block",
  "stat_card",
  "fact_box",
  "key_takeaway_box",
  "summary_panel",
  "definition_block",
  "faq_panel",
  "timeline_block",
  "evidence_box",
  "what_this_means_panel",
  "insight_callout",
  "highlight_banner",
  "number_based_summary_card",
  "comparison_card",
  "reader_lens_box"
];

const objectTaxonomy = {
  module_id: "AG10A",
  title: "Object Taxonomy Registry",
  status: "object_taxonomy_registry_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10a: articleHash,
  object_families: {
    charts_graphs_bi_visuals: chartTaxonomy,
    infographics: infographicTaxonomy,
    figures_diagrams: figureDiagramTaxonomy,
    tables_structured_objects: tableTaxonomy,
    maps_geographic_objects: mapTaxonomy,
    generated_and_editorial_images: imageTaxonomy,
    article_support_objects: supportObjectTaxonomy
  },
  selection_principle: "Objects are selected only when they add editorial, explanatory, data or reader-navigation value. Not every article receives every object type.",
  no_object_generation_in_ag10a: true,
  no_object_insertion_in_ag10a: true,
  ...noMutationControls
};

const themeLayoutDoctrine = {
  module_id: "AG10A",
  title: "Theme, Color and Layout Doctrine",
  status: "theme_color_layout_doctrine_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10a: articleHash,
  theme_source_rule: "Object visuals must inherit Drishvara site/article design language. Exact palette tokens should be resolved from current CSS/theme variables in a later validation stage before object generation.",
  palette_roles: [
    "primary_brand_tone",
    "secondary_brand_tone",
    "deep_background_tone",
    "surface_tone",
    "accent_highlight_tone",
    "muted_accent_tone",
    "text_primary_tone",
    "text_secondary_tone",
    "border_tone",
    "success_tone",
    "warning_tone",
    "risk_tone",
    "neutral_data_series_tone"
  ],
  color_discipline: [
    "Objects must look native to Drishvara article pages.",
    "Avoid random BI-dashboard colors unless formally mapped to theme tokens.",
    "Use accessible contrast for text, labels and legends.",
    "Use restrained, editorial color families rather than over-saturated visuals.",
    "Charts should use consistent series color logic across articles."
  ],
  layout_doctrine: [
    "Article text remains justified and readable.",
    "Objects must not deform article shape or reading column.",
    "Hero images may remain near the top where planned.",
    "Non-hero objects use controlled wrap only when suitable.",
    "Tables and figures should be centrally aligned in vertical reading flow.",
    "Charts and infographics should be centrally placed unless a governed side-card layout is approved.",
    "All objects require mobile-width and overflow checks.",
    "Captions, credits and alt text are mandatory wherever applicable."
  ],
  mobile_doctrine: [
    "No horizontal overflow.",
    "Responsive width limits required.",
    "Legends and labels must remain readable.",
    "Large tables need responsive wrappers.",
    "Maps/charts must have fallback summary text if mobile rendering is constrained."
  ],
  no_css_js_mutation_in_ag10a: true,
  ...noMutationControls
};

const ownershipRightsCreditDoctrine = {
  module_id: "AG10A",
  title: "Ownership, Rights, Provenance and Credit Doctrine",
  status: "ownership_rights_credit_doctrine_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10a: articleHash,
  ownership_principle: "Internally created SVGs, generated images, infographics, charts, tables, figures, diagrams, maps and article-support objects may be treated as Drishvara-owned/controlled assets when created through Drishvara workflow and recorded with provenance, source and approval metadata.",
  rights_controller_default: "Drishvara, represented by its legal owner/operator",
  default_credit_logic: [
    {
      asset_origin: "internal_svg_or_template",
      credit_display: "Visual: Drishvara",
      ownership_status: "drishvara_owned_or_controlled"
    },
    {
      asset_origin: "internal_chart_or_data_visualization",
      credit_display: "Data visualization: Drishvara",
      ownership_status: "drishvara_owned_or_controlled",
      source_note_required: true
    },
    {
      asset_origin: "internal_infographic",
      credit_display: "Infographic: Drishvara",
      ownership_status: "drishvara_owned_or_controlled",
      source_note_required: true
    },
    {
      asset_origin: "internal_table_or_structured_object",
      credit_display: "Table: Drishvara",
      ownership_status: "drishvara_owned_or_controlled",
      source_note_required: true
    },
    {
      asset_origin: "ai_assisted_generated_image",
      credit_display: "Generated visual: Drishvara",
      ownership_status: "drishvara_owned_or_controlled_subject_to_tool_terms_and_law",
      human_editorial_contribution_required: true
    },
    {
      asset_origin: "external_source_or_third_party_asset",
      credit_display: "As per licence/source attribution",
      ownership_status: "not_drishvara_owned_unless_licence_or_assignment_confirms",
      source_and_licence_required: true
    }
  ],
  asset_metadata_required_fields: [
    "asset_id",
    "asset_type",
    "creation_method",
    "created_by_or_generated_by",
    "rights_controller",
    "source_data_used",
    "external_assets_used",
    "licence_status",
    "credit_display",
    "caption",
    "alt_text",
    "human_editorial_contribution",
    "commercial_use_allowed",
    "copyright_confidence",
    "trademark_or_personality_risk",
    "asset_hash",
    "approved_for_drishvara_use"
  ],
  blocked_asset_sources: [
    "unverified stock images",
    "random web images without licence",
    "copyrighted maps or graphics without permission",
    "celebrity or identifiable person likeness without rights",
    "third-party brand logos unless legally allowed",
    "AI images imitating a living artist or protected style without permission"
  ],
  no_asset_creation_in_ag10a: true,
  ...noMutationControls
};

const costControlDoctrine = {
  planning_stage_separation: [
    "object_need_detection",
    "object_candidate_planning",
    "source_rights_credit_planning",
    "asset_creation",
    "controlled_insertion",
    "post_insertion_audit",
    "mobile_layout_audit",
    "final_object_closure"
  ],
  cost_rules: [
    "Avoid unnecessary GPT/image-generation/API calls.",
    "Prefer internal SVG, chart-code and template objects.",
    "Use candidate records before expensive generation.",
    "Reuse approved internal assets and templates where suitable.",
    "Do not re-run full article generation merely to add objects.",
    "Keep external generation as a later approved exception, not default."
  ],
  internal_capability_priority: [
    "SVG templates",
    "HTML/CSS-safe cards",
    "chart-code objects",
    "table templates",
    "reusable infographic layouts",
    "diagram templates",
    "manual editorial visual review before generation"
  ]
};

const selectionLogic = {
  article_object_selection_factors: [
    "article_type",
    "topic_type",
    "numeric_data_presence",
    "comparative_need",
    "timeline_need",
    "geographic_need",
    "explanatory_complexity",
    "reader_navigation_value",
    "source_data_quality",
    "mobile_feasibility",
    "layout_feasibility",
    "rights_credit_feasibility",
    "cost_feasibility"
  ],
  object_density_rule: "Use the minimum number of objects needed to improve comprehension. Do not overload the article.",
  article_examples: [
    {
      article_type: "policy_or_public_programme",
      likely_objects: ["hero_image", "comparison_table", "process_flow_infographic", "kpi_chart", "key_takeaway_box"]
    },
    {
      article_type: "spirituality_or_reflection",
      likely_objects: ["hero_image", "quote_card", "concept_diagram", "timeline_block", "definition_block"]
    },
    {
      article_type: "sports",
      likely_objects: ["hero_image", "line_chart", "ranking_table", "comparison_card", "stat_card"]
    },
    {
      article_type: "world_affairs",
      likely_objects: ["map", "timeline_infographic", "comparison_table", "explainer_infographic", "evidence_box"]
    }
  ]
};

const plan = {
  module_id: "AG10A",
  title: "Governed Object Pipeline Planning",
  status: "governed_object_pipeline_planning_created_not_executed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10a: articleHash,
  generated_from: inputs,
  object_taxonomy_file: "data/content-intelligence/object-registry/ag10a-object-taxonomy-registry.json",
  theme_color_layout_file: "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  ownership_rights_credit_file: "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  cost_control_doctrine: costControlDoctrine,
  selection_logic: selectionLogic,
  stage_principle: "AG10A creates the governed foundation only. Object generation and insertion are future controlled stages.",
  ...noMutationControls
};

const readiness = {
  module_id: "AG10A",
  title: "Object Pipeline Planning Readiness",
  status: "object_pipeline_planning_ready_pending_explicit_ag10b",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10a: articleHash,
  taxonomy_created: true,
  theme_color_layout_doctrine_created: true,
  ownership_rights_credit_doctrine_created: true,
  cost_control_doctrine_created: true,
  selection_logic_created: true,
  ready_for_ag10b: true,
  object_generation_ready: false,
  object_insertion_ready: false,
  article_mutation_ready: false,
  backend_activation_ready: false,
  ...noMutationControls
};

const boundary = {
  module_id: "AG10A",
  title: "AG10A to AG10B Object Taxonomy and Selection Doctrine Boundary",
  status: "ag10b_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10a: articleHash,
  next_stage_id: "AG10B",
  next_stage_title: "Object Taxonomy and Selection Doctrine",
  explicit_approval_required: true,
  ag10b_allowed_scope: [
    "Normalize object taxonomy.",
    "Define object-selection scoring logic.",
    "Define object need-detection rules by article type.",
    "Define chart/infographic/table/figure/map/image eligibility rules.",
    "Define credit/ownership metadata fields.",
    "Define cost-control gating before generation."
  ],
  ag10b_blocked_scope: [
    "No object generation.",
    "No image generation.",
    "No infographic/chart/table/figure/map creation.",
    "No object insertion.",
    "No article mutation.",
    "No CSS/JS mutation.",
    "No backend/Auth/Supabase/database activation.",
    "No publishing operation."
  ],
  ...noMutationControls
};

const schema = {
  module_id: "AG10A",
  title: "Governed Object Pipeline Planning Schema",
  status: "schema_object_pipeline_planning_only",
  object_taxonomy_allowed_in_ag10a: true,
  theme_color_layout_doctrine_allowed_in_ag10a: true,
  ownership_rights_credit_doctrine_allowed_in_ag10a: true,
  cost_control_doctrine_allowed_in_ag10a: true,
  selection_logic_allowed_in_ag10a: true,
  ag10b_boundary_allowed_in_ag10a: true,
  article_mutation_allowed_in_ag10a: false,
  homepage_mutation_allowed_in_ag10a: false,
  css_js_mutation_allowed_in_ag10a: false,
  reference_insertion_allowed_in_ag10a: false,
  visual_generation_allowed_in_ag10a: false,
  image_generation_allowed_in_ag10a: false,
  image_insertion_allowed_in_ag10a: false,
  infographic_generation_allowed_in_ag10a: false,
  graph_generation_allowed_in_ag10a: false,
  chart_generation_allowed_in_ag10a: false,
  table_generation_allowed_in_ag10a: false,
  figure_generation_allowed_in_ag10a: false,
  map_generation_allowed_in_ag10a: false,
  diagram_generation_allowed_in_ag10a: false,
  object_insertion_allowed_in_ag10a: false,
  live_url_fetch_allowed_in_ag10a: false,
  deployment_trigger_allowed_in_ag10a: false,
  production_jsonl_append_allowed_in_ag10a: false,
  database_write_allowed_in_ag10a: false,
  supabase_write_allowed_in_ag10a: false,
  backend_auth_supabase_activation_allowed_in_ag10a: false,
  rollback_execution_allowed_in_ag10a: false,
  public_publishing_operation_allowed_in_ag10a: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10a: articleHash,
  taxonomy_families_created: Object.keys(objectTaxonomy.object_families).length,
  chart_families_created: chartTaxonomy.length,
  infographic_types_created: infographicTaxonomy.length,
  figure_diagram_types_created: figureDiagramTaxonomy.length,
  table_types_created: tableTaxonomy.length,
  map_types_created: mapTaxonomy.length,
  image_types_created: imageTaxonomy.length,
  support_object_types_created: supportObjectTaxonomy.length,
  ownership_credit_doctrine_created: true,
  theme_layout_doctrine_created: true,
  cost_control_doctrine_created: true,
  next_stage_id: "AG10B",
  next_stage_title: "Object Taxonomy and Selection Doctrine",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const review = {
  module_id: "AG10A",
  title: "Governed Object Pipeline Planning",
  status: "governed_object_pipeline_planning_created_not_executed",
  depends_on: ["AG09Z", "AG09H", "AG09G"],
  generated_from: inputs,
  summary,
  plan_file: "data/content-intelligence/mutation-plans/ag10a-governed-object-pipeline-planning.json",
  taxonomy_file: "data/content-intelligence/object-registry/ag10a-object-taxonomy-registry.json",
  theme_layout_file: "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  ownership_rights_credit_file: "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  readiness_file: "data/content-intelligence/quality-registry/ag10a-object-pipeline-planning-readiness.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag10a-to-ag10b-object-taxonomy-selection-doctrine-boundary.json",
  schema_file: "data/content-intelligence/schema/governed-object-pipeline-planning.schema.json",
  learning_file: "data/content-intelligence/learning/ag10a-governed-object-pipeline-planning-learning.json",
  closure_decision: {
    decision: "ag10a_planning_created_pending_explicit_ag10b",
    proceed_to_ag10b_only_with_explicit_user_approval: true,
    object_generation_performed: false,
    object_insertion_performed: false,
    article_mutation_performed: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG10A",
  title: "Governed Object Pipeline Planning Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "Object enrichment must be governed separately from article prose generation.",
    "A broad object library is useful only if object selection remains controlled.",
    "Drishvara-created internal objects should carry ownership/provenance/credit metadata.",
    "Charts and infographics should inherit site theme and pass mobile/layout checks before insertion.",
    "Cost-control requires planning and candidate records before generation."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG10A",
  title: "Governed Object Pipeline Planning",
  status: "governed_object_pipeline_planning_created_not_executed",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag10a-governed-object-pipeline-planning.json",
    plan: "data/content-intelligence/mutation-plans/ag10a-governed-object-pipeline-planning.json",
    taxonomy: "data/content-intelligence/object-registry/ag10a-object-taxonomy-registry.json",
    theme_layout: "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
    ownership_rights_credit: "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
    readiness: "data/content-intelligence/quality-registry/ag10a-object-pipeline-planning-readiness.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag10a-to-ag10b-object-taxonomy-selection-doctrine-boundary.json",
    schema: "data/content-intelligence/schema/governed-object-pipeline-planning.schema.json",
    learning: "data/content-intelligence/learning/ag10a-governed-object-pipeline-planning-learning.json",
    preview: "data/quality/ag10a-governed-object-pipeline-planning-preview.json",
    document: "docs/quality/AG10A_GOVERNED_OBJECT_PIPELINE_PLANNING.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG10A",
  preview_only: true,
  status: "governed_object_pipeline_planning_created_not_executed",
  summary,
  object_taxonomy_preview: objectTaxonomy.object_families,
  ownership_credit_preview: ownershipRightsCreditDoctrine.default_credit_logic,
  ag10b_handoff: boundary,
  ...noMutationControls
};

const doc = `# AG10A — Governed Object Pipeline Planning

## Purpose

AG10A creates the governed planning foundation for Drishvara article object enrichment.

It covers charts, graphs, BI visuals, infographics, figures, diagrams, tables, maps, generated images and article-support objects.

AG10A is planning-only. It does not generate objects, insert objects, mutate articles, modify CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## Object Families

AG10A records governance scope for:

- Charts / graphs / BI visuals
- Infographics
- Figures / diagrams
- Tables / structured objects
- Maps / geographic objects
- Generated and editorial images
- Article-support objects

## Ownership and Credit Logic

Internally created objects may be treated as Drishvara-owned or Drishvara-controlled assets when created through the Drishvara workflow and recorded with provenance, source, rights, credit, hash and approval metadata.

Default credit patterns include:

- Visual: Drishvara
- Data visualization: Drishvara
- Infographic: Drishvara
- Table: Drishvara
- Generated visual: Drishvara

External assets require separate source, licence and attribution checks.

## Theme and Layout Doctrine

Objects must inherit Drishvara article theme, preserve justified readable text, avoid article deformation, remain mobile-safe and use controlled placement.

## Cost-Control Doctrine

AG10A requires candidate planning before expensive generation, prioritises internal SVG/chart/table/infographic templates, and blocks unnecessary external generation.

## Next Stage

AG10B — Object Taxonomy and Selection Doctrine — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(planPath, plan);
writeJson(taxonomyPath, objectTaxonomy);
writeJson(themeLayoutPath, themeLayoutDoctrine);
writeJson(ownershipPath, ownershipRightsCreditDoctrine);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHashAfter !== articleHash) {
  throw new Error("AG10A attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG10A governed object pipeline planning artifacts generated.");
console.log(`✅ Object families recorded: ${Object.keys(objectTaxonomy.object_families).length}`);
console.log("✅ Ownership/rights/credit doctrine created using Drishvara-controlled asset logic.");
console.log("✅ Theme, layout and cost-control doctrine created.");
console.log("✅ No object generation, object insertion, article mutation, backend activation or publishing operation performed.");
console.log("✅ AG10B handoff created with explicit approval required.");
