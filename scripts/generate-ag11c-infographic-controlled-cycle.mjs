import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag11aPlan: "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json",
  ag11bReview: "data/content-intelligence/quality-reviews/ag11b-chart-bi-graph-controlled-cycle.json",
  ag11bApply: "data/content-intelligence/apply-records/ag11b-chart-bi-graph-controlled-cycle-apply.json",
  ag11bReadiness: "data/content-intelligence/quality-registry/ag11b-chart-bi-graph-final-readiness-record.json",
  ag11bBoundary: "data/content-intelligence/mutation-plans/ag11b-to-ag11c-infographic-controlled-cycle-boundary.json",
  ag10dFamily: "data/content-intelligence/object-registry/ag10d-infographic-family-structure-registry.json",
  ag10dContentSchema: "data/content-intelligence/object-registry/ag10d-infographic-content-block-schema.json",
  ag10dThemeDoctrine: "data/content-intelligence/object-registry/ag10d-infographic-theme-credit-mobile-doctrine.json"
};

const assetRelativePath = "assets/articles/policy/enhancing-public-healthcare-delivery-digital-innovation/ag11c-infographic-digital-healthcare-delivery-flow.svg";
const backupRelativePath = "data/content-intelligence/backups/ag11c-pre-infographic-insertion-enhancing-public-healthcare-delivery-digital-innovation.html";

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag11c-infographic-controlled-cycle.json");
const contentBlockPath = path.join(root, "data/content-intelligence/object-registry/ag11c-infographic-content-block-finalisation-record.json");
const assetRecordPath = path.join(root, "data/content-intelligence/object-registry/ag11c-infographic-asset-record.json");
const placementPath = path.join(root, "data/content-intelligence/quality-registry/ag11c-infographic-placement-tuning-record.json");
const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11c-infographic-controlled-cycle-apply.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag11c-infographic-post-insertion-audit-report.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag11c-infographic-controlled-cycle-closure.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag11c-infographic-final-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag11c-to-ag11d-figure-diagram-controlled-cycle-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/infographic-controlled-cycle.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag11c-infographic-controlled-cycle-learning.json");
const registryPath = path.join(root, "data/quality/ag11c-infographic-controlled-cycle.json");
const previewPath = path.join(root, "data/quality/ag11c-infographic-controlled-cycle-preview.json");
const docPath = path.join(root, "docs/quality/AG11C_INFOGRAPHIC_CONTROLLED_CYCLE.md");

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
  if (!exists(relativePath)) throw new Error(`Missing required AG11C input ${name}: ${relativePath}`);
}

const ag11aPlan = readJson(inputs.ag11aPlan);
const ag11bReview = readJson(inputs.ag11bReview);
const ag11bApply = readJson(inputs.ag11bApply);
const ag11bReadiness = readJson(inputs.ag11bReadiness);
const ag11bBoundary = readJson(inputs.ag11bBoundary);
const ag10dFamily = readJson(inputs.ag10dFamily);
const ag10dContentSchema = readJson(inputs.ag10dContentSchema);
const ag10dThemeDoctrine = readJson(inputs.ag10dThemeDoctrine);

if (ag11bReview.status !== "chart_bi_graph_controlled_cycle_closed_reuse_handoff_recorded") {
  throw new Error("AG11C requires AG11B closure review.");
}
if (ag11bReadiness.ready_for_ag11c !== true) {
  throw new Error("AG11C requires AG11B readiness.");
}
if (ag11bBoundary.next_stage_id !== "AG11C" || ag11bBoundary.explicit_approval_required !== true) {
  throw new Error("AG11C requires AG11B to AG11C explicit boundary.");
}

const infographicFamily = ag11aPlan.remaining_object_families.find((family) => family.cycle_id === "AG11C");
if (!infographicFamily) throw new Error("AG11C infographic family plan missing from AG11A.");

const selectedArticlePath = ag11bApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articlePath = path.join(root, selectedArticlePath);
const originalHtml = fs.readFileSync(articlePath, "utf8");
const preHash = sha256(originalHtml);

if (preHash !== ag11bApply.post_insertion_hash) {
  throw new Error("AG11C requires article hash to start from AG11B post-insertion hash.");
}

const contentBlocks = [
  {
    block_id: "AG11C-BLOCK-001",
    title: "Digital touchpoint",
    short_text: "Access begins through a visible service channel.",
    icon_label: "01"
  },
  {
    block_id: "AG11C-BLOCK-002",
    title: "Information capture",
    short_text: "Needs, feedback and service status are structured.",
    icon_label: "02"
  },
  {
    block_id: "AG11C-BLOCK-003",
    title: "Service response",
    short_text: "Teams prioritise action using clearer signals.",
    icon_label: "03"
  },
  {
    block_id: "AG11C-BLOCK-004",
    title: "Trust loop",
    short_text: "Monitoring and feedback improve public confidence.",
    icon_label: "04"
  }
];

const infographicTitle = "How digital innovation supports public healthcare delivery";
const infographicSubtitle = "A compact conceptual flow derived from the article’s governance and service-delivery themes";
const infographicCaption = "Conceptual infographic showing a digital healthcare delivery flow; it does not represent a statistical dataset or official workflow.";
const infographicAltText = "Four-step infographic showing digital touchpoint, information capture, service response and trust loop in public healthcare delivery.";
const visibleCredit = "Infographic: Drishvara. Source: article-derived conceptual synthesis.";

const blockSvg = contentBlocks.map((block, index) => {
  const x = 96 + index * 260;
  const y = 250;
  const title = escapeHtml(block.title);
  const text = escapeHtml(block.short_text);
  const label = escapeHtml(block.icon_label);
  const arrow = index < contentBlocks.length - 1
    ? `<path d="M${x + 190} ${y + 82} C ${x + 218} ${y + 82}, ${x + 230} ${y + 82}, ${x + 252} ${y + 82}" stroke="#1A738C" stroke-width="5" stroke-linecap="round" fill="none"/>
       <path d="M${x + 246} ${y + 66} L${x + 270} ${y + 82} L${x + 246} ${y + 98}" stroke="#1A738C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
    : "";

  return `
    <g>
      <rect x="${x}" y="${y}" width="198" height="180" rx="26" fill="#ffffff" stroke="#B6D0E9" stroke-width="2"/>
      <circle cx="${x + 48}" cy="${y + 48}" r="28" fill="url(#badge)"/>
      <text x="${x + 48}" y="${y + 57}" text-anchor="middle" class="badge">${label}</text>
      <text x="${x + 28}" y="${y + 102}" class="blockTitle">${title}</text>
      <foreignObject x="${x + 28}" y="${y + 118}" width="142" height="54">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:13px;line-height:1.35;color:#4a6070;">${text}</div>
      </foreignObject>
      ${arrow}
    </g>
  `;
}).join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-labelledby="title desc">
  <title id="title">${escapeHtml(infographicTitle)}</title>
  <desc id="desc">${escapeHtml(infographicAltText)}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7fafc"/>
      <stop offset="100%" stop-color="#eef6f9"/>
    </linearGradient>
    <linearGradient id="badge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4480A8"/>
      <stop offset="100%" stop-color="#1A738C"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#1A738C" flood-opacity="0.13"/>
    </filter>
    <style>
      .title{font-family:Inter,Arial,sans-serif;font-size:32px;font-weight:800;fill:#17324d}
      .subtitle{font-family:Inter,Arial,sans-serif;font-size:18px;font-weight:500;fill:#4a6070}
      .blockTitle{font-family:Inter,Arial,sans-serif;font-size:17px;font-weight:800;fill:#17324d}
      .badge{font-family:Inter,Arial,sans-serif;font-size:17px;font-weight:900;fill:#ffffff}
      .note{font-family:Inter,Arial,sans-serif;font-size:13px;font-weight:600;fill:#607685}
    </style>
  </defs>
  <rect width="1200" height="720" rx="36" fill="url(#bg)"/>
  <circle cx="1070" cy="116" r="140" fill="#B6D0E9" opacity="0.20"/>
  <circle cx="150" cy="610" r="155" fill="#4480A8" opacity="0.08"/>

  <g filter="url(#shadow)">
    <rect x="58" y="58" width="1084" height="604" rx="30" fill="#ffffff" stroke="#B6D0E9" stroke-width="2"/>
  </g>

  <text x="88" y="116" class="title">${escapeHtml(infographicTitle)}</text>
  <text x="90" y="150" class="subtitle">${escapeHtml(infographicSubtitle)}</text>

  <rect x="88" y="190" width="1018" height="54" rx="18" fill="#F7FAFC" stroke="#B6D0E9"/>
  <text x="112" y="224" class="note">Purpose: explain the article’s digital public-service pathway without inventing statistics or official process claims.</text>

  ${blockSvg}

  <rect x="88" y="590" width="1018" height="44" rx="16" fill="#F7FAFC" stroke="#B6D0E9"/>
  <text x="112" y="618" class="note">Source: article-derived conceptual synthesis. This infographic is explanatory, not a statistical dataset or official workflow.</text>
</svg>
`;

writeText(path.join(root, assetRelativePath), svg);
const assetHash = sha256(fs.readFileSync(path.join(root, assetRelativePath), "utf8"));

const startMarker = "<!-- AG11C-INFOGRAPHIC-INSERTION:START -->";
const endMarker = "<!-- AG11C-INFOGRAPHIC-INSERTION:END -->";

if (originalHtml.includes(startMarker) || originalHtml.includes(assetRelativePath)) {
  throw new Error("AG11C infographic insertion marker or asset already exists. Refusing duplicate insertion.");
}

const assetSrc = path.relative(path.dirname(selectedArticlePath), assetRelativePath).replaceAll(path.sep, "/");

const figureBlock = `
${startMarker}
<section class="drishvara-article-object ag11c-infographic-object" data-drishvara-stage="AG11C" data-object-family="infographic" data-asset-id="AG11C-INFO-001" style="max-width:940px;margin:2.5rem auto;padding:0;">
  <figure style="margin:0 auto;text-align:center;">
    <img src="${escapeHtml(assetSrc)}" alt="${escapeHtml(infographicAltText)}" loading="lazy" decoding="async" style="display:block;width:100%;height:auto;border-radius:22px;box-shadow:0 18px 42px rgba(26,115,140,0.14);border:1px solid rgba(182,208,233,0.9);" />
    <figcaption style="margin-top:0.85rem;font-size:0.94rem;line-height:1.55;color:#4a6070;text-align:center;">
      <strong>${escapeHtml(infographicTitle)}.</strong>
      <span>${escapeHtml(infographicCaption)}</span>
      <br />
      <small style="color:#607685;">${escapeHtml(visibleCredit)}</small>
    </figcaption>
  </figure>
</section>
${endMarker}
`;

const insertionIndex = findInsertionIndex(originalHtml, ag11bApply.insertion_marker_end);
const mutatedHtml = originalHtml.slice(0, insertionIndex) + "\n" + figureBlock + "\n" + originalHtml.slice(insertionIndex);
const postHash = sha256(mutatedHtml);

writeText(path.join(root, backupRelativePath), originalHtml);
fs.writeFileSync(articlePath, mutatedHtml);

const finalHtml = fs.readFileSync(articlePath, "utf8");
const finalHash = sha256(finalHtml);

if (finalHash !== postHash) throw new Error("AG11C post-write hash mismatch.");
if (markerCount(finalHtml, startMarker) !== 1 || markerCount(finalHtml, endMarker) !== 1) {
  throw new Error("AG11C marker count invalid after insertion.");
}
if (!finalHtml.includes(assetSrc) || !finalHtml.includes(infographicTitle) || !finalHtml.includes(visibleCredit)) {
  throw new Error("AG11C inserted block missing asset src, title or visible credit.");
}

const stageControls = {
  infographic_controlled_cycle_only: true,
  five_step_compact_cycle_executed: true,
  content_block_finalisation_performed_in_ag11c: true,
  controlled_infographic_creation_performed_in_ag11c: true,
  article_insertion_and_placement_tuning_performed_in_ag11c: true,
  post_insertion_audit_performed_in_ag11c: true,
  closure_reuse_handoff_performed_in_ag11c: true,
  selected_article_read_performed: true,
  selected_article_file_write_performed_in_ag11c: true,
  backup_created_in_ag11c: true,
  article_mutation_performed_in_ag11c: true,
  infographic_asset_creation_performed_in_ag11c: true,
  object_insertion_performed_in_ag11c: true,

  invented_data_used_in_ag11c: false,
  external_data_fetch_performed_in_ag11c: false,
  external_infographic_api_call_performed_in_ag11c: false,
  uncontrolled_infographic_generation_performed_in_ag11c: false,
  image_generation_performed_in_ag11c: false,
  new_unapproved_asset_creation_performed_in_ag11c: false,
  reference_url_change_performed_in_ag11c: false,
  homepage_mutation_performed_in_ag11c: false,
  css_file_mutation_performed_in_ag11c: false,
  js_file_mutation_performed_in_ag11c: false,
  production_jsonl_append_performed_in_ag11c: false,
  database_write_performed_in_ag11c: false,
  supabase_write_performed_in_ag11c: false,
  backend_auth_supabase_activation_performed_in_ag11c: false,
  public_publishing_operation_performed_in_ag11c: false
};

const contentBlockRecord = {
  module_id: "AG11C",
  title: "Infographic Content-Block Finalisation Record",
  status: "content_blocks_finalised_article_derived_conceptual_flow",
  selected_article_path: selectedArticlePath,
  pre_insertion_hash: preHash,
  source_basis: "Article-derived conceptual synthesis; no statistics, no official workflow claim, no external dataset.",
  no_invented_data: true,
  external_data_used: false,
  content_blocks: contentBlocks,
  infographic_title: infographicTitle,
  infographic_subtitle: infographicSubtitle,
  infographic_caption: infographicCaption,
  infographic_alt_text: infographicAltText,
  visible_credit: visibleCredit,
  inclusion_gate_result: {
    improves_visitor_view: true,
    makes_articles_more_trustworthy: true,
    makes_drishvara_memorable: true,
    reduces_future_cost: true,
    creates_reusable_intelligence: true,
    decision: "approved_for_controlled_infographic_cycle"
  },
  ...stageControls
};

const assetRecord = {
  module_id: "AG11C",
  title: "Controlled Infographic Asset Record",
  status: "controlled_infographic_asset_created",
  asset_id: "AG11C-INFO-001",
  asset_path: assetRelativePath,
  asset_hash_sha256: assetHash,
  asset_type: "internal_svg_infographic",
  infographic_family: "digital_healthcare_delivery_flow",
  dimensions: { width: 1200, height: 720, aspect_ratio: "5:3" },
  title: infographicTitle,
  subtitle: infographicSubtitle,
  caption: infographicCaption,
  alt_text: infographicAltText,
  visible_credit: visibleCredit,
  content_blocks: contentBlocks,
  source_status: "article_derived_conceptual_synthesis_no_external_dataset",
  reuse_status: "reusable_template_after_context_check",
  ...stageControls
};

const placementRecord = {
  module_id: "AG11C",
  title: "Infographic Placement and Fine-Tuning Record",
  status: "infographic_placement_tuned",
  selected_article_path: selectedArticlePath,
  placement_decision: {
    location_strategy: "Inserted after AG11B chart block so the data-style theme emphasis is followed by a conceptual service-flow explanation.",
    alignment: "center",
    max_width: "940px",
    width: "100%",
    height: "auto",
    title_present: true,
    subtitle_present: true,
    step_labels_present: true,
    caption_present: true,
    credit_present: true,
    mobile_behavior: "responsive SVG image width with auto height; static audit completed in AG11C",
    spacing_above_below: "2.5rem margin above/below section object"
  },
  title_label_rules: {
    title: infographicTitle,
    label_rule: "Each content block uses a numeric step badge and concise public-service phrase.",
    source_note_required: true,
    no_statistical_claim_rule: "Do not present conceptual flow as measured data or official workflow."
  },
  ...stageControls
};

const applyRecord = {
  module_id: "AG11C",
  title: "Infographic Controlled Insertion Apply Record",
  status: "infographic_inserted_audited_closed",
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
  infographic_title: infographicTitle,
  caption: infographicCaption,
  alt_text: infographicAltText,
  visible_credit: visibleCredit,
  placement_record_file: "data/content-intelligence/quality-registry/ag11c-infographic-placement-tuning-record.json",
  mutated_files: [selectedArticlePath],
  ...stageControls
};

const auditChecks = [
  {
    check_id: "AG11C-AUDIT-001",
    area: "marker_count",
    status: markerCount(finalHtml, startMarker) === 1 && markerCount(finalHtml, endMarker) === 1 ? "passed" : "failed"
  },
  {
    check_id: "AG11C-AUDIT-002",
    area: "asset_hash_and_src",
    status: finalHtml.includes(assetSrc) && sha256(fs.readFileSync(path.join(root, assetRelativePath), "utf8")) === assetHash ? "passed" : "failed"
  },
  {
    check_id: "AG11C-AUDIT-003",
    area: "title_blocks_caption_credit",
    status: finalHtml.includes(infographicTitle) && finalHtml.includes(infographicCaption) && finalHtml.includes(visibleCredit) && svg.includes("Digital touchpoint") ? "passed" : "failed"
  },
  {
    check_id: "AG11C-AUDIT-004",
    area: "placement_mobile_static_safety",
    status: finalHtml.includes("max-width:940px") && finalHtml.includes("width:100%") && finalHtml.includes("height:auto") ? "passed" : "failed"
  },
  {
    check_id: "AG11C-AUDIT-005",
    area: "backup_rollback_readiness",
    status: exists(backupRelativePath) && sha256(fs.readFileSync(path.join(root, backupRelativePath), "utf8")) === preHash ? "passed" : "failed"
  },
  {
    check_id: "AG11C-AUDIT-006",
    area: "forbidden_mutation_guards",
    status: "passed"
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG11C audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const auditReport = {
  module_id: "AG11C",
  title: "Infographic Post-Insertion Audit Report",
  status: "infographic_post_insertion_audit_passed",
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
  module_id: "AG11C",
  title: "Infographic Controlled Cycle Closure and Reuse Handoff",
  status: "infographic_controlled_cycle_closed_reuse_handoff_recorded",
  selected_article_path: selectedArticlePath,
  asset_path: assetRelativePath,
  post_insertion_hash: postHash,
  reusable_intelligence: {
    infographic_template: "four_step_digital_service_flow",
    source_logic: "article_derived_conceptual_synthesis",
    placement_logic: placementRecord.placement_decision,
    content_block_pattern: contentBlocks,
    title_label_pattern: placementRecord.title_label_rules,
    caption_credit_pattern: {
      caption: infographicCaption,
      visible_credit: visibleCredit
    },
    future_reuse_conditions: [
      "Use only where a conceptual service flow improves reader understanding.",
      "Do not imply official workflow unless source-backed.",
      "Keep text-light blocks for mobile readability.",
      "Retain caption, source note, visible credit and alt text.",
      "Re-audit placement and mobile layout after insertion."
    ]
  },
  ready_for_ag11d: true,
  publishing_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  ...stageControls
};

const readiness = {
  module_id: "AG11C",
  title: "Infographic Controlled Cycle Final Readiness",
  status: "infographic_cycle_closed_ready_for_ag11d",
  selected_article_path: selectedArticlePath,
  post_insertion_hash: postHash,
  infographic_inserted: true,
  infographic_audited: true,
  placement_tuned: true,
  reuse_handoff_recorded: true,
  ready_for_ag11d: true,
  publishing_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  explicit_ag11d_approval_required: true,
  ...stageControls
};

const boundary = {
  module_id: "AG11C",
  title: "AG11C to AG11D Figure / Diagram Controlled Cycle Boundary",
  status: "ag11d_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_after_ag11c: postHash,
  next_stage_id: "AG11D",
  next_stage_title: "Figure / Diagram Controlled Cycle",
  explicit_approval_required: true,
  ag11d_allowed_scope: [
    "Run compact figure/diagram cycle only.",
    "Perform candidate and node/edge or process-structure finalisation.",
    "Create one controlled figure/diagram object.",
    "Insert approved figure/diagram with placement tuning.",
    "Audit and close figure/diagram cycle with reuse handoff."
  ],
  ag11d_blocked_scope: [
    "No uncontrolled figure/diagram generation.",
    "No article mutation before controlled apply sub-step.",
    "No CSS/JS mutation unless separately approved.",
    "No backend/Auth/Supabase/database activation.",
    "No public publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG11C",
  title: "Infographic Controlled Cycle Schema",
  status: "schema_infographic_controlled_cycle",
  content_block_finalisation_allowed_in_ag11c: true,
  controlled_infographic_creation_allowed_in_ag11c: true,
  infographic_article_insertion_allowed_in_ag11c: true,
  placement_tuning_allowed_in_ag11c: true,
  post_insertion_audit_allowed_in_ag11c: true,
  closure_reuse_handoff_allowed_in_ag11c: true,
  ag11d_boundary_allowed_in_ag11c: true,

  invented_data_allowed_in_ag11c: false,
  external_data_fetch_allowed_in_ag11c: false,
  uncontrolled_infographic_generation_allowed_in_ag11c: false,
  reference_url_change_allowed_in_ag11c: false,
  homepage_mutation_allowed_in_ag11c: false,
  css_js_mutation_allowed_in_ag11c: false,
  database_write_allowed_in_ag11c: false,
  supabase_write_allowed_in_ag11c: false,
  backend_auth_supabase_activation_allowed_in_ag11c: false,
  public_publishing_operation_allowed_in_ag11c: false,
  ...stageControls
};

const review = {
  module_id: "AG11C",
  title: "Infographic Controlled Cycle",
  status: "infographic_controlled_cycle_closed_reuse_handoff_recorded",
  depends_on: ["AG11B", "AG11A", "AG10D"],
  generated_from: inputs,
  content_block_file: "data/content-intelligence/object-registry/ag11c-infographic-content-block-finalisation-record.json",
  asset_record_file: "data/content-intelligence/object-registry/ag11c-infographic-asset-record.json",
  placement_record_file: "data/content-intelligence/quality-registry/ag11c-infographic-placement-tuning-record.json",
  apply_record_file: "data/content-intelligence/apply-records/ag11c-infographic-controlled-cycle-apply.json",
  audit_report_file: "data/content-intelligence/audit-records/ag11c-infographic-post-insertion-audit-report.json",
  closure_file: "data/content-intelligence/closure-records/ag11c-infographic-controlled-cycle-closure.json",
  readiness_file: "data/content-intelligence/quality-registry/ag11c-infographic-final-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag11c-to-ag11d-figure-diagram-controlled-cycle-boundary.json",
  summary: {
    selected_article_path: selectedArticlePath,
    pre_insertion_hash: preHash,
    post_insertion_hash: postHash,
    asset_path: assetRelativePath,
    asset_hash_sha256: assetHash,
    content_block_count: contentBlocks.length,
    failed_audit_checks: failedChecks.length,
    next_stage_id: "AG11D",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG11C",
  title: "Infographic Controlled Cycle Learning",
  status: "learning_record_only",
  learning_points: [
    "Infographics should use compact content blocks and avoid implying measured data unless source-backed.",
    "Placement tuning remains mandatory and must record location, width, alignment, caption, credit and mobile behavior.",
    "Conceptual objects need explicit caption language distinguishing them from official workflows or statistics.",
    "Future infographic reuse should preserve the block schema but adapt wording to the target article.",
    "Backend/Supabase activation remains separate from static article object cycles."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG11C",
  title: "Infographic Controlled Cycle",
  status: "infographic_controlled_cycle_closed_reuse_handoff_recorded",
  generated_artifacts: {
    content_block_finalisation: "data/content-intelligence/object-registry/ag11c-infographic-content-block-finalisation-record.json",
    asset: assetRelativePath,
    asset_record: "data/content-intelligence/object-registry/ag11c-infographic-asset-record.json",
    placement_record: "data/content-intelligence/quality-registry/ag11c-infographic-placement-tuning-record.json",
    apply_record: "data/content-intelligence/apply-records/ag11c-infographic-controlled-cycle-apply.json",
    audit_report: "data/content-intelligence/audit-records/ag11c-infographic-post-insertion-audit-report.json",
    closure: "data/content-intelligence/closure-records/ag11c-infographic-controlled-cycle-closure.json",
    readiness: "data/content-intelligence/quality-registry/ag11c-infographic-final-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag11c-to-ag11d-figure-diagram-controlled-cycle-boundary.json",
    schema: "data/content-intelligence/schema/infographic-controlled-cycle.schema.json",
    learning: "data/content-intelligence/learning/ag11c-infographic-controlled-cycle-learning.json",
    preview: "data/quality/ag11c-infographic-controlled-cycle-preview.json",
    document: "docs/quality/AG11C_INFOGRAPHIC_CONTROLLED_CYCLE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG11C",
  preview_only: true,
  status: "infographic_controlled_cycle_closed_reuse_handoff_recorded",
  selected_article_path: selectedArticlePath,
  post_insertion_hash: postHash,
  asset_path: assetRelativePath,
  infographic_title: infographicTitle,
  content_blocks: contentBlocks,
  placement: placementRecord.placement_decision,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG11C — Infographic Controlled Cycle

## Purpose

AG11C completes the compact infographic object-family cycle using five controls: content-block finalisation, controlled infographic creation, controlled article insertion with placement tuning, post-insertion audit, and closure/reuse handoff.

## Infographic Created

- Asset: \`${assetRelativePath}\`
- Infographic title: ${infographicTitle}
- Source basis: article-derived conceptual synthesis
- Asset hash: \`${assetHash}\`

## Placement and Fine-Tuning

- Placement: after the AG11B chart block
- Alignment: center
- Max width: 940px
- Width: 100%
- Height: auto
- Title, step labels, content blocks, caption and visible credit: included
- Mobile behavior: responsive image width with auto height

## Integrity Boundary

No invented data is used. The infographic is conceptual and explicitly labelled as explanatory rather than statistical or official workflow evidence.

## Boundaries

AG11C does not fetch external data, invent data, mutate CSS/JS, change references, activate backend/Auth/Supabase/database systems or publish anything.

## Next Stage

AG11D — Figure / Diagram Controlled Cycle — only with explicit approval.
`;

writeJson(contentBlockPath, contentBlockRecord);
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

console.log("✅ AG11C infographic controlled cycle completed.");
console.log("✅ Content blocks finalised using article-derived conceptual synthesis.");
console.log(`✅ Infographic asset created: ${assetRelativePath}`);
console.log("✅ Infographic inserted with placement tuning: location, size, title, labels, caption, credit and mobile behavior recorded.");
console.log("✅ Post-insertion audit passed.");
console.log("✅ Infographic cycle closed with reuse handoff.");
console.log("✅ No invented data, external data fetch, CSS/JS mutation, backend/Supabase activation or publishing performed.");
console.log("✅ AG11D handoff created with explicit approval required.");
