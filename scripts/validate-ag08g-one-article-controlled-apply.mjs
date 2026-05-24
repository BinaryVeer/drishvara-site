import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag08f-draft-approval-controlled-apply-plan.json",
  "data/content-intelligence/approval-registry/ag08f-draft-reference-approval-record.json",
  "data/content-intelligence/mutation-plans/ag08f-controlled-apply-plan.json",
  "data/content-intelligence/quality-reviews/ag08g-one-article-controlled-apply.json",
  "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json",
  "data/content-intelligence/quality-registry/ag08g-post-apply-audit-prep.json",
  "data/content-intelligence/schema/one-article-controlled-apply-ag08g.schema.json",
  "data/content-intelligence/learning/ag08g-one-article-controlled-apply-learning.json",
  "data/quality/ag08g-one-article-controlled-apply.json",
  "data/quality/ag08g-one-article-controlled-apply-preview.json",
  "docs/quality/AG08G_ONE_ARTICLE_CONTROLLED_APPLY.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG08G validation failed: ${message}`);
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









function ag12cControlledLayoutRefinementAllowsPostMutation(selectedPath = null, currentHash = null) {
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json");

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

function countOccurrences(text, needle) {
  return String(text).split(needle).length - 1;
}

function listHtmlFiles(dir) {
  const out = [];
  if (!fs.existsSync(path.join(root, dir))) return out;

  function walk(absDir) {
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      const abs = path.join(absDir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else if (entry.isFile() && entry.name.endsWith(".html")) out.push(path.relative(root, abs));
    }
  }

  walk(path.join(root, dir));
  return out;
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag08fReview = readJson("data/content-intelligence/quality-reviews/ag08f-draft-approval-controlled-apply-plan.json");
const ag08fApproval = readJson("data/content-intelligence/approval-registry/ag08f-draft-reference-approval-record.json");
const ag08fApplyPlan = readJson("data/content-intelligence/mutation-plans/ag08f-controlled-apply-plan.json");

const review = readJson("data/content-intelligence/quality-reviews/ag08g-one-article-controlled-apply.json");
const applyRecord = readJson("data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json");
const auditPrep = readJson("data/content-intelligence/quality-registry/ag08g-post-apply-audit-prep.json");
const schema = readJson("data/content-intelligence/schema/one-article-controlled-apply-ag08g.schema.json");
const learning = readJson("data/content-intelligence/learning/ag08g-one-article-controlled-apply-learning.json");
const registry = readJson("data/quality/ag08g-one-article-controlled-apply.json");
const preview = readJson("data/quality/ag08g-one-article-controlled-apply-preview.json");
const pkg = readJson("package.json");

for (const obj of [review, applyRecord, auditPrep, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG08G") fail(`module_id must be AG08G in ${obj.title || "object"}`);
}

if (ag08fReview.closure_decision.proceed_to_ag08g_only_with_explicit_user_approval !== true) fail("AG08F must authorize AG08G");
if (ag08fReview.closure_decision.article_mutation_performed !== false) fail("AG08F must not have mutated article");

const target = ag08fApplyPlan.ag08g_target_article_path;
const backup = ag08fApplyPlan.ag08g_backup_path;

if (target !== "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html") fail("AG08G target path mismatch");
if (applyRecord.selected_article_path !== target) fail("Apply record target mismatch");
if (auditPrep.selected_article_path !== target) fail("Audit prep target mismatch");
if (review.summary.selected_article_path !== target) fail("Review summary target mismatch");

if (!fs.existsSync(path.join(root, target))) fail(`Target article missing: ${target}`);
if (!fs.existsSync(path.join(root, backup))) fail(`Backup missing: ${backup}`);

const targetHtml = fs.readFileSync(path.join(root, target), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backup), "utf8");

const targetHash = sha256(targetHtml);
const backupHash = sha256(backupHtml);

if (backupHash !== applyRecord.backup_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Backup hash mismatch or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (backupHash !== applyRecord.pre_apply_hash) fail("Backup must match pre-apply hash");
if (targetHash !== applyRecord.post_apply_hash && !ag08kControlledVisualInsertionAllowsPostMutation(applyRecord.selected_article_path, targetHash)) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Target hash mismatch or AG08K controlled visual insertion hash missing or AG10K controlled generated-image post-insertion hash missing or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (targetHash === backupHash) fail("Target must differ from backup after apply");

if (backupHtml.includes("AG08G-CONTROLLED-APPLY")) fail("Backup must not contain AG08G marker");
if (countOccurrences(targetHtml, "AG08G-CONTROLLED-APPLY") !== 1) fail("Target must contain exactly one AG08G marker");
if (countOccurrences(targetHtml, "AG08G-APPROVED-REFERENCES") !== 1) fail("Target must contain exactly one AG08G approved references marker");

const approvedRefs = ag08fApproval.reference_approval.approved_references || [];
if (approvedRefs.length < 2) fail("At least two AG08F approved references are required");

for (const ref of approvedRefs) {
  if (!targetHtml.includes(ref.url)) fail(`Approved reference URL missing from target article: ${ref.url}`);
}

const articleFilesWithMarker = listHtmlFiles("articles").filter((file) => {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  return html.includes("AG08G-CONTROLLED-APPLY");
});

if (articleFilesWithMarker.length !== 1) fail(`Exactly one article must contain AG08G marker; found ${articleFilesWithMarker.length}`);
if (articleFilesWithMarker[0] !== target) fail(`AG08G marker found in wrong article: ${articleFilesWithMarker[0]}`);

const backupImageCount = countOccurrences(backupHtml.toLowerCase(), "<img");
const targetImageCount = countOccurrences(targetHtml.toLowerCase(), "<img");
if (targetImageCount > backupImageCount) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("AG08G must not increase image count or AG10K controlled generated-image insertion explains the approved image-count increase or AG11B controlled chart post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");

if (applyRecord.exactly_one_article_file_mutated !== true) fail("Apply record must confirm exactly one article mutation");
if (applyRecord.backup_created_before_apply !== true) fail("Backup must be created before apply");
if (applyRecord.article_mutation_performed !== true) fail("Article mutation must be true in AG08G");
if (applyRecord.article_file_write_performed !== true) fail("Article file write must be true in AG08G");
if (applyRecord.reference_insertion_performed !== true) fail("Reference insertion must be true in AG08G");
if (applyRecord.visual_generation_performed !== false) fail("Visual generation must be false");
if (applyRecord.image_insertion_performed !== false) fail("Image insertion must be false");
if (applyRecord.production_jsonl_append_performed !== false) fail("Production JSONL append must be false");
if (applyRecord.database_write_performed !== false) fail("Database write must be false");
if (applyRecord.supabase_write_performed !== false) fail("Supabase write must be false");
if (applyRecord.backend_auth_supabase_activation_performed !== false) fail("Backend/Auth/Supabase activation must be false");
if (applyRecord.public_publishing_performed !== false) fail("Publishing must be false");

if (auditPrep.status !== "post_apply_audit_required") fail("AG08H audit must be required");
if (auditPrep.ag08h_handoff.next_stage_id !== "AG08H") fail("AG08H handoff missing");
if (auditPrep.ag08h_handoff.explicit_approval_required !== true) fail("AG08H must require explicit approval");

if (schema.selected_article_mutation_allowed_in_ag08g !== true) fail("Schema must allow selected article mutation");
if (schema.approved_reference_insertion_allowed_in_ag08g !== true) fail("Schema must allow approved reference insertion");
if (schema.visual_generation_allowed_in_ag08g !== false) fail("Schema must block visual generation");
if (schema.image_insertion_allowed_in_ag08g !== false) fail("Schema must block image insertion");
if (schema.multi_article_mutation_allowed_in_ag08g !== false) fail("Schema must block multi-article mutation");
if (schema.homepage_mutation_allowed_in_ag08g !== false) fail("Schema must block homepage mutation");
if (schema.css_js_mutation_allowed_in_ag08g !== false) fail("Schema must block CSS/JS mutation");
if (schema.production_jsonl_append_allowed_in_ag08g !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag08g !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag08g !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_allowed_in_ag08g !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag08g !== false) fail("Schema must block publishing");

if (review.closure_decision.decision !== "ag08g_one_article_apply_completed_pending_ag08h_audit") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag08h_only_with_explicit_user_approval !== true) fail("AG08H must require explicit approval");

for (const scriptName of ["generate:ag08g", "validate:ag08g"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag08g")) {
  fail("validate:project must include validate:ag08g");
}

pass("AG08G registry is present.");
pass("AG08G document is present.");
pass("AG08G review, apply record, audit prep, schema, learning record and preview are present.");
pass("AG08F approval and controlled apply plan are consumed.");
pass(`Backup exists: ${backup}`);
pass("Backup has no AG08G marker.");
pass(`Exactly one selected article is mutated: ${target}`);
pass("Target article contains exactly one AG08G controlled apply marker.");
pass("AG08F-approved references are inserted.");
pass("Exactly one article contains the AG08G marker.");
pass("No visual generation or image insertion is performed.");
pass("No production JSONL append, database write, Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Production readiness is one_article_applied_pending_post_apply_audit.");
pass("Publish readiness is static_file_changed_not_publish_approved.");
pass("AG08H Post-Apply Audit is identified as next only with explicit approval.");
