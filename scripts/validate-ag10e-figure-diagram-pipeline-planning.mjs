import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();








function ag11gControlledCompositeInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
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
  "data/content-intelligence/quality-reviews/ag10d-infographic-pipeline-planning.json",
  "data/content-intelligence/mutation-plans/ag10d-infographic-pipeline-planning.json",
  "data/content-intelligence/object-registry/ag10d-reusable-infographic-template-render-instance-doctrine.json",
  "data/content-intelligence/object-registry/ag10d-infographic-theme-credit-mobile-doctrine.json",
  "data/content-intelligence/quality-registry/ag10d-infographic-pipeline-readiness.json",
  "data/content-intelligence/mutation-plans/ag10d-to-ag10e-figure-diagram-pipeline-planning-boundary.json",
  "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
  "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
  "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",

  "data/content-intelligence/quality-reviews/ag10e-figure-diagram-pipeline-planning.json",
  "data/content-intelligence/mutation-plans/ag10e-figure-diagram-pipeline-planning.json",
  "data/content-intelligence/object-registry/ag10e-figure-diagram-family-structure-registry.json",
  "data/content-intelligence/object-registry/ag10e-figure-diagram-node-edge-schema.json",
  "data/content-intelligence/object-registry/ag10e-reusable-figure-diagram-template-render-instance-doctrine.json",
  "data/content-intelligence/object-registry/ag10e-figure-diagram-theme-credit-mobile-doctrine.json",
  "data/content-intelligence/quality-registry/ag10e-figure-diagram-pipeline-readiness.json",
  "data/content-intelligence/mutation-plans/ag10e-to-ag10f-table-structured-object-pipeline-planning-boundary.json",
  "data/content-intelligence/schema/figure-diagram-pipeline-planning.schema.json",
  "data/content-intelligence/learning/ag10e-figure-diagram-pipeline-planning-learning.json",
  "data/quality/ag10e-figure-diagram-pipeline-planning.json",
  "data/quality/ag10e-figure-diagram-pipeline-planning-preview.json",
  "docs/quality/AG10E_FIGURE_DIAGRAM_PIPELINE_PLANNING.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG10E validation failed: ${message}`);
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

const ag10dReview = readJson("data/content-intelligence/quality-reviews/ag10d-infographic-pipeline-planning.json");
const ag10dReadiness = readJson("data/content-intelligence/quality-registry/ag10d-infographic-pipeline-readiness.json");
const ag10dBoundary = readJson("data/content-intelligence/mutation-plans/ag10d-to-ag10e-figure-diagram-pipeline-planning-boundary.json");
const ag09cApply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag10e-figure-diagram-pipeline-planning.json");
const plan = readJson("data/content-intelligence/mutation-plans/ag10e-figure-diagram-pipeline-planning.json");
const familyRegistry = readJson("data/content-intelligence/object-registry/ag10e-figure-diagram-family-structure-registry.json");
const nodeEdgeSchema = readJson("data/content-intelligence/object-registry/ag10e-figure-diagram-node-edge-schema.json");
const templateDoctrine = readJson("data/content-intelligence/object-registry/ag10e-reusable-figure-diagram-template-render-instance-doctrine.json");
const visualDoctrine = readJson("data/content-intelligence/object-registry/ag10e-figure-diagram-theme-credit-mobile-doctrine.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag10e-figure-diagram-pipeline-readiness.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag10e-to-ag10f-table-structured-object-pipeline-planning-boundary.json");
const schema = readJson("data/content-intelligence/schema/figure-diagram-pipeline-planning.schema.json");
const learning = readJson("data/content-intelligence/learning/ag10e-figure-diagram-pipeline-planning-learning.json");
const registry = readJson("data/quality/ag10e-figure-diagram-pipeline-planning.json");
const preview = readJson("data/quality/ag10e-figure-diagram-pipeline-planning-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG10E_FIGURE_DIAGRAM_PIPELINE_PLANNING.md"), "utf8");

for (const obj of [review, plan, familyRegistry, nodeEdgeSchema, templateDoctrine, visualDoctrine, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG10E") fail(`module_id must be AG10E in ${obj.title || "object"}`);
}

if (ag10dReview.status !== "infographic_pipeline_planning_created_not_executed") fail("AG10D review status mismatch");
if (ag10dReadiness.ready_for_ag10e !== true) fail("AG10D readiness for AG10E missing");
if (ag10dBoundary.next_stage_id !== "AG10E") fail("AG10E boundary missing in AG10D");

const target = ag09cApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const currentHash = sha256(fs.readFileSync(path.join(root, target), "utf8"));
if (currentHash !== ag09cApply.post_correction_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) fail("Selected article hash must match AG09C post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state");

if (review.status !== "figure_diagram_pipeline_planning_created_not_executed") fail("Review status mismatch");
if (plan.status !== "figure_diagram_pipeline_planning_created_not_executed") fail("Plan status mismatch");
if (registry.status !== "figure_diagram_pipeline_planning_created_not_executed") fail("Registry status mismatch");
if (preview.status !== "figure_diagram_pipeline_planning_created_not_executed") fail("Preview status mismatch");

if (familyRegistry.status !== "figure_diagram_family_structure_registry_created_not_applied") fail("Family registry status mismatch");
if (!Array.isArray(familyRegistry.figure_diagram_families) || familyRegistry.figure_diagram_families.length !== 7) fail("Figure/diagram family count mismatch");
if (familyRegistry.source_figure_diagram_object_count < 15) fail("Source figure/diagram object count appears incomplete");

const allTypes = familyRegistry.figure_diagram_families.flatMap((item) => item.figure_diagram_types || []);
for (const item of [
  "concept_diagram",
  "framework_diagram",
  "simplified_model_diagram",
  "explanatory_diagram",
  "architecture_diagram",
  "system_diagram",
  "schematic_figure",
  "governance_flow_diagram",
  "hierarchy_org_diagram",
  "decision_flow",
  "logic_tree",
  "process_figure",
  "swimlane_flow",
  "network_diagram",
  "venn_diagram",
  "matrix_diagram",
  "quadrant_figure",
  "annotated_figure"
]) {
  if (!allTypes.includes(item)) fail(`Missing figure/diagram type: ${item}`);
}

for (const field of [
  "figure_diagram_type",
  "article_id",
  "object_template_id",
  "rights_controller",
  "credit_display",
  "caption",
  "alt_text",
  "mobile_fallback_text",
  "reuse_eligibility_status"
]) {
  if (!familyRegistry.universal_figure_diagram_schema.required_metadata.includes(field)) {
    fail(`Missing universal figure/diagram metadata field: ${field}`);
  }
}

for (const field of [
  "title",
  "core_message",
  "nodes_or_components",
  "relationships_or_edges",
  "visual_structure",
  "source_or_logic_note",
  "editorial_purpose"
]) {
  if (!familyRegistry.universal_figure_diagram_schema.required_structure_fields.includes(field)) {
    fail(`Missing universal figure/diagram structure field: ${field}`);
  }
}

if (nodeEdgeSchema.status !== "figure_diagram_node_edge_schema_created_not_applied") fail("Node/edge schema status mismatch");
if (!Array.isArray(nodeEdgeSchema.schema_components) || nodeEdgeSchema.schema_components.length !== 7) fail("Node/edge schema component count mismatch");

for (const componentType of [
  "node",
  "edge",
  "swimlane",
  "axis",
  "annotation",
  "legend",
  "fallback_summary"
]) {
  if (!nodeEdgeSchema.schema_components.some((item) => item.component_type === componentType)) {
    fail(`Missing schema component type: ${componentType}`);
  }
}

if (!nodeEdgeSchema.validation_rules.some((rule) => rule.includes("Every node"))) fail("Node validation rule missing");
if (!nodeEdgeSchema.validation_rules.some((rule) => rule.includes("Every edge"))) fail("Edge validation rule missing");
if (!nodeEdgeSchema.validation_rules.some((rule) => rule.includes("Mobile fallback summary"))) fail("Mobile fallback validation rule missing");

if (templateDoctrine.status !== "reusable_figure_diagram_template_doctrine_created_not_applied") fail("Template doctrine status mismatch");

for (const step of [
  "figure_diagram_template",
  "node_edge_content_binding",
  "rendered_figure_diagram_instance",
  "article_placement",
  "post_insertion_layout_audit",
  "reuse_log"
]) {
  if (!templateDoctrine.pipeline_model.includes(step)) fail(`Missing figure/diagram template pipeline step: ${step}`);
}

for (const field of [
  "figure_diagram_template_id",
  "figure_diagram_family",
  "figure_diagram_type",
  "theme_variant",
  "node_edge_schema_required",
  "rights_controller",
  "ownership_status",
  "template_hash"
]) {
  if (!templateDoctrine.figure_diagram_template_fields.includes(field)) fail(`Missing figure/diagram template field: ${field}`);
}

for (const field of [
  "rendered_figure_diagram_id",
  "figure_diagram_template_id",
  "article_id",
  "node_edge_binding_id",
  "asset_path",
  "caption",
  "credit",
  "alt_text",
  "rendered_hash"
]) {
  if (!templateDoctrine.rendered_figure_diagram_fields.includes(field)) fail(`Missing rendered figure/diagram field: ${field}`);
}

if (visualDoctrine.status !== "figure_diagram_theme_credit_mobile_doctrine_created_not_applied") fail("Visual doctrine status mismatch");

for (const credit of [
  "Figure: Drishvara.",
  "Diagram: Drishvara.",
  "Source: [source]. Figure/diagram: Drishvara.",
  "Source: [source]. Interpretation and diagram: Drishvara."
]) {
  if (!visualDoctrine.credit_rules.some((item) => item.credit === credit)) fail(`Missing figure/diagram credit rule: ${credit}`);
}

if (!visualDoctrine.mobile_rules.some((item) => item.includes("No horizontal overflow"))) fail("Mobile overflow rule missing");
if (!visualDoctrine.placement_rules.some((item) => item.includes("not deform article shape"))) fail("Article-shape placement rule missing");
if (!visualDoctrine.cost_rules.some((item) => item.includes("reusable SVG/HTML diagram templates"))) fail("Cost-control reusable template rule missing");
if (!visualDoctrine.accessibility_rules.some((item) => item.includes("Alt text"))) fail("Alt text accessibility rule missing");

if (readiness.status !== "figure_diagram_pipeline_planning_ready_pending_explicit_ag10f") fail("Readiness status mismatch");
if (readiness.ready_for_ag10f !== true) fail("AG10F readiness missing");
if (readiness.figure_generation_ready !== false) fail("Figure generation readiness must remain false");
if (readiness.diagram_generation_ready !== false) fail("Diagram generation readiness must remain false");
if (readiness.svg_asset_creation_ready !== false) fail("SVG asset creation readiness must remain false");
if (readiness.object_insertion_ready !== false) fail("Object insertion readiness must remain false");

if (boundary.status !== "ag10f_boundary_created_not_started") fail("AG10F boundary status mismatch");
if (boundary.next_stage_id !== "AG10F") fail("AG10F handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG10F must require explicit approval");

if (schema.status !== "schema_figure_diagram_pipeline_planning_only") fail("Schema status mismatch");

for (const key of [
  "figure_diagram_family_registry_allowed_in_ag10e",
  "node_edge_schema_allowed_in_ag10e",
  "reusable_figure_diagram_template_doctrine_allowed_in_ag10e",
  "figure_diagram_theme_credit_mobile_doctrine_allowed_in_ag10e",
  "ag10f_boundary_allowed_in_ag10e"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag10e",
  "homepage_mutation_allowed_in_ag10e",
  "css_js_mutation_allowed_in_ag10e",
  "data_fetch_allowed_in_ag10e",
  "dataset_creation_allowed_in_ag10e",
  "figure_generation_allowed_in_ag10e",
  "diagram_generation_allowed_in_ag10e",
  "figure_render_allowed_in_ag10e",
  "diagram_render_allowed_in_ag10e",
  "figure_template_creation_allowed_in_ag10e",
  "diagram_template_creation_allowed_in_ag10e",
  "rendered_figure_diagram_creation_allowed_in_ag10e",
  "svg_asset_creation_allowed_in_ag10e",
  "image_asset_creation_allowed_in_ag10e",
  "object_insertion_allowed_in_ag10e",
  "visual_generation_allowed_in_ag10e",
  "image_generation_allowed_in_ag10e",
  "chart_generation_allowed_in_ag10e",
  "infographic_generation_allowed_in_ag10e",
  "table_generation_allowed_in_ag10e",
  "map_generation_allowed_in_ag10e",
  "live_url_fetch_allowed_in_ag10e",
  "deployment_trigger_allowed_in_ag10e",
  "production_jsonl_append_allowed_in_ag10e",
  "database_write_allowed_in_ag10e",
  "supabase_write_allowed_in_ag10e",
  "backend_auth_supabase_activation_allowed_in_ag10e",
  "public_publishing_operation_allowed_in_ag10e"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, plan, familyRegistry, nodeEdgeSchema, templateDoctrine, visualDoctrine, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.figure_diagram_pipeline_planning_only !== true) fail(`${obj.title || "object"} must be planning-only`);
  if (obj.article_mutation_performed_in_ag10e !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.figure_generation_performed_in_ag10e !== false) fail(`${obj.title || "object"} must not generate figure`);
  if (obj.diagram_generation_performed_in_ag10e !== false) fail(`${obj.title || "object"} must not generate diagram`);
  if (obj.figure_render_performed_in_ag10e !== false) fail(`${obj.title || "object"} must not render figure`);
  if (obj.diagram_render_performed_in_ag10e !== false) fail(`${obj.title || "object"} must not render diagram`);
  if (obj.figure_template_creation_performed_in_ag10e !== false) fail(`${obj.title || "object"} must not create figure template`);
  if (obj.diagram_template_creation_performed_in_ag10e !== false) fail(`${obj.title || "object"} must not create diagram template`);
  if (obj.rendered_figure_diagram_creation_performed_in_ag10e !== false) fail(`${obj.title || "object"} must not create rendered figure/diagram`);
  if (obj.svg_asset_creation_performed_in_ag10e !== false) fail(`${obj.title || "object"} must not create SVG asset`);
  if (obj.image_asset_creation_performed_in_ag10e !== false) fail(`${obj.title || "object"} must not create image asset`);
  if (obj.object_insertion_performed_in_ag10e !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.database_write_performed_in_ag10e !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag10e !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag10e !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag10e !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag10e_figure_diagram_planning_created_pending_explicit_ag10f") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag10f_only_with_explicit_user_approval !== true) fail("AG10F must require explicit approval");

for (const scriptName of ["generate:ag10e", "validate:ag10e"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag10e")) {
  fail("validate:project must include validate:ag10e");
}

for (const phrase of ["Purpose", "Figure and Diagram Families", "Node and Edge Schema", "Template and Rendered Instance Model", "Credit Logic", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG10E document missing phrase: ${phrase}`);
}

pass("AG10E registry is present.");
pass("AG10E document is present.");
pass("AG10E review, plan, family registry, node/edge schema, reusable template doctrine, visual doctrine, readiness, AG10F boundary, schema, learning record and preview are present.");
pass("AG10D planning and handoff are consumed.");
pass("Selected article hash remains stable.");
pass("Figure and diagram family structure registry is created.");
pass("Figure/diagram node-edge schema is created.");
pass("Reusable figure/diagram-template and rendered-instance doctrine is created.");
pass("Figure/diagram theme, source/credit, mobile fallback, placement, accessibility and cost rules are created.");
pass("AG10F table/structured object pipeline boundary is created with explicit approval required.");
pass("No figure/diagram generation, asset creation, object insertion, article mutation, backend activation or publishing operation is performed.");
pass("AG10E is Figure and Diagram Pipeline Planning only.");
