import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag10aReview: "data/content-intelligence/quality-reviews/ag10a-governed-object-pipeline-planning.json",
  ag10aPlan: "data/content-intelligence/mutation-plans/ag10a-governed-object-pipeline-planning.json",
  ag10aTaxonomy: "data/content-intelligence/object-registry/ag10a-object-taxonomy-registry.json",
  ag10aThemeLayout: "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  ag10aOwnership: "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  ag10aReadiness: "data/content-intelligence/quality-registry/ag10a-object-pipeline-planning-readiness.json",
  ag10aBoundary: "data/content-intelligence/mutation-plans/ag10a-to-ag10b-object-taxonomy-selection-doctrine-boundary.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag10b-object-taxonomy-selection-doctrine.json");
const doctrinePath = path.join(root, "data/content-intelligence/mutation-plans/ag10b-object-taxonomy-selection-doctrine.json");
const normalizedTaxonomyPath = path.join(root, "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json");
const scoringDoctrinePath = path.join(root, "data/content-intelligence/object-registry/ag10b-object-selection-scoring-doctrine.json");
const articleMappingPath = path.join(root, "data/content-intelligence/object-registry/ag10b-article-type-object-mapping.json");
const eligibilityPath = path.join(root, "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag10b-object-selection-readiness.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag10b-to-ag10c-data-visualization-pipeline-planning-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/object-taxonomy-selection-doctrine.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag10b-object-taxonomy-selection-doctrine-learning.json");
const registryPath = path.join(root, "data/quality/ag10b-object-taxonomy-selection-doctrine.json");
const previewPath = path.join(root, "data/quality/ag10b-object-taxonomy-selection-doctrine-preview.json");
const docPath = path.join(root, "docs/quality/AG10B_OBJECT_TAXONOMY_SELECTION_DOCTRINE.md");

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
  if (!exists(relativePath)) throw new Error(`Missing required AG10B input ${name}: ${relativePath}`);
}

const ag10aReview = readJson(inputs.ag10aReview);
const ag10aPlan = readJson(inputs.ag10aPlan);
const ag10aTaxonomy = readJson(inputs.ag10aTaxonomy);
const ag10aThemeLayout = readJson(inputs.ag10aThemeLayout);
const ag10aOwnership = readJson(inputs.ag10aOwnership);
const ag10aReadiness = readJson(inputs.ag10aReadiness);
const ag10aBoundary = readJson(inputs.ag10aBoundary);
const ag09cApply = readJson(inputs.ag09cApply);

if (ag10aReview.status !== "governed_object_pipeline_planning_created_not_executed") {
  throw new Error("AG10B requires AG10A planning review.");
}
if (ag10aReadiness.ready_for_ag10b !== true) {
  throw new Error("AG10B requires AG10A readiness.");
}
if (ag10aBoundary.next_stage_id !== "AG10B" || ag10aBoundary.explicit_approval_required !== true) {
  throw new Error("AG10B requires AG10A to AG10B explicit boundary.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);
if (articleHash !== ag09cApply.post_correction_hash) {
  throw new Error("AG10B selected article hash must match AG09C post-correction hash.");
}

const noMutationControls = {
  object_taxonomy_selection_doctrine_only: true,
  selected_article_read_performed: true,
  article_mutation_performed_in_ag10b: false,
  selected_article_file_write_performed_in_ag10b: false,
  homepage_mutation_performed_in_ag10b: false,
  css_mutation_performed_in_ag10b: false,
  js_mutation_performed_in_ag10b: false,
  reference_insertion_performed_in_ag10b: false,
  reference_url_change_performed_in_ag10b: false,
  visual_generation_performed_in_ag10b: false,
  image_generation_performed_in_ag10b: false,
  image_asset_creation_performed_in_ag10b: false,
  image_insertion_performed_in_ag10b: false,
  infographic_generation_performed_in_ag10b: false,
  graph_generation_performed_in_ag10b: false,
  chart_generation_performed_in_ag10b: false,
  table_generation_performed_in_ag10b: false,
  figure_generation_performed_in_ag10b: false,
  map_generation_performed_in_ag10b: false,
  diagram_generation_performed_in_ag10b: false,
  object_insertion_performed_in_ag10b: false,
  live_url_fetch_performed_in_ag10b: false,
  deployment_trigger_performed_in_ag10b: false,
  production_jsonl_append_performed_in_ag10b: false,
  database_write_performed_in_ag10b: false,
  supabase_write_performed_in_ag10b: false,
  backend_auth_supabase_activation_performed_in_ag10b: false,
  rollback_execution_performed_in_ag10b: false,
  public_publishing_operation_performed_in_ag10b: false
};

function flattenChartTypes(taxonomy) {
  return (taxonomy.object_families?.charts_graphs_bi_visuals || []).flatMap((family) => {
    return (family.object_types || []).map((objectType) => ({
      object_type: objectType,
      family: "charts_graphs_bi_visuals",
      source_family_id: family.family_id,
      source_family_name: family.family_name,
      use_when: family.use_when
    }));
  });
}

function listToRecords(list, family, defaultUseWhen) {
  return (list || []).map((objectType) => ({
    object_type: objectType,
    family,
    use_when: defaultUseWhen
  }));
}

const sourceFamilies = ag10aTaxonomy.object_families || {};
const normalizedObjects = [
  ...flattenChartTypes(ag10aTaxonomy),
  ...listToRecords(sourceFamilies.infographics, "infographics", "Use when visual synthesis or stepwise explanation improves reader comprehension."),
  ...listToRecords(sourceFamilies.figures_diagrams, "figures_diagrams", "Use when conceptual, governance, system or framework structure needs explanation."),
  ...listToRecords(sourceFamilies.tables_structured_objects, "tables_structured_objects", "Use when structured comparison, ranking, glossary, facts or matrix display is needed."),
  ...listToRecords(sourceFamilies.maps_geographic_objects, "maps_geographic_objects", "Use when geographic or spatial meaning is central to the article."),
  ...listToRecords(sourceFamilies.generated_and_editorial_images, "generated_and_editorial_images", "Use when article identity, tone or conceptual entry point needs visual support."),
  ...listToRecords(sourceFamilies.article_support_objects, "article_support_objects", "Use when reader navigation, emphasis or summarisation improves article readability.")
].map((item, index) => ({
  object_id: `AG10B-OBJ-${String(index + 1).padStart(3, "0")}`,
  ...item,
  generation_allowed_in_ag10b: false,
  insertion_allowed_in_ag10b: false,
  requires_source_or_prompt_record: true,
  requires_credit_record: true,
  requires_alt_text_or_accessibility_text: true,
  requires_mobile_check_before_insertion: true,
  requires_layout_check_before_insertion: true
}));

const normalizedTaxonomy = {
  module_id: "AG10B",
  title: "Normalized Object Taxonomy",
  status: "normalized_object_taxonomy_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10b: articleHash,
  source_taxonomy_file: inputs.ag10aTaxonomy,
  object_count: normalizedObjects.length,
  normalized_objects: normalizedObjects,
  family_counts: normalizedObjects.reduce((acc, item) => {
    acc[item.family] = (acc[item.family] || 0) + 1;
    return acc;
  }, {}),
  ...noMutationControls
};

const scoringDoctrine = {
  module_id: "AG10B",
  title: "Object Selection Scoring Doctrine",
  status: "object_selection_scoring_doctrine_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10b: articleHash,
  scoring_dimensions: [
    {
      dimension: "editorial_relevance",
      weight: 25,
      meaning: "How directly the object improves understanding of the article."
    },
    {
      dimension: "evidence_or_data_strength",
      weight: 15,
      meaning: "Whether the object is supported by reliable data, source text or approved internal reasoning."
    },
    {
      dimension: "reader_comprehension_value",
      weight: 15,
      meaning: "Whether the object makes complex content easier to understand."
    },
    {
      dimension: "layout_feasibility",
      weight: 12,
      meaning: "Whether the object can fit article width without deforming the page."
    },
    {
      dimension: "mobile_feasibility",
      weight: 12,
      meaning: "Whether the object remains readable on mobile."
    },
    {
      dimension: "theme_fit",
      weight: 8,
      meaning: "Whether the object can inherit Drishvara color, tone and visual language."
    },
    {
      dimension: "rights_credit_confidence",
      weight: 8,
      meaning: "Whether ownership, source, licence and credit can be safely recorded."
    },
    {
      dimension: "cost_efficiency",
      weight: 5,
      meaning: "Whether the object can be created using reusable/internal methods before expensive generation."
    }
  ],
  decision_bands: [
    {
      score_min: 80,
      score_max: 100,
      decision: "strong_candidate_for_future_controlled_generation_or_insertion"
    },
    {
      score_min: 60,
      score_max: 79,
      decision: "candidate_requires_editorial_review"
    },
    {
      score_min: 40,
      score_max: 59,
      decision: "weak_candidate_hold"
    },
    {
      score_min: 0,
      score_max: 39,
      decision: "do_not_generate_or_insert"
    }
  ],
  disqualification_rules: [
    "No source or evidence for data-backed object.",
    "Unclear ownership, licence or credit.",
    "Likely mobile overflow or unreadable labels.",
    "Object duplicates article prose without adding comprehension value.",
    "Object would require expensive generation without clear editorial benefit.",
    "Object may deform article layout or break justified reading flow."
  ],
  ...noMutationControls
};

const articleTypeMapping = {
  module_id: "AG10B",
  title: "Article Type to Object Mapping",
  status: "article_type_object_mapping_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10b: articleHash,
  mappings: [
    {
      article_type: "policy_public_programme",
      preferred_objects: ["hero_image", "process_flow_infographic", "comparison_table", "kpi_chart", "timeline_infographic", "key_takeaway_box"],
      avoid_unless_needed: ["pie_chart", "photo_style_generated_image"],
      rationale: "Policy articles benefit from flow, comparison, timeline and evidence-oriented objects."
    },
    {
      article_type: "world_affairs",
      preferred_objects: ["map", "timeline_infographic", "comparison_table", "explainer_infographic", "evidence_box", "line_chart"],
      avoid_unless_needed: ["donut_chart", "pictograph"],
      rationale: "World affairs pieces often need geography, chronology and comparative context."
    },
    {
      article_type: "spirituality_reflection",
      preferred_objects: ["hero_image", "quote_image_hybrid", "concept_diagram", "definition_block", "timeline_block", "reader_lens_box"],
      avoid_unless_needed: ["scatter_plot", "candlestick_chart", "waterfall_chart"],
      rationale: "Reflective articles need symbolic and conceptual support rather than dense BI visuals."
    },
    {
      article_type: "sports",
      preferred_objects: ["line_chart", "ranking_table", "stat_card", "comparison_card", "sparkline", "bar_chart"],
      avoid_unless_needed: ["policy_summary_infographic", "risk_matrix"],
      rationale: "Sports articles often benefit from trend, ranking, form and comparison objects."
    },
    {
      article_type: "media_society",
      preferred_objects: ["timeline_infographic", "concept_diagram", "comparison_table", "stat_card", "quote_image_hybrid"],
      avoid_unless_needed: ["geo_chart", "candlestick_chart"],
      rationale: "Media/social pieces benefit from narrative structure and interpretive diagrams."
    },
    {
      article_type: "daily_weekly_exclusive_episode",
      preferred_objects: ["hero_image", "key_takeaway_box", "timeline_block", "reader_lens_box", "quote_image_hybrid"],
      avoid_unless_needed: ["heavy_table", "dense_chart"],
      rationale: "Exclusive episodes need consistent identity and readable recurring structure."
    }
  ],
  density_rules: [
    {
      article_length_band: "short_under_800_words",
      suggested_object_count: "0_to_1"
    },
    {
      article_length_band: "standard_800_to_1500_words",
      suggested_object_count: "1_to_2"
    },
    {
      article_length_band: "long_form_1500_to_2200_words",
      suggested_object_count: "2_to_4"
    },
    {
      article_length_band: "deep_research_above_2200_words",
      suggested_object_count: "3_to_6_only_if_layout_safe"
    }
  ],
  ...noMutationControls
};

const eligibilityRules = {
  module_id: "AG10B",
  title: "Object Eligibility Rules",
  status: "object_eligibility_rules_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10b: articleHash,
  universal_eligibility_rules: [
    "Object must have clear editorial purpose.",
    "Object must map to an approved object family.",
    "Object must preserve article shape and reading column.",
    "Object must be mobile-safe or have a fallback summary.",
    "Object must follow Drishvara theme/color doctrine.",
    "Object must carry caption/credit/alt text/accessibility metadata where applicable.",
    "Object must pass source/rights/ownership review before generation or insertion.",
    "Object must pass cost-control review before expensive generation."
  ],
  family_eligibility_rules: [
    {
      family: "charts_graphs_bi_visuals",
      required_inputs: ["validated_data_or_structured_values", "chart_type_reason", "axis_or_label_plan", "source_note"],
      blocked_if: ["no_data_source", "misleading_scale", "labels_unreadable_on_mobile"]
    },
    {
      family: "infographics",
      required_inputs: ["story_structure", "section_sequence", "caption", "credit", "mobile_width_plan"],
      blocked_if: ["too_text_heavy", "unclear_flow", "requires_unverified_facts"]
    },
    {
      family: "figures_diagrams",
      required_inputs: ["concept_structure", "label_plan", "caption", "credit"],
      blocked_if: ["too_complex_for_mobile", "duplicates_article_without_new_value"]
    },
    {
      family: "tables_structured_objects",
      required_inputs: ["row_column_schema", "source_or_internal_logic", "responsive_wrapper_plan"],
      blocked_if: ["too_wide_without_mobile_strategy", "unverified_values"]
    },
    {
      family: "maps_geographic_objects",
      required_inputs: ["geo_scope", "map_source_or_internal_geometry", "rights_status", "mobile_fallback_text"],
      blocked_if: ["unlicensed_map_base", "unclear_region_boundary", "mobile_unreadable"]
    },
    {
      family: "generated_and_editorial_images",
      required_inputs: ["prompt_or_concept_record", "rights_controller", "caption", "credit", "alt_text"],
      blocked_if: ["third_party_likeness_risk", "brand_or_logo_risk", "style_imitation_risk"]
    },
    {
      family: "article_support_objects",
      required_inputs: ["object_text", "placement_reason", "layout_style"],
      blocked_if: ["clutters_article", "repeats_nearby_text_without_value"]
    }
  ],
  ...noMutationControls
};

const doctrine = {
  module_id: "AG10B",
  title: "Object Taxonomy and Selection Doctrine",
  status: "object_taxonomy_selection_doctrine_created_not_executed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10b: articleHash,
  generated_from: inputs,
  source_ag10a_plan_status: ag10aPlan.status,
  normalized_taxonomy_file: "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
  scoring_doctrine_file: "data/content-intelligence/object-registry/ag10b-object-selection-scoring-doctrine.json",
  article_mapping_file: "data/content-intelligence/object-registry/ag10b-article-type-object-mapping.json",
  eligibility_rules_file: "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
  selection_doctrine_summary: {
    object_generation_allowed: false,
    object_insertion_allowed: false,
    next_stage_focus: "AG10C data visualization and chart/graph pipeline planning",
    selection_requires_score: true,
    selection_requires_rights_credit_review: true,
    selection_requires_layout_mobile_review: true,
    selection_requires_cost_review: true
  },
  source_doctrines_carried_forward: {
    theme_layout_status: ag10aThemeLayout.status,
    ownership_credit_status: ag10aOwnership.status
  },
  ...noMutationControls
};

const readiness = {
  module_id: "AG10B",
  title: "Object Selection Readiness",
  status: "object_selection_doctrine_ready_pending_explicit_ag10c",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10b: articleHash,
  normalized_taxonomy_created: true,
  scoring_doctrine_created: true,
  article_type_mapping_created: true,
  eligibility_rules_created: true,
  ready_for_ag10c: true,
  object_generation_ready: false,
  object_insertion_ready: false,
  article_mutation_ready: false,
  backend_activation_ready: false,
  ...noMutationControls
};

const boundary = {
  module_id: "AG10B",
  title: "AG10B to AG10C Data Visualization Pipeline Planning Boundary",
  status: "ag10c_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10b: articleHash,
  next_stage_id: "AG10C",
  next_stage_title: "Data Visualization and Chart/Graph Pipeline Planning",
  explicit_approval_required: true,
  ag10c_allowed_scope: [
    "Define governed chart/graph/data visualization pipeline.",
    "Classify BI-style chart families by data requirement.",
    "Define chart-data input schemas.",
    "Define chart theme token mapping.",
    "Define chart caption/source/credit/alt-text rules.",
    "Define chart mobile fallback rules.",
    "Define chart cost-control and reusable template approach."
  ],
  ag10c_blocked_scope: [
    "No chart generation.",
    "No graph generation.",
    "No data visualization rendering.",
    "No article mutation.",
    "No object insertion.",
    "No CSS/JS mutation.",
    "No database/Supabase/backend/Auth activation.",
    "No publishing operation."
  ],
  ...noMutationControls
};

const schema = {
  module_id: "AG10B",
  title: "Object Taxonomy and Selection Doctrine Schema",
  status: "schema_object_taxonomy_selection_doctrine_only",
  normalized_taxonomy_allowed_in_ag10b: true,
  scoring_doctrine_allowed_in_ag10b: true,
  article_type_mapping_allowed_in_ag10b: true,
  eligibility_rules_allowed_in_ag10b: true,
  ag10c_boundary_allowed_in_ag10b: true,
  article_mutation_allowed_in_ag10b: false,
  homepage_mutation_allowed_in_ag10b: false,
  css_js_mutation_allowed_in_ag10b: false,
  visual_generation_allowed_in_ag10b: false,
  image_generation_allowed_in_ag10b: false,
  object_generation_allowed_in_ag10b: false,
  object_insertion_allowed_in_ag10b: false,
  chart_generation_allowed_in_ag10b: false,
  graph_generation_allowed_in_ag10b: false,
  table_generation_allowed_in_ag10b: false,
  infographic_generation_allowed_in_ag10b: false,
  figure_generation_allowed_in_ag10b: false,
  map_generation_allowed_in_ag10b: false,
  live_url_fetch_allowed_in_ag10b: false,
  deployment_trigger_allowed_in_ag10b: false,
  production_jsonl_append_allowed_in_ag10b: false,
  database_write_allowed_in_ag10b: false,
  supabase_write_allowed_in_ag10b: false,
  backend_auth_supabase_activation_allowed_in_ag10b: false,
  public_publishing_operation_allowed_in_ag10b: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10b: articleHash,
  normalized_object_count: normalizedObjects.length,
  scoring_dimensions_count: scoringDoctrine.scoring_dimensions.length,
  article_type_mappings_count: articleTypeMapping.mappings.length,
  eligibility_family_rules_count: eligibilityRules.family_eligibility_rules.length,
  next_stage_id: "AG10C",
  next_stage_title: "Data Visualization and Chart/Graph Pipeline Planning",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const review = {
  module_id: "AG10B",
  title: "Object Taxonomy and Selection Doctrine",
  status: "object_taxonomy_selection_doctrine_created_not_executed",
  depends_on: ["AG10A", "AG09Z"],
  generated_from: inputs,
  summary,
  doctrine_file: "data/content-intelligence/mutation-plans/ag10b-object-taxonomy-selection-doctrine.json",
  normalized_taxonomy_file: "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
  scoring_doctrine_file: "data/content-intelligence/object-registry/ag10b-object-selection-scoring-doctrine.json",
  article_mapping_file: "data/content-intelligence/object-registry/ag10b-article-type-object-mapping.json",
  eligibility_rules_file: "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
  readiness_file: "data/content-intelligence/quality-registry/ag10b-object-selection-readiness.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag10b-to-ag10c-data-visualization-pipeline-planning-boundary.json",
  schema_file: "data/content-intelligence/schema/object-taxonomy-selection-doctrine.schema.json",
  learning_file: "data/content-intelligence/learning/ag10b-object-taxonomy-selection-doctrine-learning.json",
  closure_decision: {
    decision: "ag10b_selection_doctrine_created_pending_explicit_ag10c",
    proceed_to_ag10c_only_with_explicit_user_approval: true,
    object_generation_performed: false,
    object_insertion_performed: false,
    article_mutation_performed: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG10B",
  title: "Object Taxonomy and Selection Doctrine Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "A broad object taxonomy must be normalized before generation stages.",
    "Object selection should be score-based and not based on visual preference alone.",
    "Chart/graph planning should be separated from actual chart rendering.",
    "Article type mapping helps prevent irrelevant objects from being inserted.",
    "Rights, credit, mobile layout and cost checks must be applied before generation."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG10B",
  title: "Object Taxonomy and Selection Doctrine",
  status: "object_taxonomy_selection_doctrine_created_not_executed",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag10b-object-taxonomy-selection-doctrine.json",
    doctrine: "data/content-intelligence/mutation-plans/ag10b-object-taxonomy-selection-doctrine.json",
    normalized_taxonomy: "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
    scoring_doctrine: "data/content-intelligence/object-registry/ag10b-object-selection-scoring-doctrine.json",
    article_mapping: "data/content-intelligence/object-registry/ag10b-article-type-object-mapping.json",
    eligibility_rules: "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
    readiness: "data/content-intelligence/quality-registry/ag10b-object-selection-readiness.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag10b-to-ag10c-data-visualization-pipeline-planning-boundary.json",
    schema: "data/content-intelligence/schema/object-taxonomy-selection-doctrine.schema.json",
    learning: "data/content-intelligence/learning/ag10b-object-taxonomy-selection-doctrine-learning.json",
    preview: "data/quality/ag10b-object-taxonomy-selection-doctrine-preview.json",
    document: "docs/quality/AG10B_OBJECT_TAXONOMY_SELECTION_DOCTRINE.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG10B",
  preview_only: true,
  status: "object_taxonomy_selection_doctrine_created_not_executed",
  summary,
  article_type_mapping_preview: articleTypeMapping.mappings,
  scoring_dimensions_preview: scoringDoctrine.scoring_dimensions,
  ag10c_handoff: boundary,
  ...noMutationControls
};

const doc = `# AG10B — Object Taxonomy and Selection Doctrine

## Purpose

AG10B normalizes the AG10A object catalogue into a selection doctrine.

It defines how Drishvara should decide which charts, graphs, infographics, figures, tables, maps, generated images and article-support objects are suitable for a given article.

AG10B is doctrine-only. It does not generate objects, insert objects, mutate articles, modify CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## Selection Logic

Object selection is based on editorial relevance, evidence strength, reader comprehension value, layout feasibility, mobile feasibility, theme fit, rights/credit confidence and cost efficiency.

## Article-Type Mapping

AG10B maps article types to likely object families so that objects are selected for purpose, not decoration.

## Eligibility Rules

Each object family must satisfy source, credit, layout, mobile and cost-control rules before any future generation or insertion stage.

## Next Stage

AG10C — Data Visualization and Chart/Graph Pipeline Planning — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(doctrinePath, doctrine);
writeJson(normalizedTaxonomyPath, normalizedTaxonomy);
writeJson(scoringDoctrinePath, scoringDoctrine);
writeJson(articleMappingPath, articleTypeMapping);
writeJson(eligibilityPath, eligibilityRules);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(fs.readFileSync(path.join(root, selectedArticlePath), "utf8"));
if (articleHashAfter !== articleHash) {
  throw new Error("AG10B attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG10B object taxonomy and selection doctrine artifacts generated.");
console.log(`✅ Normalized objects recorded: ${normalizedObjects.length}`);
console.log(`✅ Article-type mappings recorded: ${articleTypeMapping.mappings.length}`);
console.log("✅ Selection scoring, eligibility and AG10C handoff created.");
console.log("✅ No object generation, object insertion, article mutation, backend activation or publishing operation performed.");
