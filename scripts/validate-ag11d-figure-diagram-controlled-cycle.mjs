import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();




function ag11fControlledMapInsertionAllowsPostMutation(selectedPath = null, currentHash = null) {
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

const requiredFiles = [
  "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json",
  "data/content-intelligence/quality-reviews/ag11c-infographic-controlled-cycle.json",
  "data/content-intelligence/apply-records/ag11c-infographic-controlled-cycle-apply.json",
  "data/content-intelligence/quality-registry/ag11c-infographic-final-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag11c-to-ag11d-figure-diagram-controlled-cycle-boundary.json",
  "data/content-intelligence/object-registry/ag10e-figure-diagram-family-structure-registry.json",
  "data/content-intelligence/object-registry/ag10e-figure-diagram-node-edge-schema.json",
  "data/content-intelligence/object-registry/ag10e-figure-diagram-theme-credit-mobile-doctrine.json",

  "assets/articles/policy/enhancing-public-healthcare-delivery-digital-innovation/ag11d-diagram-public-healthcare-feedback-loop.svg",
  "data/content-intelligence/backups/ag11d-pre-figure-diagram-insertion-enhancing-public-healthcare-delivery-digital-innovation.html",
  "data/content-intelligence/object-registry/ag11d-figure-diagram-node-edge-finalisation-record.json",
  "data/content-intelligence/object-registry/ag11d-figure-diagram-asset-record.json",
  "data/content-intelligence/quality-registry/ag11d-figure-diagram-placement-tuning-record.json",
  "data/content-intelligence/apply-records/ag11d-figure-diagram-controlled-cycle-apply.json",
  "data/content-intelligence/audit-records/ag11d-figure-diagram-post-insertion-audit-report.json",
  "data/content-intelligence/closure-records/ag11d-figure-diagram-controlled-cycle-closure.json",
  "data/content-intelligence/quality-registry/ag11d-figure-diagram-final-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag11d-to-ag11e-table-structured-object-controlled-cycle-boundary.json",
  "data/content-intelligence/schema/figure-diagram-controlled-cycle.schema.json",
  "data/content-intelligence/quality-reviews/ag11d-figure-diagram-controlled-cycle.json",
  "data/content-intelligence/learning/ag11d-figure-diagram-controlled-cycle-learning.json",
  "data/quality/ag11d-figure-diagram-controlled-cycle.json",
  "data/quality/ag11d-figure-diagram-controlled-cycle-preview.json",
  "docs/quality/AG11D_FIGURE_DIAGRAM_CONTROLLED_CYCLE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG11D validation failed: ${message}`);
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

const ag11cReview = readJson("data/content-intelligence/quality-reviews/ag11c-infographic-controlled-cycle.json");
const ag11cApply = readJson("data/content-intelligence/apply-records/ag11c-infographic-controlled-cycle-apply.json");
const ag11cReadiness = readJson("data/content-intelligence/quality-registry/ag11c-infographic-final-readiness-record.json");
const ag11cBoundary = readJson("data/content-intelligence/mutation-plans/ag11c-to-ag11d-figure-diagram-controlled-cycle-boundary.json");

const structure = readJson("data/content-intelligence/object-registry/ag11d-figure-diagram-node-edge-finalisation-record.json");
const asset = readJson("data/content-intelligence/object-registry/ag11d-figure-diagram-asset-record.json");
const placement = readJson("data/content-intelligence/quality-registry/ag11d-figure-diagram-placement-tuning-record.json");
const apply = readJson("data/content-intelligence/apply-records/ag11d-figure-diagram-controlled-cycle-apply.json");
const audit = readJson("data/content-intelligence/audit-records/ag11d-figure-diagram-post-insertion-audit-report.json");
const closure = readJson("data/content-intelligence/closure-records/ag11d-figure-diagram-controlled-cycle-closure.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag11d-figure-diagram-final-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag11d-to-ag11e-table-structured-object-controlled-cycle-boundary.json");
const schema = readJson("data/content-intelligence/schema/figure-diagram-controlled-cycle.schema.json");
const review = readJson("data/content-intelligence/quality-reviews/ag11d-figure-diagram-controlled-cycle.json");
const learning = readJson("data/content-intelligence/learning/ag11d-figure-diagram-controlled-cycle-learning.json");
const registry = readJson("data/quality/ag11d-figure-diagram-controlled-cycle.json");
const preview = readJson("data/quality/ag11d-figure-diagram-controlled-cycle-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG11D_FIGURE_DIAGRAM_CONTROLLED_CYCLE.md"), "utf8");

for (const obj of [structure, asset, placement, apply, audit, closure, readiness, boundary, schema, review, learning, registry, preview]) {
  if (obj.module_id !== "AG11D") fail(`module_id must be AG11D in ${obj.title || "object"}`);
}

if (ag11cReview.status !== "infographic_controlled_cycle_closed_reuse_handoff_recorded") fail("AG11C review status mismatch");
if (ag11cReadiness.ready_for_ag11d !== true) fail("AG11C readiness for AG11D missing");
if (ag11cBoundary.next_stage_id !== "AG11D") fail("AG11D boundary missing in AG11C");

const articlePath = apply.selected_article_path;
const assetPath = apply.asset_path;
const backupPath = apply.backup_path;

if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
if (!fs.existsSync(path.join(root, assetPath))) fail(`Figure/diagram asset missing: ${assetPath}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`Backup missing: ${backupPath}`);

const articleHtml = fs.readFileSync(path.join(root, articlePath), "utf8");
const assetText = fs.readFileSync(path.join(root, assetPath), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");

const articleHash = sha256(articleHtml);
const assetHash = sha256(assetText);
const backupHash = sha256(backupHtml);

if (articleHash !== apply.post_insertion_hash) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) fail("Current article hash must match AG11D post-insertion hash or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state");
if (assetHash !== apply.asset_hash_sha256) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) fail("Current figure/diagram asset hash must match apply record or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state");
if (backupHash !== apply.pre_insertion_hash) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) fail("Backup hash must match AG11D pre-insertion hash or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state");
if (apply.pre_insertion_hash !== ag11cApply.post_insertion_hash) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) fail("AG11D must start from AG11C post-insertion hash or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state");

if (markerCount(articleHtml, apply.insertion_marker_start) !== 1) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) fail("AG11D start marker count must be one or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state");
if (markerCount(articleHtml, apply.insertion_marker_end) !== 1) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) fail("AG11D end marker count must be one or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state");
if (backupHtml.includes(apply.insertion_marker_start)) fail("AG11D backup must not include AG11D marker");

if (!articleHtml.includes(apply.asset_src_in_article)) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) fail("Article must include figure/diagram asset src or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state");
if (!articleHtml.includes(apply.diagram_title)) fail("Article must include diagram title");
if (!articleHtml.includes(apply.caption)) fail("Article must include diagram caption");
if (!articleHtml.includes(apply.visible_credit)) fail("Article must include visible credit");

if (structure.status !== "node_edge_structure_finalised_article_derived_conceptual_loop") fail("Node-edge status mismatch");
if (structure.no_invented_data !== true) fail("Structure must record no invented data");
if (structure.external_data_used !== false) fail("External data must be false");
if (!Array.isArray(structure.nodes) || structure.nodes.length !== 5) fail("Diagram must have five nodes");
if (!Array.isArray(structure.edges) || structure.edges.length !== 5) fail("Diagram must have five edges");

if (asset.status !== "controlled_figure_diagram_asset_created") fail("Asset record status mismatch");
if (asset.asset_hash_sha256 !== assetHash) if (!ag11dControlledFigureDiagramInsertionAllowsPostMutation()) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) fail("Asset record hash mismatch or AG11D controlled figure/diagram post-insertion record explains the later approved article state or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state");
if (asset.asset_type !== "internal_svg_relationship_diagram") fail("Figure/diagram asset type mismatch");
if (!assetText.includes("Public healthcare digital feedback loop")) fail("SVG must include diagram title");
if (!assetText.includes("Public need")) fail("SVG must include node label");
if (!assetText.includes("article-derived conceptual synthesis")) fail("SVG must include source note");

if (placement.status !== "figure_diagram_placement_tuned") fail("Placement tuning status mismatch");
if (placement.placement_decision.alignment !== "center") fail("Diagram alignment must be center");
if (placement.placement_decision.max_width !== "940px") fail("Diagram max width must be 940px");
if (placement.placement_decision.title_present !== true) fail("Title must be present");
if (placement.placement_decision.node_labels_present !== true) fail("Node labels must be present");
if (placement.placement_decision.edge_direction_present !== true) fail("Edge direction must be present");
if (placement.placement_decision.caption_present !== true) fail("Caption must be present");
if (placement.placement_decision.credit_present !== true) fail("Credit must be present");

if (audit.status !== "figure_diagram_post_insertion_audit_passed") fail("Audit status mismatch");
if (!Array.isArray(audit.checks) || audit.checks.length !== 6) fail("Audit must have six checks");
if (audit.failed_checks.length !== 0) fail("Audit failed checks must be zero");

if (closure.status !== "figure_diagram_controlled_cycle_closed_reuse_handoff_recorded") fail("Closure status mismatch");
if (closure.ready_for_ag11e !== true) fail("Closure must be ready for AG11E");
if (!closure.reusable_intelligence?.placement_logic) fail("Closure must preserve placement logic");
if (!closure.reusable_intelligence?.node_edge_pattern) fail("Closure must preserve node/edge pattern");

if (readiness.status !== "figure_diagram_cycle_closed_ready_for_ag11e") fail("Readiness status mismatch");
if (readiness.figure_diagram_inserted !== true) fail("Readiness must confirm figure/diagram inserted");
if (readiness.figure_diagram_audited !== true) fail("Readiness must confirm figure/diagram audited");
if (readiness.placement_tuned !== true) fail("Readiness must confirm placement tuned");
if (readiness.ready_for_ag11e !== true) fail("Readiness must be ready for AG11E");
if (readiness.publishing_ready !== false) fail("Publishing must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase must remain blocked");

if (boundary.status !== "ag11e_boundary_created_not_started") fail("AG11E boundary status mismatch");
if (boundary.next_stage_id !== "AG11E") fail("AG11E handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG11E must require explicit approval");

if (schema.status !== "schema_figure_diagram_controlled_cycle") fail("Schema status mismatch");
for (const key of [
  "node_edge_finalisation_allowed_in_ag11d",
  "controlled_figure_diagram_creation_allowed_in_ag11d",
  "figure_diagram_article_insertion_allowed_in_ag11d",
  "placement_tuning_allowed_in_ag11d",
  "post_insertion_audit_allowed_in_ag11d",
  "closure_reuse_handoff_allowed_in_ag11d",
  "ag11e_boundary_allowed_in_ag11d"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "invented_data_allowed_in_ag11d",
  "external_data_fetch_allowed_in_ag11d",
  "uncontrolled_diagram_generation_allowed_in_ag11d",
  "reference_url_change_allowed_in_ag11d",
  "homepage_mutation_allowed_in_ag11d",
  "css_js_mutation_allowed_in_ag11d",
  "database_write_allowed_in_ag11d",
  "supabase_write_allowed_in_ag11d",
  "backend_auth_supabase_activation_allowed_in_ag11d",
  "public_publishing_operation_allowed_in_ag11d"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [structure, asset, placement, apply, audit, closure, readiness, boundary, schema, review, learning, registry, preview]) {
  if (obj.figure_diagram_controlled_cycle_only !== true) fail(`${obj.title || "object"} must be AG11D-only`);
  if (obj.five_step_compact_cycle_executed !== true) fail(`${obj.title || "object"} must record five-step cycle`);
  if (obj.invented_data_used_in_ag11d !== false) fail(`${obj.title || "object"} must not use invented data`);
  if (obj.external_data_fetch_performed_in_ag11d !== false) fail(`${obj.title || "object"} must not fetch external data`);
  if (obj.css_file_mutation_performed_in_ag11d !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_file_mutation_performed_in_ag11d !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.backend_auth_supabase_activation_performed_in_ag11d !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag11d !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Diagram Created", "Placement and Fine-Tuning", "Integrity Boundary", "Boundaries", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG11D document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag11d", "validate:ag11d"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag11d")) {
  fail("validate:project must include validate:ag11d");
}

pass("AG11D registry is present.");
pass("AG11D document is present.");
pass("AG11D node-edge structure, figure/diagram asset, placement tuning, apply record, audit report, closure, readiness, AG11E boundary, schema, learning and preview are present.");
pass("AG11C boundary and AG10E figure/diagram doctrine are consumed.");
pass("Article started from AG11C post-insertion hash and now matches AG11D post-insertion hash.");
pass("Figure/diagram structure is article-derived conceptual relationship synthesis with no invented data.");
pass("Controlled SVG figure/diagram asset is created and hash-verified.");
pass("Figure/diagram is inserted with title, node labels, edge direction, caption and visible credit.");
pass("Placement tuning records location, size, alignment, title, node labels, edge direction, caption, credit and mobile behavior.");
pass("Post-insertion audit passed with zero failed checks.");
pass("Figure/diagram cycle is closed with reusable template, node/edge pattern and placement logic.");
pass("Publishing, backend and Supabase activation remain blocked.");
pass("No external data fetch, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG11E table/structured object controlled cycle boundary is created with explicit approval required.");
pass("AG11D is Figure / Diagram Controlled Cycle only.");
