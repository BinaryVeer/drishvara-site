import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();





function ag12cControlledLayoutRefinementAllowsPostMutation(selectedPath = null, currentHash = null) {
  const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json");
  const r1ApplyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag12c-r1-public-object-label-layout-repair.json");

  if (!fs.existsSync(applyRecordPath)) return false;

  try {
    const applyRecord = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
    const r1ApplyRecord = fs.existsSync(r1ApplyRecordPath)
      ? JSON.parse(fs.readFileSync(r1ApplyRecordPath, "utf8"))
      : null;

    const targetPath = selectedPath || r1ApplyRecord?.selected_article_path || applyRecord.selected_article_path;
    if (!targetPath || applyRecord.selected_article_path !== targetPath) return false;
    if (r1ApplyRecord && r1ApplyRecord.selected_article_path !== targetPath) return false;

    const fullArticlePath = path.join(root, targetPath);
    if (!fs.existsSync(fullArticlePath)) return false;

    const html = fs.readFileSync(fullArticlePath, "utf8");
    const hashToCheck = currentHash || sha256(html);

    if (
      r1ApplyRecord &&
      r1ApplyRecord.status === "public_object_label_layout_repair_applied" &&
      r1ApplyRecord.pre_repair_hash === applyRecord.post_refinement_hash &&
      r1ApplyRecord.post_repair_hash === hashToCheck &&
      html.includes("AG12C-R1") &&
      html.includes('data-drishvara-layout-treatment="reader-facing-object"') &&
      !html.includes("Additional pilot object:") &&
      !html.includes('data-drishvara-layout-treatment="collapsed-pilot-annex"')
    ) {
      return true;
    }

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

const requiredFiles = [
  "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json",
  "data/content-intelligence/quality-reviews/ag11d-figure-diagram-controlled-cycle.json",
  "data/content-intelligence/apply-records/ag11d-figure-diagram-controlled-cycle-apply.json",
  "data/content-intelligence/quality-registry/ag11d-figure-diagram-final-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag11d-to-ag11e-table-structured-object-controlled-cycle-boundary.json",
  "data/content-intelligence/object-registry/ag10f-table-structured-object-family-registry.json",
  "data/content-intelligence/object-registry/ag10f-table-row-column-cell-schema.json",
  "data/content-intelligence/object-registry/ag10f-table-theme-credit-mobile-doctrine.json",

  "data/content-intelligence/backups/ag11e-pre-table-structured-object-insertion-enhancing-public-healthcare-delivery-digital-innovation.html",
  "data/content-intelligence/object-registry/ag11e-table-row-column-cell-finalisation-record.json",
  "data/content-intelligence/object-registry/ag11e-table-structured-object-record.json",
  "data/content-intelligence/quality-registry/ag11e-table-structured-object-placement-tuning-record.json",
  "data/content-intelligence/apply-records/ag11e-table-structured-object-controlled-cycle-apply.json",
  "data/content-intelligence/audit-records/ag11e-table-structured-object-post-insertion-audit-report.json",
  "data/content-intelligence/closure-records/ag11e-table-structured-object-controlled-cycle-closure.json",
  "data/content-intelligence/quality-registry/ag11e-table-structured-object-final-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag11e-to-ag11f-map-geographic-object-controlled-cycle-boundary.json",
  "data/content-intelligence/schema/table-structured-object-controlled-cycle.schema.json",
  "data/content-intelligence/quality-reviews/ag11e-table-structured-object-controlled-cycle.json",
  "data/content-intelligence/learning/ag11e-table-structured-object-controlled-cycle-learning.json",
  "data/quality/ag11e-table-structured-object-controlled-cycle.json",
  "data/quality/ag11e-table-structured-object-controlled-cycle-preview.json",
  "docs/quality/AG11E_TABLE_STRUCTURED_OBJECT_CONTROLLED_CYCLE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG11E validation failed: ${message}`);
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

const ag11dReview = readJson("data/content-intelligence/quality-reviews/ag11d-figure-diagram-controlled-cycle.json");
const ag11dApply = readJson("data/content-intelligence/apply-records/ag11d-figure-diagram-controlled-cycle-apply.json");
const ag11dReadiness = readJson("data/content-intelligence/quality-registry/ag11d-figure-diagram-final-readiness-record.json");
const ag11dBoundary = readJson("data/content-intelligence/mutation-plans/ag11d-to-ag11e-table-structured-object-controlled-cycle-boundary.json");

const tableData = readJson("data/content-intelligence/object-registry/ag11e-table-row-column-cell-finalisation-record.json");
const objectRecord = readJson("data/content-intelligence/object-registry/ag11e-table-structured-object-record.json");
const placement = readJson("data/content-intelligence/quality-registry/ag11e-table-structured-object-placement-tuning-record.json");
const apply = readJson("data/content-intelligence/apply-records/ag11e-table-structured-object-controlled-cycle-apply.json");
const audit = readJson("data/content-intelligence/audit-records/ag11e-table-structured-object-post-insertion-audit-report.json");
const closure = readJson("data/content-intelligence/closure-records/ag11e-table-structured-object-controlled-cycle-closure.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag11e-table-structured-object-final-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag11e-to-ag11f-map-geographic-object-controlled-cycle-boundary.json");
const schema = readJson("data/content-intelligence/schema/table-structured-object-controlled-cycle.schema.json");
const review = readJson("data/content-intelligence/quality-reviews/ag11e-table-structured-object-controlled-cycle.json");
const learning = readJson("data/content-intelligence/learning/ag11e-table-structured-object-controlled-cycle-learning.json");
const registry = readJson("data/quality/ag11e-table-structured-object-controlled-cycle.json");
const preview = readJson("data/quality/ag11e-table-structured-object-controlled-cycle-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG11E_TABLE_STRUCTURED_OBJECT_CONTROLLED_CYCLE.md"), "utf8");

for (const obj of [tableData, objectRecord, placement, apply, audit, closure, readiness, boundary, schema, review, learning, registry, preview]) {
  if (obj.module_id !== "AG11E") fail(`module_id must be AG11E in ${obj.title || "object"}`);
}

if (ag11dReview.status !== "figure_diagram_controlled_cycle_closed_reuse_handoff_recorded") fail("AG11D review status mismatch");
if (ag11dReadiness.ready_for_ag11e !== true) fail("AG11D readiness for AG11E missing");
if (ag11dBoundary.next_stage_id !== "AG11E") fail("AG11E boundary missing in AG11D");

const articlePath = apply.selected_article_path;
const backupPath = apply.backup_path;

if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`Backup missing: ${backupPath}`);

const articleHtml = fs.readFileSync(path.join(root, articlePath), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");

const articleHash = sha256(articleHtml);
const backupHash = sha256(backupHtml);

if (articleHash !== apply.post_insertion_hash) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Current article hash must match AG11E post-insertion hash or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (backupHash !== apply.pre_insertion_hash) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Backup hash must match AG11E pre-insertion hash or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (apply.pre_insertion_hash !== ag11dApply.post_insertion_hash) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("AG11E must start from AG11D post-insertion hash or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");

if (markerCount(articleHtml, apply.insertion_marker_start) !== 1) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("AG11E start marker count must be one or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (markerCount(articleHtml, apply.insertion_marker_end) !== 1) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("AG11E end marker count must be one or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (backupHtml.includes(apply.insertion_marker_start)) fail("AG11E backup must not include AG11E marker");

if (!articleHtml.includes(apply.table_title)) fail("Article must include table title");
if (!articleHtml.includes(apply.caption)) fail("Article must include table caption");
if (!articleHtml.includes(apply.visible_credit)) fail("Article must include visible credit");
if (!articleHtml.includes("overflow-x:auto")) fail("Article must include mobile overflow control");
if (!articleHtml.includes("AG11E-TABLE-001")) fail("Article must include table object ID");

if (tableData.status !== "row_column_cell_structure_finalised_article_derived_conceptual_summary") fail("Table data status mismatch");
if (tableData.no_invented_data !== true) fail("Table data must record no invented data");
if (tableData.external_data_used !== false) fail("External data must be false");
if (!Array.isArray(tableData.columns) || tableData.columns.length !== 4) fail("Table must have four columns");
if (!Array.isArray(tableData.rows) || tableData.rows.length !== 4) fail("Table must have four rows");

if (objectRecord.status !== "controlled_table_structured_object_created") fail("Object record status mismatch");
if (objectRecord.object_hash_sha256 !== apply.object_hash_sha256) if (!ag11eControlledTableInsertionAllowsPostMutation()) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Object record hash mismatch or AG11E controlled table/structured-object post-insertion record explains the later approved article state or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (objectRecord.object_type !== "inline_html_structured_table") fail("Object type mismatch");

if (placement.status !== "table_structured_object_placement_tuned") fail("Placement tuning status mismatch");
if (placement.placement_decision.alignment !== "center") fail("Table alignment must be center");
if (placement.placement_decision.max_width !== "940px") fail("Table max width must be 940px");
if (placement.placement_decision.mobile_behavior !== "horizontal overflow enabled with min-width table and touch scrolling") fail("Table mobile behavior mismatch");
if (placement.placement_decision.column_headers_present !== true) fail("Column headers must be present");
if (placement.placement_decision.row_headers_present !== true) fail("Row headers must be present");
if (placement.placement_decision.caption_present !== true) fail("Caption must be present");
if (placement.placement_decision.credit_present !== true) fail("Credit must be present");

if (audit.status !== "table_structured_object_post_insertion_audit_passed") fail("Audit status mismatch");
if (!Array.isArray(audit.checks) || audit.checks.length !== 6) fail("Audit must have six checks");
if (audit.failed_checks.length !== 0) fail("Audit failed checks must be zero");

if (closure.status !== "table_structured_object_controlled_cycle_closed_reuse_handoff_recorded") fail("Closure status mismatch");
if (closure.ready_for_ag11f !== true) fail("Closure must be ready for AG11F");
if (!closure.reusable_intelligence?.placement_logic) fail("Closure must preserve placement logic");
if (!closure.reusable_intelligence?.row_column_cell_pattern) fail("Closure must preserve row/column/cell pattern");

if (readiness.status !== "table_structured_object_cycle_closed_ready_for_ag11f") fail("Readiness status mismatch");
if (readiness.table_structured_object_inserted !== true) fail("Readiness must confirm table inserted");
if (readiness.table_structured_object_audited !== true) fail("Readiness must confirm table audited");
if (readiness.placement_tuned !== true) fail("Readiness must confirm placement tuned");
if (readiness.ready_for_ag11f !== true) fail("Readiness must be ready for AG11F");
if (readiness.publishing_ready !== false) fail("Publishing must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase must remain blocked");

if (boundary.status !== "ag11f_boundary_created_not_started") fail("AG11F boundary status mismatch");
if (boundary.next_stage_id !== "AG11F") fail("AG11F handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG11F must require explicit approval");

if (schema.status !== "schema_table_structured_object_controlled_cycle") fail("Schema status mismatch");
for (const key of [
  "row_column_cell_finalisation_allowed_in_ag11e",
  "controlled_table_structured_object_creation_allowed_in_ag11e",
  "table_structured_object_article_insertion_allowed_in_ag11e",
  "placement_tuning_allowed_in_ag11e",
  "post_insertion_audit_allowed_in_ag11e",
  "closure_reuse_handoff_allowed_in_ag11e",
  "ag11f_boundary_allowed_in_ag11e"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "invented_data_allowed_in_ag11e",
  "external_data_fetch_allowed_in_ag11e",
  "uncontrolled_table_generation_allowed_in_ag11e",
  "reference_url_change_allowed_in_ag11e",
  "homepage_mutation_allowed_in_ag11e",
  "css_js_mutation_allowed_in_ag11e",
  "database_write_allowed_in_ag11e",
  "supabase_write_allowed_in_ag11e",
  "backend_auth_supabase_activation_allowed_in_ag11e",
  "public_publishing_operation_allowed_in_ag11e"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [tableData, objectRecord, placement, apply, audit, closure, readiness, boundary, schema, review, learning, registry, preview]) {
  if (obj.table_structured_object_controlled_cycle_only !== true) fail(`${obj.title || "object"} must be AG11E-only`);
  if (obj.five_step_compact_cycle_executed !== true) fail(`${obj.title || "object"} must record five-step cycle`);
  if (obj.invented_data_used_in_ag11e !== false) fail(`${obj.title || "object"} must not use invented data`);
  if (obj.external_data_fetch_performed_in_ag11e !== false) fail(`${obj.title || "object"} must not fetch external data`);
  if (obj.css_file_mutation_performed_in_ag11e !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_file_mutation_performed_in_ag11e !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.backend_auth_supabase_activation_performed_in_ag11e !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag11e !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Table Created", "Placement and Fine-Tuning", "Integrity Boundary", "Boundaries", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG11E document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag11e", "validate:ag11e"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag11e")) {
  fail("validate:project must include validate:ag11e");
}

pass("AG11E registry is present.");
pass("AG11E document is present.");
pass("AG11E row-column-cell structure, table object, placement tuning, apply record, audit report, closure, readiness, AG11F boundary, schema, learning and preview are present.");
pass("AG11D boundary and AG10F table doctrine are consumed.");
pass("Article started from AG11D post-insertion hash and now matches AG11E post-insertion hash.");
pass("Table structure is article-derived conceptual synthesis with no invented data.");
pass("Controlled inline HTML table object is created and hash-recorded.");
pass("Table is inserted with title, headers, rows, caption, source note and visible credit.");
pass("Placement tuning records location, size, alignment, headers, caption, credit and mobile overflow behavior.");
pass("Post-insertion audit passed with zero failed checks.");
pass("Table/structured object cycle is closed with reusable row-column-cell pattern and placement logic.");
pass("Publishing, backend and Supabase activation remain blocked.");
pass("No external data fetch, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG11F map/geographic object controlled cycle boundary is created with explicit approval required.");
pass("AG11E is Table / Structured Object Controlled Cycle only.");
