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
  "data/content-intelligence/quality-reviews/ag09e-editorial-publish-decision-boundary.json",
  "data/content-intelligence/approval-registry/ag09e-editorial-publish-decision-record.json",
  "data/content-intelligence/quality-registry/ag09e-editorial-publish-readiness-boundary.json",
  "data/content-intelligence/mutation-plans/ag09e-to-ag09f-controlled-publish-preparation-boundary.json",
  "data/content-intelligence/audit-records/ag09d-post-correction-public-experience-audit-report.json",
  "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",
  "data/content-intelligence/quality-reviews/ag09f-controlled-publish-preparation-live-verification-plan.json",
  "data/content-intelligence/mutation-plans/ag09f-controlled-publish-preparation-live-verification-plan.json",
  "data/content-intelligence/quality-registry/ag09f-live-verification-readiness.json",
  "data/content-intelligence/mutation-plans/ag09f-to-ag09g-controlled-live-verification-boundary.json",
  "data/content-intelligence/schema/controlled-publish-preparation-live-verification-plan.schema.json",
  "data/content-intelligence/learning/ag09f-controlled-publish-preparation-live-verification-plan-learning.json",
  "data/quality/ag09f-controlled-publish-preparation-live-verification-plan.json",
  "data/quality/ag09f-controlled-publish-preparation-live-verification-plan-preview.json",
  "docs/quality/AG09F_CONTROLLED_PUBLISH_PREPARATION_LIVE_VERIFICATION_PLAN.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG09F validation failed: ${message}`);
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

const ag09eReview = readJson("data/content-intelligence/quality-reviews/ag09e-editorial-publish-decision-boundary.json");
const ag09eDecision = readJson("data/content-intelligence/approval-registry/ag09e-editorial-publish-decision-record.json");
const ag09eReadiness = readJson("data/content-intelligence/quality-registry/ag09e-editorial-publish-readiness-boundary.json");
const ag09eBoundary = readJson("data/content-intelligence/mutation-plans/ag09e-to-ag09f-controlled-publish-preparation-boundary.json");
const ag09dAudit = readJson("data/content-intelligence/audit-records/ag09d-post-correction-public-experience-audit-report.json");
const ag09cApply = readJson("data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");

const review = readJson("data/content-intelligence/quality-reviews/ag09f-controlled-publish-preparation-live-verification-plan.json");
const plan = readJson("data/content-intelligence/mutation-plans/ag09f-controlled-publish-preparation-live-verification-plan.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag09f-live-verification-readiness.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag09f-to-ag09g-controlled-live-verification-boundary.json");
const schema = readJson("data/content-intelligence/schema/controlled-publish-preparation-live-verification-plan.schema.json");
const learning = readJson("data/content-intelligence/learning/ag09f-controlled-publish-preparation-live-verification-plan-learning.json");
const registry = readJson("data/quality/ag09f-controlled-publish-preparation-live-verification-plan.json");
const preview = readJson("data/quality/ag09f-controlled-publish-preparation-live-verification-plan-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG09F_CONTROLLED_PUBLISH_PREPARATION_LIVE_VERIFICATION_PLAN.md"), "utf8");

for (const obj of [review, plan, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.module_id !== "AG09F") fail(`module_id must be AG09F in ${obj.title || "object"}`);
}

if (ag09eReview.status !== "editorial_publish_decision_boundary_created_not_approved") fail("AG09E review status mismatch");
if (ag09eDecision.editorial_publish_candidate !== true) fail("AG09E must mark article as editorial publish candidate");
if (ag09eDecision.editorial_publish_approved !== false) fail("AG09E must not approve publishing");
if (ag09eReadiness.status !== "eligible_for_editorial_publish_consideration_not_approved") fail("AG09E readiness mismatch");
if (ag09eBoundary.next_stage_id !== "AG09F") fail("AG09F boundary missing in AG09E");
if (ag09dAudit.status !== "post_correction_public_experience_audit_passed") fail("AG09D audit must pass");

const target = ag09cApply.selected_article_path;
if (!fs.existsSync(path.join(root, target))) fail(`Selected article missing: ${target}`);

const html = fs.readFileSync(path.join(root, target), "utf8");
const currentHash = sha256(html);
if (currentHash !== ag09cApply.post_correction_hash) if (!ag10kControlledGeneratedImageInsertionAllowsPostMutation()) if (!ag11bControlledChartInsertionAllowsPostMutation()) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Selected article hash must match AG09C post-correction hash or AG10K controlled generated-image post-insertion record explains the later approved article state or AG11B controlled chart post-insertion record explains the later approved article state or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");

if (review.status !== "publish_preparation_live_verification_plan_created_not_executed") fail("Review status mismatch");
if (plan.status !== "publish_preparation_live_verification_plan_created_not_executed") fail("Plan status mismatch");
if (registry.status !== "publish_preparation_live_verification_plan_created_not_executed") fail("Registry status mismatch");
if (preview.status !== "publish_preparation_live_verification_plan_created_not_executed") fail("Preview status mismatch");

if (readiness.status !== "live_verification_plan_ready_pending_explicit_ag09g") fail("Readiness status mismatch");
if (readiness.preparation_ready !== true) fail("Preparation must be ready");
if (readiness.publish_ready !== false) fail("AG09F must not mark publish-ready");
if (readiness.publish_approval_granted !== false) fail("AG09F must not grant publish approval");
if (readiness.publish_readiness !== "blocked_pending_live_verification_and_explicit_editorial_approval") fail("Publish readiness mismatch");
if (readiness.live_url_fetch_performed !== false) fail("AG09F must not fetch live URL");
if (readiness.backend_activation_ready !== false) fail("Backend activation must remain blocked");
if (readiness.database_activation_ready !== false) fail("Database activation must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase activation must remain blocked");

if (!Array.isArray(plan.preparation_checks) || plan.preparation_checks.length < 5) fail("Preparation checks missing");
for (const check of plan.preparation_checks) {
  if (check.status !== "planned_ready") fail(`Preparation check not ready: ${check.check_id}`);
}

if (!Array.isArray(plan.live_verification_checklist) || plan.live_verification_checklist.length < 7) {
  fail("Live verification checklist must contain at least 7 planned checks");
}

for (const item of plan.live_verification_checklist) {
  if (item.execution_status !== "planned_not_executed") fail(`Live verification item must remain planned_not_executed: ${item.item_id}`);
}

if (boundary.status !== "future_live_verification_boundary_created_not_executed") fail("AG09G boundary status mismatch");
if (boundary.next_stage_id !== "AG09G") fail("AG09G handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG09G must require explicit approval");

if (schema.status !== "schema_publish_preparation_plan_only") fail("Schema status mismatch");
if (schema.publish_preparation_plan_allowed_in_ag09f !== true) fail("Schema must allow publish preparation plan");
if (schema.live_verification_checklist_allowed_in_ag09f !== true) fail("Schema must allow live verification checklist");
if (schema.ag09g_boundary_allowed_in_ag09f !== true) fail("Schema must allow AG09G boundary");

for (const key of [
  "article_mutation_allowed_in_ag09f",
  "homepage_mutation_allowed_in_ag09f",
  "css_js_mutation_allowed_in_ag09f",
  "reference_insertion_allowed_in_ag09f",
  "reference_url_change_allowed_in_ag09f",
  "visual_generation_allowed_in_ag09f",
  "image_asset_creation_allowed_in_ag09f",
  "image_insertion_allowed_in_ag09f",
  "live_url_fetch_allowed_in_ag09f",
  "deployment_trigger_allowed_in_ag09f",
  "production_jsonl_append_allowed_in_ag09f",
  "database_write_allowed_in_ag09f",
  "supabase_write_allowed_in_ag09f",
  "backend_auth_supabase_activation_allowed_in_ag09f",
  "publishing_allowed_in_ag09f",
  "publishing_approval_allowed_in_ag09f",
  "rollback_execution_allowed_in_ag09f"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [review, plan, readiness, boundary, schema, learning, registry, preview]) {
  if (obj.publish_preparation_plan_only !== true) fail(`${obj.title || "object"} must be publish-preparation-plan-only`);
  if (obj.article_mutation_performed_in_ag09f !== false) fail(`${obj.title || "object"} must not mutate article`);
  if (obj.homepage_mutation_performed_in_ag09f !== false) fail(`${obj.title || "object"} must not mutate homepage`);
  if (obj.css_mutation_performed_in_ag09f !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_mutation_performed_in_ag09f !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.reference_insertion_performed_in_ag09f !== false) fail(`${obj.title || "object"} must not insert references`);
  if (obj.reference_url_change_performed_in_ag09f !== false) fail(`${obj.title || "object"} must not change reference URLs`);
  if (obj.visual_generation_performed_in_ag09f !== false) fail(`${obj.title || "object"} must not generate visuals`);
  if (obj.image_insertion_performed_in_ag09f !== false) fail(`${obj.title || "object"} must not insert images`);
  if (obj.live_url_fetch_performed_in_ag09f !== false) fail(`${obj.title || "object"} must not fetch live URL`);
  if (obj.deployment_trigger_performed_in_ag09f !== false) fail(`${obj.title || "object"} must not trigger deployment`);
  if (obj.database_write_performed_in_ag09f !== false) fail(`${obj.title || "object"} must not write database`);
  if (obj.supabase_write_performed_in_ag09f !== false) fail(`${obj.title || "object"} must not write Supabase`);
  if (obj.backend_auth_supabase_activation_performed_in_ag09f !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_performed_in_ag09f !== false) fail(`${obj.title || "object"} must not publish`);
  if (obj.publishing_approval_granted_in_ag09f !== false) fail(`${obj.title || "object"} must not approve publishing`);
}

if (review.closure_decision.decision !== "ag09f_publish_preparation_plan_created_pending_explicit_live_verification") fail("Closure decision mismatch");
if (review.closure_decision.proceed_to_ag09g_only_with_explicit_user_approval !== true) fail("AG09G must require explicit approval");
if (review.closure_decision.publish_approval_granted !== false) fail("Publish approval must not be granted");
if (review.closure_decision.public_publishing_performed !== false) fail("Public publishing must not be performed");

for (const scriptName of ["generate:ag09f", "validate:ag09f"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag09f")) {
  fail("validate:project must include validate:ag09f");
}

for (const phrase of ["Purpose", "Target", "Verification Checklist", "Publish Boundary", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG09F document missing phrase: ${phrase}`);
}

pass("AG09F registry is present.");
pass("AG09F document is present.");
pass("AG09F review, plan, readiness, AG09G boundary, schema, learning record and preview are present.");
pass("AG09E decision boundary and AG09D audit are consumed.");
pass("Selected article hash matches AG09C post-correction hash.");
pass("Live verification checklist is prepared but not executed.");
pass("Publish approval remains blocked.");
pass("Backend/database/Supabase activation remains blocked.");
pass("AG09G controlled live verification boundary is created with explicit approval required.");
pass("No mutation, live fetch, deployment trigger, backend activation, rollback execution or publishing is performed.");
pass("AG09F is Controlled Publish Preparation and Live Verification Plan only.");
