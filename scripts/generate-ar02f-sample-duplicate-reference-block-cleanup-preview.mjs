import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ar02f-sample-duplicate-reference-block-cleanup.json");
const sampleRegistryPath = path.join(root, "data", "editorial", "ar02b-sample-verified-reference-candidates.json");
const applyPath = path.join(root, "data", "quality", "ar02f-sample-duplicate-reference-block-cleanup-apply-result.json");
const previewPath = path.join(root, "data", "quality", "ar02f-sample-duplicate-reference-block-cleanup-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

const registry = readJson(registryPath);
const sample = readJson(sampleRegistryPath);
const apply = readJson(applyPath);
const markers = registry.required_markers;

const sampleStatus = sample.entries.map((entry) => {
  const html = readText(entry.article_path);

  return {
    article_path: entry.article_path,
    cleanup_marker_present: html.includes(markers.ar02f_cleanup_marker),
    ar02c_block_count: (html.match(new RegExp(markers.ar02c_block_marker, "g")) || []).length,
    ar02c_reference_link_count: (html.match(new RegExp(markers.ar02c_reference_link_marker, "g")) || []).length,
    ar02c_image_credit_present: html.includes(markers.ar02c_image_credit_marker),
    expected_urls_present: entry.references.every((ref) => html.includes(ref.url))
  };
});

const preview = {
  preview_id: "AR02F_SAMPLE_DUPLICATE_REFERENCE_BLOCK_CLEANUP_PREVIEW",
  module_id: "AR02F",
  status: "preview_after_sample_duplicate_cleanup",
  preview_only: true,
  apply_evidence: {
    apply_result_present: true,
    modified_file_count: apply.summary.modified_file_count,
    total_legacy_blocks_removed: apply.summary.total_legacy_blocks_removed
  },
  sample_status: sampleStatus,
  summary: {
    scanned_sample_article_count: sampleStatus.length,
    cleanup_marker_present_on_all_samples: sampleStatus.every((row) => row.cleanup_marker_present),
    every_sample_has_one_ar02c_block: sampleStatus.every((row) => row.ar02c_block_count === 1),
    every_sample_has_two_ar02c_links: sampleStatus.every((row) => row.ar02c_reference_link_count === 2),
    every_sample_has_image_credit: sampleStatus.every((row) => row.ar02c_image_credit_present),
    every_sample_preserves_expected_urls: sampleStatus.every((row) => row.expected_urls_present),
    no_legacy_phrases_outside_ar02c: apply.summary.no_legacy_phrases_outside_ar02c,
    non_sample_article_mutation_performed: false,
    external_fetch_performed: false,
    new_reference_generation_performed: false,
    reference_url_change_performed: false,
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
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.writeFileSync(previewPath, JSON.stringify(preview, null, 2) + "\n");

console.log(`Created ${path.relative(root, previewPath)}.`);
console.log(`Every sample has one AR02C block: ${preview.summary.every_sample_has_one_ar02c_block}`);
console.log(`Every sample has two AR02C links: ${preview.summary.every_sample_has_two_ar02c_links}`);
console.log(`No legacy phrases outside AR02C: ${preview.summary.no_legacy_phrases_outside_ar02c}`);
