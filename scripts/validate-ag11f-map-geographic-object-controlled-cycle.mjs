import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();




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

const requiredFiles = [
  "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json",
  "data/content-intelligence/quality-reviews/ag11e-table-structured-object-controlled-cycle.json",
  "data/content-intelligence/apply-records/ag11e-table-structured-object-controlled-cycle-apply.json",
  "data/content-intelligence/quality-registry/ag11e-table-structured-object-final-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag11e-to-ag11f-map-geographic-object-controlled-cycle-boundary.json",
  "data/content-intelligence/object-registry/ag10g-map-geographic-object-family-registry.json",
  "data/content-intelligence/object-registry/ag10g-geo-data-location-schema.json",
  "data/content-intelligence/object-registry/ag10g-map-theme-credit-mobile-doctrine.json",

  "assets/articles/policy/enhancing-public-healthcare-delivery-digital-innovation/ag11f-schematic-geographic-access-pathway.svg",
  "data/content-intelligence/backups/ag11f-pre-map-geographic-object-insertion-enhancing-public-healthcare-delivery-digital-innovation.html",
  "data/content-intelligence/object-registry/ag11f-map-geographic-object-finalisation-record.json",
  "data/content-intelligence/object-registry/ag11f-map-geographic-object-asset-record.json",
  "data/content-intelligence/quality-registry/ag11f-map-geographic-object-placement-tuning-record.json",
  "data/content-intelligence/apply-records/ag11f-map-geographic-object-controlled-cycle-apply.json",
  "data/content-intelligence/audit-records/ag11f-map-geographic-object-post-insertion-audit-report.json",
  "data/content-intelligence/closure-records/ag11f-map-geographic-object-controlled-cycle-closure.json",
  "data/content-intelligence/quality-registry/ag11f-map-geographic-object-final-readiness-record.json",
  "data/content-intelligence/mutation-plans/ag11f-to-ag11g-article-support-composite-object-controlled-cycle-boundary.json",
  "data/content-intelligence/schema/map-geographic-object-controlled-cycle.schema.json",
  "data/content-intelligence/quality-reviews/ag11f-map-geographic-object-controlled-cycle.json",
  "data/content-intelligence/learning/ag11f-map-geographic-object-controlled-cycle-learning.json",
  "data/quality/ag11f-map-geographic-object-controlled-cycle.json",
  "data/quality/ag11f-map-geographic-object-controlled-cycle-preview.json",
  "docs/quality/AG11F_MAP_GEOGRAPHIC_OBJECT_CONTROLLED_CYCLE.md",
  "package.json"
];

function fail(message) {
  console.error(`❌ AG11F validation failed: ${message}`);
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

const ag11eReview = readJson("data/content-intelligence/quality-reviews/ag11e-table-structured-object-controlled-cycle.json");
const ag11eApply = readJson("data/content-intelligence/apply-records/ag11e-table-structured-object-controlled-cycle-apply.json");
const ag11eReadiness = readJson("data/content-intelligence/quality-registry/ag11e-table-structured-object-final-readiness-record.json");
const ag11eBoundary = readJson("data/content-intelligence/mutation-plans/ag11e-to-ag11f-map-geographic-object-controlled-cycle-boundary.json");

const geoFinalisation = readJson("data/content-intelligence/object-registry/ag11f-map-geographic-object-finalisation-record.json");
const asset = readJson("data/content-intelligence/object-registry/ag11f-map-geographic-object-asset-record.json");
const placement = readJson("data/content-intelligence/quality-registry/ag11f-map-geographic-object-placement-tuning-record.json");
const apply = readJson("data/content-intelligence/apply-records/ag11f-map-geographic-object-controlled-cycle-apply.json");
const audit = readJson("data/content-intelligence/audit-records/ag11f-map-geographic-object-post-insertion-audit-report.json");
const closure = readJson("data/content-intelligence/closure-records/ag11f-map-geographic-object-controlled-cycle-closure.json");
const readiness = readJson("data/content-intelligence/quality-registry/ag11f-map-geographic-object-final-readiness-record.json");
const boundary = readJson("data/content-intelligence/mutation-plans/ag11f-to-ag11g-article-support-composite-object-controlled-cycle-boundary.json");
const schema = readJson("data/content-intelligence/schema/map-geographic-object-controlled-cycle.schema.json");
const review = readJson("data/content-intelligence/quality-reviews/ag11f-map-geographic-object-controlled-cycle.json");
const learning = readJson("data/content-intelligence/learning/ag11f-map-geographic-object-controlled-cycle-learning.json");
const registry = readJson("data/quality/ag11f-map-geographic-object-controlled-cycle.json");
const preview = readJson("data/quality/ag11f-map-geographic-object-controlled-cycle-preview.json");
const pkg = readJson("package.json");
const docText = fs.readFileSync(path.join(root, "docs/quality/AG11F_MAP_GEOGRAPHIC_OBJECT_CONTROLLED_CYCLE.md"), "utf8");

for (const obj of [geoFinalisation, asset, placement, apply, audit, closure, readiness, boundary, schema, review, learning, registry, preview]) {
  if (obj.module_id !== "AG11F") fail(`module_id must be AG11F in ${obj.title || "object"}`);
}

if (ag11eReview.status !== "table_structured_object_controlled_cycle_closed_reuse_handoff_recorded") fail("AG11E review status mismatch");
if (ag11eReadiness.ready_for_ag11f !== true) fail("AG11E readiness for AG11F missing");
if (ag11eBoundary.next_stage_id !== "AG11F") fail("AG11F boundary missing in AG11E");

const articlePath = apply.selected_article_path;
const assetPath = apply.asset_path;
const backupPath = apply.backup_path;

if (!fs.existsSync(path.join(root, articlePath))) fail(`Selected article missing: ${articlePath}`);
if (!fs.existsSync(path.join(root, assetPath))) fail(`Map/geographic asset missing: ${assetPath}`);
if (!fs.existsSync(path.join(root, backupPath))) fail(`Backup missing: ${backupPath}`);

const articleHtml = fs.readFileSync(path.join(root, articlePath), "utf8");
const assetText = fs.readFileSync(path.join(root, assetPath), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");

const articleHash = sha256(articleHtml);
const assetHash = sha256(assetText);
const backupHash = sha256(backupHtml);

if (articleHash !== apply.post_insertion_hash) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Current article hash must match AG11F post-insertion hash or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (assetHash !== apply.asset_hash_sha256) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Current map/geographic asset hash must match apply record or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (backupHash !== apply.pre_insertion_hash) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Backup hash must match AG11F pre-insertion hash or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (apply.pre_insertion_hash !== ag11eApply.post_insertion_hash) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("AG11F must start from AG11E post-insertion hash or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");

if (markerCount(articleHtml, apply.insertion_marker_start) !== 1) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("AG11F start marker count must be one or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (markerCount(articleHtml, apply.insertion_marker_end) !== 1) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("AG11F end marker count must be one or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (backupHtml.includes(apply.insertion_marker_start)) fail("AG11F backup must not include AG11F marker");

if (!articleHtml.includes(apply.asset_src_in_article)) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Article must include map/geographic asset src or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (!articleHtml.includes(apply.map_title)) fail("Article must include map title");
if (!articleHtml.includes(apply.caption)) fail("Article must include map caption");
if (!articleHtml.includes(apply.visible_credit)) fail("Article must include visible credit");
if (!articleHtml.includes("not to scale")) fail("Article must include schematic/not-to-scale note");

if (geoFinalisation.status !== "schematic_geo_access_object_finalised_no_real_map_claim") fail("Geo finalisation status mismatch");
if (geoFinalisation.no_invented_geography !== true) fail("Geo finalisation must record no invented geography");
if (geoFinalisation.external_geo_data_used !== false) fail("External geo data must be false");
if (geoFinalisation.real_map_used !== false) fail("Real map used must be false");
if (geoFinalisation.administrative_boundary_used !== false) fail("Administrative boundary used must be false");
if (!Array.isArray(geoFinalisation.geo_nodes) || geoFinalisation.geo_nodes.length !== 4) fail("Map object must have four schematic geo nodes");
if (!Array.isArray(geoFinalisation.geo_links) || geoFinalisation.geo_links.length !== 4) fail("Map object must have four schematic geo links");

if (asset.status !== "controlled_schematic_map_geographic_asset_created") fail("Asset record status mismatch");
if (asset.asset_hash_sha256 !== assetHash) if (!ag11fControlledMapInsertionAllowsPostMutation()) if (!ag11gControlledCompositeInsertionAllowsPostMutation()) if (!ag12cControlledLayoutRefinementAllowsPostMutation()) fail("Asset record hash mismatch or AG11F controlled map/geographic-object post-insertion record explains the later approved article state or AG11G controlled article-support composite post-insertion record explains the later approved article state or AG12C controlled layout-refinement post-apply record explains the later approved article state");
if (asset.asset_type !== "internal_svg_schematic_geographic_access_object") fail("Map/geographic asset type mismatch");
if (!assetText.includes("Schematic geographic access pathway")) fail("SVG must include map title");
if (!assetText.includes("Remote user area")) fail("SVG must include schematic node label");
if (!assetText.includes("not to scale")) fail("SVG must include not-to-scale note");

if (placement.status !== "map_geographic_object_placement_tuned") fail("Placement tuning status mismatch");
if (placement.placement_decision.alignment !== "center") fail("Map alignment must be center");
if (placement.placement_decision.max_width !== "940px") fail("Map max width must be 940px");
if (placement.placement_decision.title_present !== true) fail("Title must be present");
if (placement.placement_decision.schematic_note_present !== true) fail("Schematic note must be present");
if (placement.placement_decision.node_labels_present !== true) fail("Node labels must be present");
if (placement.placement_decision.route_direction_present !== true) fail("Route direction must be present");
if (placement.placement_decision.caption_present !== true) fail("Caption must be present");
if (placement.placement_decision.credit_present !== true) fail("Credit must be present");
if (placement.map_rules.schematic_only !== true) fail("Map rules must be schematic only");
if (placement.map_rules.no_boundary_claim !== true) fail("Map rules must block boundary claim");

if (audit.status !== "map_geographic_object_post_insertion_audit_passed") fail("Audit status mismatch");
if (!Array.isArray(audit.checks) || audit.checks.length !== 6) fail("Audit must have six checks");
if (audit.failed_checks.length !== 0) fail("Audit failed checks must be zero");

if (closure.status !== "map_geographic_object_controlled_cycle_closed_reuse_handoff_recorded") fail("Closure status mismatch");
if (closure.ready_for_ag11g !== true) fail("Closure must be ready for AG11G");
if (!closure.reusable_intelligence?.placement_logic) fail("Closure must preserve placement logic");
if (!closure.reusable_intelligence?.geo_node_link_pattern) fail("Closure must preserve geo node/link pattern");
if (closure.publishing_ready !== false) fail("Closure must keep publishing blocked");

if (readiness.status !== "map_geographic_object_cycle_closed_ready_for_ag11g") fail("Readiness status mismatch");
if (readiness.map_geographic_object_inserted !== true) fail("Readiness must confirm map/geographic object inserted");
if (readiness.map_geographic_object_audited !== true) fail("Readiness must confirm map/geographic object audited");
if (readiness.placement_tuned !== true) fail("Readiness must confirm placement tuned");
if (readiness.ready_for_ag11g !== true) fail("Readiness must be ready for AG11G");
if (readiness.publishing_ready !== false) fail("Publishing must remain blocked");
if (readiness.backend_activation_ready !== false) fail("Backend must remain blocked");
if (readiness.supabase_activation_ready !== false) fail("Supabase must remain blocked");

if (boundary.status !== "ag11g_boundary_created_not_started") fail("AG11G boundary status mismatch");
if (boundary.next_stage_id !== "AG11G") fail("AG11G handoff missing");
if (boundary.explicit_approval_required !== true) fail("AG11G must require explicit approval");

if (schema.status !== "schema_map_geographic_object_controlled_cycle") fail("Schema status mismatch");
for (const key of [
  "geo_location_finalisation_allowed_in_ag11f",
  "controlled_map_geographic_object_creation_allowed_in_ag11f",
  "map_geographic_object_article_insertion_allowed_in_ag11f",
  "placement_tuning_allowed_in_ag11f",
  "post_insertion_audit_allowed_in_ag11f",
  "closure_reuse_handoff_allowed_in_ag11f",
  "ag11g_boundary_allowed_in_ag11f"
]) {
  if (schema[key] !== true) fail(`Schema must allow ${key}`);
}

for (const key of [
  "invented_geography_allowed_in_ag11f",
  "real_administrative_boundary_claim_allowed_in_ag11f",
  "source_backed_map_claim_allowed_in_ag11f",
  "external_geo_data_fetch_allowed_in_ag11f",
  "uncontrolled_map_generation_allowed_in_ag11f",
  "reference_url_change_allowed_in_ag11f",
  "homepage_mutation_allowed_in_ag11f",
  "css_js_mutation_allowed_in_ag11f",
  "database_write_allowed_in_ag11f",
  "supabase_write_allowed_in_ag11f",
  "backend_auth_supabase_activation_allowed_in_ag11f",
  "public_publishing_operation_allowed_in_ag11f"
]) {
  if (schema[key] !== false) fail(`Schema must block ${key}`);
}

for (const obj of [geoFinalisation, asset, placement, apply, audit, closure, readiness, boundary, schema, review, learning, registry, preview]) {
  if (obj.map_geographic_object_controlled_cycle_only !== true) fail(`${obj.title || "object"} must be AG11F-only`);
  if (obj.five_step_compact_cycle_executed !== true) fail(`${obj.title || "object"} must record five-step cycle`);
  if (obj.invented_geography_used_in_ag11f !== false) fail(`${obj.title || "object"} must not use invented geography`);
  if (obj.real_administrative_boundary_claim_made_in_ag11f !== false) fail(`${obj.title || "object"} must not make boundary claim`);
  if (obj.source_backed_map_claim_made_in_ag11f !== false) fail(`${obj.title || "object"} must not make source-backed map claim`);
  if (obj.external_geo_data_fetch_performed_in_ag11f !== false) fail(`${obj.title || "object"} must not fetch external geo data`);
  if (obj.css_file_mutation_performed_in_ag11f !== false) fail(`${obj.title || "object"} must not mutate CSS`);
  if (obj.js_file_mutation_performed_in_ag11f !== false) fail(`${obj.title || "object"} must not mutate JS`);
  if (obj.backend_auth_supabase_activation_performed_in_ag11f !== false) fail(`${obj.title || "object"} must not activate backend/Auth/Supabase`);
  if (obj.public_publishing_operation_performed_in_ag11f !== false) fail(`${obj.title || "object"} must not publish`);
}

for (const phrase of ["Purpose", "Map Object Created", "Placement and Fine-Tuning", "Integrity Boundary", "Boundaries", "Next Stage"]) {
  if (!docText.includes(phrase)) fail(`AG11F document missing phrase: ${phrase}`);
}

for (const scriptName of ["generate:ag11f", "validate:ag11f"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

if (!pkg.scripts?.["validate:project"]?.includes("npm run validate:ag11f")) {
  fail("validate:project must include validate:ag11f");
}

pass("AG11F registry is present.");
pass("AG11F document is present.");
pass("AG11F geo finalisation, schematic map asset, placement tuning, apply record, audit report, closure, readiness, AG11G boundary, schema, learning and preview are present.");
pass("AG11E boundary and AG10G map/geographic doctrine are consumed.");
pass("Article started from AG11E post-insertion hash and now matches AG11F post-insertion hash.");
pass("Map/geographic object is schematic only with no invented geography and no real map/boundary claim.");
pass("Controlled SVG schematic map asset is created and hash-verified.");
pass("Map/geographic object is inserted with title, schematic note, node labels, route direction, caption and visible credit.");
pass("Placement tuning records location, size, alignment, schematic note, labels, route direction, caption, credit and mobile behavior.");
pass("Post-insertion audit passed with zero failed checks.");
pass("Map/geographic object cycle is closed with reusable schematic template and placement logic.");
pass("Publishing, backend and Supabase activation remain blocked.");
pass("No external geo data fetch, CSS/JS mutation, backend activation or publishing operation is performed.");
pass("AG11G article-support composite object controlled cycle boundary is created with explicit approval required.");
pass("AG11F is Map / Geographic Object Controlled Cycle only.");
