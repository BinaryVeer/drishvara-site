import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();





function ag11dControlledFigureDiagramInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
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
  "data/content-intelligence/quality-reviews/ag10e-figure-diagram-pipeline-planning.json",
  "data/content-intelligence/mutation-plans/ag10e-figure-diagram-pipeline-planning.json",
  "data/content-intelligence/object-registry/ag10e-reusable-figure-diagram-template-render-instance-doctrine.json",
  "data/content-intelligence/object-registry/ag10e-figure-diagram-theme-credit-mobile-doctrine.json",
  "data/content-intelligence/quality-registry/ag10e-figure-diagram-pipeline-readiness.json",
  "data/content-intelligence/mutation-plans/ag10e-to-ag10f-table-structured-object-pipeline-planning-boundary.json",
  "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
  "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
  "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  "data/content-intelligence/data-registry/ag10c-data-source-dataset-inference-doctrine.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",

  "data/content-intelligence/quality-reviews/ag10f-table-structured-object-pipeline-planning.json",
  "data/content-intelligence/mutation-plans/ag10f-table-structured-object-pipeline-planning.json",
  "data/content-intelligence/object-registry/ag10f-table-structured-object-family-registry.json",
  "data/content-intelligence/object-registry/ag10f-table-row-column-cell-schema.json",
  "data/content-intelligence/object-registry/ag10f-reusable-table-template-render-instance-doctrine.json",
  "data/content-intelligence/object-registry/ag10f-table-theme-credit-mobile-doctrine.json",
  "data/content-intelligence/quality-registry/ag10f-table-structured-object-pipeline-readiness.json",
  "data/content-intelligence/mutation-plans/ag10f-to-ag10g-map-geographic-object-pipeline-planning-boundary.json",
  "data/content-intelligence/schema/table-structured-object-pipeline-planning.schema.json",
  "data/content-intelligence/learning/ag10f-table-structured-object-pipeline-planning-learning.json",
  "data/quality/ag10f-table-structured-object-pipeline-planning.json",
  "data/quality/ag10f-table-structured-object-pipeline-planning-preview.json",
  "docs/quality/AG10F_TABLE_STRUCTURED_OBJECT_PIPELINE_PLANNING.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG10F validation failed: ${message}`);
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

const ag10eReview = readJson("data/content-intelligence/quality-reviews/ag10e-figure-diagram-pipeline-planning.json");
const ag10eReadiness = readJson("data/content-intelligence/quality-registry/ag10e-figure-diagram-pipeline-readiness.json");
const ag10eBoundary = readJson("data/content-intelligence/mutation-plans/ag10e-to-ag10f-table-structured-object-pipeline-planning-boundary.json");
const ag09cApply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag10f-table-structured-object-pipeline-planning.json");
const plan = readJson("data/content-intelligence/mutation-plans/ag10f-table-structured-object-pipeline-planning.json");
const familyRegistry = readJson("data/content-intelligence/object-registry/ag10f-table-structured-object-family-registry.json");
const rowColumnSchema = readJson("data/content-intelligence/object-registry/ag10f-table-row-column-cell-schema.json");
const templateDoctrine = readJson("data/content-intelligence/object-registry/ag10f-reusable-table-template-render-instance-doctrine.json");
const visualDoctrine = readJson("data/content-intelligence/object-registry/ag10f-table-theme-credit-mobile-doctrine.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag10f-table-structured-object-pipeline-readiness.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag10f-to-ag10g-map-geographic-object-pipeline-planning-boundary.json");
const schema = readJson("data/content-intelligence/schema/table-structured-object-pipeline-planning.schema.json");
const learning = readJson("data/content-intelligence/learning/ag10f-table-structured-object-pipeline-planning-learning.json");
const registry = readJson("data/quality/ag10f-table-structured-object-pipeline-planning.json");
const preview = readJson("data/quality/ag10f-table-structured-object-pipeline-planning-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG10F_TABLE_STRUCTURED_OBJECT_PIPELINE_PLANNING.md"), "utf8");

for (const obj of [review, plan, familyRegistry, rowColumnSchema, templateDoctrine, visualDoctrine, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG10F") fail(`module_id must be AG10F in ${obj.title || "object"}`);
}

if (ag10eReview.status !== "figure_diagram_pipeline_planning_created_not_executed") fail("AG10E review status mismatch");
if (ag10eReadiness.ready_for_ag10f !== true) fail("AG10E readiness for AG10F missing");
if (ag10eBoundary.next_stage_id !== "AG10F") fail("AG10F boundary missing in AG10E");

const target = ag09cApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const currentHash = sha256(fs.readFileSync(path.join(root, target), "utf8"));
if (currentHash !== ag09cApply.post_correction_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) fail("Selected article hash must match AG09C post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state");

if (review.status !== "table_structured_object_pipeline_planning_created_not_executed") fail("Review status mismatch");
if (plan.status !== "table_structured_object_pipeline_planning_created_not_executed") fail("Plan status mismatch");
if (registry.status !== "table_structured_object_pipeline_planning_created_not_executed") fail("Registry status mismatch");
if (preview.status !== "table_structured_object_pipeline_planning_created_not_executed") fail("Preview status mismatch");

if (familyRegistry.status !== "table_structured_object_family_registry_created_not_applied") fail("Family registry status mismatch");
if (!Array.isArray(familyRegistry.table_families) || familyRegistry.table_families.length !== 6) fail("Table family count mismatch");
if (familyRegistry.source_table_object_count < 13) fail("Source table object count appears incomplete");

const allTypes = familyRegistry.table_families.flatMap((item) => item.table_types || []);
for (const item of [
  "data_table",
  "facts_table",
  "summary_table",
  "comparison_table",
  "feature_matrix",
  "pros_cons_table",
  "ranking_table",
  "score_table",
  "kpi_summary_table",
  "timeline_table",
  "policy_provision_table",
  "risk_matrix",
  "glossary_table"
]) {
  if (!allTypes.includes(item)) fail(`Missing table type: ${item}`);
}

for (const field of [
  "table_type",
  "article_id",
  "object_template_id",
  "rights_controller",
  "credit_display",
  "caption",
  "alt_text",
  "mobile_fallback_text",
  "reuse_eligibility_status"
]) {
  if (!familyRegistry.universal_table_schema.required_metadata.includes(field)) {
    fail(`Missing universal table metadata field: ${field}`);
  }
}

for (const field of [
  "title",
  "columns",
  "rows",
  "cell_values",
  "source_note",
  "editorial_purpose",
  "responsive_strategy"
]) {
  if (!familyRegistry.universal_table_schema.required_structure_fields.includes(field)) {
    fail(`Missing universal table structure field: ${field}`);
  }
}

if (rowColumnSchema.status !== "table_row_column_cell_schema_created_not_applied") fail("Row/column/cell schema status mismatch");
if (!Array.isArray(rowColumnSchema.schema_components) || rowColumnSchema.schema_components.length !== 7) fail("Row/column/cell schema component count mismatch");

for (const componentType of [
  "table",
  "column",
  "row",
  "cell",
  "footnote",
  "responsive_wrapper",
  "accessibility_summary"
]) {
  if (!rowColumnSchema.schema_components.some((item) => item.component_type === componentType)) {
    fail(`Missing schema component type: ${componentType}`);
  }
}

if (!rowColumnSchema.validation_rules.some((rule) => rule.includes("Every table"))) fail("Table validation rule missing");
if (!rowColumnSchema.validation_rules.some((rule) => rule.includes("more than four columns"))) fail("Responsive column rule missing");
if (!rowColumnSchema.validation_rules.some((rule) => rule.includes("centrally aligned"))) fail("Central alignment rule missing");

if (templateDoctrine.status !== "reusable_table_template_doctrine_created_not_applied") fail("Template doctrine status mismatch");

for (const step of [
  "table_template",
  "row_column_data_binding",
  "rendered_table_instance",
  "article_placement",
  "post_insertion_layout_audit",
  "reuse_log"
]) {
  if (!templateDoctrine.pipeline_model.includes(step)) fail(`Missing table template pipeline step: ${step}`);
}

for (const field of [
  "table_template_id",
  "table_family",
  "table_type",
  "theme_variant",
  "row_column_schema_required",
  "rights_controller",
  "ownership_status",
  "template_hash"
]) {
  if (!templateDoctrine.table_template_fields.includes(field)) fail(`Missing table template field: ${field}`);
}

for (const field of [
  "rendered_table_id",
  "table_template_id",
  "article_id",
  "row_column_binding_id",
  "html_or_structured_asset_path",
  "caption",
  "credit",
  "alt_text",
  "rendered_hash"
]) {
  if (!templateDoctrine.rendered_table_fields.includes(field)) fail(`Missing rendered table field: ${field}`);
}

if (visualDoctrine.status !== "table_theme_credit_mobile_doctrine_created_not_applied") fail("Visual doctrine status mismatch");

for (const credit of [
  "Table: Drishvara.",
  "Data source: [source]. Table: Drishvara.",
  "Data source: [source]. Analysis and table: Drishvara.",
  "Sources: [source list]. Table: Drishvara."
]) {
  if (!visualDoctrine.credit_rules.some((item) => item.credit === credit)) fail(`Missing table credit rule: ${credit}`);
}

if (!visualDoctrine.mobile_rules.some((item) => item.includes("No uncontrolled horizontal overflow"))) fail("Mobile overflow rule missing");
if (!visualDoctrine.placement_rules.some((item) => item.includes("centrally aligned"))) fail("Central alignment placement rule missing");
if (!visualDoctrine.placement_rules.some((item) => item.includes("not deform article shape"))) fail("Article-shape placement rule missing");
if (!visualDoctrine.cost_rules.some((item) => item.includes("reusable HTML/structured table templates"))) fail("Cost-control reusable template rule missing");
if (!visualDoctrine.accessibility_rules.some((item) => item.includes("Accessibility summary"))) fail("Accessibility summary rule missing");

if (readiness.status !== "table_structured_object_pipeline_planning_ready_pending_explicit_ag10g") fail("Readiness status mismatch");
if (readiness.ready_for_ag10g !== true) fail("AG10G readiness missing");
if (readiness.table_generation_ready !== false) fail("Table generation readiness must remain false");
if (readiness.table_render_ready !== false) fail("Table render readiness must remain false");
if (readiness.data_fetch_ready !== false) fail("Data fetch readiness must remain false");
if (readiness.object_insertion_ready !== false) fail("Object insertion readiness must remain false");

if (boundary.status !== "ag10g_boundary_created_not_started") fail("AG10G boundary status mismatch");
if (boundary.next_stage_id !== "AG10G") fail("AG10G handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG10G must require explicit approval");

if (schema.status !== "schema_table_structured_object_pipeline_planning_only") fail("Schema status mismatch");

for (const key of [
  "table_family_registry_allowed_in_ag10f",
  "row_column_cell_schema_allowed_in_ag10f",
  "reusable_table_template_doctrine_allowed_in_ag10f",
  "table_theme_credit_mobile_doctrine_allowed_in_ag10f",
  "ag10g_boundary_allowed_in_ag10f"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag10f",
  "homepage_mutation_allowed_in_ag10f",
  "css_js_mutation_allowed_in_ag10f",
  "data_fetch_allowed_in_ag10f",
  "dataset_creation_allowed_in_ag10f",
  "table_generation_allowed_in_ag10f",
  "structured_object_creation_allowed_in_ag10f",
  "table_render_allowed_in_ag10f",
  "table_template_creation_allowed_in_ag10f",
  "rendered_table_creation_allowed_in_ag10f",
  "html_table_asset_creation_allowed_in_ag10f",
  "csv_export_creation_allowed_in_ag10f",
  "object_insertion_allowed_in_ag10f",
  "visual_generation_allowed_in_ag10f",
  "image_generation_allowed_in_ag10f",
  "chart_generation_allowed_in_ag10f",
  "infographic_generation_allowed_in_ag10f",
  "figure_generation_allowed_in_ag10f",
  "diagram_generation_allowed_in_ag10f",
  "map_generation_allowed_in_ag10f",
  "live_url_fetch_allowed_in_ag10f",
  "deployment_trigger_allowed_in_ag10f",
  "production_jsonl_append_allowed_in_ag10f",
  "database_write_allowed_in_ag10f",
  "supabase_write_allowed_in_ag10f",
  "backend_auth_supabase_activation_allowed_in_ag10f",
  "public_publishing_operation_allowed_in_ag10f"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, plan, familyRegistry, rowColumnSchema, templateDoctrine, visualDoctrine, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.table_structured_object_pipeline_planning_only !== true) fail(`${obj.title || "object"} must be planning-only`);
  if (obj.article_mutation_performed_in_ag10f !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.data_fetch_performed_in_ag10f !== false) fail(`${obj.title || "object"} must not fetch data`);
  if (obj.table_generation_performed_in_ag10f !== false) fail(`${obj.title || "object"} must not generate table`);
  if (obj.structured_object_creation_performed_in_ag10f !== false) fail(`${obj.title || "object"} must not create structured object`);
  if (obj.table_render_performed_in_ag10f !== false) fail(`${obj.title || "object"} must not render table`);
  if (obj.table_template_creation_performed_in_ag10f !== false) fail(`${obj.title || "object"} must not create table template`);
  if (obj.rendered_table_creation_performed_in_ag10f !== false) fail(`${obj.title || "object"} must not create rendered table`);
  if (obj.object_insertion_performed_in_ag10f !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.database_write_performed_in_ag10f !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag10f !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag10f !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag10f !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag10f_table_structured_object_planning_created_pending_explicit_ag10g") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag10g_only_with_explicit_user_approval !== true) fail("AG10G must require explicit approval");

for (const scriptName of ["generate:ag10f", "validate:ag10f"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag10f")) {
  fail("validate:project must include validate:ag10f");
}

for (const phrase of ["Purpose", "Table Families", "Row Column Cell Schema", "Template and Rendered Instance Model", "Credit Logic", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG10F document missing phrase: ${phrase}`);
}

pass("AG10F registry is present.");
pass("AG10F document is present.");
pass("AG10F review, plan, family registry, row/column/cell schema, reusable table doctrine, visual doctrine, readiness, AG10G boundary, schema, learning record and preview are present.");
pass("AG10E planning and handoff are consumed.");
pass("Selected article hash remains stable.");
pass("Table and structured-object family registry is created.");
pass("Table row-column-cell schema is created.");
pass("Reusable table-template and rendered-instance doctrine is created.");
pass("Table theme, source/credit, mobile overflow, central alignment, accessibility and cost rules are created.");
pass("AG10G map/geographic object pipeline boundary is created with explicit approval required.");
pass("No table generation, data fetch, object insertion, article mutation, backend activation or publishing operation is performed.");
pass("AG10F is Table and Structured Object Pipeline Planning only.");
