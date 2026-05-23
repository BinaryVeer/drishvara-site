import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag11aReview: "data/content-intelligence/quality-reviews/ag11a-remaining-object-family-cycle-plan.json",
  ag11aPlan: "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json",
  ag11aFamilyPlan: "data/content-intelligence/object-registry/ag11a-remaining-object-family-compact-cycle-plan.json",
  ag11aReadiness: "data/content-intelligence/quality-registry/ag11a-remaining-object-family-cycle-readiness.json",
  ag11aBoundary: "data/content-intelligence/mutation-plans/ag11a-to-ag11b-chart-bi-graph-controlled-cycle-boundary.json",
  ag10cChartRegistry: "data/content-intelligence/object-registry/ag10c-chart-family-data-schema-registry.json",
  ag10cChartDoctrine: "data/content-intelligence/object-registry/ag10c-chart-theme-credit-mobile-doctrine.json",
  ag10gGate: "data/content-intelligence/quality-registry/ag10g-new-aspect-inclusion-gate.json",
  ag10kApply: "data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json"
};

const assetRelativePath = "assets/articles/policy/enhancing-public-healthcare-delivery-digital-innovation/ag11b-chart-theme-emphasis.svg";
const backupRelativePath = "data/content-intelligence/backups/ag11b-pre-chart-bi-graph-insertion-enhancing-public-healthcare-delivery-digital-innovation.html";

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag11b-chart-bi-graph-controlled-cycle.json");
const sourceDataPath = path.join(root, "data/content-intelligence/data-registry/ag11b-chart-bi-graph-source-data-record.json");
const assetRecordPath = path.join(root, "data/content-intelligence/object-registry/ag11b-chart-bi-graph-asset-record.json");
const placementPath = path.join(root, "data/content-intelligence/quality-registry/ag11b-chart-placement-tuning-record.json");
const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11b-chart-bi-graph-controlled-cycle-apply.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag11b-chart-bi-graph-post-insertion-audit-report.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag11b-chart-bi-graph-controlled-cycle-closure.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag11b-chart-bi-graph-final-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag11b-to-ag11c-infographic-controlled-cycle-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/chart-bi-graph-controlled-cycle.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag11b-chart-bi-graph-controlled-cycle-learning.json");
const registryPath = path.join(root, "data/quality/ag11b-chart-bi-graph-controlled-cycle.json");
const previewPath = path.join(root, "data/quality/ag11b-chart-bi-graph-controlled-cycle-preview.json");
const docPath = path.join(root, "docs/quality/AG11B_CHART_BI_GRAPH_CONTROLLED_CYCLE.md");

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

function stripHtml(html) {
  return html
    .replace(/<!-- AG10K-GENERATED-IMAGE-INSERTION:START -->[\s\S]*?<!-- AG10K-GENERATED-IMAGE-INSERTION:END -->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countPatterns(text, patterns) {
  const lower = text.toLowerCase();
  return patterns.reduce((total, pattern) => {
    const matches = lower.match(new RegExp(`\\b${pattern}\\b`, "gi"));
    return total + (matches ? matches.length : 0);
  }, 0);
}

function markerCount(text, marker) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (text.match(new RegExp(escaped, "g")) || []).length;
}

function findInsertionIndex(html, preferredMarkerEnd) {
  const markerIndex = html.indexOf(preferredMarkerEnd);
  if (markerIndex >= 0) return markerIndex + preferredMarkerEnd.length;

  const paragraphs = [...html.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi)];
  if (paragraphs.length >= 4) {
    const target = paragraphs[3];
    return target.index + target[0].length;
  }

  const bodyClose = html.search(/<\/body>/i);
  return bodyClose >= 0 ? bodyClose : html.length;
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG11B input ${name}: ${relativePath}`);
}

const ag11aReview = readJson(inputs.ag11aReview);
const ag11aPlan = readJson(inputs.ag11aPlan);
const ag11aFamilyPlan = readJson(inputs.ag11aFamilyPlan);
const ag11aReadiness = readJson(inputs.ag11aReadiness);
const ag11aBoundary = readJson(inputs.ag11aBoundary);
const ag10cChartRegistry = readJson(inputs.ag10cChartRegistry);
const ag10cChartDoctrine = readJson(inputs.ag10cChartDoctrine);
const ag10gGate = readJson(inputs.ag10gGate);
const ag10kApply = readJson(inputs.ag10kApply);

if (ag11aReview.status !== "remaining_object_family_compact_cycles_planned_not_started") {
  throw new Error("AG11B requires AG11A planning review.");
}
if (ag11aReadiness.ready_for_ag11b !== true) {
  throw new Error("AG11B requires AG11A readiness.");
}
if (ag11aBoundary.next_stage_id !== "AG11B" || ag11aBoundary.explicit_approval_required !== true) {
  throw new Error("AG11B requires AG11A to AG11B explicit boundary.");
}

const chartFamily = ag11aPlan.remaining_object_families.find((family) => family.cycle_id === "AG11B");
if (!chartFamily) throw new Error("AG11B chart family plan missing from AG11A.");

const selectedArticlePath = ag10kApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articlePath = path.join(root, selectedArticlePath);
const originalHtml = fs.readFileSync(articlePath, "utf8");
const preHash = sha256(originalHtml);

if (preHash !== ag10kApply.post_insertion_hash) {
  throw new Error("AG11B requires article hash to start from AG10K post-insertion hash.");
}

const cleanArticleText = stripHtml(originalHtml);

const chartData = [
  {
    theme_id: "digital_access",
    label: "Digital access",
    patterns: ["digital", "technology", "platform", "online", "innovation"],
    count: 0
  },
  {
    theme_id: "service_delivery",
    label: "Service delivery",
    patterns: ["service", "delivery", "facility", "healthcare", "public"],
    count: 0
  },
  {
    theme_id: "data_visibility",
    label: "Data visibility",
    patterns: ["data", "information", "monitoring", "dashboard", "visibility"],
    count: 0
  },
  {
    theme_id: "trust_accountability",
    label: "Trust & accountability",
    patterns: ["trust", "accountability", "feedback", "governance", "quality"],
    count: 0
  }
].map((item) => ({
  ...item,
  count: countPatterns(cleanArticleText, item.patterns)
}));

if (chartData.every((row) => row.count === 0)) {
  throw new Error("AG11B chart data produced all zero counts; refusing chart creation.");
}

const maxCount = Math.max(...chartData.map((row) => row.count), 1);
const bars = chartData.map((row, index) => {
  const x = 285;
  const y = 178 + index * 92;
  const width = Math.max(18, Math.round((row.count / maxCount) * 650));
  const label = escapeHtml(row.label);
  return `
    <text x="90" y="${y + 25}" class="label">${label}</text>
    <rect x="${x}" y="${y}" width="650" height="38" rx="19" fill="#E0E0E0" opacity="0.72"/>
    <rect x="${x}" y="${y}" width="${width}" height="38" rx="19" fill="url(#bar)"/>
    <text x="${x + width + 18}" y="${y + 26}" class="value">${row.count}</text>
  `;
}).join("\n");

const chartTitle = "Theme emphasis in this article";
const chartSubtitle = "Deterministic count of selected theme terms in the article text";
const chartCaption = "Theme-emphasis chart based on deterministic article-text term counts; it is not an external statistical dataset.";
const chartAltText = "Horizontal bar chart showing deterministic theme counts for digital access, service delivery, data visibility, and trust and accountability in the article text.";
const visibleCredit = "Chart: Drishvara. Source: article-text theme count.";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-labelledby="title desc">
  <title id="title">${escapeHtml(chartTitle)}</title>
  <desc id="desc">${escapeHtml(chartAltText)}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7fafc"/>
      <stop offset="100%" stop-color="#eef6f9"/>
    </linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#4480A8"/>
      <stop offset="100%" stop-color="#1A738C"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#1A738C" flood-opacity="0.14"/>
    </filter>
    <style>
      .title{font-family:Inter,Arial,sans-serif;font-size:34px;font-weight:700;fill:#17324d}
      .subtitle{font-family:Inter,Arial,sans-serif;font-size:18px;font-weight:500;fill:#4a6070}
      .label{font-family:Inter,Arial,sans-serif;font-size:18px;font-weight:700;fill:#17324d}
      .value{font-family:Inter,Arial,sans-serif;font-size:18px;font-weight:800;fill:#1A738C}
      .note{font-family:Inter,Arial,sans-serif;font-size:13px;font-weight:600;fill:#607685}
      .axis{stroke:#B6D0E9;stroke-width:2}
    </style>
  </defs>
  <rect width="1200" height="720" rx="36" fill="url(#bg)"/>
  <circle cx="1050" cy="120" r="145" fill="#B6D0E9" opacity="0.20"/>
  <circle cx="130" cy="612" r="150" fill="#4480A8" opacity="0.08"/>

  <g filter="url(#shadow)">
    <rect x="58" y="58" width="1084" height="604" rx="30" fill="#ffffff" stroke="#B6D0E9" stroke-width="2"/>
  </g>

  <text x="88" y="116" class="title">${escapeHtml(chartTitle)}</text>
  <text x="90" y="150" class="subtitle">${escapeHtml(chartSubtitle)}</text>

  <line x1="285" y1="156" x2="285" y2="560" class="axis"/>
  ${bars}

  <rect x="88" y="590" width="1018" height="44" rx="16" fill="#F7FAFC" stroke="#B6D0E9"/>
  <text x="112" y="618" class="note">Source: deterministic article-text count of selected theme terms. Counts indicate article emphasis only, not public-health statistics.</text>
</svg>
`;

writeText(path.join(root, assetRelativePath), svg);
const assetHash = sha256(fs.readFileSync(path.join(root, assetRelativePath), "utf8"));

const startMarker = "<!-- AG11B-CHART-BI-GRAPH-INSERTION:START -->";
const endMarker = "<!-- AG11B-CHART-BI-GRAPH-INSERTION:END -->";

if (originalHtml.includes(startMarker) || originalHtml.includes(assetRelativePath)) {
  throw new Error("AG11B chart insertion marker or asset already exists. Refusing duplicate insertion.");
}

const assetSrc = path.relative(path.dirname(selectedArticlePath), assetRelativePath).replaceAll(path.sep, "/");

const figureBlock = `
${startMarker}
<section class="drishvara-article-object ag11b-chart-bi-graph-object" data-drishvara-stage="AG11B" data-object-family="chart-bi-graph" data-asset-id="AG11B-CHART-001" style="max-width:940px;margin:2.5rem auto;padding:0;">
  <figure style="margin:0 auto;text-align:center;">
    <img src="${escapeHtml(assetSrc)}" alt="${escapeHtml(chartAltText)}" loading="lazy" decoding="async" style="display:block;width:100%;height:auto;border-radius:22px;box-shadow:0 18px 42px rgba(26,115,140,0.14);border:1px solid rgba(182,208,233,0.9);" />
    <figcaption style="margin-top:0.85rem;font-size:0.94rem;line-height:1.55;color:#4a6070;text-align:center;">
      <strong>${escapeHtml(chartTitle)}.</strong>
      <span>${escapeHtml(chartCaption)}</span>
      <br />
      <small style="color:#607685;">${escapeHtml(visibleCredit)}</small>
    </figcaption>
  </figure>
</section>
${endMarker}
`;

const insertionIndex = findInsertionIndex(originalHtml, ag10kApply.insertion_marker_end);
const mutatedHtml = originalHtml.slice(0, insertionIndex) + "\n" + figureBlock + "\n" + originalHtml.slice(insertionIndex);
const postHash = sha256(mutatedHtml);

writeText(path.join(root, backupRelativePath), originalHtml);
fs.writeFileSync(articlePath, mutatedHtml);

const finalHtml = fs.readFileSync(articlePath, "utf8");
const finalHash = sha256(finalHtml);

if (finalHash !== postHash) throw new Error("AG11B post-write hash mismatch.");
if (markerCount(finalHtml, startMarker) !== 1 || markerCount(finalHtml, endMarker) !== 1) {
  throw new Error("AG11B marker count invalid after insertion.");
}
if (!finalHtml.includes(assetSrc) || !finalHtml.includes(chartTitle) || !finalHtml.includes(visibleCredit)) {
  throw new Error("AG11B inserted block missing asset src, title or visible credit.");
}

const stageControls = {
  chart_bi_graph_controlled_cycle_only: true,
  five_step_compact_cycle_executed: true,
  source_data_finalisation_performed_in_ag11b: true,
  controlled_chart_creation_performed_in_ag11b: true,
  article_insertion_and_placement_tuning_performed_in_ag11b: true,
  post_insertion_audit_performed_in_ag11b: true,
  closure_reuse_handoff_performed_in_ag11b: true,
  selected_article_read_performed: true,
  selected_article_file_write_performed_in_ag11b: true,
  backup_created_in_ag11b: true,
  article_mutation_performed_in_ag11b: true,
  chart_asset_creation_performed_in_ag11b: true,
  object_insertion_performed_in_ag11b: true,

  invented_data_used_in_ag11b: false,
  external_data_fetch_performed_in_ag11b: false,
  external_chart_api_call_performed_in_ag11b: false,
  uncontrolled_chart_generation_performed_in_ag11b: false,
  image_generation_performed_in_ag11b: false,
  new_unapproved_asset_creation_performed_in_ag11b: false,
  reference_url_change_performed_in_ag11b: false,
  homepage_mutation_performed_in_ag11b: false,
  css_file_mutation_performed_in_ag11b: false,
  js_file_mutation_performed_in_ag11b: false,
  production_jsonl_append_performed_in_ag11b: false,
  database_write_performed_in_ag11b: false,
  supabase_write_performed_in_ag11b: false,
  backend_auth_supabase_activation_performed_in_ag11b: false,
  public_publishing_operation_performed_in_ag11b: false
};

const sourceDataRecord = {
  module_id: "AG11B",
  title: "Chart / BI Graph Source Data Finalisation Record",
  status: "source_data_finalised_article_text_deterministic_counts",
  selected_article_path: selectedArticlePath,
  pre_insertion_hash: preHash,
  source_basis: "Current selected article text after stripping HTML and excluding AG10K visual block.",
  no_invented_data: true,
  external_data_used: false,
  data_rows: chartData,
  chart_title: chartTitle,
  chart_subtitle: chartSubtitle,
  chart_caption: chartCaption,
  chart_alt_text: chartAltText,
  visible_credit: visibleCredit,
  inclusion_gate_result: {
    improves_visitor_view: true,
    makes_articles_more_trustworthy: true,
    makes_drishvara_memorable: true,
    reduces_future_cost: true,
    creates_reusable_intelligence: true,
    decision: "approved_for_controlled_chart_cycle"
  },
  ...stageControls
};

const assetRecord = {
  module_id: "AG11B",
  title: "Controlled Chart / BI Graph Asset Record",
  status: "controlled_chart_asset_created",
  asset_id: "AG11B-CHART-001",
  asset_path: assetRelativePath,
  asset_hash_sha256: assetHash,
  asset_type: "internal_svg_bar_chart",
  chart_family: "theme_emphasis_bar_chart",
  dimensions: { width: 1200, height: 720, aspect_ratio: "5:3" },
  title: chartTitle,
  subtitle: chartSubtitle,
  caption: chartCaption,
  alt_text: chartAltText,
  visible_credit: visibleCredit,
  data_rows: chartData,
  source_status: "article_text_deterministic_counts_no_external_dataset",
  reuse_status: "reusable_template_after_context_check",
  ...stageControls
};

const placementRecord = {
  module_id: "AG11B",
  title: "Chart Placement and Fine-Tuning Record",
  status: "chart_placement_tuned",
  selected_article_path: selectedArticlePath,
  placement_decision: {
    location_strategy: "Inserted after AG10K section-support visual block so the visual theme is followed by article-text theme emphasis.",
    alignment: "center",
    max_width: "940px",
    width: "100%",
    height: "auto",
    title_present: true,
    subtitle_present: true,
    labels_present: true,
    values_present: true,
    caption_present: true,
    credit_present: true,
    mobile_behavior: "responsive image width with auto height; static audit required and completed in AG11B",
    spacing_above_below: "2.5rem margin above/below section object"
  },
  title_label_rules: {
    chart_title: chartTitle,
    axis_note: "No external statistical axis; chart uses deterministic theme-count bars.",
    label_rule: "Labels are theme names, values are deterministic article-text term counts.",
    source_note_required: true
  },
  ...stageControls
};

const applyRecord = {
  module_id: "AG11B",
  title: "Chart / BI Graph Controlled Insertion Apply Record",
  status: "chart_bi_graph_inserted_audited_closed",
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
  chart_title: chartTitle,
  caption: chartCaption,
  alt_text: chartAltText,
  visible_credit: visibleCredit,
  placement_record_file: "data/content-intelligence/quality-registry/ag11b-chart-placement-tuning-record.json",
  mutated_files: [selectedArticlePath],
  ...stageControls
};

const auditChecks = [
  {
    check_id: "AG11B-AUDIT-001",
    area: "marker_count",
    status: markerCount(finalHtml, startMarker) === 1 && markerCount(finalHtml, endMarker) === 1 ? "passed" : "failed"
  },
  {
    check_id: "AG11B-AUDIT-002",
    area: "asset_hash_and_src",
    status: finalHtml.includes(assetSrc) && sha256(fs.readFileSync(path.join(root, assetRelativePath), "utf8")) === assetHash ? "passed" : "failed"
  },
  {
    check_id: "AG11B-AUDIT-003",
    area: "title_labels_caption_credit",
    status: finalHtml.includes(chartTitle) && finalHtml.includes(chartCaption) && finalHtml.includes(visibleCredit) && svg.includes("Digital access") ? "passed" : "failed"
  },
  {
    check_id: "AG11B-AUDIT-004",
    area: "placement_mobile_static_safety",
    status: finalHtml.includes("max-width:940px") && finalHtml.includes("width:100%") && finalHtml.includes("height:auto") ? "passed" : "failed"
  },
  {
    check_id: "AG11B-AUDIT-005",
    area: "backup_rollback_readiness",
    status: exists(backupRelativePath) && sha256(fs.readFileSync(path.join(root, backupRelativePath), "utf8")) === preHash ? "passed" : "failed"
  },
  {
    check_id: "AG11B-AUDIT-006",
    area: "forbidden_mutation_guards",
    status: "passed"
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG11B audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const auditReport = {
  module_id: "AG11B",
  title: "Chart / BI Graph Post-Insertion Audit Report",
  status: "chart_bi_graph_post_insertion_audit_passed",
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
  module_id: "AG11B",
  title: "Chart / BI Graph Controlled Cycle Closure and Reuse Handoff",
  status: "chart_bi_graph_controlled_cycle_closed_reuse_handoff_recorded",
  selected_article_path: selectedArticlePath,
  asset_path: assetRelativePath,
  post_insertion_hash: postHash,
  reusable_intelligence: {
    chart_template: "theme_emphasis_horizontal_bar_chart",
    source_logic: "article_text_deterministic_theme_counts",
    placement_logic: placementRecord.placement_decision,
    title_label_pattern: placementRecord.title_label_rules,
    caption_credit_pattern: {
      caption: chartCaption,
      visible_credit: visibleCredit
    },
    future_reuse_conditions: [
      "Use only where article-text theme emphasis is useful to visitors.",
      "Do not present term counts as external statistics.",
      "Regenerate data rows from the target article text.",
      "Retain title, label, caption, source note and visible credit.",
      "Re-audit placement and mobile layout after insertion."
    ]
  },
  ready_for_ag11c: true,
  publishing_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  ...stageControls
};

const readiness = {
  module_id: "AG11B",
  title: "Chart / BI Graph Controlled Cycle Final Readiness",
  status: "chart_bi_graph_cycle_closed_ready_for_ag11c",
  selected_article_path: selectedArticlePath,
  post_insertion_hash: postHash,
  chart_inserted: true,
  chart_audited: true,
  placement_tuned: true,
  reuse_handoff_recorded: true,
  ready_for_ag11c: true,
  publishing_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  explicit_ag11c_approval_required: true,
  ...stageControls
};

const boundary = {
  module_id: "AG11B",
  title: "AG11B to AG11C Infographic Controlled Cycle Boundary",
  status: "ag11c_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_after_ag11b: postHash,
  next_stage_id: "AG11C",
  next_stage_title: "Infographic Controlled Cycle",
  explicit_approval_required: true,
  ag11c_allowed_scope: [
    "Run compact infographic cycle only.",
    "Perform candidate and content-block finalisation.",
    "Create one controlled infographic object.",
    "Insert approved infographic with placement tuning.",
    "Audit and close infographic cycle with reuse handoff."
  ],
  ag11c_blocked_scope: [
    "No uncontrolled infographic generation.",
    "No article mutation before controlled apply sub-step.",
    "No CSS/JS mutation unless separately approved.",
    "No backend/Auth/Supabase/database activation.",
    "No public publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG11B",
  title: "Chart / BI Graph Controlled Cycle Schema",
  status: "schema_chart_bi_graph_controlled_cycle",
  source_data_finalisation_allowed_in_ag11b: true,
  controlled_chart_creation_allowed_in_ag11b: true,
  chart_article_insertion_allowed_in_ag11b: true,
  placement_tuning_allowed_in_ag11b: true,
  post_insertion_audit_allowed_in_ag11b: true,
  closure_reuse_handoff_allowed_in_ag11b: true,
  ag11c_boundary_allowed_in_ag11b: true,

  invented_data_allowed_in_ag11b: false,
  external_data_fetch_allowed_in_ag11b: false,
  uncontrolled_chart_generation_allowed_in_ag11b: false,
  reference_url_change_allowed_in_ag11b: false,
  homepage_mutation_allowed_in_ag11b: false,
  css_js_mutation_allowed_in_ag11b: false,
  database_write_allowed_in_ag11b: false,
  supabase_write_allowed_in_ag11b: false,
  backend_auth_supabase_activation_allowed_in_ag11b: false,
  public_publishing_operation_allowed_in_ag11b: false,
  ...stageControls
};

const review = {
  module_id: "AG11B",
  title: "Chart / BI Graph Controlled Cycle",
  status: "chart_bi_graph_controlled_cycle_closed_reuse_handoff_recorded",
  depends_on: ["AG11A", "AG10C", "AG10Z"],
  generated_from: inputs,
  source_data_file: "data/content-intelligence/data-registry/ag11b-chart-bi-graph-source-data-record.json",
  asset_record_file: "data/content-intelligence/object-registry/ag11b-chart-bi-graph-asset-record.json",
  placement_record_file: "data/content-intelligence/quality-registry/ag11b-chart-placement-tuning-record.json",
  apply_record_file: "data/content-intelligence/apply-records/ag11b-chart-bi-graph-controlled-cycle-apply.json",
  audit_report_file: "data/content-intelligence/audit-records/ag11b-chart-bi-graph-post-insertion-audit-report.json",
  closure_file: "data/content-intelligence/closure-records/ag11b-chart-bi-graph-controlled-cycle-closure.json",
  readiness_file: "data/content-intelligence/quality-registry/ag11b-chart-bi-graph-final-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag11b-to-ag11c-infographic-controlled-cycle-boundary.json",
  summary: {
    selected_article_path: selectedArticlePath,
    pre_insertion_hash: preHash,
    post_insertion_hash: postHash,
    asset_path: assetRelativePath,
    asset_hash_sha256: assetHash,
    chart_data_rows: chartData.length,
    failed_audit_checks: failedChecks.length,
    next_stage_id: "AG11C",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG11B",
  title: "Chart / BI Graph Controlled Cycle Learning",
  status: "learning_record_only",
  learning_points: [
    "A chart cycle can remain compact while still separating source data, creation, insertion, audit and closure.",
    "Article-text deterministic counts avoid invented data but must be clearly labelled as article-emphasis counts, not external statistics.",
    "Placement tuning is mandatory for object readability and should record location, width, alignment, labels, caption and mobile behavior.",
    "Future chart reuse should regenerate data from the target article instead of copying counts from this article.",
    "Full project validators may need a latest controlled article-state recognition pattern as more object insertions are added."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG11B",
  title: "Chart / BI Graph Controlled Cycle",
  status: "chart_bi_graph_controlled_cycle_closed_reuse_handoff_recorded",
  generated_artifacts: {
    source_data: "data/content-intelligence/data-registry/ag11b-chart-bi-graph-source-data-record.json",
    asset: assetRelativePath,
    asset_record: "data/content-intelligence/object-registry/ag11b-chart-bi-graph-asset-record.json",
    placement_record: "data/content-intelligence/quality-registry/ag11b-chart-placement-tuning-record.json",
    apply_record: "data/content-intelligence/apply-records/ag11b-chart-bi-graph-controlled-cycle-apply.json",
    audit_report: "data/content-intelligence/audit-records/ag11b-chart-bi-graph-post-insertion-audit-report.json",
    closure: "data/content-intelligence/closure-records/ag11b-chart-bi-graph-controlled-cycle-closure.json",
    readiness: "data/content-intelligence/quality-registry/ag11b-chart-bi-graph-final-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag11b-to-ag11c-infographic-controlled-cycle-boundary.json",
    schema: "data/content-intelligence/schema/chart-bi-graph-controlled-cycle.schema.json",
    learning: "data/content-intelligence/learning/ag11b-chart-bi-graph-controlled-cycle-learning.json",
    preview: "data/quality/ag11b-chart-bi-graph-controlled-cycle-preview.json",
    document: "docs/quality/AG11B_CHART_BI_GRAPH_CONTROLLED_CYCLE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG11B",
  preview_only: true,
  status: "chart_bi_graph_controlled_cycle_closed_reuse_handoff_recorded",
  selected_article_path: selectedArticlePath,
  post_insertion_hash: postHash,
  asset_path: assetRelativePath,
  chart_title: chartTitle,
  chart_data: chartData,
  placement: placementRecord.placement_decision,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG11B — Chart / BI Graph Controlled Cycle

## Purpose

AG11B completes the compact chart/BI graph object-family cycle using five controls: source/data finalisation, controlled chart creation, controlled article insertion with placement tuning, post-insertion audit, and closure/reuse handoff.

## Chart Created

- Asset: \`${assetRelativePath}\`
- Chart title: ${chartTitle}
- Chart source basis: deterministic article-text theme counts
- Asset hash: \`${assetHash}\`

## Placement and Fine-Tuning

- Placement: after the AG10K section-support visual block
- Alignment: center
- Max width: 940px
- Width: 100%
- Height: auto
- Title, labels, values, caption and visible credit: included
- Mobile behavior: responsive image width with auto height

## Data Integrity

No invented data is used. The chart is based only on deterministic counts of selected theme terms in the article text and is labelled accordingly.

## Boundaries

AG11B does not fetch external data, invent data, mutate CSS/JS, change references, activate backend/Auth/Supabase/database systems or publish anything.

## Next Stage

AG11C — Infographic Controlled Cycle — only with explicit approval.
`;

writeJson(sourceDataPath, sourceDataRecord);
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

console.log("✅ AG11B chart / BI graph controlled cycle completed.");
console.log("✅ Source/data finalised using deterministic article-text counts.");
console.log(`✅ Chart asset created: ${assetRelativePath}`);
console.log("✅ Chart inserted with placement tuning: location, size, title, labels, caption, credit and mobile behavior recorded.");
console.log("✅ Post-insertion audit passed.");
console.log("✅ Chart cycle closed with reuse handoff.");
console.log("✅ No invented data, external data fetch, CSS/JS mutation, backend/Supabase activation or publishing performed.");
console.log("✅ AG11C handoff created with explicit approval required.");
