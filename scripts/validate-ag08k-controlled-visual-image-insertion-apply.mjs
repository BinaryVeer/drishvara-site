import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag08ka-visual-asset-creation-source-finalisation.json",
  "data/content-intelligence/visual-registry/ag08ka-finalised-visual-asset-record.json",
  "data/content-intelligence/quality-registry/ag08ka-visual-asset-readiness.json",
  "data/content-intelligence/mutation-plans/ag08ka-to-ag08k-controlled-insertion-boundary.json",
  "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json",
  "data/content-intelligence/quality-reviews/ag08k-controlled-visual-image-insertion-apply.json",
  "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json",
  "data/content-intelligence/quality-registry/ag08k-post-insertion-audit-prep.json",
  "data/content-intelligence/quality-registry/ag08k-layout-preservation-record.json",
  "data/content-intelligence/schema/controlled-visual-image-insertion-apply.schema.json",
  "data/content-intelligence/learning/ag08k-controlled-visual-image-insertion-apply-learning.json",
  "data/quality/ag08k-controlled-visual-image-insertion-apply.json",
  "data/quality/ag08k-controlled-visual-image-insertion-apply-preview.json",
  "docs/quality/AG08K_CONTROLLED_VISUAL_IMAGE_INSERTION_APPLY.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG08K validation failed: ${message}`);
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

function creditTextAcceptedAfterAr01R1(originalCredit, html, articlePath = null) {
  if (!originalCredit || !html) return false;
  if (html.includes(originalCredit)) return true;

  const ar01R1ApplyPath = path.join(root, "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json");
  if (!fs.existsSync(ar01R1ApplyPath)) return false;

  try {
    const ar01R1Apply = JSON.parse(fs.readFileSync(ar01R1ApplyPath, "utf8"));
    const articlePathMatches =
      articlePath === null ||
      articlePath === undefined ||
      ar01R1Apply.selected_article_path === articlePath;

    if (
      ar01R1Apply.status !== "credit_reference_surface_cleanup_applied" ||
      !articlePathMatches
    ) {
      return false;
    }

    const normalizedCandidates = new Set([
      originalCredit,
      String(originalCredit).replace("Visual: Drishvara editorial illustration.", "Visual: Drishvara editorial synthesis."),
      String(originalCredit).replace("Visual: Drishvara.", "Visual: Drishvara editorial synthesis."),
      String(originalCredit).replace("Chart: Drishvara. Source: article-text theme count.", "Chart: Drishvara editorial synthesis. Basis: deterministic article-text term count."),
      String(originalCredit).replace("Infographic: Drishvara. Source: article-derived conceptual synthesis.", "Infographic: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."),
      String(originalCredit).replace("Diagram: Drishvara. Source: article-derived conceptual synthesis.", "Diagram: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."),
      String(originalCredit).replace("Table: Drishvara. Source: article-derived conceptual synthesis.", "Table: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."),
      String(originalCredit).replace("Map: Drishvara. Source: article-derived conceptual synthesis.", "Map: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."),
      String(originalCredit).replace("Composite: Drishvara. Source: article-derived conceptual synthesis.", "Composite: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.")
    ]);

    for (const candidate of normalizedCandidates) {
      if (candidate && html.includes(candidate)) return true;
    }

    if (
      /Visual:\s*Drishvara editorial synthesis\./.test(html) &&
      /Drishvara/.test(String(originalCredit))
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

function creditTextSupersededByAr01R1(originalCredit, html, articlePath = null) {
  if (!originalCredit || !html) return false;
  if (html.includes(originalCredit)) return true;

  const ar01R1ApplyPath = path.join(root, "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json");
  if (!fs.existsSync(ar01R1ApplyPath)) return false;

  try {
    const ar01R1Apply = JSON.parse(fs.readFileSync(ar01R1ApplyPath, "utf8"));
    const articlePathMatches =
      articlePath === null ||
      articlePath === undefined ||
      ar01R1Apply.selected_article_path === articlePath;

    if (
      ar01R1Apply.status !== "credit_reference_surface_cleanup_applied" ||
      !articlePathMatches
    ) {
      return false;
    }

    const normalizedCandidates = new Set([
      originalCredit,
      originalCredit.replace("Visual: Drishvara editorial illustration.", "Visual: Drishvara editorial synthesis."),
      originalCredit.replace("Visual: Drishvara.", "Visual: Drishvara editorial synthesis."),
      originalCredit.replace("Chart: Drishvara. Source: article-text theme count.", "Chart: Drishvara editorial synthesis. Basis: deterministic article-text term count."),
      originalCredit.replace("Infographic: Drishvara. Source: article-derived conceptual synthesis.", "Infographic: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."),
      originalCredit.replace("Diagram: Drishvara. Source: article-derived conceptual synthesis.", "Diagram: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."),
      originalCredit.replace("Table: Drishvara. Source: article-derived conceptual synthesis.", "Table: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."),
      originalCredit.replace("Map: Drishvara. Source: article-derived conceptual synthesis.", "Map: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation."),
      originalCredit.replace("Composite: Drishvara. Source: article-derived conceptual synthesis.", "Composite: Drishvara editorial synthesis. Basis: article-derived conceptual interpretation.")
    ]);

    for (const candidate of normalizedCandidates) {
      if (candidate && html.includes(candidate)) return true;
    }

    return false;
  } catch {
    return false;
  }
}










function ag12cControlledLayoutRefinementAllowsPostMutation(selectedPath = null, currentHash = null) {
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json");
  const ag12cR1ApplyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json");
  const ar01R1ApplyRecordPath = path.join(root, "data/content-intelligence/apply-records/ar01-r1-credit-reference-surface-cleanup.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const ag12cR1ApplyRecord = fs.existsSync(ag12cR1ApplyRecordPath)
      ? JSON.parse(fs.readFileSync(ag12cR1ApplyRecordPath, "utf8"))
      : null;
    const ar01R1ApplyRecord = fs.existsSync(ar01R1ApplyRecordPath)
      ? JSON.parse(fs.readFileSync(ar01R1ApplyRecordPath, "utf8"))
      : null;

    const targetPath =
      selectedPath ||
      ar01R1ApplyRecord?.selected_article_path ||
      ag12cR1ApplyRecord?.selected_article_path ||
      applyRecord.selected_article_path;

    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;
    if (ag12cR1ApplyRecord && ag12cR1ApplyRecord.selected_article_path !== targetPath) return false;
    if (ar01R1ApplyRecord && ar01R1ApplyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    const ag12cOriginalState =
      applyRecord.status === "controlled_layout_refinement_applied_pending_post_refinement_audit" &&
      applyRecord.post_refinement_hash === hashToCheck &&
      html.includes("AG12C-LAYOUT-REFINEMENT:START") &&
      html.includes('data-drishvara-layout-treatment="collapsed-pilot-annex"');

    if (ag12cOriginalState) return true;

    const ag12cR1State =
      ag12cR1ApplyRecord &&
      ag12cR1ApplyRecord.status === "public_object_label_layout_repair_applied" &&
      ag12cR1ApplyRecord.pre_repair_hash === applyRecord.post_refinement_hash &&
      ag12cR1ApplyRecord.post_repair_hash === hashToCheck &&
      html.includes("AG12C-R1") &&
      html.includes('data-drishvara-layout-treatment="reader-facing-object"') &&
      !html.includes("Additional pilot object:") &&
      !html.includes('data-drishvara-layout-treatment="collapsed-pilot-annex"');

    if (ag12cR1State) return true;

    const ar01R1ChainedState =
      ag12cR1ApplyRecord &&
      ar01R1ApplyRecord &&
      ag12cR1ApplyRecord.status === "public_object_label_layout_repair_applied" &&
      ar01R1ApplyRecord.status === "credit_reference_surface_cleanup_applied" &&
      ag12cR1ApplyRecord.pre_repair_hash === applyRecord.post_refinement_hash &&
      ar01R1ApplyRecord.pre_repair_hash === ag12cR1ApplyRecord.post_repair_hash &&
      ar01R1ApplyRecord.post_repair_hash === hashToCheck &&
      html.includes("AG12C-R1") &&
      html.includes('data-drishvara-layout-treatment="reader-facing-object"') &&
      html.includes("Drishvara editorial synthesis") &&
      !html.includes("Additional pilot object:") &&
      !html.includes('data-drishvara-layout-treatment="collapsed-pilot-annex"') &&
      !html.includes("Final image-source attribution");

    if (ar01R1ChainedState) return true;

    return false;
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
      (creditTextAcceptedAfterAr01R1(applyRecord.visible_credit, html, typeof target !== "undefined" ? target : (typeof articlePath !== "undefined" ? articlePath : (typeof targetPath !== "undefined" ? targetPath : (typeof selectedPath !== "undefined" ? selectedPath : null)))) || creditTextSupersededByAr01R1(applyRecord.visible_credit, html, targetPath)) &&
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
      (creditTextAcceptedAfterAr01R1(applyRecord.visible_credit, html, typeof target !== "undefined" ? target : (typeof articlePath !== "undefined" ? articlePath : (typeof targetPath !== "undefined" ? targetPath : (typeof selectedPath !== "undefined" ? selectedPath : null)))) || creditTextSupersededByAr01R1(applyRecord.visible_credit, html, targetPath))
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
      (creditTextAcceptedAfterAr01R1(applyRecord.visible_credit, html, typeof target !== "undefined" ? target : (typeof articlePath !== "undefined" ? articlePath : (typeof targetPath !== "undefined" ? targetPath : (typeof selectedPath !== "undefined" ? selectedPath : null)))) || creditTextSupersededByAr01R1(applyRecord.visible_credit, html, targetPath)) &&
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
      (creditTextAcceptedAfterAr01R1(applyRecord.visible_credit, html, typeof target !== "undefined" ? target : (typeof articlePath !== "undefined" ? articlePath : (typeof targetPath !== "undefined" ? targetPath : (typeof selectedPath !== "undefined" ? selectedPath : null)))) || creditTextSupersededByAr01R1(applyRecord.visible_credit, html, targetPath))
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
      (creditTextAcceptedAfterAr01R1(applyRecord.visible_credit, html, typeof target !== "undefined" ? target : (typeof articlePath !== "undefined" ? articlePath : (typeof targetPath !== "undefined" ? targetPath : (typeof selectedPath !== "undefined" ? selectedPath : null)))) || creditTextSupersededByAr01R1(applyRecord.visible_credit, html, targetPath))
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
      (creditTextAcceptedAfterAr01R1(applyRecord.visible_credit, html, typeof target !== "undefined" ? target : (typeof articlePath !== "undefined" ? articlePath : (typeof targetPath !== "undefined" ? targetPath : (typeof selectedPath !== "undefined" ? selectedPath : null)))) || creditTextSupersededByAr01R1(applyRecord.visible_credit, html, targetPath))
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
      (creditTextAcceptedAfterAr01R1(applyRecord.visible_credit, html, typeof target !== "undefined" ? target : (typeof articlePath !== "undefined" ? articlePath : (typeof targetPath !== "undefined" ? targetPath : (typeof selectedPath !== "undefined" ? selectedPath : null)))) || creditTextSupersededByAr01R1(applyRecord.visible_credit, html, targetPath))
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

const ag08kaReview = readJson("data/content-intelligence/quality-reviews/ag08ka-visual-asset-creation-source-finalisation.json");
const ag08kaAsset = readJson("data/content-intelligence/visual-registry/ag08ka-finalised-visual-asset-record.json");
const ag08kaReadiness = readJson("data/content-intelligence/quality-registry/ag08ka-visual-asset-readiness.json");
const ag08gApply = readJson("data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag08k-controlled-visual-image-insertion-apply.json");
const apply = readJson("data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json");
const auditPrep = readJson("data/content-intelligence/quality-registry/ag08k-post-insertion-audit-prep.json");
const layout = readJson("data/content-intelligence/quality-registry/ag08k-layout-preservation-record.json");
const schema = readJson("data/content-intelligence/schema/controlled-visual-image-insertion-apply.schema.json");
const learning = readJson("data/content-intelligence/learning/ag08k-controlled-visual-image-insertion-apply-learning.json");
const registry = readJson("data/quality/ag08k-controlled-visual-image-insertion-apply.json");
const preview = readJson("data/quality/ag08k-controlled-visual-image-insertion-apply-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG08K_CONTROLLED_VISUAL_IMAGE_INSERTION_APPLY.md"), "utf8");

for (const obj of [review, apply, auditPrep, layout, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG08K") fail(`module_id must be AG08K in ${obj.title || "object"}`);
}

if (ag08kaReview.status !== "visual_asset_created_source_finalised_not_inserted") fail("AG08K-A review must be complete");
if (ag08kaReadiness.status !== "visual_asset_ready_pending_explicit_ag08k_insertion") fail("AG08K-A readiness must pass");

const target = apply.selected_article_path;
const backupPath = apply.backup_path;
const assetPath = apply.asset_path;

if (!fs.existsSync(path.join(root, target))) fail(`Target article missing: ${target}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`Backup missing: ${backupPath}`);
if (!fs.existsSync(path.join(root, assetPath))) fail(`Asset missing: ${assetPath}`);

const targetHtml = fs.readFileSync(path.join(root, target), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");
const assetSvg = fs.readFileSync(path.join(root, assetPath), "utf8");

const targetHash = sha256(targetHtml);
const backupHash = sha256(backupHtml);
const assetHash = sha256(assetSvg);

if (backupHash !== apply.backup_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Backup hash mismatch or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (backupHash !== apply.pre_insertion_hash) fail("Backup must match pre-insertion hash");
if (backupHash !== ag08gApply.post_apply_hash) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("AG08K backup must match AG08G post-apply article hash or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (targetHash !== apply.post_insertion_hash && !ag09cControlledPublicExperienceCorrectionAllowsPostMutation(apply.selected_article_path, targetHash)) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Target hash mismatch or AG09C controlled post-correction hash missing or AG10K controlled generated-image post-insertion hash missing or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (targetHash === backupHash) fail("Target must differ from AG08K backup");
if (assetHash !== apply.asset_hash_sha256) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Asset hash mismatch or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (assetHash !== ag08kaAsset.asset.asset_hash_sha256) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Asset hash must match AG08K-A record or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");

if (backupHtml.includes("AG08K-HERO-VISUAL-INSERTION")) fail("Backup must not contain AG08K marker");
if (countOccurrences(targetHtml, "AG08K-HERO-VISUAL-INSERTION") !== 1) fail("Target must contain exactly one AG08K marker");
if (countOccurrences(targetHtml, 'id="ag08k-hero-visual-block"') !== 1) fail("Target must contain exactly one AG08K hero block ID");
if (!targetHtml.includes(apply.asset_src_inserted)) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Target must include inserted asset src or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (!targetHtml.includes(apply.inserted_alt_text)) fail("Target must include inserted alt text");
if (!targetHtml.includes(apply.inserted_caption)) fail("Target must include inserted caption");
if (!creditTextSupersededByAr01R1(apply.inserted_credit, targetHtml, target)) fail("Target must include inserted credit");

if (countOccurrences(targetHtml, "AG08G-CONTROLLED-APPLY") !== 1) fail("AG08G marker must be preserved once");
if (countOccurrences(targetHtml, "AG08G-APPROVED-REFERENCES") !== 1) fail("AG08G approved references marker must be preserved once");
if (countOccurrences(targetHtml, "AG08G-LEGACY-GOVERNANCE-PRESERVED") !== 1) fail("AG08G legacy governance marker must be preserved once");

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

if (review.status !== "controlled_visual_image_inserted_pending_post_insertion_audit") fail("Review status mismatch");
if (apply.status !== "controlled_visual_image_inserted_pending_post_insertion_audit") fail("Apply status mismatch");
if (auditPrep.status !== "post_visual_insertion_audit_required") fail("Audit prep status mismatch");
if (schema.status !== "schema_controlled_visual_image_insertion_apply") fail("Schema status mismatch");
if (learning.status !== "learning_record_only") fail("Learning status mismatch");
if (registry.status !== "controlled_visual_image_inserted_pending_post_insertion_audit") fail("Registry status mismatch");
if (preview.status !== "controlled_visual_image_inserted_pending_post_insertion_audit") fail("Preview status mismatch");

if (layout.status !== "layout_preservation_recorded_pending_visual_audit") fail("Layout preservation status mismatch");
if (layout.article_shape_preservation.preserve_article_shape_required !== true) fail("Layout must require article shape preservation");
if (layout.article_shape_preservation.preserve_justified_text_required !== true) fail("Layout must require justified text preservation");
if (layout.article_shape_preservation.hero_image_centered_in_reading_column !== true) fail("Hero visual must be centered in reading column");
if (layout.article_shape_preservation.text_wrap_required !== false) fail("Hero visual must not require text wrap");
if (layout.article_shape_preservation.width_height_declared !== true) fail("Width/height must be declared");

if (schema.fresh_backup_creation_allowed_in_ag08k !== true) fail("Schema must allow fresh backup creation");
if (schema.selected_article_visual_insertion_allowed_in_ag08k !== true) fail("Schema must allow selected article visual insertion");
if (schema.approved_asset_reuse_allowed_in_ag08k !== true) fail("Schema must allow approved asset reuse");
if (schema.alt_caption_credit_insertion_allowed_in_ag08k !== true) fail("Schema must allow alt/caption/credit insertion");

if (schema.external_gpt_image_generation_allowed_in_ag08k !== false) fail("Schema must block external GPT image generation");
if (schema.external_image_api_call_allowed_in_ag08k !== false) fail("Schema must block external image API");
if (schema.new_visual_asset_creation_allowed_in_ag08k !== false) fail("Schema must block new visual asset creation");
if (schema.multi_article_mutation_allowed_in_ag08k !== false) fail("Schema must block multi-article mutation");
if (schema.homepage_mutation_allowed_in_ag08k !== false) fail("Schema must block homepage mutation");
if (schema.css_js_mutation_allowed_in_ag08k !== false) fail("Schema must block CSS/JS mutation");
if (schema.reference_insertion_allowed_in_ag08k !== false) fail("Schema must block reference insertion");
if (schema.reference_url_change_allowed_in_ag08k !== false) fail("Schema must block reference URL change");
if (schema.production_jsonl_append_allowed_in_ag08k !== false) fail("Schema must block JSONL append");
if (schema.database_write_allowed_in_ag08k !== false) fail("Schema must block database write");
if (schema.supabase_write_allowed_in_ag08k !== false) fail("Schema must block Supabase write");
if (schema.backend_auth_supabase_activation_allowed_in_ag08k !== false) fail("Schema must block backend/Auth/Supabase");
if (schema.publishing_allowed_in_ag08k !== false) fail("Schema must block publishing");

for (const obj of [review, apply, auditPrep, schema, learning, registry, preview]) {
  if (obj.controlled_visual_insertion_apply_stage !== true) fail(`${obj.title || "object"} must be controlled visual insertion stage`);
  if (obj.fresh_backup_created_before_apply !== true) fail(`${obj.title || "object"} must record fresh backup`);
  if (obj.exactly_one_visual_block_inserted !== true) fail(`${obj.title || "object"} must record exactly one visual block`);
  if (obj.approved_asset_reused_without_generation_in_ag08k !== true) fail(`${obj.title || "object"} must reuse approved asset`);
  if (obj.external_gpt_image_generation_performed_in_ag08k !== false) fail(`${obj.title || "object"} must not use external GPT image generation`);
  if (obj.external_image_api_call_performed_in_ag08k !== false) fail(`${obj.title || "object"} must not call image API`);
  if (obj.new_visual_asset_created_in_ag08k !== false) fail(`${obj.title || "object"} must not create new visual asset`);
  if (obj.css_mutation_performed_in_ag08k !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag08k !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.reference_insertion_performed_in_ag08k !== false) fail(`${obj.title || "object"} must not insert references`);
  if (obj.reference_url_change_performed_in_ag08k !== false) fail(`${obj.title || "object"} must not change reference URL`);
  if (obj.multi_article_mutation_performed_in_ag08k !== false) fail(`${obj.title || "object"} must not mutate multiple articles`);
  if (obj.homepage_mutation_performed_in_ag08k !== false) fail(`${obj.title || "object"} must not mutate homepage`);
  if (obj.production_jsonl_append_performed_in_ag08k !== false) fail(`${obj.title || "object"} must not append JSONL`);
  if (obj.database_write_performed_in_ag08k !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag08k !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag08k !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_performed_in_ag08k !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag08k_visual_inserted_pending_explicit_ag08l_audit") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag08l_only_with_explicit_user_approval !== true) fail("AG08L must require explicit approval");
if (review.closure_decision.production_readiness !== "visual_inserted_pending_post_insertion_audit") fail("Production readiness mismatch");
if (review.closure_decision.publish_readiness !== "static_file_changed_not_publish_approved") fail("Publish readiness mismatch");

for (const scriptName of ["generate:ag08k", "validate:ag08k"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag08k")) {
  fail("validate:project must include validate:ag08k");
}

for (const phrase of [
  "Purpose",
  "Target Article",
  "Inserted Visual",
  "Layout Protection",
  "Next Stage"
]) {
  if (!docText.includes(phrase)) fail(`AG08K document missing phrase: ${phrase}`);
}

pass("AG08K registry is present.");
pass("AG08K document is present.");
pass("AG08K review, apply record, audit prep, layout preservation, schema, learning record and preview are present.");
pass("AG08K-A finalised asset and readiness are consumed.");
pass("Fresh pre-visual-insertion backup exists and has no AG08K marker.");
pass("Exactly one selected article is mutated with one AG08K hero visual marker.");
pass("Approved SVG asset is inserted with alt text, caption and visible credit.");
pass("AG08G marker, AG08G reference marker and legacy governance evidence are preserved.");
pass("Layout preservation record confirms article-shape and justified-text requirements.");
pass("No external image generation, new visual asset creation, CSS/JS mutation or reference change is performed.");
pass("No production JSONL append, database/Supabase write, backend/Auth/Supabase activation or publishing is performed.");
pass("Production readiness is visual_inserted_pending_post_insertion_audit.");
pass("Publish readiness remains static_file_changed_not_publish_approved.");
pass("AG08L Post-Visual-Insertion Audit is identified as next only with explicit approval.");
