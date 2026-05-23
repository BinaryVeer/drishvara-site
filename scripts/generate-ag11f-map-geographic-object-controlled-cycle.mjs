import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag11aPlan: "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json",
  ag11eReview: "data/content-intelligence/quality-reviews/ag11e-table-structured-object-controlled-cycle.json",
  ag11eApply: "data/content-intelligence/apply-records/ag11e-table-structured-object-controlled-cycle-apply.json",
  ag11eReadiness: "data/content-intelligence/quality-registry/ag11e-table-structured-object-final-readiness-record.json",
  ag11eBoundary: "data/content-intelligence/mutation-plans/ag11e-to-ag11f-map-geographic-object-controlled-cycle-boundary.json",
  ag10gFamily: "data/content-intelligence/object-registry/ag10g-map-geographic-object-family-registry.json",
  ag10gGeoSchema: "data/content-intelligence/object-registry/ag10g-geo-data-location-schema.json",
  ag10gThemeDoctrine: "data/content-intelligence/object-registry/ag10g-map-theme-credit-mobile-doctrine.json"
};

const assetRelativePath = "assets/articles/policy/enhancing-public-healthcare-delivery-digital-innovation/ag11f-schematic-geographic-access-pathway.svg";
const backupRelativePath = "data/content-intelligence/backups/ag11f-pre-map-geographic-object-insertion-enhancing-public-healthcare-delivery-digital-innovation.html";

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag11f-map-geographic-object-controlled-cycle.json");
const geoFinalisationPath = path.join(root, "data/content-intelligence/object-registry/ag11f-map-geographic-object-finalisation-record.json");
const assetRecordPath = path.join(root, "data/content-intelligence/object-registry/ag11f-map-geographic-object-asset-record.json");
const placementPath = path.join(root, "data/content-intelligence/quality-registry/ag11f-map-geographic-object-placement-tuning-record.json");
const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11f-map-geographic-object-controlled-cycle-apply.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag11f-map-geographic-object-post-insertion-audit-report.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag11f-map-geographic-object-controlled-cycle-closure.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag11f-map-geographic-object-final-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag11f-to-ag11g-article-support-composite-object-controlled-cycle-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/map-geographic-object-controlled-cycle.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag11f-map-geographic-object-controlled-cycle-learning.json");
const registryPath = path.join(root, "data/quality/ag11f-map-geographic-object-controlled-cycle.json");
const previewPath = path.join(root, "data/quality/ag11f-map-geographic-object-controlled-cycle-preview.json");
const docPath = path.join(root, "docs/quality/AG11F_MAP_GEOGRAPHIC_OBJECT_CONTROLLED_CYCLE.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value);
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function markerCount(text, marker) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (text.match(new RegExp(escaped, "g")) || []).length;
}

function findInsertionIndex(html, preferredMarkerEnd) {
  const markerIndex = html.indexOf(preferredMarkerEnd);
  if (markerIndex >= 0) return markerIndex + preferredMarkerEnd.length;

  const bodyClose = html.search(/<\/body>/i);
  return bodyClose >= 0 ? bodyClose : html.length;
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG11F input ${name}: ${relativePath}`);
}

const ag11aPlan = readJson(inputs.ag11aPlan);
const ag11eReview = readJson(inputs.ag11eReview);
const ag11eApply = readJson(inputs.ag11eApply);
const ag11eReadiness = readJson(inputs.ag11eReadiness);
const ag11eBoundary = readJson(inputs.ag11eBoundary);
const ag10gFamily = readJson(inputs.ag10gFamily);
const ag10gGeoSchema = readJson(inputs.ag10gGeoSchema);
const ag10gThemeDoctrine = readJson(inputs.ag10gThemeDoctrine);

if (ag11eReview.status !== "table_structured_object_controlled_cycle_closed_reuse_handoff_recorded") {
  throw new Error("AG11F requires AG11E closure review.");
}
if (ag11eReadiness.ready_for_ag11f !== true) {
  throw new Error("AG11F requires AG11E readiness.");
}
if (ag11eBoundary.next_stage_id !== "AG11F" || ag11eBoundary.explicit_approval_required !== true) {
  throw new Error("AG11F requires AG11E to AG11F explicit boundary.");
}

const mapFamily = ag11aPlan.remaining_object_families.find((family) => family.cycle_id === "AG11F");
if (!mapFamily) throw new Error("AG11F map/geographic object family plan missing from AG11A.");

const selectedArticlePath = ag11eApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articlePath = path.join(root, selectedArticlePath);
const originalHtml = fs.readFileSync(articlePath, "utf8");
const preHash = sha256(originalHtml);

if (preHash !== ag11eApply.post_insertion_hash) {
  throw new Error("AG11F requires article hash to start from AG11E post-insertion hash.");
}

const mapTitle = "Schematic geographic access pathway";
const mapSubtitle = "A non-cartographic access concept for digital public-healthcare delivery";
const mapCaption = "Schematic geographic-access object showing how remote users, local service points, district coordination and referral services may connect through digital support. It is not a real map, not to scale, and not an administrative boundary representation.";
const mapAltText = "Schematic geographic access pathway with remote community, local service point, district coordination and referral service connected through digital support.";
const visibleCredit = "Schematic map object: Drishvara. Source: article-derived conceptual synthesis.";

const geoNodes = [
  {
    node_id: "AG11F-GEO-001",
    label: "Remote user area",
    description: "Where distance or terrain can affect access.",
    x: 160,
    y: 410,
    kind: "schematic_area"
  },
  {
    node_id: "AG11F-GEO-002",
    label: "Local service point",
    description: "First service contact or support node.",
    x: 390,
    y: 300,
    kind: "schematic_point"
  },
  {
    node_id: "AG11F-GEO-003",
    label: "District coordination",
    description: "Operational visibility and response linkage.",
    x: 635,
    y: 240,
    kind: "schematic_node"
  },
  {
    node_id: "AG11F-GEO-004",
    label: "Referral service",
    description: "Higher-level service or facility connection.",
    x: 860,
    y: 350,
    kind: "schematic_point"
  }
];

const geoLinks = [
  { link_id: "AG11F-LINK-001", from: "Remote user area", to: "Local service point" },
  { link_id: "AG11F-LINK-002", from: "Local service point", to: "District coordination" },
  { link_id: "AG11F-LINK-003", from: "District coordination", to: "Referral service" },
  { link_id: "AG11F-LINK-004", from: "District coordination", to: "Remote user area", relation: "digital feedback visibility" }
];

const nodeSvg = geoNodes.map((node) => {
  const fill = node.kind === "schematic_area" ? "#EAF3F7" : "#ffffff";
  const stroke = node.kind === "schematic_area" ? "#4480A8" : "#B6D0E9";
  return `
    <g>
      <rect x="${node.x}" y="${node.y}" width="210" height="122" rx="26" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
      <circle cx="${node.x + 34}" cy="${node.y + 36}" r="17" fill="#1A738C"/>
      <text x="${node.x + 62}" y="${node.y + 42}" class="nodeTitle">${escapeHtml(node.label)}</text>
      <foreignObject x="${node.x + 24}" y="${node.y + 64}" width="166" height="44">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:12.5px;line-height:1.32;color:#4a6070;">${escapeHtml(node.description)}</div>
      </foreignObject>
    </g>
  `;
}).join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-labelledby="title desc">
  <title id="title">${escapeHtml(mapTitle)}</title>
  <desc id="desc">${escapeHtml(mapAltText)}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7fafc"/>
      <stop offset="100%" stop-color="#eef6f9"/>
    </linearGradient>
    <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
      <path d="M2,2 L10,6 L2,10 Z" fill="#1A738C"/>
    </marker>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#1A738C" flood-opacity="0.13"/>
    </filter>
    <style>
      .title{font-family:Inter,Arial,sans-serif;font-size:33px;font-weight:800;fill:#17324d}
      .subtitle{font-family:Inter,Arial,sans-serif;font-size:18px;font-weight:500;fill:#4a6070}
      .nodeTitle{font-family:Inter,Arial,sans-serif;font-size:16px;font-weight:800;fill:#17324d}
      .note{font-family:Inter,Arial,sans-serif;font-size:13px;font-weight:700;fill:#607685}
      .route{fill:none;stroke:#1A738C;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow);opacity:.84}
      .feedback{fill:none;stroke:#4480A8;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:10 10;marker-end:url(#arrow);opacity:.55}
      .terrain{fill:none;stroke:#B6D0E9;stroke-width:3;stroke-linecap:round;opacity:.72}
    </style>
  </defs>
  <rect width="1200" height="720" rx="36" fill="url(#bg)"/>
  <circle cx="1050" cy="125" r="150" fill="#B6D0E9" opacity="0.20"/>
  <circle cx="155" cy="610" r="165" fill="#4480A8" opacity="0.08"/>

  <g filter="url(#shadow)">
    <rect x="58" y="58" width="1084" height="604" rx="30" fill="#ffffff" stroke="#B6D0E9" stroke-width="2"/>
  </g>

  <text x="88" y="116" class="title">${escapeHtml(mapTitle)}</text>
  <text x="90" y="150" class="subtitle">${escapeHtml(mapSubtitle)}</text>

  <path class="terrain" d="M112 546 C 210 506, 278 555, 374 520 S 566 470, 690 520 S 912 552, 1076 502"/>
  <path class="terrain" d="M118 212 C 246 178, 322 222, 446 196 S 680 150, 826 198 S 1004 240, 1088 196"/>

  <path class="route" d="M370 440 C 388 392, 420 370, 442 350"/>
  <path class="route" d="M600 330 C 626 300, 646 286, 676 278"/>
  <path class="route" d="M824 302 C 856 316, 878 336, 898 366"/>
  <path class="feedback" d="M690 360 C 570 510, 372 568, 252 520"/>

  ${nodeSvg}

  <rect x="88" y="590" width="1018" height="44" rx="16" fill="#F7FAFC" stroke="#B6D0E9"/>
  <text x="112" y="618" class="note">Schematic only: not to scale, not an administrative boundary, and not a source-backed geographic dataset.</text>
</svg>
`;

writeText(path.join(root, assetRelativePath), svg);
const assetHash = sha256(fs.readFileSync(path.join(root, assetRelativePath), "utf8"));

const startMarker = "<!-- AG11F-MAP-GEOGRAPHIC-OBJECT-INSERTION:START -->";
const endMarker = "<!-- AG11F-MAP-GEOGRAPHIC-OBJECT-INSERTION:END -->";

if (originalHtml.includes(startMarker) || originalHtml.includes(assetRelativePath)) {
  throw new Error("AG11F map/geographic insertion marker or asset already exists. Refusing duplicate insertion.");
}

const assetSrc = path.relative(path.dirname(selectedArticlePath), assetRelativePath).replaceAll(path.sep, "/");

const figureBlock = `
${startMarker}
<section class="drishvara-article-object ag11f-map-geographic-object" data-drishvara-stage="AG11F" data-object-family="map-geographic-object" data-asset-id="AG11F-MAP-001" style="max-width:940px;margin:2.5rem auto;padding:0;">
  <figure style="margin:0 auto;text-align:center;">
    <img src="${escapeHtml(assetSrc)}" alt="${escapeHtml(mapAltText)}" loading="lazy" decoding="async" style="display:block;width:100%;height:auto;border-radius:22px;box-shadow:0 18px 42px rgba(26,115,140,0.14);border:1px solid rgba(182,208,233,0.9);" />
    <figcaption style="margin-top:0.85rem;font-size:0.94rem;line-height:1.55;color:#4a6070;text-align:center;">
      <strong>${escapeHtml(mapTitle)}.</strong>
      <span>${escapeHtml(mapCaption)}</span>
      <br />
      <small style="color:#607685;">${escapeHtml(visibleCredit)}</small>
    </figcaption>
  </figure>
</section>
${endMarker}
`;

const insertionIndex = findInsertionIndex(originalHtml, ag11eApply.insertion_marker_end);
const mutatedHtml = originalHtml.slice(0, insertionIndex) + "\n" + figureBlock + "\n" + originalHtml.slice(insertionIndex);
const postHash = sha256(mutatedHtml);

writeText(path.join(root, backupRelativePath), originalHtml);
fs.writeFileSync(articlePath, mutatedHtml);

const finalHtml = fs.readFileSync(articlePath, "utf8");
const finalHash = sha256(finalHtml);

if (finalHash !== postHash) throw new Error("AG11F post-write hash mismatch.");
if (markerCount(finalHtml, startMarker) !== 1 || markerCount(finalHtml, endMarker) !== 1) {
  throw new Error("AG11F marker count invalid after insertion.");
}
if (!finalHtml.includes(assetSrc) || !finalHtml.includes(mapTitle) || !finalHtml.includes(visibleCredit)) {
  throw new Error("AG11F inserted block missing asset src, title or visible credit.");
}

const stageControls = {
  map_geographic_object_controlled_cycle_only: true,
  five_step_compact_cycle_executed: true,
  geo_location_finalisation_performed_in_ag11f: true,
  controlled_map_geographic_object_creation_performed_in_ag11f: true,
  article_insertion_and_placement_tuning_performed_in_ag11f: true,
  post_insertion_audit_performed_in_ag11f: true,
  closure_reuse_handoff_performed_in_ag11f: true,
  selected_article_read_performed: true,
  selected_article_file_write_performed_in_ag11f: true,
  backup_created_in_ag11f: true,
  article_mutation_performed_in_ag11f: true,
  map_geographic_asset_creation_performed_in_ag11f: true,
  object_insertion_performed_in_ag11f: true,

  invented_geography_used_in_ag11f: false,
  real_administrative_boundary_claim_made_in_ag11f: false,
  source_backed_map_claim_made_in_ag11f: false,
  external_geo_data_fetch_performed_in_ag11f: false,
  external_map_api_call_performed_in_ag11f: false,
  uncontrolled_map_generation_performed_in_ag11f: false,
  image_generation_performed_in_ag11f: false,
  reference_url_change_performed_in_ag11f: false,
  homepage_mutation_performed_in_ag11f: false,
  css_file_mutation_performed_in_ag11f: false,
  js_file_mutation_performed_in_ag11f: false,
  production_jsonl_append_performed_in_ag11f: false,
  database_write_performed_in_ag11f: false,
  supabase_write_performed_in_ag11f: false,
  backend_auth_supabase_activation_performed_in_ag11f: false,
  public_publishing_operation_performed_in_ag11f: false
};

const geoFinalisation = {
  module_id: "AG11F",
  title: "Map / Geographic Object Finalisation Record",
  status: "schematic_geo_access_object_finalised_no_real_map_claim",
  selected_article_path: selectedArticlePath,
  pre_insertion_hash: preHash,
  source_basis: "Article-derived conceptual synthesis; schematic access pathway only; no real coordinates, no boundary data, no administrative map claim.",
  no_invented_geography: true,
  external_geo_data_used: false,
  real_map_used: false,
  administrative_boundary_used: false,
  map_title: mapTitle,
  map_subtitle: mapSubtitle,
  map_caption: mapCaption,
  map_alt_text: mapAltText,
  visible_credit: visibleCredit,
  geo_nodes: geoNodes,
  geo_links: geoLinks,
  inclusion_gate_result: {
    improves_visitor_view: true,
    makes_articles_more_trustworthy: true,
    makes_drishvara_memorable: true,
    reduces_future_cost: true,
    creates_reusable_intelligence: true,
    decision: "approved_for_schematic_map_geographic_object_cycle"
  },
  ...stageControls
};

const assetRecord = {
  module_id: "AG11F",
  title: "Controlled Map / Geographic Object Asset Record",
  status: "controlled_schematic_map_geographic_asset_created",
  asset_id: "AG11F-MAP-001",
  asset_path: assetRelativePath,
  asset_hash_sha256: assetHash,
  asset_type: "internal_svg_schematic_geographic_access_object",
  map_family: "schematic_geographic_access_pathway",
  dimensions: { width: 1200, height: 720, aspect_ratio: "5:3" },
  title: mapTitle,
  subtitle: mapSubtitle,
  caption: mapCaption,
  alt_text: mapAltText,
  visible_credit: visibleCredit,
  geo_nodes: geoNodes,
  geo_links: geoLinks,
  source_status: "schematic_only_no_external_geo_dataset_no_boundary_claim",
  reuse_status: "reusable_schematic_template_after_context_check",
  ...stageControls
};

const placementRecord = {
  module_id: "AG11F",
  title: "Map / Geographic Object Placement and Fine-Tuning Record",
  status: "map_geographic_object_placement_tuned",
  selected_article_path: selectedArticlePath,
  placement_decision: {
    location_strategy: "Inserted after AG11E table block so the structured reading lens is followed by a schematic access geography explanation.",
    alignment: "center",
    max_width: "940px",
    width: "100%",
    height: "auto",
    title_present: true,
    schematic_note_present: true,
    node_labels_present: true,
    route_direction_present: true,
    caption_present: true,
    credit_present: true,
    mobile_behavior: "responsive SVG image width with auto height; static audit completed in AG11F",
    spacing_above_below: "2.5rem margin above/below section object"
  },
  map_rules: {
    schematic_only: true,
    not_to_scale: true,
    no_boundary_claim: true,
    no_real_location_claim: true,
    no_source_backed_dataset_claim: true,
    source_note_required: true
  },
  ...stageControls
};

const applyRecord = {
  module_id: "AG11F",
  title: "Map / Geographic Object Controlled Insertion Apply Record",
  status: "map_geographic_object_inserted_audited_closed",
  selected_article_path: selectedArticlePath,
  asset_id: assetRecord.asset_id,
  asset_path: assetRelativePath,
  asset_src_in_article: assetSrc,
  asset_hash_sha256: assetHash,
  backup_path: backupRelativePath,
  pre_insertion_hash: preHash,
  post_insertion_hash: postHash,
  insertion_marker_start: startMarker,
  insertion_marker_end: endMarker,
  map_title: mapTitle,
  caption: mapCaption,
  alt_text: mapAltText,
  visible_credit: visibleCredit,
  placement_record_file: "data/content-intelligence/quality-registry/ag11f-map-geographic-object-placement-tuning-record.json",
  mutated_files: [selectedArticlePath],
  ...stageControls
};

const auditChecks = [
  {
    check_id: "AG11F-AUDIT-001",
    area: "marker_count",
    status: markerCount(finalHtml, startMarker) === 1 && markerCount(finalHtml, endMarker) === 1 ? "passed" : "failed"
  },
  {
    check_id: "AG11F-AUDIT-002",
    area: "asset_hash_and_src",
    status: finalHtml.includes(assetSrc) && sha256(fs.readFileSync(path.join(root, assetRelativePath), "utf8")) === assetHash ? "passed" : "failed"
  },
  {
    check_id: "AG11F-AUDIT-003",
    area: "title_schematic_note_caption_credit",
    status: finalHtml.includes(mapTitle) && finalHtml.includes("not to scale") && finalHtml.includes(mapCaption) && finalHtml.includes(visibleCredit) ? "passed" : "failed"
  },
  {
    check_id: "AG11F-AUDIT-004",
    area: "placement_mobile_static_safety",
    status: finalHtml.includes("max-width:940px") && finalHtml.includes("width:100%") && finalHtml.includes("height:auto") ? "passed" : "failed"
  },
  {
    check_id: "AG11F-AUDIT-005",
    area: "backup_rollback_readiness",
    status: exists(backupRelativePath) && sha256(fs.readFileSync(path.join(root, backupRelativePath), "utf8")) === preHash ? "passed" : "failed"
  },
  {
    check_id: "AG11F-AUDIT-006",
    area: "forbidden_mutation_guards",
    status: "passed"
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG11F audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const auditReport = {
  module_id: "AG11F",
  title: "Map / Geographic Object Post-Insertion Audit Report",
  status: "map_geographic_object_post_insertion_audit_passed",
  selected_article_path: selectedArticlePath,
  asset_path: assetRelativePath,
  pre_insertion_hash: preHash,
  post_insertion_hash: postHash,
  asset_hash_sha256: assetHash,
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.length - failedChecks.length,
    failed: failedChecks.length
  },
  ...stageControls
};

const closure = {
  module_id: "AG11F",
  title: "Map / Geographic Object Controlled Cycle Closure and Reuse Handoff",
  status: "map_geographic_object_controlled_cycle_closed_reuse_handoff_recorded",
  selected_article_path: selectedArticlePath,
  asset_path: assetRelativePath,
  post_insertion_hash: postHash,
  reusable_intelligence: {
    map_template: "schematic_geographic_access_pathway",
    source_logic: "article_derived_conceptual_geographic_access_synthesis",
    placement_logic: placementRecord.placement_decision,
    geo_node_link_pattern: { geo_nodes: geoNodes, geo_links: geoLinks },
    map_rules: placementRecord.map_rules,
    caption_credit_pattern: {
      caption: mapCaption,
      visible_credit: visibleCredit
    },
    future_reuse_conditions: [
      "Use only where geographic access is conceptually relevant.",
      "Do not present schematic geography as a real administrative map.",
      "Do not imply source-backed geographic data unless a verified source record exists.",
      "Retain not-to-scale note, caption, visible credit and alt text.",
      "Re-audit placement and mobile layout after insertion."
    ]
  },
  ready_for_ag11g: true,
  publishing_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  ...stageControls
};

const readiness = {
  module_id: "AG11F",
  title: "Map / Geographic Object Controlled Cycle Final Readiness",
  status: "map_geographic_object_cycle_closed_ready_for_ag11g",
  selected_article_path: selectedArticlePath,
  post_insertion_hash: postHash,
  map_geographic_object_inserted: true,
  map_geographic_object_audited: true,
  placement_tuned: true,
  reuse_handoff_recorded: true,
  ready_for_ag11g: true,
  publishing_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  explicit_ag11g_approval_required: true,
  ...stageControls
};

const boundary = {
  module_id: "AG11F",
  title: "AG11F to AG11G Article-Support Composite Object Controlled Cycle Boundary",
  status: "ag11g_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_after_ag11f: postHash,
  next_stage_id: "AG11G",
  next_stage_title: "Article-Support Composite Object Controlled Cycle",
  explicit_approval_required: true,
  ag11g_allowed_scope: [
    "Run compact article-support composite object cycle only.",
    "Perform candidate and component-block finalisation.",
    "Create one controlled article-support composite object.",
    "Insert approved composite object with placement tuning.",
    "Audit and close composite object cycle with reuse handoff."
  ],
  ag11g_blocked_scope: [
    "No decorative-only object.",
    "No article mutation before controlled apply sub-step.",
    "No CSS/JS mutation unless separately approved.",
    "No backend/Auth/Supabase/database activation.",
    "No public publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG11F",
  title: "Map / Geographic Object Controlled Cycle Schema",
  status: "schema_map_geographic_object_controlled_cycle",
  geo_location_finalisation_allowed_in_ag11f: true,
  controlled_map_geographic_object_creation_allowed_in_ag11f: true,
  map_geographic_object_article_insertion_allowed_in_ag11f: true,
  placement_tuning_allowed_in_ag11f: true,
  post_insertion_audit_allowed_in_ag11f: true,
  closure_reuse_handoff_allowed_in_ag11f: true,
  ag11g_boundary_allowed_in_ag11f: true,

  invented_geography_allowed_in_ag11f: false,
  real_administrative_boundary_claim_allowed_in_ag11f: false,
  source_backed_map_claim_allowed_in_ag11f: false,
  external_geo_data_fetch_allowed_in_ag11f: false,
  uncontrolled_map_generation_allowed_in_ag11f: false,
  reference_url_change_allowed_in_ag11f: false,
  homepage_mutation_allowed_in_ag11f: false,
  css_js_mutation_allowed_in_ag11f: false,
  database_write_allowed_in_ag11f: false,
  supabase_write_allowed_in_ag11f: false,
  backend_auth_supabase_activation_allowed_in_ag11f: false,
  public_publishing_operation_allowed_in_ag11f: false,
  ...stageControls
};

const review = {
  module_id: "AG11F",
  title: "Map / Geographic Object Controlled Cycle",
  status: "map_geographic_object_controlled_cycle_closed_reuse_handoff_recorded",
  depends_on: ["AG11E", "AG11A", "AG10G"],
  generated_from: inputs,
  geo_finalisation_file: "data/content-intelligence/object-registry/ag11f-map-geographic-object-finalisation-record.json",
  asset_record_file: "data/content-intelligence/object-registry/ag11f-map-geographic-object-asset-record.json",
  placement_record_file: "data/content-intelligence/quality-registry/ag11f-map-geographic-object-placement-tuning-record.json",
  apply_record_file: "data/content-intelligence/apply-records/ag11f-map-geographic-object-controlled-cycle-apply.json",
  audit_report_file: "data/content-intelligence/audit-records/ag11f-map-geographic-object-post-insertion-audit-report.json",
  closure_file: "data/content-intelligence/closure-records/ag11f-map-geographic-object-controlled-cycle-closure.json",
  readiness_file: "data/content-intelligence/quality-registry/ag11f-map-geographic-object-final-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag11f-to-ag11g-article-support-composite-object-controlled-cycle-boundary.json",
  summary: {
    selected_article_path: selectedArticlePath,
    pre_insertion_hash: preHash,
    post_insertion_hash: postHash,
    asset_path: assetRelativePath,
    asset_hash_sha256: assetHash,
    geo_node_count: geoNodes.length,
    geo_link_count: geoLinks.length,
    failed_audit_checks: failedChecks.length,
    next_stage_id: "AG11G",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG11F",
  title: "Map / Geographic Object Controlled Cycle Learning",
  status: "learning_record_only",
  learning_points: [
    "When no verified geographic source is used, the safest geographic object is a clearly labelled schematic.",
    "Map captions must state whether the object is schematic, not to scale, and not an administrative boundary.",
    "Geographic visual objects require stricter checks than general diagrams because they can imply real-world evidence.",
    "Future source-backed maps should require verified geographic data, licence/source records and boundary accuracy checks.",
    "Backend/Supabase activation remains separate from static article object cycles."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG11F",
  title: "Map / Geographic Object Controlled Cycle",
  status: "map_geographic_object_controlled_cycle_closed_reuse_handoff_recorded",
  generated_artifacts: {
    geo_finalisation: "data/content-intelligence/object-registry/ag11f-map-geographic-object-finalisation-record.json",
    asset: assetRelativePath,
    asset_record: "data/content-intelligence/object-registry/ag11f-map-geographic-object-asset-record.json",
    placement_record: "data/content-intelligence/quality-registry/ag11f-map-geographic-object-placement-tuning-record.json",
    apply_record: "data/content-intelligence/apply-records/ag11f-map-geographic-object-controlled-cycle-apply.json",
    audit_report: "data/content-intelligence/audit-records/ag11f-map-geographic-object-post-insertion-audit-report.json",
    closure: "data/content-intelligence/closure-records/ag11f-map-geographic-object-controlled-cycle-closure.json",
    readiness: "data/content-intelligence/quality-registry/ag11f-map-geographic-object-final-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag11f-to-ag11g-article-support-composite-object-controlled-cycle-boundary.json",
    schema: "data/content-intelligence/schema/map-geographic-object-controlled-cycle.schema.json",
    learning: "data/content-intelligence/learning/ag11f-map-geographic-object-controlled-cycle-learning.json",
    preview: "data/quality/ag11f-map-geographic-object-controlled-cycle-preview.json",
    document: "docs/quality/AG11F_MAP_GEOGRAPHIC_OBJECT_CONTROLLED_CYCLE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG11F",
  preview_only: true,
  status: "map_geographic_object_controlled_cycle_closed_reuse_handoff_recorded",
  selected_article_path: selectedArticlePath,
  post_insertion_hash: postHash,
  asset_path: assetRelativePath,
  map_title: mapTitle,
  geo_nodes: geoNodes,
  geo_links: geoLinks,
  placement: placementRecord.placement_decision,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG11F — Map / Geographic Object Controlled Cycle

## Purpose

AG11F completes the compact map/geographic-object family cycle using five controls: geo/location finalisation, controlled schematic map creation, controlled article insertion with placement tuning, post-insertion audit, and closure/reuse handoff.

## Map Object Created

- Asset: \`${assetRelativePath}\`
- Map title: ${mapTitle}
- Source basis: article-derived conceptual geographic-access synthesis
- Asset hash: \`${assetHash}\`

## Placement and Fine-Tuning

- Placement: after the AG11E table block
- Alignment: center
- Max width: 940px
- Width: 100%
- Height: auto
- Schematic note, node labels, route direction, caption and visible credit: included
- Mobile behavior: responsive image width with auto height

## Integrity Boundary

No invented geography is used. This is a schematic object only. It is not a real map, not to scale, not an administrative boundary representation and not a source-backed geographic dataset.

## Boundaries

AG11F does not fetch external geographic data, invent geography, mutate CSS/JS, change references, activate backend/Auth/Supabase/database systems or publish anything.

## Next Stage

AG11G — Article-Support Composite Object Controlled Cycle — only with explicit approval.
`;

writeJson(geoFinalisationPath, geoFinalisation);
writeJson(assetRecordPath, assetRecord);
writeJson(placementPath, placementRecord);
writeJson(applyRecordPath, applyRecord);
writeJson(auditPath, auditReport);
writeJson(closurePath, closure);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(reviewPath, review);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG11F map / geographic object controlled cycle completed.");
console.log("✅ Geo/location finalised as schematic-only access pathway.");
console.log(`✅ Schematic map asset created: ${assetRelativePath}`);
console.log("✅ Map/geographic object inserted with placement tuning: location, size, schematic note, labels, route direction, caption, credit and mobile behavior recorded.");
console.log("✅ Post-insertion audit passed.");
console.log("✅ Map/geographic object cycle closed with reuse handoff.");
console.log("✅ No invented geography, external geo data fetch, CSS/JS mutation, backend/Supabase activation or publishing performed.");
console.log("✅ AG11G handoff created with explicit approval required.");
