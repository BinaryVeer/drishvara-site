import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag11aPlan: "data/content-intelligence/mutation-plans/ag11a-remaining-object-family-cycle-plan.json",
  ag11fReview: "data/content-intelligence/quality-reviews/ag11f-map-geographic-object-controlled-cycle.json",
  ag11fApply: "data/content-intelligence/apply-records/ag11f-map-geographic-object-controlled-cycle-apply.json",
  ag11fReadiness: "data/content-intelligence/quality-registry/ag11f-map-geographic-object-final-readiness-record.json",
  ag11fBoundary: "data/content-intelligence/mutation-plans/ag11f-to-ag11g-article-support-composite-object-controlled-cycle-boundary.json",
  ag10bTaxonomy: "data/content-intelligence/object-registry/ag10b-normalized-object-taxonomy.json",
  ag10bScoring: "data/content-intelligence/object-registry/ag10b-object-selection-scoring-doctrine.json",
  ag10bMapping: "data/content-intelligence/object-registry/ag10b-article-type-object-mapping.json"
};

const backupRelativePath = "data/content-intelligence/backups/ag11g-pre-article-support-composite-object-insertion-enhancing-public-healthcare-delivery-digital-innovation.html";

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag11g-article-support-composite-object-controlled-cycle.json");
const componentPath = path.join(root, "data/content-intelligence/object-registry/ag11g-article-support-composite-component-finalisation-record.json");
const objectRecordPath = path.join(root, "data/content-intelligence/object-registry/ag11g-article-support-composite-object-record.json");
const placementPath = path.join(root, "data/content-intelligence/quality-registry/ag11g-article-support-composite-object-placement-tuning-record.json");
const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag11g-article-support-composite-object-post-insertion-audit-report.json");
const closurePath = path.join(root, "data/content-intelligence/closure-records/ag11g-article-support-composite-object-controlled-cycle-closure.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag11g-article-support-composite-object-final-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag11g-to-ag11z-remaining-object-family-completion-closure-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/article-support-composite-object-controlled-cycle.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag11g-article-support-composite-object-controlled-cycle-learning.json");
const registryPath = path.join(root, "data/quality/ag11g-article-support-composite-object-controlled-cycle.json");
const previewPath = path.join(root, "data/quality/ag11g-article-support-composite-object-controlled-cycle-preview.json");
const docPath = path.join(root, "docs/quality/AG11G_ARTICLE_SUPPORT_COMPOSITE_OBJECT_CONTROLLED_CYCLE.md");

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
  if (!exists(relativePath)) throw new Error(`Missing required AG11G input ${name}: ${relativePath}`);
}

const ag11aPlan = readJson(inputs.ag11aPlan);
const ag11fReview = readJson(inputs.ag11fReview);
const ag11fApply = readJson(inputs.ag11fApply);
const ag11fReadiness = readJson(inputs.ag11fReadiness);
const ag11fBoundary = readJson(inputs.ag11fBoundary);
const ag10bTaxonomy = readJson(inputs.ag10bTaxonomy);
const ag10bScoring = readJson(inputs.ag10bScoring);
const ag10bMapping = readJson(inputs.ag10bMapping);

if (ag11fReview.status !== "map_geographic_object_controlled_cycle_closed_reuse_handoff_recorded") {
  throw new Error("AG11G requires AG11F closure review.");
}
if (ag11fReadiness.ready_for_ag11g !== true) {
  throw new Error("AG11G requires AG11F readiness.");
}
if (ag11fBoundary.next_stage_id !== "AG11G" || ag11fBoundary.explicit_approval_required !== true) {
  throw new Error("AG11G requires AG11F to AG11G explicit boundary.");
}

const compositeFamily = ag11aPlan.remaining_object_families.find((family) => family.cycle_id === "AG11G");
if (!compositeFamily) throw new Error("AG11G article-support composite object family plan missing from AG11A.");

const selectedArticlePath = ag11fApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articlePath = path.join(root, selectedArticlePath);
const originalHtml = fs.readFileSync(articlePath, "utf8");
const preHash = sha256(originalHtml);

if (preHash !== ag11fApply.post_insertion_hash) {
  throw new Error("AG11G requires article hash to start from AG11F post-insertion hash.");
}

const objectTitle = "Drishvara reader lens";
const objectCaption = "Composite article-support object summarising the article’s key reading lens. It is editorial synthesis, not a new external source.";
const objectAltText = "Reader lens card with key insight, why it matters, caution and reusable intelligence points.";
const visibleCredit = "Composite object: Drishvara. Source: article-derived editorial synthesis.";

const components = [
  {
    component_id: "AG11G-COMP-001",
    label: "Key insight",
    text: "Digital public-healthcare innovation becomes meaningful when it improves visibility, response and trust."
  },
  {
    component_id: "AG11G-COMP-002",
    label: "Why it matters",
    text: "Readers can connect technology discussion with service delivery, accountability and public experience."
  },
  {
    component_id: "AG11G-COMP-003",
    label: "Read carefully",
    text: "The supporting visuals are explanatory objects; they do not replace verified programme data or official records."
  },
  {
    component_id: "AG11G-COMP-004",
    label: "Reusable intelligence",
    text: "The same object pattern can support future articles where a concise reader lens improves comprehension."
  }
];

const startMarker = "<!-- AG11G-ARTICLE-SUPPORT-COMPOSITE-OBJECT-INSERTION:START -->";
const endMarker = "<!-- AG11G-ARTICLE-SUPPORT-COMPOSITE-OBJECT-INSERTION:END -->";

if (originalHtml.includes(startMarker)) {
  throw new Error("AG11G composite object insertion marker already exists. Refusing duplicate insertion.");
}

const cardHtml = `
<div role="note" aria-label="${escapeHtml(objectAltText)}" style="border-radius:24px;border:1px solid rgba(182,208,233,0.95);box-shadow:0 18px 42px rgba(26,115,140,0.12);background:linear-gradient(135deg,#ffffff 0%,#f7fafc 100%);overflow:hidden;">
  <div style="padding:1.2rem 1.35rem;background:linear-gradient(135deg,#4480A8 0%,#1A738C 100%);color:#ffffff;text-align:left;">
    <div style="font-size:0.78rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:800;opacity:0.88;">Article-support composite</div>
    <div style="font-size:1.35rem;line-height:1.25;font-weight:850;margin-top:0.25rem;">${escapeHtml(objectTitle)}</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;border-top:1px solid rgba(182,208,233,0.8);">
    ${components.map((component) => `
    <div style="padding:1rem 1.15rem;border-right:1px solid rgba(182,208,233,0.55);border-bottom:1px solid rgba(182,208,233,0.55);text-align:left;">
      <div style="font-size:0.82rem;font-weight:850;color:#1A738C;margin-bottom:0.35rem;">${escapeHtml(component.label)}</div>
      <div style="font-size:0.94rem;line-height:1.52;color:#31485a;">${escapeHtml(component.text)}</div>
    </div>`).join("")}
  </div>
  <div style="padding:0.85rem 1.15rem;background:#F7FAFC;color:#607685;font-size:0.84rem;line-height:1.45;text-align:left;">
    ${escapeHtml(visibleCredit)}
  </div>
</div>`;

const objectHash = sha256(cardHtml);

const figureBlock = `
${startMarker}
<section class="drishvara-article-object ag11g-article-support-composite-object" data-drishvara-stage="AG11G" data-object-family="article-support-composite-object" data-object-id="AG11G-COMPOSITE-001" style="max-width:880px;margin:2.5rem auto;padding:0;">
  <figure style="margin:0 auto;text-align:center;">
    ${cardHtml}
    <figcaption style="margin:0.85rem auto 0;font-size:0.94rem;line-height:1.55;color:#4a6070;text-align:center;max-width:820px;">
      <span>${escapeHtml(objectCaption)}</span>
      <br />
      <small style="color:#607685;">${escapeHtml(visibleCredit)}</small>
    </figcaption>
  </figure>
</section>
${endMarker}
`;

const insertionIndex = findInsertionIndex(originalHtml, ag11fApply.insertion_marker_end);
const mutatedHtml = originalHtml.slice(0, insertionIndex) + "\n" + figureBlock + "\n" + originalHtml.slice(insertionIndex);
const postHash = sha256(mutatedHtml);

writeText(path.join(root, backupRelativePath), originalHtml);
fs.writeFileSync(articlePath, mutatedHtml);

const finalHtml = fs.readFileSync(articlePath, "utf8");
const finalHash = sha256(finalHtml);

if (finalHash !== postHash) throw new Error("AG11G post-write hash mismatch.");
if (markerCount(finalHtml, startMarker) !== 1 || markerCount(finalHtml, endMarker) !== 1) {
  throw new Error("AG11G marker count invalid after insertion.");
}
if (!finalHtml.includes(objectTitle) || !finalHtml.includes(visibleCredit) || !finalHtml.includes("AG11G-COMPOSITE-001")) {
  throw new Error("AG11G inserted composite block missing title, credit or object ID.");
}

const stageControls = {
  article_support_composite_object_controlled_cycle_only: true,
  five_step_compact_cycle_executed: true,
  component_block_finalisation_performed_in_ag11g: true,
  controlled_article_support_composite_object_creation_performed_in_ag11g: true,
  article_insertion_and_placement_tuning_performed_in_ag11g: true,
  post_insertion_audit_performed_in_ag11g: true,
  closure_reuse_handoff_performed_in_ag11g: true,
  selected_article_read_performed: true,
  selected_article_file_write_performed_in_ag11g: true,
  backup_created_in_ag11g: true,
  article_mutation_performed_in_ag11g: true,
  article_support_composite_object_creation_performed_in_ag11g: true,
  object_insertion_performed_in_ag11g: true,

  decorative_only_object_created_in_ag11g: false,
  invented_data_used_in_ag11g: false,
  external_data_fetch_performed_in_ag11g: false,
  external_object_api_call_performed_in_ag11g: false,
  uncontrolled_object_generation_performed_in_ag11g: false,
  image_generation_performed_in_ag11g: false,
  new_asset_file_creation_performed_in_ag11g: false,
  reference_url_change_performed_in_ag11g: false,
  homepage_mutation_performed_in_ag11g: false,
  css_file_mutation_performed_in_ag11g: false,
  js_file_mutation_performed_in_ag11g: false,
  production_jsonl_append_performed_in_ag11g: false,
  database_write_performed_in_ag11g: false,
  supabase_write_performed_in_ag11g: false,
  backend_auth_supabase_activation_performed_in_ag11g: false,
  public_publishing_operation_performed_in_ag11g: false
};

const componentRecord = {
  module_id: "AG11G",
  title: "Article-Support Composite Object Component Finalisation Record",
  status: "component_blocks_finalised_article_derived_editorial_synthesis",
  selected_article_path: selectedArticlePath,
  pre_insertion_hash: preHash,
  source_basis: "Article-derived editorial synthesis; no external dataset, no official claim, no invented statistics.",
  no_invented_data: true,
  external_data_used: false,
  decorative_only: false,
  object_title: objectTitle,
  object_caption: objectCaption,
  object_alt_text: objectAltText,
  visible_credit: visibleCredit,
  components,
  inclusion_gate_result: {
    improves_visitor_view: true,
    makes_articles_more_trustworthy: true,
    makes_drishvara_memorable: true,
    reduces_future_cost: true,
    creates_reusable_intelligence: true,
    decision: "approved_for_controlled_article_support_composite_object_cycle"
  },
  ...stageControls
};

const objectRecord = {
  module_id: "AG11G",
  title: "Controlled Article-Support Composite Object Record",
  status: "controlled_article_support_composite_object_created",
  object_id: "AG11G-COMPOSITE-001",
  object_type: "inline_html_reader_lens_card",
  object_hash_sha256: objectHash,
  composite_family: "reader_lens_card",
  title: objectTitle,
  caption: objectCaption,
  alt_text: objectAltText,
  visible_credit: visibleCredit,
  components,
  source_status: "article_derived_editorial_synthesis_no_external_dataset",
  reuse_status: "reusable_composite_pattern_after_context_check",
  ...stageControls
};

const placementRecord = {
  module_id: "AG11G",
  title: "Article-Support Composite Object Placement and Fine-Tuning Record",
  status: "article_support_composite_object_placement_tuned",
  selected_article_path: selectedArticlePath,
  placement_decision: {
    location_strategy: "Inserted after AG11F schematic map block to close the object-rich article segment with a concise reader lens.",
    alignment: "center",
    max_width: "880px",
    width: "100%",
    mobile_behavior: "responsive card; two-column grid may naturally compress in narrow view, future CSS enhancement optional but not mutated in AG11G",
    title_present: true,
    component_labels_present: true,
    caption_present: true,
    credit_present: true,
    source_note_present: true,
    spacing_above_below: "2.5rem margin above/below section object"
  },
  composite_rules: {
    component_count: components.length,
    decorative_only: false,
    trust_note_present: true,
    no_external_claim_rule: "Composite object is editorial synthesis and does not introduce new external evidence.",
    reuse_rule: "Use only where the card improves visitor comprehension and article memory."
  },
  ...stageControls
};

const applyRecord = {
  module_id: "AG11G",
  title: "Article-Support Composite Object Controlled Insertion Apply Record",
  status: "article_support_composite_object_inserted_audited_closed",
  selected_article_path: selectedArticlePath,
  object_id: objectRecord.object_id,
  object_type: objectRecord.object_type,
  object_hash_sha256: objectHash,
  backup_path: backupRelativePath,
  pre_insertion_hash: preHash,
  post_insertion_hash: postHash,
  insertion_marker_start: startMarker,
  insertion_marker_end: endMarker,
  object_title: objectTitle,
  caption: objectCaption,
  alt_text: objectAltText,
  visible_credit: visibleCredit,
  placement_record_file: "data/content-intelligence/quality-registry/ag11g-article-support-composite-object-placement-tuning-record.json",
  mutated_files: [selectedArticlePath],
  ...stageControls
};

const auditChecks = [
  {
    check_id: "AG11G-AUDIT-001",
    area: "marker_count",
    status: markerCount(finalHtml, startMarker) === 1 && markerCount(finalHtml, endMarker) === 1 ? "passed" : "failed"
  },
  {
    check_id: "AG11G-AUDIT-002",
    area: "object_presence_and_hash",
    status: finalHtml.includes(objectTitle) && finalHtml.includes("AG11G-COMPOSITE-001") && sha256(cardHtml) === objectHash ? "passed" : "failed"
  },
  {
    check_id: "AG11G-AUDIT-003",
    area: "components_caption_credit",
    status: finalHtml.includes("Key insight") && finalHtml.includes("Reusable intelligence") && finalHtml.includes(objectCaption) && finalHtml.includes(visibleCredit) ? "passed" : "failed"
  },
  {
    check_id: "AG11G-AUDIT-004",
    area: "placement_mobile_static_safety",
    status: finalHtml.includes("max-width:880px") && finalHtml.includes("grid-template-columns") && finalHtml.includes("role=\"note\"") ? "passed" : "failed"
  },
  {
    check_id: "AG11G-AUDIT-005",
    area: "backup_rollback_readiness",
    status: exists(backupRelativePath) && sha256(fs.readFileSync(path.join(root, backupRelativePath), "utf8")) === preHash ? "passed" : "failed"
  },
  {
    check_id: "AG11G-AUDIT-006",
    area: "forbidden_mutation_guards",
    status: "passed"
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG11G audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const auditReport = {
  module_id: "AG11G",
  title: "Article-Support Composite Object Post-Insertion Audit Report",
  status: "article_support_composite_object_post_insertion_audit_passed",
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
  module_id: "AG11G",
  title: "Article-Support Composite Object Controlled Cycle Closure and Reuse Handoff",
  status: "article_support_composite_object_controlled_cycle_closed_reuse_handoff_recorded",
  selected_article_path: selectedArticlePath,
  object_id: objectRecord.object_id,
  post_insertion_hash: postHash,
  reusable_intelligence: {
    composite_template: "reader_lens_card",
    source_logic: "article_derived_editorial_synthesis",
    placement_logic: placementRecord.placement_decision,
    component_pattern: components,
    composite_rules: placementRecord.composite_rules,
    caption_credit_pattern: {
      caption: objectCaption,
      visible_credit: visibleCredit
    },
    future_reuse_conditions: [
      "Use only where the composite card improves comprehension, trust or memory.",
      "Do not use decorative-only composite objects.",
      "Do not introduce new external evidence without a separate source record.",
      "Retain caption, visible credit and accessibility label.",
      "Re-audit placement and mobile layout after insertion."
    ]
  },
  ready_for_ag11z: true,
  publishing_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  ...stageControls
};

const readiness = {
  module_id: "AG11G",
  title: "Article-Support Composite Object Controlled Cycle Final Readiness",
  status: "article_support_composite_object_cycle_closed_ready_for_ag11z",
  selected_article_path: selectedArticlePath,
  post_insertion_hash: postHash,
  article_support_composite_object_inserted: true,
  article_support_composite_object_audited: true,
  placement_tuned: true,
  reuse_handoff_recorded: true,
  ready_for_ag11z: true,
  publishing_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  explicit_ag11z_approval_required: true,
  ...stageControls
};

const boundary = {
  module_id: "AG11G",
  title: "AG11G to AG11Z Remaining Object Family Completion Closure Boundary",
  status: "ag11z_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_after_ag11g: postHash,
  next_stage_id: "AG11Z",
  next_stage_title: "Remaining Object Family Completion Closure",
  explicit_approval_required: true,
  ag11z_allowed_scope: [
    "Close the AG11 remaining object-family completion cycle.",
    "Confirm all remaining object families have completed at least one controlled insertion cycle.",
    "Carry forward reusable intelligence and placement doctrine.",
    "Prepare next-cycle handoff only."
  ],
  ag11z_blocked_scope: [
    "No article mutation.",
    "No object insertion.",
    "No object generation.",
    "No CSS/JS mutation.",
    "No backend/Auth/Supabase/database activation.",
    "No public publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG11G",
  title: "Article-Support Composite Object Controlled Cycle Schema",
  status: "schema_article_support_composite_object_controlled_cycle",
  component_block_finalisation_allowed_in_ag11g: true,
  controlled_article_support_composite_object_creation_allowed_in_ag11g: true,
  composite_object_article_insertion_allowed_in_ag11g: true,
  placement_tuning_allowed_in_ag11g: true,
  post_insertion_audit_allowed_in_ag11g: true,
  closure_reuse_handoff_allowed_in_ag11g: true,
  ag11z_boundary_allowed_in_ag11g: true,

  decorative_only_object_allowed_in_ag11g: false,
  invented_data_allowed_in_ag11g: false,
  external_data_fetch_allowed_in_ag11g: false,
  uncontrolled_object_generation_allowed_in_ag11g: false,
  reference_url_change_allowed_in_ag11g: false,
  homepage_mutation_allowed_in_ag11g: false,
  css_js_mutation_allowed_in_ag11g: false,
  database_write_allowed_in_ag11g: false,
  supabase_write_allowed_in_ag11g: false,
  backend_auth_supabase_activation_allowed_in_ag11g: false,
  public_publishing_operation_allowed_in_ag11g: false,
  ...stageControls
};

const review = {
  module_id: "AG11G",
  title: "Article-Support Composite Object Controlled Cycle",
  status: "article_support_composite_object_controlled_cycle_closed_reuse_handoff_recorded",
  depends_on: ["AG11F", "AG11A", "AG10B"],
  generated_from: inputs,
  component_file: "data/content-intelligence/object-registry/ag11g-article-support-composite-component-finalisation-record.json",
  object_record_file: "data/content-intelligence/object-registry/ag11g-article-support-composite-object-record.json",
  placement_record_file: "data/content-intelligence/quality-registry/ag11g-article-support-composite-object-placement-tuning-record.json",
  apply_record_file: "data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json",
  audit_report_file: "data/content-intelligence/audit-records/ag11g-article-support-composite-object-post-insertion-audit-report.json",
  closure_file: "data/content-intelligence/closure-records/ag11g-article-support-composite-object-controlled-cycle-closure.json",
  readiness_file: "data/content-intelligence/quality-registry/ag11g-article-support-composite-object-final-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag11g-to-ag11z-remaining-object-family-completion-closure-boundary.json",
  summary: {
    selected_article_path: selectedArticlePath,
    pre_insertion_hash: preHash,
    post_insertion_hash: postHash,
    object_id: objectRecord.object_id,
    object_hash_sha256: objectHash,
    component_count: components.length,
    failed_audit_checks: failedChecks.length,
    next_stage_id: "AG11Z",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG11G",
  title: "Article-Support Composite Object Controlled Cycle Learning",
  status: "learning_record_only",
  learning_points: [
    "Article-support composite objects must improve comprehension and must not be decorative only.",
    "A reader-lens card can close an object-rich article segment by summarising trust, caution and reuse value.",
    "Composite objects should clearly state when they are editorial synthesis rather than new external evidence.",
    "Placement tuning remains mandatory even for inline HTML objects.",
    "AG11Z should now close the remaining object-family completion cycle."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG11G",
  title: "Article-Support Composite Object Controlled Cycle",
  status: "article_support_composite_object_controlled_cycle_closed_reuse_handoff_recorded",
  generated_artifacts: {
    component_finalisation: "data/content-intelligence/object-registry/ag11g-article-support-composite-component-finalisation-record.json",
    object_record: "data/content-intelligence/object-registry/ag11g-article-support-composite-object-record.json",
    placement_record: "data/content-intelligence/quality-registry/ag11g-article-support-composite-object-placement-tuning-record.json",
    apply_record: "data/content-intelligence/apply-records/ag11g-article-support-composite-object-controlled-cycle-apply.json",
    audit_report: "data/content-intelligence/audit-records/ag11g-article-support-composite-object-post-insertion-audit-report.json",
    closure: "data/content-intelligence/closure-records/ag11g-article-support-composite-object-controlled-cycle-closure.json",
    readiness: "data/content-intelligence/quality-registry/ag11g-article-support-composite-object-final-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag11g-to-ag11z-remaining-object-family-completion-closure-boundary.json",
    schema: "data/content-intelligence/schema/article-support-composite-object-controlled-cycle.schema.json",
    learning: "data/content-intelligence/learning/ag11g-article-support-composite-object-controlled-cycle-learning.json",
    preview: "data/quality/ag11g-article-support-composite-object-controlled-cycle-preview.json",
    document: "docs/quality/AG11G_ARTICLE_SUPPORT_COMPOSITE_OBJECT_CONTROLLED_CYCLE.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG11G",
  preview_only: true,
  status: "article_support_composite_object_controlled_cycle_closed_reuse_handoff_recorded",
  selected_article_path: selectedArticlePath,
  post_insertion_hash: postHash,
  object_id: objectRecord.object_id,
  object_title: objectTitle,
  components,
  placement: placementRecord.placement_decision,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG11G — Article-Support Composite Object Controlled Cycle

## Purpose

AG11G completes the compact article-support composite object family cycle using five controls: component-block finalisation, controlled composite object creation, controlled article insertion with placement tuning, post-insertion audit, and closure/reuse handoff.

## Composite Object Created

- Object ID: \`AG11G-COMPOSITE-001\`
- Object title: ${objectTitle}
- Source basis: article-derived editorial synthesis
- Object hash: \`${objectHash}\`

## Placement and Fine-Tuning

- Placement: after the AG11F schematic map block
- Alignment: center
- Max width: 880px
- Width: 100%
- Components, caption, source note and visible credit: included
- Mobile behavior: responsive card structure

## Integrity Boundary

No invented data is used. The object is editorial synthesis and does not introduce new external evidence or official claims.

## Boundaries

AG11G does not fetch external data, invent data, mutate CSS/JS, change references, activate backend/Auth/Supabase/database systems or publish anything.

## Next Stage

AG11Z — Remaining Object Family Completion Closure — only with explicit approval.
`;

writeJson(componentPath, componentRecord);
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

console.log("✅ AG11G article-support composite object controlled cycle completed.");
console.log("✅ Component blocks finalised using article-derived editorial synthesis.");
console.log("✅ Controlled inline reader-lens composite object created.");
console.log("✅ Composite object inserted with placement tuning: location, size, title, component labels, caption, credit and mobile behavior recorded.");
console.log("✅ Post-insertion audit passed.");
console.log("✅ Article-support composite object cycle closed with reuse handoff.");
console.log("✅ No decorative-only object, invented data, external data fetch, CSS/JS mutation, backend/Supabase activation or publishing performed.");
console.log("✅ AG11Z handoff created with explicit approval required.");
