import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const inputs = {
  ag08zReview: "data/content-intelligence/quality-reviews/ag08z-repeatable-article-upgrade-cycle-closure.json",
  ag08zClosure: "data/content-intelligence/closure-records/ag08z-repeatable-article-upgrade-cycle-closure.json",
  ag08zReadiness: "data/content-intelligence/quality-registry/ag08z-final-readiness-record.json",
  ag08kApply: "data/content-intelligence/apply-records/ag08k-controlled-visual-image-insertion-apply.json",
  ag08lAudit: "data/content-intelligence/audit-records/ag08l-post-visual-insertion-audit-report.json"
};

const reviewPath = path.join(root, "data/content-intelligence/quality-reviews/ag09a-live-readiness-public-experience-audit.json");
const auditPath = path.join(root, "data/content-intelligence/audit-records/ag09a-live-readiness-public-experience-audit-report.json");
const gapPath = path.join(root, "data/content-intelligence/quality-registry/ag09a-public-experience-gap-register.json");
const readinessPath = path.join(root, "data/content-intelligence/quality-registry/ag09a-public-experience-readiness.json");
const schemaPath = path.join(root, "data/content-intelligence/schema/live-readiness-public-experience-audit.schema.json");
const learningPath = path.join(root, "data/content-intelligence/learning/ag09a-live-readiness-public-experience-audit-learning.json");
const registryPath = path.join(root, "data/quality/ag09a-live-readiness-public-experience-audit.json");
const previewPath = path.join(root, "data/quality/ag09a-live-readiness-public-experience-audit-preview.json");
const docPath = path.join(root, "docs/quality/AG09A_LIVE_READINESS_PUBLIC_EXPERIENCE_AUDIT.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readTextIfExists(relativePath) {
  const abs = path.join(root, relativePath);
  return fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : "";
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

function count(text, needle) {
  return String(text || "").split(needle).length - 1;
}

function extractTitle(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return (h1?.[1] || title?.[1] || "").replace(/<[^>]+>/g, "").trim();
}

function hasMeta(html, nameOrProperty) {
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${nameOrProperty}["'][^>]+content=["'][^"']+["'][^>]*>`, "i");
  return pattern.test(html);
}

function listCandidateListingFiles() {
  return [
    "index.html",
    "articles.html",
    "featured-reads.html",
    "featured.html",
    "reads.html",
    "public/index.html",
    "dist/index.html"
  ].filter(exists);
}

for (const [name, relativePath] of Object.entries(inputs)) {
  if (!exists(relativePath)) throw new Error(`Missing required AG09A input ${name}: ${relativePath}`);
}

const ag08zReview = readJson(inputs.ag08zReview);
const ag08zClosure = readJson(inputs.ag08zClosure);
const ag08zReadiness = readJson(inputs.ag08zReadiness);
const ag08kApply = readJson(inputs.ag08kApply);
const ag08lAudit = readJson(inputs.ag08lAudit);

if (ag08zReview.status !== "repeatable_article_upgrade_cycle_closed") {
  throw new Error("AG09A requires AG08Z closure to be complete.");
}

if (ag08zReadiness.status !== "repeatable_cycle_closed_one_article_text_reference_visual_audited") {
  throw new Error("AG09A requires AG08Z final readiness to be closed.");
}

const articlePath = ag08kApply.selected_article_path;
const assetPath = ag08kApply.asset_path;
if (!exists(articlePath)) throw new Error(`AG09A article missing: ${articlePath}`);
if (!exists(assetPath)) throw new Error(`AG09A asset missing: ${assetPath}`);

const articleHtml = readTextIfExists(articlePath);
const articleHash = sha256(articleHtml);
if (articleHash !== ag08kApply.post_insertion_hash) {
  throw new Error("AG09A selected article hash must match AG08K post-insertion hash.");
}

const articleTitle = extractTitle(articleHtml);
const listingFiles = listCandidateListingFiles();
const listingEvidence = listingFiles.map((file) => {
  const html = readTextIfExists(file);
  return {
    file,
    contains_article_path: html.includes(articlePath),
    contains_article_slug: html.includes(path.basename(articlePath)),
    contains_article_title: articleTitle ? html.includes(articleTitle) : false
  };
});

const linkedFromAnyListing = listingEvidence.some((item) =>
  item.contains_article_path || item.contains_article_slug || item.contains_article_title
);

const relativeAssetSrc = ag08kApply.asset_src_inserted;
const visualBlockPresent =
  articleHtml.includes("AG08K-HERO-VISUAL-INSERTION") &&
  articleHtml.includes(relativeAssetSrc) &&
  articleHtml.includes(ag08kApply.inserted_alt_text) &&
  articleHtml.includes(ag08kApply.inserted_caption) &&
  articleHtml.includes(ag08kApply.inserted_credit);

const noMutationControls = {
  audit_only: true,
  local_static_audit_only: true,
  live_url_fetch_performed_in_ag09a: false,
  article_mutation_performed_in_ag09a: false,
  selected_article_file_write_performed_in_ag09a: false,
  homepage_mutation_performed_in_ag09a: false,
  css_mutation_performed_in_ag09a: false,
  js_mutation_performed_in_ag09a: false,
  reference_insertion_performed_in_ag09a: false,
  reference_url_change_performed_in_ag09a: false,
  visual_generation_performed_in_ag09a: false,
  image_asset_creation_performed_in_ag09a: false,
  image_insertion_performed_in_ag09a: false,
  production_jsonl_append_performed_in_ag09a: false,
  database_write_performed_in_ag09a: false,
  supabase_write_performed_in_ag09a: false,
  backend_auth_supabase_activation_performed_in_ag09a: false,
  public_publishing_performed_in_ag09a: false,
  publishing_approval_performed_in_ag09a: false
};

const checks = [
  {
    check_id: "AG09A-CHECK-001",
    area: "article_file",
    name: "selected_article_exists_and_hash_matches_ag08k",
    status: articleHash === ag08kApply.post_insertion_hash ? "passed" : "failed",
    evidence: { article_path: articlePath, article_hash: articleHash }
  },
  {
    check_id: "AG09A-CHECK-002",
    area: "visual_rendering",
    name: "hero_visual_block_asset_alt_caption_credit_present",
    status: visualBlockPresent ? "passed" : "failed",
    evidence: {
      marker_count: count(articleHtml, "AG08K-HERO-VISUAL-INSERTION"),
      asset_src: relativeAssetSrc,
      asset_file_exists: exists(assetPath),
      alt_present: articleHtml.includes(ag08kApply.inserted_alt_text),
      caption_present: articleHtml.includes(ag08kApply.inserted_caption),
      credit_present: articleHtml.includes(ag08kApply.inserted_credit)
    }
  },
  {
    check_id: "AG09A-CHECK-003",
    area: "reference_display",
    name: "reference_governance_markers_visible_or_preserved",
    status:
      articleHtml.includes("AG08G-APPROVED-REFERENCES") &&
      articleHtml.includes("AG08G-LEGACY-GOVERNANCE-PRESERVED")
        ? "passed"
        : "review_required",
    evidence: {
      ag08g_approved_references_marker: articleHtml.includes("AG08G-APPROVED-REFERENCES"),
      ag08g_legacy_marker: articleHtml.includes("AG08G-LEGACY-GOVERNANCE-PRESERVED"),
      ag03_or_ag05_marker_present: /AG03C-B2|AG05D|data-drishvara-ag03c-b2-reference-block|data-drishvara-ag05d-visible-reference-block/i.test(articleHtml)
    }
  },
  {
    check_id: "AG09A-CHECK-004",
    area: "metadata",
    name: "basic_seo_metadata_present",
    status:
      Boolean(articleTitle) &&
      hasMeta(articleHtml, "description")
        ? "passed"
        : "review_required",
    evidence: {
      title: articleTitle,
      has_title: Boolean(articleTitle),
      has_meta_description: hasMeta(articleHtml, "description"),
      has_canonical: /<link[^>]+rel=["']canonical["']/i.test(articleHtml)
    }
  },
  {
    check_id: "AG09A-CHECK-005",
    area: "social_preview",
    name: "open_graph_or_social_preview_metadata_present",
    status:
      hasMeta(articleHtml, "og:title") &&
      hasMeta(articleHtml, "og:description")
        ? "passed"
        : "review_required",
    evidence: {
      has_og_title: hasMeta(articleHtml, "og:title"),
      has_og_description: hasMeta(articleHtml, "og:description"),
      has_og_image: hasMeta(articleHtml, "og:image"),
      has_twitter_card: hasMeta(articleHtml, "twitter:card")
    }
  },
  {
    check_id: "AG09A-CHECK-006",
    area: "homepage_listing",
    name: "upgraded_article_discoverability_from_static_listing",
    status: linkedFromAnyListing ? "passed" : "review_required",
    evidence: {
      listing_files_checked: listingEvidence,
      linked_from_any_listing: linkedFromAnyListing
    }
  },
  {
    check_id: "AG09A-CHECK-007",
    area: "layout_mobile",
    name: "static_layout_safety_signals",
    status:
      articleHtml.includes('width="1600"') &&
      articleHtml.includes('height="900"') &&
      articleHtml.includes("<figcaption>")
        ? "passed"
        : "review_required",
    evidence: {
      width_height_declared: articleHtml.includes('width="1600"') && articleHtml.includes('height="900"'),
      figcaption_present: articleHtml.includes("<figcaption>"),
      no_inline_table_graph_inserted_by_ag08k: ag08lAudit.layout_integrity?.no_table_graph_or_wrapped_object_inserted_in_ag08k === true
    }
  }
];

const gaps = checks
  .filter((check) => check.status !== "passed")
  .map((check) => ({
    gap_id: check.check_id.replace("CHECK", "GAP"),
    area: check.area,
    name: check.name,
    severity:
      check.area === "homepage_listing" || check.area === "social_preview" || check.area === "metadata"
        ? "medium"
        : "high",
    status: "open_for_ag09b_correction_plan",
    evidence: check.evidence
  }));

const criticalFailures = checks.filter((check) => check.status === "failed");
const auditStatus = criticalFailures.length === 0
  ? "live_readiness_audit_completed"
  : "live_readiness_audit_failed";

const readinessStatus = gaps.length === 0
  ? "public_experience_ready_for_editorial_publish_consideration_not_approved"
  : "public_experience_audited_with_correction_gaps";

const auditReport = {
  module_id: "AG09A",
  title: "Live Readiness and Public Experience Audit Report",
  status: auditStatus,
  selected_article_path: articlePath,
  article_hash: articleHash,
  article_title: articleTitle,
  generated_from: inputs,
  audit_scope: {
    local_static_audit_only: true,
    live_url_fetch_performed: false,
    public_deployment_verified: false,
    note: "AG09A audits local static public-experience readiness. It does not perform live URL/network fetch."
  },
  checks,
  gaps,
  correction_required: gaps.length > 0,
  public_experience_readiness: readinessStatus,
  publish_readiness: "blocked_pending_ag09b_correction_plan_or_editorial_approval",
  ...noMutationControls
};

const gapRegister = {
  module_id: "AG09A",
  title: "Public Experience Gap Register",
  status: gaps.length > 0 ? "gaps_recorded_for_ag09b" : "no_gaps_recorded",
  selected_article_path: articlePath,
  gap_count: gaps.length,
  gaps,
  ag09b_handoff: {
    next_stage_id: "AG09B",
    next_stage_title: "Public Experience Correction Plan",
    explicit_approval_required: true,
    allowed_scope: "Plan corrections for metadata, listing/card linkage, social preview, visual display, references and public-readiness gates.",
    blocked_scope: "No article mutation, homepage mutation, CSS/JS mutation, publishing or backend activation unless a later apply stage is explicitly approved."
  },
  ...noMutationControls
};

const readiness = {
  module_id: "AG09A",
  title: "Public Experience Readiness",
  status: readinessStatus,
  selected_article_path: articlePath,
  passed_checks: checks.filter((check) => check.status === "passed").length,
  review_required_checks: checks.filter((check) => check.status === "review_required").length,
  failed_checks: checks.filter((check) => check.status === "failed").length,
  correction_required: gaps.length > 0,
  publish_ready: false,
  publish_readiness: "blocked_pending_ag09b_correction_plan_or_editorial_approval",
  backend_activation_ready: false,
  database_activation_ready: false,
  supabase_activation_ready: false,
  ...noMutationControls
};

const schema = {
  module_id: "AG09A",
  title: "Live Readiness and Public Experience Audit Schema",
  status: "schema_audit_only",
  local_static_audit_allowed_in_ag09a: true,
  article_rendering_check_allowed_in_ag09a: true,
  visual_path_credit_alt_caption_check_allowed_in_ag09a: true,
  reference_display_check_allowed_in_ag09a: true,
  seo_social_metadata_check_allowed_in_ag09a: true,
  homepage_listing_check_allowed_in_ag09a: true,
  layout_mobile_signal_check_allowed_in_ag09a: true,
  live_url_fetch_allowed_in_ag09a: false,
  article_mutation_allowed_in_ag09a: false,
  homepage_mutation_allowed_in_ag09a: false,
  css_js_mutation_allowed_in_ag09a: false,
  publishing_allowed_in_ag09a: false,
  backend_auth_supabase_activation_allowed_in_ag09a: false,
  ...noMutationControls
};

const summary = {
  selected_article_path: articlePath,
  article_hash: articleHash,
  audit_status: auditStatus,
  correction_required: gaps.length > 0,
  gap_count: gaps.length,
  public_experience_readiness: readinessStatus,
  publish_readiness: readiness.publish_readiness,
  next_stage_id: "AG09B",
  next_stage_title: "Public Experience Correction Plan",
  next_stage_requires_explicit_approval: true,
  ...noMutationControls
};

const review = {
  module_id: "AG09A",
  title: "Live Readiness and Public Experience Audit",
  status: auditStatus,
  depends_on: ["AG08Z", "AG08L", "AG08K"],
  generated_from: inputs,
  summary,
  audit_report_file: "data/content-intelligence/audit-records/ag09a-live-readiness-public-experience-audit-report.json",
  gap_register_file: "data/content-intelligence/quality-registry/ag09a-public-experience-gap-register.json",
  readiness_file: "data/content-intelligence/quality-registry/ag09a-public-experience-readiness.json",
  schema_file: "data/content-intelligence/schema/live-readiness-public-experience-audit.schema.json",
  learning_file: "data/content-intelligence/learning/ag09a-live-readiness-public-experience-audit-learning.json",
  closure_decision: {
    decision: "ag09a_audit_completed_pending_ag09b_if_gaps_or_editorial_review",
    proceed_to_ag09b_only_with_explicit_user_approval: true,
    publish_approval_granted: false,
    ...noMutationControls
  },
  ...noMutationControls
};

const learning = {
  module_id: "AG09A",
  title: "Live Readiness and Public Experience Audit Learning",
  status: "learning_record_only",
  summary,
  learning_points: [
    "AG09A is not a second article pipeline; it is a public-experience readiness gate.",
    "The article pipeline can work while listing, SEO, social-preview or card-readiness still require review.",
    "Live/public readiness should remain separate from article mutation stages.",
    "Local static readiness can identify correction needs before any network/live deployment verification.",
    "Publishing approval must remain separate from GitHub/Vercel static file changes."
  ],
  ...noMutationControls
};

const registry = {
  module_id: "AG09A",
  title: "Live Readiness and Public Experience Audit",
  status: auditStatus,
  generated_artifacts: {
    review: "data/content-intelligence/quality-reviews/ag09a-live-readiness-public-experience-audit.json",
    audit_report: "data/content-intelligence/audit-records/ag09a-live-readiness-public-experience-audit-report.json",
    gap_register: "data/content-intelligence/quality-registry/ag09a-public-experience-gap-register.json",
    readiness: "data/content-intelligence/quality-registry/ag09a-public-experience-readiness.json",
    schema: "data/content-intelligence/schema/live-readiness-public-experience-audit.schema.json",
    learning: "data/content-intelligence/learning/ag09a-live-readiness-public-experience-audit-learning.json",
    preview: "data/quality/ag09a-live-readiness-public-experience-audit-preview.json",
    document: "docs/quality/AG09A_LIVE_READINESS_PUBLIC_EXPERIENCE_AUDIT.md"
  },
  summary,
  ...noMutationControls
};

const preview = {
  module_id: "AG09A",
  preview_only: true,
  status: auditStatus,
  summary,
  checks,
  gaps,
  ag09b_handoff: gapRegister.ag09b_handoff,
  ...noMutationControls
};

const doc = `# AG09A — Live Readiness and Public Experience Audit

## Purpose

AG09A audits whether the AG08-upgraded article is locally ready for public user experience review.

AG09A is not another article-upgrade pipeline. It is a public-readiness gate after AG08Z closure.

## Scope

AG09A checks local/static evidence for:

- article file and hash continuity
- hero visual path, alt text, caption and credit
- reference/governance preservation
- SEO metadata
- social preview metadata
- homepage/listing discoverability
- static layout/mobile safety signals

## Result

- Status: \`${auditStatus}\`
- Correction required: \`${gaps.length > 0}\`
- Gap count: \`${gaps.length}\`
- Publish readiness: \`${readiness.publish_readiness}\`

## Boundary

AG09A performs no article mutation, homepage mutation, CSS/JS mutation, reference insertion, visual generation, image insertion, JSONL append, database/Supabase write, backend/Auth/Supabase activation or publishing approval.

## Next Stage

AG09B — Public Experience Correction Plan — only with explicit approval.
`;

writeJson(reviewPath, review);
writeJson(auditPath, auditReport);
writeJson(gapPath, gapRegister);
writeJson(readinessPath, readiness);
writeJson(schemaPath, schema);
writeJson(learningPath, learning);
writeJson(registryPath, registry);
writeJson(previewPath, preview);
writeText(docPath, doc);

const articleHashAfter = sha256(readTextIfExists(articlePath));
if (articleHashAfter !== articleHash) {
  throw new Error("AG09A attempted to mutate selected article. Refusing to continue.");
}

console.log("✅ AG09A live readiness and public experience audit artifacts generated.");
console.log(`✅ Audit target: ${articlePath}`);
console.log(`✅ Audit status: ${auditStatus}`);
console.log(`✅ Public-experience gaps recorded: ${gaps.length}`);
console.log("✅ No article/homepage/CSS/JS mutation, backend activation or publishing performed.");
console.log("✅ AG09B handoff created with explicit approval required.");
