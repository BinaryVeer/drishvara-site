import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ar02c-sample-article-reference-insertion-patch.json");
const sampleRegistryPath = path.join(root, "data", "editorial", "ar02b-sample-verified-reference-candidates.json");
const applyPath = path.join(root, "data", "quality", "ar02c-sample-article-reference-insertion-apply-result.json");
const previewPath = path.join(root, "data", "quality", "ar02c-sample-article-reference-insertion-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function walkArticleHtml() {
  const articleRoot = path.join(root, "articles");
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full).replaceAll(path.sep, "/");
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && rel.endsWith(".html")) files.push(rel);
    }
  }
  walk(articleRoot);
  return files.sort();
}

const registry = readJson(registryPath);
const sample = readJson(sampleRegistryPath);
const apply = readJson(applyPath);
const markers = registry.required_markers;

const samplePaths = new Set(sample.entries.map((entry) => entry.article_path));
const allArticleFiles = walkArticleHtml();

const sampleStatus = sample.entries.map((entry) => {
  const html = readText(entry.article_path);
  const insertedUrls = entry.references.map((ref) => ref.url);

  return {
    article_path: entry.article_path,
    ar02c_block_present: html.includes(markers.ar02c_block_marker),
    ar02c_reference_status_present: html.includes(markers.ar02c_reference_status_marker),
    ar02c_reference_link_count: (html.match(new RegExp(markers.ar02c_reference_link_marker, "g")) || []).length,
    ar01_reference_slot_count: (html.match(new RegExp(markers.ar01_reference_slot_marker, "g")) || []).length,
    image_credit_present: html.includes(markers.ar01_image_credit_marker) && html.includes(markers.ar02c_image_credit_marker),
    all_expected_urls_present: insertedUrls.every((url) => html.includes(url))
  };
});

const nonSampleWithAR02CMarker = allArticleFiles.filter((rel) => {
  if (samplePaths.has(rel)) return false;
  return readText(rel).includes(markers.ar02c_block_marker);
});

const preview = {
  preview_id: "AR02C_SAMPLE_ARTICLE_REFERENCE_INSERTION_PREVIEW",
  module_id: "AR02C",
  status: "preview_after_sample_article_reference_insertion",
  preview_only: true,
  apply_evidence: {
    apply_result_present: true,
    modified_file_count: apply.summary.modified_file_count,
    total_reference_links_inserted: apply.summary.total_reference_links_inserted
  },
  sample_status: sampleStatus,
  non_sample_with_ar02c_marker: nonSampleWithAR02CMarker,
  summary: {
    sample_article_count: sample.sample_article_count,
    exactly_five_sample_articles_modified: apply.summary.exactly_five_sample_articles_modified,
    total_reference_links_inserted: apply.summary.total_reference_links_inserted,
    every_sample_has_ar02c_block: sampleStatus.every((row) => row.ar02c_block_present),
    every_sample_has_reference_status: sampleStatus.every((row) => row.ar02c_reference_status_present),
    every_sample_has_two_reference_links: sampleStatus.every((row) => row.ar02c_reference_link_count === 2),
    every_sample_preserves_two_ar01_slots: sampleStatus.every((row) => row.ar01_reference_slot_count === 2),
    every_sample_has_image_credit: sampleStatus.every((row) => row.image_credit_present),
    every_sample_has_expected_urls: sampleStatus.every((row) => row.all_expected_urls_present),
    non_sample_article_mutation_performed: nonSampleWithAR02CMarker.length > 0,
    non_sample_ar02c_marker_count: nonSampleWithAR02CMarker.length,
    external_fetch_performed: false,
    new_reference_generation_performed: false,
    random_reference_insertion_performed: false,
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
console.log(`Every sample has AR02C block: ${preview.summary.every_sample_has_ar02c_block}`);
console.log(`Every sample has two reference links: ${preview.summary.every_sample_has_two_reference_links}`);
console.log(`Non-sample AR02C marker count: ${preview.summary.non_sample_ar02c_marker_count}`);
