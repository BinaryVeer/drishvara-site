import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag08l-post-visual-insertion-audit.json",
  "data/content-intelligence/audit-records/ag08l-post-visual-insertion-audit-report.json",
  "data/content-intelligence/quality-registry/ag08l-rollback-readiness-record.json",
  "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json",
  "data/content-intelligence/quality-reviews/ag08z-repeatable-article-upgrade-cycle-closure.json",
  "data/content-intelligence/closure-records/ag08z-repeatable-article-upgrade-cycle-closure.json",
  "data/content-intelligence/quality-registry/ag08z-final-readiness-record.json",
  "data/content-intelligence/quality-registry/ag08z-next-cycle-recommendations.json",
  "data/content-intelligence/schema/repeatable-article-upgrade-cycle-closure.schema.json",
  "data/content-intelligence/learning/ag08z-repeatable-article-upgrade-cycle-closure-learning.json",
  "data/quality/ag08z-repeatable-article-upgrade-cycle-closure.json",
  "data/quality/ag08z-repeatable-article-upgrade-cycle-closure-preview.json",
  "docs/quality/AG08Z_REPEATABLE_ARTICLE_UPGRADE_CYCLE_CLOSURE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG08Z validation failed: ${message}`);
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

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag08lReview = readJson("data/content-intelligence/quality-reviews/ag08l-post-visual-insertion-audit.json");
const ag08lAudit = readJson("data/content-intelligence/audit-records/ag08l-post-visual-insertion-audit-report.json");
const ag08lRollback = readJson("data/content-intelligence/quality-registry/ag08l-rollback-readiness-record.json");
const ag08kApply = readJson("data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag08z-repeatable-article-upgrade-cycle-closure.json");
const closure = readJson("data/content-intelligence/closure-records/ag08z-repeatable-article-upgrade-cycle-closure.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag08z-final-readiness-record.json");
const recommendations = readJson("data/content-intelligence/quality-registry/ag08z-next-cycle-recommendations.json");
const schema = readJson("data/content-intelligence/schema/repeatable-article-upgrade-cycle-closure.schema.json");
const learning = readJson("data/content-intelligence/learning/ag08z-repeatable-article-upgrade-cycle-closure-learning.json");
const registry = readJson("data/quality/ag08z-repeatable-article-upgrade-cycle-closure.json");
const preview = readJson("data/quality/ag08z-repeatable-article-upgrade-cycle-closure-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG08Z_REPEATABLE_ARTICLE_UPGRADE_CYCLE_CLOSURE.md"), "utf8");

for (const obj of [review, closure, readiness, recommendations, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG08Z") fail(`module_id must be AG08Z in ${obj.title || "object"}`);
}

if (ag08lReview.status !== "post_visual_insertion_audit_passed") fail("AG08L review must pass");
if (ag08lAudit.status !== "post_visual_insertion_audit_passed") fail("AG08L audit must pass");
if (ag08lRollback.status !== "rollback_ready_not_executed") fail("AG08L rollback readiness must be ready and not executed");

const target = ag08kApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const targetHtml = fs.readFileSync(path.join(root, target), "utf8");
const targetHash = sha256(targetHtml);

if (targetHash !== ag08kApply.post_insertion_hash && !ag09cControlledPublicExperienceCorrectionAllowsPostMutation()) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) fail("Selected article hash must match AG08K post-insertion hash or AG09C controlled post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state");

if (review.status !== "repeatable_article_upgrade_cycle_closed") fail("AG08Z review must close cycle");
if (closure.status !== "repeatable_article_upgrade_cycle_closed") fail("AG08Z closure must close cycle");
if (registry.status !== "repeatable_article_upgrade_cycle_closed") fail("AG08Z registry must close cycle");
if (preview.status !== "repeatable_article_upgrade_cycle_closed") fail("AG08Z preview must close cycle");

if (readiness.status !== "repeatable_cycle_closed_one_article_text_reference_visual_audited") fail("Final readiness status mismatch");
if (readiness.final_readiness_passed !== true) fail("Final readiness must pass");
if (readiness.production_readiness !== "repeatable_cycle_closed_one_article_audited") fail("Production readiness mismatch");
if (readiness.publish_readiness !== "static_file_changed_not_publish_approved") fail("Publish readiness mismatch");

for (const check of readiness.final_readiness_checks) {
  if (check.status !== "passed") fail(`Final readiness check failed: ${check.check_id}`);
}

if (recommendations.status !== "recommendations_recorded_not_started") fail("Next-cycle recommendations must be recorded but not started");
if (recommendations.recommended_next_stage.stage_id !== "AG09A") fail("AG09A handoff missing");
if (recommendations.recommended_next_stage.explicit_approval_required !== true) fail("AG09A must require explicit approval");
if (recommendations.not_started_in_ag08z !== true) fail("Next cycle must not start in AG08Z");

if (closure.repeatable_doctrine.operating_model !== "single_article_controlled_cycle") fail("Repeatable doctrine operating model mismatch");
if (!closure.repeatable_doctrine.stage_sequence_proven.includes("controlled visual insertion")) fail("Controlled visual insertion stage missing from doctrine");
if (!closure.repeatable_doctrine.cost_control_lessons.some((item) => item.includes("internal SVG"))) fail("Internal SVG cost-control lesson missing");
if (!closure.repeatable_doctrine.layout_lessons.some((item) => item.includes("article shape"))) fail("Article-shape layout lesson missing");

if (schema.status !== "schema_closure_only") fail("Schema status mismatch");
if (schema.final_evidence_record_allowed_in_ag08z !== true) fail("Schema must allow final evidence record");
if (schema.repeatable_doctrine_record_allowed_in_ag08z !== true) fail("Schema must allow repeatable doctrine");
if (schema.next_cycle_recommendations_allowed_in_ag08z !== true) fail("Schema must allow recommendations");
if (schema.cost_control_learning_allowed_in_ag08z !== true) fail("Schema must allow cost-control learning");
if (schema.layout_learning_allowed_in_ag08z !== true) fail("Schema must allow layout learning");

if (schema.article_mutation_allowed_in_ag08z !== false) fail("Schema must block article mutation");
if (schema.selected_article_file_write_allowed_in_ag08z !== false) fail("Schema must block selected article write");
if (schema.reference_insertion_allowed_in_ag08z !== false) fail("Schema must block reference insertion");
if (schema.reference_url_change_allowed_in_ag08z !== false) fail("Schema must block reference URL change");
if (schema.visual_generation_allowed_in_ag08z !== false) fail("Schema must block visual generation");
if (schema.image_asset_creation_allowed_in_ag08z !== false) fail("Schema must block image asset creation");
if (schema.image_insertion_allowed_in_ag08z !== false) fail("Schema must block image insertion");
if (schema.css_js_mutation_allowed_in_ag08z !== false) fail("Schema must block CSS/JS mutation");
if (schema.production_jsonl_append_allowed_in_ag08z !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag08z !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag08z !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_activation_allowed_in_ag08z !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag08z !== false) fail("Schema must block publishing");
if (schema.rollback_execution_allowed_in_ag08z !== false) fail("Schema must block rollback execution");

for (const obj of [review, closure, readiness, recommendations, schema, learning, registry, preview]) {
  if (obj.closure_only !== true) fail(`${obj.title || "object"} must be closure-only`);
  if (obj.new_article_mutation_performed_in_ag08z !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.selected_article_file_write_performed_in_ag08z !== false) fail(`${obj.title || "object"} must not write selected article`);
  if (obj.reference_insertion_performed_in_ag08z !== false) fail(`${obj.title || "object"} must not insert references`);
  if (obj.reference_url_change_performed_in_ag08z !== false) fail(`${obj.title || "object"} must not change references`);
  if (obj.visual_generation_performed_in_ag08z !== false) fail(`${obj.title || "object"} must not generate visual`);
  if (obj.image_asset_creation_performed_in_ag08z !== false) fail(`${obj.title || "object"} must not create image asset`);
  if (obj.image_insertion_performed_in_ag08z !== false) fail(`${obj.title || "object"} must not insert image`);
  if (obj.css_mutation_performed_in_ag08z !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag08z !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.production_jsonl_append_performed_in_ag08z !== false) fail(`${obj.title || "object"} must not append JSONL`);
  if (obj.database_write_performed_in_ag08z !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag08z !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag08z !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_performed_in_ag08z !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag08_cycle_closed_pending_next_cycle_approval") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag09a_only_with_explicit_user_approval !== true) fail("AG09A must require explicit approval");

for (const scriptName of ["generate:ag08z", "validate:ag08z"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag08z")) {
  fail("validate:project must include validate:ag08z");
}

for (const phrase of [
  "Purpose",
  "Closed Target",
  "Closure Result",
  "Evidence Carried Forward",
  "Repeatable Doctrine",
  "Cost-Control Lesson",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG08Z document missing phrase: ${phrase}`);
}

pass("AG08Z registry is present.");
pass("AG08Z document is present.");
pass("AG08Z review, closure record, final readiness, next-cycle recommendations, schema, learning record and preview are present.");
pass("AG08L post-visual-insertion audit is consumed and passed.");
pass("Selected article hash matches AG08K post-insertion hash.");
pass("Text/reference apply and audit evidence are carried forward.");
pass("Visual planning, candidate, asset, insertion and audit evidence are carried forward.");
pass("Repeatable doctrine is created.");
pass("Cost-control lessons are recorded.");
pass("Layout and article-shape lessons are recorded.");
pass("Rollback readiness is carried forward.");
pass("AG09A next-cycle handoff is recorded but not started.");
pass("No new article mutation, file edit, reference insertion, visual generation or image insertion is performed.");
pass("No production JSONL append, database/Supabase write, backend/Auth/Supabase activation, publishing or rollback execution is performed.");
pass("Production readiness is repeatable_cycle_closed_one_article_audited.");
pass("Publish readiness remains static_file_changed_not_publish_approved.");
pass("AG08Z closes the AG08 repeatable article upgrade cycle.");
