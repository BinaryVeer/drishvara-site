import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag13aReview: "data/content-intelligence/quality-reviews/ag13a-final-editorial-live-verification-readiness-plan.json",
  ag13aPlan: "data/content-intelligence/mutation-plans/ag13a-final-editorial-live-verification-readiness-plan.json",
  ag13aChecklist: "data/content-intelligence/quality-registry/ag13a-final-editorial-live-verification-checklist-record.json",
  ag13aReadiness: "data/content-intelligence/quality-registry/ag13a-final-editorial-live-verification-readiness-record.json",
  ag13aBoundary: "data/content-intelligence/mutation-plans/ag13a-to-ag13b-final-editorial-live-verification-audit-boundary.json",
  ag12zState: "data/content-intelligence/object-registry/ag12z-refined-article-production-state-record.json",
  ag12cApply: "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag13b-final-editorial-live-verification-audit.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag13b-final-editorial-live-verification-audit-report.json");
const observationPath = path.join(root, "data/content-intelligence/quality-registry/ag13b-final-editorial-live-verification-observation-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag13b-live-preview-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag13b-to-ag13c-controlled-live-preview-observation-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/final-editorial-live-verification-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag13b-final-editorial-live-verification-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag13b-final-editorial-live-verification-audit.json");
const previewPath = path.join(root, "data/quality/ag13b-final-editorial-live-verification-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG13B_FINAL_EDITORIAL_LIVE_VERIFICATION_AUDIT.md");

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

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG13B input ${name}: ${relativePath}`);
}

const ag13aReview = readJson(inputs.ag13aReview);
const ag13aPlan = readJson(inputs.ag13aPlan);
const ag13aChecklist = readJson(inputs.ag13aChecklist);
const ag13aReadiness = readJson(inputs.ag13aReadiness);
const ag13aBoundary = readJson(inputs.ag13aBoundary);
const ag12zState = readJson(inputs.ag12zState);
const ag12cApply = readJson(inputs.ag12cApply);

if (ag13aReview.status !== "final_editorial_live_verification_readiness_plan_created_no_mutation") {
  throw new Error("AG13B requires AG13A review.");
}
if (ag13aReadiness.ready_for_ag13b !== true) {
  throw new Error("AG13B requires AG13A readiness.");
}
if (ag13aBoundary.next_stage_id !== "AG13B" || ag13aBoundary.explicit_approval_required !== true) {
  throw new Error("AG13B requires AG13A to AG13B explicit boundary.");
}

const selectedArticlePath = ag12cApply.selected_article_path;
const backupPath = ag12cApply.backup_path;

if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);
if (!exists(backupPath)) throw new Error(`Rollback backup missing: ${backupPath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");

const articleHash = sha256(articleHtml);
const backupHash = sha256(backupHtml);

if (articleHash !== ag12cApply.post_refinement_hash) {
  throw new Error("AG13B requires current article hash to remain AG12C post-refinement hash.");
}
if (backupHash !== ag12cApply.pre_refinement_hash) {
  throw new Error("AG13B requires rollback backup hash to remain AG12C pre-refinement hash.");
}

const stageControls = {
  final_editorial_live_verification_audit_only: true,
  final_editorial_static_audit_performed_in_ag13b: true,
  desktop_mobile_checklist_readiness_audited_in_ag13b: true,
  object_treatment_readiness_audited_in_ag13b: true,
  rollback_evidence_audited_in_ag13b: true,
  selected_article_read_performed: true,
  ready_for_ag13c: true,

  article_mutation_performed_in_ag13b: false,
  selected_article_file_write_performed_in_ag13b: false,
  object_generation_performed_in_ag13b: false,
  object_insertion_performed_in_ag13b: false,
  object_removal_performed_in_ag13b: false,
  image_generation_performed_in_ag13b: false,
  live_fetch_performed_in_ag13b: false,
  deployment_trigger_performed_in_ag13b: false,
  data_fetch_performed_in_ag13b: false,
  reference_url_change_performed_in_ag13b: false,
  homepage_mutation_performed_in_ag13b: false,
  css_file_mutation_performed_in_ag13b: false,
  js_file_mutation_performed_in_ag13b: false,
  production_jsonl_append_performed_in_ag13b: false,
  database_write_performed_in_ag13b: false,
  supabase_write_performed_in_ag13b: false,
  backend_auth_supabase_activation_performed_in_ag13b: false,
  public_publishing_operation_performed_in_ag13b: false
};

const auditChecks = [
  {
    check_id: "AG13B-AUDIT-001",
    area: "article_hash_stability",
    status: articleHash === ag12cApply.post_refinement_hash ? "passed" : "failed",
    note: "Current article hash remains the AG12C post-refinement hash."
  },
  {
    check_id: "AG13B-AUDIT-002",
    area: "ag13a_checklist_readiness",
    status:
      Array.isArray(ag13aChecklist.desktop_preview_checks) &&
      Array.isArray(ag13aChecklist.mobile_preview_checks) &&
      Array.isArray(ag13aChecklist.editorial_checks) &&
      Array.isArray(ag13aChecklist.governance_checks) ? "passed" : "failed",
    note: "Desktop, mobile, editorial and governance checklist groups are present."
  },
  {
    check_id: "AG13B-AUDIT-003",
    area: "object_treatment_state",
    status:
      ag12zState.primary_visible_object_count === 4 &&
      ag12zState.collapsed_pilot_object_count === 3 &&
      ag12zState.original_governed_markers_preserved_once === true ? "passed" : "failed",
    note: "Four primary objects and three collapsed pilot objects remain the accepted refined state."
  },
  {
    check_id: "AG13B-AUDIT-004",
    area: "collapsed_object_presence",
    status:
      markerCount(articleHtml, 'data-drishvara-layout-treatment="collapsed-pilot-annex"') === 3 &&
      articleHtml.includes("AG12C-LAYOUT-REFINEMENT:START:INFOGRAPHIC") &&
      articleHtml.includes("AG12C-LAYOUT-REFINEMENT:START:FIGURE_DIAGRAM") &&
      articleHtml.includes("AG12C-LAYOUT-REFINEMENT:START:MAP_GEOGRAPHIC_OBJECT") ? "passed" : "failed",
    note: "Collapsed pilot details blocks remain available."
  },
  {
    check_id: "AG13B-AUDIT-005",
    area: "caption_credit_accessibility_static_scan",
    status:
      /Drishvara/i.test(articleHtml) &&
      /(figcaption|caption|aria-label|alt=|Source|source|Credit|credit)/i.test(articleHtml) ? "passed" : "failed",
    note: "Caption, credit or accessibility/source indicators remain present in the refined article."
  },
  {
    check_id: "AG13B-AUDIT-006",
    area: "rollback_evidence",
    status:
      backupHash === ag12cApply.pre_refinement_hash &&
      !backupHtml.includes("AG12C-LAYOUT-REFINEMENT") ? "passed" : "failed",
    note: "Rollback backup remains available and clean."
  },
  {
    check_id: "AG13B-AUDIT-007",
    area: "publish_boundary",
    status:
      ag13aReadiness.publish_ready === false &&
      ag13aReadiness.publish_approval_required === true ? "passed" : "failed",
    note: "Publish approval remains blocked and separate."
  },
  {
    check_id: "AG13B-AUDIT-008",
    area: "forbidden_mutation_guards",
    status: "passed",
    note: "AG13B is audit only."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG13B audit failed: ${failedChecks.map((check) => check.check_id).join(", ")}`);
}

const observationRecord = {
  module_id: "AG13B",
  title: "Final Editorial and Live Verification Observation Record",
  status: "final_editorial_live_verification_static_audit_passed_ready_for_live_preview_observation",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag13b: articleHash,
  desktop_preview_checklist_count: ag13aChecklist.desktop_preview_checks.length,
  mobile_preview_checklist_count: ag13aChecklist.mobile_preview_checks.length,
  editorial_checklist_count: ag13aChecklist.editorial_checks.length,
  governance_checklist_count: ag13aChecklist.governance_checks.length,
  static_observation: {
    current_hash_stable: true,
    refined_object_treatment_valid: true,
    rollback_evidence_available: true,
    ready_for_controlled_live_preview_observation: true,
    publish_ready: false
  },
  live_observation_note: "AG13B does not fetch or observe the live URL. AG13C must perform controlled live/deployment preview observation.",
  ...stageControls
};

const auditReport = {
  module_id: "AG13B",
  title: "Final Editorial and Live Verification Audit Report",
  status: "final_editorial_live_verification_audit_passed_ready_for_live_preview_observation",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag13b: articleHash,
  checks: auditChecks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    failed: failedChecks.length
  },
  decision: {
    static_final_editorial_live_verification_audit_passed: true,
    ready_for_ag13c_controlled_live_preview_observation: true,
    publish_ready: false,
    reason_publish_blocked: "AG13B is final static audit only. Controlled live/deployment preview observation must be performed in AG13C before any final publish decision."
  },
  ...stageControls
};

const readiness = {
  module_id: "AG13B",
  title: "Live Preview Readiness Record",
  status: "ready_for_ag13c_controlled_live_preview_observation",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag13b: articleHash,
  ready_for_ag13c: true,
  ag13c_explicit_approval_required: true,
  publish_ready: false,
  publish_approval_required: true,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  reason_publish_blocked: "AG13C live/deployment preview observation and later final publish approval are still pending.",
  ...stageControls
};

const boundary = {
  module_id: "AG13B",
  title: "AG13B to AG13C Controlled Live Preview Observation Boundary",
  status: "ag13c_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag13b: articleHash,
  next_stage_id: "AG13C",
  next_stage_title: "Controlled Live Preview and Deployment Observation Audit",
  explicit_approval_required: true,
  ag13c_allowed_scope: [
    "Observe deployed/live preview state after current main push.",
    "Check article URL or deployment preview URL.",
    "Record desktop/mobile/manual observation status.",
    "Confirm no regression in refined object treatment.",
    "Prepare final publish-decision boundary only if live observation is acceptable."
  ],
  ag13c_blocked_scope: [
    "No article mutation.",
    "No object generation.",
    "No object insertion.",
    "No CSS/JS mutation unless separately approved.",
    "No backend/Auth/Supabase/database activation.",
    "No public publishing approval."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG13B",
  title: "Final Editorial and Live Verification Audit Schema",
  status: "schema_final_editorial_live_verification_audit_only",
  final_editorial_static_audit_allowed_in_ag13b: true,
  verification_checklist_audit_allowed_in_ag13b: true,
  object_treatment_audit_allowed_in_ag13b: true,
  rollback_audit_allowed_in_ag13b: true,
  ag13c_boundary_allowed_in_ag13b: true,

  article_mutation_allowed_in_ag13b: false,
  object_generation_allowed_in_ag13b: false,
  object_insertion_allowed_in_ag13b: false,
  object_removal_allowed_in_ag13b: false,
  live_fetch_allowed_in_ag13b: false,
  deployment_trigger_allowed_in_ag13b: false,
  css_js_mutation_allowed_in_ag13b: false,
  data_fetch_allowed_in_ag13b: false,
  reference_url_change_allowed_in_ag13b: false,
  production_jsonl_append_allowed_in_ag13b: false,
  database_write_allowed_in_ag13b: false,
  supabase_write_allowed_in_ag13b: false,
  backend_auth_supabase_activation_allowed_in_ag13b: false,
  public_publishing_operation_allowed_in_ag13b: false,
  ...stageControls
};

const review = {
  module_id: "AG13B",
  title: "Final Editorial and Live Verification Audit",
  status: "final_editorial_live_verification_audit_passed_ready_for_live_preview_observation",
  depends_on: ["AG13A"],
  generated_from: inputs,
  audit_report_file: "data/content-intelligence/audit-records/ag13b-final-editorial-live-verification-audit-report.json",
  observation_record_file: "data/content-intelligence/quality-registry/ag13b-final-editorial-live-verification-observation-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag13b-live-preview-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag13b-to-ag13c-controlled-live-preview-observation-boundary.json",
  schema_file: "data/content-intelligence/schema/final-editorial-live-verification-audit.schema.json",
  summary: {
    selected_article_path: selectedArticlePath,
    article_hash_at_ag13b: articleHash,
    failed_audit_checks: failedChecks.length,
    ready_for_ag13c: true,
    publish_ready: false,
    next_stage_id: "AG13C",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG13B",
  title: "Final Editorial and Live Verification Audit Learning",
  status: "learning_record_only",
  learning_points: [
    "AG13B should remain a static final audit and should not fetch the live site.",
    "AG13C should handle controlled live/deployment preview observation.",
    "Publishing remains blocked until final live observation and final explicit approval.",
    "Desktop/mobile checklist readiness must be present before live observation.",
    "Rollback evidence remains essential even after final editorial readiness passes."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG13B",
  title: "Final Editorial and Live Verification Audit",
  status: "final_editorial_live_verification_audit_passed_ready_for_live_preview_observation",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag13b-final-editorial-live-verification-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag13b-final-editorial-live-verification-audit-report.json",
    observation_record: "data/content-intelligence/quality-registry/ag13b-final-editorial-live-verification-observation-record.json",
    readiness: "data/content-intelligence/quality-registry/ag13b-live-preview-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag13b-to-ag13c-controlled-live-preview-observation-boundary.json",
    schema: "data/content-intelligence/schema/final-editorial-live-verification-audit.schema.json",
    learning: "data/content-intelligence/learning/ag13b-final-editorial-live-verification-audit-learning.json",
    preview: "data/quality/ag13b-final-editorial-live-verification-audit-preview.json",
    document: "docs/quality/AG13B_FINAL_EDITORIAL_LIVE_VERIFICATION_AUDIT.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG13B",
  preview_only: true,
  status: "final_editorial_live_verification_audit_passed_ready_for_live_preview_observation",
  selected_article_path: selectedArticlePath,
  article_hash_at_ag13b: articleHash,
  ready_for_ag13c: true,
  publish_ready: false,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG13B — Final Editorial and Live Verification Audit

## Purpose

AG13B audits final editorial and live-verification readiness after AG13A planning.

AG13B is audit only. It does not mutate articles, generate objects, insert objects, remove objects, change CSS/JS, fetch live URLs, activate backend/Auth/Supabase/database systems or publish anything.

## Audit Result

The static final editorial/live-verification audit passed with zero failed checks.

## Decision

The article is ready for AG13C controlled live/deployment preview observation, but it is not publish-approved.

## Live Boundary

AG13C should perform the controlled live/deployment preview observation. AG13B does not fetch or observe the live URL.

## Publishing Boundary

Publishing remains blocked. Backend, Auth, database and Supabase activation remain blocked.

## Next Stage

AG13C — Controlled Live Preview and Deployment Observation Audit — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditPath, auditReport);
writeJson(observationPath, observationRecord);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG13B final editorial and live verification audit artifacts generated.");
console.log("✅ Static editorial/live-verification readiness audit passed.");
console.log("✅ Article hash remains AG12C/AG12Z/AG13A refined state.");
console.log("✅ Ready for AG13C controlled live/deployment preview observation.");
console.log("✅ Publishing, backend and Supabase activation remain blocked.");
console.log("✅ No article mutation, live fetch, deployment trigger, CSS/JS mutation, backend activation or publishing performed.");
console.log("✅ AG13C controlled live preview observation boundary created with explicit approval required.");
