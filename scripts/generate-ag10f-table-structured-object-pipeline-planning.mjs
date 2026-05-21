import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag10eReview: "data/content-intelligence/quality-reviews/ag10e-figure-diagram-pipeline-planning.json",
  ag10ePlan: "data/content-intelligence/mutation-plans/ag10e-figure-diagram-pipeline-planning.json",
  ag10eTemplateDoctrine: "data/content-intelligence/object-registry/ag10e-reusable-figure-diagram-template-render-instance-doctrine.json",
  ag10eVisualDoctrine: "data/content-intelligence/object-registry/ag10e-figure-diagram-theme-credit-mobile-doctrine.json",
  ag10eReadiness: "data/content-intelligence/quality-registry/ag10e-figure-diagram-pipeline-readiness.json",
  ag10eBoundary: "data/content-intelligence/mutation-plans/ag10e-to-ag10f-table-structured-object-pipeline-planning-boundary.json",
  ag10bNormalizedTaxonomy: "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
  ag10bEligibility: "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
  ag10aThemeLayout: "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  ag10aOwnership: "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  ag10cDataDoctrine: "data/content-intelligence/data-registry/ag10c-data-source-dataset-inference-doctrine.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag10f-table-structured-object-pipeline-planning.json");
const planPath = path.join(root, "data/content-intelligence/mutation-plans/ag10f-table-structured-object-pipeline-planning.json");
const familyRegistryPath = path.join(root, "data/content-intelligence/object-registry/ag10f-table-structured-object-family-registry.json");
const rowColumnSchemaPath = path.join(root, "data/content-intelligence/object-registry/ag10f-table-row-column-cell-schema.json");
const templateDoctrinePath = path.join(root, "data/content-intelligence/object-registry/ag10f-reusable-table-template-render-instance-doctrine.json");
const visualDoctrinePath = path.join(root, "data/content-intelligence/object-registry/ag10f-table-theme-credit-mobile-doctrine.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag10f-table-structured-object-pipeline-readiness.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag10f-to-ag10g-map-geographic-object-pipeline-planning-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/table-structured-object-pipeline-planning.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag10f-table-structured-object-pipeline-planning-learning.json");
const registryPath = path.join(root, "data/quality/ag10f-table-structured-object-pipeline-planning.json");
const previewPath = path.join(root, "data/quality/ag10f-table-structured-object-pipeline-planning-preview.json");
const docPath = path.join(root, "docs/quality/AG10F_TABLE_STRUCTURED_OBJECT_PIPELINE_PLANNING.md");

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
  if (!exists(relativePath)) throw new Error(`Missing required AG10F input ${name}: ${relativePath}`);
}

const ag10eReview = readJson(inputs.ag10eReview);
const ag10ePlan = readJson(inputs.ag10ePlan);
const ag10eTemplateDoctrine = readJson(inputs.ag10eTemplateDoctrine);
const ag10eVisualDoctrine = readJson(inputs.ag10eVisualDoctrine);
const ag10eReadiness = readJson(inputs.ag10eReadiness);
const ag10eBoundary = readJson(inputs.ag10eBoundary);
const ag10bNormalizedTaxonomy = readJson(inputs.ag10bNormalizedTaxonomy);
const ag10bEligibility = readJson(inputs.ag10bEligibility);
const ag10aThemeLayout = readJson(inputs.ag10aThemeLayout);
const ag10aOwnership = readJson(inputs.ag10aOwnership);
const ag10cDataDoctrine = readJson(inputs.ag10cDataDoctrine);
const ag09cApply = readJson(inputs.ag09cApply);

if (ag10eReview.status !== "figure_diagram_pipeline_planning_created_not_executed") {
  throw new Error("AG10F requires AG10E review.");
}

if (ag10eReadiness.ready_for_ag10f !== true) {
  throw new Error("AG10F requires AG10E readiness.");
}

if (ag10eBoundary.next_stage_id !== "AG10F" || ag10eBoundary.explicit_approval_required !== true) {
  throw new Error("AG10F requires AG10E to AG10F explicit boundary.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleHash = sha256(articleHtml);

if (articleHash !== ag09cApply.post_correction_hash) {
  throw new Error("AG10F selected article hash must match AG09C post-correction hash.");
}

const noMutationControls = {
  table_structured_object_pipeline_planning_only: true,
  selected_article_read_performed: true,
  article_mutation_performed_in_ag10f: false,
  selected_article_file_write_performed_in_ag10f: false,
  homepage_mutation_performed_in_ag10f: false,
  css_mutation_performed_in_ag10f: false,
  js_mutation_performed_in_ag10f: false,
  reference_insertion_performed_in_ag10f: false,
  reference_url_change_performed_in_ag10f: false,
  data_fetch_performed_in_ag10f: false,
  dataset_creation_performed_in_ag10f: false,
  table_generation_performed_in_ag10f: false,
  structured_object_creation_performed_in_ag10f: false,
  table_render_performed_in_ag10f: false,
  table_template_creation_performed_in_ag10f: false,
  rendered_table_creation_performed_in_ag10f: false,
  html_table_asset_creation_performed_in_ag10f: false,
  csv_export_creation_performed_in_ag10f: false,
  object_insertion_performed_in_ag10f: false,
  visual_generation_performed_in_ag10f: false,
  image_generation_performed_in_ag10f: false,
  chart_generation_performed_in_ag10f: false,
  infographic_generation_performed_in_ag10f: false,
  figure_generation_performed_in_ag10f: false,
  diagram_generation_performed_in_ag10f: false,
  map_generation_performed_in_ag10f: false,
  live_url_fetch_performed_in_ag10f: false,
  deployment_trigger_performed_in_ag10f: false,
  production_jsonl_append_performed_in_ag10f: false,
  database_write_performed_in_ag10f: false,
  supabase_write_performed_in_ag10f: false,
  backend_auth_supabase_activation_performed_in_ag10f: false,
  rollback_execution_performed_in_ag10f: false,
  public_publishing_operation_performed_in_ag10f: false
};

const tableObjects = ag10bNormalizedTaxonomy.normalized_objects.filter(
  (item) => item.family === "tables_structured_objects"
);

const tableFamilies = [
  {
    family_id: "AG10F-TABLE-DATA",
    family_name: "Data, Facts and Summary Tables",
    table_types: ["data_table", "facts_table", "summary_table"],
    best_for: ["structured facts", "indicator display", "compact summary", "evidence listing"],
    minimum_structure_blocks: ["title", "columns", "rows", "source_note", "caption", "credit"],
    avoid_when: ["values are unverified", "too many columns for mobile", "table repeats prose without added value"]
  },
  {
    family_id: "AG10F-TABLE-COMPARISON",
    family_name: "Comparison and Feature Matrix Tables",
    table_types: ["comparison_table", "feature_matrix", "pros_cons_table"],
    best_for: ["side-by-side comparison", "feature comparison", "advantages and limitations", "option evaluation"],
    minimum_structure_blocks: ["title", "comparison_axes", "items", "values_or_notes", "caption", "credit"],
    avoid_when: ["items are not comparable", "criteria are biased", "table should be an infographic instead"]
  },
  {
    family_id: "AG10F-TABLE-RANKING-KPI",
    family_name: "Ranking, Score and KPI Tables",
    table_types: ["ranking_table", "score_table", "kpi_summary_table"],
    best_for: ["ranked indicators", "score-based comparison", "performance summary", "dashboard-style table"],
    minimum_structure_blocks: ["title", "rank_or_metric", "value", "unit", "period", "source_note"],
    avoid_when: ["ranking logic is unclear", "score calculation is not explained", "periods are mixed"]
  },
  {
    family_id: "AG10F-TABLE-TIMELINE-POLICY",
    family_name: "Timeline and Policy Provision Tables",
    table_types: ["timeline_table", "policy_provision_table"],
    best_for: ["dated events", "policy clauses", "implementation sequence", "programme provisions"],
    minimum_structure_blocks: ["title", "period_or_clause", "description", "status_or_note", "source_note"],
    avoid_when: ["dates are speculative", "legal/policy text requires exact citation not summary", "timeline is too long"]
  },
  {
    family_id: "AG10F-TABLE-RISK",
    family_name: "Risk Matrix Tables",
    table_types: ["risk_matrix"],
    best_for: ["risk-likelihood-impact framing", "mitigation planning", "priority classification"],
    minimum_structure_blocks: ["title", "risk", "likelihood", "impact", "mitigation_or_note", "source_or_logic_note"],
    avoid_when: ["risk scoring is unsupported", "matrix implies certainty", "sensitive operational risk not approved"]
  },
  {
    family_id: "AG10F-TABLE-GLOSSARY",
    family_name: "Glossary and Definition Tables",
    table_types: ["glossary_table"],
    best_for: ["terms", "abbreviations", "concept definitions", "reader support"],
    minimum_structure_blocks: ["title", "term", "definition", "context_note"],
    avoid_when: ["definitions are not stable", "too many terms", "glossary interrupts article flow"]
  }
];

const familyRegistry = {
  module_id: "AG10F",
  title: "Table and Structured Object Family Registry",
  status: "table_structured_object_family_registry_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10f: articleHash,
  source_table_object_count: tableObjects.length,
  table_families: tableFamilies,
  universal_table_schema: {
    required_metadata: [
      "table_type",
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
    required_structure_fields: [
      "title",
      "columns",
      "rows",
      "cell_values",
      "source_note",
      "editorial_purpose",
      "responsive_strategy"
    ],
    optional_structure_fields: [
      "column_groups",
      "row_groups",
      "units",
      "period",
      "rank",
      "thresholds",
      "footnotes",
      "sort_rule",
      "filter_rule",
      "highlight_rule",
      "fallback_summary"
    ]
  },
  no_table_generation_in_ag10f: true,
  no_table_rendering_in_ag10f: true,
  ...noMutationControls
};

const rowColumnSchema = {
  module_id: "AG10F",
  title: "Table Row Column Cell Schema",
  status: "table_row_column_cell_schema_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10f: articleHash,
  schema_components: [
    {
      component_type: "table",
      required_fields: ["table_id", "title", "table_type", "caption", "credit"],
      optional_fields: ["subtitle", "source_note", "footnotes", "fallback_summary"]
    },
    {
      component_type: "column",
      required_fields: ["column_id", "column_label", "data_type"],
      optional_fields: ["unit", "alignment", "width_hint", "mobile_priority", "sort_enabled"]
    },
    {
      component_type: "row",
      required_fields: ["row_id", "row_label", "cells"],
      optional_fields: ["group", "rank", "highlight_status", "source_note"]
    },
    {
      component_type: "cell",
      required_fields: ["cell_id", "column_id", "row_id", "value"],
      optional_fields: ["display_value", "unit", "format", "link_ref", "confidence_note"]
    },
    {
      component_type: "footnote",
      required_fields: ["footnote_id", "marker", "text"],
      optional_fields: ["source_ref", "applies_to_cell_or_column"]
    },
    {
      component_type: "responsive_wrapper",
      required_fields: ["wrapper_id", "overflow_strategy", "mobile_fallback_text"],
      optional_fields: ["stacked_view_rule", "priority_columns", "scroll_hint"]
    },
    {
      component_type: "accessibility_summary",
      required_fields: ["summary_text", "main_insight"],
      optional_fields: ["screen_reader_note", "mobile_version_note"]
    }
  ],
  validation_rules: [
    "Every table must have a title, caption and credit.",
    "Every column must have a stable label and data type.",
    "Tables with more than four columns require responsive strategy.",
    "Wide tables must not deform article shape or force uncontrolled horizontal overflow.",
    "Numeric values must carry units where applicable.",
    "Source note or internal logic note is mandatory for factual/data tables.",
    "Mobile fallback summary is mandatory for dense tables.",
    "Table must remain centrally aligned in vertical article flow unless a specific layout exception is approved."
  ],
  ...noMutationControls
};

const templateDoctrine = {
  module_id: "AG10F",
  title: "Reusable Table Template and Rendered Instance Doctrine",
  status: "reusable_table_template_doctrine_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10f: articleHash,
  pipeline_model: [
    "table_template",
    "row_column_data_binding",
    "rendered_table_instance",
    "article_placement",
    "post_insertion_layout_audit",
    "reuse_log"
  ],
  distinction: {
    table_template: "Reusable Drishvara-owned/controlled structure such as comparison table, data table, risk matrix or glossary layout.",
    row_column_data_binding: "Article-specific rows, columns, cells, values, source notes and footnotes mapped into the template.",
    rendered_table_instance: "Specific output produced from one template and one data/content binding.",
    article_placement: "Controlled insertion zone, responsive wrapper and layout behavior in the article."
  },
  table_template_fields: [
    "table_template_id",
    "table_family",
    "table_type",
    "theme_variant",
    "layout_rule",
    "mobile_rule",
    "caption_rule",
    "credit_rule",
    "row_column_schema_required",
    "created_by",
    "rights_controller",
    "ownership_status",
    "reuse_allowed",
    "version",
    "template_hash"
  ],
  rendered_table_fields: [
    "rendered_table_id",
    "table_template_id",
    "article_id",
    "row_column_binding_id",
    "dataset_id_or_source_record_ids",
    "html_or_structured_asset_path",
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
      reuse_type: "rendered_table_reuse",
      rule: "Allowed only when values, source freshness, article context and rights/credit remain valid."
    }
  ],
  no_template_creation_in_ag10f: true,
  no_rendered_table_creation_in_ag10f: true,
  ...noMutationControls
};

const visualDoctrine = {
  module_id: "AG10F",
  title: "Table Theme, Credit, Mobile and Cost Doctrine",
  status: "table_theme_credit_mobile_doctrine_created_not_applied",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10f: articleHash,
  theme_source_status: ag10aThemeLayout.status,
  ownership_source_status: ag10aOwnership.status,
  data_doctrine_source_status: ag10cDataDoctrine.status,
  table_theme_rules: [
    "Tables must inherit Drishvara article theme and editorial tone.",
    "Use clean borders, readable spacing and restrained highlight states.",
    "Avoid dense spreadsheet-like formatting unless article purpose requires it.",
    "Header hierarchy must be visually clear.",
    "Every table requires caption, credit, alt text or accessibility summary and mobile fallback text where applicable."
  ],
  credit_rules: [
    {
      condition: "internally structured table using Drishvara logic",
      credit: "Table: Drishvara."
    },
    {
      condition: "external source data used",
      credit: "Data source: [source]. Table: Drishvara."
    },
    {
      condition: "derived metrics or analysis used",
      credit: "Data source: [source]. Analysis and table: Drishvara."
    },
    {
      condition: "mixed sources used",
      credit: "Sources: [source list]. Table: Drishvara."
    }
  ],
  mobile_rules: [
    "No uncontrolled horizontal overflow.",
    "Tables should use responsive wrappers when width exceeds article column.",
    "Dense tables should convert to stacked cards or provide fallback summary on mobile.",
    "Priority columns should be defined for mobile views.",
    "Captions, credits and footnotes must remain readable and must not overlap table content."
  ],
  placement_rules: [
    "Tables should be centrally aligned in vertical article flow.",
    "Tables must not deform article shape.",
    "Tables should not interrupt paragraphs without editorial reason.",
    "Long tables should be placed after explanatory context, not before the reader understands the topic.",
    "Small structured objects may appear as cards only if layout-safe."
  ],
  cost_rules: [
    "Prefer reusable HTML/structured table templates before custom generation.",
    "Do not create a table when a short bullet, callout or chart communicates the point better.",
    "Record template reuse before creating a new table template.",
    "Data-backed tables require source/data doctrine record before future rendering."
  ],
  accessibility_rules: [
    "Accessibility summary must describe the main table insight.",
    "Column headers and row labels must be meaningful.",
    "Color must not be the only carrier of meaning.",
    "Footnotes must be associated with the relevant row, column or cell."
  ],
  ...noMutationControls
};

const plan = {
  module_id: "AG10F",
  title: "Table and Structured Object Pipeline Planning",
  status: "table_structured_object_pipeline_planning_created_not_executed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10f: articleHash,
  generated_from: inputs,
  family_registry_file: "data/content-intelligence/object-registry/ag10f-table-structured-object-family-registry.json",
  row_column_schema_file: "data/content-intelligence/object-registry/ag10f-table-row-column-cell-schema.json",
  template_doctrine_file: "data/content-intelligence/object-registry/ag10f-reusable-table-template-render-instance-doctrine.json",
  visual_doctrine_file: "data/content-intelligence/object-registry/ag10f-table-theme-credit-mobile-doctrine.json",
  carried_forward: {
    ag10e_plan_status: ag10ePlan.status,
    ag10e_visual_doctrine_status: ag10eVisualDoctrine.status,
    ag10b_eligibility_status: ag10bEligibility.status,
    ag10c_data_doctrine_status: ag10cDataDoctrine.status
  },
  stage_principle: "AG10F plans table and structured-object governance only. No table generation, rendering, data fetch, asset creation or insertion is performed.",
  ...noMutationControls
};

const readiness = {
  module_id: "AG10F",
  title: "Table and Structured Object Pipeline Readiness",
  status: "table_structured_object_pipeline_planning_ready_pending_explicit_ag10g",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10f: articleHash,
  table_family_registry_created: true,
  row_column_cell_schema_created: true,
  reusable_template_render_instance_doctrine_created: true,
  theme_credit_mobile_cost_doctrine_created: true,
  ready_for_ag10g: true,
  table_generation_ready: false,
  table_render_ready: false,
  structured_object_creation_ready: false,
  data_fetch_ready: false,
  object_insertion_ready: false,
  article_mutation_ready: false,
  backend_activation_ready: false,
  ...noMutationControls
};

const boundary = {
  module_id: "AG10F",
  title: "AG10F to AG10G Map and Geographic Object Pipeline Planning Boundary",
  status: "ag10g_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10f: articleHash,
  next_stage_id: "AG10G",
  next_stage_title: "Map and Geographic Object Pipeline Planning",
  explicit_approval_required: true,
  ag10g_allowed_scope: [
    "Define governed map and geographic object pipeline.",
    "Classify geographic maps, regional focus maps, bubble maps, heat maps and service-area maps.",
    "Define geo-data schema and coordinate/location rules.",
    "Define reusable map template and rendered-instance doctrine.",
    "Define source/licence/credit/mobile/accessibility rules.",
    "Define map fallback and cost-control gates."
  ],
  ag10g_blocked_scope: [
    "No map generation.",
    "No geographic object rendering.",
    "No data fetch.",
    "No object insertion.",
    "No article mutation.",
    "No CSS/JS mutation.",
    "No database/Supabase/backend/Auth activation.",
    "No publishing operation."
  ],
  ...noMutationControls
};

const schema = {
  module_id: "AG10F",
  title: "Table and Structured Object Pipeline Planning Schema",
  status: "schema_table_structured_object_pipeline_planning_only",
  table_family_registry_allowed_in_ag10f: true,
  row_column_cell_schema_allowed_in_ag10f: true,
  reusable_table_template_doctrine_allowed_in_ag10f: true,
  table_theme_credit_mobile_doctrine_allowed_in_ag10f: true,
  ag10g_boundary_allowed_in_ag10f: true,
  article_mutation_allowed_in_ag10f: false,
  homepage_mutation_allowed_in_ag10f: false,
  css_js_mutation_allowed_in_ag10f: false,
  data_fetch_allowed_in_ag10f: false,
  dataset_creation_allowed_in_ag10f: false,
  table_generation_allowed_in_ag10f: false,
  structured_object_creation_allowed_in_ag10f: false,
  table_render_allowed_in_ag10f: false,
  table_template_creation_allowed_in_ag10f: false,
  rendered_table_creation_allowed_in_ag10f: false,
  html_table_asset_creation_allowed_in_ag10f: false,
  csv_export_creation_allowed_in_ag10f: false,
  object_insertion_allowed_in_ag10f: false,
  visual_generation_allowed_in_ag10f: false,
  image_generation_allowed_in_ag10f: false,
  chart_generation_allowed_in_ag10f: false,
  infographic_generation_allowed_in_ag10f: false,
  figure_generation_allowed_in_ag10f: false,
  diagram_generation_allowed_in_ag10f: false,
  map_generation_allowed_in_ag10f: false,
  live_url_fetch_allowed_in_ag10f: false,
  deployment_trigger_allowed_in_ag10f: false,
  production_jsonl_append_allowed_in_ag10f: false,
  database_write_allowed_in_ag10f: false,
  supabase_write_allowed_in_ag10f: false,
  backend_auth_supabase_activation_allowed_in_ag10f: false,
  public_publishing_operation_allowed_in_ag10f: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  article_hash_at_ag10f: articleHash,
  source_table_object_count: tableObjects.length,
  table_family_count: tableFamilies.length,
  row_column_schema_component_count: rowColumnSchema.schema_components.length,
  template_pipeline_steps: templateDoctrine.pipeline_model.length,
  next_stage_id: "AG10G",
  next_stage_title: "Map and Geographic Object Pipeline Planning",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const review = {
  module_id: "AG10F",
  title: "Table and Structured Object Pipeline Planning",
  status: "table_structured_object_pipeline_planning_created_not_executed",
  depends_on: ["AG10E", "AG10D", "AG10C", "AG10B", "AG10A"],
  generated_from: inputs,
  summary,
  plan_file: "data/content-intelligence/mutation-plans/ag10f-table-structured-object-pipeline-planning.json",
  family_registry_file: "data/content-intelligence/object-registry/ag10f-table-structured-object-family-registry.json",
  row_column_schema_file: "data/content-intelligence/object-registry/ag10f-table-row-column-cell-schema.json",
  template_doctrine_file: "data/content-intelligence/object-registry/ag10f-reusable-table-template-render-instance-doctrine.json",
  visual_doctrine_file: "data/content-intelligence/object-registry/ag10f-table-theme-credit-mobile-doctrine.json",
  readiness_file: "data/content-intelligence/quality-registry/ag10f-table-structured-object-pipeline-readiness.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag10f-to-ag10g-map-geographic-object-pipeline-planning-boundary.json",
  schema_file: "data/content-intelligence/schema/table-structured-object-pipeline-planning.schema.json",
  learning_file: "data/content-intelligence/learning/ag10f-table-structured-object-pipeline-planning-learning.json",
  closure_decision: {
    decision: "ag10f_table_structured_object_planning_created_pending_explicit_ag10g",
    proceed_to_ag10g_only_with_explicit_user_approval: true,
    table_generation_performed: false,
    structured_object_creation_performed: false,
    object_insertion_performed: false,
    article_mutation_performed: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG10F",
  title: "Table and Structured Object Pipeline Planning Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "Tables require row, column, cell and responsive-wrapper governance before rendering.",
    "Reusable table templates must be separated from rendered table instances.",
    "Dense tables require responsive wrappers, stacked mobile view or fallback summaries.",
    "Data-backed tables must carry source, credit, unit and freshness metadata.",
    "Tables should be used only when structured comparison or evidence display adds value beyond prose, charts or callouts."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG10F",
  title: "Table and Structured Object Pipeline Planning",
  status: "table_structured_object_pipeline_planning_created_not_executed",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag10f-table-structured-object-pipeline-planning.json",
    plan: "data/content-intelligence/mutation-plans/ag10f-table-structured-object-pipeline-planning.json",
    family_registry: "data/content-intelligence/object-registry/ag10f-table-structured-object-family-registry.json",
    row_column_schema: "data/content-intelligence/object-registry/ag10f-table-row-column-cell-schema.json",
    template_doctrine: "data/content-intelligence/object-registry/ag10f-reusable-table-template-render-instance-doctrine.json",
    visual_doctrine: "data/content-intelligence/object-registry/ag10f-table-theme-credit-mobile-doctrine.json",
    readiness: "data/content-intelligence/quality-registry/ag10f-table-structured-object-pipeline-readiness.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag10f-to-ag10g-map-geographic-object-pipeline-planning-boundary.json",
    schema: "data/content-intelligence/schema/table-structured-object-pipeline-planning.schema.json",
    learning: "data/content-intelligence/learning/ag10f-table-structured-object-pipeline-planning-learning.json",
    preview: "data/quality/ag10f-table-structured-object-pipeline-planning-preview.json",
    document: "docs/quality/AG10F_TABLE_STRUCTURED_OBJECT_PIPELINE_PLANNING.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG10F",
  preview_only: true,
  status: "table_structured_object_pipeline_planning_created_not_executed",
  summary,
  table_families_preview: tableFamilies,
  row_column_schema_preview: rowColumnSchema.schema_components,
  template_pipeline_preview: templateDoctrine.pipeline_model,
  ag10g_handoff: boundary,
  ...noMutationControls
};

const doc = `# AG10F — Table and Structured Object Pipeline Planning

## Purpose

AG10F defines the governed table and structured-object pipeline for Drishvara.

It covers data tables, comparison tables, ranking tables, timeline tables, score/KPI tables, facts tables, policy provision tables, risk matrices, pros-cons tables, glossary tables, row-column-cell schema, responsive wrappers, central alignment, source/credit rules, mobile overflow rules and reusable table-template doctrine.

AG10F is planning-only. It does not generate tables, fetch data, create structured objects, render tables, insert objects, mutate articles, modify CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## Table Families

AG10F records governance scope for data/facts/summary tables, comparison/feature matrix tables, ranking/KPI tables, timeline/policy provision tables, risk matrices and glossary tables.

## Row Column Cell Schema

Tables are planned through governed table, column, row, cell, footnote, responsive-wrapper and accessibility-summary components.

## Template and Rendered Instance Model

Reusable table templates are separated from rendered table instances.

Template reuse may be broad after approval. Rendered table reuse is allowed only when values, source freshness, article context and rights/credit remain valid.

## Credit Logic

Default patterns include:

- Table: Drishvara.
- Data source: [source]. Table: Drishvara.
- Data source: [source]. Analysis and table: Drishvara.
- Sources: [source list]. Table: Drishvara.

## Next Stage

AG10G — Map and Geographic Object Pipeline Planning — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(planPath, plan);
writeJson(familyRegistryPath, familyRegistry);
writeJson(rowColumnSchemaPath, rowColumnSchema);
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
  throw new Error("AG10F attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG10F table and structured object pipeline planning artifacts generated.");
console.log(`✅ Table/structured objects carried forward: ${tableObjects.length}`);
console.log(`✅ Table families recorded: ${tableFamilies.length}`);
console.log("✅ Row/column/cell schema, reusable template doctrine and theme/credit/mobile doctrine created.");
console.log("✅ No table generation, data fetch, object insertion, article mutation, backend activation or publishing operation performed.");
console.log("✅ AG10G handoff created with explicit approval required.");
