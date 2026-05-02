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

function articleUrlOf(item) {
  const url = text(item, ["url", "canonical_url", "canonicalUrl"]);
  if (url) return url;

  const p = text(item, ["path", "sourcePath", "source_path", "directUrl", "direct_url"]);
  if (p) return `article.html?path=${encodeURIComponent(p)}`;

  return "";
}

function pathOf(item) {
  return text(item, ["path", "sourcePath", "source_path", "directUrl", "direct_url", "url"]);
}

function isBadUrl(url) {
  if (!url) return true;
  const s = String(url).trim().toLowerCase();
  return s === "#" || s === "#open-day-card" || s.startsWith("javascript:");
}

function sitemapLocs(xml) {
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((m) => m[1].trim()).filter(Boolean);
}

const failures = [];

console.log("Drishvara article URL/slug/sitemap governance preflight");
console.log("");

const files = {
  plan: "docs/content/article-url-slug-sitemap-governance-plan.md",
  policy: "data/content/editorial/article-url-slug-policy.json",
  quality: "data/content/quality/article-url-slug-sitemap-governance.json",
  c01: "data/content/quality/public-read-link-image-integrity.json",
  c02: "data/content/quality/editorial-selection-featured-read-governance.json",
  c03: "data/content/quality/featured-read-override-selection-memory.json",
  c04: "data/content/quality/featured-read-scoring-rotation-preview.json",
  c05: "data/content/quality/image-registry-source-governance.json",
  articleIndex: "data/article-index.json",
  homepageUi: "data/homepage-ui.json",
  seoMetadata: "data/seo/site-metadata.json",
  indexHtml: "index.html",
  insightsHtml: "insights.html",
  articleHtml: "article.html",
  sitemap: "sitemap.xml",
  robots: "robots.txt"
};

Object.values(files).forEach((file) => check(exists(file), `${file} exists`, failures));

const plan = read(files.plan);
const policy = readJson(files.policy);
const quality = readJson(files.quality);
const c01 = readJson(files.c01);
const c02 = readJson(files.c02);
const c03 = readJson(files.c03);
const c04 = readJson(files.c04);
const c05 = readJson(files.c05);
const articleIndex = readJson(files.articleIndex);
const homepageUi = readJson(files.homepageUi);
const seoMetadata = readJson(files.seoMetadata);
const indexHtml = read(files.indexHtml);
const insightsHtml = read(files.insightsHtml);
const articleHtml = read(files.articleHtml);
const sitemap = read(files.sitemap);
const robots = read(files.robots);

const publicLatest = Array.isArray(articleIndex.publicLatest) ? articleIndex.publicLatest : [];
const publishedItems = Array.isArray(articleIndex.publishedItems) ? articleIndex.publishedItems : [];
const featuredReads = Array.isArray(homepageUi.featuredReads) ? homepageUi.featuredReads : [];

check(quality.status === "preflight_only", "C06 quality registry is preflight-only", failures);
check(quality.url_rewrite_enabled === false, "C06 keeps URL rewrite disabled", failures);
check(quality.sitemap_mutation_enabled === false, "C06 keeps sitemap mutation disabled", failures);
check(quality.homepage_link_mutation_enabled === false, "C06 keeps homepage link mutation disabled", failures);
check(quality.external_api_fetch_enabled === false, "C06 blocks external API fetch", failures);
check(quality.blocked_in_this_stage.includes("url_rewrite_activation"), "C06 blocks URL rewrite activation", failures);
check(quality.blocked_in_this_stage.includes("sitemap_mutation"), "C06 blocks sitemap mutation", failures);
check(quality.blocked_in_this_stage.includes("homepage_link_mutation"), "C06 blocks homepage link mutation", failures);
check(quality.guardrails.includes("Do not require only one article URL format."), "C06 accepts more than one URL format", failures);

check(policy.status === "scaffold_only", "URL/slug policy is scaffold-only", failures);
check(policy.enabled === false, "URL/slug policy is not live", failures);
check(policy.rewrite_enabled === false, "URL rewrite remains disabled in policy", failures);
check(policy.sitemap_mutation_enabled === false, "Policy does not mutate sitemap", failures);
check(policy.homepage_link_mutation_enabled === false, "Policy does not mutate homepage links", failures);
check(policy.legacy_reader_format_supported === true, "Legacy reader format remains supported", failures);
check(policy.supported_current_formats.includes("article.html?path=<encoded article path>"), "Policy supports reader query format", failures);
check(policy.supported_current_formats.includes("/articles/<slug>"), "Policy supports clean article route format", failures);
check(policy.preferred_future_canonical_format === "/articles/<slug>", "Policy records clean future canonical preference", failures);
check(policy.blocked_url_patterns.includes("#open-day-card"), "Policy blocks old open-day-card link", failures);
check(policy.blocked_url_patterns.includes("javascript:void"), "Policy blocks javascript:void link", failures);

check(c01.status === "preflight_only", "C01 remains preflight-only", failures);
check(c02.status === "preflight_only", "C02 remains preflight-only", failures);
check(c03.status === "preflight_only", "C03 remains preflight-only", failures);
check(c04.status === "preflight_only", "C04 remains preflight-only", failures);
check(c05.status === "preflight_only", "C05 remains preflight-only", failures);

check(plan.includes("does not rewrite existing URLs"), "Plan blocks URL rewrites", failures);
check(plan.includes("does not mutate article content"), "Plan blocks article mutation", failures);
check(plan.includes("Supported Article URL Formats"), "Plan defines supported URL formats", failures);
check(plan.includes("Slug Rules for Future Clean URLs"), "Plan defines future slug rules", failures);

check(Array.isArray(articleIndex.items), "Article index has items array", failures);
check(publishedItems.length > 0, "Article index has publishedItems", failures);
check(publicLatest.length >= 4, "Article index has publicLatest sample", failures);
check(featuredReads.length >= 4, "Homepage has featured reads", failures);

check(indexHtml.includes("articleUrl("), "Homepage has articleUrl helper", failures);
check(indexHtml.includes("featuredReads"), "Homepage uses featuredReads", failures);
check(insightsHtml.includes("article-index.json"), "Insights consumes article index", failures);
check(articleHtml.includes("URLSearchParams") || articleHtml.includes("location.search"), "Article reader supports query/path resolution", failures);
check(articleHtml.includes("article_html_hi"), "Article reader still supports Hindi body", failures);
check(articleHtml.includes("DrishvaraSEO") || articleHtml.includes("canonical"), "Article reader supports SEO/canonical runtime markers", failures);

check(!indexHtml.includes("#open-day-card"), "Homepage has no old open-day-card link", failures);
check(!indexHtml.includes("javascript:void"), "Homepage has no javascript:void links", failures);
check(!insightsHtml.includes("#open-day-card"), "Insights has no old open-day-card link", failures);
check(!articleHtml.includes("#open-day-card"), "Article reader has no old open-day-card link", failures);

let featuredSafeUrls = 0;
const featuredUrls = [];

for (const [index, item] of featuredReads.entries()) {
  const url = articleUrlOf(item);
  if (!isBadUrl(url)) featuredSafeUrls += 1;
  if (url) featuredUrls.push(url);
  check(!isBadUrl(url), `Featured read ${index + 1} has safe article URL`, failures);
}

check(featuredSafeUrls >= 4, "At least four featured reads have safe article URLs", failures);
check(new Set(featuredUrls).size === featuredUrls.length, "Featured article URLs remain unique", failures);

let latestPathCount = 0;
for (const item of publicLatest.slice(0, 8)) {
  if (pathOf(item)) latestPathCount += 1;
}
check(latestPathCount >= 4, "Public latest sample has article paths or URLs", failures);

const locs = sitemapLocs(sitemap);
const sitemapUrlCount = locs.length;
const sitemapReaderArticleUrls = sitemap.split("article.html?path=").length - 1;
const sitemapCleanArticleUrls = sitemap.split("/articles/").length - 1;
const sitemapArticleUrlCount = sitemapReaderArticleUrls + sitemapCleanArticleUrls;

const seoPublicArticleCount = Number(
  seoMetadata.public_article_count ||
  seoMetadata.publicArticles ||
  seoMetadata.public_articles ||
  articleIndex.publicTotal ||
  articleIndex.public_total ||
  publishedItems.length ||
  0
);

check(sitemap.includes("<urlset"), "Sitemap has urlset", failures);
check(sitemapUrlCount > 0, "Sitemap has loc URLs", failures);
check(robots.includes("sitemap.xml"), "robots.txt references sitemap.xml", failures);
check(
  sitemapArticleUrlCount > 0 || seoPublicArticleCount > 0,
  "Sitemap or SEO/article index records public article URLs",
  failures
);

check(
  seoPublicArticleCount >= 4,
  "SEO metadata or article index records public article count",
  failures
);

const duplicateLocs = locs.filter((value, index) => locs.indexOf(value) !== index);
check(duplicateLocs.length === 0, "Sitemap loc URLs are unique", failures);

for (const url of locs.slice(0, 20)) {
  check(!isBadUrl(url), `Sitemap URL is safe: ${url}`, failures);
}

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
console.log("Article URL/slug/sitemap governance summary:");
console.log(`- Published items: ${publishedItems.length}`);
console.log(`- Public latest: ${publicLatest.length}`);
console.log(`- Featured reads: ${featuredReads.length}`);
console.log(`- Featured safe URLs: ${featuredSafeUrls}`);
console.log(`- Sitemap URLs: ${sitemapUrlCount}`);
console.log(`- Sitemap article URL signals: ${sitemapArticleUrlCount}`);
console.log(`- SEO/article-index public article count: ${seoPublicArticleCount}`);
console.log(`- URL rewrite enabled: ${policy.rewrite_enabled}`);
console.log(`- Sitemap mutation enabled: ${quality.sitemap_mutation_enabled}`);
console.log("- External API fetch: blocked");

if (failures.length) {
  console.log("");
  console.log("Article URL/slug/sitemap governance preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Article URL/slug/sitemap governance preflight passed.");
