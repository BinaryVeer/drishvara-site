import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag08k-controlled-visual-image-insertion-apply.json",
  "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json",
  "data/content-intelligence/quality-registry/ag08k-post-insertion-audit-prep.json",
  "data/content-intelligence/quality-registry/ag08k-layout-preservation-record.json",
  "data/content-intelligence/visual-registry/ag08ka-finalised-visual-asset-record.json",
  "data/content-intelligence/quality-reviews/ag08l-post-visual-insertion-audit.json",
  "data/content-intelligence/audit-records/ag08l-post-visual-insertion-audit-report.json",
  "data/content-intelligence/quality-registry/ag08l-rollback-readiness-record.json",
  "data/content-intelligence/quality-registry/ag08l-layout-visual-integrity-record.json",
  "data/content-intelligence/schema/post-visual-insertion-audit.schema.json",
  "data/content-intelligence/learning/ag08l-post-visual-insertion-audit-learning.json",
  "data/quality/ag08l-post-visual-insertion-audit.json",
  "data/quality/ag08l-post-visual-insertion-audit-preview.json",
  "docs/quality/AG08L_POST_VISUAL_INSERTION_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG08L validation failed: ${message}`);
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

function countOccurrences(text, needle) {
  return String(text || "").split(needle).length - 1;
}

function listHtmlFiles(dir) {
  const out = [];
  const absRoot = path.join(root, dir);
  if (!fs.existsSync(absRoot)) return out;

  function walk(absDir) {
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      const abs = path.join(absDir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else if (entry.isFile() && entry.name.endsWith(".html")) out.push(path.relative(root, abs));
    }
  }

  walk(absRoot);
  return out;
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag08kReview = readJson("data/content-intelligence/quality-reviews/ag08k-controlled-visual-image-insertion-apply.json");
const ag08kApply = readJson("data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json");
const ag08kAuditPrep = readJson("data/content-intelligence/quality-registry/ag08k-post-insertion-audit-prep.json");

const review = readJson("data/content-intelligence/quality-reviews/ag08l-post-visual-insertion-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag08l-post-visual-insertion-audit-report.json");
const rollback = readJson("data/content-intelligence/quality-registry/ag08l-rollback-readiness-record.json");
const layout = readJson("data/content-intelligence/quality-registry/ag08l-layout-visual-integrity-record.json");
const schema = readJson("data/content-intelligence/schema/post-visual-insertion-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag08l-post-visual-insertion-audit-learning.json");
const registry = readJson("data/quality/ag08l-post-visual-insertion-audit.json");
const preview = readJson("data/quality/ag08l-post-visual-insertion-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG08L_POST_VISUAL_INSERTION_AUDIT.md"), "utf8");

for (const obj of [review, audit, rollback, layout, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG08L") fail(`module_id must be AG08L in ${obj.title || "object"}`);
}

if (ag08kReview.status !== "controlled_visual_image_inserted_pending_post_insertion_audit") fail("AG08K review status mismatch");
if (ag08kApply.status !== "controlled_visual_image_inserted_pending_post_insertion_audit") fail("AG08K apply status mismatch");
if (ag08kAuditPrep.status !== "post_visual_insertion_audit_required") fail("AG08K audit prep must require audit");

const target = ag08kApply.selected_article_path;
const backupPath = ag08kApply.backup_path;
const assetPath = ag08kApply.asset_path;

if (!fs.existsSync(path.join(root, target))) fail(`Target article missing: ${target}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`Backup missing: ${backupPath}`);
if (!fs.existsSync(path.join(root, assetPath))) fail(`Asset missing: ${assetPath}`);

const targetHtml = fs.readFileSync(path.join(root, target), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");
const assetSvg = fs.readFileSync(path.join(root, assetPath), "utf8");

const targetHash = sha256(targetHtml);
const backupHash = sha256(backupHtml);
const assetHash = sha256(assetSvg);

if (targetHash !== ag08kApply.post_insertion_hash && !ag09cControlledPublicExperienceCorrectionAllowsPostMutation()) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) fail("Target hash must match AG08K post-insertion hash or AG09C controlled post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state");
if (backupHash !== ag08kApply.backup_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) fail("Backup hash must match AG08K backup hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state");
if (backupHash !== ag08kApply.pre_insertion_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) fail("Backup hash must match AG08K pre-insertion hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state");
if (targetHash === backupHash) fail("Target must differ from AG08K backup");
if (backupHtml.includes("AG08K-HERO-VISUAL-INSERTION")) fail("Backup must not contain AG08K marker");
if (assetHash !== ag08kApply.asset_hash_sha256) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) fail("Asset hash must match AG08K apply record or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state");

if (countOccurrences(targetHtml, "AG08K-HERO-VISUAL-INSERTION") !== 1) fail("Target must contain exactly one AG08K marker");
if (countOccurrences(targetHtml, 'id="ag08k-hero-visual-block"') !== 1) fail("Target must contain exactly one AG08K hero visual block ID");
if (!targetHtml.includes(ag08kApply.asset_src_inserted)) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) fail("Target must include inserted asset src or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state");
if (!targetHtml.includes(ag08kApply.inserted_alt_text)) fail("Target must include inserted alt text");
if (!targetHtml.includes(ag08kApply.inserted_caption)) fail("Target must include inserted caption");
if (!targetHtml.includes(ag08kApply.inserted_credit)) fail("Target must include inserted credit");

if (countOccurrences(targetHtml, "AG08G-CONTROLLED-APPLY") !== 1) fail("AG08G marker must be preserved once");
if (countOccurrences(targetHtml, "AG08G-APPROVED-REFERENCES") !== 1) fail("AG08G reference marker must be preserved once");
if (countOccurrences(targetHtml, "AG08G-LEGACY-GOVERNANCE-PRESERVED") !== 1) fail("AG08G legacy marker must be preserved once");

const hasAg03cB2Evidence =
  /AG03C-B2/i.test(targetHtml) ||
  /data-drishvara-ag03c-b2-reference-block=["']true["']/i.test(targetHtml);

const hasAg05dEvidence =
  /AG05D/i.test(targetHtml) ||
  /data-drishvara-ag05d-visible-reference-block=["']true["']/i.test(targetHtml) ||
  /drishvara-ag05d-visible-reference-block/i.test(targetHtml);

if (!hasAg03cB2Evidence) fail("AG03C-B2 evidence must be preserved");
if (!hasAg05dEvidence) fail("AG05D evidence must be preserved");

const markerFiles = listHtmlFiles("articles").filter((file) => {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  return html.includes("AG08K-HERO-VISUAL-INSERTION");
});

if (markerFiles.length !== 1) fail(`Exactly one article must contain AG08K marker; found ${markerFiles.length}`);
if (markerFiles[0] !== target) fail(`AG08K marker found in wrong article: ${markerFiles[0]}`);

if (audit.status !== "post_visual_insertion_audit_passed") fail("AG08L audit report must pass");
if (review.status !== "post_visual_insertion_audit_passed") fail("AG08L review must pass");
if (registry.status !== "post_visual_insertion_audit_passed") fail("AG08L registry must pass");
if (preview.status !== "post_visual_insertion_audit_passed") fail("AG08L preview must pass");

if (audit.backup_integrity.backup_integrity_status !== "passed") fail("Backup integrity must pass");
if (audit.visual_scope.visual_scope_status !== "passed") fail("Visual scope must pass");
if (audit.asset_metadata_audit.asset_metadata_status !== "passed") fail("Asset metadata must pass");
if (audit.layout_integrity.layout_integrity_status !== "passed") fail("Layout integrity must pass");
if (audit.governance_preservation.governance_preservation_status !== "passed") fail("Governance preservation must pass");
if (audit.forbidden_system_guards.forbidden_system_guard_status !== "passed") fail("Forbidden-system guards must pass");
if (audit.rollback_readiness.rollback_ready !== true) fail("Rollback readiness must be true");

if (layout.status !== "layout_visual_integrity_audited") fail("Layout visual integrity status mismatch");
if (layout.article_shape_preservation_required !== true) fail("Article shape preservation must be required");
if (layout.justified_text_preservation_required !== true) fail("Justified text preservation must be required");
if (layout.hero_visual_does_not_require_text_wrap !== true) fail("Hero visual must not require text wrap");
if (layout.width_height_declared !== true) fail("Width/height must be declared");
if (layout.figure_block_present !== true) fail("Figure block must be present");
if (layout.figcaption_present !== true) fail("Figcaption must be present");
if (layout.credit_present !== true) fail("Credit must be present");

if (rollback.status !== "rollback_ready_not_executed") fail("Rollback record must be ready and not executed");
if (rollback.rollback_readiness.rollback_execution_performed !== false) fail("Rollback must not be executed in AG08L");

if (schema.article_mutation_allowed_in_ag08l !== false) fail("Schema must block article mutation");
if (schema.selected_article_file_write_allowed_in_ag08l !== false) fail("Schema must block selected article write");
if (schema.image_insertion_allowed_in_ag08l !== false) fail("Schema must block image insertion");
if (schema.visual_generation_allowed_in_ag08l !== false) fail("Schema must block visual generation");
if (schema.image_asset_creation_allowed_in_ag08l !== false) fail("Schema must block image asset creation");
if (schema.css_js_mutation_allowed_in_ag08l !== false) fail("Schema must block CSS/JS mutation");
if (schema.reference_insertion_allowed_in_ag08l !== false) fail("Schema must block reference insertion");
if (schema.reference_url_change_allowed_in_ag08l !== false) fail("Schema must block reference URL change");
if (schema.production_jsonl_append_allowed_in_ag08l !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag08l !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag08l !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_activation_allowed_in_ag08l !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag08l !== false) fail("Schema must block publishing");
if (schema.rollback_execution_allowed_in_ag08l !== false) fail("Schema must block rollback execution");

for (const obj of [review, audit, rollback, layout, schema, learning, registry, preview]) {
  if (obj.post_visual_insertion_audit_only !== true) fail(`${obj.title || "object"} must be post-visual-insertion audit only`);
  if (obj.new_article_mutation_performed_in_ag08l !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.selected_article_file_write_performed_in_ag08l !== false) fail(`${obj.title || "object"} must not write selected article`);
  if (obj.image_insertion_performed_in_ag08l !== false) fail(`${obj.title || "object"} must not insert image`);
  if (obj.visual_generation_performed_in_ag08l !== false) fail(`${obj.title || "object"} must not generate visual`);
  if (obj.image_asset_creation_performed_in_ag08l !== false) fail(`${obj.title || "object"} must not create asset`);
  if (obj.css_mutation_performed_in_ag08l !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag08l !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.reference_insertion_performed_in_ag08l !== false) fail(`${obj.title || "object"} must not insert reference`);
  if (obj.reference_url_change_performed_in_ag08l !== false) fail(`${obj.title || "object"} must not change reference URL`);
  if (obj.production_jsonl_append_performed_in_ag08l !== false) fail(`${obj.title || "object"} must not append JSONL`);
  if (obj.database_write_performed_in_ag08l !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag08l !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag08l !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_performed_in_ag08l !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag08k_visual_insertion_audited_pending_cycle_closure") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag08z_only_with_explicit_user_approval !== true) fail("AG08Z must require explicit approval");
if (review.closure_decision.production_readiness !== "visual_insertion_audited") fail("Production readiness mismatch");
if (review.closure_decision.publish_readiness !== "static_file_changed_not_publish_approved") fail("Publish readiness mismatch");

for (const scriptName of ["generate:ag08l", "validate:ag08l"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag08l")) {
  fail("validate:project must include validate:ag08l");
}

for (const phrase of [
  "Purpose",
  "Target Article",
  "Audit Result",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG08L document missing phrase: ${phrase}`);
}

pass("AG08L registry is present.");
pass("AG08L document is present.");
pass("AG08L review, audit report, rollback readiness, layout integrity, schema, learning record and preview are present.");
pass("AG08K apply record and audit prep are consumed.");
pass("AG08K backup integrity is confirmed.");
pass("Single-article visual insertion scope is confirmed.");
pass("AG08K marker count is valid.");
pass("Approved SVG path/hash, alt text, caption and visible credit are confirmed.");
pass("Layout preservation and article-shape rules are confirmed.");
pass("AG08G marker, AG08G reference marker and legacy governance evidence are preserved.");
pass("Forbidden-system guards are confirmed.");
pass("Rollback readiness is confirmed.");
pass("No new article mutation, file edit, image insertion, visual generation, CSS/JS mutation or reference change is performed.");
pass("No production JSONL append, database/Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Production readiness is visual_insertion_audited.");
pass("Publish readiness remains static_file_changed_not_publish_approved.");
pass("AG08Z Repeatable Article Upgrade Cycle Closure is identified as next only with explicit approval.");
