import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function readJson(file) {
  return JSON.parse(read(file));
}

function check(condition, label, failures) {
  if (condition) {
    console.log(`✅ ${label}`);
  } else {
    console.log(`❌ ${label}`);
    failures.push(label);
  }
}

function text(record, keys) {
  for (const key of keys) {
    const value = record?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function nestedText(record, parentKeys, childKeys) {
  for (const parent of parentKeys) {
    const obj = record?.[parent];
    if (obj && typeof obj === "object") {
      const value = text(obj, childKeys);
      if (value) return value;
    }
  }
  return "";
}

function titleOf(item) {
  return text(item, ["title", "title_en", "headline", "name"]);
}

function summaryOf(item) {
  return text(item, ["summary", "summary_en", "description", "excerpt"]);
}

function categoryOf(item) {
  return text(item, ["tag", "category", "section", "topic", "source"]);
}

function pathOf(item) {
  return text(item, ["path", "sourcePath", "source_path", "directUrl", "direct_url", "url"]);
}

function imageOf(item) {
  return (
    text(item, ["image", "image_url", "imageUrl", "featuredImage", "coverImage", "thumbnail"]) ||
    nestedText(item, ["image", "featured_image", "cover_image"], ["url", "src"])
  );
}

function hasHindiMeta(item) {
  return Boolean(
    text(item, ["title_hi", "headline_hi"]) &&
    text(item, ["summary_hi", "description_hi", "excerpt_hi"])
  );
}

function articleUrlOf(item) {
  const url = text(item, ["url", "canonical_url", "canonicalUrl"]);
  if (url) return url;

  const p = pathOf(item);
  if (p) return `article.html?path=${encodeURIComponent(p)}`;

  return "";
}

function isBadUrl(url) {
  if (!url) return true;
  const s = String(url).trim().toLowerCase();
  return s === "#" || s === "#open-day-card" || s.startsWith("javascript:");
}

function isPipelineOnly(item) {
  const category = categoryOf(item).toLowerCase();
  return [
    "daily context",
    "sports context",
    "hindi drafts",
    "generated",
    "pipeline",
    "scaffold",
    "internal",
    "placeholder"
  ].some((token) => category.includes(token));
}

const failures = [];

console.log("Drishvara article quality metadata/review scaffold preflight");
console.log("");

const files = {
  plan: "docs/content/article-quality-metadata-review-plan.md",
  schema: "data/content/editorial/article-quality-metadata-schema.json",
  queue: "data/content/editorial/article-quality-review-queue.json",
  quality: "data/content/quality/article-quality-metadata-review.json",
  c01: "data/content/quality/public-read-link-image-integrity.json",
  c02: "data/content/quality/editorial-selection-featured-read-governance.json",
  c03: "data/content/quality/featured-read-override-selection-memory.json",
  c04: "data/content/quality/featured-read-scoring-rotation-preview.json",
  c05: "data/content/quality/image-registry-source-governance.json",
  c06: "data/content/quality/article-url-slug-sitemap-governance.json",
  articleIndex: "data/article-index.json",
  homepageUi: "data/homepage-ui.json",
  seoMetadata: "data/seo/site-metadata.json",
  indexHtml: "index.html",
  insightsHtml: "insights.html",
  articleHtml: "article.html"
};

Object.values(files).forEach((file) => check(exists(file), `${file} exists`, failures));

const plan = read(files.plan);
const schema = readJson(files.schema);
const queue = readJson(files.queue);
const quality = readJson(files.quality);
const c01 = readJson(files.c01);
const c02 = readJson(files.c02);
const c03 = readJson(files.c03);
const c04 = readJson(files.c04);
const c05 = readJson(files.c05);
const c06 = readJson(files.c06);
const articleIndex = readJson(files.articleIndex);
const homepageUi = readJson(files.homepageUi);
const seoMetadata = readJson(files.seoMetadata);
const indexHtml = read(files.indexHtml);
const insightsHtml = read(files.insightsHtml);
const articleHtml = read(files.articleHtml);

const publicLatest = Array.isArray(articleIndex.publicLatest) ? articleIndex.publicLatest : [];
const publishedItems = Array.isArray(articleIndex.publishedItems) ? articleIndex.publishedItems : [];
const featuredReads = Array.isArray(homepageUi.featuredReads) ? homepageUi.featuredReads : [];

check(quality.status === "preflight_only", "C07 quality registry is preflight-only", failures);
check(quality.metadata_write_enabled === false, "C07 keeps metadata write disabled", failures);
check(quality.review_queue_write_enabled === false, "C07 keeps review queue write disabled", failures);
check(quality.admin_review_enabled === false, "C07 keeps admin review disabled", failures);
check(quality.article_content_mutation_enabled === false, "C07 blocks article content mutation", failures);
check(quality.homepage_mutation_enabled === false, "C07 blocks homepage mutation", failures);
check(quality.external_api_fetch_enabled === false, "C07 blocks external API fetch", failures);

check(quality.blocked_in_this_stage.includes("metadata_write"), "C07 blocks metadata write", failures);
check(quality.blocked_in_this_stage.includes("review_queue_write"), "C07 blocks review queue write", failures);
check(quality.blocked_in_this_stage.includes("admin_review_activation"), "C07 blocks admin review activation", failures);
check(quality.blocked_in_this_stage.includes("article_publication_mutation"), "C07 blocks article publication mutation", failures);
check(quality.blocked_in_this_stage.includes("external_api_fetch"), "C07 blocks external API fetch explicitly", failures);

check(schema.status === "scaffold_only", "Article quality metadata schema is scaffold-only", failures);
check(schema.enabled === false, "Article quality metadata schema is not live", failures);
check(schema.metadata_write_enabled === false, "Metadata write remains disabled in schema", failures);
check(schema.article_mutation_enabled === false, "Article mutation remains disabled in schema", failures);
check(schema.homepage_mutation_enabled === false, "Homepage mutation remains disabled in schema", failures);

check(schema.required_future_fields.includes("article_path"), "Schema requires future article_path", failures);
check(schema.required_future_fields.includes("review_status"), "Schema requires future review_status", failures);
check(schema.required_future_fields.includes("language_readiness"), "Schema requires future language_readiness", failures);
check(schema.required_future_fields.includes("image_approval_status"), "Schema requires future image approval status", failures);
check(schema.required_future_fields.includes("source_reference_status"), "Schema requires future source/reference status", failures);
check(schema.required_future_fields.includes("evergreen_or_current"), "Schema requires future evergreen/current flag", failures);
check(schema.required_future_fields.includes("quality_score"), "Schema requires future quality score", failures);

check(schema.review_status_values.includes("under_review"), "Schema includes under_review status", failures);
check(schema.review_status_values.includes("approved_public"), "Schema includes approved_public status", failures);
check(schema.review_status_values.includes("published"), "Schema includes published status", failures);
check(schema.language_readiness_values.includes("hindi_metadata_ready"), "Schema includes Hindi metadata readiness", failures);
check(schema.language_readiness_values.includes("hindi_body_ready"), "Schema includes Hindi body readiness", failures);
check(schema.language_readiness_values.includes("bilingual_ready"), "Schema includes bilingual readiness", failures);
check(schema.source_reference_status_values.includes("source_verified"), "Schema includes source_verified", failures);

check(queue.status === "scaffold_only", "Article quality review queue is scaffold-only", failures);
check(queue.enabled === false, "Article quality review queue is disabled", failures);
check(queue.queue_write_enabled === false, "Review queue write remains disabled", failures);
check(queue.admin_review_enabled === false, "Admin review remains disabled in queue", failures);
check(Array.isArray(queue.items), "Review queue has items array", failures);
check(queue.items.length === 0, "Review queue has no live items", failures);
check(queue.required_future_fields.includes("article_path"), "Review queue requires future article_path", failures);
check(queue.required_future_fields.includes("decision"), "Review queue requires future decision", failures);

check(c01.status === "preflight_only", "C01 remains preflight-only", failures);
check(c02.status === "preflight_only", "C02 remains preflight-only", failures);
check(c03.status === "preflight_only", "C03 remains preflight-only", failures);
check(c04.status === "preflight_only", "C04 remains preflight-only", failures);
check(c05.status === "preflight_only", "C05 remains preflight-only", failures);
check(c06.status === "preflight_only", "C06 remains preflight-only", failures);

check(plan.includes("does not mutate article content"), "Plan blocks article mutation", failures);
check(plan.includes("does not publish new articles"), "Plan blocks publishing", failures);
check(plan.includes("Review Status Model"), "Plan defines review status model", failures);
check(plan.includes("Language Readiness Model"), "Plan defines language readiness model", failures);
check(plan.includes("Source/Reference Status Model"), "Plan defines source/reference model", failures);

check(Array.isArray(articleIndex.items), "Article index has items array", failures);
check(publishedItems.length > 0, "Article index has publishedItems", failures);
check(publicLatest.length >= 4, "Article index has publicLatest sample", failures);
check(featuredReads.length >= 4, "Homepage has featured reads", failures);

check(indexHtml.includes("featuredReads"), "Homepage still uses featuredReads", failures);
check(indexHtml.includes("articleUrl("), "Homepage still uses articleUrl helper", failures);
check(insightsHtml.includes("article-index.json"), "Insights still consumes article index", failures);
check(articleHtml.includes("article_html_hi"), "Article reader still supports Hindi body", failures);
check(articleHtml.includes("DrishvaraSEO") || articleHtml.includes("canonical"), "Article reader still supports SEO markers", failures);

let latestTitleCount = 0;
let latestSummaryCount = 0;
let latestPathCount = 0;
let latestCategoryCount = 0;
let latestImageCount = 0;
let latestHindiCount = 0;
let latestPipelineCount = 0;

for (const item of publicLatest.slice(0, 8)) {
  if (titleOf(item)) latestTitleCount += 1;
  if (summaryOf(item)) latestSummaryCount += 1;
  if (pathOf(item)) latestPathCount += 1;
  if (categoryOf(item)) latestCategoryCount += 1;
  if (imageOf(item)) latestImageCount += 1;
  if (hasHindiMeta(item)) latestHindiCount += 1;
  if (isPipelineOnly(item)) latestPipelineCount += 1;
}

check(latestTitleCount >= 4, "Public latest sample has titles", failures);
check(latestSummaryCount >= 4, "Public latest sample has summaries", failures);
check(latestPathCount >= 4, "Public latest sample has paths/URLs", failures);
check(latestCategoryCount >= 4, "Public latest sample has categories/source labels", failures);
check(latestImageCount >= 4, "Public latest sample has images", failures);
check(latestHindiCount >= 4, "Public latest sample has Hindi metadata", failures);
check(latestPipelineCount === 0, "Public latest sample excludes pipeline-only records", failures);

let featuredSafeUrls = 0;
let featuredHindiCount = 0;

for (const [index, item] of featuredReads.entries()) {
  const url = articleUrlOf(item);
  if (!isBadUrl(url)) featuredSafeUrls += 1;
  if (hasHindiMeta(item)) featuredHindiCount += 1;

  check(titleOf(item), `Featured read ${index + 1} has title`, failures);
  check(summaryOf(item), `Featured read ${index + 1} has summary`, failures);
  check(imageOf(item), `Featured read ${index + 1} has image`, failures);
  check(!isBadUrl(url), `Featured read ${index + 1} has safe URL`, failures);
  check(!isPipelineOnly(item), `Featured read ${index + 1} is not pipeline-only`, failures);
}

check(featuredSafeUrls >= 4, "Featured reads have safe URLs", failures);
check(featuredHindiCount >= 4, "Featured reads have Hindi metadata", failures);

const seoPublicArticleCount = Number(
  seoMetadata.public_article_count ||
  seoMetadata.publicArticles ||
  seoMetadata.public_articles ||
  articleIndex.publicTotal ||
  articleIndex.public_total ||
  publishedItems.length ||
  0
);

check(seoPublicArticleCount >= 4, "SEO/article index records public article count", failures);

for (const file of [
  "assets/js/site-language.js",
  "assets/js/seo-runtime.js",
  "assets/js/sports-context.js",
  "assets/js/submission-client.js",
  "assets/js/auth-client.js",
  "assets/js/session-guard.js"
]) {
  if (!exists(file)) continue;
  const js = read(file);
  check(!js.includes("SERVICE_ROLE"), `${file} does not expose SERVICE_ROLE`, failures);
  check(!js.includes("SUPABASE_SERVICE"), `${file} does not expose SUPABASE_SERVICE`, failures);
  check(!js.includes("SUPABASE_SECRET"), `${file} does not expose SUPABASE_SECRET`, failures);
}

console.log("");
console.log("Article quality metadata/review summary:");
console.log(`- Published items: ${publishedItems.length}`);
console.log(`- Public latest checked: ${Math.min(publicLatest.length, 8)}`);
console.log(`- Public latest Hindi-ready: ${latestHindiCount}`);
console.log(`- Featured reads: ${featuredReads.length}`);
console.log(`- Featured Hindi-ready: ${featuredHindiCount}`);
console.log(`- Review queue enabled: ${queue.enabled}`);
console.log(`- Review queue items: ${queue.items.length}`);
console.log(`- Metadata write enabled: ${schema.metadata_write_enabled}`);
console.log(`- SEO/article-index public article count: ${seoPublicArticleCount}`);
console.log("- Article mutation: blocked");
console.log("- Admin review: disabled");

if (failures.length) {
  console.log("");
  console.log("Article quality metadata/review scaffold preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Article quality metadata/review scaffold preflight passed.");
