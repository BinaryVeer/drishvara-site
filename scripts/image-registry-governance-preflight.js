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

function categoryOf(item) {
  return text(item, ["tag", "category", "section", "topic", "source"]).toLowerCase();
}

function isPlaceholderImage(value) {
  if (!value) return true;
  const s = String(value).toLowerCase();
  return s.includes("placeholder") || s === "#" || s.startsWith("javascript:");
}

const failures = [];

console.log("Drishvara image registry/source governance preflight");
console.log("");

const files = {
  plan: "docs/content/image-registry-source-governance-plan.md",
  quality: "data/content/quality/image-registry-source-governance.json",
  registry: "data/content/editorial/image-registry.json",
  fallbacks: "data/content/editorial/category-image-fallbacks.json",
  c01: "data/content/quality/public-read-link-image-integrity.json",
  c02: "data/content/quality/editorial-selection-featured-read-governance.json",
  c03: "data/content/quality/featured-read-override-selection-memory.json",
  c04: "data/content/quality/featured-read-scoring-rotation-preview.json",
  homepageUi: "data/homepage-ui.json",
  articleIndex: "data/article-index.json",
  indexHtml: "index.html",
  articleHtml: "article.html"
};

Object.values(files).forEach((file) => check(exists(file), `${file} exists`, failures));

const plan = read(files.plan);
const quality = readJson(files.quality);
const registry = readJson(files.registry);
const fallbacks = readJson(files.fallbacks);
const c01 = readJson(files.c01);
const c02 = readJson(files.c02);
const c03 = readJson(files.c03);
const c04 = readJson(files.c04);
const homepageUi = readJson(files.homepageUi);
const articleIndex = readJson(files.articleIndex);
const indexHtml = read(files.indexHtml);
const articleHtml = read(files.articleHtml);

const featuredReads = Array.isArray(homepageUi.featuredReads) ? homepageUi.featuredReads : [];
const publicLatest = Array.isArray(articleIndex.publicLatest) ? articleIndex.publicLatest : [];
const publishedItems = Array.isArray(articleIndex.publishedItems) ? articleIndex.publishedItems : [];

check(quality.status === "preflight_only", "C05 quality registry is preflight-only", failures);
check(quality.image_registry_enabled === false, "Image registry remains disabled", failures);
check(quality.image_registry_write_enabled === false, "Image registry write remains disabled", failures);
check(quality.category_fallback_application_enabled === false, "Category fallback application remains disabled", failures);
check(quality.homepage_image_mutation_enabled === false, "Homepage image mutation remains disabled", failures);
check(quality.external_image_fetch_enabled === false, "External image fetch remains disabled", failures);

check(quality.blocked_in_this_stage.includes("external_image_fetch"), "C05 blocks external image fetch", failures);
check(quality.blocked_in_this_stage.includes("homepage_image_mutation"), "C05 blocks homepage image mutation", failures);
check(quality.blocked_in_this_stage.includes("image_registry_write"), "C05 blocks image registry write", failures);
check(quality.blocked_in_this_stage.includes("category_fallback_application"), "C05 blocks fallback application", failures);
check(quality.blocked_in_this_stage.includes("supabase_storage_activation"), "C05 blocks Supabase storage activation", failures);

check(registry.status === "scaffold_only", "Image registry is scaffold-only", failures);
check(registry.enabled === false, "Image registry enabled flag is false", failures);
check(registry.write_enabled === false, "Image registry write flag is false", failures);
check(registry.homepage_mutation_enabled === false, "Image registry does not mutate homepage", failures);
check(registry.external_image_fetch_enabled === false, "Image registry does not fetch images", failures);
check(Array.isArray(registry.entries), "Image registry has entries array", failures);
check(registry.entries.length === 0, "Image registry has no live entries", failures);
check(registry.required_future_fields.includes("image_url"), "Image registry requires future image_url", failures);
check(registry.required_future_fields.includes("source_url"), "Image registry requires future source_url", failures);
check(registry.required_future_fields.includes("license_status"), "Image registry requires future license_status", failures);
check(registry.required_future_fields.includes("alt_text"), "Image registry requires future alt_text", failures);
check(registry.required_future_fields.includes("approval_status"), "Image registry requires future approval_status", failures);

check(fallbacks.status === "scaffold_only", "Category fallback registry is scaffold-only", failures);
check(fallbacks.enabled === false, "Category fallback enabled flag is false", failures);
check(fallbacks.fallback_application_enabled === false, "Fallback application is disabled", failures);
check(fallbacks.external_image_fetch_enabled === false, "Fallbacks do not fetch external images", failures);
check(Array.isArray(fallbacks.categories), "Fallback categories array exists", failures);
check(fallbacks.categories.length >= 6, "Fallback registry has enough category scaffolds", failures);
check(fallbacks.categories.every((item) => item.review_required === true), "All fallback categories require review", failures);
check(fallbacks.categories.every((item) => item.alt_text_required === true), "All fallback categories require alt text", failures);

check(c01.status === "preflight_only", "C01 remains preflight-only", failures);
check(c02.status === "preflight_only", "C02 remains preflight-only", failures);
check(c03.status === "preflight_only", "C03 remains preflight-only", failures);
check(c04.status === "preflight_only", "C04 remains preflight-only", failures);

check(plan.includes("does not fetch external image APIs"), "Plan blocks external image APIs", failures);
check(plan.includes("does not change homepage featured reads"), "Plan blocks homepage featured changes", failures);
check(plan.includes("Alt Text Rule"), "Plan includes alt text rule", failures);
check(plan.includes("license status"), "Plan covers license status", failures);

check(featuredReads.length >= 4, "Homepage has at least four featured reads", failures);
check(publicLatest.length >= 4, "Article index has publicLatest sample", failures);
check(publishedItems.length > 0, "Article index has published public items", failures);
check(indexHtml.includes("featuredReads"), "Homepage still uses featuredReads", failures);
check(articleHtml.includes("image") || articleHtml.includes("Image"), "Article reader still supports images", failures);

const images = [];
const categories = new Set();
let featuredWithTitle = 0;
let featuredWithImage = 0;
let placeholderImages = 0;

for (const [index, item] of featuredReads.entries()) {
  const title = titleOf(item);
  const image = imageOf(item);
  const category = categoryOf(item);

  if (title) featuredWithTitle += 1;
  if (image) featuredWithImage += 1;
  if (category) categories.add(category);
  if (image) images.push(image);
  if (isPlaceholderImage(image)) placeholderImages += 1;

  check(Boolean(title), `Featured read ${index + 1} has title`, failures);
  check(Boolean(image), `Featured read ${index + 1} has image`, failures);
  check(!isPlaceholderImage(image), `Featured read ${index + 1} image is not placeholder`, failures);
}

const uniqueImages = new Set(images);

check(featuredWithTitle >= 4, "At least four featured reads have titles", failures);
check(featuredWithImage >= 4, "At least four featured reads have images", failures);
check(uniqueImages.size === images.length, "Featured images remain unique", failures);
check(placeholderImages === 0, "No placeholder images in featured reads", failures);
check(categories.size >= 2, "Featured image categories are diverse", failures);

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
console.log("Image registry/source governance summary:");
console.log(`- Featured reads checked: ${featuredReads.length}`);
console.log(`- Featured images present: ${featuredWithImage}`);
console.log(`- Unique featured images: ${uniqueImages.size}`);
console.log(`- Image registry enabled: ${registry.enabled}`);
console.log(`- Image registry entries: ${registry.entries.length}`);
console.log(`- Fallback application enabled: ${fallbacks.fallback_application_enabled}`);
console.log(`- Fallback categories scaffolded: ${fallbacks.categories.length}`);
console.log("- External image fetch: blocked");
console.log("- Homepage image mutation: blocked");

if (failures.length) {
  console.log("");
  console.log("Image registry/source governance preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("Image registry/source governance preflight passed.");
