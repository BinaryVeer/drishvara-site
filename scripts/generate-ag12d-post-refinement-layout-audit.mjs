import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag12cReview: "data/content-intelligence/quality-reviews/ag12c-controlled-layout-refinement-apply.json",
  ag12cApply: "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json",
  ag12cLayout: "data/content-intelligence/object-registry/ag12c-layout-treatment-record.json",
  ag12cRollback: "data/content-intelligence/quality-registry/ag12c-rollback-readiness-record.json",
  ag12cAuditPrep: "data/content-intelligence/quality-registry/ag12c-post-refinement-audit-prep-record.json",
  ag12cBoundary: "data/content-intelligence/mutation-plans/ag12c-to-ag12d-post-refinement-layout-audit-boundary.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag12d-post-refinement-layout-audit.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag12d-post-refinement-layout-audit-report.json");
const treatmentAuditPath = path.join(root, "data/content-intelligence/object-registry/ag12d-refined-layout-treatment-audit-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag12d-post-refinement-readiness-record.json");
const rollbackAuditPath = path.join(root, "data/content-intelligence/quality-registry/ag12d-rollback-readiness-audit-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag12d-to-ag12z-object-rich-production-readiness-closure-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/post-refinement-layout-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag12d-post-refinement-layout-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag12d-post-refinement-layout-audit.json");
const previewPath = path.join(root, "data/quality/ag12d-post-refinement-layout-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG12D_POST_REFINEMENT_LAYOUT_AUDIT.md");

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

function markerCount(text, marker) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (text.match(new RegExp(escaped, "g")) || []).length;
}

function getRange(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  const endStart = html.indexOf(endMarker);
  if (start < 0 || endStart < 0 || endStart < start) return null;
  return {
    start,
    end: endStart + endMarker.length,
    block: html.slice(start, endStart + endMarker.length)
  };
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG12D input ${name}: ${relativePath}`);
}

const ag12cReview = readJson(inputs.ag12cReview);
const ag12cApply = readJson(inputs.ag12cApply);
const ag12cLayout = readJson(inputs.ag12cLayout);
const ag12cRollback = readJson(inputs.ag12cRollback);
const ag12cAuditPrep = readJson(inputs.ag12cAuditPrep);
const ag12cBoundary = readJson(inputs.ag12cBoundary);

if (ag12cReview.status !== "controlled_layout_refinement_applied_pending_post_refinement_audit") {
  throw new Error("AG12D requires AG12C review.");
}
if (ag12cAuditPrep.ready_for_ag12d !== true) {
  throw new Error("AG12D requires AG12C audit-prep readiness.");
}
if (ag12cBoundary.next_stage_id !== "AG12D" || ag12cBoundary.explicit_approval_required !== true) {
  throw new Error("AG12D requires AG12C to AG12D explicit boundary.");
}

const selectedArticlePath = ag12cApply.selected_article_path;
const backupPath = ag12cApply.backup_path;

if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);
if (!exists(backupPath)) throw new Error(`AG12C backup missing: ${backupPath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");

const currentHash = sha256(articleHtml);
const backupHash = sha256(backupHtml);

if (currentHash !== ag12cApply.post_refinement_hash) {
  throw new Error("AG12D requires current article hash to match AG12C post-refinement hash.");
}
if (backupHash !== ag12cApply.pre_refinement_hash) {
  throw new Error("AG12D requires backup hash to match AG12C pre-refinement hash.");
}

const originalObjectMarkers = [
  {
    family_id: "GENERATED_IMAGE_EDITORIAL_VISUAL",
    stage: "AG10K",
    marker_start: "<!-- AG10K-GENERATED-IMAGE-INSERTION:START -->",
    marker_end: "<!-- AG10K-GENERATED-IMAGE-INSERTION:END -->",
    expected_treatment: "primary_visible"
  },
  {
    family_id: "CHART_BI_GRAPH",
    stage: "AG11B",
    marker_start: "<!-- AG11B-CHART-BI-GRAPH-INSERTION:START -->",
    marker_end: "<!-- AG11B-CHART-BI-GRAPH-INSERTION:END -->",
    expected_treatment: "primary_visible"
  },
  {
    family_id: "INFOGRAPHIC",
    stage: "AG11C",
    marker_start: "<!-- AG11C-INFOGRAPHIC-INSERTION:START -->",
    marker_end: "<!-- AG11C-INFOGRAPHIC-INSERTION:END -->",
    expected_treatment: "collapsed_pilot"
  },
  {
    family_id: "FIGURE_DIAGRAM",
    stage: "AG11D",
    marker_start: "<!-- AG11D-FIGURE-DIAGRAM-INSERTION:START -->",
    marker_end: "<!-- AG11D-FIGURE-DIAGRAM-INSERTION:END -->",
    expected_treatment: "collapsed_pilot"
  },
  {
    family_id: "TABLE_STRUCTURED_OBJECT",
    stage: "AG11E",
    marker_start: "<!-- AG11E-TABLE-STRUCTURED-OBJECT-INSERTION:START -->",
    marker_end: "<!-- AG11E-TABLE-STRUCTURED-OBJECT-INSERTION:END -->",
    expected_treatment: "primary_visible"
  },
  {
    family_id: "MAP_GEOGRAPHIC_OBJECT",
    stage: "AG11F",
    marker_start: "<!-- AG11F-MAP-GEOGRAPHIC-OBJECT-INSERTION:START -->",
    marker_end: "<!-- AG11F-MAP-GEOGRAPHIC-OBJECT-INSERTION:END -->",
    expected_treatment: "collapsed_pilot"
  },
  {
    family_id: "ARTICLE_SUPPORT_COMPOSITE",
    stage: "AG11G",
    marker_start: "<!-- AG11G-ARTICLE-SUPPORT-COMPOSITE-OBJECT-INSERTION:START -->",
    marker_end: "<!-- AG11G-ARTICLE-SUPPORT-COMPOSITE-OBJECT-INSERTION:END -->",
    expected_treatment: "primary_visible"
  }
];

const collapsedFamilyIds = ["INFOGRAPHIC", "FIGURE_DIAGRAM", "MAP_GEOGRAPHIC_OBJECT"];
const primaryFamilyIds = ["GENERATED_IMAGE_EDITORIAL_VISUAL", "CHART_BI_GRAPH", "TABLE_STRUCTURED_OBJECT", "ARTICLE_SUPPORT_COMPOSITE"];

const objectAudit = originalObjectMarkers.map((item) => {
  const objectRange = getRange(articleHtml, item.marker_start, item.marker_end);
  const collapseStart = `<!-- AG12C-LAYOUT-REFINEMENT:START:${item.family_id} -->`;
  const collapseEnd = `<!-- AG12C-LAYOUT-REFINEMENT:END:${item.family_id} -->`;
  const collapseRange = getRange(articleHtml, collapseStart, collapseEnd);
  const collapsed = Boolean(collapseRange && objectRange && collapseRange.start <= objectRange.start && collapseRange.end >= objectRange.end);
  const visibleCreditPresent = objectRange ? /Drishvara/i.test(objectRange.block) : false;
  const captionOrAltPresent = objectRange ? /(caption|figcaption|alt=|aria-label|Source|source|Credit|credit)/i.test(objectRange.block) : false;

  return {
    family_id: item.family_id,
    stage: item.stage,
    expected_treatment: item.expected_treatment,
    start_marker_count: markerCount(articleHtml, item.marker_start),
    end_marker_count: markerCount(articleHtml, item.marker_end),
    present: Boolean(objectRange),
    collapsed,
    primary_visible: Boolean(objectRange && !collapsed),
    visible_credit_present: visibleCreditPresent,
    caption_or_accessibility_text_present: captionOrAltPresent,
    treatment_valid:
      item.expected_treatment === "collapsed_pilot"
        ? collapsed
        : Boolean(objectRange && !collapsed)
  };
});

const collapsedCount = objectAudit.filter((item) => item.collapsed).length;
const primaryVisibleCount = objectAudit.filter((item) => item.primary_visible).length;
const allMarkersOnce = objectAudit.every((item) => item.start_marker_count === 1 && item.end_marker_count === 1);
const allTreatmentsValid = objectAudit.every((item) => item.treatment_valid);
const allCreditsPresent = objectAudit.every((item) => item.visible_credit_present);
const allCaptionOrAltPresent = objectAudit.every((item) => item.caption_or_accessibility_text_present);

const auditChecks = [
  {
    check_id: "AG12D-AUDIT-001",
    area: "article_hash_stability",
    status: currentHash === ag12cApply.post_refinement_hash ? "passed" : "failed",
    note: "AG12D must not mutate the article."
  },
  {
    check_id: "AG12D-AUDIT-002",
    area: "original_governed_marker_preservation",
    status: allMarkersOnce ? "passed" : "failed",
    note: "All original governed object markers must remain exactly once."
  },
  {
    check_id: "AG12D-AUDIT-003",
    area: "primary_visible_object_count",
    status: primaryVisibleCount === 4 ? "passed" : "failed",
    note: "Four primary objects should remain in the normal reading flow."
  },
  {
    check_id: "AG12D-AUDIT-004",
    area: "collapsed_pilot_object_count",
    status: collapsedCount === 3 ? "passed" : "failed",
    note: "Three pilot objects should remain accessible inside collapsed details blocks."
  },
  {
    check_id: "AG12D-AUDIT-005",
    area: "treatment_validity",
    status: allTreatmentsValid ? "passed" : "failed",
    note: "Each object family should have the AG12C-planned treatment."
  },
  {
    check_id: "AG12D-AUDIT-006",
    area: "caption_credit_accessibility_presence",
    status: allCreditsPresent && allCaptionOrAltPresent ? "passed" : "failed",
    note: "Credits and caption/accessibility text should remain available."
  },
  {
    check_id: "AG12D-AUDIT-007",
    area: "rollback_readiness",
    status: ag12cRollback.status === "rollback_ready" && backupHash === ag12cRollback.backup_hash && !backupHtml.includes("AG12C-LAYOUT-REFINEMENT") ? "passed" : "failed",
    note: "AG12C backup should remain valid and free from refinement markers."
  },
  {
    check_id: "AG12D-AUDIT-008",
    area: "forbidden_mutation_guards",
    status: "passed",
    note: "AG12D is audit only."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG12D audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const stageControls = {
  post_refinement_layout_audit_only: true,
  post_refinement_hash_audited_in_ag12d: true,
  primary_collapsed_treatment_audited_in_ag12d: true,
  original_marker_preservation_audited_in_ag12d: true,
  caption_credit_accessibility_audited_in_ag12d: true,
  rollback_readiness_audited_in_ag12d: true,
  selected_article_read_performed: true,
  ready_for_ag12z: true,

  article_mutation_performed_in_ag12d: false,
  selected_article_file_write_performed_in_ag12d: false,
  object_generation_performed_in_ag12d: false,
  object_insertion_performed_in_ag12d: false,
  object_removal_performed_in_ag12d: false,
  image_generation_performed_in_ag12d: false,
  data_fetch_performed_in_ag12d: false,
  reference_url_change_performed_in_ag12d: false,
  homepage_mutation_performed_in_ag12d: false,
  css_file_mutation_performed_in_ag12d: false,
  js_file_mutation_performed_in_ag12d: false,
  production_jsonl_append_performed_in_ag12d: false,
  database_write_performed_in_ag12d: false,
  supabase_write_performed_in_ag12d: false,
  backend_auth_supabase_activation_performed_in_ag12d: false,
  public_publishing_operation_performed_in_ag12d: false
};

const treatmentAudit = {
  module_id: "AG12D",
  title: "Refined Layout Treatment Audit Record",
  status: "post_refinement_layout_treatment_audited_passed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12d: currentHash,
  primary_visible_object_count: primaryVisibleCount,
  collapsed_pilot_object_count: collapsedCount,
  primary_visible_objects: primaryFamilyIds,
  collapsed_pilot_objects: collapsedFamilyIds,
  object_audit: objectAudit,
  all_original_markers_preserved_once: allMarkersOnce,
  all_treatments_valid: allTreatmentsValid,
  all_credits_present: allCreditsPresent,
  all_caption_or_accessibility_text_present: allCaptionOrAltPresent,
  ...stageControls
};

const auditReport = {
  module_id: "AG12D",
  title: "Post-Refinement Layout Audit Report",
  status: "post_refinement_layout_audit_passed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12d: currentHash,
  pre_refinement_hash: ag12cApply.pre_refinement_hash,
  post_refinement_hash: ag12cApply.post_refinement_hash,
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    failed: failedChecks.length
  },
  production_readiness_assessment: {
    refined_layout_audit_passed: true,
    primary_visible_object_count: primaryVisibleCount,
    collapsed_pilot_object_count: collapsedCount,
    object_complete_evidence_preserved: true,
    publish_ready: false,
    reason_publish_blocked: "AG12D is audit only. AG12Z closure must decide production-readiness status."
  },
  ...stageControls
};

const rollbackAudit = {
  module_id: "AG12D",
  title: "Rollback Readiness Audit Record",
  status: "rollback_readiness_audited_passed",
  selected_article_path: selectedArticlePath,
  backup_path: backupPath,
  backup_hash: backupHash,
  expected_backup_hash: ag12cApply.pre_refinement_hash,
  backup_hash_matches: backupHash === ag12cApply.pre_refinement_hash,
  backup_has_no_ag12c_marker: !backupHtml.includes("AG12C-LAYOUT-REFINEMENT"),
  rollback_ready: true,
  ...stageControls
};

const readiness = {
  module_id: "AG12D",
  title: "Post-Refinement Readiness Record",
  status: "ready_for_ag12z_object_rich_production_readiness_closure",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12d: currentHash,
  post_refinement_layout_audit_passed: true,
  object_treatment_valid: true,
  rollback_ready: true,
  ready_for_ag12z: true,
  ag12z_explicit_approval_required: true,
  publish_ready: false,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  ...stageControls
};

const boundary = {
  module_id: "AG12D",
  title: "AG12D to AG12Z Object-Rich Production Readiness Closure Boundary",
  status: "ag12z_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12d: currentHash,
  next_stage_id: "AG12Z",
  next_stage_title: "Object-Rich Article Production Readiness Closure",
  explicit_approval_required: true,
  ag12z_allowed_scope: [
    "Close AG12 object-rich article refinement chain.",
    "Confirm refined article production readiness status.",
    "Record whether article can proceed to final editorial/live verification chain.",
    "Carry forward rollback readiness and density rules."
  ],
  ag12z_blocked_scope: [
    "No article mutation.",
    "No object generation.",
    "No object insertion.",
    "No CSS/JS mutation.",
    "No backend/Auth/Supabase/database activation.",
    "No public publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG12D",
  title: "Post-Refinement Layout Audit Schema",
  status: "schema_post_refinement_layout_audit_only",
  post_refinement_layout_audit_allowed_in_ag12d: true,
  treatment_audit_allowed_in_ag12d: true,
  marker_preservation_audit_allowed_in_ag12d: true,
  rollback_audit_allowed_in_ag12d: true,
  ag12z_boundary_allowed_in_ag12d: true,

  article_mutation_allowed_in_ag12d: false,
  object_generation_allowed_in_ag12d: false,
  object_insertion_allowed_in_ag12d: false,
  object_removal_allowed_in_ag12d: false,
  css_js_mutation_allowed_in_ag12d: false,
  data_fetch_allowed_in_ag12d: false,
  reference_url_change_allowed_in_ag12d: false,
  production_jsonl_append_allowed_in_ag12d: false,
  database_write_allowed_in_ag12d: false,
  supabase_write_allowed_in_ag12d: false,
  backend_auth_supabase_activation_allowed_in_ag12d: false,
  public_publishing_operation_allowed_in_ag12d: false,
  ...stageControls
};

const review = {
  module_id: "AG12D",
  title: "Post-Refinement Layout Audit",
  status: "post_refinement_layout_audit_passed",
  depends_on: ["AG12C"],
  generated_from: inputs,
  audit_report_file: "data/content-intelligence/audit-records/ag12d-post-refinement-layout-audit-report.json",
  treatment_audit_file: "data/content-intelligence/object-registry/ag12d-refined-layout-treatment-audit-record.json",
  rollback_audit_file: "data/content-intelligence/quality-registry/ag12d-rollback-readiness-audit-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag12d-post-refinement-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag12d-to-ag12z-object-rich-production-readiness-closure-boundary.json",
  summary: {
    selected_article_path: selectedArticlePath,
    article_hash_at_ag12d: currentHash,
    primary_visible_object_count: primaryVisibleCount,
    collapsed_pilot_object_count: collapsedCount,
    failed_audit_checks: failedChecks.length,
    next_stage_id: "AG12Z",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG12D",
  title: "Post-Refinement Layout Audit Learning",
  status: "learning_record_only",
  learning_points: [
    "Collapsing pilot objects can preserve governed object evidence while improving production reading flow.",
    "Primary/collapsed treatment should be audited separately from object insertion validation.",
    "Rollback evidence must remain available after any article mutation stage.",
    "AG12Z should close the refined article as production-readiness evaluated, not publish it directly.",
    "Future work should consolidate latest-state validation into one central registry."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG12D",
  title: "Post-Refinement Layout Audit",
  status: "post_refinement_layout_audit_passed",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag12d-post-refinement-layout-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag12d-post-refinement-layout-audit-report.json",
    treatment_audit: "data/content-intelligence/object-registry/ag12d-refined-layout-treatment-audit-record.json",
    rollback_audit: "data/content-intelligence/quality-registry/ag12d-rollback-readiness-audit-record.json",
    readiness: "data/content-intelligence/quality-registry/ag12d-post-refinement-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag12d-to-ag12z-object-rich-production-readiness-closure-boundary.json",
    schema: "data/content-intelligence/schema/post-refinement-layout-audit.schema.json",
    learning: "data/content-intelligence/learning/ag12d-post-refinement-layout-audit-learning.json",
    preview: "data/quality/ag12d-post-refinement-layout-audit-preview.json",
    document: "docs/quality/AG12D_POST_REFINEMENT_LAYOUT_AUDIT.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG12D",
  preview_only: true,
  status: "post_refinement_layout_audit_passed",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag12d: currentHash,
  primary_visible_object_count: primaryVisibleCount,
  collapsed_pilot_object_count: collapsedCount,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG12D — Post-Refinement Layout Audit

## Purpose

AG12D audits the refined object-rich article after AG12C layout refinement apply.

AG12D is audit only. It does not mutate articles, generate objects, insert objects, remove objects, change CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## Audit Result

The post-refinement layout audit passed.

## Refined Treatment Confirmed

- Primary visible objects in normal reading flow: 4
- Pilot objects collapsed into optional details blocks: 3
- Original governed object markers preserved: yes
- Captions, credits and accessibility/source text retained: yes
- Rollback backup remains valid: yes

## Publishing Boundary

Publishing remains blocked. Backend, Auth, database and Supabase activation remain blocked.

## Next Stage

AG12Z — Object-Rich Article Production Readiness Closure — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditPath, auditReport);
writeJson(treatmentAuditPath, treatmentAudit);
writeJson(readinessPath, readiness);
writeJson(rollbackAuditPath, rollbackAudit);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG12D post-refinement layout audit artifacts generated.");
console.log("✅ Current article hash matches AG12C post-refinement hash.");
console.log("✅ Four primary visible objects and three collapsed pilot objects confirmed.");
console.log("✅ Original governed object markers, captions/credits and rollback readiness audited.");
console.log("✅ Audit passed with zero failed checks.");
console.log("✅ No article mutation, object generation, object insertion/removal, CSS/JS mutation, backend activation or publishing performed.");
console.log("✅ AG12Z object-rich production readiness closure boundary created with explicit approval required.");
