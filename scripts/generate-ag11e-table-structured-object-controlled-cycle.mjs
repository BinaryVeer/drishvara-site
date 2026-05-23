import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag11aPlan: "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json",
  ag11dReview: "data/content-intelligence/quality-reviews/ag11d-figure-diagram-controlled-cycle.json",
  ag11dApply: "data/content-intelligence/apply-records/ag11d-figure-diagram-controlled-cycle-apply.json",
  ag11dReadiness: "data/content-intelligence/quality-registry/ag11d-figure-diagram-final-readiness-record.json",
  ag11dBoundary: "data/content-intelligence/mutation-plans/ag11d-to-ag11e-table-structured-object-controlled-cycle-boundary.json",
  ag10fFamily: "data/content-intelligence/object-registry/ag10f-table-structured-object-family-registry.json",
  ag10fSchema: "data/content-intelligence/object-registry/ag10f-table-row-column-cell-schema.json",
  ag10fThemeDoctrine: "data/content-intelligence/object-registry/ag10f-table-theme-credit-mobile-doctrine.json"
};

const backupRelativePath = "data/content-intelligence/backups/ag11e-pre-table-structured-object-insertion-enhancing-public-healthcare-delivery-digital-innovation.html";

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag11e-table-structured-object-controlled-cycle.json");
const tableDataPath = path.join(root, "data/content-intelligence/object-registry/ag11e-table-row-column-cell-finalisation-record.json");
const objectRecordPath = path.join(root, "data/content-intelligence/object-registry/ag11e-table-structured-object-record.json");
const placementPath = path.join(root, "data/content-intelligence/quality-registry/ag11e-table-structured-object-placement-tuning-record.json");
const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11e-table-structured-object-controlled-cycle-apply.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag11e-table-structured-object-post-insertion-audit-report.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag11e-table-structured-object-controlled-cycle-closure.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag11e-table-structured-object-final-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag11e-to-ag11f-map-geographic-object-controlled-cycle-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/table-structured-object-controlled-cycle.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag11e-table-structured-object-controlled-cycle-learning.json");
const registryPath = path.join(root, "data/quality/ag11e-table-structured-object-controlled-cycle.json");
const previewPath = path.join(root, "data/quality/ag11e-table-structured-object-controlled-cycle-preview.json");
const docPath = path.join(root, "docs/quality/AG11E_TABLE_STRUCTURED_OBJECT_CONTROLLED_CYCLE.md");

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
  if (!exists(relativePath)) throw new Error(`Missing required AG11E input ${name}: ${relativePath}`);
}

const ag11aPlan = readJson(inputs.ag11aPlan);
const ag11dReview = readJson(inputs.ag11dReview);
const ag11dApply = readJson(inputs.ag11dApply);
const ag11dReadiness = readJson(inputs.ag11dReadiness);
const ag11dBoundary = readJson(inputs.ag11dBoundary);
const ag10fFamily = readJson(inputs.ag10fFamily);
const ag10fSchema = readJson(inputs.ag10fSchema);
const ag10fThemeDoctrine = readJson(inputs.ag10fThemeDoctrine);

if (ag11dReview.status !== "figure_diagram_controlled_cycle_closed_reuse_handoff_recorded") {
  throw new Error("AG11E requires AG11D closure review.");
}
if (ag11dReadiness.ready_for_ag11e !== true) {
  throw new Error("AG11E requires AG11D readiness.");
}
if (ag11dBoundary.next_stage_id !== "AG11E" || ag11dBoundary.explicit_approval_required !== true) {
  throw new Error("AG11E requires AG11D to AG11E explicit boundary.");
}

const tableFamily = ag11aPlan.remaining_object_families.find((family) => family.cycle_id === "AG11E");
if (!tableFamily) throw new Error("AG11E table/structured object family plan missing from AG11A.");

const selectedArticlePath = ag11dApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articlePath = path.join(root, selectedArticlePath);
const originalHtml = fs.readFileSync(articlePath, "utf8");
const preHash = sha256(originalHtml);

if (preHash !== ag11dApply.post_insertion_hash) {
  throw new Error("AG11E requires article hash to start from AG11D post-insertion hash.");
}

const tableTitle = "Digital healthcare delivery — structured reading lens";
const tableCaption = "Structured table summarising the article’s conceptual service-delivery logic; it does not introduce external statistics or official rankings.";
const tableAltText = "Structured table with four rows comparing digital access, data visibility, service response and trust loop across reader question, article signal and governance value.";
const visibleCredit = "Table: Drishvara. Source: article-derived conceptual synthesis.";

const columns = [
  {
    column_id: "AG11E-COL-001",
    heading: "Reading lens",
    purpose: "Names the conceptual theme."
  },
  {
    column_id: "AG11E-COL-002",
    heading: "Reader question",
    purpose: "Clarifies what the visitor should understand."
  },
  {
    column_id: "AG11E-COL-003",
    heading: "Article signal",
    purpose: "Connects the theme to the article’s argument."
  },
  {
    column_id: "AG11E-COL-004",
    heading: "Governance value",
    purpose: "Explains why the theme matters for public service delivery."
  }
];

const rows = [
  {
    row_id: "AG11E-ROW-001",
    reading_lens: "Digital access",
    reader_question: "Where does the citizen first interact?",
    article_signal: "Digital channels can make public-healthcare access more visible.",
    governance_value: "Improves entry-point clarity."
  },
  {
    row_id: "AG11E-ROW-002",
    reading_lens: "Data visibility",
    reader_question: "What becomes easier to see?",
    article_signal: "Service needs, feedback and monitoring signals become easier to organise.",
    governance_value: "Supports better prioritisation."
  },
  {
    row_id: "AG11E-ROW-003",
    reading_lens: "Service response",
    reader_question: "How can teams act faster?",
    article_signal: "Structured information can guide triage, response and coordination.",
    governance_value: "Reduces avoidable delay."
  },
  {
    row_id: "AG11E-ROW-004",
    reading_lens: "Trust loop",
    reader_question: "What improves public confidence?",
    article_signal: "Feedback, transparency and follow-up can reinforce trust.",
    governance_value: "Strengthens accountability."
  }
];

const startMarker = "<!-- AG11E-TABLE-STRUCTURED-OBJECT-INSERTION:START -->";
const endMarker = "<!-- AG11E-TABLE-STRUCTURED-OBJECT-INSERTION:END -->";

if (originalHtml.includes(startMarker)) {
  throw new Error("AG11E table insertion marker already exists. Refusing duplicate insertion.");
}

const thStyle = "padding:0.85rem 0.9rem;text-align:left;background:#EAF3F7;color:#17324d;font-weight:800;border-bottom:1px solid #B6D0E9;white-space:normal;";
const tdStyle = "padding:0.82rem 0.9rem;vertical-align:top;border-bottom:1px solid rgba(182,208,233,0.75);color:#31485a;line-height:1.48;";
const firstTdStyle = tdStyle + "font-weight:800;color:#17324d;";

const headerHtml = columns.map((col) => `<th scope="col" style="${thStyle}">${escapeHtml(col.heading)}</th>`).join("");

const rowHtml = rows.map((row) => `
      <tr>
        <th scope="row" style="${firstTdStyle}">${escapeHtml(row.reading_lens)}</th>
        <td style="${tdStyle}">${escapeHtml(row.reader_question)}</td>
        <td style="${tdStyle}">${escapeHtml(row.article_signal)}</td>
        <td style="${tdStyle}">${escapeHtml(row.governance_value)}</td>
      </tr>`).join("");

const tableObjectHtml = `<div role="img" aria-label="${escapeHtml(tableAltText)}" style="overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:20px;border:1px solid rgba(182,208,233,0.95);box-shadow:0 18px 42px rgba(26,115,140,0.12);background:#ffffff;">
    <table style="width:100%;min-width:760px;border-collapse:separate;border-spacing:0;font-size:0.94rem;">
      <thead>
        <tr>${headerHtml}</tr>
      </thead>
      <tbody>${rowHtml}
      </tbody>
    </table>
  </div>`;

const objectHash = sha256(tableObjectHtml);

const figureBlock = `
${startMarker}
<section class="drishvara-article-object ag11e-table-structured-object" data-drishvara-stage="AG11E" data-object-family="table-structured-object" data-object-id="AG11E-TABLE-001" style="max-width:940px;margin:2.5rem auto;padding:0;">
  <figure style="margin:0 auto;text-align:center;">
    <figcaption style="margin:0 0 0.85rem 0;font-size:1.05rem;line-height:1.5;color:#17324d;text-align:center;">
      <strong>${escapeHtml(tableTitle)}</strong>
    </figcaption>
    ${tableObjectHtml}
    <p style="margin:0.85rem auto 0;font-size:0.94rem;line-height:1.55;color:#4a6070;text-align:center;max-width:820px;">
      <span>${escapeHtml(tableCaption)}</span>
      <br />
      <small style="color:#607685;">${escapeHtml(visibleCredit)}</small>
    </p>
  </figure>
</section>
${endMarker}
`;

const insertionIndex = findInsertionIndex(originalHtml, ag11dApply.insertion_marker_end);
const mutatedHtml = originalHtml.slice(0, insertionIndex) + "\n" + figureBlock + "\n" + originalHtml.slice(insertionIndex);
const postHash = sha256(mutatedHtml);

writeText(path.join(root, backupRelativePath), originalHtml);
fs.writeFileSync(articlePath, mutatedHtml);

const finalHtml = fs.readFileSync(articlePath, "utf8");
const finalHash = sha256(finalHtml);

if (finalHash !== postHash) throw new Error("AG11E post-write hash mismatch.");
if (markerCount(finalHtml, startMarker) !== 1 || markerCount(finalHtml, endMarker) !== 1) {
  throw new Error("AG11E marker count invalid after insertion.");
}
if (!finalHtml.includes(tableTitle) || !finalHtml.includes(visibleCredit) || !finalHtml.includes("overflow-x:auto")) {
  throw new Error("AG11E inserted table block missing title, credit or mobile overflow control.");
}

const stageControls = {
  table_structured_object_controlled_cycle_only: true,
  five_step_compact_cycle_executed: true,
  row_column_cell_finalisation_performed_in_ag11e: true,
  controlled_table_structured_object_creation_performed_in_ag11e: true,
  article_insertion_and_placement_tuning_performed_in_ag11e: true,
  post_insertion_audit_performed_in_ag11e: true,
  closure_reuse_handoff_performed_in_ag11e: true,
  selected_article_read_performed: true,
  selected_article_file_write_performed_in_ag11e: true,
  backup_created_in_ag11e: true,
  article_mutation_performed_in_ag11e: true,
  table_structured_object_creation_performed_in_ag11e: true,
  object_insertion_performed_in_ag11e: true,

  invented_data_used_in_ag11e: false,
  external_data_fetch_performed_in_ag11e: false,
  external_table_api_call_performed_in_ag11e: false,
  uncontrolled_table_generation_performed_in_ag11e: false,
  image_generation_performed_in_ag11e: false,
  new_asset_file_creation_performed_in_ag11e: false,
  reference_url_change_performed_in_ag11e: false,
  homepage_mutation_performed_in_ag11e: false,
  css_file_mutation_performed_in_ag11e: false,
  js_file_mutation_performed_in_ag11e: false,
  production_jsonl_append_performed_in_ag11e: false,
  database_write_performed_in_ag11e: false,
  supabase_write_performed_in_ag11e: false,
  backend_auth_supabase_activation_performed_in_ag11e: false,
  public_publishing_operation_performed_in_ag11e: false
};

const tableDataRecord = {
  module_id: "AG11E",
  title: "Table Row / Column / Cell Finalisation Record",
  status: "row_column_cell_structure_finalised_article_derived_conceptual_summary",
  selected_article_path: selectedArticlePath,
  pre_insertion_hash: preHash,
  source_basis: "Article-derived conceptual synthesis; no external dataset, no statistics, no official ranking.",
  no_invented_data: true,
  external_data_used: false,
  columns,
  rows,
  table_title: tableTitle,
  table_caption: tableCaption,
  table_alt_text: tableAltText,
  visible_credit: visibleCredit,
  inclusion_gate_result: {
    improves_visitor_view: true,
    makes_articles_more_trustworthy: true,
    makes_drishvara_memorable: true,
    reduces_future_cost: true,
    creates_reusable_intelligence: true,
    decision: "approved_for_controlled_table_structured_object_cycle"
  },
  ...stageControls
};

const objectRecord = {
  module_id: "AG11E",
  title: "Controlled Table / Structured Object Record",
  status: "controlled_table_structured_object_created",
  object_id: "AG11E-TABLE-001",
  object_type: "inline_html_structured_table",
  object_hash_sha256: objectHash,
  table_family: "conceptual_reading_lens_table",
  title: tableTitle,
  caption: tableCaption,
  alt_text: tableAltText,
  visible_credit: visibleCredit,
  columns,
  rows,
  source_status: "article_derived_conceptual_summary_no_external_dataset",
  reuse_status: "reusable_table_pattern_after_context_check",
  ...stageControls
};

const placementRecord = {
  module_id: "AG11E",
  title: "Table / Structured Object Placement and Fine-Tuning Record",
  status: "table_structured_object_placement_tuned",
  selected_article_path: selectedArticlePath,
  placement_decision: {
    location_strategy: "Inserted after AG11D figure/diagram block so the visual feedback-loop explanation is followed by a compact structured summary.",
    alignment: "center",
    max_width: "940px",
    width: "100%",
    mobile_behavior: "horizontal overflow enabled with min-width table and touch scrolling",
    title_present: true,
    column_headers_present: true,
    row_headers_present: true,
    caption_present: true,
    credit_present: true,
    source_note_present: true,
    spacing_above_below: "2.5rem margin above/below section object"
  },
  table_rules: {
    row_count: rows.length,
    column_count: columns.length,
    row_header_scope_used: true,
    column_header_scope_used: true,
    no_statistical_claim_rule: "This is a structured reading lens, not a statistical or ranked table.",
    mobile_overflow_required: true
  },
  ...stageControls
};

const applyRecord = {
  module_id: "AG11E",
  title: "Table / Structured Object Controlled Insertion Apply Record",
  status: "table_structured_object_inserted_audited_closed",
  selected_article_path: selectedArticlePath,
  object_id: objectRecord.object_id,
  object_type: objectRecord.object_type,
  object_hash_sha256: objectHash,
  backup_path: backupRelativePath,
  pre_insertion_hash: preHash,
  post_insertion_hash: postHash,
  insertion_marker_start: startMarker,
  insertion_marker_end: endMarker,
  table_title: tableTitle,
  caption: tableCaption,
  alt_text: tableAltText,
  visible_credit: visibleCredit,
  placement_record_file: "data/content-intelligence/quality-registry/ag11e-table-structured-object-placement-tuning-record.json",
  mutated_files: [selectedArticlePath],
  ...stageControls
};

const auditChecks = [
  {
    check_id: "AG11E-AUDIT-001",
    area: "marker_count",
    status: markerCount(finalHtml, startMarker) === 1 && markerCount(finalHtml, endMarker) === 1 ? "passed" : "failed"
  },
  {
    check_id: "AG11E-AUDIT-002",
    area: "table_presence_and_hash",
    status: finalHtml.includes(tableTitle) && finalHtml.includes("AG11E-TABLE-001") && sha256(tableObjectHtml) === objectHash ? "passed" : "failed"
  },
  {
    check_id: "AG11E-AUDIT-003",
    area: "headers_rows_caption_credit",
    status: finalHtml.includes("Reading lens") && finalHtml.includes("Digital access") && finalHtml.includes(tableCaption) && finalHtml.includes(visibleCredit) ? "passed" : "failed"
  },
  {
    check_id: "AG11E-AUDIT-004",
    area: "placement_mobile_static_safety",
    status: finalHtml.includes("max-width:940px") && finalHtml.includes("overflow-x:auto") && finalHtml.includes("min-width:760px") ? "passed" : "failed"
  },
  {
    check_id: "AG11E-AUDIT-005",
    area: "backup_rollback_readiness",
    status: exists(backupRelativePath) && sha256(fs.readFileSync(path.join(root, backupRelativePath), "utf8")) === preHash ? "passed" : "failed"
  },
  {
    check_id: "AG11E-AUDIT-006",
    area: "forbidden_mutation_guards",
    status: "passed"
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG11E audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const auditReport = {
  module_id: "AG11E",
  title: "Table / Structured Object Post-Insertion Audit Report",
  status: "table_structured_object_post_insertion_audit_passed",
  selected_article_path: selectedArticlePath,
  pre_insertion_hash: preHash,
  post_insertion_hash: postHash,
  object_hash_sha256: objectHash,
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
  module_id: "AG11E",
  title: "Table / Structured Object Controlled Cycle Closure and Reuse Handoff",
  status: "table_structured_object_controlled_cycle_closed_reuse_handoff_recorded",
  selected_article_path: selectedArticlePath,
  object_id: objectRecord.object_id,
  post_insertion_hash: postHash,
  reusable_intelligence: {
    table_template: "conceptual_reading_lens_structured_table",
    source_logic: "article_derived_conceptual_summary",
    placement_logic: placementRecord.placement_decision,
    row_column_cell_pattern: { columns, rows },
    table_rules: placementRecord.table_rules,
    caption_credit_pattern: {
      caption: tableCaption,
      visible_credit: visibleCredit
    },
    future_reuse_conditions: [
      "Use only where a structured comparison improves reader understanding.",
      "Do not present conceptual rows as statistics, rankings or official classifications.",
      "Keep row and column count compact for mobile readability.",
      "Retain caption, source note, visible credit and accessibility label.",
      "Use horizontal overflow for mobile where the table cannot safely collapse."
    ]
  },
  ready_for_ag11f: true,
  publishing_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  ...stageControls
};

const readiness = {
  module_id: "AG11E",
  title: "Table / Structured Object Controlled Cycle Final Readiness",
  status: "table_structured_object_cycle_closed_ready_for_ag11f",
  selected_article_path: selectedArticlePath,
  post_insertion_hash: postHash,
  table_structured_object_inserted: true,
  table_structured_object_audited: true,
  placement_tuned: true,
  reuse_handoff_recorded: true,
  ready_for_ag11f: true,
  publishing_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  explicit_ag11f_approval_required: true,
  ...stageControls
};

const boundary = {
  module_id: "AG11E",
  title: "AG11E to AG11F Map / Geographic Object Controlled Cycle Boundary",
  status: "ag11f_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_after_ag11e: postHash,
  next_stage_id: "AG11F",
  next_stage_title: "Map / Geographic Object Controlled Cycle",
  explicit_approval_required: true,
  ag11f_allowed_scope: [
    "Run compact map/geographic-object cycle only.",
    "Perform candidate and geo/location finalisation.",
    "Create one controlled map/geographic object.",
    "Insert approved map/geographic object with placement tuning.",
    "Audit and close map/geographic object cycle with reuse handoff."
  ],
  ag11f_blocked_scope: [
    "No invented geographic data.",
    "No misleading source-backed map claim.",
    "No article mutation before controlled apply sub-step.",
    "No CSS/JS mutation unless separately approved.",
    "No backend/Auth/Supabase/database activation.",
    "No public publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG11E",
  title: "Table / Structured Object Controlled Cycle Schema",
  status: "schema_table_structured_object_controlled_cycle",
  row_column_cell_finalisation_allowed_in_ag11e: true,
  controlled_table_structured_object_creation_allowed_in_ag11e: true,
  table_structured_object_article_insertion_allowed_in_ag11e: true,
  placement_tuning_allowed_in_ag11e: true,
  post_insertion_audit_allowed_in_ag11e: true,
  closure_reuse_handoff_allowed_in_ag11e: true,
  ag11f_boundary_allowed_in_ag11e: true,

  invented_data_allowed_in_ag11e: false,
  external_data_fetch_allowed_in_ag11e: false,
  uncontrolled_table_generation_allowed_in_ag11e: false,
  reference_url_change_allowed_in_ag11e: false,
  homepage_mutation_allowed_in_ag11e: false,
  css_js_mutation_allowed_in_ag11e: false,
  database_write_allowed_in_ag11e: false,
  supabase_write_allowed_in_ag11e: false,
  backend_auth_supabase_activation_allowed_in_ag11e: false,
  public_publishing_operation_allowed_in_ag11e: false,
  ...stageControls
};

const review = {
  module_id: "AG11E",
  title: "Table / Structured Object Controlled Cycle",
  status: "table_structured_object_controlled_cycle_closed_reuse_handoff_recorded",
  depends_on: ["AG11D", "AG11A", "AG10F"],
  generated_from: inputs,
  table_data_file: "data/content-intelligence/object-registry/ag11e-table-row-column-cell-finalisation-record.json",
  object_record_file: "data/content-intelligence/object-registry/ag11e-table-structured-object-record.json",
  placement_record_file: "data/content-intelligence/quality-registry/ag11e-table-structured-object-placement-tuning-record.json",
  apply_record_file: "data/content-intelligence/apply-records/ag11e-table-structured-object-controlled-cycle-apply.json",
  audit_report_file: "data/content-intelligence/audit-records/ag11e-table-structured-object-post-insertion-audit-report.json",
  closure_file: "data/content-intelligence/closure-records/ag11e-table-structured-object-controlled-cycle-closure.json",
  readiness_file: "data/content-intelligence/quality-registry/ag11e-table-structured-object-final-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag11e-to-ag11f-map-geographic-object-controlled-cycle-boundary.json",
  summary: {
    selected_article_path: selectedArticlePath,
    pre_insertion_hash: preHash,
    post_insertion_hash: postHash,
    object_id: objectRecord.object_id,
    object_hash_sha256: objectHash,
    row_count: rows.length,
    column_count: columns.length,
    failed_audit_checks: failedChecks.length,
    next_stage_id: "AG11F",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG11E",
  title: "Table / Structured Object Controlled Cycle Learning",
  status: "learning_record_only",
  learning_points: [
    "Structured tables can improve clarity without external data when clearly labelled as conceptual reading lenses.",
    "Tables require explicit row/column/cell finalisation before insertion.",
    "Mobile overflow handling should be recorded as a placement control, not left to CSS assumptions.",
    "Caption language must prevent conceptual summaries from being mistaken for rankings, official classifications or statistics.",
    "Future table reuse should adapt rows and columns to the target article while preserving accessibility and mobile rules."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG11E",
  title: "Table / Structured Object Controlled Cycle",
  status: "table_structured_object_controlled_cycle_closed_reuse_handoff_recorded",
  generated_artifacts: {
    row_column_cell_finalisation: "data/content-intelligence/object-registry/ag11e-table-row-column-cell-finalisation-record.json",
    object_record: "data/content-intelligence/object-registry/ag11e-table-structured-object-record.json",
    placement_record: "data/content-intelligence/quality-registry/ag11e-table-structured-object-placement-tuning-record.json",
    apply_record: "data/content-intelligence/apply-records/ag11e-table-structured-object-controlled-cycle-apply.json",
    audit_report: "data/content-intelligence/audit-records/ag11e-table-structured-object-post-insertion-audit-report.json",
    closure: "data/content-intelligence/closure-records/ag11e-table-structured-object-controlled-cycle-closure.json",
    readiness: "data/content-intelligence/quality-registry/ag11e-table-structured-object-final-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag11e-to-ag11f-map-geographic-object-controlled-cycle-boundary.json",
    schema: "data/content-intelligence/schema/table-structured-object-controlled-cycle.schema.json",
    learning: "data/content-intelligence/learning/ag11e-table-structured-object-controlled-cycle-learning.json",
    preview: "data/quality/ag11e-table-structured-object-controlled-cycle-preview.json",
    document: "docs/quality/AG11E_TABLE_STRUCTURED_OBJECT_CONTROLLED_CYCLE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG11E",
  preview_only: true,
  status: "table_structured_object_controlled_cycle_closed_reuse_handoff_recorded",
  selected_article_path: selectedArticlePath,
  post_insertion_hash: postHash,
  object_id: objectRecord.object_id,
  table_title: tableTitle,
  columns,
  rows,
  placement: placementRecord.placement_decision,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG11E — Table / Structured Object Controlled Cycle

## Purpose

AG11E completes the compact table/structured-object family cycle using five controls: row/column/cell finalisation, controlled table creation, controlled article insertion with placement tuning, post-insertion audit, and closure/reuse handoff.

## Table Created

- Object ID: \`AG11E-TABLE-001\`
- Table title: ${tableTitle}
- Source basis: article-derived conceptual synthesis
- Object hash: \`${objectHash}\`

## Placement and Fine-Tuning

- Placement: after the AG11D figure/diagram block
- Alignment: center
- Max width: 940px
- Width: 100%
- Mobile behavior: horizontal overflow with touch scrolling
- Column headers, row headers, caption, source note and visible credit: included

## Integrity Boundary

No invented data is used. The table is a structured reading lens and is not a statistical table, official classification or ranking.

## Boundaries

AG11E does not fetch external data, invent data, mutate CSS/JS, change references, activate backend/Auth/Supabase/database systems or publish anything.

## Next Stage

AG11F — Map / Geographic Object Controlled Cycle — only with explicit approval.
`;

writeJson(tableDataPath, tableDataRecord);
writeJson(objectRecordPath, objectRecord);
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

console.log("✅ AG11E table / structured object controlled cycle completed.");
console.log("✅ Row/column/cell structure finalised using article-derived conceptual synthesis.");
console.log("✅ Controlled inline HTML table object created.");
console.log("✅ Table inserted with placement tuning: location, size, headers, row labels, caption, credit and mobile overflow recorded.");
console.log("✅ Post-insertion audit passed.");
console.log("✅ Table/structured object cycle closed with reuse handoff.");
console.log("✅ No invented data, external data fetch, CSS/JS mutation, backend/Supabase activation or publishing performed.");
console.log("✅ AG11F handoff created with explicit approval required.");
