import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();









function ag12cControlledLayoutRefinementAllowsPostMutation(selectedPath = null, currentHash = null) {
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json");
  const r1ApplyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const r1ApplyRecord = fs.existsSync(r1ApplyRecordPath)
      ? JSON.parse(fs.readFileSync(r1ApplyRecordPath, "utf8"))
      : null;

    const targetPath = selectedPath || r1ApplyRecord?.selected_article_path || applyRecord.selected_article_path;
    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;
    if (r1ApplyRecord && r1ApplyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    if (
      r1ApplyRecord &&
      r1ApplyRecord.status === "public_object_label_layout_repair_applied" &&
      r1ApplyRecord.pre_repair_hash === applyRecord.post_refinement_hash &&
      r1ApplyRecord.post_repair_hash === hashToCheck &&
      html.includes("AG12C-R1") &&
      html.includes('data-drishvara-layout-treatment="reader-facing-object"') &&
      !html.includes("Additional pilot object:") &&
      !html.includes('data-drishvara-layout-treatment="collapsed-pilot-annex"')
    ) {
      return true;
    }

    return (
      applyRecord.status === "controlled_layout_refinement_applied_pending_post_refinement_audit" &&
      applyRecord.post_refinement_hash === hashToCheck &&
      html.includes("AG12C-LAYOUT-REFINEMENT:START") &&
      html.includes('data-drishvara-layout-treatment="collapsed-pilot-annex"')
    );
  } catch {
    return false;
  }
}

function ag11gControlledCompositeInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag12cControlledLayoutRefinementAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "article_support_composite_object_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.object_title) &&
      html.includes(applyRecord.visible_credit) &&
      html.includes("AG11G-COMPOSITE-001")
    );
  } catch {
    return false;
  }
}

function ag11fControlledMapInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11gControlledCompositeInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11f-map-geographic-object-controlled-cycle-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "map_geographic_object_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.map_title) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

function ag11eControlledTableInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11fControlledMapInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11e-table-structured-object-controlled-cycle-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "table_structured_object_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.table_title) &&
      html.includes(applyRecord.visible_credit) &&
      html.includes("AG11E-TABLE-001")
    );
  } catch {
    return false;
  }
}

function ag11dControlledFigureDiagramInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11eControlledTableInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11d-figure-diagram-controlled-cycle-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "figure_diagram_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.diagram_title) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

function ag11cControlledInfographicInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11dControlledFigureDiagramInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11c-infographic-controlled-cycle-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "infographic_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.infographic_title) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

function ag11bControlledChartInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11cControlledInfographicInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11b-chart-bi-graph-controlled-cycle-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "chart_bi_graph_inserted_audited_closed" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.chart_title) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

function ag10kControlledGeneratedImageInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag11bControlledChartInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const targetPath = selectedPath || applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.status === "generated_image_inserted_pending_post_insertion_audit" &&
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes(applyRecord.insertion_marker_start) &&
      html.includes(applyRecord.insertion_marker_end) &&
      html.includes(applyRecord.asset_src_in_article) &&
      html.includes(applyRecord.visible_credit)
    );
  } catch {
    return false;
  }
}

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag10b-object-taxonomy-selection-doctrine.json",
  "data/content-intelligence/mutation-plans/ag10b-object-taxonomy-selection-doctrine.json",
  "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
  "data/content-intelligence/object-registry/ag10b-object-selection-scoring-doctrine.json",
  "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
  "data/content-intelligence/quality-registry/ag10b-object-selection-readiness.json",
  "data/content-intelligence/mutation-plans/ag10b-to-ag10c-data-visualization-pipeline-planning-boundary.json",
  "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",

  "data/content-intelligence/quality-reviews/ag10c-data-visualization-chart-pipeline-planning.json",
  "data/content-intelligence/mutation-plans/ag10c-data-visualization-chart-pipeline-planning.json",
  "data/content-intelligence/object-registry/ag10c-chart-family-data-schema-registry.json",
  "data/content-intelligence/data-registry/ag10c-data-source-dataset-inference-doctrine.json",
  "data/content-intelligence/object-registry/ag10c-reusable-chart-template-render-instance-doctrine.json",
  "data/content-intelligence/object-registry/ag10c-chart-theme-credit-mobile-doctrine.json",
  "data/content-intelligence/quality-registry/ag10c-data-visualization-pipeline-readiness.json",
  "data/content-intelligence/mutation-plans/ag10c-to-ag10d-infographic-pipeline-planning-boundary.json",
  "data/content-intelligence/schema/data-visualization-chart-pipeline-planning.schema.json",
  "data/content-intelligence/learning/ag10c-data-visualization-chart-pipeline-planning-learning.json",
  "data/quality/ag10c-data-visualization-chart-pipeline-planning.json",
  "data/quality/ag10c-data-visualization-chart-pipeline-planning-preview.json",
  "docs/quality/AG10C_DATA_VISUALIZATION_CHART_PIPELINE_PLANNING.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG10C validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag10bReview = readJson("data/content-intelligence/quality-reviews/ag10b-object-taxonomy-selection-doctrine.json");
const ag10bReadiness = readJson("data/content-intelligence/quality-registry/ag10b-object-selection-readiness.json");
const ag10bBoundary = readJson("data/content-intelligence/mutation-plans/ag10b-to-ag10c-data-visualization-pipeline-planning-boundary.json");
const ag09cApply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag10c-data-visualization-chart-pipeline-planning.json");
const plan = readJson("data/content-intelligence/mutation-plans/ag10c-data-visualization-chart-pipeline-planning.json");
const chartRegistry = readJson("data/content-intelligence/object-registry/ag10c-chart-family-data-schema-registry.json");
const dataDoctrine = readJson("data/content-intelligence/data-registry/ag10c-data-source-dataset-inference-doctrine.json");
const templateDoctrine = readJson("data/content-intelligence/object-registry/ag10c-reusable-chart-template-render-instance-doctrine.json");
const visualDoctrine = readJson("data/content-intelligence/object-registry/ag10c-chart-theme-credit-mobile-doctrine.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag10c-data-visualization-pipeline-readiness.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag10c-to-ag10d-infographic-pipeline-planning-boundary.json");
const schema = readJson("data/content-intelligence/schema/data-visualization-chart-pipeline-planning.schema.json");
const learning = readJson("data/content-intelligence/learning/ag10c-data-visualization-chart-pipeline-planning-learning.json");
const registry = readJson("data/quality/ag10c-data-visualization-chart-pipeline-planning.json");
const preview = readJson("data/quality/ag10c-data-visualization-chart-pipeline-planning-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG10C_DATA_VISUALIZATION_CHART_PIPELINE_PLANNING.md"), "utf8");

for (const obj of [review, plan, chartRegistry, dataDoctrine, templateDoctrine, visualDoctrine, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG10C") fail(`module_id must be AG10C in ${obj.title || "object"}`);
}

if (ag10bReview.status !== "object_taxonomy_selection_doctrine_created_not_executed") fail("AG10B review status mismatch");
if (ag10bReadiness.ready_for_ag10c !== true) fail("AG10B readiness for AG10C missing");
if (ag10bBoundary.next_stage_id !== "AG10C") fail("AG10C boundary missing in AG10B");

const target = ag09cApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const currentHash = sha256(fs.readFileSync(path.join(root, target), "utf8"));
if (currentHash !== ag09cApply.post_correction_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Selected article hash must match AG09C post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");

if (review.status !== "data_visualization_chart_pipeline_planning_created_not_executed") fail("Review status mismatch");
if (plan.status !== "data_visualization_chart_pipeline_planning_created_not_executed") fail("Plan status mismatch");
if (registry.status !== "data_visualization_chart_pipeline_planning_created_not_executed") fail("Registry status mismatch");
if (preview.status !== "data_visualization_chart_pipeline_planning_created_not_executed") fail("Preview status mismatch");

if (chartRegistry.status !== "chart_family_data_schema_registry_created_not_applied") fail("Chart registry status mismatch");
if (!Array.isArray(chartRegistry.chart_families) || chartRegistry.chart_families.length !== 6) fail("Chart family count mismatch");
if (chartRegistry.source_chart_object_count < 28) fail("Source chart object count appears incomplete");

const allChartTypes = chartRegistry.chart_families.flatMap((item) => item.chart_types || []);
for (const chartType of [
  "bar_chart",
  "column_chart",
  "line_chart",
  "histogram",
  "pie_chart",
  "kpi_chart",
  "donut_chart",
  "treemap_chart",
  "pareto_chart",
  "radar_chart",
  "funnel_chart",
  "waterfall_chart",
  "stacked_bar_chart",
  "scatter_plot",
  "bubble_chart",
  "sankey_chart",
  "area_chart",
  "step_chart",
  "candlestick_chart",
  "sparkline",
  "geo_chart",
  "scatter_map",
  "geographic_bubble_chart",
  "heatmap_chart",
  "box_plot_whisker_plot",
  "pictograph",
  "gantt_chart",
  "dot_plot"
]) {
  if (!allChartTypes.includes(chartType)) fail(`Missing chart type in AG10C registry: ${chartType}`);
}

for (const field of [
  "dataset_id",
  "dataset_version",
  "source_id",
  "source_name",
  "source_access_date",
  "licence_or_usage_note",
  "reuse_eligibility_status"
]) {
  if (!chartRegistry.universal_chart_data_schema.required_metadata.includes(field)) {
    fail(`Missing universal chart metadata field: ${field}`);
  }
}

for (const field of [
  "chart_type",
  "labels",
  "values",
  "source_note",
  "caption",
  "alt_text",
  "credit_display",
  "mobile_fallback_text"
]) {
  if (!chartRegistry.universal_chart_data_schema.required_chart_fields.includes(field)) {
    fail(`Missing universal chart field: ${field}`);
  }
}

if (dataDoctrine.status !== "data_source_dataset_inference_doctrine_created_not_applied") fail("Data doctrine status mismatch");

for (const lifecycle of [
  "source_metadata_record",
  "extracted_data_record",
  "cleaned_normalized_dataset",
  "derived_metrics_record",
  "inference_interpretation_log",
  "dataset_object_binding",
  "article_dataset_mapping",
  "reuse_learning_log"
]) {
  if (!dataDoctrine.data_lifecycle.includes(lifecycle)) fail(`Missing data lifecycle step: ${lifecycle}`);
}

for (const entity of [
  "data_sources",
  "datasets",
  "dataset_versions",
  "derived_metrics",
  "inference_logs",
  "dataset_object_bindings",
  "article_dataset_map",
  "reuse_logs"
]) {
  if (!dataDoctrine.registry_entities.some((item) => item.entity === entity)) {
    fail(`Missing data registry entity: ${entity}`);
  }
}

for (const creditPattern of [
  "Data source: [source name]. Data visualization: Drishvara.",
  "Data source: [source name]. Analysis: Drishvara.",
  "Data and visualization: Drishvara.",
  "Sources: [source list]. Analysis and visualization: Drishvara."
]) {
  if (!dataDoctrine.data_credit_logic.some((item) => item.credit_pattern === creditPattern)) {
    fail(`Missing data credit pattern: ${creditPattern}`);
  }
}

if (templateDoctrine.status !== "reusable_chart_template_doctrine_created_not_applied") fail("Template doctrine status mismatch");
for (const step of [
  "object_template",
  "data_binding",
  "rendered_object_instance",
  "article_placement",
  "post_insertion_audit",
  "reuse_log"
]) {
  if (!templateDoctrine.pipeline_model.includes(step)) fail(`Missing template pipeline step: ${step}`);
}

for (const field of [
  "object_template_id",
  "object_family",
  "object_type",
  "theme_variant",
  "data_schema_required",
  "ownership_status",
  "template_hash"
]) {
  if (!templateDoctrine.object_template_fields.includes(field)) fail(`Missing object template field: ${field}`);
}

for (const field of [
  "rendered_object_id",
  "object_template_id",
  "dataset_id",
  "dataset_version",
  "data_hash",
  "caption",
  "credit",
  "alt_text",
  "rendered_hash"
]) {
  if (!templateDoctrine.rendered_object_fields.includes(field)) fail(`Missing rendered object field: ${field}`);
}

if (visualDoctrine.status !== "chart_theme_credit_mobile_doctrine_created_not_applied") fail("Visual doctrine status mismatch");
if (!visualDoctrine.chart_credit_rules.some((item) => item.credit === "Data source: [source]. Data visualization: Drishvara.")) {
  fail("External source chart credit rule missing");
}
if (!visualDoctrine.chart_credit_rules.some((item) => item.credit === "Data and visualization: Drishvara.")) {
  fail("Internal data chart credit rule missing");
}
if (!visualDoctrine.mobile_rules.some((item) => item.includes("No horizontal overflow"))) fail("Mobile overflow rule missing");
if (!visualDoctrine.accessibility_rules.some((item) => item.includes("Alt text"))) fail("Alt text accessibility rule missing");

if (readiness.status !== "data_visualization_pipeline_planning_ready_pending_explicit_ag10d") fail("Readiness status mismatch");
if (readiness.ready_for_ag10d !== true) fail("AG10D readiness missing");
if (readiness.data_fetch_ready !== false) fail("Data fetch readiness must remain false");
if (readiness.dataset_creation_ready !== false) fail("Dataset creation readiness must remain false");
if (readiness.chart_generation_ready !== false) fail("Chart generation readiness must remain false");
if (readiness.chart_insertion_ready !== false) fail("Chart insertion readiness must remain false");

if (boundary.status !== "ag10d_boundary_created_not_started") fail("AG10D boundary status mismatch");
if (boundary.next_stage_id !== "AG10D") fail("AG10D handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG10D must require explicit approval");

if (schema.status !== "schema_data_visualization_chart_pipeline_planning_only") fail("Schema status mismatch");

for (const key of [
  "chart_family_registry_allowed_in_ag10c",
  "data_source_dataset_inference_doctrine_allowed_in_ag10c",
  "reusable_chart_template_doctrine_allowed_in_ag10c",
  "chart_theme_credit_mobile_doctrine_allowed_in_ag10c",
  "ag10d_boundary_allowed_in_ag10c"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag10c",
  "homepage_mutation_allowed_in_ag10c",
  "css_js_mutation_allowed_in_ag10c",
  "data_fetch_allowed_in_ag10c",
  "dataset_creation_allowed_in_ag10c",
  "chart_generation_allowed_in_ag10c",
  "graph_generation_allowed_in_ag10c",
  "data_visualization_render_allowed_in_ag10c",
  "chart_template_creation_allowed_in_ag10c",
  "rendered_object_creation_allowed_in_ag10c",
  "object_insertion_allowed_in_ag10c",
  "image_generation_allowed_in_ag10c",
  "infographic_generation_allowed_in_ag10c",
  "table_generation_allowed_in_ag10c",
  "figure_generation_allowed_in_ag10c",
  "map_generation_allowed_in_ag10c",
  "live_url_fetch_allowed_in_ag10c",
  "deployment_trigger_allowed_in_ag10c",
  "production_jsonl_append_allowed_in_ag10c",
  "database_write_allowed_in_ag10c",
  "supabase_write_allowed_in_ag10c",
  "backend_auth_supabase_activation_allowed_in_ag10c",
  "public_publishing_operation_allowed_in_ag10c"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, plan, chartRegistry, dataDoctrine, templateDoctrine, visualDoctrine, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.data_visualization_chart_pipeline_planning_only !== true) fail(`${obj.title || "object"} must be planning-only`);
  if (obj.article_mutation_performed_in_ag10c !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.data_fetch_performed_in_ag10c !== false) fail(`${obj.title || "object"} must not fetch data`);
  if (obj.dataset_creation_performed_in_ag10c !== false) fail(`${obj.title || "object"} must not create dataset`);
  if (obj.chart_generation_performed_in_ag10c !== false) fail(`${obj.title || "object"} must not generate chart`);
  if (obj.data_visualization_render_performed_in_ag10c !== false) fail(`${obj.title || "object"} must not render visualization`);
  if (obj.chart_template_creation_performed_in_ag10c !== false) fail(`${obj.title || "object"} must not create chart template`);
  if (obj.rendered_object_creation_performed_in_ag10c !== false) fail(`${obj.title || "object"} must not create rendered object`);
  if (obj.object_insertion_performed_in_ag10c !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.database_write_performed_in_ag10c !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag10c !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag10c !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag10c !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag10c_data_visualization_planning_created_pending_explicit_ag10d") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag10d_only_with_explicit_user_approval !== true) fail("AG10D must require explicit approval");

for (const scriptName of ["generate:ag10c", "validate:ag10c"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag10c")) {
  fail("validate:project must include validate:ag10c");
}

for (const phrase of ["Purpose", "Data Lifecycle", "Template and Rendered Instance Model", "Credit Logic", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG10C document missing phrase: ${phrase}`);
}

pass("AG10C registry is present.");
pass("AG10C document is present.");
pass("AG10C review, plan, chart registry, data doctrine, reusable template doctrine, visual doctrine, readiness, AG10D boundary, schema, learning record and preview are present.");
pass("AG10B planning and handoff are consumed.");
pass("Selected article hash remains stable.");
pass("Chart family data schema registry is created.");
pass("Data source, dataset, derived metric, inference and reuse doctrine is created.");
pass("Reusable chart-template and rendered-object instance doctrine is created.");
pass("Chart theme, source/credit, mobile fallback and accessibility rules are created.");
pass("AG10D infographic pipeline boundary is created with explicit approval required.");
pass("No data fetch, dataset creation, chart generation, rendered object creation, object insertion, article mutation, backend activation or publishing operation is performed.");
pass("AG10C is Data Visualization and Chart/Graph Pipeline Planning only.");
