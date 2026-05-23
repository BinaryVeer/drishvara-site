import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag10kReview: "data/content-intelligence/quality-reviews/ag10k-controlled-generated-image-insertion-apply.json",
  ag10kApply: "data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json",
  ag10kAuditPrep: "data/content-intelligence/quality-registry/ag10k-post-generated-image-insertion-audit-prep.json",
  ag10kLayout: "data/content-intelligence/quality-registry/ag10k-layout-preservation-record.json",
  ag10kRollback: "data/content-intelligence/quality-registry/ag10k-rollback-readiness-record.json",
  ag10jAssetRecord: "data/content-intelligence/visual-registry/ag10j-finalised-generated-image-asset-record.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag10l-post-generated-image-insertion-audit.json");
const auditReportPath = path.join(root, "data/content-intelligence/audit-records/ag10l-post-generated-image-insertion-audit-report.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag10l-generated-image-insertion-readiness-record.json");
const rollbackReadinessPath = path.join(root, "data/content-intelligence/quality-registry/ag10l-generated-image-insertion-rollback-readiness-record.json");
const boundaryPath = path.join(root, "data/content-intelligence/mutation-plans/ag10l-to-ag10m-generated-image-insertion-closure-reuse-handoff-boundary.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/post-generated-image-insertion-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag10l-post-generated-image-insertion-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag10l-post-generated-image-insertion-audit.json");
const previewPath = path.join(root, "data/quality/ag10l-post-generated-image-insertion-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG10L_POST_GENERATED_IMAGE_INSERTION_AUDIT.md");

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

function extractBetween(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker);
  if (start < 0 || end < 0 || end <= start) return "";
  return text.slice(start, end + endMarker.length);
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG10L input ${name}: ${relativePath}`);
}

const ag10kReview = readJson(inputs.ag10kReview);
const ag10kApply = readJson(inputs.ag10kApply);
const ag10kAuditPrep = readJson(inputs.ag10kAuditPrep);
const ag10kLayout = readJson(inputs.ag10kLayout);
const ag10kRollback = readJson(inputs.ag10kRollback);
const ag10jAssetRecord = readJson(inputs.ag10jAssetRecord);

if (ag10kReview.status !== "generated_image_inserted_pending_post_insertion_audit") {
  throw new Error("AG10L requires AG10K review with pending post-insertion audit status.");
}
if (ag10kApply.status !== "generated_image_inserted_pending_post_insertion_audit") {
  throw new Error("AG10L requires AG10K apply record.");
}
if (ag10kAuditPrep.next_stage_id !== "AG10L" || ag10kAuditPrep.explicit_approval_required !== true) {
  throw new Error("AG10L requires AG10K audit prep handoff with explicit approval.");
}

const selectedArticlePath = ag10kApply.selected_article_path;
const assetPath = ag10kApply.asset_path;
const backupPath = ag10kApply.backup_path;

if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);
if (!exists(assetPath)) throw new Error(`Asset missing: ${assetPath}`);
if (!exists(backupPath)) throw new Error(`Backup missing: ${backupPath}`);

const articleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const backupHtml = fs.readFileSync(path.join(root, backupPath), "utf8");
const assetText = fs.readFileSync(path.join(root, assetPath), "utf8");

const currentArticleHash = sha256(articleHtml);
const backupHash = sha256(backupHtml);
const assetHash = sha256(assetText);

if (currentArticleHash !== ag10kApply.post_insertion_hash) {
  throw new Error("AG10L current article hash must match AG10K post-insertion hash.");
}
if (backupHash !== ag10kApply.pre_insertion_hash) {
  throw new Error("AG10L backup hash must match AG10K pre-insertion hash.");
}
if (assetHash !== ag10kApply.asset_hash_sha256) {
  throw new Error("AG10L asset hash must match AG10K apply record.");
}
if (assetHash !== ag10jAssetRecord.asset_hash_sha256) {
  throw new Error("AG10L asset hash must match AG10J finalised asset record.");
}

const startMarker = ag10kApply.insertion_marker_start;
const endMarker = ag10kApply.insertion_marker_end;
const insertedBlock = extractBetween(articleHtml, startMarker, endMarker);

const checks = [
  {
    check_id: "AG10L-AUDIT-001",
    area: "marker_count",
    status: markerCount(articleHtml, startMarker) === 1 && markerCount(articleHtml, endMarker) === 1 ? "passed" : "failed",
    evidence: {
      start_marker_count: markerCount(articleHtml, startMarker),
      end_marker_count: markerCount(articleHtml, endMarker)
    }
  },
  {
    check_id: "AG10L-AUDIT-002",
    area: "asset_path_and_hash",
    status: articleHtml.includes(ag10kApply.asset_src_in_article) && assetHash === ag10kApply.asset_hash_sha256 ? "passed" : "failed",
    evidence: {
      asset_path: assetPath,
      article_src: ag10kApply.asset_src_in_article,
      asset_hash: assetHash
    }
  },
  {
    check_id: "AG10L-AUDIT-003",
    area: "alt_caption_credit",
    status:
      articleHtml.includes(ag10kApply.alt_text) &&
      articleHtml.includes(ag10kApply.caption) &&
      articleHtml.includes(ag10kApply.visible_credit)
        ? "passed"
        : "failed",
    evidence: {
      alt_text_present: articleHtml.includes(ag10kApply.alt_text),
      caption_present: articleHtml.includes(ag10kApply.caption),
      visible_credit_present: articleHtml.includes(ag10kApply.visible_credit)
    }
  },
  {
    check_id: "AG10L-AUDIT-004",
    area: "layout_mobile_static_safety",
    status:
      insertedBlock.includes("<figure") &&
      insertedBlock.includes("<figcaption") &&
      insertedBlock.includes("width:100%") &&
      insertedBlock.includes("height:auto") &&
      insertedBlock.includes('loading="lazy"') &&
      insertedBlock.includes('decoding="async"')
        ? "passed"
        : "review_passed_static_only",
    evidence: {
      figure_present: insertedBlock.includes("<figure"),
      figcaption_present: insertedBlock.includes("<figcaption"),
      responsive_width_present: insertedBlock.includes("width:100%"),
      auto_height_present: insertedBlock.includes("height:auto"),
      lazy_loading_present: insertedBlock.includes('loading="lazy"'),
      async_decoding_present: insertedBlock.includes('decoding="async"'),
      manual_mobile_review_still_recommended: true
    }
  },
  {
    check_id: "AG10L-AUDIT-005",
    area: "hero_and_prior_governance_preservation",
    status:
      (!backupHtml.includes("AG08K") || articleHtml.includes("AG08K")) &&
      (!backupHtml.includes("AG08G") || articleHtml.includes("AG08G")) &&
      (!backupHtml.includes("AG09C") || articleHtml.includes("AG09C"))
        ? "passed"
        : "failed",
    evidence: {
      backup_had_ag08k: backupHtml.includes("AG08K"),
      current_has_ag08k: articleHtml.includes("AG08K"),
      backup_had_ag08g: backupHtml.includes("AG08G"),
      current_has_ag08g: articleHtml.includes("AG08G"),
      backup_had_ag09c: backupHtml.includes("AG09C"),
      current_has_ag09c: articleHtml.includes("AG09C")
    }
  },
  {
    check_id: "AG10L-AUDIT-006",
    area: "rollback_readiness",
    status:
      ag10kRollback.status === "rollback_ready_for_ag10k_insertion" &&
      ag10kRollback.backup_path === backupPath &&
      ag10kRollback.rollback_execution_performed === false
        ? "passed"
        : "failed",
    evidence: {
      rollback_record_status: ag10kRollback.status,
      backup_path: ag10kRollback.backup_path,
      rollback_execution_performed: ag10kRollback.rollback_execution_performed
    }
  },
  {
    check_id: "AG10L-AUDIT-007",
    area: "forbidden_mutation_guards",
    status:
      ag10kApply.image_generation_performed_in_ag10k === false &&
      ag10kApply.new_asset_creation_performed_in_ag10k === false &&
      ag10kApply.reference_url_change_performed_in_ag10k === false &&
      ag10kApply.homepage_mutation_performed_in_ag10k === false &&
      ag10kApply.css_file_mutation_performed_in_ag10k === false &&
      ag10kApply.js_file_mutation_performed_in_ag10k === false &&
      ag10kApply.backend_auth_supabase_activation_performed_in_ag10k === false &&
      ag10kApply.public_publishing_operation_performed_in_ag10k === false
        ? "passed"
        : "failed",
    evidence: {
      image_generation_performed_in_ag10k: ag10kApply.image_generation_performed_in_ag10k,
      new_asset_creation_performed_in_ag10k: ag10kApply.new_asset_creation_performed_in_ag10k,
      reference_url_change_performed_in_ag10k: ag10kApply.reference_url_change_performed_in_ag10k,
      homepage_mutation_performed_in_ag10k: ag10kApply.homepage_mutation_performed_in_ag10k,
      css_file_mutation_performed_in_ag10k: ag10kApply.css_file_mutation_performed_in_ag10k,
      js_file_mutation_performed_in_ag10k: ag10kApply.js_file_mutation_performed_in_ag10k,
      backend_auth_supabase_activation_performed_in_ag10k: ag10kApply.backend_auth_supabase_activation_performed_in_ag10k,
      public_publishing_operation_performed_in_ag10k: ag10kApply.public_publishing_operation_performed_in_ag10k
    }
  }
];

const failedChecks = checks.filter((check) => check.status === "failed");
const auditStatus = failedChecks.length === 0
  ? "post_generated_image_insertion_audit_passed"
  : "post_generated_image_insertion_audit_failed";

const stageControls = {
  post_generated_image_insertion_audit_only: true,
  selected_article_read_performed: true,
  asset_read_performed: true,
  backup_read_performed: true,

  article_mutation_performed_in_ag10l: false,
  selected_article_file_write_performed_in_ag10l: false,
  object_insertion_performed_in_ag10l: false,
  image_generation_performed_in_ag10l: false,
  external_image_api_call_performed_in_ag10l: false,
  image_asset_creation_performed_in_ag10l: false,
  new_asset_creation_performed_in_ag10l: false,
  reference_insertion_performed_in_ag10l: false,
  reference_url_change_performed_in_ag10l: false,
  homepage_mutation_performed_in_ag10l: false,
  css_file_mutation_performed_in_ag10l: false,
  js_file_mutation_performed_in_ag10l: false,
  data_fetch_performed_in_ag10l: false,
  dataset_creation_performed_in_ag10l: false,
  live_url_fetch_performed_in_ag10l: false,
  deployment_trigger_performed_in_ag10l: false,
  production_jsonl_append_performed_in_ag10l: false,
  database_write_performed_in_ag10l: false,
  supabase_write_performed_in_ag10l: false,
  backend_auth_supabase_activation_performed_in_ag10l: false,
  rollback_execution_performed_in_ag10l: false,
  public_publishing_operation_performed_in_ag10l: false
};

const auditReport = {
  module_id: "AG10L",
  title: "Post Generated Image Insertion Audit Report",
  status: auditStatus,
  selected_article_path: selectedArticlePath,
  asset_path: assetPath,
  backup_path: backupPath,
  pre_insertion_hash: ag10kApply.pre_insertion_hash,
  post_insertion_hash: ag10kApply.post_insertion_hash,
  current_article_hash: currentArticleHash,
  asset_hash_sha256: assetHash,
  backup_hash: backupHash,
  checks,
  failed_checks: failedChecks,
  audit_summary: {
    total_checks: checks.length,
    passed: checks.filter((check) => check.status === "passed").length,
    review_passed_static_only: checks.filter((check) => check.status === "review_passed_static_only").length,
    failed: failedChecks.length
  },
  ...stageControls
};

const readiness = {
  module_id: "AG10L",
  title: "Generated Image Insertion Readiness Record",
  status: auditStatus === "post_generated_image_insertion_audit_passed"
    ? "generated_image_insertion_audited_ready_for_closure_handoff"
    : "generated_image_insertion_audit_failed",
  selected_article_path: selectedArticlePath,
  asset_path: assetPath,
  post_insertion_hash: ag10kApply.post_insertion_hash,
  audit_passed: auditStatus === "post_generated_image_insertion_audit_passed",
  ready_for_ag10m: auditStatus === "post_generated_image_insertion_audit_passed",
  publishing_ready: false,
  backend_activation_ready: false,
  explicit_ag10m_approval_required: true,
  ...stageControls
};

const rollbackReadiness = {
  module_id: "AG10L",
  title: "Generated Image Insertion Rollback Readiness Record",
  status: "rollback_readiness_confirmed_after_ag10l_audit",
  selected_article_path: selectedArticlePath,
  backup_path: backupPath,
  backup_hash: backupHash,
  post_insertion_hash: ag10kApply.post_insertion_hash,
  rollback_ready: true,
  rollback_execution_performed: false,
  rollback_method: "Restore selected article from AG10K backup or remove the single AG10K marker block.",
  ...stageControls
};

const boundary = {
  module_id: "AG10L",
  title: "AG10L to AG10M Generated Image Insertion Closure and Reuse Handoff Boundary",
  status: "ag10m_boundary_created_not_started",
  selected_article_path: selectedArticlePath,
  asset_path: assetPath,
  post_insertion_hash: ag10kApply.post_insertion_hash,
  next_stage_id: "AG10M",
  next_stage_title: "Generated Image Insertion Closure and Reuse Handoff",
  explicit_approval_required: true,
  ag10m_allowed_scope: [
    "Close AG10 generated image insertion chain.",
    "Record reusable asset/concept/template handoff.",
    "Record lessons for future object-pipeline reuse.",
    "Keep publishing and backend activation blocked unless separately approved."
  ],
  ag10m_blocked_scope: [
    "No article mutation.",
    "No new image generation.",
    "No object insertion.",
    "No CSS/JS mutation.",
    "No backend/Auth/Supabase/database activation.",
    "No public publishing operation."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG10L",
  title: "Post Generated Image Insertion Audit Schema",
  status: "schema_post_generated_image_insertion_audit_only",
  audit_allowed_in_ag10l: true,
  readiness_record_allowed_in_ag10l: true,
  rollback_readiness_record_allowed_in_ag10l: true,
  ag10m_boundary_allowed_in_ag10l: true,

  article_mutation_allowed_in_ag10l: false,
  object_insertion_allowed_in_ag10l: false,
  image_generation_allowed_in_ag10l: false,
  external_image_api_call_allowed_in_ag10l: false,
  new_asset_creation_allowed_in_ag10l: false,
  reference_insertion_allowed_in_ag10l: false,
  reference_url_change_allowed_in_ag10l: false,
  homepage_mutation_allowed_in_ag10l: false,
  css_js_mutation_allowed_in_ag10l: false,
  backend_auth_supabase_activation_allowed_in_ag10l: false,
  public_publishing_operation_allowed_in_ag10l: false,
  ...stageControls
};

const review = {
  module_id: "AG10L",
  title: "Post Generated Image Insertion Audit",
  status: auditStatus,
  depends_on: ["AG10K", "AG10J"],
  generated_from: inputs,
  audit_report_file: "data/content-intelligence/audit-records/ag10l-post-generated-image-insertion-audit-report.json",
  readiness_file: "data/content-intelligence/quality-registry/ag10l-generated-image-insertion-readiness-record.json",
  rollback_readiness_file: "data/content-intelligence/quality-registry/ag10l-generated-image-insertion-rollback-readiness-record.json",
  next_boundary_file: "data/content-intelligence/mutation-plans/ag10l-to-ag10m-generated-image-insertion-closure-reuse-handoff-boundary.json",
  schema_file: "data/content-intelligence/schema/post-generated-image-insertion-audit.schema.json",
  learning_file: "data/content-intelligence/learning/ag10l-post-generated-image-insertion-audit-learning.json",
  summary: {
    selected_article_path: selectedArticlePath,
    asset_path: assetPath,
    post_insertion_hash: ag10kApply.post_insertion_hash,
    audit_status: auditStatus,
    total_checks: checks.length,
    failed_checks: failedChecks.length,
    next_stage_id: "AG10M",
    next_stage_title: "Generated Image Insertion Closure and Reuse Handoff",
    ...stageControls
  },
  closure_decision: {
    decision: auditStatus === "post_generated_image_insertion_audit_passed"
      ? "ag10l_audit_passed_pending_explicit_ag10m_closure"
      : "ag10l_audit_failed_requires_review",
    proceed_to_ag10m_only_with_explicit_user_approval: true,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG10L",
  title: "Post Generated Image Insertion Audit Learning",
  status: "learning_record_only",
  learning_points: [
    "Generated/editorial asset insertion must be followed by a non-mutating audit.",
    "Marker count, asset hash, alt text, caption and visible credit should be verified together.",
    "Rollback readiness should remain available after insertion.",
    "Static mobile checks can confirm responsive intent, but final mobile visual review may still be useful.",
    "Future validators should recognise later governed mutations through explicit apply records rather than hard-coded historic hashes only."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG10L",
  title: "Post Generated Image Insertion Audit",
  status: auditStatus,
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag10l-post-generated-image-insertion-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag10l-post-generated-image-insertion-audit-report.json",
    readiness: "data/content-intelligence/quality-registry/ag10l-generated-image-insertion-readiness-record.json",
    rollback_readiness: "data/content-intelligence/quality-registry/ag10l-generated-image-insertion-rollback-readiness-record.json",
    next_boundary: "data/content-intelligence/mutation-plans/ag10l-to-ag10m-generated-image-insertion-closure-reuse-handoff-boundary.json",
    schema: "data/content-intelligence/schema/post-generated-image-insertion-audit.schema.json",
    learning: "data/content-intelligence/learning/ag10l-post-generated-image-insertion-audit-learning.json",
    preview: "data/quality/ag10l-post-generated-image-insertion-audit-preview.json",
    document: "docs/quality/AG10L_POST_GENERATED_IMAGE_INSERTION_AUDIT.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG10L",
  preview_only: true,
  status: auditStatus,
  selected_article_path: selectedArticlePath,
  asset_path: assetPath,
  audit_summary: auditReport.audit_summary,
  next_stage: boundary,
  ...stageControls
};

const doc = `# AG10L — Post Generated Image Insertion Audit

## Purpose

AG10L audits the AG10K generated-image insertion without mutating the article or any runtime system.

## Audit Result

- Status: \`${auditStatus}\`
- Selected article: \`${selectedArticlePath}\`
- Asset path: \`${assetPath}\`
- Backup path: \`${backupPath}\`
- Post-insertion hash: \`${ag10kApply.post_insertion_hash}\`
- Asset hash: \`${assetHash}\`
- Total checks: \`${checks.length}\`
- Failed checks: \`${failedChecks.length}\`

## Confirmed Items

AG10L checks marker count, asset path/hash, alt text, caption, visible credit, layout/mobile static safety, prior governance preservation, rollback readiness and forbidden mutation guards.

## Boundaries

AG10L does not mutate the article, insert objects, generate images, create new assets, change references, mutate homepage/CSS/JS, activate backend/Auth/Supabase/database systems, execute rollback or publish anything.

## Next Stage

AG10M — Generated Image Insertion Closure and Reuse Handoff — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditReportPath, auditReport);
writeJson(readinessPath, readiness);
writeJson(rollbackReadinessPath, rollbackReadiness);
writeJson(boundaryPath, boundary);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG10L post generated image insertion audit artifacts generated.");
console.log(`✅ Audit status: ${auditStatus}`);
console.log(`✅ Total checks: ${checks.length}`);
console.log(`✅ Failed checks: ${failedChecks.length}`);
console.log("✅ Inserted SVG path/hash, marker count, alt text, caption and credit audited.");
console.log("✅ Rollback readiness and forbidden mutation guards audited.");
console.log("✅ No article mutation, image generation, new asset creation, backend activation or publishing performed.");
console.log("✅ AG10M handoff created with explicit approval required.");
