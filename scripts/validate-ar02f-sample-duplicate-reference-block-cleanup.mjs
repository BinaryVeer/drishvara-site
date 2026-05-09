import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "ar02f-sample-duplicate-reference-block-cleanup.json");
const docPath = path.join(root, "docs", "quality", "AR02F_SAMPLE_DUPLICATE_REFERENCE_BLOCK_CLEANUP.md");
const sampleRegistryPath = path.join(root, "data", "editorial", "ar02b-sample-verified-reference-candidates.json");
const applyPath = path.join(root, "data", "quality", "ar02f-sample-duplicate-reference-block-cleanup-apply-result.json");
const previewPath = path.join(root, "data", "quality", "ar02f-sample-duplicate-reference-block-cleanup-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ AR02F validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const requiredPath of [registryPath, docPath, sampleRegistryPath, applyPath, previewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing AR02F required artifact/dependency: ${requiredPath}`);
}

const registry = readJson(registryPath);
const sample = readJson(sampleRegistryPath);
const apply = readJson(applyPath);
const preview = readJson(previewPath);
const pkg = readJson(packagePath);
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "AR02F") fail("Registry module_id must be AR02F");
if (apply.module_id !== "AR02F") fail("Apply result module_id must be AR02F");
if (preview.module_id !== "AR02F") fail("Preview module_id must be AR02F");
if (preview.preview_only !== true) fail("Preview must be preview-only");

if (sample.sample_article_count !== 5) fail("AR02F requires five sample articles");
if (apply.summary.scanned_sample_article_count !== 5) fail("Exactly five sample articles must be scanned");
if (!apply.summary.every_sample_has_ar02c_block) fail("Each sample must preserve AR02C block");
if (!apply.summary.every_sample_has_two_ar02c_links) fail("Each sample must preserve two AR02C links");
if (!apply.summary.every_sample_has_image_credit) fail("Each sample must preserve image credit");
if (!apply.summary.every_sample_preserves_expected_urls) fail("Each sample must preserve expected URLs");
if (!apply.summary.no_legacy_phrases_outside_ar02c) fail("Legacy phrases must be absent outside AR02C block");

if (!preview.summary.cleanup_marker_present_on_all_samples) fail("Cleanup marker must be present on all sample pages");
if (!preview.summary.every_sample_has_one_ar02c_block) fail("Preview must show exactly one AR02C block per sample");
if (!preview.summary.every_sample_has_two_ar02c_links) fail("Preview must show two AR02C links per sample");
if (!preview.summary.every_sample_has_image_credit) fail("Preview must show image credit per sample");
if (!preview.summary.every_sample_preserves_expected_urls) fail("Preview must preserve expected URLs");

for (const flag of [
  "non_sample_article_mutation_enabled",
  "new_reference_generation_enabled",
  "reference_url_change_enabled",
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
  "non_sample_article_mutation_performed",
  "external_fetch_performed",
  "new_reference_generation_performed",
  "reference_url_change_performed",
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

for (const scriptName of ["apply:ar02f", "generate:ar02f", "validate:ar02f", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Purpose", "Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`AR02F document missing phrase: ${phrase}`);
}

pass("AR02F registry is present.");
pass("AR02F document is present.");
pass("AR02F apply result and preview are present.");
pass("Exactly five sample articles are scanned.");
pass("AR02C accepted reference block is preserved.");
pass("Each sample article preserves exactly two AR02C reference links.");
pass("Image credit remains present.");
pass("Legacy duplicate blocks are absent outside the AR02C block.");
pass("Non-sample articles remain untouched.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("AR02F is sample duplicate cleanup and safe to commit.");
