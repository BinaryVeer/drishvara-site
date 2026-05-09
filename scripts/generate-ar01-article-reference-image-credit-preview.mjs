import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "ar01-article-reference-image-credit-surface-patch.json");
const applyPath = path.join(root, "data", "quality", "ar01-article-reference-image-credit-surface-apply-result.json");
const editorialRegistryPath = path.join(root, "data", "editorial", "article-reference-image-credit-registry.json");
const previewOutPath = path.join(root, "data", "quality", "ar01-article-reference-image-credit-preview.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

const registry = readJson(registryPath);
const apply = readJson(applyPath);
const editorial = readJson(editorialRegistryPath);
const markers = registry.required_markers;

const sampleArticles = editorial.articles.slice(0, 10).map((x) => x.article_path);

const sampleStatus = sampleArticles.map((rel) => {
  const html = readText(rel);
  const referenceSlotCount = (html.match(new RegExp(markers.ar01_reference_slot_marker, "g")) || []).length;

  return {
    article_path: rel,
    has_style_marker: html.includes(markers.ar01_style_marker),
    has_evidence_block: html.includes(markers.ar01_evidence_block_marker),
    has_reference_status: html.includes(markers.ar01_reference_status_marker),
    reference_slot_count: referenceSlotCount,
    has_image_credit: html.includes(markers.ar01_image_credit_marker),
    has_verified_claim: html.includes('data-drishvara-ar01-reference-status="verified"')
  };
});

const preview = {
  preview_id: "AR01_ARTICLE_REFERENCE_IMAGE_CREDIT_PREVIEW",
  module_id: "AR01",
  status: "preview_after_article_reference_image_credit_surface_patch",
  preview_only: true,
  apply_evidence: {
    apply_result_present: true,
    scanned_article_file_count: apply.scanned_article_file_count,
    modified_file_count: apply.summary.modified_file_count,
    editorial_registry_created: apply.editorial_registry_created
  },
  editorial_registry_summary: {
    article_count: editorial.article_count,
    verified_reference_count: editorial.verified_reference_count,
    all_articles_under_editorial_verification: editorial.all_articles_under_editorial_verification
  },
  sample_status: sampleStatus,
  summary: {
    sample_article_count: sampleStatus.length,
    all_samples_have_style_marker: sampleStatus.every((x) => x.has_style_marker),
    all_samples_have_evidence_block: sampleStatus.every((x) => x.has_evidence_block),
    all_samples_have_reference_status: sampleStatus.every((x) => x.has_reference_status),
    all_samples_have_two_reference_slots: sampleStatus.every((x) => x.reference_slot_count >= 2),
    all_samples_have_image_credit: sampleStatus.every((x) => x.has_image_credit),
    no_samples_have_verified_claim: sampleStatus.every((x) => !x.has_verified_claim),
    verified_reference_count: 0,
    unverified_external_links_inserted: false,
    external_link_verification_performed: false,
    backend_activation_performed: false,
    api_route_created: false,
    supabase_enabled: false,
    auth_enabled: false,
    real_login_enabled: false,
    real_signup_enabled: false,
    user_account_collection_enabled: false,
    frontend_deployment_performed: false
  },
  blocked_capabilities: registry.blocked_capabilities,
  next_recommended_stage: registry.recommended_next_stage
};

fs.writeFileSync(previewOutPath, JSON.stringify(preview, null, 2) + "\n");

console.log(`Created ${path.relative(root, previewOutPath)}.`);
console.log(`Article count: ${editorial.article_count}`);
console.log(`All samples have evidence block: ${preview.summary.all_samples_have_evidence_block}`);
console.log(`All samples have two reference slots: ${preview.summary.all_samples_have_two_reference_slots}`);
console.log(`All samples have image credit: ${preview.summary.all_samples_have_image_credit}`);
