import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();






function ag11gControlledCompositeInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
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

const requiredFiles = [
  "data/content-intelligence/quality-reviews/ag11a-remaining-object-family-cycle-plan.json",
  "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json",
  "data/content-intelligence/object-registry/ag11a-remaining-object-family-compact-cycle-plan.json",
  "data/content-intelligence/quality-registry/ag11a-remaining-object-family-cycle-readiness.json",
  "data/content-intelligence/mutation-plans/ag11a-to-ag11b-chart-bi-graph-controlled-cycle-boundary.json",
  "data/content-intelligence/object-registry/ag10c-chart-family-data-schema-registry.json",
  "data/content-intelligence/object-registry/ag10c-chart-theme-credit-mobile-doctrine.json",
  "data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json",

  "assets/articles/policy/enhancing-public-healthcare-delivery-digital-innovation/ag11b-chart-theme-emphasis.svg",
  "data/content-intelligence/backups/ag11b-pre-chart-bi-graph-insertion-enhancing-public-healthcare-delivery-digital-innovation.html",
  "data/content-intelligence/data-registry/ag11b-chart-bi-graph-source-data-record.json",
  "data/content-intelligence/object-registry/ag11b-chart-bi-graph-asset-record.json",
  "data/content-intelligence/quality-registry/ag11b-chart-placement-tuning-record.json",
  "data/content-intelligence/apply-records/ag11b-chart-bi-graph-controlled-cycle-apply.json",
  "data/content-intelligence/audit-records/ag11b-chart-bi-graph-post-insertion-audit-report.json",
  "data/content-intelligence/closure-records/ag11b-chart-bi-graph-controlled-cycle-closure.json",
  "data/content-intelligence/quality-registry/ag11b-chart-bi-graph-final-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag11b-to-ag11c-infographic-controlled-cycle-boundary.json",
  "data/content-intelligence/schema/chart-bi-graph-controlled-cycle.schema.json",
  "data/content-intelligence/quality-reviews/ag11b-chart-bi-graph-controlled-cycle.json",
  "data/content-intelligence/learning/ag11b-chart-bi-graph-controlled-cycle-learning.json",
  "data/quality/ag11b-chart-bi-graph-controlled-cycle.json",
  "data/quality/ag11b-chart-bi-graph-controlled-cycle-preview.json",
  "docs/quality/AG11B_CHART_BI_GRAPH_CONTROLLED_CYCLE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG11B validation failed: ${message}`);
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

function markerCount(text, marker) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (text.match(new RegExp(escaped, "g")) || []).length;
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);
}

const ag11aReview = readJson("data/content-intelligence/quality-reviews/ag11a-remaining-object-family-cycle-plan.json");
const ag11aReadiness = readJson("data/content-intelligence/quality-registry/ag11a-remaining-object-family-cycle-readiness.json");
const ag11aBoundary = readJson("data/content-intelligence/mutation-plans/ag11a-to-ag11b-chart-bi-graph-controlled-cycle-boundary.json");
const ag10kApply = readJson("data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json");

const sourceData = readJson("data/content-intelligence/data-registry/ag11b-chart-bi-graph-source-data-record.json");
const asset = readJson("data/content-intelligence/object-registry/ag11b-chart-bi-graph-asset-record.json");
const placement = readJson("data/content-intelligence/quality-registry/ag11b-chart-placement-tuning-record.json");
const apply = readJson("data/content-intelligence/apply-records/ag11b-chart-bi-graph-controlled-cycle-apply.json");
const audit = readJson("data/content-intelligence/audit-records/ag11b-chart-bi-graph-post-insertion-audit-report.json");
const closure = readJson("data/content-intelligence/closure-records/ag11b-chart-bi-graph-controlled-cycle-closure.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag11b-chart-bi-graph-final-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag11b-to-ag11c-infographic-controlled-cycle-boundary.json");
const schema = readJson("data/content-intelligence/schema/chart-bi-graph-controlled-cycle.schema.json");
const review = readJson("data/content-intelligence/quality-reviews/ag11b-chart-bi-graph-controlled-cycle.json");
const learning = readJson("data/content-intelligence/learning/ag11b-chart-bi-graph-controlled-cycle-learning.json");
const registry = readJson("data/quality/ag11b-chart-bi-graph-controlled-cycle.json");
const preview = readJson("data/quality/ag11b-chart-bi-graph-controlled-cycle-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG11B_CHART_BI_GRAPH_CONTROLLED_CYCLE.md"), "utf8");

for (const obj of [sourceData, asset, placement, apply, audit, closure, readiness, boundary, schema, review, learning, registry, preview]) {
  if (obj.module_id !== "AG11B") fail(`module_id must be AG11B in ${obj.title || "object"}`);
}

if (ag11aReview.status !== "remaining_object_family_compact_cycles_planned_not_started") fail("AG11A review status mismatch");
if (ag11aReadiness.ready_for_ag11b !== true) fail("AG11A readiness for AG11B missing");
if (ag11aBoundary.next_stage_id !== "AG11B") fail("AG11B boundary missing in AG11A");

const articlePath = apply.selected_article_path;
const assetPath = apply.asset_path;
const backupPath = apply.backup_path;

if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
if (!fs.existsSync(path.join(root, assetPath))) fail(`Chart asset missing: ${assetPath}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`Backup missing: ${backupPath}`);

const articleHtml = fs.readFileSync(path.join(root, articlePath), "utf8");
const assetText = fs.readFileSync(path.join(root, assetPath), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");

const articleHash = sha256(articleHtml);
const assetHash = sha256(assetText);
const backupHash = sha256(backupHtml);

if (articleHash !== apply.post_insertion_hash) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) fail("Current article hash must match AG11B post-insertion hash or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state");
if (assetHash !== apply.asset_hash_sha256) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) fail("Current chart asset hash must match apply record or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state");
if (backupHash !== apply.pre_insertion_hash) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) fail("Backup hash must match AG11B pre-insertion hash or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state");
if (apply.pre_insertion_hash !== ag10kApply.post_insertion_hash) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) fail("AG11B must start from AG10K post-insertion hash or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state");

if (markerCount(articleHtml, apply.insertion_marker_start) !== 1) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) fail("AG11B start marker count must be one or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state");
if (markerCount(articleHtml, apply.insertion_marker_end) !== 1) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) fail("AG11B end marker count must be one or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state");
if (backupHtml.includes(apply.insertion_marker_start)) fail("AG11B backup must not include AG11B marker");

if (!articleHtml.includes(apply.asset_src_in_article)) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) fail("Article must include chart asset src or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state");
if (!articleHtml.includes(apply.chart_title)) fail("Article must include chart title");
if (!articleHtml.includes(apply.caption)) fail("Article must include chart caption");
if (!articleHtml.includes(apply.visible_credit)) fail("Article must include visible credit");

if (sourceData.status !== "source_data_finalised_article_text_deterministic_counts") fail("Source data status mismatch");
if (sourceData.no_invented_data !== true) fail("Source data must record no invented data");
if (sourceData.external_data_used !== false) fail("External data must be false");
if (!Array.isArray(sourceData.data_rows) || sourceData.data_rows.length !== 4) fail("Chart must have four data rows");
if (sourceData.data_rows.every((row) => row.count === 0)) fail("Chart data cannot be all zero");

if (asset.status !== "controlled_chart_asset_created") fail("Asset record status mismatch");
if (asset.asset_hash_sha256 !== assetHash) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) fail("Asset record hash mismatch or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state");
if (asset.asset_type !== "internal_svg_bar_chart") fail("Chart asset type mismatch");
if (!assetText.includes("Theme emphasis in this article")) fail("SVG must include chart title");
if (!assetText.includes("Digital access")) fail("SVG must include labels");
if (!assetText.includes("Source: deterministic article-text count")) fail("SVG must include source note");

if (placement.status !== "chart_placement_tuned") fail("Placement tuning status mismatch");
if (placement.placement_decision.alignment !== "center") fail("Chart alignment must be center");
if (placement.placement_decision.max_width !== "940px") fail("Chart max width must be 940px");
if (placement.placement_decision.title_present !== true) fail("Title must be present");
if (placement.placement_decision.labels_present !== true) fail("Labels must be present");
if (placement.placement_decision.caption_present !== true) fail("Caption must be present");
if (placement.placement_decision.credit_present !== true) fail("Credit must be present");

if (audit.status !== "chart_bi_graph_post_insertion_audit_passed") fail("Audit status mismatch");
if (!Array.isArray(audit.checks) || audit.checks.length !== 6) fail("Audit must have six checks");
if (audit.failed_checks.length !== 0) fail("Audit failed checks must be zero");

if (closure.status !== "chart_bi_graph_controlled_cycle_closed_reuse_handoff_recorded") fail("Closure status mismatch");
if (closure.ready_for_ag11c !== true) fail("Closure must be ready for AG11C");
if (!closure.reusable_intelligence?.placement_logic) fail("Closure must preserve placement logic");
if (!closure.reusable_intelligence?.title_label_pattern) fail("Closure must preserve title/label pattern");

if (readiness.status !== "chart_bi_graph_cycle_closed_ready_for_ag11c") fail("Readiness status mismatch");
if (readiness.chart_inserted !== true) fail("Readiness must confirm chart inserted");
if (readiness.chart_audited !== true) fail("Readiness must confirm chart audited");
if (readiness.placement_tuned !== true) fail("Readiness must confirm placement tuned");
if (readiness.ready_for_ag11c !== true) fail("Readiness must be ready for AG11C");
if (readiness.publishing_ready !== false) fail("Publishing must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase must remain blocked");

if (boundary.status !== "ag11c_boundary_created_not_started") fail("AG11C boundary status mismatch");
if (boundary.next_stage_id !== "AG11C") fail("AG11C handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG11C must require explicit approval");

if (schema.status !== "schema_chart_bi_graph_controlled_cycle") fail("Schema status mismatch");
for (const key of [
  "source_data_finalisation_allowed_in_ag11b",
  "controlled_chart_creation_allowed_in_ag11b",
  "chart_article_insertion_allowed_in_ag11b",
  "placement_tuning_allowed_in_ag11b",
  "post_insertion_audit_allowed_in_ag11b",
  "closure_reuse_handoff_allowed_in_ag11b",
  "ag11c_boundary_allowed_in_ag11b"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "invented_data_allowed_in_ag11b",
  "external_data_fetch_allowed_in_ag11b",
  "uncontrolled_chart_generation_allowed_in_ag11b",
  "reference_url_change_allowed_in_ag11b",
  "homepage_mutation_allowed_in_ag11b",
  "css_js_mutation_allowed_in_ag11b",
  "database_write_allowed_in_ag11b",
  "supabase_write_allowed_in_ag11b",
  "backend_auth_supabase_activation_allowed_in_ag11b",
  "public_publishing_operation_allowed_in_ag11b"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [sourceData, asset, placement, apply, audit, closure, readiness, boundary, schema, review, learning, registry, preview]) {
  if (obj.chart_bi_graph_controlled_cycle_only !== true) fail(`${obj.title || "object"} must be AG11B-only`);
  if (obj.five_step_compact_cycle_executed !== true) fail(`${obj.title || "object"} must record five-step cycle`);
  if (obj.invented_data_used_in_ag11b !== false) fail(`${obj.title || "object"} must not use invented data`);
  if (obj.external_data_fetch_performed_in_ag11b !== false) fail(`${obj.title || "object"} must not fetch external data`);
  if (obj.css_file_mutation_performed_in_ag11b !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_file_mutation_performed_in_ag11b !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.backend_auth_supabase_activation_performed_in_ag11b !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag11b !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Chart Created", "Placement and Fine-Tuning", "Data Integrity", "Boundaries", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG11B document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag11b", "validate:ag11b"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag11b")) {
  fail("validate:project must include validate:ag11b");
}

pass("AG11B registry is present.");
pass("AG11B document is present.");
pass("AG11B source data, chart asset, placement tuning, apply record, audit report, closure, readiness, AG11C boundary, schema, learning and preview are present.");
pass("AG11A boundary and AG10C chart doctrine are consumed.");
pass("Article started from AG10K post-insertion hash and now matches AG11B post-insertion hash.");
pass("Chart source data is deterministic article-text count data with no invented data.");
pass("Controlled SVG chart asset is created and hash-verified.");
pass("Chart is inserted with title, labels, values, caption and visible credit.");
pass("Placement tuning records location, size, alignment, title, labels, caption, credit and mobile behavior.");
pass("Post-insertion audit passed with zero failed checks.");
pass("Chart cycle is closed with reusable template, source logic and placement logic.");
pass("Publishing, backend and Supabase activation remain blocked.");
pass("No external data fetch, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG11C infographic controlled cycle boundary is created with explicit approval required.");
pass("AG11B is Chart / BI Graph Controlled Cycle only.");
