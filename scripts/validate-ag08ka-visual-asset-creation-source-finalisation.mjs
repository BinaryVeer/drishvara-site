import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag08j-visual-candidate-generation-asset-selection.json",
  "data/content-intelligence/visual-registry/ag08j-visual-candidate-record.json",
  "data/content-intelligence/visual-registry/ag08j-article-object-placement-doctrine.json",
  "data/content-intelligence/quality-registry/ag08j-visual-candidate-readiness.json",
  "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json",
  "data/content-intelligence/quality-reviews/ag08ka-visual-asset-creation-source-finalisation.json",
  "data/content-intelligence/visual-registry/ag08ka-finalised-visual-asset-record.json",
  "data/content-intelligence/quality-registry/ag08ka-visual-asset-readiness.json",
  "data/content-intelligence/mutation-plans/ag08ka-to-ag08k-controlled-insertion-boundary.json",
  "data/content-intelligence/schema/visual-asset-creation-source-finalisation.schema.json",
  "data/content-intelligence/learning/ag08ka-visual-asset-creation-source-finalisation-learning.json",
  "data/quality/ag08ka-visual-asset-creation-source-finalisation.json",
  "data/quality/ag08ka-visual-asset-creation-source-finalisation-preview.json",
  "docs/quality/AG08KA_VISUAL_ASSET_CREATION_SOURCE_FINALISATION.md",
  "assets/articles/policy/enhancing-public-healthcare-delivery-digital-innovation/ag08ka-primary-hero.svg",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG08K-A validation failed: ${message}`);
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

function ag09cControlledPublicExperienceCorrectionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag10kControlledGeneratedImageInsertionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");
  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    if (
      applyRecord.module_id !== "AG09C" ||
      applyRecord.status !== "controlled_public_experience_corrections_applied_pending_audit"
    ) {
      return false;
    }

    if (selectedPath && selectedPath !== applyRecord.selected_article_path) return false;

    const targetAbs = path.join(root, applyRecord.selected_article_path);
    if (!fs.existsSync(targetAbs)) return false;

    const html = fs.readFileSync(targetAbs, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.post_correction_hash === hashToCheck &&
      html.includes("AG09C-PUBLIC-EXPERIENCE-METADATA") &&
      html.includes('property="og:title"') &&
      html.includes('name="twitter:card"')
    );
  } catch {
    return false;
  }
}

function ag08kControlledVisualInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
  if (ag10kControlledGeneratedImageInsertionAllowsPostMutation(...arguments)) return true;
  if (ag09cControlledPublicExperienceCorrectionAllowsPostMutation(...arguments)) return true;
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json");
  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    if (
      applyRecord.module_id !== "AG08K" ||
      applyRecord.status !== "controlled_visual_image_inserted_pending_post_insertion_audit" ||
      applyRecord.image_insertion_performed_in_ag08k !== true ||
      applyRecord.article_mutation_performed_in_ag08k !== true ||
      applyRecord.exactly_one_visual_block_inserted !== true
    ) {
      return false;
    }

    if (selectedPath && selectedPath !== applyRecord.selected_article_path) return false;

    const targetAbs = path.join(root, applyRecord.selected_article_path);
    if (!fs.existsSync(targetAbs)) return false;

    const html = fs.readFileSync(targetAbs, "utf8");
    const hashToCheck = currentHash || sha256(html);

    return (
      applyRecord.post_insertion_hash === hashToCheck &&
      html.includes("AG08K-HERO-VISUAL-INSERTION") &&
      html.includes(applyRecord.asset_src_inserted)
    );
  } catch {
    return false;
  }
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag08jReview = readJson("data/content-intelligence/quality-reviews/ag08j-visual-candidate-generation-asset-selection.json");
const ag08jReadiness = readJson("data/content-intelligence/quality-registry/ag08j-visual-candidate-readiness.json");
const ag08gApply = readJson("data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag08ka-visual-asset-creation-source-finalisation.json");
const assetRecord = readJson("data/content-intelligence/visual-registry/ag08ka-finalised-visual-asset-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag08ka-visual-asset-readiness.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag08ka-to-ag08k-controlled-insertion-boundary.json");
const schema = readJson("data/content-intelligence/schema/visual-asset-creation-source-finalisation.schema.json");
const learning = readJson("data/content-intelligence/learning/ag08ka-visual-asset-creation-source-finalisation-learning.json");
const registry = readJson("data/quality/ag08ka-visual-asset-creation-source-finalisation.json");
const preview = readJson("data/quality/ag08ka-visual-asset-creation-source-finalisation-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG08KA_VISUAL_ASSET_CREATION_SOURCE_FINALISATION.md"), "utf8");

for (const obj of [review, assetRecord, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG08K-A") fail(`module_id must be AG08K-A in ${obj.title || "object"}`);
}

if (ag08jReview.status !== "visual_candidate_record_created_not_inserted") fail("AG08J review must be complete");
if (ag08jReadiness.status !== "visual_candidate_ready_pending_explicit_ag08k") fail("AG08J readiness must pass");

const target = ag08gApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Target article missing: ${target}`);

const targetHtml = fs.readFileSync(path.join(root, target), "utf8");
const currentArticleHash = sha256(targetHtml);

if (currentArticleHash !== ag08gApply.post_apply_hash && !ag08kControlledVisualInsertionAllowsPostMutation(target, currentArticleHash) && !ag09cControlledPublicExperienceCorrectionAllowsPostMutation()) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Selected article hash must match AG08G post-apply hash or AG08K controlled visual insertion hash or AG09C controlled post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");

const assetPath = assetRecord.asset.asset_path;
if (!fs.existsSync(path.join(root, assetPath))) fail(`Asset file missing: ${assetPath}`);

const svg = fs.readFileSync(path.join(root, assetPath), "utf8");
const svgHash = sha256(svg);

if (!svg.includes("<svg")) fail("Asset must be SVG");
if (!svg.includes("<title")) fail("SVG title missing");
if (!svg.includes("<desc")) fail("SVG description missing");
if (svgHash !== assetRecord.asset.asset_hash_sha256) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Asset hash mismatch or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (assetRecord.asset.file_created !== true) fail("Asset record must confirm file creation");
if (assetRecord.asset.inserted_into_article !== false) fail("Asset must not be inserted into article");
if (targetHtml.includes(assetPath) && !ag08kControlledVisualInsertionAllowsPostMutation(target, currentArticleHash)) fail("Selected article must not reference the AG08K-A asset yet unless AG08K controlled insertion is valid");

if (review.status !== "visual_asset_created_source_finalised_not_inserted") fail("AG08K-A review status mismatch");
if (assetRecord.status !== "visual_asset_created_source_finalised_not_inserted") fail("Asset record status mismatch");
if (readiness.status !== "visual_asset_ready_pending_explicit_ag08k_insertion") fail("Readiness status mismatch");
if (boundary.status !== "asset_ready_for_future_controlled_insertion_not_inserted") fail("Boundary status mismatch");
if (schema.status !== "schema_asset_creation_source_finalisation_only") fail("Schema status mismatch");
if (learning.status !== "learning_record_only") fail("Learning status mismatch");
if (registry.status !== "visual_asset_created_source_finalised_not_inserted") fail("Registry status mismatch");
if (preview.status !== "visual_asset_created_source_finalised_not_inserted") fail("Preview status mismatch");

if (assetRecord.source_finalisation.creation_method !== "deterministic_repo_script_no_external_generation_call") fail("Creation method must be deterministic repo script");
if (assetRecord.source_finalisation.external_gpt_image_generation_used !== false) fail("External GPT image generation must be false");
if (assetRecord.source_finalisation.external_image_api_used !== false) fail("External image API must be false");
if (assetRecord.source_finalisation.external_stock_image_used !== false) fail("External stock image must be false");
if (assetRecord.source_finalisation.third_party_logo_used !== false) fail("Third-party logo must be false");
if (assetRecord.source_finalisation.identifiable_person_used !== false) fail("Identifiable person must be false");
if (!assetRecord.source_finalisation.cost_control_note.includes("avoid external image-generation")) fail("Cost-control note missing");

if (!assetRecord.metadata.alt_text_final) fail("Alt text final missing");
if (!assetRecord.metadata.caption_final) fail("Caption final missing");
if (!assetRecord.metadata.credit_text_final) fail("Credit text final missing");
if (assetRecord.metadata.visible_credit_required !== true) fail("Visible credit must be required");

if (boundary.next_stage_id !== "AG08K") fail("AG08K handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG08K explicit approval required");
if (!boundary.ag08k_required_preconditions.includes("Fresh pre-visual-insertion backup is created.")) fail("Fresh backup precondition missing");
if (!boundary.ag08k_allowed_scope_if_later_approved.includes("insert exactly one hero visual figure block into selected article")) fail("AG08K allowed insertion scope missing");

if (readiness.all_readiness_checks_passed !== true) fail("Readiness checks must all pass");
if (readiness.ag08k_handoff.next_stage_id !== "AG08K") fail("Readiness must hand off to AG08K");

if (schema.internal_svg_asset_creation_allowed_in_ag08ka !== true) fail("Schema must allow internal SVG asset creation");
if (schema.source_rights_finalisation_allowed_in_ag08ka !== true) fail("Schema must allow source rights finalisation");
if (schema.credit_alt_caption_finalisation_allowed_in_ag08ka !== true) fail("Schema must allow metadata finalisation");
if (schema.cost_control_record_allowed_in_ag08ka !== true) fail("Schema must allow cost control record");
if (schema.ag08k_insertion_boundary_allowed_in_ag08ka !== true) fail("Schema must allow AG08K boundary");

if (schema.external_gpt_image_generation_allowed_in_ag08ka !== false) fail("Schema must block external GPT image generation");
if (schema.external_image_api_call_allowed_in_ag08ka !== false) fail("Schema must block external image API call");
if (schema.article_insertion_allowed_in_ag08ka !== false) fail("Schema must block article insertion");
if (schema.article_mutation_allowed_in_ag08ka !== false) fail("Schema must block article mutation");
if (schema.selected_article_file_write_allowed_in_ag08ka !== false) fail("Schema must block selected article write");
if (schema.css_js_mutation_allowed_in_ag08ka !== false) fail("Schema must block CSS/JS mutation");
if (schema.reference_insertion_allowed_in_ag08ka !== false) fail("Schema must block reference insertion");
if (schema.production_jsonl_append_allowed_in_ag08ka !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag08ka !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag08ka !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_activation_allowed_in_ag08ka !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag08ka !== false) fail("Schema must block publishing");

for (const obj of [review, assetRecord, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.visual_asset_source_finalisation_stage_only !== true) fail(`${obj.title || "object"} must be source-finalisation only`);
  if (obj.internal_asset_file_creation_allowed_and_performed !== true) fail(`${obj.title || "object"} must record internal asset creation`);
  if (obj.actual_visual_generation_performed_in_ag08ka !== false) fail(`${obj.title || "object"} must not record actual visual generation`);
  if (obj.external_gpt_image_generation_performed_in_ag08ka !== false) fail(`${obj.title || "object"} must not use external GPT image generation`);
  if (obj.external_image_api_call_performed_in_ag08ka !== false) fail(`${obj.title || "object"} must not call external image API`);
  if (obj.image_insertion_performed_in_ag08ka !== false) fail(`${obj.title || "object"} must not insert image`);
  if (obj.article_mutation_performed_in_ag08ka !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.selected_article_file_write_performed_in_ag08ka !== false) fail(`${obj.title || "object"} must not write selected article`);
  if (obj.css_mutation_performed_in_ag08ka !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag08ka !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.reference_insertion_performed_in_ag08ka !== false) fail(`${obj.title || "object"} must not insert reference`);
  if (obj.production_jsonl_append_performed_in_ag08ka !== false) fail(`${obj.title || "object"} must not append JSONL`);
  if (obj.database_write_performed_in_ag08ka !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag08ka !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag08ka !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_performed_in_ag08ka !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag08ka_asset_created_source_finalised_pending_explicit_ag08k") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag08k_only_with_explicit_user_approval !== true) fail("AG08K must require explicit approval");
if (review.closure_decision.production_readiness !== "visual_asset_ready_not_inserted") fail("Production readiness mismatch");
if (review.closure_decision.publish_readiness !== "blocked") fail("Publish readiness mismatch");

for (const scriptName of ["generate:ag08ka", "validate:ag08ka"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag08ka")) {
  fail("validate:project must include validate:ag08ka");
}

for (const phrase of [
  "Purpose",
  "Target Article",
  "Final Asset",
  "Source / Rights",
  "Cost-Control Note",
  "Future Apply Boundary",
  "Exclusions"
]) {
  if (!docText.includes(phrase)) fail(`AG08K-A document missing phrase: ${phrase}`);
}

pass("AG08K-A registry is present.");
pass("AG08K-A document is present.");
pass("AG08K-A review, finalised asset record, readiness record, AG08K boundary, schema, learning record and preview are present.");
pass("AG08J visual candidate and layout doctrine are consumed.");
pass("Target article hash remains unchanged from AG08G post-apply hash.");
pass("Internal SVG asset file is created.");
pass("Asset hash, dimensions, source, rights, credit, alt text and caption are recorded.");
pass("Cost-control note confirms no external image-generation/API call.");
pass("Asset is not inserted into the article.");
pass("AG08K controlled insertion handoff is created with explicit approval required.");
pass("No article mutation, selected article write, CSS/JS mutation or reference insertion is performed.");
pass("No production JSONL append, database/Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Production readiness is visual_asset_ready_not_inserted.");
pass("Publish readiness remains blocked.");
pass("AG08K-A is Visual Asset Creation / Source Finalisation only.");
