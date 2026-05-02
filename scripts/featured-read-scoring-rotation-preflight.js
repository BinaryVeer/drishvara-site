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
  const value = String(url).trim().toLowerCase();
  return value === "#" || value === "#open-day-card" || value.startsWith("javascript:");
}

function isBlockedCategory(item, blockedCategories) {
  const category = categoryOf(item);
  return blockedCategories.some((blocked) => category.includes(blocked));
}

function scoreFeaturedRead(item, model, duplicateUrl, duplicateImage, categoryDiversityOk) {
  const weights = model.score_weights || {};
  let score = 0;

  if (titleOf(item)) score += Number(weights.title_present || 0);
  if (summaryOf(item)) score += Number(weights.summary_present || 0);
  if (imageOf(item)) score += Number(weights.image_present || 0);
  if (!isBadUrl(articleUrlOf(item))) score += Number(weights.usable_url || 0);
  if (hasHindiMeta(item)) score += Number(weights.hindi_metadata || 0);
  if (!isBlockedCategory(item, model.blocked_categories || [])) score += Number(weights.safe_category || 0);
  if (categoryDiversityOk) score += Number(weights.category_diversity_bonus || 0);

  if (duplicateUrl) score += Number(weights.duplicate_url_penalty || 0);
  if (duplicateImage) score += Number(weights.duplicate_image_penalty || 0);
  if (isBlockedCategory(item, model.blocked_categories || [])) score += Number(weights.pipeline_category_penalty || 0);

  return score;
}

const failures = [];

console.log("Drishvara featured read scoring/rotation preview preflight");
console.log("");

const files = {
  plan: "docs/content/featured-read-scoring-rotation-plan.md",
  model: "data/content/quality/featured-read-scoring-rotation-preview.json",
  c01: "data/content/quality/public-read-link-image-integrity.json",
  c02: "data/content/quality/editorial-selection-featured-read-governance.json",
  c03: "data/content/quality/featured-read-override-selection-memory.json",
  overrides: "data/content/editorial/featured-read-overrides.json",
  memory: "data/content/editorial/featured-read-selection-memory.json",
  homepageUi: "data/homepage-ui.json",
  articleIndex: "data/article-index.json",
  indexHtml: "index.html"
};

Object.values(files).forEach((file) => check(exists(file), `${file} exists`, failures));

const plan = read(files.plan);
const model = readJson(files.model);
const c01 = readJson(files.c01);
const c02 = readJson(files.c02);
const c03 = readJson(files.c03);
const overrides = readJson(files.overrides);
const memory = readJson(files.memory);
const homepageUi = readJson(files.homepageUi);
const articleIndex = readJson(files.articleIndex);
const indexHtml = read(files.indexHtml);

const featuredReads = Array.isArray(homepageUi.featuredReads) ? homepageUi.featuredReads : [];
const publicLatest = Array.isArray(articleIndex.publicLatest) ? articleIndex.publicLatest : [];
const publishedItems = Array.isArray(articleIndex.publishedItems) ? articleIndex.publishedItems : [];

check(model.status === "preflight_only", "C04 scoring model is preflight-only", failures);
check(model.scoring_active === false, "C04 scoring is not active/live", failures);
check(model.homepage_mutation_enabled === false, "C04 does not mutate homepage", failures);
check(model.manual_override_enabled === false, "C04 keeps manual override disabled", failures);
check(model.selection_memory_write_enabled === false, "C04 keeps selection memory write disabled", failures);
check(model.external_api_fetch_enabled === false, "C04 blocks external API fetch", failures);

check(model.blocked_in_this_stage.includes("homepage_featured_read_mutation"), "C04 blocks homepage featured read mutation", failures);
check(model.blocked_in_this_stage.includes("manual_override_activation"), "C04 blocks manual override activation", failures);
check(model.blocked_in_this_stage.includes("selection_memory_write"), "C04 blocks selection memory write", failures);
check(model.blocked_in_this_stage.includes("external_api_fetch"), "C04 blocks external API fetch explicitly", failures);

check(c01.status === "preflight_only", "C01 remains preflight-only", failures);
check(c02.status === "preflight_only", "C02 remains preflight-only", failures);
check(c03.status === "preflight_only", "C03 remains preflight-only", failures);
check(overrides.enabled === false, "Override file remains disabled", failures);
check(memory.write_enabled === false, "Selection memory write remains disabled", failures);

check(plan.includes("dry-run scoring"), "Plan defines dry-run scoring", failures);
check(plan.includes("does not change homepage featured reads"), "Plan blocks homepage changes", failures);
check(plan.includes("does not fetch external APIs"), "Plan blocks external APIs", failures);

check(typeof model.score_weights === "object", "Scoring weights exist", failures);
check(Number(model.score_weights.usable_url) > 0, "Scoring rewards usable URL", failures);
check(Number(model.score_weights.image_present) > 0, "Scoring rewards image", failures);
check(Number(model.score_weights.hindi_metadata) > 0, "Scoring rewards Hindi metadata", failures);
check(Number(model.score_weights.duplicate_url_penalty) < 0, "Scoring penalizes duplicate URL", failures);
check(Number(model.score_weights.pipeline_category_penalty) < 0, "Scoring penalizes pipeline category", failures);

check(featuredReads.length >= 4, "Homepage has at least four featured reads", failures);
check(publicLatest.length >= 4, "Article index has publicLatest sample", failures);
check(publishedItems.length > 0, "Article index has published items", failures);
check(indexHtml.includes("featuredReads"), "Homepage still uses featuredReads", failures);
check(indexHtml.includes("articleUrl("), "Homepage still uses articleUrl helper", failures);

const urls = featuredReads.map(articleUrlOf).filter(Boolean);
const images = featuredReads.map(imageOf).filter(Boolean);
const categories = featuredReads.map(categoryOf).filter(Boolean);
const uniqueUrls = new Set(urls);
const uniqueImages = new Set(images);
const uniqueCategories = new Set(categories);
const categoryDiversityOk = uniqueCategories.size >= 2;

let minimumScore = Infinity;
let scoreCount = 0;

for (const [index, item] of featuredReads.entries()) {
  const url = articleUrlOf(item);
  const image = imageOf(item);
  const duplicateUrl = urls.filter((value) => value === url).length > 1;
  const duplicateImage = images.filter((value) => value === image).length > 1;
  const score = scoreFeaturedRead(item, model, duplicateUrl, duplicateImage, categoryDiversityOk);

  minimumScore = Math.min(minimumScore, score);
  scoreCount += 1;

  check(score >= Number(model.minimum_recommended_score || 70), `Featured read ${index + 1} meets dry-run score threshold`, failures);
  check(!isBadUrl(url), `Featured read ${index + 1} has safe URL`, failures);
  check(Boolean(image), `Featured read ${index + 1} has image`, failures);
  check(!isBlockedCategory(item, model.blocked_categories || []), `Featured read ${index + 1} avoids blocked categories`, failures);
}

check(uniqueUrls.size === urls.length, "Dry-run confirms featured URLs are unique", failures);
check(uniqueImages.size === images.length, "Dry-run confirms featured images are unique", failures);
check(uniqueCategories.size >= 2, "Dry-run confirms category diversity", failures);
check(scoreCount >= 4, "Dry-run scored at least four featured reads", failures);

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
console.log("Featured read scoring/rotation summary:");
console.log(`- Featured reads scored: ${scoreCount}`);
console.log(`- Minimum dry-run score: ${minimumScore}`);
console.log(`- Unique URLs: ${uniqueUrls.size}`);
console.log(`- Unique images: ${uniqueImages.size}`);
console.log(`- Unique categories: ${uniqueCategories.size}`);
console.log(`- Manual override enabled: ${model.manual_override_enabled}`);
console.log(`- Homepage mutation enabled: ${model.homepage_mutation_enabled}`);
console.log("- External API fetch: blocked");

if (failures.length) {
  console.log("");
  console.log("Featured read scoring/rotation preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Featured read scoring/rotation preflight passed.");
