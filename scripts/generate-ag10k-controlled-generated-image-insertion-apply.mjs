import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag10jReview: "data/content-intelligence/quality-reviews/ag10j-controlled-generated-image-asset-creation-source-finalisation.json",
  ag10jAssetRecord: "data/content-intelligence/visual-registry/ag10j-finalised-generated-image-asset-record.json",
  ag10jSourceRecord: "data/content-intelligence/quality-registry/ag10j-generated-image-source-finalisation-record.json",
  ag10jRightsRecord: "data/content-intelligence/quality-registry/ag10j-generated-image-rights-provenance-clearance-record.json",
  ag10jCostRecord: "data/content-intelligence/quality-registry/ag10j-generated-image-cost-reuse-record.json",
  ag10jReadiness: "data/content-intelligence/quality-registry/ag10j-generated-image-asset-readiness.json",
  ag10jBoundary: "data/content-intelligence/mutation-plans/ag10j-to-ag10k-controlled-generated-image-insertion-boundary.json",
  ag09cApply: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag10k-controlled-generated-image-insertion-apply.json");
const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json");
const auditPrepPath = path.join(root, "data/content-intelligence/quality-registry/ag10k-post-generated-image-insertion-audit-prep.json");
const layoutRecordPath = path.join(root, "data/content-intelligence/quality-registry/ag10k-layout-preservation-record.json");
const rollbackRecordPath = path.join(root, "data/content-intelligence/quality-registry/ag10k-rollback-readiness-record.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/controlled-generated-image-insertion-apply.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag10k-controlled-generated-image-insertion-apply-learning.json");
const registryPath = path.join(root, "data/quality/ag10k-controlled-generated-image-insertion-apply.json");
const previewPath = path.join(root, "data/quality/ag10k-controlled-generated-image-insertion-apply-preview.json");
const docPath = path.join(root, "docs/quality/AG10K_CONTROLLED_GENERATED_IMAGE_INSERTION_APPLY.md");

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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function markerCount(text, marker) {
  return (text.match(new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
}

function findInsertionIndex(html) {
  const startCandidates = [
    html.search(/<article\b/i),
    html.search(/<main\b/i),
    html.search(/<body\b/i),
    0
  ].filter((idx) => idx >= 0);

  const searchStart = startCandidates.length ? Math.min(...startCandidates) : 0;
  const section = html.slice(searchStart);
  const paragraphs = [...section.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi)];

  if (paragraphs.length === 0) {
    const bodyClose = html.search(/<\/body>/i);
    if (bodyClose >= 0) return bodyClose;
    return html.length;
  }

  const preferred = paragraphs.find((match, index) => {
    const stripped = match[0].replace(/<[^>]*>/g, " ").toLowerCase();
    return index > 0 && stripped.includes("digital") && (stripped.includes("health") || stripped.includes("service"));
  });

  const target = preferred || paragraphs[Math.min(2, paragraphs.length - 1)];
  return searchStart + target.index + target[0].length;
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG10K input ${name}: ${relativePath}`);
}

const ag10jReview = readJson(inputs.ag10jReview);
const ag10jAssetRecord = readJson(inputs.ag10jAssetRecord);
const ag10jSourceRecord = readJson(inputs.ag10jSourceRecord);
const ag10jRightsRecord = readJson(inputs.ag10jRightsRecord);
const ag10jCostRecord = readJson(inputs.ag10jCostRecord);
const ag10jReadiness = readJson(inputs.ag10jReadiness);
const ag10jBoundary = readJson(inputs.ag10jBoundary);
const ag09cApply = readJson(inputs.ag09cApply);

if (ag10jReview.status !== "controlled_generated_image_asset_created_source_finalised_not_inserted") {
  throw new Error("AG10K requires AG10J review.");
}
if (ag10jReadiness.ready_for_ag10k !== true) {
  throw new Error("AG10K requires AG10J readiness.");
}
if (ag10jBoundary.next_stage_id !== "AG10K" || ag10jBoundary.explicit_approval_required !== true) {
  throw new Error("AG10K requires AG10J to AG10K explicit boundary.");
}
if (ag10jAssetRecord.placement_status !== "not_inserted") {
  throw new Error("AG10K requires AG10J asset to be not inserted.");
}
if (ag10jReadiness.article_insertion_ready !== false) {
  throw new Error("AG10K requires explicit approval because AG10J kept article insertion readiness false.");
}

const selectedArticlePath = ag09cApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const assetRelativePath = ag10jAssetRecord.asset_path;
if (!exists(assetRelativePath)) throw new Error(`AG10J asset missing: ${assetRelativePath}`);

const assetText = fs.readFileSync(path.join(root, assetRelativePath), "utf8");
const assetHash = sha256(assetText);

if (assetHash !== ag10jAssetRecord.asset_hash_sha256) {
  throw new Error("AG10K asset hash mismatch against AG10J asset record.");
}
if (assetHash !== ag10jReadiness.asset_hash_sha256) {
  throw new Error("AG10K asset hash mismatch against AG10J readiness.");
}

const articlePath = path.join(root, selectedArticlePath);
const originalHtml = fs.readFileSync(articlePath, "utf8");
const preHash = sha256(originalHtml);

if (preHash !== ag10jReadiness.article_hash_at_ag10j) {
  throw new Error("AG10K selected article hash must match AG10J readiness hash before insertion.");
}

const startMarker = "<!-- AG10K-GENERATED-IMAGE-INSERTION:START -->";
const endMarker = "<!-- AG10K-GENERATED-IMAGE-INSERTION:END -->";

if (originalHtml.includes(startMarker) || originalHtml.includes(assetRelativePath)) {
  throw new Error("AG10K insertion marker or asset already exists in selected article. Refusing duplicate insertion.");
}

const assetSrc = path.relative(path.dirname(selectedArticlePath), assetRelativePath).replaceAll(path.sep, "/");

const figureBlock = `
${startMarker}
<section class="drishvara-article-object ag10k-section-support-visual" data-drishvara-stage="AG10K" data-asset-id="${escapeHtml(ag10jAssetRecord.asset_id)}" style="max-width:980px;margin:2.4rem auto;padding:0;">
  <figure style="margin:0 auto;text-align:center;">
    <img src="${escapeHtml(assetSrc)}" alt="${escapeHtml(ag10jAssetRecord.alt_text)}" loading="lazy" decoding="async" style="display:block;width:100%;height:auto;border-radius:22px;box-shadow:0 18px 42px rgba(26,115,140,0.16);border:1px solid rgba(182,208,233,0.9);" />
    <figcaption style="margin-top:0.85rem;font-size:0.94rem;line-height:1.55;color:#4a6070;text-align:center;">
      <span>${escapeHtml(ag10jAssetRecord.caption)}</span>
      <br />
      <small style="color:#607685;">${escapeHtml(ag10jAssetRecord.visible_credit)}</small>
    </figcaption>
  </figure>
</section>
${endMarker}
`;

const insertionIndex = findInsertionIndex(originalHtml);
const mutatedHtml = originalHtml.slice(0, insertionIndex) + "\n" + figureBlock + "\n" + originalHtml.slice(insertionIndex);
const postHash = sha256(mutatedHtml);

if (postHash === preHash) {
  throw new Error("AG10K mutation did not change selected article.");
}

const backupRelativePath = `data/content-intelligence/backups/ag10k-pre-generated-image-insertion-${path.basename(selectedArticlePath)}`;
const backupPath = path.join(root, backupRelativePath);
ensureDir(backupPath);
fs.writeFileSync(backupPath, originalHtml);

fs.writeFileSync(articlePath, mutatedHtml);

const finalHtml = fs.readFileSync(articlePath, "utf8");
const finalHash = sha256(finalHtml);

if (finalHash !== postHash) {
  throw new Error("AG10K post-write hash mismatch.");
}
if (markerCount(finalHtml, startMarker) !== 1 || markerCount(finalHtml, endMarker) !== 1) {
  throw new Error("AG10K marker count invalid after insertion.");
}
if (!finalHtml.includes(assetSrc) || !finalHtml.includes(ag10jAssetRecord.caption) || !finalHtml.includes(ag10jAssetRecord.visible_credit)) {
  throw new Error("AG10K inserted block missing asset, caption or visible credit.");
}

const stageControls = {
  controlled_generated_image_insertion_apply_only: true,
  selected_article_read_performed: true,
  backup_created_in_ag10k: true,
  object_insertion_performed_in_ag10k: true,
  article_mutation_performed_in_ag10k: true,
  selected_article_file_write_performed_in_ag10k: true,

  image_generation_performed_in_ag10k: false,
  external_image_api_call_performed_in_ag10k: false,
  image_asset_creation_performed_in_ag10k: false,
  rendered_image_creation_performed_in_ag10k: false,
  new_asset_creation_performed_in_ag10k: false,
  visual_generation_performed_in_ag10k: false,
  reference_insertion_performed_in_ag10k: false,
  reference_url_change_performed_in_ag10k: false,
  homepage_mutation_performed_in_ag10k: false,
  css_file_mutation_performed_in_ag10k: false,
  js_file_mutation_performed_in_ag10k: false,
  chart_generation_performed_in_ag10k: false,
  infographic_generation_performed_in_ag10k: false,
  table_generation_performed_in_ag10k: false,
  figure_generation_performed_in_ag10k: false,
  diagram_generation_performed_in_ag10k: false,
  map_generation_performed_in_ag10k: false,
  data_fetch_performed_in_ag10k: false,
  dataset_creation_performed_in_ag10k: false,
  live_url_fetch_performed_in_ag10k: false,
  deployment_trigger_performed_in_ag10k: false,
  production_jsonl_append_performed_in_ag10k: false,
  database_write_performed_in_ag10k: false,
  supabase_write_performed_in_ag10k: false,
  backend_auth_supabase_activation_performed_in_ag10k: false,
  rollback_execution_performed_in_ag10k: false,
  public_publishing_operation_performed_in_ag10k: false
};

const applyRecord = {
  module_id: "AG10K",
  title: "Controlled Generated Image Insertion Apply Record",
  status: "generated_image_inserted_pending_post_insertion_audit",
  selected_article_path: selectedArticlePath,
  asset_id: ag10jAssetRecord.asset_id,
  asset_path: assetRelativePath,
  asset_src_in_article: assetSrc,
  asset_hash_sha256: assetHash,
  backup_path: backupRelativePath,
  pre_insertion_hash: preHash,
  post_insertion_hash: postHash,
  insertion_marker_start: startMarker,
  insertion_marker_end: endMarker,
  caption: ag10jAssetRecord.caption,
  alt_text: ag10jAssetRecord.alt_text,
  visible_credit: ag10jAssetRecord.visible_credit,
  insertion_scope: "single_article_single_section_support_visual",
  insertion_strategy: "Insert AG10J finalised section-support SVG after a relevant early article paragraph while preserving existing hero visual and article shape.",
  mutated_files: [selectedArticlePath],
  ...stageControls
};

const layoutRecord = {
  module_id: "AG10K",
  title: "Generated Image Layout Preservation Record",
  status: "layout_preservation_record_created_pending_audit",
  selected_article_path: selectedArticlePath,
  post_insertion_hash: postHash,
  asset_path: assetRelativePath,
  layout_rules_applied: [
    "Inserted as a non-hero section-support visual.",
    "Existing hero visual remains untouched.",
    "Central placement is used.",
    "Image uses responsive width and auto height.",
    "Caption and visible credit are directly attached to figure.",
    "Article text flow is interrupted only once at controlled insertion point.",
    "No CSS or JS file was mutated."
  ],
  mobile_safety_precheck: {
    responsive_img_width: true,
    no_horizontal_overflow_intended: true,
    caption_visible: true,
    credit_visible: true,
    post_insertion_manual_or_static_audit_required: true
  },
  ...stageControls
};

const rollbackRecord = {
  module_id: "AG10K",
  title: "Generated Image Insertion Rollback Readiness Record",
  status: "rollback_ready_for_ag10k_insertion",
  selected_article_path: selectedArticlePath,
  backup_path: backupRelativePath,
  backup_hash: preHash,
  post_insertion_hash: postHash,
  rollback_method: "Restore selected article from AG10K backup or remove AG10K marker block.",
  rollback_scope: "single_article_only",
  rollback_execution_performed: false,
  ...stageControls
};

const auditPrep = {
  module_id: "AG10K",
  title: "AG10L Post Generated Image Insertion Audit Prep",
  status: "post_generated_image_insertion_audit_prep_created",
  selected_article_path: selectedArticlePath,
  asset_id: ag10jAssetRecord.asset_id,
  asset_path: assetRelativePath,
  asset_hash_sha256: assetHash,
  pre_insertion_hash: preHash,
  post_insertion_hash: postHash,
  backup_path: backupRelativePath,
  next_stage_id: "AG10L",
  next_stage_title: "Post Generated Image Insertion Audit",
  explicit_approval_required: true,
  audit_items: [
    "Confirm AG10K marker count.",
    "Confirm asset path/hash.",
    "Confirm alt text, caption and visible credit.",
    "Confirm existing hero visual remains preserved.",
    "Confirm article-shape and mobile layout safety.",
    "Confirm no CSS/JS/reference/backend/publishing mutation.",
    "Confirm rollback readiness."
  ],
  ...stageControls
};

const schema = {
  module_id: "AG10K",
  title: "Controlled Generated Image Insertion Apply Schema",
  status: "schema_controlled_generated_image_insertion_apply_only",
  backup_creation_allowed_in_ag10k: true,
  selected_article_mutation_allowed_in_ag10k: true,
  object_insertion_allowed_in_ag10k: true,
  approved_ag10j_asset_insertion_allowed_in_ag10k: true,
  apply_record_allowed_in_ag10k: true,
  post_insertion_audit_prep_allowed_in_ag10k: true,

  image_generation_allowed_in_ag10k: false,
  external_image_api_call_allowed_in_ag10k: false,
  image_asset_creation_allowed_in_ag10k: false,
  new_asset_creation_allowed_in_ag10k: false,
  reference_insertion_allowed_in_ag10k: false,
  reference_url_change_allowed_in_ag10k: false,
  homepage_mutation_allowed_in_ag10k: false,
  css_file_mutation_allowed_in_ag10k: false,
  js_file_mutation_allowed_in_ag10k: false,
  backend_auth_supabase_activation_allowed_in_ag10k: false,
  public_publishing_operation_allowed_in_ag10k: false,
  ...stageControls
};

const readiness = {
  module_id: "AG10K",
  title: "Generated Image Insertion Readiness",
  status: "generated_image_inserted_pending_ag10l_audit",
  selected_article_path: selectedArticlePath,
  asset_id: ag10jAssetRecord.asset_id,
  asset_path: assetRelativePath,
  pre_insertion_hash: preHash,
  post_insertion_hash: postHash,
  backup_created: true,
  insertion_applied: true,
  marker_count_valid_precheck: true,
  caption_alt_credit_precheck: true,
  ready_for_ag10l: true,
  publishing_ready: false,
  backend_activation_ready: false,
  explicit_ag10l_approval_required: true,
  ...stageControls
};

const review = {
  module_id: "AG10K",
  title: "Controlled Generated Image Article Insertion Apply",
  status: "generated_image_inserted_pending_post_insertion_audit",
  depends_on: ["AG10J", "AG10I", "AG10H"],
  generated_from: inputs,
  summary: {
    selected_article_path: selectedArticlePath,
    asset_id: ag10jAssetRecord.asset_id,
    asset_path: assetRelativePath,
    asset_hash_sha256: assetHash,
    backup_path: backupRelativePath,
    pre_insertion_hash: preHash,
    post_insertion_hash: postHash,
    next_stage_id: "AG10L",
    next_stage_title: "Post Generated Image Insertion Audit",
    ...stageControls
  },
  apply_record_file: "data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json",
  audit_prep_file: "data/content-intelligence/quality-registry/ag10k-post-generated-image-insertion-audit-prep.json",
  layout_record_file: "data/content-intelligence/quality-registry/ag10k-layout-preservation-record.json",
  rollback_record_file: "data/content-intelligence/quality-registry/ag10k-rollback-readiness-record.json",
  schema_file: "data/content-intelligence/schema/controlled-generated-image-insertion-apply.schema.json",
  learning_file: "data/content-intelligence/learning/ag10k-controlled-generated-image-insertion-apply-learning.json",
  closure_decision: {
    decision: "ag10k_insertion_applied_pending_explicit_ag10l_audit",
    proceed_to_ag10l_only_with_explicit_user_approval: true,
    ...stageControls
  },
  ...stageControls
};

const learning = {
  module_id: "AG10K",
  title: "Controlled Generated Image Insertion Apply Learning",
  status: "learning_record_only",
  learning_points: [
    "Asset creation and article insertion remain separated across AG10J and AG10K.",
    "AG10K mutates only the selected article and only after creating a backup.",
    "A section-support visual should not replace or disturb the hero image.",
    "Caption, alt text and visible credit must travel from AG10J asset record into the article.",
    "Post-insertion audit is mandatory before closure or publishing readiness."
  ],
  ...stageControls
};

const registry = {
  module_id: "AG10K",
  title: "Controlled Generated Image Article Insertion Apply",
  status: "generated_image_inserted_pending_post_insertion_audit",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag10k-controlled-generated-image-insertion-apply.json",
    apply_record: "data/content-intelligence/apply-records/ag10k-controlled-generated-image-insertion-apply.json",
    audit_prep: "data/content-intelligence/quality-registry/ag10k-post-generated-image-insertion-audit-prep.json",
    layout_record: "data/content-intelligence/quality-registry/ag10k-layout-preservation-record.json",
    rollback_record: "data/content-intelligence/quality-registry/ag10k-rollback-readiness-record.json",
    schema: "data/content-intelligence/schema/controlled-generated-image-insertion-apply.schema.json",
    learning: "data/content-intelligence/learning/ag10k-controlled-generated-image-insertion-apply-learning.json",
    preview: "data/quality/ag10k-controlled-generated-image-insertion-apply-preview.json",
    document: "docs/quality/AG10K_CONTROLLED_GENERATED_IMAGE_INSERTION_APPLY.md"
  },
  ...stageControls
};

const preview = {
  module_id: "AG10K",
  preview_only: true,
  status: "generated_image_inserted_pending_post_insertion_audit",
  selected_article_path: selectedArticlePath,
  asset_path: assetRelativePath,
  caption: ag10jAssetRecord.caption,
  visible_credit: ag10jAssetRecord.visible_credit,
  next_stage: auditPrep,
  ...stageControls
};

const doc = `# AG10K — Controlled Generated Image Article Insertion Apply

## Purpose

AG10K inserts the AG10J finalised SVG editorial asset into the selected article.

AG10K creates a backup before mutation and mutates only the selected article.

## Inserted Asset

- Asset ID: \`${ag10jAssetRecord.asset_id}\`
- Asset path: \`${assetRelativePath}\`
- Article src: \`${assetSrc}\`
- Hash: \`${assetHash}\`
- Caption: ${ag10jAssetRecord.caption}
- Alt text: ${ag10jAssetRecord.alt_text}
- Credit: ${ag10jAssetRecord.visible_credit}

## Backup

- Backup path: \`${backupRelativePath}\`
- Pre-insertion hash: \`${preHash}\`
- Post-insertion hash: \`${postHash}\`

## Boundaries

AG10K does not generate an image, call an external image API, create a new asset, change references, mutate homepage, mutate CSS/JS, activate backend/Auth/Supabase/database systems or publish anything.

## Next Stage

AG10L — Post Generated Image Insertion Audit — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(applyRecordPath, applyRecord);
writeJson(auditPrepPath, auditPrep);
writeJson(layoutRecordPath, layoutRecord);
writeJson(rollbackRecordPath, rollbackRecord);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG10K controlled generated image insertion apply completed.");
console.log(`✅ Selected article mutated: ${selectedArticlePath}`);
console.log(`✅ Backup created: ${backupRelativePath}`);
console.log(`✅ Asset inserted: ${assetRelativePath}`);
console.log(`✅ Pre-hash: ${preHash}`);
console.log(`✅ Post-hash: ${postHash}`);
console.log("✅ No image generation, new asset creation, reference change, CSS/JS mutation, backend activation or publishing performed.");
console.log("✅ AG10L handoff created with explicit approval required.");
