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

function isBadUrl(url) {
  if (!url) return true;
  const value = String(url).trim().toLowerCase();
  return value === "#" || value === "#open-day-card" || value.startsWith("javascript:");
}

function isBlockedTag(item, blockedTags) {
  const category = categoryOf(item);
  return blockedTags.some((tag) => category.includes(tag));
}

const failures = [];

console.log("Drishvara featured read override/selection memory preflight");
console.log("");

const files = {
  plan: "docs/content/featured-read-override-selection-memory-plan.md",
  quality: "data/content/quality/featured-read-override-selection-memory.json",
  override: "data/content/editorial/featured-read-overrides.json",
  memory: "data/content/editorial/featured-read-selection-memory.json",
  c01: "data/content/quality/public-read-link-image-integrity.json",
  c02: "data/content/quality/editorial-selection-featured-read-governance.json",
  homepageUi: "data/homepage-ui.json",
  articleIndex: "data/article-index.json",
  indexHtml: "index.html"
};

Object.values(files).forEach((file) => check(exists(file), `${file} exists`, failures));

const plan = read(files.plan);
const quality = readJson(files.quality);
const override = readJson(files.override);
const memory = readJson(files.memory);
const c01 = readJson(files.c01);
const c02 = readJson(files.c02);
const homepageUi = readJson(files.homepageUi);
const articleIndex = readJson(files.articleIndex);
const indexHtml = read(files.indexHtml);

const featuredReads = Array.isArray(homepageUi.featuredReads) ? homepageUi.featuredReads : [];
const publicLatest = Array.isArray(articleIndex.publicLatest) ? articleIndex.publicLatest : [];
const publishedItems = Array.isArray(articleIndex.publishedItems) ? articleIndex.publishedItems : [];
const blockedTags = Array.isArray(c02.blocked_featured_tags) ? c02.blocked_featured_tags : [];

check(quality.status === "preflight_only", "C03 quality registry is preflight-only", failures);
check(quality.manual_override_enabled === false, "C03 keeps manual override disabled", failures);
check(quality.selection_memory_write_enabled === false, "C03 keeps selection memory write disabled", failures);
check(quality.blocked_in_this_stage.includes("manual_override_activation"), "C03 blocks manual override activation", failures);
check(quality.blocked_in_this_stage.includes("homepage_featured_read_mutation"), "C03 blocks homepage featured read mutation", failures);
check(quality.blocked_in_this_stage.includes("selection_memory_write"), "C03 blocks selection memory writes", failures);
check(quality.blocked_in_this_stage.includes("external_api_fetch"), "C03 blocks external API fetch", failures);

check(override.enabled === false, "Override file remains disabled", failures);
check(override.manual_lock_enabled === false, "Manual featured lock remains disabled", failures);
check(override.override_mode === "disabled", "Override mode is disabled", failures);
check(Array.isArray(override.overrides), "Override file has overrides array", failures);
check(override.overrides.length === 0, "No live overrides are configured", failures);
check(override.required_future_fields.includes("article_path"), "Override file requires future article_path", failures);
check(override.required_future_fields.includes("rollback_note"), "Override file requires future rollback note", failures);

check(memory.enabled === false, "Selection memory remains disabled", failures);
check(memory.selection_memory_enabled === false, "Selection memory feature flag remains disabled", failures);
check(memory.write_enabled === false, "Selection memory write remains disabled", failures);
check(Array.isArray(memory.entries), "Selection memory has entries array", failures);
check(memory.entries.length === 0, "Selection memory has no active entries", failures);
check(memory.future_entry_fields.includes("selected_date"), "Selection memory future fields include selected_date", failures);
check(memory.future_entry_fields.includes("article_path"), "Selection memory future fields include article_path", failures);

check(c01.status === "preflight_only", "C01 public read integrity remains preflight-only", failures);
check(c02.status === "preflight_only", "C02 editorial governance remains preflight-only", failures);
check(c02.manual_override?.enabled === false, "C02 manual override remains disabled", failures);

check(plan.includes("Manual override is disabled"), "Plan states manual override is disabled", failures);
check(plan.includes("does not mutate homepage featured reads"), "Plan blocks homepage mutation", failures);
check(plan.includes("Selection memory should help prevent repeated homepage choices"), "Plan explains selection memory purpose", failures);

check(featuredReads.length >= 4, "Homepage has at least four featured reads", failures);
check(publicLatest.length >= 4, "Article index has publicLatest sample", failures);
check(publishedItems.length > 0, "Article index has published public items", failures);
check(indexHtml.includes("featuredReads"), "Homepage still uses featuredReads", failures);
check(indexHtml.includes("articleUrl("), "Homepage still uses articleUrl helper", failures);

const urls = [];
const images = [];
let blockedFeaturedCount = 0;

for (const [index, item] of featuredReads.entries()) {
  const label = `Featured read ${index + 1}`;
  const title = titleOf(item);
  const image = imageOf(item);
  const url = articleUrlOf(item);

  if (url) urls.push(url);
  if (image) images.push(image);
  if (isBlockedTag(item, blockedTags)) blockedFeaturedCount += 1;

  check(Boolean(title), `${label} keeps title`, failures);
  check(Boolean(image), `${label} keeps image`, failures);
  check(!isBadUrl(url), `${label} keeps safe URL`, failures);
}

check(new Set(urls).size === urls.length, "Featured read URLs remain unique", failures);
check(new Set(images).size === images.length, "Featured read images remain unique", failures);
check(blockedFeaturedCount === 0, "Featured reads still avoid blocked pipeline/scaffold categories", failures);

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
console.log("Featured read override/memory summary:");
console.log(`- Featured reads: ${featuredReads.length}`);
console.log(`- Override enabled: ${override.enabled}`);
console.log(`- Override entries: ${override.overrides.length}`);
console.log(`- Selection memory enabled: ${memory.selection_memory_enabled}`);
console.log(`- Selection memory entries: ${memory.entries.length}`);
console.log(`- Unique featured URLs: ${new Set(urls).size}`);
console.log(`- Unique featured images: ${new Set(images).size}`);
console.log("- External API fetch: blocked");
console.log("- Homepage mutation: blocked");

if (failures.length) {
  console.log("");
  console.log("Featured read override/selection memory preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Featured read override/selection memory preflight passed.");
