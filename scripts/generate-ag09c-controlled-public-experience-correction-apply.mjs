import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag09bReview: "data/content-intelligence/quality-reviews/ag09b-public-experience-correction-plan.json",
  ag09bPlan: "data/content-intelligence/mutation-plans/ag09b-public-experience-correction-plan.json",
  ag09bReadiness: "data/content-intelligence/quality-registry/ag09b-correction-plan-readiness.json",
  ag09bBoundary: "data/content-intelligence/mutation-plans/ag09b-to-ag09c-controlled-correction-apply-boundary.json",
  ag09aGapRegister: "data/content-intelligence/quality-registry/ag09a-public-experience-gap-register.json",
  ag08kApply: "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag09c-controlled-public-experience-correction-apply.json");
const applyRecordPath = path.join(root, "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json");
const auditPrepPath = path.join(root, "data/content-intelligence/quality-registry/ag09c-post-correction-audit-prep.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/controlled-public-experience-correction-apply.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag09c-controlled-public-experience-correction-apply-learning.json");
const registryPath = path.join(root, "data/quality/ag09c-controlled-public-experience-correction-apply.json");
const previewPath = path.join(root, "data/quality/ag09c-controlled-public-experience-correction-apply-preview.json");
const docPath = path.join(root, "docs/quality/AG09C_CONTROLLED_PUBLIC_EXPERIENCE_CORRECTION_APPLY.md");

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
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function backupPathFor(filePath) {
  const safeName = filePath.replaceAll("/", "__");
  return `archive/ag09c-backups/${safeName}-before-ag09c`;
}

function ensureBackup(filePath, content) {
  const backupRelative = backupPathFor(filePath);
  const backupAbs = path.join(root, backupRelative);
  ensureDir(backupAbs);
  if (!fs.existsSync(backupAbs)) fs.writeFileSync(backupAbs, content);
  return {
    file_path: filePath,
    backup_path: backupRelative,
    backup_hash: sha256(fs.readFileSync(backupAbs, "utf8")),
    pre_hash: sha256(content)
  };
}

function upsertMetaByNameOrProperty(html, keyType, key, content) {
  const escapedContent = escapeAttr(content);
  const escapedKey = escapeAttr(key);
  const regex = new RegExp(`<meta\\s+[^>]*${keyType}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "i");
  const tag = `<meta ${keyType}="${escapedKey}" content="${escapedContent}">`;
  if (regex.test(html)) return html.replace(regex, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function upsertCanonical(html, href) {
  const tag = `<link rel="canonical" href="${escapeAttr(href)}">`;
  if (/<link\s+[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
    return html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i, tag);
  }
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function ensureAg09cMetadataBlock(html, metadata) {
  if (!/<\/head>/i.test(html)) throw new Error("Selected article has no </head> for metadata correction.");

  let out = html;

  out = upsertCanonical(out, metadata.canonical_url);
  out = upsertMetaByNameOrProperty(out, "name", "description", metadata.description);
  out = upsertMetaByNameOrProperty(out, "property", "og:title", metadata.title);
  out = upsertMetaByNameOrProperty(out, "property", "og:description", metadata.description);
  out = upsertMetaByNameOrProperty(out, "property", "og:type", "article");
  out = upsertMetaByNameOrProperty(out, "property", "og:url", metadata.canonical_url);
  out = upsertMetaByNameOrProperty(out, "property", "og:image", metadata.image_url);
  out = upsertMetaByNameOrProperty(out, "name", "twitter:card", "summary_large_image");
  out = upsertMetaByNameOrProperty(out, "name", "twitter:title", metadata.title);
  out = upsertMetaByNameOrProperty(out, "name", "twitter:description", metadata.description);
  out = upsertMetaByNameOrProperty(out, "name", "twitter:image", metadata.image_url);

  if (!out.includes("AG09C-PUBLIC-EXPERIENCE-METADATA")) {
    out = out.replace(/<\/head>/i, `  <!-- AG09C-PUBLIC-EXPERIENCE-METADATA -->\n</head>`);
  }

  return out;
}

function insertListingLink(html, articlePath, articleTitle, description) {
  if (html.includes("AG09C-PUBLIC-EXPERIENCE-LISTING") || html.includes(articlePath)) return html;

  const card = `
<section data-drishvara-ag09c-public-experience-listing="true" class="drishvara-public-readiness-featured-link" aria-labelledby="ag09c-featured-read-title">
  <!-- AG09C-PUBLIC-EXPERIENCE-LISTING -->
  <h2 id="ag09c-featured-read-title">Featured Read</h2>
  <article>
    <h3><a href="${escapeAttr(articlePath)}">${escapeHtml(articleTitle)}</a></h3>
    <p>${escapeHtml(description)}</p>
  </article>
</section>`.trim();

  if (/<\/main>/i.test(html)) return html.replace(/<\/main>/i, `${card}\n</main>`);
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${card}\n</body>`);
  return `${html}\n${card}\n`;
}

function selectListingFile(correction) {
  const targets = correction.target_files_if_later_approved || [];
  for (const candidate of targets) {
    if (exists(candidate)) return candidate;
  }
  for (const candidate of ["index.html", "articles.html", "featured-reads.html"]) {
    if (exists(candidate)) return candidate;
  }
  return null;
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG09C input ${name}: ${relativePath}`);
}

const ag09bReview = readJson(inputs.ag09bReview);
const ag09bPlan = readJson(inputs.ag09bPlan);
const ag09bReadiness = readJson(inputs.ag09bReadiness);
const ag09bBoundary = readJson(inputs.ag09bBoundary);
const ag09aGaps = readJson(inputs.ag09aGapRegister);
const ag08kApply = readJson(inputs.ag08kApply);

if (ag09bReview.status !== "correction_plan_created_not_executed") throw new Error("AG09C requires AG09B review.");
if (ag09bPlan.status !== "correction_plan_created_not_executed") throw new Error("AG09C requires AG09B plan.");
if (ag09bReadiness.status !== "correction_plan_ready_pending_explicit_ag09c") throw new Error("AG09C requires AG09B readiness.");
if (ag09bBoundary.next_stage_id !== "AG09C" || ag09bBoundary.explicit_approval_required !== true) {
  throw new Error("AG09C requires AG09B controlled apply boundary.");
}

const selectedArticlePath = ag08kApply.selected_article_path;
if (!exists(selectedArticlePath)) throw new Error(`Selected article missing: ${selectedArticlePath}`);

const articleBefore = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const articleBeforeHash = sha256(articleBefore);

if (fs.existsSync(applyRecordPath)) {
  const existing = JSON.parse(fs.readFileSync(applyRecordPath, "utf8"));
  if (
    existing.module_id === "AG09C" &&
    existing.status === "controlled_public_experience_corrections_applied_pending_audit" &&
    existing.selected_article_path === selectedArticlePath &&
    existing.post_correction_hash === articleBeforeHash
  ) {
    console.log("✅ AG09C already applied; existing correction state is valid.");
    console.log("✅ No duplicate correction performed.");
    process.exit(0);
  }
}

if (articleBeforeHash !== ag08kApply.post_insertion_hash) {
  throw new Error("AG09C selected article hash must match AG08K post-insertion hash before correction.");
}

const correctionItems = ag09bPlan.correction_items || [];
if (correctionItems.length !== (ag09aGaps.gaps || []).length) {
  throw new Error("AG09C correction item count must match AG09A gap count.");
}

const articleTitle =
  ag09bPlan.article_title ||
  (articleBefore.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "Enhancing Public Healthcare Delivery through Digital Innovation")
    .replace(/<[^>]+>/g, "")
    .trim();

const description =
  "A Drishvara featured read on how digital innovation can strengthen public healthcare delivery through service access, records, telemedicine and accountable governance.";

const canonicalUrl = `https://drishvara.com/${selectedArticlePath}`;
const imageUrl = `https://drishvara.com/${ag08kApply.asset_path}`;

const metadata = {
  title: articleTitle,
  description,
  canonical_url: canonicalUrl,
  image_url: imageUrl
};

const mutatedFiles = [];
const backups = [];
const appliedCorrections = [];

let articleAfter = articleBefore;
let articleMutated = false;

for (const correction of correctionItems) {
  if (
    correction.correction_type === "article_head_metadata_correction" ||
    correction.correction_type === "open_graph_twitter_metadata_correction"
  ) {
    const before = articleAfter;
    articleAfter = ensureAg09cMetadataBlock(articleAfter, metadata);
    if (articleAfter !== before) {
      articleMutated = true;
    }
    appliedCorrections.push({
      correction_id: correction.correction_id,
      source_gap_id: correction.source_gap_id,
      correction_type: correction.correction_type,
      applied: true,
      mutated_files: [selectedArticlePath]
    });
  } else if (correction.correction_type === "homepage_or_featured_listing_discoverability_correction") {
    const listingFile = selectListingFile(correction);
    if (!listingFile) throw new Error("AG09C listing correction planned but no listing file exists.");

    const listingBefore = fs.readFileSync(path.join(root, listingFile), "utf8");
    const listingAfter = insertListingLink(listingBefore, selectedArticlePath, articleTitle, description);

    if (listingAfter !== listingBefore) {
      backups.push(ensureBackup(listingFile, listingBefore));
      fs.writeFileSync(path.join(root, listingFile), listingAfter);
      mutatedFiles.push({
        file_path: listingFile,
        pre_hash: sha256(listingBefore),
        post_hash: sha256(listingAfter),
        correction_type: correction.correction_type
      });
    }

    appliedCorrections.push({
      correction_id: correction.correction_id,
      source_gap_id: correction.source_gap_id,
      correction_type: correction.correction_type,
      applied: true,
      mutated_files: [listingFile]
    });
  } else {
    appliedCorrections.push({
      correction_id: correction.correction_id,
      source_gap_id: correction.source_gap_id,
      correction_type: correction.correction_type,
      applied: false,
      reason: "Correction type is planned but not executable by AG09C generator."
    });
  }
}

if (articleMutated) {
  backups.push(ensureBackup(selectedArticlePath, articleBefore));
  fs.writeFileSync(path.join(root, selectedArticlePath), articleAfter);
  mutatedFiles.push({
    file_path: selectedArticlePath,
    pre_hash: articleBeforeHash,
    post_hash: sha256(articleAfter),
    correction_type: "article_head_metadata_and_social_preview"
  });
}

const finalArticleHtml = fs.readFileSync(path.join(root, selectedArticlePath), "utf8");
const finalArticleHash = sha256(finalArticleHtml);

const noMutationControls = {
  controlled_public_experience_correction_apply_stage: true,
  article_mutation_performed_in_ag09c: articleMutated,
  selected_article_file_write_performed_in_ag09c: articleMutated,
  homepage_or_listing_mutation_performed_in_ag09c: mutatedFiles.some((f) => f.file_path !== selectedArticlePath),
  fresh_backups_created_before_apply: backups.length > 0,
  correction_items_applied_count: appliedCorrections.filter((c) => c.applied).length,
  correction_items_planned_count: correctionItems.length,
  css_mutation_performed_in_ag09c: false,
  js_mutation_performed_in_ag09c: false,
  reference_insertion_performed_in_ag09c: false,
  reference_url_change_performed_in_ag09c: false,
  visual_generation_performed_in_ag09c: false,
  image_asset_creation_performed_in_ag09c: false,
  image_insertion_performed_in_ag09c: false,
  live_url_fetch_performed_in_ag09c: false,
  production_jsonl_append_performed_in_ag09c: false,
  database_write_performed_in_ag09c: false,
  supabase_write_performed_in_ag09c: false,
  backend_auth_supabase_activation_performed_in_ag09c: false,
  public_publishing_performed_in_ag09c: false,
  publishing_approval_performed_in_ag09c: false
};

const applyRecord = {
  module_id: "AG09C",
  title: "Controlled Public Experience Correction Apply",
  status: "controlled_public_experience_corrections_applied_pending_audit",
  selected_article_path: selectedArticlePath,
  pre_correction_hash: articleBeforeHash,
  post_correction_hash: finalArticleHash,
  source_gap_count: ag09aGaps.gap_count,
  correction_item_count: correctionItems.length,
  applied_corrections: appliedCorrections,
  mutated_files: mutatedFiles,
  backups,
  metadata_applied: {
    canonical_url: metadata.canonical_url,
    description: metadata.description,
    og_title: metadata.title,
    og_description: metadata.description,
    og_image: metadata.image_url,
    twitter_card: "summary_large_image"
  },
  production_readiness_after_ag09c: "public_experience_corrections_applied_pending_audit",
  publish_readiness_after_ag09c: "static_files_changed_not_publish_approved",
  ...noMutationControls
};

const auditPrep = {
  module_id: "AG09C",
  title: "AG09C Post-Correction Audit Prep",
  status: "post_public_experience_correction_audit_required",
  selected_article_path: selectedArticlePath,
  pre_correction_hash: articleBeforeHash,
  post_correction_hash: finalArticleHash,
  mutated_files: mutatedFiles,
  backups,
  audit_checks_for_ag09d: [
    "All AG09B planned correction items were applied or explicitly recorded.",
    "Fresh backups exist for every mutated file.",
    "Selected article has canonical, description, OG and Twitter metadata if metadata/social gaps were planned.",
    "Listing/homepage file contains discoverable link if listing gap was planned.",
    "No CSS/JS mutation occurred.",
    "No reference URL change occurred.",
    "No visual/image generation or insertion occurred.",
    "No backend/database/Supabase activation or publishing occurred.",
    "validate:project passes after correction."
  ],
  ag09d_handoff: {
    next_stage_id: "AG09D",
    next_stage_title: "Post-Correction Public Experience Audit",
    explicit_approval_required: true
  },
  ...noMutationControls
};

const schema = {
  module_id: "AG09C",
  title: "Controlled Public Experience Correction Apply Schema",
  status: "schema_controlled_public_experience_correction_apply",
  selected_article_head_metadata_correction_allowed_in_ag09c: true,
  social_preview_metadata_correction_allowed_in_ag09c: true,
  homepage_or_listing_discoverability_correction_allowed_in_ag09c: true,
  fresh_backup_creation_required_in_ag09c: true,
  css_js_mutation_allowed_in_ag09c: false,
  reference_insertion_allowed_in_ag09c: false,
  reference_url_change_allowed_in_ag09c: false,
  visual_generation_allowed_in_ag09c: false,
  image_asset_creation_allowed_in_ag09c: false,
  image_insertion_allowed_in_ag09c: false,
  live_url_fetch_allowed_in_ag09c: false,
  production_jsonl_append_allowed_in_ag09c: false,
  database_write_allowed_in_ag09c: false,
  supabase_write_allowed_in_ag09c: false,
  backend_auth_supabase_activation_allowed_in_ag09c: false,
  publishing_allowed_in_ag09c: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: selectedArticlePath,
  pre_correction_hash: articleBeforeHash,
  post_correction_hash: finalArticleHash,
  correction_items_planned: correctionItems.length,
  correction_items_applied: appliedCorrections.filter((c) => c.applied).length,
  mutated_file_count: mutatedFiles.length,
  backup_count: backups.length,
  production_readiness_after_ag09c: applyRecord.production_readiness_after_ag09c,
  publish_readiness_after_ag09c: applyRecord.publish_readiness_after_ag09c,
  next_stage_id: "AG09D",
  next_stage_title: "Post-Correction Public Experience Audit",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const review = {
  module_id: "AG09C",
  title: "Controlled Public Experience Correction Apply",
  status: "controlled_public_experience_corrections_applied_pending_audit",
  depends_on: ["AG09B", "AG09A", "AG08K"],
  generated_from: inputs,
  summary,
  apply_record_file: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",
  audit_prep_file: "data/content-intelligence/quality-registry/ag09c-post-correction-audit-prep.json",
  schema_file: "data/content-intelligence/schema/controlled-public-experience-correction-apply.schema.json",
  learning_file: "data/content-intelligence/learning/ag09c-controlled-public-experience-correction-apply-learning.json",
  closure_decision: {
    decision: "ag09c_corrections_applied_pending_explicit_ag09d_audit",
    proceed_to_ag09d_only_with_explicit_user_approval: true,
    publish_approval_granted: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG09C",
  title: "Controlled Public Experience Correction Apply Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "Public-experience corrections should be narrower than article-upgrade mutations.",
    "Metadata and listing corrections can be applied without reopening draft/reference/visual generation.",
    "Fresh backups are required for every mutated file.",
    "Publishing remains blocked until post-correction audit and explicit editorial approval."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG09C",
  title: "Controlled Public Experience Correction Apply",
  status: "controlled_public_experience_corrections_applied_pending_audit",
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag09c-controlled-public-experience-correction-apply.json",
    apply_record: "data/content-intelligence/apply-records/ag09c-controlled-public-experience-correction-apply.json",
    audit_prep: "data/content-intelligence/quality-registry/ag09c-post-correction-audit-prep.json",
    schema: "data/content-intelligence/schema/controlled-public-experience-correction-apply.schema.json",
    learning: "data/content-intelligence/learning/ag09c-controlled-public-experience-correction-apply-learning.json",
    preview: "data/quality/ag09c-controlled-public-experience-correction-apply-preview.json",
    document: "docs/quality/AG09C_CONTROLLED_PUBLIC_EXPERIENCE_CORRECTION_APPLY.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG09C",
  preview_only: true,
  status: "controlled_public_experience_corrections_applied_pending_audit",
  summary,
  applied_corrections: appliedCorrections,
  mutated_files: mutatedFiles,
  backups,
  ...noMutationControls
};

const doc = `# AG09C — Controlled Public Experience Correction Apply

## Purpose

AG09C applies only the AG09B-planned public-experience corrections.

## Applied Scope

- Selected article: \`${selectedArticlePath}\`
- Correction items planned: \`${correctionItems.length}\`
- Correction items applied: \`${appliedCorrections.filter((c) => c.applied).length}\`
- Mutated files: \`${mutatedFiles.length}\`
- Fresh backups: \`${backups.length}\`

## Boundaries

AG09C does not perform CSS/JS mutation, reference URL change, visual generation, image insertion, live URL fetch, JSONL append, database/Supabase write, backend/Auth/Supabase activation or publishing approval.

## Next Stage

AG09D — Post-Correction Public Experience Audit — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(applyRecordPath, applyRecord);
writeJson(auditPrepPath, auditPrep);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

console.log("✅ AG09C controlled public experience correction apply completed.");
console.log(`✅ Corrections applied: ${appliedCorrections.filter((c) => c.applied).length}/${correctionItems.length}`);
console.log(`✅ Mutated files: ${mutatedFiles.length}`);
console.log(`✅ Fresh backups created: ${backups.length}`);
console.log("✅ No CSS/JS mutation, reference change, visual/image generation, backend activation or publishing performed.");
console.log("✅ AG09D handoff created with explicit approval required.");
