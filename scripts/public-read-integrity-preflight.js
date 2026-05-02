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

function firstText(record, keys = []) {
  for (const key of keys) {
    const value = record?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function imageValue(item) {
  if (!item || typeof item !== "object") return "";
  return (
    firstText(item, ["image", "image_url", "imageUrl", "featuredImage", "coverImage", "thumbnail"]) ||
    firstText(item.image || {}, ["url", "src"]) ||
    firstText(item.featured_image || {}, ["url", "src"]) ||
    firstText(item.cover_image || {}, ["url", "src"])
  );
}

function titleValue(item) {
  return firstText(item, ["title", "title_en", "headline", "name"]);
}

function summaryValue(item) {
  return firstText(item, ["summary", "summary_en", "description", "excerpt"]);
}

function hindiTitleValue(item) {
  return firstText(item, ["title_hi", "headline_hi"]);
}

function hindiSummaryValue(item) {
  return firstText(item, ["summary_hi", "description_hi", "excerpt_hi"]);
}

function pathValue(item) {
  return firstText(item, ["path", "sourcePath", "source_path", "directUrl", "direct_url", "url"]);
}

function computedArticleUrl(item) {
  const explicitUrl = firstText(item, ["url"]);
  if (explicitUrl) return explicitUrl;

  const p = firstText(item, ["path", "sourcePath", "source_path", "directUrl", "direct_url"]);
  if (p) return `article.html?path=${encodeURIComponent(p)}`;

  return "";
}

function isBadLink(value) {
  if (!value) return true;
  const s = String(value).trim();
  return (
    s === "#" ||
    s === "#open-day-card" ||
    s.toLowerCase().startsWith("javascript:void") ||
    s.toLowerCase().startsWith("javascript:")
  );
}

function isPipelineOnlyTag(item) {
  const tag = firstText(item, ["tag", "category", "section", "source", "topic"]).toLowerCase();
  return [
    "daily context",
    "sports context",
    "hindi drafts",
    "generated",
    "pipeline",
    "scaffold"
  ].some((blocked) => tag.includes(blocked));
}

const failures = [];

console.log("Drishvara public read link/image integrity preflight");
console.log("");

const files = {
  articleIndex: "data/article-index.json",
  homepageUi: "data/homepage-ui.json",
  seoMetadata: "data/seo/site-metadata.json",
  index: "index.html",
  insights: "insights.html",
  article: "article.html",
  sitemap: "sitemap.xml",
  registry: "data/content/quality/public-read-link-image-integrity.json",
  plan: "docs/content/public-read-link-image-integrity-plan.md"
};

Object.values(files).forEach((file) => check(exists(file), `${file} exists`, failures));

const articleIndex = readJson(files.articleIndex);
const homepageUi = readJson(files.homepageUi);
const seoMetadata = exists(files.seoMetadata) ? readJson(files.seoMetadata) : {};
const indexHtml = read(files.index);
const insightsHtml = read(files.insights);
const articleHtml = read(files.article);
const sitemap = read(files.sitemap);
const registry = readJson(files.registry);
const plan = read(files.plan);

const publishedItems = Array.isArray(articleIndex.publishedItems) ? articleIndex.publishedItems : [];
const publicLatest = Array.isArray(articleIndex.publicLatest) ? articleIndex.publicLatest : [];
const featuredReads = Array.isArray(homepageUi.featuredReads) ? homepageUi.featuredReads : [];

check(registry.status === "preflight_only", "Integrity registry is preflight-only", failures);
check(registry.covers_earlier_main_work === true, "Registry covers earlier main content work", failures);
check(registry.covers_scaffold_safety_layer === true, "Registry covers scaffold safety layer", failures);
check(plan.includes("homepage featured reads"), "Plan covers homepage featured reads", failures);
check(plan.includes("featured image mapping"), "Plan covers image mapping", failures);
check(plan.includes("Read now links"), "Plan covers Read now links", failures);

check(Array.isArray(articleIndex.items), "Article index has items array", failures);
check(publishedItems.length > 0, "Article index has publishedItems", failures);
check(publicLatest.length >= 4, "Article index has at least four publicLatest items", failures);
check(featuredReads.length >= 4, "Homepage UI has at least four featuredReads", failures);

check(indexHtml.includes("loadArticleIndex"), "Homepage loads article index", failures);
check(indexHtml.includes("articleUrl(item)") || indexHtml.includes("articleUrl("), "Homepage uses articleUrl helper", failures);
check(!indexHtml.includes('href="#open-day-card"'), "Homepage does not use old open-day-card read link", failures);
check(!indexHtml.includes("javascript:void"), "Homepage does not use javascript:void links", failures);

check(insightsHtml.includes("article-index.json"), "Insights consumes article index", failures);
check(insightsHtml.includes("search") || insightsHtml.includes("Search"), "Insights retains search surface", failures);
check(insightsHtml.includes("filter") || insightsHtml.includes("Filter"), "Insights retains filter surface", failures);

check(articleHtml.includes("article_html_hi"), "Article reader supports Hindi body field", failures);
check(articleHtml.includes("hindi") || articleHtml.includes("Hindi") || articleHtml.includes("_hi"), "Article reader has Hindi support markers", failures);
check(articleHtml.includes("image") || articleHtml.includes("Image"), "Article reader has image handling markers", failures);
check(articleHtml.includes("DrishvaraSEO") || articleHtml.includes("seo"), "Article reader has SEO/runtime support", failures);

let featuredWithTitle = 0;
let featuredWithSummary = 0;
let featuredWithImage = 0;
let featuredWithUsableLink = 0;
let featuredPipelineOnly = 0;

for (const [idx, item] of featuredReads.entries()) {
  const label = `Featured read ${idx + 1}`;

  const title = titleValue(item);
  const summary = summaryValue(item);
  const img = imageValue(item);
  const url = computedArticleUrl(item);

  if (title) featuredWithTitle += 1;
  if (summary) featuredWithSummary += 1;
  if (img && !/placeholder/i.test(img)) featuredWithImage += 1;
  if (!isBadLink(url)) featuredWithUsableLink += 1;
  if (isPipelineOnlyTag(item)) featuredPipelineOnly += 1;

  check(Boolean(title), `${label} has title`, failures);
  check(Boolean(summary), `${label} has summary`, failures);
  check(Boolean(img), `${label} has featured image`, failures);
  check(!isBadLink(url), `${label} has usable read URL`, failures);
}

check(featuredWithTitle >= 4, "At least four featured reads have titles", failures);
check(featuredWithSummary >= 4, "At least four featured reads have summaries", failures);
check(featuredWithImage >= 4, "At least four featured reads have images", failures);
check(featuredWithUsableLink >= 4, "At least four featured reads have usable links", failures);
check(featuredPipelineOnly === 0, "Featured reads exclude pipeline-only/scaffold tags", failures);

let latestWithHindiTitle = 0;
let latestWithHindiSummary = 0;
let latestWithPath = 0;
let latestPublishedSafe = 0;

for (const item of publicLatest.slice(0, 8)) {
  if (hindiTitleValue(item)) latestWithHindiTitle += 1;
  if (hindiSummaryValue(item)) latestWithHindiSummary += 1;
  if (pathValue(item)) latestWithPath += 1;

  const status = firstText(item, ["status", "publishStatus", "publish_status"]).toLowerCase();
  const source = firstText(item, ["source", "source_type", "type"]).toLowerCase();

  if (!status || status.includes("published") || source.includes("published") || item.public === true || item.public_visible === true) {
    latestPublishedSafe += 1;
  }
}

check(latestWithPath >= 4, "Public latest sample has article paths/URLs", failures);
check(latestWithHindiTitle >= 4, "Public latest sample has Hindi titles", failures);
check(latestWithHindiSummary >= 4, "Public latest sample has Hindi summaries", failures);
check(latestPublishedSafe >= 4, "Public latest sample appears public/published-safe", failures);

const knownBadTokens = [
  "#open-day-card",
  "javascript:void",
  "href=\"#\""
];

for (const [file, content] of [
  ["index.html", indexHtml],
  ["insights.html", insightsHtml],
  ["article.html", articleHtml]
]) {
  for (const token of knownBadTokens) {
    check(!content.includes(token), `${file} does not contain ${token}`, failures);
  }
}

const sitemapUrlCount = (sitemap.match(/<url>/g) || []).length;
const sitemapArticleUrlCount = (sitemap.match(/article\.html\?path=/g) || []).length;

check(sitemapUrlCount > 0, "Sitemap has URLs", failures);
check(sitemapArticleUrlCount > 0, "Sitemap contains article reader URLs", failures);

const publicArticleCount =
  Number(seoMetadata.public_article_count || seoMetadata.publicArticles || seoMetadata.public_articles || 0);

check(
  publicArticleCount > 0 || sitemapArticleUrlCount > 0,
  "SEO metadata or sitemap records public article URLs",
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
console.log("Public read integrity summary:");
console.log(`- Published items: ${publishedItems.length}`);
console.log(`- Public latest: ${publicLatest.length}`);
console.log(`- Homepage featured reads: ${featuredReads.length}`);
console.log(`- Featured with images: ${featuredWithImage}`);
console.log(`- Featured with usable links: ${featuredWithUsableLink}`);
console.log(`- Public latest Hindi titles checked: ${latestWithHindiTitle}`);
console.log(`- Sitemap URLs: ${sitemapUrlCount}`);
console.log(`- Sitemap article URLs: ${sitemapArticleUrlCount}`);

if (failures.length) {
  console.log("");
  console.log("Public read link/image integrity preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Public read link/image integrity preflight passed.");
