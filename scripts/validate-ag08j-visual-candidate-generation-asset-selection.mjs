import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag08i-visual-generation-image-insertion-plan.json",
  "data/content-intelligence/visual-registry/ag08i-visual-generation-image-insertion-plan.json",
  "data/content-intelligence/quality-registry/ag08i-visual-apply-planning-readiness.json",
  "data/content-intelligence/quality-reviews/ag08h-post-apply-audit.json",
  "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json",
  "data/content-intelligence/quality-reviews/ag08j-visual-candidate-generation-asset-selection.json",
  "data/content-intelligence/visual-registry/ag08j-visual-candidate-record.json",
  "data/content-intelligence/visual-registry/ag08j-article-object-placement-doctrine.json",
  "data/content-intelligence/quality-registry/ag08j-visual-candidate-readiness.json",
  "data/content-intelligence/mutation-plans/ag08j-to-ag08k-controlled-visual-insertion-boundary.json",
  "data/content-intelligence/schema/visual-candidate-generation-asset-selection.schema.json",
  "data/content-intelligence/learning/ag08j-visual-candidate-generation-asset-selection-learning.json",
  "data/quality/ag08j-visual-candidate-generation-asset-selection.json",
  "data/quality/ag08j-visual-candidate-generation-asset-selection-preview.json",
  "docs/quality/AG08J_VISUAL_CANDIDATE_GENERATION_ASSET_SELECTION.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG08J validation failed: ${message}`);
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

const ag08iReview = readJson("data/content-intelligence/quality-reviews/ag08i-visual-generation-image-insertion-plan.json");
const ag08iReadiness = readJson("data/content-intelligence/quality-registry/ag08i-visual-apply-planning-readiness.json");
const ag08hReview = readJson("data/content-intelligence/quality-reviews/ag08h-post-apply-audit.json");
const ag08gApply = readJson("data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag08j-visual-candidate-generation-asset-selection.json");
const candidate = readJson("data/content-intelligence/visual-registry/ag08j-visual-candidate-record.json");
const layout = readJson("data/content-intelligence/visual-registry/ag08j-article-object-placement-doctrine.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag08j-visual-candidate-readiness.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag08j-to-ag08k-controlled-visual-insertion-boundary.json");
const schema = readJson("data/content-intelligence/schema/visual-candidate-generation-asset-selection.schema.json");
const learning = readJson("data/content-intelligence/learning/ag08j-visual-candidate-generation-asset-selection-learning.json");
const registry = readJson("data/quality/ag08j-visual-candidate-generation-asset-selection.json");
const preview = readJson("data/quality/ag08j-visual-candidate-generation-asset-selection-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG08J_VISUAL_CANDIDATE_GENERATION_ASSET_SELECTION.md"), "utf8");

for (const obj of [review, candidate, layout, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG08J") fail(`module_id must be AG08J in ${obj.title || "object"}`);
}

if (ag08iReview.status !== "visual_generation_image_insertion_plan_created") fail("AG08I review must be created");
if (ag08iReadiness.status !== "visual_plan_ready_pending_future_explicit_stage") fail("AG08I readiness must pass");
if (ag08hReview.status !== "post_apply_audit_passed") fail("AG08H must pass");

const target = ag08gApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Target article missing: ${target}`);

const targetHtml = fs.readFileSync(path.join(root, target), "utf8");
const currentHash = sha256(targetHtml);
if (currentHash !== ag08gApply.post_apply_hash && !ag08kControlledVisualInsertionAllowsPostMutation(target, currentHash) && !ag09cControlledPublicExperienceCorrectionAllowsPostMutation()) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) fail("Target article hash must match AG08G post-apply hash or AG08K controlled visual insertion hash or AG09C controlled post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state");

if (review.status !== "visual_candidate_record_created_not_inserted") fail("AG08J review status mismatch");
if (candidate.status !== "visual_candidate_record_created_no_asset_generated") fail("Candidate record status mismatch");
if (layout.status !== "layout_doctrine_created") fail("Layout doctrine status mismatch");
if (readiness.status !== "visual_candidate_ready_pending_explicit_ag08k") fail("Readiness status mismatch");
if (boundary.status !== "future_apply_boundary_created_not_executed") fail("Boundary status mismatch");
if (schema.status !== "schema_visual_candidate_only") fail("Schema status mismatch");
if (learning.status !== "learning_record_only") fail("Learning status mismatch");
if (registry.status !== "visual_candidate_record_created_not_inserted") fail("Registry status mismatch");
if (preview.status !== "visual_candidate_record_created_not_inserted") fail("Preview status mismatch");

if (!candidate.candidate_visuals?.length) fail("Candidate visuals missing");
if (candidate.selected_candidate_for_future_apply !== "AG08J-CANDIDATE-001") fail("Selected candidate mismatch");

const selected = candidate.candidate_visuals.find((item) => item.candidate_id === candidate.selected_candidate_for_future_apply);
if (!selected) fail("Selected candidate not found");
if (selected.candidate_type !== "primary_hero_visual") fail("First selected candidate must be primary hero visual");
if (selected.generation_performed !== false) fail("Selected candidate must not be generated");
if (selected.asset_created !== false) fail("Selected candidate asset must not be created");
if (selected.inserted_into_article !== false) fail("Selected candidate must not be inserted");
if (!selected.prompt_brief) fail("Prompt brief missing");
if (!selected.alt_text_draft) fail("Alt text draft missing");
if (!selected.caption_draft) fail("Caption draft missing");
if (!selected.placement_recommendation?.preserve_article_shape) fail("Placement must preserve article shape");
if (!selected.placement_recommendation?.preserve_justified_text) fail("Placement must preserve justified text");

if (layout.global_article_layout_rules.preserve_article_shape !== true) fail("Layout must preserve article shape");
if (layout.global_article_layout_rules.main_text_must_remain_justified !== true) fail("Main text must remain justified");
if (layout.global_article_layout_rules.object_must_not_deform_reading_column !== true) fail("Object must not deform reading column");
if (layout.global_article_layout_rules.object_must_not_break_mobile_layout !== true) fail("Object must not break mobile layout");

if (layout.object_type_rules.hero_image.alignment !== "centered within article reading column") fail("Hero image alignment rule missing");
if (layout.object_type_rules.table.alignment !== "centered within vertical reading flow") fail("Table central alignment rule missing");
if (layout.object_type_rules.table.text_wrap !== "not_allowed") fail("Table text wrapping must be blocked");
if (layout.object_type_rules.graph_or_chart.alignment !== "centered") fail("Graph/chart central alignment rule missing");
if (layout.object_type_rules.infographic.text_wrap !== "allowed_only_if_readability_is_preserved") fail("Infographic controlled wrap rule missing");
if (!layout.future_validation_requirements.some((item) => item.includes("Main article text remains justified"))) {
  fail("Justified text validation requirement missing");
}

if (boundary.next_stage_id !== "AG08K") fail("AG08K handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG08K explicit approval required");
if (!boundary.ag08k_preconditions?.includes("Layout doctrine is enforced.")) fail("AG08K layout precondition missing");

if (readiness.all_readiness_checks_passed !== true) fail("All readiness checks must pass");
if (readiness.ag08k_handoff.next_stage_id !== "AG08K") fail("Readiness must hand off to AG08K");

if (schema.visual_candidate_record_allowed_in_ag08j !== true) fail("Schema must allow candidate record");
if (schema.layout_doctrine_record_allowed_in_ag08j !== true) fail("Schema must allow layout doctrine");
if (schema.ag08k_apply_boundary_record_allowed_in_ag08j !== true) fail("Schema must allow AG08K boundary");

if (schema.actual_visual_generation_allowed_in_ag08j !== false) fail("Schema must block actual visual generation");
if (schema.image_asset_creation_allowed_in_ag08j !== false) fail("Schema must block image asset creation");
if (schema.image_file_write_allowed_in_ag08j !== false) fail("Schema must block image file write");
if (schema.image_insertion_allowed_in_ag08j !== false) fail("Schema must block image insertion");
if (schema.article_mutation_allowed_in_ag08j !== false) fail("Schema must block article mutation");
if (schema.file_edit_allowed_in_ag08j !== false) fail("Schema must block file edit");
if (schema.css_js_mutation_allowed_in_ag08j !== false) fail("Schema must block CSS/JS mutation");
if (schema.reference_insertion_allowed_in_ag08j !== false) fail("Schema must block reference insertion");
if (schema.production_jsonl_append_allowed_in_ag08j !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag08j !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag08j !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_activation_allowed_in_ag08j !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag08j !== false) fail("Schema must block publishing");

for (const obj of [review, candidate, layout, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.visual_candidate_stage_only !== true) fail(`${obj.title || "object"} must be candidate-only`);
  if (obj.actual_visual_generation_performed_in_ag08j !== false) fail(`${obj.title || "object"} must not generate visual`);
  if (obj.image_asset_created_in_ag08j !== false) fail(`${obj.title || "object"} must not create asset`);
  if (obj.image_file_write_performed_in_ag08j !== false) fail(`${obj.title || "object"} must not write image file`);
  if (obj.image_insertion_performed_in_ag08j !== false) fail(`${obj.title || "object"} must not insert image`);
  if (obj.article_mutation_performed_in_ag08j !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.file_edit_performed_in_ag08j !== false) fail(`${obj.title || "object"} must not edit file`);
  if (obj.css_mutation_performed_in_ag08j !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag08j !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.reference_insertion_performed_in_ag08j !== false) fail(`${obj.title || "object"} must not insert references`);
  if (obj.production_jsonl_append_performed_in_ag08j !== false) fail(`${obj.title || "object"} must not append JSONL`);
  if (obj.database_write_performed_in_ag08j !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag08j !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag08j !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_performed_in_ag08j !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag08j_visual_candidate_record_created_pending_explicit_ag08k") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag08k_only_with_explicit_user_approval !== true) fail("AG08K must require explicit approval");
if (review.closure_decision.production_readiness !== "visual_candidate_record_created_not_inserted") fail("Production readiness mismatch");
if (review.closure_decision.publish_readiness !== "blocked") fail("Publish readiness mismatch");

for (const scriptName of ["generate:ag08j", "validate:ag08j"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag08j")) {
  fail("validate:project must include validate:ag08j");
}

for (const phrase of [
  "Purpose",
  "Target Article",
  "Selected Candidate for Future Apply",
  "Placement Doctrine",
  "Future Apply Boundary",
  "Exclusions"
]) {
  if (!docText.includes(phrase)) fail(`AG08J document missing phrase: ${phrase}`);
}

pass("AG08J registry is present.");
pass("AG08J document is present.");
pass("AG08J review, candidate record, layout doctrine, readiness record, AG08K boundary, schema, learning record and preview are present.");
pass("AG08I planning and AG08H audit are consumed.");
pass("Target article hash matches AG08G post-apply hash.");
pass("Primary hero visual candidate is recorded without asset generation.");
pass("Prompt, source/rights status, credit draft, alt text and caption are recorded.");
pass("Article object placement doctrine is recorded.");
pass("Hero/image, infographic, graph/chart, table, figure/diagram and map placement rules are recorded.");
pass("Justified text, central table/figure alignment and controlled wrap rules are recorded.");
pass("AG08K handoff is created with explicit approval required.");
pass("No visual generation, image asset creation, image insertion, article mutation or file edit is performed.");
pass("No CSS/JS mutation, production JSONL append, database/Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Production readiness is visual_candidate_record_created_not_inserted.");
pass("Publish readiness remains blocked.");
pass("AG08J is Visual Candidate Generation / Asset Selection only.");
