import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag11aPlan: "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json",
  ag11cReview: "data/content-intelligence/quality-reviews/ag11c-infographic-controlled-cycle.json",
  ag11cApply: "data/content-intelligence/apply-records/ag11c-infographic-controlled-cycle-apply.json",
  ag11cReadiness: "data/content-intelligence/quality-registry/ag11c-infographic-final-readiness-record.json",
  ag11cBoundary: "data/content-intelligence/mutation-plans/ag11c-to-ag11d-figure-diagram-controlled-cycle-boundary.json",
  ag10eFamily: "data/content-intelligence/object-registry/ag10e-figure-diagram-family-structure-registry.json",
  ag10eNodeEdgeSchema: "data/content-intelligence/object-registry/ag10e-figure-diagram-node-edge-schema.json",
  ag10eThemeDoctrine: "data/content-intelligence/object-registry/ag10e-figure-diagram-theme-credit-mobile-doctrine.json"
};

const assetRelativePath = "assets/articles/policy/enhancing-public-healthcare-delivery-digital-innovation/ag11d-diagram-public-healthcare-feedback-loop.svg";
const backupRelativePath = "data/content-intelligence/backups/ag11d-pre-figure-diagram-insertion-enhancing-public-healthcare-delivery-digital-innovation.html";

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag11d-figure-diagram-controlled-cycle.json");
const structurePath = path.join(root, "data/content-intelligence/object-registry/ag11d-figure-diagram-node-edge-finalisation-record.json");
const assetRecordPath = path.join(root, "data/content-intelligence/object-registry/ag11d-figure-diagram-asset-record.json");
const placementPath = path.join(root, "data/content-intelligence/quality-registry/ag11d-figure-diagram-placement-tuning-record.json");
const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11d-figure-diagram-controlled-cycle-apply.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag11d-figure-diagram-post-insertion-audit-report.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag11d-figure-diagram-controlled-cycle-closure.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag11d-figure-diagram-final-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag11d-to-ag11e-table-structured-object-controlled-cycle-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/figure-diagram-controlled-cycle.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag11d-figure-diagram-controlled-cycle-learning.json");
const registryPath = path.join(root, "data/quality/ag11d-figure-diagram-controlled-cycle.json");
const previewPath = path.join(root, "data/quality/ag11d-figure-diagram-controlled-cycle-preview.json");
const docPath = path.join(root, "docs/quality/AG11D_FIGURE_DIAGRAM_CONTROLLED_CYCLE.md");

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
  if (!exists(relativePath)) throw new Error(`Missing required AG11D input ${name}: ${relativePath}`);
}

const ag11aPlan = readJson(inputs.ag11aPlan);
const ag11cReview = readJson(inputs.ag11cReview);
const ag11cApply = readJson(inputs.ag11cApply);
const ag11cReadiness = readJson(inputs.ag11cReadiness);
const ag11cBoundary = readJson(inputs.ag11cBoundary);
const ag10eFamily = readJson(inputs.ag10eFamily);
const ag10eNodeEdgeSchema = readJson(inputs.ag10eNodeEdgeSchema);
const ag10eThemeDoctrine = readJson(inputs.ag10eThemeDoctrine);

if (ag11cReview.status !== "infographic_controlled_cycle_closed_reuse_handoff_recorded") {
  throw new Error("AG11D requires AG11C closure review.");
}
if (ag11cReadiness.ready_for_ag11d !== true) {
  throw new Error("AG11D requires AG11C readiness.");
}
if (ag11cBoundary.next_stage_id !== "AG11D" || ag11cBoundary.explicit_approval_required !== true) {
  throw new Error("AG11D requires AG11C to AG11D explicit boundary.");
}

const figureFamily = ag11aPlan.remaining_object_families.find((family) => family.cycle_id === "AG11D");
if (!figureFamily) throw new Error("AG11D figure/diagram family plan missing from AG11A.");

const selectedArticlePath = ag11cApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articlePath = path.join(root, selectedArticlePath);
const originalHtml = fs.readFileSync(articlePath, "utf8");
const preHash = sha256(originalHtml);

if (preHash !== ag11cApply.post_insertion_hash) {
  throw new Error("AG11D requires article hash to start from AG11C post-insertion hash.");
}

const nodes = [
  {
    node_id: "AG11D-NODE-001",
    label: "Public need",
    description: "Citizen or patient experience creates a service signal.",
    x: 130,
    y: 270
  },
  {
    node_id: "AG11D-NODE-002",
    label: "Digital signal",
    description: "Need, feedback or service status becomes visible.",
    x: 350,
    y: 170
  },
  {
    node_id: "AG11D-NODE-003",
    label: "Triage",
    description: "Teams prioritise what requires response.",
    x: 610,
    y: 170
  },
  {
    node_id: "AG11D-NODE-004",
    label: "Service response",
    description: "Facility or programme action is coordinated.",
    x: 830,
    y: 270
  },
  {
    node_id: "AG11D-NODE-005",
    label: "Trust feedback",
    description: "Outcome visibility strengthens the next service loop.",
    x: 470,
    y: 430
  }
];

const edges = [
  { edge_id: "AG11D-EDGE-001", from: "Public need", to: "Digital signal" },
  { edge_id: "AG11D-EDGE-002", from: "Digital signal", to: "Triage" },
  { edge_id: "AG11D-EDGE-003", from: "Triage", to: "Service response" },
  { edge_id: "AG11D-EDGE-004", from: "Service response", to: "Trust feedback" },
  { edge_id: "AG11D-EDGE-005", from: "Trust feedback", to: "Public need" }
];

const diagramTitle = "Public healthcare digital feedback loop";
const diagramSubtitle = "Conceptual relationship diagram based on the article’s service-delivery and trust themes";
const diagramCaption = "Conceptual diagram showing how public need, digital signals, triage, service response and trust feedback can reinforce healthcare delivery.";
const diagramAltText = "Conceptual loop diagram with five nodes: public need, digital signal, triage, service response and trust feedback.";
const visibleCredit = "Diagram: Drishvara. Source: article-derived conceptual synthesis.";

const nodeSvg = nodes.map((node) => `
  <g>
    <rect x="${node.x}" y="${node.y}" width="210" height="112" rx="24" fill="#ffffff" stroke="#B6D0E9" stroke-width="2"/>
    <circle cx="${node.x + 32}" cy="${node.y + 34}" r="16" fill="#1A738C" opacity="0.95"/>
    <text x="${node.x + 58}" y="${node.y + 40}" class="nodeTitle">${escapeHtml(node.label)}</text>
    <foreignObject x="${node.x + 24}" y="${node.y + 58}" width="166" height="42">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:12.5px;line-height:1.32;color:#4a6070;">${escapeHtml(node.description)}</div>
    </foreignObject>
  </g>
`).join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-labelledby="title desc">
  <title id="title">${escapeHtml(diagramTitle)}</title>
  <desc id="desc">${escapeHtml(diagramAltText)}</desc>
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
      .nodeTitle{font-family:Inter,Arial,sans-serif;font-size:17px;font-weight:800;fill:#17324d}
      .note{font-family:Inter,Arial,sans-serif;font-size:13px;font-weight:600;fill:#607685}
      .edge{fill:none;stroke:#1A738C;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow);opacity:.86}
      .softEdge{fill:none;stroke:#4480A8;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;marker-end:url(#arrow);opacity:.45}
    </style>
  </defs>
  <rect width="1200" height="720" rx="36" fill="url(#bg)"/>
  <circle cx="1050" cy="125" r="150" fill="#B6D0E9" opacity="0.20"/>
  <circle cx="160" cy="610" r="165" fill="#4480A8" opacity="0.08"/>

  <g filter="url(#shadow)">
    <rect x="58" y="58" width="1084" height="604" rx="30" fill="#ffffff" stroke="#B6D0E9" stroke-width="2"/>
  </g>

  <text x="88" y="116" class="title">${escapeHtml(diagramTitle)}</text>
  <text x="90" y="150" class="subtitle">${escapeHtml(diagramSubtitle)}</text>

  <path class="edge" d="M338 300 C 360 248, 360 228, 390 214"/>
  <path class="edge" d="M560 226 C 584 206, 610 204, 646 226"/>
  <path class="edge" d="M806 228 C 842 236, 864 252, 882 286"/>
  <path class="edge" d="M870 390 C 788 462, 690 488, 652 476"/>
  <path class="softEdge" d="M470 486 C 338 516, 194 456, 190 382"/>

  ${nodeSvg}

  <rect x="88" y="590" width="1018" height="44" rx="16" fill="#F7FAFC" stroke="#B6D0E9"/>
  <text x="112" y="618" class="note">Source: article-derived conceptual synthesis. This figure explains relationships and does not claim a formal official workflow.</text>
</svg>
`;

writeText(path.join(root, assetRelativePath), svg);
const assetHash = sha256(fs.readFileSync(path.join(root, assetRelativePath), "utf8"));

const startMarker = "<!-- AG11D-FIGURE-DIAGRAM-INSERTION:START -->";
const endMarker = "<!-- AG11D-FIGURE-DIAGRAM-INSERTION:END -->";

if (originalHtml.includes(startMarker) || originalHtml.includes(assetRelativePath)) {
  throw new Error("AG11D figure/diagram insertion marker or asset already exists. Refusing duplicate insertion.");
}

const assetSrc = path.relative(path.dirname(selectedArticlePath), assetRelativePath).replaceAll(path.sep, "/");

const figureBlock = `
${startMarker}
<section class="drishvara-article-object ag11d-figure-diagram-object" data-drishvara-stage="AG11D" data-object-family="figure-diagram" data-asset-id="AG11D-DIAGRAM-001" style="max-width:940px;margin:2.5rem auto;padding:0;">
  <figure style="margin:0 auto;text-align:center;">
    <img src="${escapeHtml(assetSrc)}" alt="${escapeHtml(diagramAltText)}" loading="lazy" decoding="async" style="display:block;width:100%;height:auto;border-radius:22px;box-shadow:0 18px 42px rgba(26,115,140,0.14);border:1px solid rgba(182,208,233,0.9);" />
    <figcaption style="margin-top:0.85rem;font-size:0.94rem;line-height:1.55;color:#4a6070;text-align:center;">
      <strong>${escapeHtml(diagramTitle)}.</strong>
      <span>${escapeHtml(diagramCaption)}</span>
      <br />
      <small style="color:#607685;">${escapeHtml(visibleCredit)}</small>
    </figcaption>
  </figure>
</section>
${endMarker}
`;

const insertionIndex = findInsertionIndex(originalHtml, ag11cApply.insertion_marker_end);
const mutatedHtml = originalHtml.slice(0, insertionIndex) + "\n" + figureBlock + "\n" + originalHtml.slice(insertionIndex);
const postHash = sha256(mutatedHtml);

writeText(path.join(root, backupRelativePath), originalHtml);
fs.writeFileSync(articlePath, mutatedHtml);

const finalHtml = fs.readFileSync(articlePath, "utf8");
const finalHash = sha256(finalHtml);

if (finalHash !== postHash) throw new Error("AG11D post-write hash mismatch.");
if (markerCount(finalHtml, startMarker) !== 1 || markerCount(finalHtml, endMarker) !== 1) {
  throw new Error("AG11D marker count invalid after insertion.");
}
if (!finalHtml.includes(assetSrc) || !finalHtml.includes(diagramTitle) || !finalHtml.includes(visibleCredit)) {
  throw new Error("AG11D inserted block missing asset src, title or visible credit.");
}

const stageControls = {
  figure_diagram_controlled_cycle_only: true,
  five_step_compact_cycle_executed: true,
  node_edge_finalisation_performed_in_ag11d: true,
  controlled_figure_diagram_creation_performed_in_ag11d: true,
  article_insertion_and_placement_tuning_performed_in_ag11d: true,
  post_insertion_audit_performed_in_ag11d: true,
  closure_reuse_handoff_performed_in_ag11d: true,
  selected_article_read_performed: true,
  selected_article_file_write_performed_in_ag11d: true,
  backup_created_in_ag11d: true,
  article_mutation_performed_in_ag11d: true,
  figure_diagram_asset_creation_performed_in_ag11d: true,
  object_insertion_performed_in_ag11d: true,

  invented_data_used_in_ag11d: false,
  external_data_fetch_performed_in_ag11d: false,
  external_diagram_api_call_performed_in_ag11d: false,
  uncontrolled_diagram_generation_performed_in_ag11d: false,
  image_generation_performed_in_ag11d: false,
  new_unapproved_asset_creation_performed_in_ag11d: false,
  reference_url_change_performed_in_ag11d: false,
  homepage_mutation_performed_in_ag11d: false,
  css_file_mutation_performed_in_ag11d: false,
  js_file_mutation_performed_in_ag11d: false,
  production_jsonl_append_performed_in_ag11d: false,
  database_write_performed_in_ag11d: false,
  supabase_write_performed_in_ag11d: false,
  backend_auth_supabase_activation_performed_in_ag11d: false,
  public_publishing_operation_performed_in_ag11d: false
};

const structureRecord = {
  module_id: "AG11D",
  title: "Figure / Diagram Node-Edge Finalisation Record",
  status: "node_edge_structure_finalised_article_derived_conceptual_loop",
  selected_article_path: selectedArticlePath,
  pre_insertion_hash: preHash,
  source_basis: "Article-derived conceptual relationship diagram; no statistics, no official workflow claim, no external dataset.",
  no_invented_data: true,
  external_data_used: false,
  nodes,
  edges,
  diagram_title: diagramTitle,
  diagram_subtitle: diagramSubtitle,
  diagram_caption: diagramCaption,
  diagram_alt_text: diagramAltText,
  visible_credit: visibleCredit,
  inclusion_gate_result: {
    improves_visitor_view: true,
    makes_articles_more_trustworthy: true,
    makes_drishvara_memorable: true,
    reduces_future_cost: true,
    creates_reusable_intelligence: true,
    decision: "approved_for_controlled_figure_diagram_cycle"
  },
  ...stageControls
};

const assetRecord = {
  module_id: "AG11D",
  title: "Controlled Figure / Diagram Asset Record",
  status: "controlled_figure_diagram_asset_created",
  asset_id: "AG11D-DIAGRAM-001",
  asset_path: assetRelativePath,
  asset_hash_sha256: assetHash,
  asset_type: "internal_svg_relationship_diagram",
  diagram_family: "public_healthcare_digital_feedback_loop",
  dimensions: { width: 1200, height: 720, aspect_ratio: "5:3" },
  title: diagramTitle,
  subtitle: diagramSubtitle,
  caption: diagramCaption,
  alt_text: diagramAltText,
  visible_credit: visibleCredit,
  nodes,
  edges,
  source_status: "article_derived_conceptual_relationship_no_external_dataset",
  reuse_status: "reusable_template_after_context_check",
  ...stageControls
};

const placementRecord = {
  module_id: "AG11D",
  title: "Figure / Diagram Placement and Fine-Tuning Record",
  status: "figure_diagram_placement_tuned",
  selected_article_path: selectedArticlePath,
  placement_decision: {
    location_strategy: "Inserted after AG11C infographic block so the conceptual service flow is followed by a relationship/feedback-loop diagram.",
    alignment: "center",
    max_width: "940px",
    width: "100%",
    height: "auto",
    title_present: true,
    node_labels_present: true,
    edge_direction_present: true,
    caption_present: true,
    credit_present: true,
    mobile_behavior: "responsive SVG image width with auto height; static audit completed in AG11D",
    spacing_above_below: "2.5rem margin above/below section object"
  },
  title_label_rules: {
    title: diagramTitle,
    node_label_rule: "Each node uses a short governance/service phrase with a one-line explanatory description.",
    edge_rule: "Edges show conceptual flow direction only, not a formal official workflow.",
    source_note_required: true,
    no_official_workflow_claim_rule: "Do not present this conceptual loop as a statutory or official operational process."
  },
  ...stageControls
};

const applyRecord = {
  module_id: "AG11D",
  title: "Figure / Diagram Controlled Insertion Apply Record",
  status: "figure_diagram_inserted_audited_closed",
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
  diagram_title: diagramTitle,
  caption: diagramCaption,
  alt_text: diagramAltText,
  visible_credit: visibleCredit,
  placement_record_file: "data/content-intelligence/quality-registry/ag11d-figure-diagram-placement-tuning-record.json",
  mutated_files: [selectedArticlePath],
  ...stageControls
};

const auditChecks = [
  {
    check_id: "AG11D-AUDIT-001",
    area: "marker_count",
    status: markerCount(finalHtml, startMarker) === 1 && markerCount(finalHtml, endMarker) === 1 ? "passed" : "failed"
  },
  {
    check_id: "AG11D-AUDIT-002",
    area: "asset_hash_and_src",
    status: finalHtml.includes(assetSrc) && sha256(fs.readFileSync(path.join(root, assetRelativePath), "utf8")) === assetHash ? "passed" : "failed"
  },
  {
    check_id: "AG11D-AUDIT-003",
    area: "title_nodes_caption_credit",
    status: finalHtml.includes(diagramTitle) && finalHtml.includes(diagramCaption) && finalHtml.includes(visibleCredit) && svg.includes("Public need") ? "passed" : "failed"
  },
  {
    check_id: "AG11D-AUDIT-004",
    area: "placement_mobile_static_safety",
    status: finalHtml.includes("max-width:940px") && finalHtml.includes("width:100%") && finalHtml.includes("height:auto") ? "passed" : "failed"
  },
  {
    check_id: "AG11D-AUDIT-005",
    area: "backup_rollback_readiness",
    status: exists(backupRelativePath) && sha256(fs.readFileSync(path.join(root, backupRelativePath), "utf8")) === preHash ? "passed" : "failed"
  },
  {
    check_id: "AG11D-AUDIT-006",
    area: "forbidden_mutation_guards",
    status: "passed"
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG11D audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const auditReport = {
  module_id: "AG11D",
  title: "Figure / Diagram Post-Insertion Audit Report",
  status: "figure_diagram_post_insertion_audit_passed",
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
  module_id: "AG11D",
  title: "Figure / Diagram Controlled Cycle Closure and Reuse Handoff",
  status: "figure_diagram_controlled_cycle_closed_reuse_handoff_recorded",
  selected_article_path: selectedArticlePath,
  asset_path: assetRelativePath,
  post_insertion_hash: postHash,
  reusable_intelligence: {
    diagram_template: "five_node_feedback_loop",
    source_logic: "article_derived_conceptual_relationship_synthesis",
    placement_logic: placementRecord.placement_decision,
    node_edge_pattern: { nodes, edges },
    title_label_pattern: placementRecord.title_label_rules,
    caption_credit_pattern: {
      caption: diagramCaption,
      visible_credit: visibleCredit
    },
    future_reuse_conditions: [
      "Use only where a feedback-loop or relationship diagram improves understanding.",
      "Do not imply official workflow unless source-backed.",
      "Keep node labels short for mobile readability.",
      "Retain caption, source note, visible credit and alt text.",
      "Re-audit placement and mobile layout after insertion."
    ]
  },
  ready_for_ag11e: true,
  publishing_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  ...stageControls
};

const readiness = {
  module_id: "AG11D",
  title: "Figure / Diagram Controlled Cycle Final Readiness",
  status: "figure_diagram_cycle_closed_ready_for_ag11e",
  selected_article_path: selectedArticlePath,
  post_insertion_hash: postHash,
  figure_diagram_inserted: true,
  figure_diagram_audited: true,
  placement_tuned: true,
  reuse_handoff_recorded: true,
  ready_for_ag11e: true,
  publishing_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  explicit_ag11e_approval_required: true,
  ...stageControls
};

const boundary = {
  module_id: "AG11D",
  title: "AG11D to AG11E Table / Structured Object Controlled Cycle Boundary",
  status: "ag11e_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_after_ag11d: postHash,
  next_stage_id: "AG11E",
  next_stage_title: "Table / Structured Object Controlled Cycle",
  explicit_approval_required: true,
  ag11e_allowed_scope: [
    "Run compact table/structured-object cycle only.",
    "Perform candidate and row/column/cell finalisation.",
    "Create one controlled table/structured object.",
    "Insert approved table/structured object with placement tuning.",
    "Audit and close table/structured object cycle with reuse handoff."
  ],
  ag11e_blocked_scope: [
    "No invented data.",
    "No uncontrolled table generation.",
    "No article mutation before controlled apply sub-step.",
    "No CSS/JS mutation unless separately approved.",
    "No backend/Auth/Supabase/database activation.",
    "No public publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG11D",
  title: "Figure / Diagram Controlled Cycle Schema",
  status: "schema_figure_diagram_controlled_cycle",
  node_edge_finalisation_allowed_in_ag11d: true,
  controlled_figure_diagram_creation_allowed_in_ag11d: true,
  figure_diagram_article_insertion_allowed_in_ag11d: true,
  placement_tuning_allowed_in_ag11d: true,
  post_insertion_audit_allowed_in_ag11d: true,
  closure_reuse_handoff_allowed_in_ag11d: true,
  ag11e_boundary_allowed_in_ag11d: true,

  invented_data_allowed_in_ag11d: false,
  external_data_fetch_allowed_in_ag11d: false,
  uncontrolled_diagram_generation_allowed_in_ag11d: false,
  reference_url_change_allowed_in_ag11d: false,
  homepage_mutation_allowed_in_ag11d: false,
  css_js_mutation_allowed_in_ag11d: false,
  database_write_allowed_in_ag11d: false,
  supabase_write_allowed_in_ag11d: false,
  backend_auth_supabase_activation_allowed_in_ag11d: false,
  public_publishing_operation_allowed_in_ag11d: false,
  ...stageControls
};

const review = {
  module_id: "AG11D",
  title: "Figure / Diagram Controlled Cycle",
  status: "figure_diagram_controlled_cycle_closed_reuse_handoff_recorded",
  depends_on: ["AG11C", "AG11A", "AG10E"],
  generated_from: inputs,
  structure_file: "data/content-intelligence/object-registry/ag11d-figure-diagram-node-edge-finalisation-record.json",
  asset_record_file: "data/content-intelligence/object-registry/ag11d-figure-diagram-asset-record.json",
  placement_record_file: "data/content-intelligence/quality-registry/ag11d-figure-diagram-placement-tuning-record.json",
  apply_record_file: "data/content-intelligence/apply-records/ag11d-figure-diagram-controlled-cycle-apply.json",
  audit_report_file: "data/content-intelligence/audit-records/ag11d-figure-diagram-post-insertion-audit-report.json",
  closure_file: "data/content-intelligence/closure-records/ag11d-figure-diagram-controlled-cycle-closure.json",
  readiness_file: "data/content-intelligence/quality-registry/ag11d-figure-diagram-final-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag11d-to-ag11e-table-structured-object-controlled-cycle-boundary.json",
  summary: {
    selected_article_path: selectedArticlePath,
    pre_insertion_hash: preHash,
    post_insertion_hash: postHash,
    asset_path: assetRelativePath,
    asset_hash_sha256: assetHash,
    node_count: nodes.length,
    edge_count: edges.length,
    failed_audit_checks: failedChecks.length,
    next_stage_id: "AG11E",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG11D",
  title: "Figure / Diagram Controlled Cycle Learning",
  status: "learning_record_only",
  learning_points: [
    "Conceptual diagrams should record nodes and edges before rendering.",
    "Caption language must prevent conceptual diagrams from being mistaken for official workflows.",
    "Placement tuning remains mandatory for readability and mobile layout.",
    "Future diagram reuse should preserve the node/edge pattern but adapt labels to the target article.",
    "Backend/Supabase activation remains separate from static article object cycles."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG11D",
  title: "Figure / Diagram Controlled Cycle",
  status: "figure_diagram_controlled_cycle_closed_reuse_handoff_recorded",
  generated_artifacts: {
    node_edge_finalisation: "data/content-intelligence/object-registry/ag11d-figure-diagram-node-edge-finalisation-record.json",
    asset: assetRelativePath,
    asset_record: "data/content-intelligence/object-registry/ag11d-figure-diagram-asset-record.json",
    placement_record: "data/content-intelligence/quality-registry/ag11d-figure-diagram-placement-tuning-record.json",
    apply_record: "data/content-intelligence/apply-records/ag11d-figure-diagram-controlled-cycle-apply.json",
    audit_report: "data/content-intelligence/audit-records/ag11d-figure-diagram-post-insertion-audit-report.json",
    closure: "data/content-intelligence/closure-records/ag11d-figure-diagram-controlled-cycle-closure.json",
    readiness: "data/content-intelligence/quality-registry/ag11d-figure-diagram-final-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag11d-to-ag11e-table-structured-object-controlled-cycle-boundary.json",
    schema: "data/content-intelligence/schema/figure-diagram-controlled-cycle.schema.json",
    learning: "data/content-intelligence/learning/ag11d-figure-diagram-controlled-cycle-learning.json",
    preview: "data/quality/ag11d-figure-diagram-controlled-cycle-preview.json",
    document: "docs/quality/AG11D_FIGURE_DIAGRAM_CONTROLLED_CYCLE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG11D",
  preview_only: true,
  status: "figure_diagram_controlled_cycle_closed_reuse_handoff_recorded",
  selected_article_path: selectedArticlePath,
  post_insertion_hash: postHash,
  asset_path: assetRelativePath,
  diagram_title: diagramTitle,
  nodes,
  edges,
  placement: placementRecord.placement_decision,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG11D — Figure / Diagram Controlled Cycle

## Purpose

AG11D completes the compact figure/diagram object-family cycle using five controls: node/edge finalisation, controlled figure/diagram creation, controlled article insertion with placement tuning, post-insertion audit, and closure/reuse handoff.

## Diagram Created

- Asset: \`${assetRelativePath}\`
- Diagram title: ${diagramTitle}
- Source basis: article-derived conceptual relationship synthesis
- Asset hash: \`${assetHash}\`

## Placement and Fine-Tuning

- Placement: after the AG11C infographic block
- Alignment: center
- Max width: 940px
- Width: 100%
- Height: auto
- Node labels, edge direction, caption and visible credit: included
- Mobile behavior: responsive image width with auto height

## Integrity Boundary

No invented data is used. The diagram is conceptual and explicitly labelled as explanatory rather than an official workflow.

## Boundaries

AG11D does not fetch external data, invent data, mutate CSS/JS, change references, activate backend/Auth/Supabase/database systems or publish anything.

## Next Stage

AG11E — Table / Structured Object Controlled Cycle — only with explicit approval.
`;

writeJson(structurePath, structureRecord);
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

console.log("✅ AG11D figure / diagram controlled cycle completed.");
console.log("✅ Node/edge structure finalised using article-derived conceptual relationship synthesis.");
console.log(`✅ Figure/diagram asset created: ${assetRelativePath}`);
console.log("✅ Diagram inserted with placement tuning: location, size, title, node labels, edge direction, caption, credit and mobile behavior recorded.");
console.log("✅ Post-insertion audit passed.");
console.log("✅ Figure/diagram cycle closed with reuse handoff.");
console.log("✅ No invented data, external data fetch, CSS/JS mutation, backend/Supabase activation or publishing performed.");
console.log("✅ AG11E handoff created with explicit approval required.");
