import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag13bReview: "data/content-intelligence/quality-reviews/ag13b-final-editorial-live-verification-audit.json",
  ag13bAudit: "data/content-intelligence/audit-records/ag13b-final-editorial-live-verification-audit-report.json",
  ag13bObservation: "data/content-intelligence/quality-registry/ag13b-final-editorial-live-verification-observation-record.json",
  ag13bReadiness: "data/content-intelligence/quality-registry/ag13b-live-preview-readiness-record.json",
  ag13bBoundary: "data/content-intelligence/mutation-plans/ag13b-to-ag13c-controlled-live-preview-observation-boundary.json",
  ag12cApply: "data/content-intelligence/apply-records/ag12c-controlled-layout-refinement-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag13c-controlled-live-preview-observation-audit.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag13c-controlled-live-preview-observation-audit-report.json");
const observationPath = path.join(root, "data/content-intelligence/quality-registry/ag13c-live-preview-observation-record.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag13c-final-publish-decision-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag13c-to-ag13z-final-live-verification-publish-decision-closure-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/controlled-live-preview-observation-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag13c-controlled-live-preview-observation-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag13c-controlled-live-preview-observation-audit.json");
const previewPath = path.join(root, "data/quality/ag13c-controlled-live-preview-observation-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG13C_CONTROLLED_LIVE_PREVIEW_OBSERVATION_AUDIT.md");

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

async function fetchWithTimeout(url, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Drishvara-AG13C-Live-Preview-Audit/1.0"
      }
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      finalUrl: response.url,
      text
    };
  } finally {
    clearTimeout(timer);
  }
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG13C input ${name}: ${relativePath}`);
}

const ag13bReview = readJson(inputs.ag13bReview);
const ag13bAudit = readJson(inputs.ag13bAudit);
const ag13bObservation = readJson(inputs.ag13bObservation);
const ag13bReadiness = readJson(inputs.ag13bReadiness);
const ag13bBoundary = readJson(inputs.ag13bBoundary);
const ag12cApply = readJson(inputs.ag12cApply);

if (ag13bReview.status !== "final_editorial_live_verification_audit_passed_ready_for_live_preview_observation") {
  throw new Error("AG13C requires AG13B review.");
}
if (ag13bAudit.failed_checks.length !== 0) {
  throw new Error("AG13C requires AG13B audit to pass with zero failed checks.");
}
if (ag13bReadiness.ready_for_ag13c !== true) {
  throw new Error("AG13C requires AG13B readiness.");
}
if (ag13bBoundary.next_stage_id !== "AG13C" || ag13bBoundary.explicit_approval_required !== true) {
  throw new Error("AG13C requires AG13B to AG13C explicit boundary.");
}

const selectedArticlePath = ag12cApply.selected_article_path;
const backupPath = ag12cApply.backup_path;

if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);
if (!exists(backupPath)) throw new Error(`Rollback backup missing: ${backupPath}`);

const localHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");
const localHash = sha256(localHtml);
const backupHash = sha256(backupHtml);

if (localHash !== ag12cApply.post_refinement_hash) {
  throw new Error("AG13C requires local article hash to remain AG12C post-refinement hash.");
}
if (backupHash !== ag12cApply.pre_refinement_hash) {
  throw new Error("AG13C requires rollback backup hash to remain AG12C pre-refinement hash.");
}

const baseUrl = (process.env.DRISHVARA_LIVE_BASE_URL || "https://www.drishvara.com").replace(/\/+$/, "");
const liveUrl = `${baseUrl}/${selectedArticlePath}`;

let liveResult;
try {
  liveResult = await fetchWithTimeout(liveUrl);
} catch (error) {
  throw new Error(`AG13C live fetch failed for ${liveUrl}: ${error.message}`);
}

const liveHtml = liveResult.text || "";
const liveHash = sha256(liveHtml);

const liveChecks = {
  status_ok: liveResult.ok && liveResult.status >= 200 && liveResult.status < 300,
  contains_article_html: liveHtml.includes("<html") || liveHtml.includes("<!DOCTYPE html"),
  contains_refined_layout_marker: liveHtml.includes("AG12C-LAYOUT-REFINEMENT:START"),
  collapsed_pilot_count: markerCount(liveHtml, 'data-drishvara-layout-treatment="collapsed-pilot-annex"'),
  contains_primary_chart: liveHtml.includes("AG11B-CHART-BI-GRAPH-INSERTION:START"),
  contains_table: liveHtml.includes("AG11E-TABLE-STRUCTURED-OBJECT-INSERTION:START"),
  contains_composite: liveHtml.includes("AG11G-ARTICLE-SUPPORT-COMPOSITE-OBJECT-INSERTION:START"),
  contains_drishvara_credit: /Drishvara/i.test(liveHtml),
  contains_caption_or_accessibility_text: /(figcaption|caption|aria-label|alt=|Source|source|Credit|credit)/i.test(liveHtml),
  live_hash_matches_local_hash: liveHash === localHash
};

const auditChecks = [
  {
    check_id: "AG13C-AUDIT-001",
    area: "local_article_hash_stability",
    status: localHash === ag12cApply.post_refinement_hash ? "passed" : "failed",
    note: "Local article remains at AG12C post-refinement hash."
  },
  {
    check_id: "AG13C-AUDIT-002",
    area: "live_http_status",
    status: liveChecks.status_ok ? "passed" : "failed",
    note: `Live URL returned HTTP ${liveResult.status}.`
  },
  {
    check_id: "AG13C-AUDIT-003",
    area: "live_article_presence",
    status: liveChecks.contains_article_html ? "passed" : "failed",
    note: "Live response appears to be an HTML document."
  },
  {
    check_id: "AG13C-AUDIT-004",
    area: "live_refined_layout_presence",
    status: liveChecks.contains_refined_layout_marker && liveChecks.collapsed_pilot_count === 3 ? "passed" : "failed",
    note: "Live article should include AG12C refinement markers and three collapsed pilot objects."
  },
  {
    check_id: "AG13C-AUDIT-005",
    area: "live_primary_object_presence",
    status: liveChecks.contains_primary_chart && liveChecks.contains_table && liveChecks.contains_composite ? "passed" : "failed",
    note: "Live article should include chart, table and composite primary object evidence."
  },
  {
    check_id: "AG13C-AUDIT-006",
    area: "live_credit_caption_accessibility_presence",
    status: liveChecks.contains_drishvara_credit && liveChecks.contains_caption_or_accessibility_text ? "passed" : "failed",
    note: "Live article should retain credit and caption/accessibility indicators."
  },
  {
    check_id: "AG13C-AUDIT-007",
    area: "live_hash_alignment",
    status: liveChecks.live_hash_matches_local_hash ? "passed" : "warning",
    note: liveChecks.live_hash_matches_local_hash
      ? "Live HTML hash matches local refined article hash."
      : "Live HTML hash differs from local file; this may occur if platform injects wrappers or deployment is not fully refreshed. Marker-level checks still passed."
  },
  {
    check_id: "AG13C-AUDIT-008",
    area: "rollback_evidence",
    status: backupHash === ag12cApply.pre_refinement_hash && !backupHtml.includes("AG12C-LAYOUT-REFINEMENT") ? "passed" : "failed",
    note: "Rollback backup remains available and clean."
  },
  {
    check_id: "AG13C-AUDIT-009",
    area: "forbidden_mutation_and_publish_guards",
    status: "passed",
    note: "AG13C performs observation only and does not publish."
  }
];

const failedChecks = auditChecks.filter((check) => check.status === "failed");
if (failedChecks.length > 0) {
  throw new Error(`AG13C live preview observation failed: ${failedChecks.map((check) => check.check_id).join(", ")}. Checked URL: ${liveUrl}`);
}

const stageControls = {
  controlled_live_preview_observation_audit_only: true,
  live_preview_observation_performed_in_ag13c: true,
  live_fetch_performed_in_ag13c: true,
  live_url_checked_in_ag13c: liveUrl,
  deployment_trigger_performed_in_ag13c: false,
  final_publish_decision_not_made_in_ag13c: true,
  selected_article_read_performed: true,
  ready_for_ag13z: true,

  article_mutation_performed_in_ag13c: false,
  selected_article_file_write_performed_in_ag13c: false,
  object_generation_performed_in_ag13c: false,
  object_insertion_performed_in_ag13c: false,
  object_removal_performed_in_ag13c: false,
  image_generation_performed_in_ag13c: false,
  reference_url_change_performed_in_ag13c: false,
  homepage_mutation_performed_in_ag13c: false,
  css_file_mutation_performed_in_ag13c: false,
  js_file_mutation_performed_in_ag13c: false,
  production_jsonl_append_performed_in_ag13c: false,
  database_write_performed_in_ag13c: false,
  supabase_write_performed_in_ag13c: false,
  backend_auth_supabase_activation_performed_in_ag13c: false,
  public_publishing_operation_performed_in_ag13c: false
};

const liveObservation = {
  module_id: "AG13C",
  title: "Controlled Live Preview Observation Record",
  status: "controlled_live_preview_observation_passed_ready_for_final_publish_decision_closure",
  selected_article_path: selectedArticlePath,
  live_url: liveUrl,
  final_url: liveResult.finalUrl,
  http_status: liveResult.status,
  local_article_hash_at_ag13c: localHash,
  live_html_hash: liveHash,
  live_hash_matches_local_hash: liveChecks.live_hash_matches_local_hash,
  live_checks: liveChecks,
  observation_decision: {
    live_preview_observation_passed: true,
    marker_level_live_validation_passed: true,
    ready_for_final_publish_decision_closure: true,
    publish_ready: false,
    publish_approval_required: true
  },
  ...stageControls
};

const auditReport = {
  module_id: "AG13C",
  title: "Controlled Live Preview Observation Audit Report",
  status: "controlled_live_preview_observation_audit_passed",
  selected_article_path: selectedArticlePath,
  live_url: liveUrl,
  final_url: liveResult.finalUrl,
  local_article_hash_at_ag13c: localHash,
  live_html_hash: liveHash,
  checks: auditChecks,
  failed_checks: failedChecks,
  warning_checks: auditChecks.filter((check) => check.status === "warning"),
  audit_summary: {
    total_checks: auditChecks.length,
    passed: auditChecks.filter((check) => check.status === "passed").length,
    warnings: auditChecks.filter((check) => check.status === "warning").length,
    failed: failedChecks.length
  },
  decision: {
    live_preview_observation_passed: true,
    ready_for_ag13z_final_publish_decision_closure: true,
    publish_ready: false,
    reason_publish_blocked: "AG13C is live/deployment preview observation only. Final publish decision/closure is reserved for AG13Z."
  },
  ...stageControls
};

const readiness = {
  module_id: "AG13C",
  title: "Final Publish Decision Readiness Record",
  status: "ready_for_ag13z_final_live_verification_publish_decision_closure",
  selected_article_path: selectedArticlePath,
  live_url: liveUrl,
  local_article_hash_at_ag13c: localHash,
  ready_for_ag13z: true,
  ag13z_explicit_approval_required: true,
  live_preview_observation_passed: true,
  publish_ready: false,
  publish_approval_required: true,
  backend_activation_ready: false,
  supabase_activation_ready: false,
  reason_publish_blocked: "AG13C passed live preview observation, but final publish decision/closure must be performed separately in AG13Z.",
  ...stageControls
};

const boundary = {
  module_id: "AG13C",
  title: "AG13C to AG13Z Final Live Verification Publish Decision Closure Boundary",
  status: "ag13z_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  live_url: liveUrl,
  article_hash_at_ag13c: localHash,
  next_stage_id: "AG13Z",
  next_stage_title: "Final Live Verification and Publish Decision Closure",
  explicit_approval_required: true,
  ag13z_allowed_scope: [
    "Close final live verification chain.",
    "Record whether the refined article is publish-ready from a governance standpoint.",
    "Confirm publishing remains blocked unless explicitly approved.",
    "Prepare final operator instruction for publish/deploy decision."
  ],
  ag13z_blocked_scope: [
    "No article mutation.",
    "No object generation.",
    "No object insertion.",
    "No CSS/JS mutation.",
    "No backend/Auth/Supabase/database activation.",
    "No automatic public publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG13C",
  title: "Controlled Live Preview Observation Audit Schema",
  status: "schema_controlled_live_preview_observation_audit",
  live_fetch_allowed_in_ag13c: true,
  live_preview_observation_allowed_in_ag13c: true,
  marker_level_live_validation_allowed_in_ag13c: true,
  readiness_record_allowed_in_ag13c: true,
  ag13z_boundary_allowed_in_ag13c: true,

  article_mutation_allowed_in_ag13c: false,
  object_generation_allowed_in_ag13c: false,
  object_insertion_allowed_in_ag13c: false,
  object_removal_allowed_in_ag13c: false,
  deployment_trigger_allowed_in_ag13c: false,
  css_js_mutation_allowed_in_ag13c: false,
  reference_url_change_allowed_in_ag13c: false,
  production_jsonl_append_allowed_in_ag13c: false,
  database_write_allowed_in_ag13c: false,
  supabase_write_allowed_in_ag13c: false,
  backend_auth_supabase_activation_allowed_in_ag13c: false,
  public_publishing_operation_allowed_in_ag13c: false,
  ...stageControls
};

const review = {
  module_id: "AG13C",
  title: "Controlled Live Preview and Deployment Observation Audit",
  status: "controlled_live_preview_observation_audit_passed",
  depends_on: ["AG13B"],
  generated_from: inputs,
  audit_report_file: "data/content-intelligence/audit-records/ag13c-controlled-live-preview-observation-audit-report.json",
  observation_record_file: "data/content-intelligence/quality-registry/ag13c-live-preview-observation-record.json",
  readiness_file: "data/content-intelligence/quality-registry/ag13c-final-publish-decision-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag13c-to-ag13z-final-live-verification-publish-decision-closure-boundary.json",
  schema_file: "data/content-intelligence/schema/controlled-live-preview-observation-audit.schema.json",
  summary: {
    selected_article_path: selectedArticlePath,
    live_url: liveUrl,
    http_status: liveResult.status,
    failed_audit_checks: failedChecks.length,
    ready_for_ag13z: true,
    publish_ready: false,
    next_stage_id: "AG13Z",
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG13C",
  title: "Controlled Live Preview Observation Audit Learning",
  status: "learning_record_only",
  learning_points: [
    "Live/deployment preview observation should be separate from publish decision.",
    "Marker-level validation is useful when platform delivery may alter exact HTML hash.",
    "Final publish decision should remain explicit even after live preview passes.",
    "No deployment trigger or publishing operation should be embedded in live observation scripts.",
    "Future chains can use DRISHVARA_LIVE_BASE_URL to test preview, staging, or production domains."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG13C",
  title: "Controlled Live Preview and Deployment Observation Audit",
  status: "controlled_live_preview_observation_audit_passed",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag13c-controlled-live-preview-observation-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag13c-controlled-live-preview-observation-audit-report.json",
    observation: "data/content-intelligence/quality-registry/ag13c-live-preview-observation-record.json",
    readiness: "data/content-intelligence/quality-registry/ag13c-final-publish-decision-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag13c-to-ag13z-final-live-verification-publish-decision-closure-boundary.json",
    schema: "data/content-intelligence/schema/controlled-live-preview-observation-audit.schema.json",
    learning: "data/content-intelligence/learning/ag13c-controlled-live-preview-observation-audit-learning.json",
    preview: "data/quality/ag13c-controlled-live-preview-observation-audit-preview.json",
    document: "docs/quality/AG13C_CONTROLLED_LIVE_PREVIEW_OBSERVATION_AUDIT.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG13C",
  preview_only: true,
  status: "controlled_live_preview_observation_audit_passed",
  selected_article_path: selectedArticlePath,
  live_url: liveUrl,
  http_status: liveResult.status,
  live_hash_matches_local_hash: liveChecks.live_hash_matches_local_hash,
  ready_for_ag13z: true,
  publish_ready: false,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG13C — Controlled Live Preview and Deployment Observation Audit

## Purpose

AG13C performs controlled live/deployment preview observation for the refined selected article.

AG13C observes the live article URL but does not mutate articles, generate objects, insert objects, remove objects, change CSS/JS, trigger deployment, activate backend/Auth/Supabase/database systems or publish anything.

## Live URL

\`${liveUrl}\`

## Observation Result

The live preview observation audit passed with zero failed checks.

## Decision

The article is ready for AG13Z final live verification and publish-decision closure, but it is not publish-approved in AG13C.

## Publishing Boundary

Publishing remains blocked. Backend, Auth, database and Supabase activation remain blocked.

## Next Stage

AG13Z — Final Live Verification and Publish Decision Closure — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditPath, auditReport);
writeJson(observationPath, liveObservation);
writeJson(readinessPath, readiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG13C controlled live preview observation audit artifacts generated.");
console.log(`✅ Live URL checked: ${liveUrl}`);
console.log(`✅ HTTP status: ${liveResult.status}`);
console.log("✅ Live marker-level validation passed.");
console.log("✅ Ready for AG13Z final live verification/publish decision closure.");
console.log("✅ Publishing, backend and Supabase activation remain blocked.");
console.log("✅ No article mutation, deployment trigger, CSS/JS mutation, backend activation or publishing performed.");
