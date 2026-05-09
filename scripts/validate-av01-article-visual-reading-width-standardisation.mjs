import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "av01-article-visual-reading-width-standardisation-patch.json");
const docPath = path.join(root, "docs", "quality", "AV01_ARTICLE_VISUAL_READING_WIDTH_STANDARDISATION_PATCH.md");
const applyPath = path.join(root, "data", "quality", "av01-article-visual-reading-width-apply-result.json");
const previewPath = path.join(root, "data", "quality", "av01-article-visual-reading-width-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AV01 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const requiredPath of [registryPath, docPath, applyPath, previewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing AV01 required artifact/dependency: ${requiredPath}`);
}

const registry = readJson(registryPath);
const apply = readJson(applyPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AV01") fail("Registry module_id must be AV01");
if (apply.module_id !== "AV01") fail("Apply result module_id must be AV01");
if (preview.module_id !== "AV01") fail("Preview module_id must be AV01");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (!preview.summary.fallback_assets_exist) fail("Category fallback assets must exist");
if (!preview.summary.all_article_pages_have_av01_style) fail("All direct article pages must have AV01 style marker");
if (!preview.summary.all_article_pages_have_av01_checked_marker) fail("All direct article pages must have AV01 checked marker");
if (!preview.summary.router_style_present) fail("article.html router must have AV01 style");
if (!preview.summary.router_script_present) fail("article.html router must have AV01 fallback script");
if (!preview.summary.broad_width_rule_present) fail("Broad reading width rule must be present");
if (!preview.summary.justified_paragraph_rule_present) fail("Justified paragraph rule must be present");
if (!preview.summary.ar02c_sample_references_preserved) fail("AR02C sample reference links must be preserved");
if (!preview.summary.ar02c_sample_image_credit_preserved) fail("AR02C sample image credit must be preserved");
if (preview.summary.article_minimum_word_rule_changed !== false) fail("Minimum word rule must not be changed");

for (const flag of [
  "article_text_mutation_enabled",
  "article_word_count_reduction_enabled",
  "reference_url_change_enabled",
  "new_reference_insertion_enabled",
  "external_fetch_enabled",
  "runtime_enabled",
  "server_endpoint_enabled",
  "api_route_enabled",
  "backend_activation_enabled",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "credential_collection_enabled",
  "payment_enabled",
  "admin_ui_enabled",
  "subscriber_output_enabled",
  "public_dynamic_output_enabled",
  "frontend_deployment_enabled",
  "backend_deployment_enabled",
  "file_deletion_enabled",
  "file_move_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false`);
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
  if (apply.summary[falseField] !== false) fail(`Apply summary ${falseField} must be false`);
  if (preview.summary[falseField] !== false) fail(`Preview summary ${falseField} must be false`);
}

for (const scriptName of ["apply:av01", "generate:av01", "validate:av01", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Reading Width Rule", "Visual Fallback Rule", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AV01 document missing phrase: ${phrase}`);
}

pass("AV01 registry is present.");
pass("AV01 document is present.");
pass("AV01 apply result and preview are present.");
pass("Category fallback assets are present.");
pass("Direct article pages and article router contain AV01 markers.");
pass("Broad long-form reading width rule is present.");
pass("Paragraph justification rule is present.");
pass("AR02C sample reference links and image credits are preserved.");
pass("Article text/minimum word rule is not changed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AV01 is article visual fallback and broad reading width standardisation patch and safe to commit.");
