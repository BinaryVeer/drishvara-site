import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();




function ag11cControlledInfographicInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
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
  "data/content-intelligence/quality-reviews/ag10f-table-structured-object-pipeline-planning.json",
  "data/content-intelligence/mutation-plans/ag10f-table-structured-object-pipeline-planning.json",
  "data/content-intelligence/quality-registry/ag10f-table-structured-object-pipeline-readiness.json",
  "data/content-intelligence/mutation-plans/ag10f-to-ag10g-map-geographic-object-pipeline-planning-boundary.json",
  "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
  "data/content-intelligence/object-registry/ag10b-object-selection-scoring-doctrine.json",
  "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
  "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  "data/content-intelligence/data-registry/ag10c-data-source-dataset-inference-doctrine.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",

  "data/content-intelligence/quality-reviews/ag10g-map-geographic-object-pipeline-planning.json",
  "data/content-intelligence/mutation-plans/ag10g-map-geographic-object-pipeline-planning.json",
  "data/content-intelligence/quality-registry/ag10g-new-aspect-inclusion-gate.json",
  "data/content-intelligence/object-registry/ag10g-map-geographic-object-family-registry.json",
  "data/content-intelligence/object-registry/ag10g-geo-data-location-schema.json",
  "data/content-intelligence/object-registry/ag10g-reusable-map-template-render-instance-doctrine.json",
  "data/content-intelligence/object-registry/ag10g-map-theme-credit-mobile-doctrine.json",
  "data/content-intelligence/quality-registry/ag10g-map-geographic-object-pipeline-readiness.json",
  "data/content-intelligence/mutation-plans/ag10g-to-ag10h-generated-image-editorial-visual-pipeline-planning-boundary.json",
  "data/content-intelligence/schema/map-geographic-object-pipeline-planning.schema.json",
  "data/content-intelligence/learning/ag10g-map-geographic-object-pipeline-planning-learning.json",
  "data/quality/ag10g-map-geographic-object-pipeline-planning.json",
  "data/quality/ag10g-map-geographic-object-pipeline-planning-preview.json",
  "docs/quality/AG10G_MAP_GEOGRAPHIC_OBJECT_PIPELINE_PLANNING.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG10G validation failed: ${message}`);
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

const ag10fReview = readJson("data/content-intelligence/quality-reviews/ag10f-table-structured-object-pipeline-planning.json");
const ag10fReadiness = readJson("data/content-intelligence/quality-registry/ag10f-table-structured-object-pipeline-readiness.json");
const ag10fBoundary = readJson("data/content-intelligence/mutation-plans/ag10f-to-ag10g-map-geographic-object-pipeline-planning-boundary.json");
const ag09cApply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag10g-map-geographic-object-pipeline-planning.json");
const plan = readJson("data/content-intelligence/mutation-plans/ag10g-map-geographic-object-pipeline-planning.json");
const inclusionGate = readJson("data/content-intelligence/quality-registry/ag10g-new-aspect-inclusion-gate.json");
const familyRegistry = readJson("data/content-intelligence/object-registry/ag10g-map-geographic-object-family-registry.json");
const geoSchema = readJson("data/content-intelligence/object-registry/ag10g-geo-data-location-schema.json");
const templateDoctrine = readJson("data/content-intelligence/object-registry/ag10g-reusable-map-template-render-instance-doctrine.json");
const visualDoctrine = readJson("data/content-intelligence/object-registry/ag10g-map-theme-credit-mobile-doctrine.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag10g-map-geographic-object-pipeline-readiness.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag10g-to-ag10h-generated-image-editorial-visual-pipeline-planning-boundary.json");
const schema = readJson("data/content-intelligence/schema/map-geographic-object-pipeline-planning.schema.json");
const learning = readJson("data/content-intelligence/learning/ag10g-map-geographic-object-pipeline-planning-learning.json");
const registry = readJson("data/quality/ag10g-map-geographic-object-pipeline-planning.json");
const preview = readJson("data/quality/ag10g-map-geographic-object-pipeline-planning-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG10G_MAP_GEOGRAPHIC_OBJECT_PIPELINE_PLANNING.md"), "utf8");

for (const obj of [review, plan, inclusionGate, familyRegistry, geoSchema, templateDoctrine, visualDoctrine, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG10G") fail(`module_id must be AG10G in ${obj.title || "object"}`);
}

if (ag10fReview.status !== "table_structured_object_pipeline_planning_created_not_executed") fail("AG10F review status mismatch");
if (ag10fReadiness.ready_for_ag10g !== true) fail("AG10F readiness for AG10G missing");
if (ag10fBoundary.next_stage_id !== "AG10G") fail("AG10G boundary missing in AG10F");

const target = ag09cApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const currentHash = sha256(fs.readFileSync(path.join(root, target), "utf8"));
if (currentHash !== ag09cApply.post_correction_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) fail("Selected article hash must match AG09C post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state");

if (review.status !== "map_geographic_object_pipeline_planning_created_not_executed") fail("Review status mismatch");
if (plan.status !== "map_geographic_object_pipeline_planning_created_not_executed") fail("Plan status mismatch");
if (registry.status !== "map_geographic_object_pipeline_planning_created_not_executed") fail("Registry status mismatch");
if (preview.status !== "map_geographic_object_pipeline_planning_created_not_executed") fail("Preview status mismatch");

if (inclusionGate.status !== "new_aspect_inclusion_gate_created_not_applied") fail("Inclusion gate status mismatch");
if (!Array.isArray(inclusionGate.gate_questions) || inclusionGate.gate_questions.length !== 5) fail("Inclusion gate must contain five questions");

for (const question of [
  "Will this improve what a visitor sees?",
  "Will this make articles more trustworthy?",
  "Will this make Drishvara memorable?",
  "Will this reduce future cost?",
  "Will this create reusable intelligence?"
]) {
  if (!inclusionGate.gate_questions.some((item) => item.question === question)) {
    fail(`Missing inclusion gate question: ${question}`);
  }
}

if (!inclusionGate.pass_rule.includes("all five")) fail("Inclusion gate pass rule must require all five checks");
if (!inclusionGate.reject_rule.includes("blocks inclusion")) fail("Inclusion gate reject rule missing");
if (inclusionGate.ag10g_gate_assessment.map_geographic_object_pipeline_planning.inclusion_decision !== "allowed_for_planning_only") {
  fail("AG10G gate assessment must be planning-only allowed");
}

if (familyRegistry.status !== "map_geographic_object_family_registry_created_not_applied") fail("Family registry status mismatch");
if (!Array.isArray(familyRegistry.map_families) || familyRegistry.map_families.length !== 6) fail("Map family count mismatch");
if (familyRegistry.source_map_object_count < 8) fail("Source map object count appears incomplete");

const allTypes = familyRegistry.map_families.flatMap((item) => item.map_types || []);
for (const item of [
  "geographic_map",
  "regional_focus_map",
  "bubble_map",
  "heat_map",
  "location_insight_visual",
  "choropleth_thematic_map",
  "service_area_map",
  "route_or_flow_map",
  "geo_chart",
  "scatter_map",
  "geographic_bubble_chart",
  "heatmap_chart"
]) {
  if (!allTypes.includes(item)) fail(`Missing map/geographic type: ${item}`);
}

for (const field of [
  "map_type",
  "article_id",
  "object_template_id",
  "geo_source_or_logic_record",
  "map_source_or_boundary_source",
  "licence_or_usage_note",
  "rights_controller",
  "credit_display",
  "caption",
  "alt_text",
  "mobile_fallback_text",
  "reuse_eligibility_status"
]) {
  if (!familyRegistry.universal_map_schema.required_metadata.includes(field)) {
    fail(`Missing universal map metadata field: ${field}`);
  }
}

for (const field of [
  "geo_scope",
  "location_or_region_name",
  "value_or_context",
  "source_note",
  "boundary_note",
  "editorial_purpose",
  "responsive_strategy"
]) {
  if (!familyRegistry.universal_map_schema.required_geo_fields.includes(field)) {
    fail(`Missing universal map geo field: ${field}`);
  }
}

if (geoSchema.status !== "geo_data_location_schema_created_not_applied") fail("Geo schema status mismatch");
if (!Array.isArray(geoSchema.schema_components) || geoSchema.schema_components.length !== 7) fail("Geo schema component count mismatch");

for (const componentType of [
  "geo_source",
  "location_record",
  "region_boundary_record",
  "map_metric",
  "legend",
  "mobile_fallback",
  "reuse_record"
]) {
  if (!geoSchema.schema_components.some((item) => item.component_type === componentType)) {
    fail(`Missing geo schema component type: ${componentType}`);
  }
}

if (!geoSchema.validation_rules.some((rule) => rule.includes("geo source or boundary source"))) fail("Geo source validation rule missing");
if (!geoSchema.validation_rules.some((rule) => rule.includes("Coordinate precision"))) fail("Coordinate precision rule missing");
if (!geoSchema.validation_rules.some((rule) => rule.includes("New Aspect Inclusion Gate"))) fail("Inclusion gate validation rule missing");

if (templateDoctrine.status !== "reusable_map_template_doctrine_created_not_applied") fail("Template doctrine status mismatch");

for (const step of [
  "map_template",
  "geo_data_binding",
  "rendered_map_instance",
  "article_placement",
  "post_insertion_layout_audit",
  "reuse_log"
]) {
  if (!templateDoctrine.pipeline_model.includes(step)) fail(`Missing map template pipeline step: ${step}`);
}

for (const field of [
  "map_template_id",
  "map_family",
  "map_type",
  "theme_variant",
  "geo_schema_required",
  "rights_controller",
  "ownership_status",
  "template_hash"
]) {
  if (!templateDoctrine.map_template_fields.includes(field)) fail(`Missing map template field: ${field}`);
}

for (const field of [
  "rendered_map_id",
  "map_template_id",
  "article_id",
  "geo_data_binding_id",
  "geo_source_record_ids",
  "boundary_source_record_ids",
  "asset_path",
  "caption",
  "credit",
  "alt_text",
  "rendered_hash"
]) {
  if (!templateDoctrine.rendered_map_fields.includes(field)) fail(`Missing rendered map field: ${field}`);
}

if (visualDoctrine.status !== "map_theme_credit_mobile_doctrine_created_not_applied") fail("Visual doctrine status mismatch");

for (const credit of [
  "Map: Drishvara.",
  "Map source: [source]. Map visualisation: Drishvara.",
  "Data source: [source]. Map visualisation: Drishvara.",
  "Sources: [source list]. Map visualisation: Drishvara."
]) {
  if (!visualDoctrine.credit_rules.some((item) => item.credit === credit)) fail(`Missing map credit rule: ${credit}`);
}

if (!visualDoctrine.mobile_rules.some((item) => item.includes("No uncontrolled horizontal overflow"))) fail("Mobile overflow rule missing");
if (!visualDoctrine.placement_rules.some((item) => item.includes("not deform article shape"))) fail("Article-shape placement rule missing");
if (!visualDoctrine.cost_rules.some((item) => item.includes("reusable SVG/HTML/static map templates"))) fail("Cost-control reusable template rule missing");
if (!visualDoctrine.accessibility_rules.some((item) => item.includes("Alt text"))) fail("Alt text accessibility rule missing");

if (readiness.status !== "map_geographic_object_pipeline_planning_ready_pending_explicit_ag10h") fail("Readiness status mismatch");
if (readiness.ready_for_ag10h !== true) fail("AG10H readiness missing");
if (readiness.new_aspect_inclusion_gate_created !== true) fail("Inclusion gate readiness missing");
if (readiness.map_generation_ready !== false) fail("Map generation readiness must remain false");
if (readiness.geographic_object_render_ready !== false) fail("Geographic object render readiness must remain false");
if (readiness.data_fetch_ready !== false) fail("Data fetch readiness must remain false");
if (readiness.object_insertion_ready !== false) fail("Object insertion readiness must remain false");

if (boundary.status !== "ag10h_boundary_created_not_started") fail("AG10H boundary status mismatch");
if (boundary.next_stage_id !== "AG10H") fail("AG10H handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG10H must require explicit approval");

if (schema.status !== "schema_map_geographic_object_pipeline_planning_only") fail("Schema status mismatch");

for (const key of [
  "new_aspect_inclusion_gate_allowed_in_ag10g",
  "map_family_registry_allowed_in_ag10g",
  "geo_data_location_schema_allowed_in_ag10g",
  "reusable_map_template_doctrine_allowed_in_ag10g",
  "map_theme_credit_mobile_doctrine_allowed_in_ag10g",
  "ag10h_boundary_allowed_in_ag10g"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag10g",
  "homepage_mutation_allowed_in_ag10g",
  "css_js_mutation_allowed_in_ag10g",
  "data_fetch_allowed_in_ag10g",
  "dataset_creation_allowed_in_ag10g",
  "geo_dataset_creation_allowed_in_ag10g",
  "map_generation_allowed_in_ag10g",
  "geographic_object_render_allowed_in_ag10g",
  "map_template_creation_allowed_in_ag10g",
  "rendered_map_creation_allowed_in_ag10g",
  "svg_asset_creation_allowed_in_ag10g",
  "image_asset_creation_allowed_in_ag10g",
  "object_insertion_allowed_in_ag10g",
  "visual_generation_allowed_in_ag10g",
  "image_generation_allowed_in_ag10g",
  "chart_generation_allowed_in_ag10g",
  "infographic_generation_allowed_in_ag10g",
  "table_generation_allowed_in_ag10g",
  "figure_generation_allowed_in_ag10g",
  "diagram_generation_allowed_in_ag10g",
  "live_url_fetch_allowed_in_ag10g",
  "deployment_trigger_allowed_in_ag10g",
  "production_jsonl_append_allowed_in_ag10g",
  "database_write_allowed_in_ag10g",
  "supabase_write_allowed_in_ag10g",
  "backend_auth_supabase_activation_allowed_in_ag10g",
  "public_publishing_operation_allowed_in_ag10g"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, plan, inclusionGate, familyRegistry, geoSchema, templateDoctrine, visualDoctrine, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.map_geographic_object_pipeline_planning_only !== true) fail(`${obj.title || "object"} must be planning-only`);
  if (obj.article_mutation_performed_in_ag10g !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.data_fetch_performed_in_ag10g !== false) fail(`${obj.title || "object"} must not fetch data`);
  if (obj.map_generation_performed_in_ag10g !== false) fail(`${obj.title || "object"} must not generate map`);
  if (obj.geographic_object_render_performed_in_ag10g !== false) fail(`${obj.title || "object"} must not render geographic object`);
  if (obj.map_template_creation_performed_in_ag10g !== false) fail(`${obj.title || "object"} must not create map template`);
  if (obj.rendered_map_creation_performed_in_ag10g !== false) fail(`${obj.title || "object"} must not create rendered map`);
  if (obj.object_insertion_performed_in_ag10g !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.database_write_performed_in_ag10g !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag10g !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag10g !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag10g !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag10g_map_geographic_object_planning_created_pending_explicit_ag10h") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag10h_only_with_explicit_user_approval !== true) fail("AG10H must require explicit approval");

for (const scriptName of ["generate:ag10g", "validate:ag10g"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag10g")) {
  fail("validate:project must include validate:ag10g");
}

for (const phrase of ["Purpose", "New Aspect Inclusion Gate", "Map Families", "Geo Data Schema", "Template and Rendered Instance Model", "Credit Logic", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG10G document missing phrase: ${phrase}`);
}

pass("AG10G registry is present.");
pass("AG10G document is present.");
pass("AG10G review, plan, inclusion gate, family registry, geo schema, reusable map doctrine, visual doctrine, readiness, AG10H boundary, schema, learning record and preview are present.");
pass("AG10F planning and handoff are consumed.");
pass("Selected article hash remains stable.");
pass("New Aspect Inclusion Gate with five mandatory questions is recorded.");
pass("Map and geographic-object family registry is created.");
pass("Geo data and location schema is created.");
pass("Reusable map-template and rendered-instance doctrine is created.");
pass("Map theme, source/licence/credit, mobile fallback, placement, accessibility and cost rules are created.");
pass("AG10H generated image/editorial visual pipeline boundary is created with explicit approval required.");
pass("No map generation, data fetch, geographic object rendering, object insertion, article mutation, backend activation or publishing operation is performed.");
pass("AG10G is Map and Geographic Object Pipeline Planning only.");
