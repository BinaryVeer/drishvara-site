import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const sourcePath = path.join(root, "data", "content", "content-asset-verification-review-preview.json");
const c14RegistryPath = path.join(root, "data", "content", "c14-content-review-queue-import-dry-run-plan.json");
const outPath = path.join(root, "data", "content", "content-review-queue-import-dry-run-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function sha(value) {
  return crypto.createHash("sha1").update(String(value)).digest("hex").slice(0, 12);
}

function makeQueueItemId(reviewItemId, index) {
  return `queue_dryrun_${String(index + 1).padStart(4, "0")}_${sha(reviewItemId)}`;
}

function makeAuditTraceId(queueItemId) {
  return `audit_dryrun_${sha(queueItemId)}`;
}

function chooseReviewerRole(requiredReviews, roleMapping) {
  if (!Array.isArray(requiredReviews) || requiredReviews.length === 0) return "content_editor";

  const priorityReviews = [
    "source_review",
    "rights_review",
    "quality_review",
    "duplicate_review",
    "image_review",
    "hindi_readiness_review",
    "public_safety_review",
    "human_editorial_review",
    "ml_eligibility_review",
    "embedding_eligibility_review"
  ];

  for (const reviewType of priorityReviews) {
    if (requiredReviews.includes(reviewType) && roleMapping[reviewType]) {
      return roleMapping[reviewType];
    }
  }

  return "content_editor";
}

function mapStatus(reviewStatus, statusMapping) {
  return statusMapping[reviewStatus] || "queued";
}

const source = readJson(sourcePath);
const registry = readJson(c14RegistryPath);

const reviewItems = Array.isArray(source.review_items) ? source.review_items : [];
const statusMapping = registry.status_mapping || {};
const roleMapping = registry.role_mapping || {};
const defaults = registry.default_queue_candidate_values || {};

const nowLabel = "dry_run_static_timestamp_not_runtime";

const queueCandidates = reviewItems.map((item, index) => {
  const queueItemId = makeQueueItemId(item.review_item_id, index);
  const mappedStatus = mapStatus(item.review_status, statusMapping);
  const reviewerRole = chooseReviewerRole(item.required_reviews, roleMapping);

  return {
    queue_item_id: queueItemId,
    source_preview_ref: path.relative(root, sourcePath),
    review_item_id: item.review_item_id,
    asset_id: item.asset_id,
    asset_type: item.asset_type || "article",
    title: item.title || "",
    article_path: item.article_path || "",
    assigned_review_stage: reviewerRole,
    current_review_status: mappedStatus,
    priority: item.review_priority || "medium",
    required_reviews: item.required_reviews || [],
    metadata_gaps: item.metadata_gaps || [],
    blockers: item.current_blockers || [],
    reviewer_role_required: reviewerRole,
    reviewer_assigned_to: defaults.reviewer_assigned_to ?? null,
    reviewer_decision: defaults.reviewer_decision || "not_decided",
    reviewer_note: defaults.reviewer_note || "",
    approval_status: defaults.approval_status || "not_approved",
    public_safe_status: defaults.public_safe_status || "needs_review",
    source_status: defaults.source_status || "needs_review",
    rights_status: defaults.rights_status || "needs_review",
    quality_status: defaults.quality_status || "needs_review",
    duplicate_status: defaults.duplicate_status || "needs_review",
    image_status: defaults.image_status || "needs_review",
    hindi_readiness_status: defaults.hindi_readiness_status || "needs_review",
    ml_training_eligible: false,
    embedding_eligible: false,
    registry_write_allowed: false,
    audit_trace_id: makeAuditTraceId(queueItemId),
    created_at: nowLabel,
    updated_at: nowLabel,
    next_action: "dry_run_review_queue_import_only"
  };
});

const safetyChecks = {
  source_preview_exists: fs.existsSync(sourcePath),
  review_items_exist: reviewItems.length > 0,
  queue_candidate_count_matches_review_item_count: queueCandidates.length === reviewItems.length,
  no_approval_enabled: true,
  no_live_queue_created: true,
  no_supabase_enabled: true,
  no_auth_enabled: true,
  no_public_output_enabled: true,
  no_ml_embedding_enabled: true
};

const output = {
  preview_id: "C14_CONTENT_REVIEW_QUEUE_IMPORT_DRY_RUN_PREVIEW",
  module_id: "C14",
  status: "dry_run_only_not_live_review_queue",
  preview_only: true,
  dry_run_only: true,
  source_review_preview_ref: path.relative(root, sourcePath),
  summary: {
    source_review_item_count: reviewItems.length,
    queue_candidate_count: queueCandidates.length,
    approval_granted_count: 0,
    ml_training_eligible_count: 0,
    embedding_eligible_count: 0,
    registry_write_allowed_count: 0,
    live_queue_created: false,
    admin_enabled: false,
    supabase_enabled: false,
    public_output_enabled: false,
    subscriber_output_enabled: false
  },
  queue_candidate_records: queueCandidates,
  status_mapping: statusMapping,
  role_mapping: roleMapping,
  safety_checks: safetyChecks,
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.next_recommended_stage
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, outPath)} with ${queueCandidates.length} dry-run queue candidates.`);
