import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag10bReview: "data/content-intelligence/quality-reviews/ag10b-object-taxonomy-selection-doctrine.json",
  ag10bDoctrine: "data/content-intelligence/mutation-plans/ag10b-object-taxonomy-selection-doctrine.json",
  ag10bNormalizedTaxonomy: "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
  ag10bScoring: "data/content-intelligence/object-registry/ag10b-object-selection-scoring-doctrine.json",
  ag10bEligibility: "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
  ag10bReadiness: "data/content-intelligence/quality-registry/ag10b-object-selection-readiness.json",
  ag10bBoundary: "data/content-intelligence/mutation-plans/ag10b-to-ag10c-data-visualization-pipeline-planning-boundary.json",
  ag10aThemeLayout: "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  ag10aOwnership: "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag10c-data-visualization-chart-pipeline-planning.json");
const planPath = path.join(root, "data/content-intelligence/mutation-plans/ag10c-data-visualization-chart-pipeline-planning.json");
const chartRegistryPath = path.join(root, "data/content-intelligence/object-registry/ag10c-chart-family-data-schema-registry.json");
const dataDoctrinePath = path.join(root, "data/content-intelligence/data-registry/ag10c-data-source-dataset-inference-doctrine.json");
const templateDoctrinePath = path.join(root, "data/content-intelligence/object-registry/ag10c-reusable-chart-template-render-instance-doctrine.json");
const visualDoctrinePath = path.join(root, "data/content-intelligence/object-registry/ag10c-chart-theme-credit-mobile-doctrine.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag10c-data-visualization-pipeline-readiness.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag10c-to-ag10d-infographic-pipeline-planning-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/data-visualization-chart-pipeline-planning.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag10c-data-visualization-chart-pipeline-planning-learning.json");
const registryPath = path.join(root, "data/quality/ag10c-data-visualization-chart-pipeline-planning.json");
const previewPath = path.join(root, "data/quality/ag10c-data-visualization-chart-pipeline-planning-preview.json");
const docPath = path.join(root, "docs/quality/AG10C_DATA_VISUALIZATION_CHART_PIPELINE_PLANNING.md");

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
  if (!exists(relativePath)) throw new Error(`Missing required AG10C input ${name}: ${relativePath}`);
}

const ag10bReview = readJson(inputs.ag10bReview);
const ag10bDoctrine = readJson(inputs.ag10bDoctrine);
const ag10bNormalizedTaxonomy = readJson(inputs.ag10bNormalizedTaxonomy);
const ag10bScoring = readJson(inputs.ag10bScoring);
const ag10bEligibility = readJson(inputs.ag10bEligibility);
const ag10bReadiness = readJson(inputs.ag10bReadiness);
const ag10bBoundary = readJson(inputs.ag10bBoundary);
const ag10aThemeLayout = readJson(inputs.ag10aThemeLayout);
const ag10aOwnership = readJson(inputs.ag10aOwnership);
const ag09cApply = readJson(inputs.ag09cApply);

if (ag10bReview.status !== "object_taxonomy_selection_doctrine_created_not_executed") {
  throw new Error("AG10C requires AG10B review.");
}

if (ag10bReadiness.ready_for_ag10c !== true) {
  throw new Error("AG10C requires AG10B readiness.");
}

if (ag10bBoundary.next_stage_id !== "AG10C" || ag10bBoundary.explicit_approval_required !== true) {
  throw new Error("AG10C requires AG10B to AG10C explicit boundary.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag09cApply.post_correction_hash) {
  throw new Error("AG10C selected article hash must match AG09C post-correction hash.");
}

const noMutationControls = {
  data_visualization_chart_pipeline_planning_only: true,
  selected_article_read_performed: true,
  article_mutation_performed_in_ag10c: false,
  selected_article_file_write_performed_in_ag10c: false,
  homepage_mutation_performed_in_ag10c: false,
  css_mutation_performed_in_ag10c: false,
  js_mutation_performed_in_ag10c: false,
  reference_insertion_performed_in_ag10c: false,
  reference_url_change_performed_in_ag10c: false,
  data_fetch_performed_in_ag10c: false,
  external_dataset_download_performed_in_ag10c: false,
  dataset_creation_performed_in_ag10c: false,
  dataset_mutation_performed_in_ag10c: false,
  chart_generation_performed_in_ag10c: false,
  graph_generation_performed_in_ag10c: false,
  data_visualization_render_performed_in_ag10c: false,
  chart_template_creation_performed_in_ag10c: false,
  rendered_object_creation_performed_in_ag10c: false,
  object_insertion_performed_in_ag10c: false,
  visual_generation_performed_in_ag10c: false,
  image_generation_performed_in_ag10c: false,
  image_insertion_performed_in_ag10c: false,
  infographic_generation_performed_in_ag10c: false,
  table_generation_performed_in_ag10c: false,
  figure_generation_performed_in_ag10c: false,
  map_generation_performed_in_ag10c: false,
  live_url_fetch_performed_in_ag10c: false,
  deployment_trigger_performed_in_ag10c: false,
  production_jsonl_append_performed_in_ag10c: false,
  database_write_performed_in_ag10c: false,
  supabase_write_performed_in_ag10c: false,
  backend_auth_supabase_activation_performed_in_ag10c: false,
  rollback_execution_performed_in_ag10c: false,
  public_publishing_operation_performed_in_ag10c: false
};

const chartObjects = ag10bNormalizedTaxonomy.normalized_objects.filter(
  (item) => item.family === "charts_graphs_bi_visuals"
);

const chartFamilies = [
  {
    family_id: "AG10C-CHART-FOUNDATIONAL",
    family_name: "Foundational Charts",
    chart_types: ["bar_chart", "column_chart", "line_chart", "histogram", "pie_chart", "kpi_chart", "donut_chart"],
    primary_data_shape: "category_value_or_series",
    minimum_required_fields: ["label", "value", "unit", "source_note"],
    best_for: ["basic comparison", "single metric", "distribution", "simple trend"],
    avoid_when: ["too many categories", "unverified values", "mobile labels become unreadable"]
  },
  {
    family_id: "AG10C-CHART-COMPARISON",
    family_name: "Comparison Charts",
    chart_types: ["treemap_chart", "pareto_chart", "radar_chart", "funnel_chart", "waterfall_chart", "stacked_bar_chart"],
    primary_data_shape: "multi_category_or_stage_comparison",
    minimum_required_fields: ["category", "value", "group_or_stage", "unit", "source_note"],
    best_for: ["part-to-whole", "ranked contribution", "stage movement", "layered comparison"],
    avoid_when: ["weak category logic", "misleading part-to-whole relation", "dense labels"]
  },
  {
    family_id: "AG10C-CHART-RELATIONSHIP",
    family_name: "Relationship and Correlation Charts",
    chart_types: ["scatter_plot", "bubble_chart", "sankey_chart", "area_chart"],
    primary_data_shape: "x_y_or_flow_series",
    minimum_required_fields: ["x_value", "y_value", "label", "unit", "source_note"],
    best_for: ["correlation", "relationship", "flow", "volume movement"],
    avoid_when: ["small sample without explanation", "unclear relationship", "causation implied from correlation"]
  },
  {
    family_id: "AG10C-CHART-TIME",
    family_name: "Time and Trend Charts",
    chart_types: ["step_chart", "candlestick_chart", "sparkline"],
    primary_data_shape: "date_or_period_series",
    minimum_required_fields: ["period", "value", "unit", "source_note"],
    best_for: ["trend", "time movement", "compact repeated signals", "periodic change"],
    avoid_when: ["missing dates", "mixed periodicity", "unclear time zone or period basis"]
  },
  {
    family_id: "AG10C-CHART-GEO",
    family_name: "Geographic Insight Charts",
    chart_types: ["geo_chart", "scatter_map", "geographic_bubble_chart", "heatmap_chart"],
    primary_data_shape: "location_value_or_coordinate_series",
    minimum_required_fields: ["location", "value", "unit", "geo_scope", "source_note"],
    best_for: ["regional comparison", "location density", "spatial distribution"],
    avoid_when: ["unverified boundaries", "unlicensed base map", "mobile unreadability"]
  },
  {
    family_id: "AG10C-CHART-SPECIAL",
    family_name: "Special Charts",
    chart_types: ["box_plot_whisker_plot", "pictograph", "gantt_chart", "dot_plot"],
    primary_data_shape: "specialized_series_or_interval_data",
    minimum_required_fields: ["label", "value_or_interval", "unit", "source_note"],
    best_for: ["distribution", "project timeline", "icon-based quantity", "dot comparison"],
    avoid_when: ["reader unfamiliarity", "requires heavy explanation", "labels cannot fit mobile"]
  }
];

const chartFamilyRegistry = {
  module_id: "AG10C",
  title: "Chart Family Data Schema Registry",
  status: "chart_family_data_schema_registry_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10c: articleHash,
  source_chart_object_count: chartObjects.length,
  chart_families: chartFamilies,
  universal_chart_data_schema: {
    required_metadata: [
      "dataset_id",
      "dataset_version",
      "source_id",
      "source_name",
      "source_url_or_reference",
      "source_access_date",
      "licence_or_usage_note",
      "data_owner_or_publisher",
      "data_extraction_method",
      "data_cleaning_status",
      "unit_standardisation_status",
      "freshness_status",
      "reuse_eligibility_status"
    ],
    required_chart_fields: [
      "chart_type",
      "title",
      "subtitle_or_context",
      "labels",
      "values",
      "units",
      "source_note",
      "caption",
      "alt_text",
      "credit_display",
      "mobile_fallback_text"
    ],
    optional_chart_fields: [
      "series",
      "groups",
      "colors",
      "annotations",
      "thresholds",
      "rank",
      "geo_scope",
      "period",
      "confidence_note"
    ]
  },
  no_chart_generation_in_ag10c: true,
  no_chart_rendering_in_ag10c: true,
  ...noMutationControls
};

const dataDoctrine = {
  module_id: "AG10C",
  title: "Data Source, Dataset and Inference Doctrine",
  status: "data_source_dataset_inference_doctrine_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10c: articleHash,
  data_lifecycle: [
    "source_metadata_record",
    "extracted_data_record",
    "cleaned_normalized_dataset",
    "derived_metrics_record",
    "inference_interpretation_log",
    "dataset_object_binding",
    "article_dataset_mapping",
    "reuse_learning_log"
  ],
  registry_entities: [
    {
      entity: "data_sources",
      purpose: "Store source metadata, publisher, date, URL/reference, licence and access date."
    },
    {
      entity: "datasets",
      purpose: "Store extracted and cleaned values with version, schema and hash."
    },
    {
      entity: "dataset_versions",
      purpose: "Preserve changes across time and avoid silent data replacement."
    },
    {
      entity: "derived_metrics",
      purpose: "Store calculated percentages, ratios, rankings, averages, trends, gaps and comparisons."
    },
    {
      entity: "inference_logs",
      purpose: "Record what inference was drawn from data and why it is justified."
    },
    {
      entity: "dataset_object_bindings",
      purpose: "Map datasets and fields to chart/table/infographic templates."
    },
    {
      entity: "article_dataset_map",
      purpose: "Record which article uses which dataset, metric or inference."
    },
    {
      entity: "reuse_logs",
      purpose: "Track when a dataset, metric or rendered object is reused in another article."
    }
  ],
  data_credit_logic: [
    {
      data_origin: "external_official_or_research_source",
      credit_pattern: "Data source: [source name]. Data visualization: Drishvara.",
      ownership_note: "Source data remains attributed to the source; visualization and interpretation are Drishvara-controlled."
    },
    {
      data_origin: "internally_derived_metric_from_external_data",
      credit_pattern: "Data source: [source name]. Analysis: Drishvara.",
      ownership_note: "Derived metric/inference is Drishvara analysis, subject to source data rights."
    },
    {
      data_origin: "internal_drishvara_dataset",
      credit_pattern: "Data and visualization: Drishvara.",
      ownership_note: "Treat as Drishvara-owned/controlled if created through Drishvara workflow."
    },
    {
      data_origin: "mixed_sources",
      credit_pattern: "Sources: [source list]. Analysis and visualization: Drishvara.",
      ownership_note: "All sources must be separately recorded and verified."
    }
  ],
  freshness_rules: [
    {
      freshness_band: "current",
      condition: "Dataset is recent and source context remains valid.",
      reuse_allowed: true
    },
    {
      freshness_band: "contextual",
      condition: "Dataset is older but still valid for historical or analytical context.",
      reuse_allowed: true,
      required_note: "Historical/contextual data note required."
    },
    {
      freshness_band: "stale",
      condition: "Dataset may no longer represent the present situation.",
      reuse_allowed: false,
      required_action: "Refresh source or mark as archival."
    }
  ],
  storage_rules_before_backend_activation: [
    "Store source metadata, dataset schema, derived metrics and inference records as governed JSON/CSV artifacts.",
    "Do not store full copyrighted reports unless licence permits.",
    "Store source links, extracted permitted facts, cleaned values, data hash and reuse status.",
    "Keep article prose, source data, derived metrics, inference and visualization records separate."
  ],
  no_data_fetch_in_ag10c: true,
  no_dataset_creation_in_ag10c: true,
  ...noMutationControls
};

const templateDoctrine = {
  module_id: "AG10C",
  title: "Reusable Chart Template and Rendered Object Instance Doctrine",
  status: "reusable_chart_template_doctrine_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10c: articleHash,
  pipeline_model: [
    "object_template",
    "data_binding",
    "rendered_object_instance",
    "article_placement",
    "post_insertion_audit",
    "reuse_log"
  ],
  distinction: {
    object_template: "Reusable Drishvara-owned/controlled design/component structure.",
    data_binding: "Article-specific dataset fields mapped into the template.",
    rendered_object_instance: "Specific output created from one template plus one dataset/version.",
    article_placement: "Controlled insertion location and layout behavior in a given article."
  },
  object_template_fields: [
    "object_template_id",
    "object_family",
    "object_type",
    "theme_variant",
    "layout_rule",
    "mobile_rule",
    "caption_rule",
    "credit_rule",
    "data_schema_required",
    "created_by",
    "ownership_status",
    "reuse_allowed",
    "version",
    "template_hash"
  ],
  rendered_object_fields: [
    "rendered_object_id",
    "object_template_id",
    "article_id",
    "dataset_id",
    "dataset_version",
    "data_hash",
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
      reuse_type: "rendered_object_reuse",
      rule: "Allowed only when dataset, context, freshness, source/credit and article relevance remain valid."
    }
  ],
  no_template_creation_in_ag10c: true,
  no_rendered_object_creation_in_ag10c: true,
  ...noMutationControls
};

const visualDoctrine = {
  module_id: "AG10C",
  title: "Chart Theme, Credit and Mobile Doctrine",
  status: "chart_theme_credit_mobile_doctrine_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10c: articleHash,
  theme_source_status: ag10aThemeLayout.status,
  ownership_source_status: ag10aOwnership.status,
  chart_theme_rules: [
    "Charts must inherit Drishvara article theme and not appear as unrelated BI dashboards.",
    "Series colors must map to approved theme roles before rendering.",
    "Neutral, readable, editorial colors should be preferred over saturated dashboard palettes.",
    "Legends, axes and annotations must remain readable on mobile.",
    "Every chart requires caption, source note, credit and alt text."
  ],
  chart_credit_rules: [
    {
      condition: "external source data used",
      credit: "Data source: [source]. Data visualization: Drishvara."
    },
    {
      condition: "internal Drishvara data used",
      credit: "Data and visualization: Drishvara."
    },
    {
      condition: "derived metric from source data",
      credit: "Data source: [source]. Analysis and visualization: Drishvara."
    }
  ],
  mobile_rules: [
    "No horizontal overflow.",
    "Charts wider than article column require responsive scaling or fallback summary.",
    "Dense charts require simplified mobile version or text summary.",
    "Geo charts/maps require fallback explanation if labels are unreadable.",
    "Tables or chart-like objects require responsive wrappers before insertion."
  ],
  accessibility_rules: [
    "Alt text must state the main data insight, not merely chart type.",
    "Caption must explain why the chart matters.",
    "Color must not be the only way to distinguish meaning.",
    "Mobile fallback text must be available for complex charts."
  ],
  ...noMutationControls
};

const plan = {
  module_id: "AG10C",
  title: "Data Visualization and Chart/Graph Pipeline Planning",
  status: "data_visualization_chart_pipeline_planning_created_not_executed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10c: articleHash,
  generated_from: inputs,
  chart_family_registry_file: "data/content-intelligence/object-registry/ag10c-chart-family-data-schema-registry.json",
  data_doctrine_file: "data/content-intelligence/data-registry/ag10c-data-source-dataset-inference-doctrine.json",
  template_doctrine_file: "data/content-intelligence/object-registry/ag10c-reusable-chart-template-render-instance-doctrine.json",
  visual_doctrine_file: "data/content-intelligence/object-registry/ag10c-chart-theme-credit-mobile-doctrine.json",
  carried_forward: {
    ag10b_scoring_status: ag10bScoring.status,
    ag10b_eligibility_status: ag10bEligibility.status,
    ag10a_theme_layout_status: ag10aThemeLayout.status,
    ag10a_ownership_status: ag10aOwnership.status
  },
  stage_principle: "AG10C plans data/chart governance only. No data fetch, dataset creation, chart rendering or object insertion is performed.",
  ...noMutationControls
};

const readiness = {
  module_id: "AG10C",
  title: "Data Visualization Pipeline Readiness",
  status: "data_visualization_pipeline_planning_ready_pending_explicit_ag10d",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10c: articleHash,
  chart_family_registry_created: true,
  data_source_dataset_inference_doctrine_created: true,
  reusable_template_render_instance_doctrine_created: true,
  chart_theme_credit_mobile_doctrine_created: true,
  ready_for_ag10d: true,
  data_fetch_ready: false,
  dataset_creation_ready: false,
  chart_generation_ready: false,
  chart_insertion_ready: false,
  article_mutation_ready: false,
  backend_activation_ready: false,
  ...noMutationControls
};

const boundary = {
  module_id: "AG10C",
  title: "AG10C to AG10D Infographic Pipeline Planning Boundary",
  status: "ag10d_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10c: articleHash,
  next_stage_id: "AG10D",
  next_stage_title: "Infographic Pipeline Planning",
  explicit_approval_required: true,
  ag10d_allowed_scope: [
    "Define governed infographic pipeline.",
    "Classify infographic families by structure and article purpose.",
    "Define infographic content-block schema.",
    "Define infographic template and rendered-instance doctrine.",
    "Define infographic theme, ownership, credit and mobile rules.",
    "Define infographic cost-control gates."
  ],
  ag10d_blocked_scope: [
    "No infographic generation.",
    "No image or SVG asset creation.",
    "No object insertion.",
    "No article mutation.",
    "No CSS/JS mutation.",
    "No database/Supabase/backend/Auth activation.",
    "No publishing operation."
  ],
  ...noMutationControls
};

const schema = {
  module_id: "AG10C",
  title: "Data Visualization and Chart Pipeline Planning Schema",
  status: "schema_data_visualization_chart_pipeline_planning_only",
  chart_family_registry_allowed_in_ag10c: true,
  data_source_dataset_inference_doctrine_allowed_in_ag10c: true,
  reusable_chart_template_doctrine_allowed_in_ag10c: true,
  chart_theme_credit_mobile_doctrine_allowed_in_ag10c: true,
  ag10d_boundary_allowed_in_ag10c: true,
  article_mutation_allowed_in_ag10c: false,
  homepage_mutation_allowed_in_ag10c: false,
  css_js_mutation_allowed_in_ag10c: false,
  data_fetch_allowed_in_ag10c: false,
  dataset_creation_allowed_in_ag10c: false,
  chart_generation_allowed_in_ag10c: false,
  graph_generation_allowed_in_ag10c: false,
  data_visualization_render_allowed_in_ag10c: false,
  chart_template_creation_allowed_in_ag10c: false,
  rendered_object_creation_allowed_in_ag10c: false,
  object_insertion_allowed_in_ag10c: false,
  image_generation_allowed_in_ag10c: false,
  infographic_generation_allowed_in_ag10c: false,
  table_generation_allowed_in_ag10c: false,
  figure_generation_allowed_in_ag10c: false,
  map_generation_allowed_in_ag10c: false,
  live_url_fetch_allowed_in_ag10c: false,
  deployment_trigger_allowed_in_ag10c: false,
  production_jsonl_append_allowed_in_ag10c: false,
  database_write_allowed_in_ag10c: false,
  supabase_write_allowed_in_ag10c: false,
  backend_auth_supabase_activation_allowed_in_ag10c: false,
  public_publishing_operation_allowed_in_ag10c: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10c: articleHash,
  source_chart_object_count: chartObjects.length,
  chart_family_count: chartFamilies.length,
  data_lifecycle_steps: dataDoctrine.data_lifecycle.length,
  registry_entity_count: dataDoctrine.registry_entities.length,
  template_pipeline_steps: templateDoctrine.pipeline_model.length,
  next_stage_id: "AG10D",
  next_stage_title: "Infographic Pipeline Planning",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const review = {
  module_id: "AG10C",
  title: "Data Visualization and Chart/Graph Pipeline Planning",
  status: "data_visualization_chart_pipeline_planning_created_not_executed",
  depends_on: ["AG10B", "AG10A", "AG09Z"],
  generated_from: inputs,
  summary,
  plan_file: "data/content-intelligence/mutation-plans/ag10c-data-visualization-chart-pipeline-planning.json",
  chart_registry_file: "data/content-intelligence/object-registry/ag10c-chart-family-data-schema-registry.json",
  data_doctrine_file: "data/content-intelligence/data-registry/ag10c-data-source-dataset-inference-doctrine.json",
  template_doctrine_file: "data/content-intelligence/object-registry/ag10c-reusable-chart-template-render-instance-doctrine.json",
  visual_doctrine_file: "data/content-intelligence/object-registry/ag10c-chart-theme-credit-mobile-doctrine.json",
  readiness_file: "data/content-intelligence/quality-registry/ag10c-data-visualization-pipeline-readiness.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag10c-to-ag10d-infographic-pipeline-planning-boundary.json",
  schema_file: "data/content-intelligence/schema/data-visualization-chart-pipeline-planning.schema.json",
  learning_file: "data/content-intelligence/learning/ag10c-data-visualization-chart-pipeline-planning-learning.json",
  closure_decision: {
    decision: "ag10c_data_visualization_planning_created_pending_explicit_ag10d",
    proceed_to_ag10d_only_with_explicit_user_approval: true,
    chart_generation_performed: false,
    dataset_creation_performed: false,
    object_insertion_performed: false,
    article_mutation_performed: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG10C",
  title: "Data Visualization and Chart Pipeline Planning Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "Reusable chart templates must be separated from data-bound rendered instances.",
    "Data used in articles should be preserved through source, dataset, derived metric, inference and reuse records.",
    "Source data credit and Drishvara visualization/analysis credit must be separated.",
    "Charts require data schema, source note, caption, alt text and mobile fallback before rendering.",
    "AG10C must not fetch data or render charts; it only defines the governance pipeline."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG10C",
  title: "Data Visualization and Chart/Graph Pipeline Planning",
  status: "data_visualization_chart_pipeline_planning_created_not_executed",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag10c-data-visualization-chart-pipeline-planning.json",
    plan: "data/content-intelligence/mutation-plans/ag10c-data-visualization-chart-pipeline-planning.json",
    chart_registry: "data/content-intelligence/object-registry/ag10c-chart-family-data-schema-registry.json",
    data_doctrine: "data/content-intelligence/data-registry/ag10c-data-source-dataset-inference-doctrine.json",
    template_doctrine: "data/content-intelligence/object-registry/ag10c-reusable-chart-template-render-instance-doctrine.json",
    visual_doctrine: "data/content-intelligence/object-registry/ag10c-chart-theme-credit-mobile-doctrine.json",
    readiness: "data/content-intelligence/quality-registry/ag10c-data-visualization-pipeline-readiness.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag10c-to-ag10d-infographic-pipeline-planning-boundary.json",
    schema: "data/content-intelligence/schema/data-visualization-chart-pipeline-planning.schema.json",
    learning: "data/content-intelligence/learning/ag10c-data-visualization-chart-pipeline-planning-learning.json",
    preview: "data/quality/ag10c-data-visualization-chart-pipeline-planning-preview.json",
    document: "docs/quality/AG10C_DATA_VISUALIZATION_CHART_PIPELINE_PLANNING.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG10C",
  preview_only: true,
  status: "data_visualization_chart_pipeline_planning_created_not_executed",
  summary,
  chart_families_preview: chartFamilies,
  data_lifecycle_preview: dataDoctrine.data_lifecycle,
  template_pipeline_preview: templateDoctrine.pipeline_model,
  ag10d_handoff: boundary,
  ...noMutationControls
};

const doc = `# AG10C — Data Visualization and Chart/Graph Pipeline Planning

## Purpose

AG10C defines the governed data visualization and chart/graph pipeline for Drishvara.

It covers chart families, chart-data schemas, data-source registry doctrine, dataset normalization, derived metrics, inference logs, reusable chart templates, rendered object instances, credit rules, theme rules, mobile fallback rules and future reuse.

AG10C is planning-only. It does not fetch data, create datasets, render charts, create chart templates, insert objects, mutate articles, modify CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## Data Lifecycle

The planned lifecycle is:

1. Data source metadata
2. Extracted data
3. Cleaned / normalized dataset
4. Derived metrics
5. Inference and interpretation log
6. Dataset-object binding
7. Article-dataset mapping
8. Reuse and learning log

## Template and Rendered Instance Model

Reusable chart templates are separated from data-bound rendered object instances.

Template reuse may be broad after approval. Rendered chart reuse is allowed only when data, context, freshness, source/credit and article relevance remain valid.

## Credit Logic

Where external source data is used:

- Data source: [source name]
- Data visualization: Drishvara

Where internal Drishvara data is used:

- Data and visualization: Drishvara

Where derived metrics are created from source data:

- Data source: [source name]
- Analysis and visualization: Drishvara

## Next Stage

AG10D — Infographic Pipeline Planning — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(planPath, plan);
writeJson(chartRegistryPath, chartFamilyRegistry);
writeJson(dataDoctrinePath, dataDoctrine);
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
  throw new Error("AG10C attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG10C data visualization and chart/graph pipeline planning artifacts generated.");
console.log(`✅ Chart objects carried forward: ${chartObjects.length}`);
console.log("✅ Data source, dataset, derived metric and inference doctrine created.");
console.log("✅ Reusable chart-template and rendered-object instance doctrine created.");
console.log("✅ No data fetch, dataset creation, chart generation, object insertion, article mutation, backend activation or publishing operation performed.");
console.log("✅ AG10D handoff created with explicit approval required.");
