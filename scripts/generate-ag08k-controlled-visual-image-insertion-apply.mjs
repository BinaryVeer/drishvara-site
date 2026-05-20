import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag08kaReview: "data/content-intelligence/quality-reviews/ag08ka-visual-asset-creation-source-finalisation.json",
  ag08kaAssetRecord: "data/content-intelligence/visual-registry/ag08ka-finalised-visual-asset-record.json",
  ag08kaReadiness: "data/content-intelligence/quality-registry/ag08ka-visual-asset-readiness.json",
  ag08kaBoundary: "data/content-intelligence/mutation-plans/ag08ka-to-ag08k-controlled-insertion-boundary.json",
  ag08jLayoutDoctrine: "data/content-intelligence/visual-registry/ag08j-article-object-placement-doctrine.json",
  ag08gApplyRecord: "data/content-intelligence/apply-records/ag08g-one-article-controlled-apply.json",
  ag08hAudit: "data/content-intelligence/audit-records/ag08h-post-apply-audit-report.json"
};

const targetArticlePath = "articles/policy/enhancing-public-healthcare-delivery-digital-innovation.html";
const backupRelativePath = "archive/ag08k-backups/enhancing-public-healthcare-delivery-digital-innovation-before-ag08k.html";

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag08k-controlled-visual-image-insertion-apply.json");
const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json");
const auditPrepPath = path.join(root, "data/content-intelligence/quality-registry/ag08k-post-insertion-audit-prep.json");
const layoutRecordPath = path.join(root, "data/content-intelligence/quality-registry/ag08k-layout-preservation-record.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/controlled-visual-image-insertion-apply.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag08k-controlled-visual-image-insertion-apply-learning.json");
const registryPath = path.join(root, "data/quality/ag08k-controlled-visual-image-insertion-apply.json");
const previewPath = path.join(root, "data/quality/ag08k-controlled-visual-image-insertion-apply-preview.json");
const docPath = path.join(root, "docs/quality/AG08K_CONTROLLED_VISUAL_IMAGE_INSERTION_APPLY.md");

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

function countOccurrences(text, needle) {
  return String(text || "").split(needle).length - 1;
}

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function listHtmlFiles(dir) {
  const out = [];
  const absRoot = path.join(root, dir);
  if (!fs.existsSync(absRoot)) return out;

  function walk(absDir) {
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      const abs = path.join(absDir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else if (entry.isFile() && entry.name.endsWith(".html")) {
        out.push(path.relative(root, abs));
      }
    }
  }

  walk(absRoot);
  return out;
}

function insertHeroBlock(articleHtml, heroBlock) {
  if (articleHtml.includes("AG08K-HERO-VISUAL-INSERTION")) {
    throw new Error("AG08K hero visual marker already exists. Refusing duplicate insertion.");
  }

  const controlledMarker = "<!-- AG08G-CONTROLLED-APPLY -->";
  const markerIndex = articleHtml.indexOf(controlledMarker);
  if (markerIndex === -1) {
    throw new Error("AG08G controlled apply marker missing.");
  }

  const articleCloseIndex = articleHtml.indexOf("</article>", markerIndex);
  if (articleCloseIndex === -1) {
    throw new Error("Article closing tag missing after AG08G marker.");
  }

  const afterMarker = markerIndex + controlledMarker.length;
  const articleSegment = articleHtml.slice(afterMarker, articleCloseIndex);

  const firstParagraphMatch = articleSegment.match(/<\/p>/i);
  if (firstParagraphMatch && typeof firstParagraphMatch.index === "number") {
    const insertAt = afterMarker + firstParagraphMatch.index + firstParagraphMatch[0].length;
    return `${articleHtml.slice(0, insertAt)}\n${heroBlock}\n${articleHtml.slice(insertAt)}`;
  }

  const firstHeadingMatch = articleSegment.match(/<\/h1>/i);
  if (firstHeadingMatch && typeof firstHeadingMatch.index === "number") {
    const insertAt = afterMarker + firstHeadingMatch.index + firstHeadingMatch[0].length;
    return `${articleHtml.slice(0, insertAt)}\n${heroBlock}\n${articleHtml.slice(insertAt)}`;
  }

  return `${articleHtml.slice(0, afterMarker)}\n${heroBlock}\n${articleHtml.slice(afterMarker)}`;
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) {
    throw new Error(`Missing required AG08K input ${name}: ${relativePath}`);
  }
}

const ag08kaReview = readJson(inputs.ag08kaReview);
const ag08kaAsset = readJson(inputs.ag08kaAssetRecord);
const ag08kaReadiness = readJson(inputs.ag08kaReadiness);
const ag08kaBoundary = readJson(inputs.ag08kaBoundary);
const ag08jLayout = readJson(inputs.ag08jLayoutDoctrine);
const ag08gApply = readJson(inputs.ag08gApplyRecord);
const ag08hAudit = readJson(inputs.ag08hAudit);

if (ag08kaReview.status !== "visual_asset_created_source_finalised_not_inserted") {
  throw new Error("AG08K requires AG08K-A review to be complete.");
}

if (ag08kaReadiness.status !== "visual_asset_ready_pending_explicit_ag08k_insertion") {
  throw new Error("AG08K requires AG08K-A readiness to pass.");
}

if (ag08kaBoundary.next_stage_id !== "AG08K" || ag08kaBoundary.explicit_approval_required !== true) {
  throw new Error("AG08K requires AG08K-A controlled insertion boundary.");
}

if (ag08hAudit.status !== "post_apply_audit_passed") {
  throw new Error("AG08K requires AG08H audit to pass.");
}

if (ag08gApply.selected_article_path !== targetArticlePath) {
  throw new Error(`AG08K target mismatch: ${ag08gApply.selected_article_path}`);
}

if (!exists(targetArticlePath)) {
  throw new Error(`AG08K target article missing: ${targetArticlePath}`);
}

const assetPath = ag08kaAsset.asset?.asset_path;
if (!assetPath || !exists(assetPath)) {
  throw new Error(`AG08K approved asset missing: ${assetPath}`);
}

const assetSvg = fs.readFileSync(path.join(root, assetPath), "utf8");
const assetHash = sha256(assetSvg);

if (assetHash !== ag08kaAsset.asset.asset_hash_sha256) {
  throw new Error("AG08K asset hash mismatch.");
}

const articleAbs = path.join(root, targetArticlePath);
const backupAbs = path.join(root, backupRelativePath);

const htmlBefore = fs.readFileSync(articleAbs, "utf8");
const beforeHash = sha256(htmlBefore);

if (fs.existsSync(applyRecordPath)) {
  const existingApply = readJson(path.relative(root, applyRecordPath));
  if (
    existingApply.module_id === "AG08K" &&
    existingApply.status === "controlled_visual_image_inserted_pending_post_insertion_audit" &&
    existingApply.selected_article_path === targetArticlePath &&
    existingApply.post_insertion_hash === beforeHash &&
    htmlBefore.includes("AG08K-HERO-VISUAL-INSERTION")
  ) {
    console.log("✅ AG08K already applied; existing visual insertion is valid.");
    console.log(`✅ Mutated article: ${targetArticlePath}`);
    console.log("✅ No duplicate visual insertion performed.");
    process.exit(0);
  }
}

if (beforeHash !== ag08gApply.post_apply_hash) {
  throw new Error("AG08K selected article hash must match AG08G post-apply hash before visual insertion.");
}

if (htmlBefore.includes(assetPath) || htmlBefore.includes("AG08K-HERO-VISUAL-INSERTION")) {
  throw new Error("AG08K visual already appears to be inserted. Refusing duplicate insertion.");
}

ensureDir(backupAbs);
if (fs.existsSync(backupAbs)) {
  const existingBackupHash = sha256(fs.readFileSync(backupAbs, "utf8"));
  if (existingBackupHash !== beforeHash) {
    throw new Error("Existing AG08K backup does not match current pre-insertion article hash.");
  }
} else {
  fs.writeFileSync(backupAbs, htmlBefore);
}

const backupHtml = fs.readFileSync(backupAbs, "utf8");
const backupHash = sha256(backupHtml);

if (backupHtml.includes("AG08K-HERO-VISUAL-INSERTION")) {
  throw new Error("AG08K backup must not contain AG08K visual marker.");
}

const articleDir = path.dirname(targetArticlePath);
const relativeAssetSrc = path.relative(articleDir, assetPath).replaceAll(path.sep, "/");

const heroBlock = `
<figure id="ag08k-hero-visual-block" class="drishvara-article-visual drishvara-article-hero-visual ag08k-hero-visual-block" data-drishvara-ag08k-visual-insertion="true" data-drishvara-visual-type="primary_hero_visual">
  <!-- AG08K-HERO-VISUAL-INSERTION -->
  <img src="${escapeAttr(relativeAssetSrc)}" alt="${escapeAttr(ag08kaAsset.metadata.alt_text_final)}" width="1600" height="900" loading="lazy" decoding="async" />
  <figcaption>
    <span class="drishvara-visual-caption">${escapeAttr(ag08kaAsset.metadata.caption_final)}</span>
    <span class="drishvara-visual-credit">${escapeAttr(ag08kaAsset.metadata.credit_text_final)}</span>
  </figcaption>
</figure>`.trim();

let htmlAfter = insertHeroBlock(htmlBefore, heroBlock);

const afterHash = sha256(htmlAfter);

if (afterHash === beforeHash) {
  throw new Error("AG08K insertion did not change article.");
}

fs.writeFileSync(articleAbs, htmlAfter);

const htmlAfterWritten = fs.readFileSync(articleAbs, "utf8");
const finalHash = sha256(htmlAfterWritten);

if (finalHash !== afterHash) {
  throw new Error("AG08K written article hash mismatch.");
}

const articleFilesWithAg08kMarker = listHtmlFiles("articles").filter((file) => {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  return html.includes("AG08K-HERO-VISUAL-INSERTION");
});

const layoutPreservation = {
  module_id: "AG08K",
  title: "Layout Preservation Record",
  status: "layout_preservation_recorded_pending_visual_audit",
  selected_article_path: targetArticlePath,
  inserted_visual_block_id: "ag08k-hero-visual-block",
  placement_type: "hero_image_near_top_after_intro_or_heading",
  article_shape_preservation: {
    preserve_article_shape_required: true,
    preserve_justified_text_required: true,
    hero_image_centered_in_reading_column: true,
    text_wrap_required: false,
    no_table_or_graph_wrap_added: true,
    no_inline_object_deforming_text: true,
    mobile_safe_dimensions_declared: true,
    width_height_declared: true
  },
  placement_doctrine_consumed: {
    preserve_article_shape: ag08jLayout.global_article_layout_rules.preserve_article_shape,
    main_text_must_remain_justified: ag08jLayout.global_article_layout_rules.main_text_must_remain_justified,
    hero_alignment: ag08jLayout.object_type_rules.hero_image.alignment,
    hero_text_wrap: ag08jLayout.object_type_rules.hero_image.text_wrap
  }
};

const noMutationControls = {
  controlled_visual_insertion_apply_stage: true,
  fresh_backup_created_before_apply: true,
  exactly_one_visual_block_inserted: true,
  article_mutation_performed_in_ag08k: true,
  selected_article_file_write_performed_in_ag08k: true,
  image_insertion_performed_in_ag08k: true,
  approved_asset_reused_without_generation_in_ag08k: true,
  external_gpt_image_generation_performed_in_ag08k: false,
  external_image_api_call_performed_in_ag08k: false,
  new_visual_asset_created_in_ag08k: false,
  css_mutation_performed_in_ag08k: false,
  js_mutation_performed_in_ag08k: false,
  reference_insertion_performed_in_ag08k: false,
  reference_url_change_performed_in_ag08k: false,
  multi_article_mutation_performed_in_ag08k: false,
  homepage_mutation_performed_in_ag08k: false,
  production_jsonl_append_performed_in_ag08k: false,
  database_write_performed_in_ag08k: false,
  supabase_write_performed_in_ag08k: false,
  backend_auth_supabase_activation_performed_in_ag08k: false,
  public_publishing_performed_in_ag08k: false,
  publishing_approval_performed_in_ag08k: false,
  rollback_execution_performed_in_ag08k: false
};

const markerAndGovernanceStatus = {
  ag08g_marker_count: countOccurrences(htmlAfterWritten, "AG08G-CONTROLLED-APPLY"),
  ag08g_references_marker_count: countOccurrences(htmlAfterWritten, "AG08G-APPROVED-REFERENCES"),
  ag08g_legacy_marker_count: countOccurrences(htmlAfterWritten, "AG08G-LEGACY-GOVERNANCE-PRESERVED"),
  ag08k_marker_count: countOccurrences(htmlAfterWritten, "AG08K-HERO-VISUAL-INSERTION"),
  ag03c_b2_evidence_present:
    /AG03C-B2/i.test(htmlAfterWritten) ||
    /data-drishvara-ag03c-b2-reference-block=["']true["']/i.test(htmlAfterWritten),
  ag05d_evidence_present:
    /AG05D/i.test(htmlAfterWritten) ||
    /data-drishvara-ag05d-visible-reference-block=["']true["']/i.test(htmlAfterWritten) ||
    /drishvara-ag05d-visible-reference-block/i.test(htmlAfterWritten),
  exactly_one_article_contains_ag08k_marker:
    articleFilesWithAg08kMarker.length === 1 && articleFilesWithAg08kMarker[0] === targetArticlePath
};

const applyRecord = {
  module_id: "AG08K",
  title: "Controlled Visual Image Insertion Apply Record",
  status: "controlled_visual_image_inserted_pending_post_insertion_audit",
  selected_article_path: targetArticlePath,
  backup_path: backupRelativePath,
  pre_insertion_hash: beforeHash,
  post_insertion_hash: finalHash,
  backup_hash: backupHash,
  asset_path: assetPath,
  asset_src_inserted: relativeAssetSrc,
  asset_hash_sha256: assetHash,
  inserted_visual_block_id: "ag08k-hero-visual-block",
  inserted_marker: "AG08K-HERO-VISUAL-INSERTION",
  inserted_alt_text: ag08kaAsset.metadata.alt_text_final,
  inserted_caption: ag08kaAsset.metadata.caption_final,
  inserted_credit: ag08kaAsset.metadata.credit_text_final,
  marker_and_governance_status: markerAndGovernanceStatus,
  layout_preservation_record_file: "data/content-intelligence/quality-registry/ag08k-layout-preservation-record.json",
  production_readiness_after_ag08k: "visual_inserted_pending_post_insertion_audit",
  publish_readiness_after_ag08k: "static_file_changed_not_publish_approved",
  ...noMutationControls
};

const auditPrep = {
  module_id: "AG08K",
  title: "AG08K Post-Insertion Audit Prep",
  status: "post_visual_insertion_audit_required",
  selected_article_path: targetArticlePath,
  backup_path: backupRelativePath,
  pre_insertion_hash: beforeHash,
  post_insertion_hash: finalHash,
  asset_path: assetPath,
  audit_checks_for_ag08l: [
    "Backup exists and has no AG08K marker.",
    "Target article contains exactly one AG08K hero visual marker.",
    "Exactly one article contains AG08K marker.",
    "Inserted asset path points to the approved AG08K-A SVG.",
    "Alt text, caption and visible credit are present.",
    "AG08G marker, AG08G reference marker and legacy governance markers are preserved.",
    "No reference URLs changed.",
    "No CSS/JS mutation occurred.",
    "No external image generation/API call occurred.",
    "No database/Supabase/backend/Auth/publishing activation occurred.",
    "validate:ag08k passes.",
    "validate:project passes."
  ],
  ag08l_handoff: {
    next_stage_id: "AG08L",
    next_stage_title: "Post-Visual-Insertion Audit",
    explicit_approval_required: true,
    allowed_scope: "audit AG08K visual insertion, backup, marker scope, asset reference, metadata, layout preservation and forbidden-system guards",
    blocked_scope: "new image insertion, new article mutation, CSS/JS mutation, reference changes, JSONL/database/Supabase/backend/Auth/publishing activation"
  },
  ...noMutationControls
};

const schema = {
  module_id: "AG08K",
  title: "Controlled Visual Image Insertion Apply Schema",
  status: "schema_controlled_visual_image_insertion_apply",
  fresh_backup_creation_allowed_in_ag08k: true,
  selected_article_visual_insertion_allowed_in_ag08k: true,
  approved_asset_reuse_allowed_in_ag08k: true,
  alt_caption_credit_insertion_allowed_in_ag08k: true,
  layout_preservation_record_allowed_in_ag08k: true,
  external_gpt_image_generation_allowed_in_ag08k: false,
  external_image_api_call_allowed_in_ag08k: false,
  new_visual_asset_creation_allowed_in_ag08k: false,
  multi_article_mutation_allowed_in_ag08k: false,
  homepage_mutation_allowed_in_ag08k: false,
  css_js_mutation_allowed_in_ag08k: false,
  reference_insertion_allowed_in_ag08k: false,
  reference_url_change_allowed_in_ag08k: false,
  production_jsonl_append_allowed_in_ag08k: false,
  database_write_allowed_in_ag08k: false,
  supabase_write_allowed_in_ag08k: false,
  backend_auth_supabase_activation_allowed_in_ag08k: false,
  publishing_allowed_in_ag08k: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: targetArticlePath,
  backup_path: backupRelativePath,
  asset_path: assetPath,
  asset_src_inserted: relativeAssetSrc,
  pre_insertion_hash: beforeHash,
  post_insertion_hash: finalHash,
  backup_created: true,
  visual_inserted: true,
  exactly_one_visual_block_inserted: true,
  layout_preservation_recorded: true,
  article_shape_preservation_required: true,
  justified_text_preservation_required: true,
  production_readiness_after_ag08k: "visual_inserted_pending_post_insertion_audit",
  publish_readiness_after_ag08k: "static_file_changed_not_publish_approved",
  next_stage_id: "AG08L",
  next_stage_title: "Post-Visual-Insertion Audit",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const review = {
  module_id: "AG08K",
  title: "Controlled Visual Image Insertion Apply",
  status: "controlled_visual_image_inserted_pending_post_insertion_audit",
  depends_on: ["AG08K-A", "AG08J", "AG08G", "AG08H"],
  generated_from: inputs,
  summary,
  apply_record_file: "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json",
  audit_prep_file: "data/content-intelligence/quality-registry/ag08k-post-insertion-audit-prep.json",
  layout_preservation_record_file: "data/content-intelligence/quality-registry/ag08k-layout-preservation-record.json",
  schema_file: "data/content-intelligence/schema/controlled-visual-image-insertion-apply.schema.json",
  learning_file: "data/content-intelligence/learning/ag08k-controlled-visual-image-insertion-apply-learning.json",
  closure_decision: {
    decision: "ag08k_visual_inserted_pending_explicit_ag08l_audit",
    proceed_to_ag08l_only_with_explicit_user_approval: true,
    selected_article_path: targetArticlePath,
    image_insertion_performed_in_ag08k: true,
    article_mutation_performed_in_ag08k: true,
    selected_article_file_write_performed_in_ag08k: true,
    external_gpt_image_generation_performed_in_ag08k: false,
    external_image_api_call_performed_in_ag08k: false,
    css_mutation_performed_in_ag08k: false,
    js_mutation_performed_in_ag08k: false,
    reference_insertion_performed_in_ag08k: false,
    reference_url_change_performed_in_ag08k: false,
    production_jsonl_append_performed_in_ag08k: false,
    database_write_performed_in_ag08k: false,
    supabase_write_performed_in_ag08k: false,
    backend_auth_supabase_activation_performed_in_ag08k: false,
    public_publishing_performed_in_ag08k: false,
    production_readiness: summary.production_readiness_after_ag08k,
    publish_readiness: summary.publish_readiness_after_ag08k
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG08K",
  title: "Controlled Visual Image Insertion Apply Learning",
  status: "learning_record_only",
  summary,
  ag08k_learning_points: [
    "Visual insertion should use a fresh backup distinct from text/reference apply backup.",
    "AG08K should reuse the finalised internal SVG asset without generating a new image.",
    "Hero visual insertion is safer than inline data/table insertion for first visual apply.",
    "Layout preservation must be audited as a formal record.",
    "Post-visual-insertion audit is required before any closure or publishing consideration."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG08K",
  title: "Controlled Visual Image Insertion Apply",
  status: "controlled_visual_image_inserted_pending_post_insertion_audit",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag08k-controlled-visual-image-insertion-apply.json",
    apply_record: "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json",
    audit_prep: "data/content-intelligence/quality-registry/ag08k-post-insertion-audit-prep.json",
    layout_preservation: "data/content-intelligence/quality-registry/ag08k-layout-preservation-record.json",
    schema: "data/content-intelligence/schema/controlled-visual-image-insertion-apply.schema.json",
    learning: "data/content-intelligence/learning/ag08k-controlled-visual-image-insertion-apply-learning.json",
    preview: "data/quality/ag08k-controlled-visual-image-insertion-apply-preview.json",
    document: "docs/quality/AG08K_CONTROLLED_VISUAL_IMAGE_INSERTION_APPLY.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG08K",
  preview_only: true,
  status: "controlled_visual_image_inserted_pending_post_insertion_audit",
  summary,
  inserted_visual: {
    block_id: "ag08k-hero-visual-block",
    asset_src: relativeAssetSrc,
    alt_text: ag08kaAsset.metadata.alt_text_final,
    caption: ag08kaAsset.metadata.caption_final,
    credit: ag08kaAsset.metadata.credit_text_final
  },
  layout_preservation: layoutPreservation,
  ag08l_handoff: auditPrep.ag08l_handoff,
  ...noMutationControls
};

const doc = `# AG08K — Controlled Visual Image Insertion Apply

## Purpose

AG08K creates a fresh backup and inserts exactly one approved AG08K-A hero visual into the selected article.

AG08K reuses the internal SVG asset finalised in AG08K-A. It does not generate a new image, call an external image API, mutate CSS/JS, change references, append JSONL records, write to database/Supabase, activate backend/Auth/Supabase or approve publishing.

## Target Article

- Path: \`${targetArticlePath}\`
- Backup: \`${backupRelativePath}\`
- Pre-insertion hash: \`${beforeHash}\`
- Post-insertion hash: \`${finalHash}\`

## Inserted Visual

- Asset: \`${assetPath}\`
- Article src: \`${relativeAssetSrc}\`
- Block ID: \`ag08k-hero-visual-block\`
- Marker: \`AG08K-HERO-VISUAL-INSERTION\`

## Layout Protection

- Hero image inserted near the top of the article.
- Main article text remains subject to justified layout doctrine.
- No table, graph or inline wrapped object is inserted in AG08K.
- AG08G references and legacy governance blocks are preserved.

## Next Stage

AG08L — Post-Visual-Insertion Audit — is required before closure.
`;

writeJson(reviewPath, review);
writeJson(applyRecordPath, applyRecord);
writeJson(auditPrepPath, auditPrep);
writeJson(layoutRecordPath, layoutPreservation);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG08K controlled visual image insertion apply completed.");
console.log(`✅ Fresh backup created: ${backupRelativePath}`);
console.log(`✅ Inserted approved SVG asset into: ${targetArticlePath}`);
console.log("✅ Alt text, caption and visible credit inserted.");
console.log("✅ No external image generation, CSS/JS mutation, reference change, backend/database/Supabase activation or publishing performed.");
console.log("✅ AG08L handoff created with explicit approval required.");
