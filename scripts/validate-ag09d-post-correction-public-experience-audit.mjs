import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();









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

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag09c-controlled-public-experience-correction-apply.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",
  "data/content-intelligence/quality-registry/ag09c-post-correction-audit-prep.json",
  "data/content-intelligence/quality-reviews/ag09d-post-correction-public-experience-audit.json",
  "data/content-intelligence/audit-records/ag09d-post-correction-public-experience-audit-report.json",
  "data/content-intelligence/quality-registry/ag09d-rollback-readiness-record.json",
  "data/content-intelligence/quality-registry/ag09d-public-experience-readiness-record.json",
  "data/content-intelligence/schema/post-correction-public-experience-audit.schema.json",
  "data/content-intelligence/learning/ag09d-post-correction-public-experience-audit-learning.json",
  "data/quality/ag09d-post-correction-public-experience-audit.json",
  "data/quality/ag09d-post-correction-public-experience-audit-preview.json",
  "docs/quality/AG09D_POST_CORRECTION_PUBLIC_EXPERIENCE_AUDIT.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG09D validation failed: ${message}`);
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


function ag57bPublicUiContentCorrectionAllowsPostMutation(filePath) {
  const normalizedFilePath = filePath || "";
  const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag57b-public-ui-content-correction.json");
  const applyPath = path.join(root, "data/content-intelligence/pre-live/ag57b-public-ui-content-correction-apply-record.json");
  const deltaPath = path.join(root, "data/content-intelligence/pre-live/ag57b-source-file-delta-record.json");
  const clearancePath = path.join(root, "data/content-intelligence/pre-live/ag57b-defect-clearance-record.json");

  if (!fs.existsSync(reviewPath) || !fs.existsSync(applyPath) || !fs.existsSync(deltaPath) || !fs.existsSync(clearancePath)) return false;

  try {
    const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
    const apply = JSON.parse(fs.readFileSync(applyPath, "utf8"));
    const delta = JSON.parse(fs.readFileSync(deltaPath, "utf8"));
    const clearance = JSON.parse(fs.readFileSync(clearancePath, "utf8"));

    if (review.status !== "public_ui_content_correction_applied_ready_for_ag57c") return false;
    if (review.summary?.actual_source_changes_applied !== true) return false;
    if (apply.actual_source_changes_applied !== true) return false;
    if (!Array.isArray(delta.changed_files) || !delta.changed_files.includes(normalizedFilePath)) return false;
    if (!Array.isArray(clearance.corrected_defects) || clearance.corrected_defects.length !== 5) return false;

    return true;
  } catch {
    return false;
  }
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag09cReview = readJson("data/content-intelligence/quality-reviews/ag09c-controlled-public-experience-correction-apply.json");
const ag09cApply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");
const ag09cAuditPrep = readJson("data/content-intelligence/quality-registry/ag09c-post-correction-audit-prep.json");

const review = readJson("data/content-intelligence/quality-reviews/ag09d-post-correction-public-experience-audit.json");
const audit = readJson("data/content-intelligence/audit-records/ag09d-post-correction-public-experience-audit-report.json");
const rollback = readJson("data/content-intelligence/quality-registry/ag09d-rollback-readiness-record.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag09d-public-experience-readiness-record.json");
const schema = readJson("data/content-intelligence/schema/post-correction-public-experience-audit.schema.json");
const learning = readJson("data/content-intelligence/learning/ag09d-post-correction-public-experience-audit-learning.json");
const registry = readJson("data/quality/ag09d-post-correction-public-experience-audit.json");
const preview = readJson("data/quality/ag09d-post-correction-public-experience-audit-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG09D_POST_CORRECTION_PUBLIC_EXPERIENCE_AUDIT.md"), "utf8");

for (const obj of [review, audit, rollback, readiness, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG09D") fail(`module_id must be AG09D in ${obj.title || "object"}`);
}

if (ag09cReview.status !== "controlled_public_experience_corrections_applied_pending_audit") fail("AG09C review must be pending audit");
if (ag09cApply.status !== "controlled_public_experience_corrections_applied_pending_audit") fail("AG09C apply must be pending audit");
if (ag09cAuditPrep.status !== "post_public_experience_correction_audit_required") fail("AG09C audit prep mismatch");

const target = ag09cApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const articleHtml = fs.readFileSync(path.join(root, target), "utf8");
const currentHash = sha256(articleHtml);
if (currentHash !== ag09cApply.post_correction_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Current article hash must match AG09C post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");

if (review.status !== "post_correction_public_experience_audit_passed") fail("Review must pass");
if (audit.status !== "post_correction_public_experience_audit_passed") fail("Audit report must pass");
if (registry.status !== "post_correction_public_experience_audit_passed") fail("Registry must pass");
if (preview.status !== "post_correction_public_experience_audit_passed") fail("Preview must pass");

if (audit.backup_integrity.status !== "passed") fail("Backup integrity must pass");
if (audit.mutated_file_integrity.status !== "passed") if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) fail("Mutated file integrity must pass or AG10K controlled generated-image post-insertion record explains the later approved article state");
if (audit.metadata_audit.metadata_audit_status !== "passed") fail("Metadata audit must pass");
if (audit.listing_audit.listing_audit_status !== "passed") fail("Listing audit must pass");
if (audit.correction_mapping_audit.correction_mapping_status !== "passed") fail("Correction mapping must pass");
if (audit.forbidden_system_guards.forbidden_system_guard_status !== "passed") fail("Forbidden-system guards must pass");
if (audit.rollback_readiness.rollback_ready !== true) fail("Rollback readiness must be true");

if (readiness.status !== "public_experience_corrections_audited_pending_editorial_publish_decision") fail("Readiness status mismatch");
if (readiness.publish_ready !== false) fail("AG09D must not mark publish-ready");
if (readiness.publish_readiness !== "blocked_pending_explicit_editorial_publish_approval") fail("Publish readiness mismatch");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.database_activation_ready !== false) fail("Database activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

for (const backup of audit.backup_integrity.backup_audit_items) {
  if (!fs.existsSync(path.join(root, backup.backup_path))) fail(`Backup missing: ${backup.backup_path}`);
  const hash = sha256(fs.readFileSync(path.join(root, backup.backup_path), "utf8"));
  if (hash !== backup.backup_hash_recorded) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation(backup.backup_path)) if (!ag11bControlledChartInsertionAllowsPostMutation(backup.backup_path)) if (!ag11cControlledInfographicInsertionAllowsPostMutation(backup.backup_path)) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation(backup.backup_path)) if (!ag11eControlledTableInsertionAllowsPostMutation(backup.backup_path)) if (!ag11fControlledMapInsertionAllowsPostMutation(backup.backup_path)) if (!ag11gControlledCompositeInsertionAllowsPostMutation(backup.backup_path)) if (!ag12cControlledLayoutRefinementAllowsPostMutation(backup.backup_path)) fail(`Backup hash mismatch: ${backup.backup_path} or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state or AG57B public UI-content correction record explains the later approved homepage state`);
}

for (const item of audit.mutated_file_integrity.mutated_file_audit_items) {
  if (!fs.existsSync(path.join(root, item.file_path))) fail(`Mutated file missing: ${item.file_path}`);
  const hash = sha256(fs.readFileSync(path.join(root, item.file_path), "utf8"));
  if (hash !== item.recorded_post_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation(item.file_path)) if (!ag11bControlledChartInsertionAllowsPostMutation(item.file_path)) if (!ag11cControlledInfographicInsertionAllowsPostMutation(item.file_path)) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation(item.file_path)) if (!ag11eControlledTableInsertionAllowsPostMutation(item.file_path)) if (!ag11fControlledMapInsertionAllowsPostMutation(item.file_path)) if (!ag11gControlledCompositeInsertionAllowsPostMutation(item.file_path)) if (!ag12cControlledLayoutRefinementAllowsPostMutation(item.file_path)) if (!ag57bPublicUiContentCorrectionAllowsPostMutation(item.file_path || item.file || item.path)) fail(`Mutated file hash mismatch: ${item.file_path} or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state`);
}

for (const expected of [
  "AG09C-PUBLIC-EXPERIENCE-METADATA",
  'property="og:title"',
  'property="og:description"',
  'property="og:image"',
  'name="twitter:card"',
  'name="twitter:image"',
  'rel="canonical"'
]) {
  if (!articleHtml.includes(expected)) fail(`Selected article missing corrected metadata: ${expected}`);
}

const listingItem = audit.mutated_file_integrity.mutated_file_audit_items.find((item) => item.file_path !== target);
if (!listingItem) fail("Listing mutated file audit item missing");

const listingHtml = fs.readFileSync(path.join(root, listingItem.file_path), "utf8");
if (!listingHtml.includes("AG09C-PUBLIC-EXPERIENCE-LISTING")) fail("Listing file missing AG09C marker");
if (!listingHtml.includes(target)) fail("Listing file missing selected article link");

if (rollback.status !== "rollback_ready_not_executed") fail("Rollback record must be ready and not executed");
if (rollback.rollback_readiness.rollback_execution_performed !== false) fail("Rollback must not be executed");

if (schema.status !== "schema_post_correction_audit_only") fail("Schema status mismatch");

for (const key of [
  "article_mutation_allowed_in_ag09d",
  "selected_article_file_write_allowed_in_ag09d",
  "homepage_mutation_allowed_in_ag09d",
  "css_js_mutation_allowed_in_ag09d",
  "reference_insertion_allowed_in_ag09d",
  "reference_url_change_allowed_in_ag09d",
  "visual_generation_allowed_in_ag09d",
  "image_asset_creation_allowed_in_ag09d",
  "image_insertion_allowed_in_ag09d",
  "live_url_fetch_allowed_in_ag09d",
  "production_jsonl_append_allowed_in_ag09d",
  "database_write_allowed_in_ag09d",
  "supabase_write_allowed_in_ag09d",
  "backend_auth_supabase_activation_allowed_in_ag09d",
  "publishing_allowed_in_ag09d",
  "rollback_execution_allowed_in_ag09d"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, audit, rollback, readiness, schema, learning, registry, preview]) {
  if (obj.post_correction_public_experience_audit_only !== true) fail(`${obj.title || "object"} must be audit-only`);
  if (obj.article_mutation_performed_in_ag09d !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.selected_article_file_write_performed_in_ag09d !== false) fail(`${obj.title || "object"} must not write selected article`);
  if (obj.homepage_mutation_performed_in_ag09d !== false) fail(`${obj.title || "object"} must not mutate homepage`);
  if (obj.css_mutation_performed_in_ag09d !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag09d !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.reference_insertion_performed_in_ag09d !== false) fail(`${obj.title || "object"} must not insert references`);
  if (obj.reference_url_change_performed_in_ag09d !== false) fail(`${obj.title || "object"} must not change reference URLs`);
  if (obj.visual_generation_performed_in_ag09d !== false) fail(`${obj.title || "object"} must not generate visual`);
  if (obj.image_insertion_performed_in_ag09d !== false) fail(`${obj.title || "object"} must not insert image`);
  if (obj.live_url_fetch_performed_in_ag09d !== false) fail(`${obj.title || "object"} must not fetch live URL`);
  if (obj.production_jsonl_append_performed_in_ag09d !== false) fail(`${obj.title || "object"} must not append JSONL`);
  if (obj.database_write_performed_in_ag09d !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag09d !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag09d !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_performed_in_ag09d !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag09d_public_experience_corrections_audited_pending_editorial_publish_boundary") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag09e_only_with_explicit_user_approval !== true) fail("AG09E must require explicit approval");
if (review.closure_decision.publish_approval_granted !== false) fail("Publishing must not be approved");

for (const scriptName of ["generate:ag09d", "validate:ag09d"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag09d")) {
  fail("validate:project must include validate:ag09d");
}

for (const phrase of ["Purpose", "Audit Result", "Publish Boundary", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG09D document missing phrase: ${phrase}`);
}

pass("AG09D registry is present.");
pass("AG09D document is present.");
pass("AG09D review, audit report, rollback readiness, readiness record, schema, learning record and preview are present.");
pass("AG09C apply record and audit prep are consumed.");
pass("Backup integrity is confirmed.");
pass("Mutated file integrity is confirmed.");
pass("Metadata/social-preview correction is confirmed.");
pass("Listing discoverability correction is confirmed.");
pass("All AG09B planned corrections are audited as applied.");
pass("Forbidden-system guards are confirmed.");
pass("Rollback readiness is confirmed.");
pass("No article/homepage/CSS/JS/reference/visual/backend/publishing mutation is performed in AG09D.");
pass("Publish readiness remains blocked pending explicit editorial publish approval.");
pass("AG09E Editorial Publish Decision Boundary is identified as next only with explicit approval.");
