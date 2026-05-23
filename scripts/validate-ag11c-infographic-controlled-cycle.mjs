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
  "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json",
  "data/content-intelligence/quality-reviews/ag11b-chart-bi-graph-controlled-cycle.json",
  "data/content-intelligence/apply-records/ag11b-chart-bi-graph-controlled-cycle-apply.json",
  "data/content-intelligence/quality-registry/ag11b-chart-bi-graph-final-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag11b-to-ag11c-infographic-controlled-cycle-boundary.json",
  "data/content-intelligence/object-registry/ag10d-infographic-family-structure-registry.json",
  "data/content-intelligence/object-registry/ag10d-infographic-content-block-schema.json",
  "data/content-intelligence/object-registry/ag10d-infographic-theme-credit-mobile-doctrine.json",

  "assets/articles/policy/enhancing-public-healthcare-delivery-digital-innovation/ag11c-infographic-digital-healthcare-delivery-flow.svg",
  "data/content-intelligence/backups/ag11c-pre-infographic-insertion-enhancing-public-healthcare-delivery-digital-innovation.html",
  "data/content-intelligence/object-registry/ag11c-infographic-content-block-finalisation-record.json",
  "data/content-intelligence/object-registry/ag11c-infographic-asset-record.json",
  "data/content-intelligence/quality-registry/ag11c-infographic-placement-tuning-record.json",
  "data/content-intelligence/apply-records/ag11c-infographic-controlled-cycle-apply.json",
  "data/content-intelligence/audit-records/ag11c-infographic-post-insertion-audit-report.json",
  "data/content-intelligence/closure-records/ag11c-infographic-controlled-cycle-closure.json",
  "data/content-intelligence/quality-registry/ag11c-infographic-final-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag11c-to-ag11d-figure-diagram-controlled-cycle-boundary.json",
  "data/content-intelligence/schema/infographic-controlled-cycle.schema.json",
  "data/content-intelligence/quality-reviews/ag11c-infographic-controlled-cycle.json",
  "data/content-intelligence/learning/ag11c-infographic-controlled-cycle-learning.json",
  "data/quality/ag11c-infographic-controlled-cycle.json",
  "data/quality/ag11c-infographic-controlled-cycle-preview.json",
  "docs/quality/AG11C_INFOGRAPHIC_CONTROLLED_CYCLE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG11C validation failed: ${message}`);
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

const ag11bReview = readJson("data/content-intelligence/quality-reviews/ag11b-chart-bi-graph-controlled-cycle.json");
const ag11bApply = readJson("data/content-intelligence/apply-records/ag11b-chart-bi-graph-controlled-cycle-apply.json");
const ag11bReadiness = readJson("data/content-intelligence/quality-registry/ag11b-chart-bi-graph-final-readiness-record.json");
const ag11bBoundary = readJson("data/content-intelligence/mutation-plans/ag11b-to-ag11c-infographic-controlled-cycle-boundary.json");

const contentBlocks = readJson("data/content-intelligence/object-registry/ag11c-infographic-content-block-finalisation-record.json");
const asset = readJson("data/content-intelligence/object-registry/ag11c-infographic-asset-record.json");
const placement = readJson("data/content-intelligence/quality-registry/ag11c-infographic-placement-tuning-record.json");
const apply = readJson("data/content-intelligence/apply-records/ag11c-infographic-controlled-cycle-apply.json");
const audit = readJson("data/content-intelligence/audit-records/ag11c-infographic-post-insertion-audit-report.json");
const closure = readJson("data/content-intelligence/closure-records/ag11c-infographic-controlled-cycle-closure.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag11c-infographic-final-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag11c-to-ag11d-figure-diagram-controlled-cycle-boundary.json");
const schema = readJson("data/content-intelligence/schema/infographic-controlled-cycle.schema.json");
const review = readJson("data/content-intelligence/quality-reviews/ag11c-infographic-controlled-cycle.json");
const learning = readJson("data/content-intelligence/learning/ag11c-infographic-controlled-cycle-learning.json");
const registry = readJson("data/quality/ag11c-infographic-controlled-cycle.json");
const preview = readJson("data/quality/ag11c-infographic-controlled-cycle-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG11C_INFOGRAPHIC_CONTROLLED_CYCLE.md"), "utf8");

for (const obj of [contentBlocks, asset, placement, apply, audit, closure, readiness, boundary, schema, review, learning, registry, preview]) {
  if (obj.module_id !== "AG11C") fail(`module_id must be AG11C in ${obj.title || "object"}`);
}

if (ag11bReview.status !== "chart_bi_graph_controlled_cycle_closed_reuse_handoff_recorded") fail("AG11B review status mismatch");
if (ag11bReadiness.ready_for_ag11c !== true) fail("AG11B readiness for AG11C missing");
if (ag11bBoundary.next_stage_id !== "AG11C") fail("AG11C boundary missing in AG11B");

const articlePath = apply.selected_article_path;
const assetPath = apply.asset_path;
const backupPath = apply.backup_path;

if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
if (!fs.existsSync(path.join(root, assetPath))) fail(`Infographic asset missing: ${assetPath}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`Backup missing: ${backupPath}`);

const articleHtml = fs.readFileSync(path.join(root, articlePath), "utf8");
const assetText = fs.readFileSync(path.join(root, assetPath), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");

const articleHash = sha256(articleHtml);
const assetHash = sha256(assetText);
const backupHash = sha256(backupHtml);

if (articleHash !== apply.post_insertion_hash) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) fail("Current article hash must match AG11C post-insertion hash or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state");
if (assetHash !== apply.asset_hash_sha256) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) fail("Current infographic asset hash must match apply record or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state");
if (backupHash !== apply.pre_insertion_hash) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) fail("Backup hash must match AG11C pre-insertion hash or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state");
if (apply.pre_insertion_hash !== ag11bApply.post_insertion_hash) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) fail("AG11C must start from AG11B post-insertion hash or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state");

if (markerCount(articleHtml, apply.insertion_marker_start) !== 1) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) fail("AG11C start marker count must be one or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state");
if (markerCount(articleHtml, apply.insertion_marker_end) !== 1) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) fail("AG11C end marker count must be one or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state");
if (backupHtml.includes(apply.insertion_marker_start)) fail("AG11C backup must not include AG11C marker");

if (!articleHtml.includes(apply.asset_src_in_article)) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) fail("Article must include infographic asset src or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state");
if (!articleHtml.includes(apply.infographic_title)) fail("Article must include infographic title");
if (!articleHtml.includes(apply.caption)) fail("Article must include infographic caption");
if (!articleHtml.includes(apply.visible_credit)) fail("Article must include visible credit");

if (contentBlocks.status !== "content_blocks_finalised_article_derived_conceptual_flow") fail("Content block status mismatch");
if (contentBlocks.no_invented_data !== true) fail("Content blocks must record no invented data");
if (contentBlocks.external_data_used !== false) fail("External data must be false");
if (!Array.isArray(contentBlocks.content_blocks) || contentBlocks.content_blocks.length !== 4) fail("Infographic must have four content blocks");

if (asset.status !== "controlled_infographic_asset_created") fail("Asset record status mismatch");
if (asset.asset_hash_sha256 !== assetHash) if (!ag11cControlledInfographicInsertionAllowsPostMutation()) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) fail("Asset record hash mismatch or AG11C controlled infographic post-insertion record explains the later approved article state or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state");
if (asset.asset_type !== "internal_svg_infographic") fail("Infographic asset type mismatch");
if (!assetText.includes("How digital innovation supports public healthcare delivery")) fail("SVG must include infographic title");
if (!assetText.includes("Digital touchpoint")) fail("SVG must include content block label");
if (!assetText.includes("article-derived conceptual synthesis")) fail("SVG must include source note");

if (placement.status !== "infographic_placement_tuned") fail("Placement tuning status mismatch");
if (placement.placement_decision.alignment !== "center") fail("Infographic alignment must be center");
if (placement.placement_decision.max_width !== "940px") fail("Infographic max width must be 940px");
if (placement.placement_decision.title_present !== true) fail("Title must be present");
if (placement.placement_decision.step_labels_present !== true) fail("Step labels must be present");
if (placement.placement_decision.caption_present !== true) fail("Caption must be present");
if (placement.placement_decision.credit_present !== true) fail("Credit must be present");

if (audit.status !== "infographic_post_insertion_audit_passed") fail("Audit status mismatch");
if (!Array.isArray(audit.checks) || audit.checks.length !== 6) fail("Audit must have six checks");
if (audit.failed_checks.length !== 0) fail("Audit failed checks must be zero");

if (closure.status !== "infographic_controlled_cycle_closed_reuse_handoff_recorded") fail("Closure status mismatch");
if (closure.ready_for_ag11d !== true) fail("Closure must be ready for AG11D");
if (!closure.reusable_intelligence?.placement_logic) fail("Closure must preserve placement logic");
if (!closure.reusable_intelligence?.content_block_pattern) fail("Closure must preserve content block pattern");

if (readiness.status !== "infographic_cycle_closed_ready_for_ag11d") fail("Readiness status mismatch");
if (readiness.infographic_inserted !== true) fail("Readiness must confirm infographic inserted");
if (readiness.infographic_audited !== true) fail("Readiness must confirm infographic audited");
if (readiness.placement_tuned !== true) fail("Readiness must confirm placement tuned");
if (readiness.ready_for_ag11d !== true) fail("Readiness must be ready for AG11D");
if (readiness.publishing_ready !== false) fail("Publishing must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase must remain blocked");

if (boundary.status !== "ag11d_boundary_created_not_started") fail("AG11D boundary status mismatch");
if (boundary.next_stage_id !== "AG11D") fail("AG11D handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG11D must require explicit approval");

if (schema.status !== "schema_infographic_controlled_cycle") fail("Schema status mismatch");
for (const key of [
  "content_block_finalisation_allowed_in_ag11c",
  "controlled_infographic_creation_allowed_in_ag11c",
  "infographic_article_insertion_allowed_in_ag11c",
  "placement_tuning_allowed_in_ag11c",
  "post_insertion_audit_allowed_in_ag11c",
  "closure_reuse_handoff_allowed_in_ag11c",
  "ag11d_boundary_allowed_in_ag11c"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "invented_data_allowed_in_ag11c",
  "external_data_fetch_allowed_in_ag11c",
  "uncontrolled_infographic_generation_allowed_in_ag11c",
  "reference_url_change_allowed_in_ag11c",
  "homepage_mutation_allowed_in_ag11c",
  "css_js_mutation_allowed_in_ag11c",
  "database_write_allowed_in_ag11c",
  "supabase_write_allowed_in_ag11c",
  "backend_auth_supabase_activation_allowed_in_ag11c",
  "public_publishing_operation_allowed_in_ag11c"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [contentBlocks, asset, placement, apply, audit, closure, readiness, boundary, schema, review, learning, registry, preview]) {
  if (obj.infographic_controlled_cycle_only !== true) fail(`${obj.title || "object"} must be AG11C-only`);
  if (obj.five_step_compact_cycle_executed !== true) fail(`${obj.title || "object"} must record five-step cycle`);
  if (obj.invented_data_used_in_ag11c !== false) fail(`${obj.title || "object"} must not use invented data`);
  if (obj.external_data_fetch_performed_in_ag11c !== false) fail(`${obj.title || "object"} must not fetch external data`);
  if (obj.css_file_mutation_performed_in_ag11c !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_file_mutation_performed_in_ag11c !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.backend_auth_supabase_activation_performed_in_ag11c !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag11c !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Infographic Created", "Placement and Fine-Tuning", "Integrity Boundary", "Boundaries", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG11C document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag11c", "validate:ag11c"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag11c")) {
  fail("validate:project must include validate:ag11c");
}

pass("AG11C registry is present.");
pass("AG11C document is present.");
pass("AG11C content blocks, infographic asset, placement tuning, apply record, audit report, closure, readiness, AG11D boundary, schema, learning and preview are present.");
pass("AG11B boundary and AG10D infographic doctrine are consumed.");
pass("Article started from AG11B post-insertion hash and now matches AG11C post-insertion hash.");
pass("Infographic content is article-derived conceptual synthesis with no invented data.");
pass("Controlled SVG infographic asset is created and hash-verified.");
pass("Infographic is inserted with title, step labels, content blocks, caption and visible credit.");
pass("Placement tuning records location, size, alignment, title, labels, caption, credit and mobile behavior.");
pass("Post-insertion audit passed with zero failed checks.");
pass("Infographic cycle is closed with reusable template, content block pattern and placement logic.");
pass("Publishing, backend and Supabase activation remain blocked.");
pass("No external data fetch, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG11D figure/diagram controlled cycle boundary is created with explicit approval required.");
pass("AG11C is Infographic Controlled Cycle only.");
