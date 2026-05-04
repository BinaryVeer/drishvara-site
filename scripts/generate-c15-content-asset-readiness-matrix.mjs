import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const paths = {
  inventory: path.join(root, "data", "content", "content-asset-inventory-preview.json"),
  verification: path.join(root, "data", "content", "content-asset-verification-review-preview.json"),
  dryRun: path.join(root, "data", "content", "content-review-queue-import-dry-run-preview.json"),
  registry: path.join(root, "data", "content", "c15-content-governance-consolidated-asset-readiness-matrix.json"),
  output: path.join(root, "data", "content", "content-governance-asset-readiness-matrix.json")
};

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(root, filePath)}`);
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

function hasAny(values, targets) {
  return Array.isArray(values) && values.some((v) => targets.includes(v));
}

function classifyReadiness(reviewItem, queueCandidate) {
  const blockers = reviewItem?.current_blockers || queueCandidate?.blockers || [];
  const requiredReviews = reviewItem?.required_reviews || queueCandidate?.required_reviews || [];
  const status = reviewItem?.review_status || "";
  const queueStatus = queueCandidate?.current_review_status || "";

  if (status === "blocked_pending_basic_metadata" || queueStatus === "blocked" || blockers.includes("basic_metadata_incomplete")) {
    return "blocked_pending_basic_metadata";
  }

  if (blockers.includes("source_unknown") || blockers.includes("rights_not_reviewed") || hasAny(requiredReviews, ["source_review", "rights_review"])) {
    return "source_rights_review_required";
  }

  if (hasAny(requiredReviews, ["duplicate_review"]) || blockers.includes("duplicate_hint_requires_review")) {
    return "duplicate_review_required";
  }

  if (hasAny(requiredReviews, ["image_review", "hindi_readiness_review"])) {
    return "image_or_hindi_review_required";
  }

  if (status === "quality_review_required" || hasAny(requiredReviews, ["quality_review"])) {
    return "quality_review_required";
  }

  if (status === "ready_for_human_editorial_review" || queueStatus === "editorial_review_pending") {
    return "ready_for_future_human_review_queue_planning";
  }

  return "source_rights_review_required";
}

function dimensionStatus(name, reviewItem, queueCandidate, readinessStatus) {
  const blockers = reviewItem?.current_blockers || queueCandidate?.blockers || [];
  const requiredReviews = reviewItem?.required_reviews || queueCandidate?.required_reviews || [];
  const metadataGaps = reviewItem?.metadata_gaps || queueCandidate?.metadata_gaps || [];

  switch (name) {
    case "inventory_readiness":
      return "preview_extracted";
    case "metadata_readiness":
      return blockers.includes("basic_metadata_incomplete") || metadataGaps.length > 0 ? "needs_review" : "basic_metadata_present";
    case "source_readiness":
      return blockers.includes("source_unknown") || requiredReviews.includes("source_review") ? "source_review_required" : "source_review_still_required";
    case "rights_readiness":
      return blockers.includes("rights_not_reviewed") || requiredReviews.includes("rights_review") ? "rights_review_required" : "rights_review_still_required";
    case "quality_readiness":
      return requiredReviews.includes("quality_review") ? "quality_review_required" : "quality_review_still_required";
    case "image_readiness":
      return requiredReviews.includes("image_review") ? "image_review_required" : "image_review_still_required";
    case "hindi_readiness":
      return requiredReviews.includes("hindi_readiness_review") ? "hindi_review_required" : "hindi_review_still_required";
    case "duplicate_readiness":
      return requiredReviews.includes("duplicate_review") ? "duplicate_review_required" : "duplicate_check_still_required";
    case "review_queue_readiness":
      return readinessStatus === "blocked_pending_basic_metadata" ? "not_ready_for_future_queue_import" : "dry_run_queue_candidate_only";
    case "public_safety_readiness":
      return "public_safety_review_required";
    case "ml_training_readiness":
      return "blocked_not_eligible";
    case "embedding_readiness":
      return "blocked_not_eligible";
    case "registry_write_readiness":
      return "blocked_not_allowed";
    default:
      return "needs_review";
  }
}

const inventory = readJson(paths.inventory);
const verification = readJson(paths.verification);
const dryRun = readJson(paths.dryRun);
const registry = readJson(paths.registry);

const inventoryAssets = Array.isArray(inventory.candidate_assets) ? inventory.candidate_assets : [];
const reviewItems = Array.isArray(verification.review_items) ? verification.review_items : [];
const queueCandidates = Array.isArray(dryRun.queue_candidate_records) ? dryRun.queue_candidate_records : [];

const reviewByAsset = new Map(reviewItems.map((item) => [item.asset_id, item]));
const queueByAsset = new Map(queueCandidates.map((item) => [item.asset_id, item]));

const readinessMatrix = inventoryAssets.map((asset) => {
  const reviewItem = reviewByAsset.get(asset.asset_id) || {};
  const queueCandidate = queueByAsset.get(asset.asset_id) || {};
  const readinessStatus = classifyReadiness(reviewItem, queueCandidate);

  const dimensions = {};
  for (const dimension of registry.readiness_dimensions) {
    dimensions[dimension] = dimensionStatus(dimension, reviewItem, queueCandidate, readinessStatus);
  }

  return {
    asset_id: asset.asset_id,
    review_item_id: reviewItem.review_item_id || "",
    queue_item_id: queueCandidate.queue_item_id || "",
    asset_type: asset.asset_type || "article",
    title: asset.title || "",
    article_path: asset.article_path || "",
    readiness_status: readinessStatus,
    readiness_dimensions: dimensions,
    priority: reviewItem.review_priority || queueCandidate.priority || "medium",
    blockers: reviewItem.current_blockers || queueCandidate.blockers || [],
    required_reviews: reviewItem.required_reviews || queueCandidate.required_reviews || [],
    recommended_next_action: readinessStatus === "blocked_pending_basic_metadata"
      ? "complete_basic_metadata_before_any_import"
      : "keep_in_future_human_review_planning",
    public_approval_granted: false,
    ml_training_eligible: false,
    embedding_eligible: false,
    registry_write_allowed: false
  };
});

const readinessStatusCounts = countBy(readinessMatrix, "readiness_status");
const priorityCounts = countBy(readinessMatrix, "priority");

const summary = {
  candidate_asset_count: inventoryAssets.length,
  review_item_count: reviewItems.length,
  dry_run_queue_candidate_count: queueCandidates.length,
  matrix_row_count: readinessMatrix.length,
  count_reconciliation_status: (
    inventoryAssets.length === reviewItems.length &&
    reviewItems.length === queueCandidates.length &&
    queueCandidates.length === readinessMatrix.length
  ) ? "matched" : "mismatch_requires_review",
  blocked_count: readinessMatrix.filter((x) => x.readiness_status === "blocked_pending_basic_metadata").length,
  source_review_required_count: readinessMatrix.filter((x) => x.readiness_status === "source_rights_review_required").length,
  rights_review_required_count: readinessMatrix.filter((x) => x.readiness_status === "source_rights_review_required").length,
  quality_review_required_count: readinessMatrix.filter((x) => x.readiness_status === "quality_review_required").length,
  duplicate_review_required_count: readinessMatrix.filter((x) => x.readiness_status === "duplicate_review_required").length,
  image_review_required_count: readinessMatrix.filter((x) => x.readiness_status === "image_or_hindi_review_required").length,
  future_human_review_planning_count: readinessMatrix.filter((x) => x.readiness_status === "ready_for_future_human_review_queue_planning").length,
  public_approval_granted_count: 0,
  ml_training_eligible_count: 0,
  embedding_eligible_count: 0,
  registry_write_allowed_count: 0
};

const output = {
  matrix_id: "C15_CONTENT_GOVERNANCE_ASSET_READINESS_MATRIX",
  module_id: "C15",
  status: "preview_only_consolidated_readiness_matrix",
  preview_only: true,
  source_refs: [
    path.relative(root, paths.inventory),
    path.relative(root, paths.verification),
    path.relative(root, paths.dryRun)
  ],
  summary,
  readiness_matrix: readinessMatrix,
  readiness_status_counts: readinessStatusCounts,
  priority_counts: priorityCounts,
  gates_preserved: {
    public_approval_not_granted: true,
    source_approval_not_granted: true,
    rights_approval_not_granted: true,
    image_approval_not_granted: true,
    quality_approval_not_granted: true,
    ml_training_not_enabled: true,
    embedding_not_enabled: true,
    registry_write_not_enabled: true,
    live_queue_not_created: true,
    admin_not_enabled: true,
    supabase_not_enabled: true,
    auth_not_enabled: true,
    public_output_not_enabled: true,
    subscriber_output_not_enabled: true
  },
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.next_recommended_stage
};

fs.mkdirSync(path.dirname(paths.output), { recursive: true });
fs.writeFileSync(paths.output, JSON.stringify(output, null, 2) + "\n");

console.log(`Created ${path.relative(root, paths.output)} with ${readinessMatrix.length} readiness rows.`);
