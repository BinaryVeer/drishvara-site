import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ag02r2-curated-article-visual-source-registry.json");
const docPath = path.join(root, "docs", "quality", "AG02R2_CURATED_ARTICLE_VISUAL_SOURCE_REGISTRY.md");
const curatedPath = path.join(root, "data", "editorial", "ag02r2-curated-article-visual-source-registry.json");
const previewPath = path.join(root, "data", "quality", "ag02r2-curated-article-visual-source-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AG02R2 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const p of [registryPath, docPath, curatedPath, previewPath, packagePath]) {
  if (!fs.existsSync(p)) fail(`Missing AG02R2 required file: ${p}`);
}

const registry = readJson(registryPath);
const curated = readJson(curatedPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AG02R2") fail("Registry module_id must be AG02R2");
if (curated.module_id !== "AG02R2") fail("Curated registry module_id must be AG02R2");
if (preview.module_id !== "AG02R2") fail("Preview module_id must be AG02R2");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (curated.summary.ag02_target_count < 1) fail("AG02R2 must read AG02 targets");
if (curated.summary.registry_entry_count !== curated.summary.ag02_target_count) fail("Each AG02 target must have one registry entry");

if (!curated.image_inventory || typeof curated.image_inventory.candidate_image_count !== "number") {
  fail("Image inventory must be recorded");
}

for (const entry of curated.entries) {
  if (!entry.article_path || !entry.article_path.startsWith("articles/")) fail("Each entry must have article path");
  if (entry.editorial_selection_status !== "pending_review") fail(`Entry must remain pending review: ${entry.article_path}`);
  if (entry.approved_for_application !== false) fail(`No entry may be approved in AG02R2: ${entry.article_path}`);
  if (entry.approved_image_src !== null) fail(`No approved image source may be set in AG02R2: ${entry.article_path}`);
}

for (const falseField of [
  "mutation_performed",
  "article_html_mutation_performed",
  "article_image_mutation_performed",
  "image_credit_mutation_performed",
  "article_text_mutation_performed",
  "reference_url_change_performed",
  "new_reference_insertion_performed",
  "external_fetch_performed"
]) {
  if (curated[falseField] !== false) fail(`${falseField} must be false`);
}

for (const flag of [
  "article_html_mutation_enabled",
  "article_image_mutation_enabled",
  "image_credit_mutation_enabled",
  "article_text_mutation_enabled",
  "article_word_count_reduction_enabled",
  "article_word_count_expansion_enabled",
  "reference_url_change_enabled",
  "new_reference_insertion_enabled",
  "external_fetch_enabled",
  "external_asset_fetch_enabled",
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

for (const scriptName of ["generate:ag02r2", "validate:ag02r2", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Source-of-Truth Rule", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AG02R2 document missing phrase: ${phrase}`);
}

pass("AG02R2 registry is present.");
pass("AG02R2 document is present.");
pass("AG02R2 curated visual registry and preview are present.");
pass("AG02-targeted article count is preserved.");
pass("Local image inventory and candidate mappings are recorded.");
pass("All visual mappings remain pending manual review.");
pass("No article image is applied.");
pass("Reference URLs and article text/word-count logic are not changed.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AG02R2 is curated registry-only and safe to commit.");
