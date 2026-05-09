import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ar02c-sample-article-reference-insertion-patch.json");
const docPath = path.join(root, "docs", "quality", "AR02C_SAMPLE_ARTICLE_REFERENCE_INSERTION_PATCH.md");
const sampleRegistryPath = path.join(root, "data", "editorial", "ar02b-sample-verified-reference-candidates.json");
const applyPath = path.join(root, "data", "quality", "ar02c-sample-article-reference-insertion-apply-result.json");
const previewPath = path.join(root, "data", "quality", "ar02c-sample-article-reference-insertion-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AR02C validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const requiredPath of [registryPath, docPath, sampleRegistryPath, applyPath, previewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing AR02C required artifact/dependency: ${requiredPath}`);
}

const registry = readJson(registryPath);
const sample = readJson(sampleRegistryPath);
const apply = readJson(applyPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AR02C") fail("Registry module_id must be AR02C");
if (apply.module_id !== "AR02C") fail("Apply result module_id must be AR02C");
if (preview.module_id !== "AR02C") fail("Preview module_id must be AR02C");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (sample.sample_article_count !== 5) fail("AR02C requires exactly five sample articles");
if (!apply.summary.exactly_five_sample_articles_modified) fail("Exactly five sample articles must be modified");
if (apply.summary.total_reference_links_inserted !== 10) fail("Exactly ten reference links must be inserted");
if (!apply.summary.every_sample_has_two_reference_links) fail("Every sample must have two reference links");
if (!apply.summary.every_sample_has_image_credit) fail("Every sample must retain image credit");

if (!preview.summary.every_sample_has_ar02c_block) fail("Every sample must have AR02C block");
if (!preview.summary.every_sample_has_reference_status) fail("Every sample must have AR02C reference status");
if (!preview.summary.every_sample_has_two_reference_links) fail("Every sample must have two AR02C links");
if (!preview.summary.every_sample_preserves_two_ar01_slots) fail("Every sample must preserve two AR01 reference slots");
if (!preview.summary.every_sample_has_image_credit) fail("Every sample must preserve image credit");
if (!preview.summary.every_sample_has_expected_urls) fail("Every inserted URL must match AR02B registry");
if (preview.summary.non_sample_article_mutation_performed !== false) fail("Non-sample articles must not contain AR02C marker");
if (preview.summary.non_sample_ar02c_marker_count !== 0) fail("Non-sample AR02C marker count must be zero");

for (const entry of sample.entries) {
  const htmlPath = path.join(root, entry.article_path);
  if (!fs.existsSync(htmlPath)) fail(`Missing sample article: ${entry.article_path}`);
  const html = fs.readFileSync(htmlPath, "utf8");

  for (const reference of entry.references) {
    if (!html.includes(reference.url)) {
      fail(`Inserted article missing expected URL: ${entry.article_path}`);
    }
  }
}

for (const flag of [
  "non_sample_article_mutation_enabled",
  "external_fetch_enabled",
  "new_reference_generation_enabled",
  "random_reference_insertion_enabled",
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
  "non_sample_article_mutation_performed",
  "external_fetch_performed",
  "new_reference_generation_performed",
  "random_reference_insertion_performed",
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

for (const scriptName of ["apply:ar02c", "generate:ar02c", "validate:ar02c", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AR02C document missing phrase: ${phrase}`);
}

pass("AR02C registry is present.");
pass("AR02C document is present.");
pass("AR02C apply result and preview are present.");
pass("Exactly five sample article pages are updated.");
pass("Each sample article contains exactly two accepted reference links.");
pass("Inserted URLs match AR02B sample registry.");
pass("Image-credit block remains present.");
pass("Non-sample articles remain untouched by AR02C.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AR02C is sample article reference insertion patch and safe to commit.");
