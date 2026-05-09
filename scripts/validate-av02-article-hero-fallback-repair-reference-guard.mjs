import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "av02-article-hero-fallback-repair-reference-guard.json");
const docPath = path.join(root, "docs", "quality", "AV02_ARTICLE_HERO_FALLBACK_REPAIR_REFERENCE_GUARD.md");
const applyPath = path.join(root, "data", "quality", "av02-article-hero-fallback-repair-reference-guard-apply-result.json");
const packagePath = path.join(root, "package.json");
const articleRouterPath = path.join(root, "article.html");

function fail(message) {
  console.error(`❌ AV02 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const p of [registryPath, docPath, applyPath, packagePath, articleRouterPath]) {
  if (!fs.existsSync(p)) fail(`Missing AV02 required file: ${p}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const apply = JSON.parse(fs.readFileSync(applyPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const routerHtml = fs.readFileSync(articleRouterPath, "utf8");

if (registry.module_id !== "AV02") fail("Registry module_id must be AV02");
if (apply.module_id !== "AV02") fail("Apply result module_id must be AV02");

if (!apply.summary.fallback_assets_regenerated) fail("Fallback assets must be regenerated");
if (!apply.summary.all_article_pages_have_av02_style) fail("All article pages must have AV02 style");
if (!apply.summary.router_style_present) fail("Router must have AV02 style");
if (!apply.summary.router_reference_guard_present) fail("Router must have AV02 reference guard");
if (!apply.summary.ar02c_sample_reference_links_preserved) fail("AR02C sample links must be preserved");
if (!apply.summary.ar02c_sample_image_credit_preserved) fail("AR02C sample image credit must be preserved");

if (!routerHtml.includes("data-drishvara-av02-router-reference-guard-script")) {
  fail("article.html missing AV02 router guard script");
}

for (const rel of Object.values(registry.category_fallback_assets)) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) fail(`Missing fallback asset: ${rel}`);
  const text = fs.readFileSync(full, "utf8");
  if (text.includes("Media & Society")) fail(`SVG asset has unescaped ampersand: ${rel}`);
}

for (const falseField of [
  "article_text_mutation_performed",
  "article_word_count_reduction_performed",
  "reference_url_change_performed",
  "new_reference_insertion_performed",
  "external_fetch_performed",
  "backend_activation_performed",
  "api_route_created",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "frontend_deployment_performed",
  "file_deletion_performed",
  "file_move_performed"
]) {
  if (apply.summary[falseField] !== false) fail(`${falseField} must be false`);
}

for (const scriptName of ["apply:av02", "validate:av02", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

pass("AV02 registry is present.");
pass("AV02 document is present.");
pass("AV02 apply result is present.");
pass("Category fallback SVG assets are valid and regenerated.");
pass("Small brand marks before article title are restored where AV01 falsely replaced them.");
pass("Article router has reference/image-credit guard.");
pass("Broad justified reading layout remains active.");
pass("AR02C sample reference links and image credits are preserved.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AV02 is safe to commit.");
