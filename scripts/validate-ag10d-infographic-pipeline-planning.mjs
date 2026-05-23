import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();






function ag11eControlledTableInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
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
  "data/content-intelligence/quality-reviews/ag10c-data-visualization-chart-pipeline-planning.json",
  "data/content-intelligence/mutation-plans/ag10c-data-visualization-chart-pipeline-planning.json",
  "data/content-intelligence/data-registry/ag10c-data-source-dataset-inference-doctrine.json",
  "data/content-intelligence/object-registry/ag10c-reusable-chart-template-render-instance-doctrine.json",
  "data/content-intelligence/object-registry/ag10c-chart-theme-credit-mobile-doctrine.json",
  "data/content-intelligence/quality-registry/ag10c-data-visualization-pipeline-readiness.json",
  "data/content-intelligence/mutation-plans/ag10c-to-ag10d-infographic-pipeline-planning-boundary.json",
  "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
  "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
  "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",

  "data/content-intelligence/quality-reviews/ag10d-infographic-pipeline-planning.json",
  "data/content-intelligence/mutation-plans/ag10d-infographic-pipeline-planning.json",
  "data/content-intelligence/object-registry/ag10d-infographic-family-structure-registry.json",
  "data/content-intelligence/object-registry/ag10d-infographic-content-block-schema.json",
  "data/content-intelligence/object-registry/ag10d-reusable-infographic-template-render-instance-doctrine.json",
  "data/content-intelligence/object-registry/ag10d-infographic-theme-credit-mobile-doctrine.json",
  "data/content-intelligence/quality-registry/ag10d-infographic-pipeline-readiness.json",
  "data/content-intelligence/mutation-plans/ag10d-to-ag10e-figure-diagram-pipeline-planning-boundary.json",
  "data/content-intelligence/schema/infographic-pipeline-planning.schema.json",
  "data/content-intelligence/learning/ag10d-infographic-pipeline-planning-learning.json",
  "data/quality/ag10d-infographic-pipeline-planning.json",
  "data/quality/ag10d-infographic-pipeline-planning-preview.json",
  "docs/quality/AG10D_INFOGRAPHIC_PIPELINE_PLANNING.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG10D validation failed: ${message}`);
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

const ag10cReview = readJson("data/content-intelligence/quality-reviews/ag10c-data-visualization-chart-pipeline-planning.json");
const ag10cReadiness = readJson("data/content-intelligence/quality-registry/ag10c-data-visualization-pipeline-readiness.json");
const ag10cBoundary = readJson("data/content-intelligence/mutation-plans/ag10c-to-ag10d-infographic-pipeline-planning-boundary.json");
const ag09cApply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag10d-infographic-pipeline-planning.json");
const plan = readJson("data/content-intelligence/mutation-plans/ag10d-infographic-pipeline-planning.json");
const familyRegistry = readJson("data/content-intelligence/object-registry/ag10d-infographic-family-structure-registry.json");
const contentSchema = readJson("data/content-intelligence/object-registry/ag10d-infographic-content-block-schema.json");
const templateDoctrine = readJson("data/content-intelligence/object-registry/ag10d-reusable-infographic-template-render-instance-doctrine.json");
const visualDoctrine = readJson("data/content-intelligence/object-registry/ag10d-infographic-theme-credit-mobile-doctrine.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag10d-infographic-pipeline-readiness.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag10d-to-ag10e-figure-diagram-pipeline-planning-boundary.json");
const schema = readJson("data/content-intelligence/schema/infographic-pipeline-planning.schema.json");
const learning = readJson("data/content-intelligence/learning/ag10d-infographic-pipeline-planning-learning.json");
const registry = readJson("data/quality/ag10d-infographic-pipeline-planning.json");
const preview = readJson("data/quality/ag10d-infographic-pipeline-planning-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG10D_INFOGRAPHIC_PIPELINE_PLANNING.md"), "utf8");

for (const obj of [review, plan, familyRegistry, contentSchema, templateDoctrine, visualDoctrine, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG10D") fail(`module_id must be AG10D in ${obj.title || "object"}`);
}

if (ag10cReview.status !== "data_visualization_chart_pipeline_planning_created_not_executed") fail("AG10C review status mismatch");
if (ag10cReadiness.ready_for_ag10d !== true) fail("AG10C readiness for AG10D missing");
if (ag10cBoundary.next_stage_id !== "AG10D") fail("AG10D boundary missing in AG10C");

const target = ag09cApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const currentHash = sha256(fs.readFileSync(path.join(root, target), "utf8"));
if (currentHash !== ag09cApply.post_correction_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) fail("Selected article hash must match AG09C post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state");

if (review.status !== "infographic_pipeline_planning_created_not_executed") fail("Review status mismatch");
if (plan.status !== "infographic_pipeline_planning_created_not_executed") fail("Plan status mismatch");
if (registry.status !== "infographic_pipeline_planning_created_not_executed") fail("Registry status mismatch");
if (preview.status !== "infographic_pipeline_planning_created_not_executed") fail("Preview status mismatch");

if (familyRegistry.status !== "infographic_family_structure_registry_created_not_applied") fail("Family registry status mismatch");
if (!Array.isArray(familyRegistry.infographic_families) || familyRegistry.infographic_families.length !== 7) fail("Infographic family count mismatch");
if (familyRegistry.source_infographic_object_count < 15) fail("Source infographic object count appears incomplete");

const allInfographicTypes = familyRegistry.infographic_families.flatMap((item) => item.infographic_types || []);
for (const item of [
  "timeline_infographic",
  "milestone_infographic",
  "roadmap_infographic",
  "process_flow_infographic",
  "step_by_step_infographic",
  "cycle_infographic",
  "comparison_infographic",
  "before_after_infographic",
  "problem_solution_infographic",
  "pyramid_infographic",
  "hierarchy_infographic",
  "decision_tree_infographic",
  "explainer_infographic",
  "policy_summary_infographic",
  "fact_sheet_infographic",
  "checklist_infographic",
  "statistical_infographic",
  "regional_insight_infographic",
  "storyboard_infographic",
  "cause_effect_infographic"
]) {
  if (!allInfographicTypes.includes(item)) fail(`Missing infographic type: ${item}`);
}

for (const field of [
  "infographic_type",
  "article_id",
  "object_template_id",
  "rights_controller",
  "credit_display",
  "caption",
  "alt_text",
  "mobile_fallback_text",
  "reuse_eligibility_status"
]) {
  if (!familyRegistry.universal_infographic_schema.required_metadata.includes(field)) {
    fail(`Missing universal infographic metadata field: ${field}`);
  }
}

for (const field of [
  "title",
  "core_message",
  "content_blocks",
  "block_order",
  "visual_structure",
  "source_note",
  "editorial_purpose"
]) {
  if (!familyRegistry.universal_infographic_schema.required_content_fields.includes(field)) {
    fail(`Missing universal infographic content field: ${field}`);
  }
}

if (contentSchema.status !== "infographic_content_block_schema_created_not_applied") fail("Content block schema status mismatch");
if (!Array.isArray(contentSchema.block_types) || contentSchema.block_types.length !== 8) fail("Content block type count mismatch");

for (const blockType of [
  "headline_block",
  "step_block",
  "metric_block",
  "comparison_block",
  "timeline_block",
  "hierarchy_block",
  "cause_effect_block",
  "callout_block"
]) {
  if (!contentSchema.block_types.some((item) => item.block_type === blockType)) fail(`Missing content block type: ${blockType}`);
}

if (!contentSchema.content_validation_rules.some((rule) => rule.includes("one clear core message"))) fail("Core message validation rule missing");
if (!contentSchema.content_validation_rules.some((rule) => rule.includes("mobile-safe"))) fail("Mobile-safe validation rule missing");

if (templateDoctrine.status !== "reusable_infographic_template_doctrine_created_not_applied") fail("Template doctrine status mismatch");

for (const step of [
  "infographic_template",
  "content_block_binding",
  "rendered_infographic_instance",
  "article_placement",
  "post_insertion_layout_audit",
  "reuse_log"
]) {
  if (!templateDoctrine.pipeline_model.includes(step)) fail(`Missing infographic template pipeline step: ${step}`);
}

for (const field of [
  "infographic_template_id",
  "infographic_family",
  "infographic_type",
  "theme_variant",
  "content_block_schema_required",
  "rights_controller",
  "ownership_status",
  "template_hash"
]) {
  if (!templateDoctrine.infographic_template_fields.includes(field)) fail(`Missing infographic template field: ${field}`);
}

for (const field of [
  "rendered_infographic_id",
  "infographic_template_id",
  "article_id",
  "content_binding_id",
  "asset_path",
  "caption",
  "credit",
  "alt_text",
  "rendered_hash"
]) {
  if (!templateDoctrine.rendered_infographic_fields.includes(field)) fail(`Missing rendered infographic field: ${field}`);
}

if (visualDoctrine.status !== "infographic_theme_credit_mobile_doctrine_created_not_applied") fail("Visual doctrine status mismatch");

for (const credit of [
  "Infographic: Drishvara.",
  "Data source: [source]. Infographic: Drishvara.",
  "Data source: [source]. Analysis and infographic: Drishvara.",
  "Sources: [source list]. Infographic: Drishvara."
]) {
  if (!visualDoctrine.credit_rules.some((item) => item.credit === credit)) fail(`Missing infographic credit rule: ${credit}`);
}

if (!visualDoctrine.mobile_rules.some((item) => item.includes("No horizontal overflow"))) fail("Mobile overflow rule missing");
if (!visualDoctrine.placement_rules.some((item) => item.includes("not deform article shape"))) fail("Article-shape placement rule missing");
if (!visualDoctrine.cost_rules.some((item) => item.includes("reusable SVG/HTML infographic templates"))) fail("Cost-control reusable template rule missing");
if (!visualDoctrine.accessibility_rules.some((item) => item.includes("Alt text"))) fail("Alt text accessibility rule missing");

if (readiness.status !== "infographic_pipeline_planning_ready_pending_explicit_ag10e") fail("Readiness status mismatch");
if (readiness.ready_for_ag10e !== true) fail("AG10E readiness missing");
if (readiness.infographic_generation_ready !== false) fail("Infographic generation readiness must remain false");
if (readiness.infographic_render_ready !== false) fail("Infographic render readiness must remain false");
if (readiness.svg_asset_creation_ready !== false) fail("SVG asset creation readiness must remain false");
if (readiness.object_insertion_ready !== false) fail("Object insertion readiness must remain false");

if (boundary.status !== "ag10e_boundary_created_not_started") fail("AG10E boundary status mismatch");
if (boundary.next_stage_id !== "AG10E") fail("AG10E handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG10E must require explicit approval");

if (schema.status !== "schema_infographic_pipeline_planning_only") fail("Schema status mismatch");

for (const key of [
  "infographic_family_registry_allowed_in_ag10d",
  "content_block_schema_allowed_in_ag10d",
  "reusable_infographic_template_doctrine_allowed_in_ag10d",
  "infographic_theme_credit_mobile_doctrine_allowed_in_ag10d",
  "ag10e_boundary_allowed_in_ag10d"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag10d",
  "homepage_mutation_allowed_in_ag10d",
  "css_js_mutation_allowed_in_ag10d",
  "data_fetch_allowed_in_ag10d",
  "dataset_creation_allowed_in_ag10d",
  "infographic_generation_allowed_in_ag10d",
  "infographic_render_allowed_in_ag10d",
  "infographic_template_creation_allowed_in_ag10d",
  "rendered_infographic_creation_allowed_in_ag10d",
  "svg_asset_creation_allowed_in_ag10d",
  "image_asset_creation_allowed_in_ag10d",
  "object_insertion_allowed_in_ag10d",
  "visual_generation_allowed_in_ag10d",
  "image_generation_allowed_in_ag10d",
  "chart_generation_allowed_in_ag10d",
  "table_generation_allowed_in_ag10d",
  "figure_generation_allowed_in_ag10d",
  "map_generation_allowed_in_ag10d",
  "live_url_fetch_allowed_in_ag10d",
  "deployment_trigger_allowed_in_ag10d",
  "production_jsonl_append_allowed_in_ag10d",
  "database_write_allowed_in_ag10d",
  "supabase_write_allowed_in_ag10d",
  "backend_auth_supabase_activation_allowed_in_ag10d",
  "public_publishing_operation_allowed_in_ag10d"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, plan, familyRegistry, contentSchema, templateDoctrine, visualDoctrine, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.infographic_pipeline_planning_only !== true) fail(`${obj.title || "object"} must be planning-only`);
  if (obj.article_mutation_performed_in_ag10d !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.infographic_generation_performed_in_ag10d !== false) fail(`${obj.title || "object"} must not generate infographic`);
  if (obj.infographic_render_performed_in_ag10d !== false) fail(`${obj.title || "object"} must not render infographic`);
  if (obj.infographic_template_creation_performed_in_ag10d !== false) fail(`${obj.title || "object"} must not create infographic template`);
  if (obj.rendered_infographic_creation_performed_in_ag10d !== false) fail(`${obj.title || "object"} must not create rendered infographic`);
  if (obj.svg_asset_creation_performed_in_ag10d !== false) fail(`${obj.title || "object"} must not create SVG asset`);
  if (obj.image_asset_creation_performed_in_ag10d !== false) fail(`${obj.title || "object"} must not create image asset`);
  if (obj.object_insertion_performed_in_ag10d !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.database_write_performed_in_ag10d !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag10d !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag10d !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag10d !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag10d_infographic_planning_created_pending_explicit_ag10e") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag10e_only_with_explicit_user_approval !== true) fail("AG10E must require explicit approval");

for (const scriptName of ["generate:ag10d", "validate:ag10d"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag10d")) {
  fail("validate:project must include validate:ag10d");
}

for (const phrase of ["Purpose", "Infographic Families", "Content Block Schema", "Template and Rendered Instance Model", "Credit Logic", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG10D document missing phrase: ${phrase}`);
}

pass("AG10D registry is present.");
pass("AG10D document is present.");
pass("AG10D review, plan, family registry, content-block schema, reusable template doctrine, visual doctrine, readiness, AG10E boundary, schema, learning record and preview are present.");
pass("AG10C planning and handoff are consumed.");
pass("Selected article hash remains stable.");
pass("Infographic family structure registry is created.");
pass("Infographic content-block schema is created.");
pass("Reusable infographic-template and rendered-instance doctrine is created.");
pass("Infographic theme, source/credit, mobile fallback, placement, accessibility and cost rules are created.");
pass("AG10E figure/diagram pipeline boundary is created with explicit approval required.");
pass("No infographic generation, asset creation, object insertion, article mutation, backend activation or publishing operation is performed.");
pass("AG10D is Infographic Pipeline Planning only.");
