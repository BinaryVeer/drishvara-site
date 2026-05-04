import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const sourcePath = path.join(root, "data", "content", "content-asset-inventory-preview.json");
const outPath = path.join(root, "data", "content", "content-asset-verification-review-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing source file: ${path.relative(root, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function countBy(items, key) {
  const counts = {};
  for (const item of items) {
    const value = item[key] || "unknown";
    counts[value] = (counts[value] || 0) + 1;
  }
  return counts;
}

function makeReviewItemId(assetId, index) {
  const digest = crypto.createHash("sha1").update(`${assetId}:${index}`).digest("hex").slice(0, 10);
  return `review_${String(index + 1).padStart(4, "0")}_${digest}`;
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function evaluateReview(asset, duplicateAssetIds) {
  const gaps = [];

  if (!hasValue(asset.title)) gaps.push("missing_title");
  if (!hasValue(asset.article_path)) gaps.push("missing_article_path");
  if (!hasValue(asset.category)) gaps.push("missing_category");
  if (asset.summary_status !== "summary_present") gaps.push("missing_summary");
  if (asset.image_status !== "image_present") gaps.push("missing_image");
  if (asset.seo_presence_status !== "seo_reference_observed") gaps.push("seo_reference_not_observed");

  const requiredReviews = new Set([
    "source_review",
    "rights_review",
    "quality_review",
    "public_safety_review",
    "human_editorial_review",
    "ml_eligibility_review",
    "embedding_eligibility_review"
  ]);

  if (asset.image_status !== "image_present") requiredReviews.add("image_review");
  if (String(asset.language || "").toLowerCase().includes("unknown")) requiredReviews.add("hindi_readiness_review");
  if (duplicateAssetIds.has(asset.asset_id)) requiredReviews.add("duplicate_review");

  const blockers = [];

  if (gaps.includes("missing_title") || gaps.includes("missing_article_path")) {
    blockers.push("basic_metadata_incomplete");
  }
  if (asset.source_hint === "unknown") {
    blockers.push("source_unknown");
  }
  blockers.push("rights_not_reviewed");
  blockers.push("public_safe_not_approved");
  blockers.push("ml_eligibility_not_approved");
  blockers.push("embedding_eligibility_not_approved");

  if (duplicateAssetIds.has(asset.asset_id)) {
    blockers.push("duplicate_hint_requires_review");
  }

  let reviewStatus = "ready_for_human_editorial_review";
  let priority = "medium";

  if (blockers.includes("basic_metadata_incomplete")) {
    reviewStatus = "blocked_pending_basic_metadata";
    priority = "blocked";
  } else if (duplicateAssetIds.has(asset.asset_id)) {
    reviewStatus = "duplicate_review_required";
    priority = "high";
  } else if (asset.source_hint === "unknown") {
    reviewStatus = "source_review_required";
    priority = "high";
  } else if (asset.image_status !== "image_present") {
    reviewStatus = "image_review_required";
    priority = "medium";
  } else if (gaps.length > 0) {
    reviewStatus = "quality_review_required";
    priority = "medium";
  } else {
    reviewStatus = "ready_for_human_editorial_review";
    priority = "low";
  }

  return {
    review_status: reviewStatus,
    review_priority: priority,
    required_reviews: [...requiredReviews].sort(),
    metadata_gaps: gaps,
    current_blockers: blockers
  };
}

const source = readJson(sourcePath);
const candidates = Array.isArray(source.candidate_assets) ? source.candidate_assets : [];

const duplicateAssetIds = new Set();
for (const hint of source.duplicate_hints || []) {
  for (const id of hint.asset_ids || []) duplicateAssetIds.add(id);
}

const reviewItems = candidates.map((asset, index) => {
  const evaluation = evaluateReview(asset, duplicateAssetIds);

  return {
    review_item_id: makeReviewItemId(asset.asset_id, index),
    asset_id: asset.asset_id,
    asset_type: asset.asset_type || "article",
    title: asset.title || "",
    article_path: asset.article_path || "",
    review_status: evaluation.review_status,
    review_priority: evaluation.review_priority,
    required_reviews: evaluation.required_reviews,
    metadata_gaps: evaluation.metadata_gaps,
    current_blockers: evaluation.current_blockers,
    review_action_options: [
      "request_source_details",
      "request_rights_details",
      "request_image_review",
      "request_quality_revision",
      "request_duplicate_check",
      "request_hindi_review",
      "mark_reference_only",
      "mark_internal_only",
      "mark_candidate_for_public_review",
      "keep_blocked",
      "escalate_to_editorial_owner"
    ],
    public_approval_granted: false,
    ml_training_eligible: false,
    embedding_eligible: false,
    registry_write_allowed: false,
    next_action: evaluation.review_priority === "blocked"
      ? "complete_basic_metadata_before_review"
      : "route_to_human_editorial_review_preview"
  };
});

const output = {
  preview_id: "C12_CONTENT_ASSET_VERIFICATION_REVIEW_PREVIEW",
  module_id: "C12",
  status: "preview_only_not_live_review_queue",
  preview_only: true,
  source_preview_ref: path.relative(root, sourcePath),
  summary: {
    candidate_asset_count: candidates.length,
    review_item_count: reviewItems.length,
    public_approval_granted_count: 0,
    ml_training_eligible_count: 0,
    embedding_eligible_count: 0,
    registry_write_allowed_count: 0,
    blocked_review_item_count: reviewItems.filter((x) => x.review_priority === "blocked").length,
    high_priority_review_item_count: reviewItems.filter((x) => x.review_priority === "high").length
  },
  review_items: reviewItems,
  review_status_counts: countBy(reviewItems, "review_status"),
  review_priority_counts: countBy(reviewItems, "review_priority"),
  blocked_capabilities: [
    "article_mutation",
    "homepage_mutation",
    "sitemap_mutation",
    "seo_metadata_mutation",
    "image_registry_write",
    "quality_metadata_write",
    "review_queue_write",
    "selection_memory_write",
    "manual_override",
    "admin_review",
    "supabase",
    "auth",
    "payment",
    "external_api_fetch",
    "link_crawling",
    "image_download",
    "source_approval",
    "rights_approval",
    "public_safe_approval",
    "ml_ingestion",
    "embedding_generation",
    "model_training",
    "vector_database_write",
    "public_output",
    "subscriber_output"
  ],
  next_recommended_stage: "C13 — Content Asset Review Queue Schema & Admin Boundary Plan"
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");
console.log(`Created ${path.relative(root, outPath)} with ${reviewItems.length} review workflow items.`);
