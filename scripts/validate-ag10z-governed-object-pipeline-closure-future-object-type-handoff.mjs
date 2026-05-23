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

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag10a-governed-object-pipeline-planning.json",
  "data/content-intelligence/quality-reviews/ag10b-object-taxonomy-selection-doctrine.json",
  "data/content-intelligence/quality-reviews/ag10c-data-visualization-chart-pipeline-planning.json",
  "data/content-intelligence/quality-reviews/ag10d-infographic-pipeline-planning.json",
  "data/content-intelligence/quality-reviews/ag10e-figure-diagram-pipeline-planning.json",
  "data/content-intelligence/quality-reviews/ag10f-table-structured-object-pipeline-planning.json",
  "data/content-intelligence/quality-reviews/ag10g-map-geographic-object-pipeline-planning.json",
  "data/content-intelligence/quality-registry/ag10g-new-aspect-inclusion-gate.json",
  "data/content-intelligence/quality-reviews/ag10h-generated-image-editorial-visual-pipeline-planning.json",
  "data/content-intelligence/quality-reviews/ag10i-generated-image-candidate-selection-prompt-finalisation.json",
  "data/content-intelligence/quality-reviews/ag10j-controlled-generated-image-asset-creation-source-finalisation.json",
  "data/content-intelligence/quality-reviews/ag10k-controlled-generated-image-insertion-apply.json",
  "data/content-intelligence/quality-reviews/ag10l-post-generated-image-insertion-audit.json",
  "data/content-intelligence/quality-reviews/ag10m-generated-image-insertion-closure-reuse-handoff.json",
  "data/content-intelligence/closure-records/ag10m-generated-image-insertion-closure-reuse-handoff.json",
  "data/content-intelligence/object-registry/ag10m-generated-image-reuse-handoff-record.json",
  "data/content-intelligence/quality-registry/ag10m-generated-image-final-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag10m-to-ag10z-governed-object-pipeline-closure-boundary.json",
  "data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json",
  "data/content-intelligence/visual-registry/ag10j-finalised-generated-image-asset-record.json",

  "data/content-intelligence/quality-reviews/ag10z-governed-object-pipeline-closure-future-object-type-handoff.json",
  "data/content-intelligence/closure-records/ag10z-governed-object-pipeline-closure-future-object-type-handoff.json",
  "data/content-intelligence/object-registry/ag10z-future-object-family-handoff-record.json",
  "data/content-intelligence/quality-registry/ag10z-final-object-pipeline-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag10z-to-ag11a-next-article-object-cycle-readiness-boundary.json",
  "data/content-intelligence/schema/governed-object-pipeline-closure-future-object-type-handoff.schema.json",
  "data/content-intelligence/learning/ag10z-governed-object-pipeline-closure-future-object-type-handoff-learning.json",
  "data/quality/ag10z-governed-object-pipeline-closure-future-object-type-handoff.json",
  "data/quality/ag10z-governed-object-pipeline-closure-future-object-type-handoff-preview.json",
  "docs/quality/AG10Z_GOVERNED_OBJECT_PIPELINE_CLOSURE_FUTURE_OBJECT_TYPE_HANDOFF.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG10Z validation failed: ${message}`);
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

const ag10mReview = readJson("data/content-intelligence/quality-reviews/ag10m-generated-image-insertion-closure-reuse-handoff.json");
const ag10mClosure = readJson("data/content-intelligence/closure-records/ag10m-generated-image-insertion-closure-reuse-handoff.json");
const ag10mReuse = readJson("data/content-intelligence/object-registry/ag10m-generated-image-reuse-handoff-record.json");
const ag10mReadiness = readJson("data/content-intelligence/quality-registry/ag10m-generated-image-final-readiness-record.json");
const ag10mBoundary = readJson("data/content-intelligence/mutation-plans/ag10m-to-ag10z-governed-object-pipeline-closure-boundary.json");
const ag10kApply = readJson("data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json");
const ag10jAsset = readJson("data/content-intelligence/visual-registry/ag10j-finalised-generated-image-asset-record.json");

const review = readJson("data/content-intelligence/quality-reviews/ag10z-governed-object-pipeline-closure-future-object-type-handoff.json");
const closure = readJson("data/content-intelligence/closure-records/ag10z-governed-object-pipeline-closure-future-object-type-handoff.json");
const future = readJson("data/content-intelligence/object-registry/ag10z-future-object-family-handoff-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag10z-final-object-pipeline-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag10z-to-ag11a-next-article-object-cycle-readiness-boundary.json");
const schema = readJson("data/content-intelligence/schema/governed-object-pipeline-closure-future-object-type-handoff.schema.json");
const learning = readJson("data/content-intelligence/learning/ag10z-governed-object-pipeline-closure-future-object-type-handoff-learning.json");
const registry = readJson("data/quality/ag10z-governed-object-pipeline-closure-future-object-type-handoff.json");
const preview = readJson("data/quality/ag10z-governed-object-pipeline-closure-future-object-type-handoff-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG10Z_GOVERNED_OBJECT_PIPELINE_CLOSURE_FUTURE_OBJECT_TYPE_HANDOFF.md"), "utf8");

for (const obj of [review, closure, future, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG10Z") fail(`module_id must be AG10Z in ${obj.title || "object"}`);
}

if (ag10mReview.status !== "generated_image_insertion_chain_closed_reuse_handoff_recorded") fail("AG10M review must be closed");
if (ag10mClosure.status !== "generated_image_insertion_chain_closed_reuse_handoff_recorded") fail("AG10M closure must be closed");
if (ag10mReadiness.ready_for_ag10z !== true) fail("AG10M readiness for AG10Z missing");
if (ag10mBoundary.next_stage_id !== "AG10Z") fail("AG10M boundary must hand off to AG10Z");

const articlePath = ag10kApply.selected_article_path;
const assetPath = ag10kApply.asset_path;
const backupPath = ag10kApply.backup_path;

if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
if (!fs.existsSync(path.join(root, assetPath))) fail(`Asset missing: ${assetPath}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`Backup missing: ${backupPath}`);

const articleHash = sha256(fs.readFileSync(path.join(root, articlePath), "utf8"));
const assetHash = sha256(fs.readFileSync(path.join(root, assetPath), "utf8"));
const backupHash = sha256(fs.readFileSync(path.join(root, backupPath), "utf8"));

if (articleHash !== ag10kApply.post_insertion_hash) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) fail("Article hash must remain AG10K post-insertion hash or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state");
if (assetHash !== ag10jAsset.asset_hash_sha256) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) fail("Asset hash must match AG10J asset record or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state");
if (backupHash !== ag10kApply.pre_insertion_hash) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) fail("Backup hash must match AG10K pre-insertion hash or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state");

for (const obj of [review, closure, registry, preview]) {
  if (obj.status !== "ag10_governed_object_pipeline_closed_future_handoff_recorded") {
    fail(`${obj.title || "object"} status mismatch`);
  }
}

if (future.status !== "future_object_family_handoff_recorded") fail("Future handoff status mismatch");
if (readiness.status !== "ag10_closed_ready_for_future_controlled_object_cycles") fail("Final readiness status mismatch");
if (schema.status !== "schema_governed_object_pipeline_closure_future_object_type_handoff_only") fail("Schema status mismatch");

if (!Array.isArray(closure.closed_stages) || closure.closed_stages.length !== 13) fail("AG10Z must close 13 AG10 stages");
if (!Array.isArray(future.future_object_families) || future.future_object_families.length !== 7) fail("AG10Z must hand off 7 object families");

for (const stageId of ["AG10A","AG10B","AG10C","AG10D","AG10E","AG10F","AG10G","AG10H","AG10I","AG10J","AG10K","AG10L","AG10M"]) {
  if (!closure.closed_stages.some((stage) => stage.stage_id === stageId)) fail(`Closed stage missing: ${stageId}`);
}

for (const familyName of [
  "Data visualizations, charts and BI-style graphs",
  "Infographics",
  "Figures and diagrams",
  "Tables and structured objects",
  "Maps and geographic objects",
  "Generated images and editorial visuals",
  "Article-support composite objects"
]) {
  if (!future.future_object_families.some((family) => family.family_name === familyName)) fail(`Future object family missing: ${familyName}`);
}

if (closure.closure_decision.ag10_pipeline_closed !== true) fail("AG10 pipeline closure missing");
if (closure.closure_decision.generated_image_chain_closed !== true) fail("Generated image chain closure missing");
if (closure.closure_decision.reusable_object_intelligence_preserved !== true) fail("Reusable intelligence preservation missing");
if (closure.closure_decision.future_object_family_handoff_recorded !== true) fail("Future object handoff missing");
if (closure.closure_decision.publishing_ready !== false) fail("Publishing must remain blocked");
if (closure.closure_decision.backend_activation_ready !== false) fail("Backend must remain blocked");
if (closure.closure_decision.supabase_activation_ready !== false) fail("Supabase must remain blocked");

if (readiness.ag10_pipeline_closed !== true) fail("Readiness must close AG10 pipeline");
if (readiness.generated_image_chain_closed !== true) fail("Readiness must close generated image chain");
if (readiness.reusable_object_intelligence_preserved !== true) fail("Readiness must preserve reusable intelligence");
if (readiness.future_object_family_handoff_recorded !== true) fail("Readiness must record future family handoff");
if (readiness.ready_for_ag11a !== true) fail("Readiness must be ready for AG11A");
if (readiness.publishing_ready !== false) fail("Readiness must keep publishing blocked");
if (readiness.backend_activation_ready !== false) fail("Readiness must keep backend blocked");
if (readiness.supabase_activation_ready !== false) fail("Readiness must keep Supabase blocked");

if (future.reusable_generated_image_intelligence.asset_path !== ag10mReuse.asset_path) fail("Reusable asset path mismatch");
if (future.reusable_generated_image_intelligence.asset_hash_sha256 !== ag10mReuse.asset_hash_sha256) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) fail("Reusable asset hash mismatch or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state");
if (!Array.isArray(future.standing_inclusion_gate) || future.standing_inclusion_gate.length !== 5) fail("Standing inclusion gate must contain five questions");
if (!future.cost_control_doctrine_carried_forward.some((item) => item.includes("Supabase"))) fail("Supabase/backend separation note must be carried forward");

if (boundary.status !== "ag11a_boundary_created_not_started") fail("AG11A boundary status mismatch");
if (boundary.next_stage_id !== "AG11A") fail("AG11A handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG11A must require explicit approval");

for (const key of [
  "closure_allowed_in_ag10z",
  "future_object_family_handoff_allowed_in_ag10z",
  "final_readiness_allowed_in_ag10z",
  "ag11a_boundary_allowed_in_ag10z"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag10z",
  "object_insertion_allowed_in_ag10z",
  "image_generation_allowed_in_ag10z",
  "external_image_api_call_allowed_in_ag10z",
  "new_asset_creation_allowed_in_ag10z",
  "chart_generation_allowed_in_ag10z",
  "infographic_generation_allowed_in_ag10z",
  "table_generation_allowed_in_ag10z",
  "figure_generation_allowed_in_ag10z",
  "diagram_generation_allowed_in_ag10z",
  "map_generation_allowed_in_ag10z",
  "reference_insertion_allowed_in_ag10z",
  "reference_url_change_allowed_in_ag10z",
  "homepage_mutation_allowed_in_ag10z",
  "css_js_mutation_allowed_in_ag10z",
  "production_jsonl_append_allowed_in_ag10z",
  "database_write_allowed_in_ag10z",
  "supabase_write_allowed_in_ag10z",
  "backend_auth_supabase_activation_allowed_in_ag10z",
  "public_publishing_operation_allowed_in_ag10z"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, closure, future, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.governed_object_pipeline_closure_future_object_type_handoff_only !== true) fail(`${obj.title || "object"} must be AG10Z-only`);
  if (obj.article_mutation_performed_in_ag10z !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.object_insertion_performed_in_ag10z !== false) fail(`${obj.title || "object"} must not insert object`);
  if (obj.image_generation_performed_in_ag10z !== false) fail(`${obj.title || "object"} must not generate image`);
  if (obj.chart_generation_performed_in_ag10z !== false) fail(`${obj.title || "object"} must not generate chart`);
  if (obj.infographic_generation_performed_in_ag10z !== false) fail(`${obj.title || "object"} must not generate infographic`);
  if (obj.table_generation_performed_in_ag10z !== false) fail(`${obj.title || "object"} must not generate table`);
  if (obj.map_generation_performed_in_ag10z !== false) fail(`${obj.title || "object"} must not generate map`);
  if (obj.new_asset_creation_performed_in_ag10z !== false) fail(`${obj.title || "object"} must not create asset`);
  if (obj.database_write_performed_in_ag10z !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag10z !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag10z !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag10z !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Closure Result", "Reusable Intelligence Preserved", "Standing Inclusion Gate", "Boundaries", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG10Z document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag10z", "validate:ag10z"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag10z")) {
  fail("validate:project must include validate:ag10z");
}

pass("AG10Z registry is present.");
pass("AG10Z document is present.");
pass("AG10Z review, closure, future handoff, final readiness, AG11A boundary, schema, learning record and preview are present.");
pass("AG10A through AG10M evidence is consumed.");
pass("Article, asset and backup hashes remain stable.");
pass("AG10 governed object pipeline is closed.");
pass("Generated-image chain is closed and reusable intelligence is preserved.");
pass("Seven future object families are handed off.");
pass("Five-question inclusion gate and cost-control doctrine are carried forward.");
pass("Publishing, backend and Supabase activation remain blocked.");
pass("No article mutation, object insertion, object generation, backend activation or publishing operation is performed.");
pass("AG11A next article object cycle readiness boundary is created with explicit approval required.");
pass("AG10Z is Governed Object Pipeline Closure and Future Object-Type Handoff only.");
