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

function imageOf(item) {
  return (
    text(item, ["image", "image_url", "imageUrl", "featuredImage", "coverImage", "thumbnail"]) ||
    nestedText(item, ["image", "featured_image", "cover_image"], ["url", "src"])
  );
}

function pathOf(item) {
  return text(item, ["path", "sourcePath", "source_path", "directUrl", "direct_url", "url"]);
}

function articleUrlOf(item) {
  const url = text(item, ["url"]);
  if (url) return url;

  const p = text(item, ["path", "sourcePath", "source_path", "directUrl", "direct_url"]);
  if (p) return `article.html?path=${encodeURIComponent(p)}`;

  return "";
}

function categoryOf(item) {
  return text(item, ["tag", "category", "section", "topic", "source"]).toLowerCase();
}

function hasHindiMeta(item) {
  return Boolean(
    text(item, ["title_hi", "headline_hi"]) &&
    text(item, ["summary_hi", "description_hi", "excerpt_hi"])
  );
}

function isBadUrl(url) {
  if (!url) return true;
  const s = String(url).trim().toLowerCase();
  return s === "#" || s === "#open-day-card" || s.startsWith("javascript:");
}

function isBlockedTag(item, blockedTags) {
  const category = categoryOf(item);
  return blockedTags.some((tag) => category.includes(tag));
}

const failures = [];

console.log("Drishvara editorial selection/featured read governance preflight");
console.log("");

const files = {
  plan: "docs/content/editorial-selection-featured-read-governance-plan.md",
  rules: "data/content/quality/editorial-selection-featured-read-governance.json",
  c01: "data/content/quality/public-read-link-image-integrity.json",
  c01Script: "scripts/public-read-integrity-preflight.js",
  articleIndex: "data/article-index.json",
  homepageUi: "data/homepage-ui.json",
  indexHtml: "index.html",
  insightsHtml: "insights.html",
  articleHtml: "article.html",
  sitemap: "sitemap.xml"
};

Object.values(files).forEach((file) => check(exists(file), `${file} exists`, failures));

const plan = read(files.plan);
const rules = readJson(files.rules);
const c01 = readJson(files.c01);
const articleIndex = readJson(files.articleIndex);
const homepageUi = readJson(files.homepageUi);
const indexHtml = read(files.indexHtml);
const articleHtml = read(files.articleHtml);
const sitemap = read(files.sitemap);

const featuredReads = Array.isArray(homepageUi.featuredReads) ? homepageUi.featuredReads : [];
const publicLatest = Array.isArray(articleIndex.publicLatest) ? articleIndex.publicLatest : [];
const publishedItems = Array.isArray(articleIndex.publishedItems) ? articleIndex.publishedItems : [];

check(rules.status === "preflight_only", "C02 governance registry is preflight-only", failures);
check(rules.manual_override?.enabled === false, "Manual override remains disabled", failures);
check(rules.require_unique_featured_links === true, "Rules require unique featured links", failures);
check(rules.prefer_unique_featured_images === true, "Rules prefer unique featured images", failures);
check(Array.isArray(rules.blocked_featured_tags), "Rules define blocked featured tags", failures);
check(rules.blocked_featured_tags.includes("daily context"), "Rules block Daily Context as featured article category", failures);
check(rules.blocked_featured_tags.includes("sports context"), "Rules block Sports Context as featured article category", failures);
check(rules.blocked_in_this_stage.includes("external_api_fetch"), "C02 blocks external API fetch", failures);
check(rules.blocked_in_this_stage.includes("manual_override_activation"), "C02 blocks manual override activation", failures);

check(c01.status === "preflight_only", "C01 integrity checker remains preflight-only", failures);
check(plan.includes("category diversity"), "Plan covers category diversity", failures);
check(plan.includes("duplicate featured images"), "Plan covers duplicate image prevention", failures);
check(plan.includes("Manual override is planned but not live"), "Plan keeps manual override not live", failures);

check(featuredReads.length >= Number(rules.minimum_homepage_featured_reads || 4), "Homepage has minimum featured reads", failures);
check(publicLatest.length >= 4, "Public latest has enough sample articles", failures);
check(publishedItems.length > 0, "Published public articles exist", failures);

const urls = [];
const images = [];
const categories = new Set();

let featuredWithTitle = 0;
let featuredWithSummary = 0;
let featuredWithImage = 0;
let featuredWithUrl = 0;
let featuredWithHindi = 0;
let blockedFeaturedCount = 0;

for (const [index, item] of featuredReads.entries()) {
  const label = `Featured read ${index + 1}`;
  const title = titleOf(item);
  const summary = summaryOf(item);
  const image = imageOf(item);
  const url = articleUrlOf(item);
  const category = categoryOf(item);

  if (title) featuredWithTitle += 1;
  if (summary) featuredWithSummary += 1;
  if (image) featuredWithImage += 1;
  if (!isBadUrl(url)) featuredWithUrl += 1;
  if (hasHindiMeta(item)) featuredWithHindi += 1;
  if (category) categories.add(category);
  if (image) images.push(image);
  if (url) urls.push(url);
  if (isBlockedTag(item, rules.blocked_featured_tags)) blockedFeaturedCount += 1;

  check(Boolean(title), `${label} has title`, failures);
  check(Boolean(summary), `${label} has summary`, failures);
  check(Boolean(image), `${label} has image`, failures);
  check(!isBadUrl(url), `${label} has safe URL`, failures);
  check(!isBlockedTag(item, rules.blocked_featured_tags), `${label} is not pipeline-only/scaffold category`, failures);
}

const uniqueUrls = new Set(urls);
const uniqueImages = new Set(images);

check(featuredWithTitle >= 4, "At least four featured reads have titles", failures);
check(featuredWithSummary >= 4, "At least four featured reads have summaries", failures);
check(featuredWithImage >= 4, "At least four featured reads have images", failures);
check(featuredWithUrl >= 4, "At least four featured reads have URLs", failures);
check(uniqueUrls.size === urls.length, "Featured read URLs are unique", failures);
check(uniqueImages.size === images.length, "Featured read images are unique", failures);
check(blockedFeaturedCount === 0, "No blocked pipeline/scaffold categories in featured reads", failures);
check(categories.size >= Number(rules.minimum_category_diversity || 2), "Featured reads have minimum category diversity", failures);

let publicLatestHindi = 0;
let publicLatestPaths = 0;
let publicLatestImages = 0;

for (const item of publicLatest.slice(0, 8)) {
  if (hasHindiMeta(item)) publicLatestHindi += 1;
  if (pathOf(item)) publicLatestPaths += 1;
  if (imageOf(item)) publicLatestImages += 1;
}

check(publicLatestHindi >= 4, "Public latest sample has Hindi metadata", failures);
check(publicLatestPaths >= 4, "Public latest sample has article paths/URLs", failures);

check(indexHtml.includes("featuredReads"), "Homepage uses featuredReads", failures);
check(indexHtml.includes("articleUrl("), "Homepage has articleUrl link helper", failures);
check(!indexHtml.includes("#open-day-card"), "Homepage has no old open-day-card link", failures);
check(!indexHtml.includes("javascript:void"), "Homepage has no javascript:void links", failures);

check(articleHtml.includes("article_html_hi"), "Article reader still supports Hindi body", failures);
check(articleHtml.includes("image") || articleHtml.includes("Image"), "Article reader still supports images", failures);

const sitemapArticleReaderUrls = sitemap.split("article.html?path=").length - 1;
const sitemapCleanArticleUrls = sitemap.split("/articles/").length - 1;
const sitemapArticleUrls = sitemapArticleReaderUrls + sitemapCleanArticleUrls;
const seoPublicArticleCount = Number(
  articleIndex.publicTotal || articleIndex.public_total || publishedItems.length || 0
);

check(
  sitemapArticleUrls > 0 || seoPublicArticleCount > 0,
  "Sitemap or article index includes public article URLs",
  failures
);

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
console.log("Editorial selection governance summary:");
console.log(`- Featured reads: ${featuredReads.length}`);
console.log(`- Unique featured URLs: ${uniqueUrls.size}`);
console.log(`- Unique featured images: ${uniqueImages.size}`);
console.log(`- Featured categories: ${categories.size}`);
console.log(`- Featured Hindi metadata count: ${featuredWithHindi}`);
console.log(`- Public latest Hindi sample count: ${publicLatestHindi}`);
console.log(`- Public latest image sample count: ${publicLatestImages}`);
console.log(`- Sitemap/article-index public article count: ${sitemapArticleUrls || seoPublicArticleCount}`);
console.log("- Manual override: disabled");
console.log("- External API fetch: blocked");

if (failures.length) {
  console.log("");
  console.log("Editorial selection governance preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Editorial selection governance preflight passed.");
