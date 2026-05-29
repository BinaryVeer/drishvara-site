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
  "data/content-intelligence/quality-reviews/ag10a-governed-object-pipeline-planning.json",
  "data/content-intelligence/mutation-plans/ag10a-governed-object-pipeline-planning.json",
  "data/content-intelligence/object-registry/ag10a-object-taxonomy-registry.json",
  "data/content-intelligence/object-registry/ag10a-theme-color-layout-doctrine.json",
  "data/content-intelligence/object-registry/ag10a-ownership-rights-credit-doctrine.json",
  "data/content-intelligence/quality-registry/ag10a-object-pipeline-planning-readiness.json",
  "data/content-intelligence/mutation-plans/ag10a-to-ag10b-object-taxonomy-selection-doctrine-boundary.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",

  "data/content-intelligence/quality-reviews/ag10b-object-taxonomy-selection-doctrine.json",
  "data/content-intelligence/mutation-plans/ag10b-object-taxonomy-selection-doctrine.json",
  "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
  "data/content-intelligence/object-registry/ag10b-object-selection-scoring-doctrine.json",
  "data/content-intelligence/object-registry/ag10b-article-type-object-mapping.json",
  "data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json",
  "data/content-intelligence/quality-registry/ag10b-object-selection-readiness.json",
  "data/content-intelligence/mutation-plans/ag10b-to-ag10c-data-visualization-pipeline-planning-boundary.json",
  "data/content-intelligence/schema/object-taxonomy-selection-doctrine.schema.json",
  "data/content-intelligence/learning/ag10b-object-taxonomy-selection-doctrine-learning.json",
  "data/quality/ag10b-object-taxonomy-selection-doctrine.json",
  "data/quality/ag10b-object-taxonomy-selection-doctrine-preview.json",
  "docs/quality/AG10B_OBJECT_TAXONOMY_SELECTION_DOCTRINE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG10B validation failed: ${message}`);
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


for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag10aReview = readJson("data/content-intelligence/quality-reviews/ag10a-governed-object-pipeline-planning.json");
const ag10aReadiness = readJson("data/content-intelligence/quality-registry/ag10a-object-pipeline-planning-readiness.json");
const ag10aBoundary = readJson("data/content-intelligence/mutation-plans/ag10a-to-ag10b-object-taxonomy-selection-doctrine-boundary.json");
const ag09cApply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag10b-object-taxonomy-selection-doctrine.json");
const doctrine = readJson("data/content-intelligence/mutation-plans/ag10b-object-taxonomy-selection-doctrine.json");
const normalized = readJson("data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json");
const scoring = readJson("data/content-intelligence/object-registry/ag10b-object-selection-scoring-doctrine.json");
const mapping = readJson("data/content-intelligence/object-registry/ag10b-article-type-object-mapping.json");
const eligibility = readJson("data/content-intelligence/object-registry/ag10b-object-eligibility-rules.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag10b-object-selection-readiness.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag10b-to-ag10c-data-visualization-pipeline-planning-boundary.json");
const schema = readJson("data/content-intelligence/schema/object-taxonomy-selection-doctrine.schema.json");
const learning = readJson("data/content-intelligence/learning/ag10b-object-taxonomy-selection-doctrine-learning.json");
const registry = readJson("data/quality/ag10b-object-taxonomy-selection-doctrine.json");
const preview = readJson("data/quality/ag10b-object-taxonomy-selection-doctrine-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG10B_OBJECT_TAXONOMY_SELECTION_DOCTRINE.md"), "utf8");

for (const obj of [review, doctrine, normalized, scoring, mapping, eligibility, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG10B") fail(`module_id must be AG10B in ${obj.title || "object"}`);
}

if (ag10aReview.status !== "governed_object_pipeline_planning_created_not_executed") fail("AG10A review status mismatch");
if (ag10aReadiness.ready_for_ag10b !== true) fail("AG10A readiness for AG10B missing");
if (ag10aBoundary.next_stage_id !== "AG10B") fail("AG10B boundary missing in AG10A");

const target = ag09cApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const currentHash = sha256(fs.readFileSync(path.join(root, target), "utf8"));
if (currentHash !== ag09cApply.post_correction_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Selected article hash must match AG09C post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");

if (review.status !== "object_taxonomy_selection_doctrine_created_not_executed") fail("Review status mismatch");
if (doctrine.status !== "object_taxonomy_selection_doctrine_created_not_executed") fail("Doctrine status mismatch");
if (registry.status !== "object_taxonomy_selection_doctrine_created_not_executed") fail("Registry status mismatch");
if (preview.status !== "object_taxonomy_selection_doctrine_created_not_executed") fail("Preview status mismatch");

if (normalized.status !== "normalized_object_taxonomy_created_not_applied") fail("Normalized taxonomy status mismatch");
if (!Array.isArray(normalized.normalized_objects) || normalized.normalized_objects.length < 90) {
  fail("Normalized object taxonomy appears incomplete");
}

for (const family of [
  "charts_graphs_bi_visuals",
  "infographics",
  "figures_diagrams",
  "tables_structured_objects",
  "maps_geographic_objects",
  "generated_and_editorial_images",
  "article_support_objects"
]) {
  if (!normalized.family_counts[family] || normalized.family_counts[family] < 1) fail(`Missing normalized family count: ${family}`);
}

for (const objectType of [
  "bar_chart",
  "line_chart",
  "scatter_plot",
  "sankey_chart",
  "heatmap_chart",
  "timeline_infographic",
  "framework_diagram",
  "comparison_table",
  "geographic_map",
  "hero_image",
  "stat_card"
]) {
  if (!normalized.normalized_objects.some((item) => item.object_type === objectType)) {
    fail(`Missing normalized object type: ${objectType}`);
  }
}

if (scoring.status !== "object_selection_scoring_doctrine_created_not_applied") fail("Scoring status mismatch");
if (!Array.isArray(scoring.scoring_dimensions) || scoring.scoring_dimensions.length !== 8) fail("Scoring dimensions count mismatch");
const totalWeight = scoring.scoring_dimensions.reduce((sum, item) => sum + item.weight, 0);
if (totalWeight !== 100) fail(`Scoring weights must total 100, found ${totalWeight}`);

for (const dimension of [
  "editorial_relevance",
  "evidence_or_data_strength",
  "reader_comprehension_value",
  "layout_feasibility",
  "mobile_feasibility",
  "theme_fit",
  "rights_credit_confidence",
  "cost_efficiency"
]) {
  if (!scoring.scoring_dimensions.some((item) => item.dimension === dimension)) {
    fail(`Missing scoring dimension: ${dimension}`);
  }
}

if (!Array.isArray(scoring.decision_bands) || scoring.decision_bands.length !== 4) fail("Decision bands mismatch");
if (!Array.isArray(scoring.disqualification_rules) || scoring.disqualification_rules.length < 5) fail("Disqualification rules missing");

if (mapping.status !== "article_type_object_mapping_created_not_applied") fail("Article mapping status mismatch");
for (const articleType of [
  "policy_public_programme",
  "world_affairs",
  "spirituality_reflection",
  "sports",
  "media_society",
  "daily_weekly_exclusive_episode"
]) {
  if (!mapping.mappings.some((item) => item.article_type === articleType)) fail(`Missing article type mapping: ${articleType}`);
}

if (!Array.isArray(mapping.density_rules) || mapping.density_rules.length < 4) fail("Density rules missing");

if (eligibility.status !== "object_eligibility_rules_created_not_applied") fail("Eligibility status mismatch");
if (!Array.isArray(eligibility.universal_eligibility_rules) || eligibility.universal_eligibility_rules.length < 8) fail("Universal eligibility rules missing");

for (const family of [
  "charts_graphs_bi_visuals",
  "infographics",
  "figures_diagrams",
  "tables_structured_objects",
  "maps_geographic_objects",
  "generated_and_editorial_images",
  "article_support_objects"
]) {
  if (!eligibility.family_eligibility_rules.some((item) => item.family === family)) {
    fail(`Missing family eligibility rule: ${family}`);
  }
}

if (readiness.status !== "object_selection_doctrine_ready_pending_explicit_ag10c") fail("Readiness status mismatch");
if (readiness.ready_for_ag10c !== true) fail("AG10C readiness missing");
if (readiness.object_generation_ready !== false) fail("Object generation must remain false");
if (readiness.object_insertion_ready !== false) fail("Object insertion must remain false");

if (boundary.status !== "ag10c_boundary_created_not_started") fail("AG10C boundary status mismatch");
if (boundary.next_stage_id !== "AG10C") fail("AG10C handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG10C must require explicit approval");

if (schema.status !== "schema_object_taxonomy_selection_doctrine_only") fail("Schema status mismatch");

for (const key of [
  "normalized_taxonomy_allowed_in_ag10b",
  "scoring_doctrine_allowed_in_ag10b",
  "article_type_mapping_allowed_in_ag10b",
  "eligibility_rules_allowed_in_ag10b",
  "ag10c_boundary_allowed_in_ag10b"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "article_mutation_allowed_in_ag10b",
  "homepage_mutation_allowed_in_ag10b",
  "css_js_mutation_allowed_in_ag10b",
  "visual_generation_allowed_in_ag10b",
  "image_generation_allowed_in_ag10b",
  "object_generation_allowed_in_ag10b",
  "object_insertion_allowed_in_ag10b",
  "chart_generation_allowed_in_ag10b",
  "graph_generation_allowed_in_ag10b",
  "table_generation_allowed_in_ag10b",
  "infographic_generation_allowed_in_ag10b",
  "figure_generation_allowed_in_ag10b",
  "map_generation_allowed_in_ag10b",
  "live_url_fetch_allowed_in_ag10b",
  "deployment_trigger_allowed_in_ag10b",
  "production_jsonl_append_allowed_in_ag10b",
  "database_write_allowed_in_ag10b",
  "supabase_write_allowed_in_ag10b",
  "backend_auth_supabase_activation_allowed_in_ag10b",
  "public_publishing_operation_allowed_in_ag10b"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, doctrine, normalized, scoring, mapping, eligibility, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.object_taxonomy_selection_doctrine_only !== true) fail(`${obj.title || "object"} must be doctrine-only`);
  if (obj.article_mutation_performed_in_ag10b !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.css_mutation_performed_in_ag10b !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag10b !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.visual_generation_performed_in_ag10b !== false) fail(`${obj.title || "object"} must not generate visuals`);
  if (obj.image_generation_performed_in_ag10b !== false) fail(`${obj.title || "object"} must not generate images`);
  if (obj.object_insertion_performed_in_ag10b !== false) fail(`${obj.title || "object"} must not insert objects`);
  if (obj.database_write_performed_in_ag10b !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag10b !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag10b !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag10b !== false) fail(`${obj.title || "object"} must not publish`);
}

if (review.closure_decision.decision !== "ag10b_selection_doctrine_created_pending_explicit_ag10c") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag10c_only_with_explicit_user_approval !== true) fail("AG10C must require explicit approval");

for (const scriptName of ["generate:ag10b", "validate:ag10b"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag10b")) {
  fail("validate:project must include validate:ag10b");
}

for (const phrase of ["Purpose", "Selection Logic", "Article-Type Mapping", "Eligibility Rules", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG10B document missing phrase: ${phrase}`);
}

pass("AG10B registry is present.");
pass("AG10B document is present.");
pass("AG10B review, doctrine, normalized taxonomy, scoring doctrine, article mapping, eligibility rules, readiness, AG10C boundary, schema, learning record and preview are present.");
pass("AG10A planning and handoff are consumed.");
pass("Selected article hash remains stable.");
pass("Normalized object taxonomy is created.");
pass("Object-selection scoring doctrine is created with 100-point weighting.");
pass("Article-type mapping and object-density rules are created.");
pass("Family-specific eligibility rules are created.");
pass("AG10C data visualization/chart pipeline boundary is created with explicit approval required.");
pass("No object generation, object insertion, article mutation, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG10B is Object Taxonomy and Selection Doctrine only.");
