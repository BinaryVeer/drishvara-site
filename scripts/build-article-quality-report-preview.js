import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + "\n", "utf8");
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

function readinessScore(item) {
  let score = 0;
  if (titleOf(item)) score += 15;
  if (summaryOf(item)) score += 15;
  if (pathOf(item)) score += 15;
  if (!isBadUrl(articleUrlOf(item))) score += 15;
  if (categoryOf(item)) score += 10;
  if (imageOf(item)) score += 15;
  if (hasHindiMeta(item)) score += 10;
  if (!isPipelineOnly(item)) score += 5;
  return score;
}

function checkItem(item, index, type) {
  const url = articleUrlOf(item);
  return {
    index: index + 1,
    type,
    title: titleOf(item),
    category: categoryOf(item),
    path: pathOf(item),
    has_title: Boolean(titleOf(item)),
    has_summary: Boolean(summaryOf(item)),
    has_path_or_url: Boolean(pathOf(item)),
    has_safe_url: !isBadUrl(url),
    has_category: Boolean(categoryOf(item)),
    has_image: Boolean(imageOf(item)),
    has_hindi_metadata: hasHindiMeta(item),
    is_pipeline_only: isPipelineOnly(item),
    readiness_score: readinessScore(item),
    review_suggestion:
      readinessScore(item) >= 90
        ? "ready_preview"
        : readinessScore(item) >= 70
          ? "minor_review"
          : "needs_editorial_review"
  };
}

const articleIndex = readJson("data/article-index.json");
const homepageUi = readJson("data/homepage-ui.json");
const seoMetadata = fs.existsSync(path.join(root, "data/seo/site-metadata.json"))
  ? readJson("data/seo/site-metadata.json")
  : {};

const publicLatest = Array.isArray(articleIndex.publicLatest) ? articleIndex.publicLatest : [];
const publishedItems = Array.isArray(articleIndex.publishedItems) ? articleIndex.publishedItems : [];
const featuredReads = Array.isArray(homepageUi.featuredReads) ? homepageUi.featuredReads : [];

const featuredChecks = featuredReads.map((item, index) => checkItem(item, index, "featured_read"));
const latestChecks = publicLatest.slice(0, 8).map((item, index) => checkItem(item, index, "public_latest"));

const allChecks = [...featuredChecks, ...latestChecks];

const summary = {
  published_items: publishedItems.length,
  public_latest_items: publicLatest.length,
  featured_reads: featuredReads.length,
  checked_items: allChecks.length,
  featured_ready_preview: featuredChecks.filter((item) => item.review_suggestion === "ready_preview").length,
  public_latest_ready_preview: latestChecks.filter((item) => item.review_suggestion === "ready_preview").length,
  items_with_title: allChecks.filter((item) => item.has_title).length,
  items_with_summary: allChecks.filter((item) => item.has_summary).length,
  items_with_path_or_url: allChecks.filter((item) => item.has_path_or_url).length,
  items_with_safe_url: allChecks.filter((item) => item.has_safe_url).length,
  items_with_category: allChecks.filter((item) => item.has_category).length,
  items_with_image: allChecks.filter((item) => item.has_image).length,
  items_with_hindi_metadata: allChecks.filter((item) => item.has_hindi_metadata).length,
  pipeline_only_items: allChecks.filter((item) => item.is_pipeline_only).length,
  seo_public_article_count:
    Number(
      seoMetadata.public_article_count ||
      seoMetadata.publicArticles ||
      seoMetadata.public_articles ||
      articleIndex.publicTotal ||
      articleIndex.public_total ||
      publishedItems.length ||
      0
    )
};

const report = {
  version: "2026.05.02-content-c08",
  module: "content.article_quality_report_preview",
  status: "generated",
  read_only: true,
  generated_by: "scripts/build-article-quality-report-preview.js",
  source_files: [
    "data/article-index.json",
    "data/homepage-ui.json",
    "data/seo/site-metadata.json"
  ],
  summary,
  featured_read_checks: featuredChecks,
  public_latest_checks: latestChecks,
  guardrails: {
    article_mutation_enabled: false,
    homepage_mutation_enabled: false,
    review_queue_write_enabled: false,
    external_api_fetch_enabled: false,
    live_supabase_read_enabled: false
  }
};

writeJson("data/content/reports/article-quality-report-preview.json", report);

console.log("Article quality report preview generated:");
console.log(`- Published items: ${summary.published_items}`);
console.log(`- Public latest items: ${summary.public_latest_items}`);
console.log(`- Featured reads: ${summary.featured_reads}`);
console.log(`- Checked items: ${summary.checked_items}`);
console.log(`- Ready preview items: ${summary.featured_ready_preview + summary.public_latest_ready_preview}`);
console.log("- Output: data/content/reports/article-quality-report-preview.json");
