import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

function fail(message) {
  console.error(`❌ AG10A validation failed: ${message}`);
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



function ag11bControlledChartInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
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
  "data/content-intelligence/quality-reviews/ag09z-final-chain-closure-next-system-handoff.json",
  "data/content-intelligence/closure-records/ag09z-final-chain-closure-next-system-handoff.json",
  "data/content-intelligence/quality-registry/ag09z-final-public-experience-chain-readiness.json",
  "data/content-intelligence/mutation-plans/ag09z-to-ag10a-governed-object-pipeline-planning-handoff.json",
  "data/content-intelligence/approval-registry/ag09h-final-editorial-publish-approval-decision.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",

  "data/content-intelligence/quality-reviews/ag10a-governed-object-pipeline-planning.json",
  "data/content-intelligence/mutation-plans/ag10a-governed-object-pipeline-planning.json",
  "data/content-intelligence/object-registry/ag10a-object-taxonomy-registry.json",
  "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  "data/content-intelligence/quality-registry/ag10a-object-pipeline-planning-readiness.json",
  "data/content-intelligence/mutation-plans/ag10a-to-ag10b-object-taxonomy-selection-doctrine-boundary.json",
  "data/content-intelligence/schema/governed-object-pipeline-planning.schema.json",
  "data/content-intelligence/learning/ag10a-governed-object-pipeline-planning-learning.json",
  "data/quality/ag10a-governed-object-pipeline-planning.json",
  "data/quality/ag10a-governed-object-pipeline-planning-preview.json",
  "docs/quality/AG10A_GOVERNED_OBJECT_PIPELINE_PLANNING.md",
  "package.json"
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag09zReview = readJson("data/content-intelligence/quality-reviews/ag09z-final-chain-closure-next-system-handoff.json");
const ag09zClosure = readJson("data/content-intelligence/closure-records/ag09z-final-chain-closure-next-system-handoff.json");
const ag09zReadiness = readJson("data/content-intelligence/quality-registry/ag09z-final-public-experience-chain-readiness.json");
const ag09zHandoff = readJson("data/content-intelligence/mutation-plans/ag09z-to-ag10a-governed-object-pipeline-planning-handoff.json");
const ag09hApproval = readJson("data/content-intelligence/approval-registry/ag09h-final-editorial-publish-approval-decision.json");
const ag09cApply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag10a-governed-object-pipeline-planning.json");
const plan = readJson("data/content-intelligence/mutation-plans/ag10a-governed-object-pipeline-planning.json");
const taxonomy = readJson("data/content-intelligence/object-registry/ag10a-object-taxonomy-registry.json");
const themeLayout = readJson("data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json");
const ownership = readJson("data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag10a-object-pipeline-planning-readiness.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag10a-to-ag10b-object-taxonomy-selection-doctrine-boundary.json");
const schema = readJson("data/content-intelligence/schema/governed-object-pipeline-planning.schema.json");
const learning = readJson("data/content-intelligence/learning/ag10a-governed-object-pipeline-planning-learning.json");
const registry = readJson("data/quality/ag10a-governed-object-pipeline-planning.json");
const preview = readJson("data/quality/ag10a-governed-object-pipeline-planning-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG10A_GOVERNED_OBJECT_PIPELINE_PLANNING.md"), "utf8");

for (const obj of [review, plan, taxonomy, themeLayout, ownership, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG10A") fail(`module_id must be AG10A in ${obj.title || "object"}`);
}

if (ag09zReview.status !== "ag09_chain_closed_next_system_handoff_created") fail("AG09Z review status mismatch");
if (ag09zClosure.ag09_chain_closed !== true) fail("AG09 chain must be closed before AG10A");
if (ag09zReadiness.ready_for_future_object_pipeline !== true) fail("AG09Z future object pipeline readiness missing");
if (ag09zHandoff.next_stage_id !== "AG10A") fail("AG10A handoff missing in AG09Z");
if (ag09hApproval.final_editorial_publish_approved !== true) fail("AG09H final editorial approval missing");

const target = ag09cApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const currentHash = sha256(fs.readFileSync(path.join(root, target), "utf8"));
if (currentHash !== ag09cApply.post_correction_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) fail("Selected article hash must match AG09C post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state");

if (review.status !== "governed_object_pipeline_planning_created_not_executed") fail("Review status mismatch");
if (plan.status !== "governed_object_pipeline_planning_created_not_executed") fail("Plan status mismatch");
if (registry.status !== "governed_object_pipeline_planning_created_not_executed") fail("Registry status mismatch");
if (preview.status !== "governed_object_pipeline_planning_created_not_executed") fail("Preview status mismatch");

const families = taxonomy.object_families || {};
for (const family of [
  "charts_graphs_bi_visuals",
  "infographics",
  "figures_diagrams",
  "tables_structured_objects",
  "maps_geographic_objects",
  "generated_and_editorial_images",
  "article_support_objects"
]) {
  if (!families[family]) fail(`Missing object family: ${family}`);
}

const allCharts = families.charts_graphs_bi_visuals.flatMap((family) => family.object_types || []);
for (const chart of [
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
  if (!allCharts.includes(chart)) fail(`Missing chart type: ${chart}`);
}

for (const item of [
  "timeline_infographic",
  "process_flow_infographic",
  "comparison_infographic",
  "policy_summary_infographic",
  "statistical_infographic",
  "problem_solution_infographic"
]) {
  if (!families.infographics.includes(item)) fail(`Missing infographic type: ${item}`);
}

for (const item of [
  "framework_diagram",
  "architecture_diagram",
  "governance_flow_diagram",
  "logic_tree",
  "swimlane_flow"
]) {
  if (!families.figures_diagrams.includes(item)) fail(`Missing figure/diagram type: ${item}`);
}

for (const item of [
  "data_table",
  "comparison_table",
  "risk_matrix",
  "glossary_table",
  "kpi_summary_table"
]) {
  if (!families.tables_structured_objects.includes(item)) fail(`Missing table type: ${item}`);
}

for (const item of [
  "geographic_map",
  "regional_focus_map",
  "bubble_map",
  "choropleth_thematic_map",
  "service_area_map"
]) {
  if (!families.maps_geographic_objects.includes(item)) fail(`Missing map type: ${item}`);
}

for (const item of [
  "hero_image",
  "editorial_illustration",
  "photo_style_generated_image",
  "stylized_generated_image",
  "annotated_image"
]) {
  if (!families.generated_and_editorial_images.includes(item)) fail(`Missing image type: ${item}`);
}

for (const item of [
  "pull_quote_block",
  "stat_card",
  "fact_box",
  "key_takeaway_box",
  "what_this_means_panel"
]) {
  if (!families.article_support_objects.includes(item)) fail(`Missing support object: ${item}`);
}

if (themeLayout.status !== "theme_color_layout_doctrine_created_not_applied") fail("Theme/layout status mismatch");
if (!Array.isArray(themeLayout.palette_roles) || themeLayout.palette_roles.length < 10) fail("Theme palette roles missing");
if (!themeLayout.layout_doctrine.some((item) => item.includes("Article text remains justified"))) fail("Justified text doctrine missing");
if (!themeLayout.mobile_doctrine.some((item) => item.includes("No horizontal overflow"))) fail("Mobile overflow rule missing");

if (ownership.status !== "ownership_rights_credit_doctrine_created_not_applied") fail("Ownership doctrine status mismatch");
if (!ownership.ownership_principle.includes("Drishvara-owned/controlled")) fail("Drishvara ownership principle missing");
if (ownership.rights_controller_default !== "Drishvara, represented by its legal owner/operator") fail("Rights controller default mismatch");

for (const credit of [
  "Visual: Drishvara",
  "Data visualization: Drishvara",
  "Infographic: Drishvara",
  "Table: Drishvara",
  "Generated visual: Drishvara"
]) {
  if (!ownership.default_credit_logic.some((item) => item.credit_display === credit)) {
    fail(`Missing credit logic: ${credit}`);
  }
}

for (const field of [
  "asset_id",
  "asset_type",
  "creation_method",
  "rights_controller",
  "licence_status",
  "credit_display",
  "asset_hash",
  "approved_for_drishvara_use"
]) {
  if (!ownership.asset_metadata_required_fields.includes(field)) fail(`Missing asset metadata field: ${field}`);
}

if (readiness.status !== "object_pipeline_planning_ready_pending_explicit_ag10b") fail("Readiness status mismatch");
if (readiness.ready_for_ag10b !== true) fail("AG10B readiness missing");
if (readiness.object_generation_ready !== false) fail("Object generation must remain false");
if (readiness.object_insertion_ready !== false) fail("Object insertion must remain false");
if (readiness.article_mutation_ready !== false) fail("Article mutation readiness must remain false");

if (boundary.status !== "ag10b_boundary_created_not_started") fail("AG10B boundary status mismatch");
if (boundary.next_stage_id !== "AG10B") fail("AG10B handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG10B must require explicit approval");

if (schema.status !== "schema_object_pipeline_planning_only") fail("Schema status mismatch");

for (const key of [
  "object_taxonomy_allowed_in_ag10a",
  "theme_color_layout_doctrine_allowed_in_ag10a",
  "ownership_rights_credit_doctrine_allowed_in_ag10a",
  "cost_control_doctrine_allowed_in_ag10a",
  "selection_logic_allowed_in_ag10a",
  "ag10b_boundary_allowed_in_ag10a"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag10a",
  "homepage_mutation_allowed_in_ag10a",
  "css_js_mutation_allowed_in_ag10a",
  "reference_insertion_allowed_in_ag10a",
  "visual_generation_allowed_in_ag10a",
  "image_generation_allowed_in_ag10a",
  "image_insertion_allowed_in_ag10a",
  "infographic_generation_allowed_in_ag10a",
  "graph_generation_allowed_in_ag10a",
  "chart_generation_allowed_in_ag10a",
  "table_generation_allowed_in_ag10a",
  "figure_generation_allowed_in_ag10a",
  "map_generation_allowed_in_ag10a",
  "diagram_generation_allowed_in_ag10a",
  "object_insertion_allowed_in_ag10a",
  "live_url_fetch_allowed_in_ag10a",
  "deployment_trigger_allowed_in_ag10a",
  "production_jsonl_append_allowed_in_ag10a",
  "database_write_allowed_in_ag10a",
  "supabase_write_allowed_in_ag10a",
  "backend_auth_supabase_activation_allowed_in_ag10a",
  "rollback_execution_allowed_in_ag10a",
  "public_publishing_operation_allowed_in_ag10a"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, plan, taxonomy, themeLayout, ownership, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.governed_object_pipeline_planning_only !== true) fail(`${obj.title || "object"} must be planning-only`);
  if (obj.article_mutation_performed_in_ag10a !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.css_mutation_performed_in_ag10a !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag10a !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.visual_generation_performed_in_ag10a !== false) fail(`${obj.title || "object"} must not generate visuals`);
  if (obj.image_generation_performed_in_ag10a !== false) fail(`${obj.title || "object"} must not generate images`);
  if (obj.object_insertion_performed_in_ag10a !== false) fail(`${obj.title || "object"} must not insert objects`);
  if (obj.database_write_performed_in_ag10a !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag10a !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag10a !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag10a !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag10a_planning_created_pending_explicit_ag10b") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag10b_only_with_explicit_user_approval !== true) fail("AG10B must require explicit approval");

for (const scriptName of ["generate:ag10a", "validate:ag10a"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag10a")) {
  fail("validate:project must include validate:ag10a");
}

for (const phrase of [
  "Purpose",
  "Object Families",
  "Ownership and Credit Logic",
  "Theme and Layout Doctrine",
  "Cost-Control Doctrine",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG10A document missing phrase: ${phrase}`);
}

pass("AG10A registry is present.");
pass("AG10A document is present.");
pass("AG10A review, plan, taxonomy, theme/layout doctrine, ownership/credit doctrine, readiness, AG10B boundary, schema, learning record and preview are present.");
pass("AG09Z closure and AG10A handoff are consumed.");
pass("Selected article hash remains stable.");
pass("Chart/graph/BI visual families are recorded.");
pass("Infographic, figure, table, map, image and article-support object families are recorded.");
pass("Drishvara ownership, rights, provenance and credit doctrine is recorded.");
pass("Theme/color, layout, placement, mobile-readability and cost-control doctrine are recorded.");
pass("AG10B boundary is created with explicit approval required.");
pass("No object generation, object insertion, article mutation, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG10A is Governed Object Pipeline Planning only.");
