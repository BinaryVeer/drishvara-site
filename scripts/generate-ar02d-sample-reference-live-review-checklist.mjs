import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ar02d-sample-reference-live-review-checklist.json");
const sampleRegistryPath = path.join(root, "data", "editorial", "ar02b-sample-verified-reference-candidates.json");
const ar02cPreviewPath = path.join(root, "data", "quality", "ar02c-sample-article-reference-insertion-preview.json");
const liveReviewPath = path.join(root, "data", "editorial", "ar02d-sample-reference-live-review-checklist.json");
const previewPath = path.join(root, "data", "quality", "ar02d-sample-reference-live-review-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function publicUrl(base, articlePath) {
  return `${base.replace(/\/$/, "")}/${articlePath}?v=ar02d`;
}

const config = readJson(registryPath);
const sample = readJson(sampleRegistryPath);
const ar02cPreview = readJson(ar02cPreviewPath);

if (sample.sample_article_count !== 5) {
  throw new Error("AR02D requires the five-article AR02B sample registry.");
}

if (!ar02cPreview.summary?.every_sample_has_two_reference_links) {
  throw new Error("AR02D requires AR02C preview confirming two reference links per sample article.");
}

const checklistEntries = sample.entries.map((entry) => {
  const expectedReferences = entry.references.map((reference) => ({
    slot: reference.slot,
    url: reference.url,
    title: reference.title,
    source_name: reference.source_name,
    source_type: reference.source_type,
    expected_link_target: "_blank",
    live_observation: "pending"
  }));

  const manualChecks = {};
  for (const field of config.manual_check_fields) {
    manualChecks[field] = {
      status: "pending",
      reviewer_note: null
    };
  }

  return {
    article_path: entry.article_path,
    article_title: entry.article_title,
    category: entry.category,
    live_page_url: publicUrl(config.public_base_url, entry.article_path),
    expected_reference_count: 2,
    expected_references: expectedReferences,
    manual_checks: manualChecks,
    overall_manual_result: "pending",
    reviewer: null,
    reviewed_at: null,
    review_note: "Pending manual live verification after deployment."
  };
});

const liveReview = {
  checklist_id: "AR02D_SAMPLE_REFERENCE_LIVE_REVIEW_CHECKLIST",
  module_id: "AR02D",
  status: "manual_review_pending",
  source_sample_registry: "data/editorial/ar02b-sample-verified-reference-candidates.json",
  source_ar02c_preview: "data/quality/ar02c-sample-article-reference-insertion-preview.json",
  sample_article_count: checklistEntries.length,
  total_expected_reference_links: checklistEntries.reduce((sum, entry) => sum + entry.expected_reference_count, 0),
  all_observations_pending: true,
  article_html_mutation_performed: false,
  external_fetch_performed: false,
  automated_live_review_performed: false,
  entries: checklistEntries
};

const preview = {
  preview_id: "AR02D_SAMPLE_REFERENCE_LIVE_REVIEW_PREVIEW",
  module_id: "AR02D",
  status: "preview_after_manual_live_review_checklist_generation",
  preview_only: true,
  sample_article_count: liveReview.sample_article_count,
  total_expected_reference_links: liveReview.total_expected_reference_links,
  sample_entries: checklistEntries.map((entry) => ({
    article_path: entry.article_path,
    live_page_url: entry.live_page_url,
    expected_reference_count: entry.expected_reference_count,
    expected_reference_urls: entry.expected_references.map((reference) => reference.url),
    overall_manual_result: entry.overall_manual_result
  })),
  summary: {
    exactly_five_review_entries: checklistEntries.length === 5,
    every_entry_has_two_expected_references: checklistEntries.every((entry) => entry.expected_references.length === 2),
    all_reference_urls_https: checklistEntries.every((entry) => entry.expected_references.every((reference) => reference.url.startsWith("https://"))),
    all_observations_pending: checklistEntries.every((entry) => entry.overall_manual_result === "pending" && Object.values(entry.manual_checks).every((check) => check.status === "pending")),
    article_html_mutation_performed: false,
    reference_insertion_performed: false,
    external_fetch_performed: false,
    automated_live_review_performed: false,
    backend_activation_performed: false,
    api_route_created: false,
    supabase_enabled: false,
    auth_enabled: false,
    real_login_enabled: false,
    real_signup_enabled: false,
    user_account_collection_enabled: false,
    frontend_deployment_performed: false,
    file_deletion_performed: false,
    file_move_performed: false
  },
  blocked_capabilities: config.blocked_capabilities,
  next_recommended_stage: config.recommended_next_stage
};

fs.mkdirSync(path.dirname(liveReviewPath), { recursive: true });
fs.writeFileSync(liveReviewPath, JSON.stringify(liveReview, null, 2) + "\n");
fs.writeFileSync(previewPath, JSON.stringify(preview, null, 2) + "\n");

console.log(`Created ${path.relative(root, liveReviewPath)}.`);
console.log(`Created ${path.relative(root, previewPath)}.`);
console.log(`Review entries: ${checklistEntries.length}`);
console.log(`Expected reference links: ${liveReview.total_expected_reference_links}`);
console.log(`All observations pending: ${liveReview.all_observations_pending}`);
