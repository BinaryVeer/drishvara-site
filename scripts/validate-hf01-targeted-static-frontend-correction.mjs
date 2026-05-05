import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "hf01-targeted-static-frontend-correction-patch.json");
const docPath = path.join(root, "docs", "quality", "HF01_TARGETED_STATIC_FRONTEND_CORRECTION_PATCH.md");
const applyPath = path.join(root, "data", "quality", "hf01-targeted-static-frontend-correction-apply-result.json");
const previewPath = path.join(root, "data", "quality", "hf01-targeted-static-frontend-correction-preview.json");
const hf00Path = path.join(root, "data", "quality", "hf00-homepage-page-navigation-dropdown-reference-image-credit-fix-plan.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ HF01 validation failed: ${message}`);
  process.exit(1);
}
function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, applyPath, previewPath, hf00Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing HF01 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const apply = JSON.parse(fs.readFileSync(applyPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const hf00 = JSON.parse(fs.readFileSync(hf00Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "HF01") fail("module_id must be HF01");
if (apply.module_id !== "HF01") fail("apply result module_id must be HF01");
if (preview.module_id !== "HF01") fail("preview module_id must be HF01");
if (preview.preview_only !== true) fail("preview must be preview-only");

if (hf00.recommended_next_stage?.module_id !== "HF01") {
  fail("HF00 must recommend HF01 before HF01 proceeds");
}

if (registry.limited_static_frontend_mutation_enabled !== true) fail("HF01 must enable only limited static frontend mutation");

for (const flag of [
  "runtime_enabled",
  "server_endpoint_enabled",
  "api_route_enabled",
  "backend_activation_enabled",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "payment_enabled",
  "admin_ui_enabled",
  "subscriber_output_enabled",
  "public_dynamic_output_enabled",
  "seo_text_mutation_enabled",
  "sitemap_mutation_enabled",
  "file_deletion_enabled",
  "file_move_enabled",
  "archive_cleanup_enabled",
  "backup_cleanup_enabled",
  "ml_ingestion_enabled",
  "embedding_generation_enabled",
  "model_training_enabled",
  "vector_database_write_enabled",
  "external_api_fetch_enabled",
  "frontend_deployment_enabled",
  "backend_deployment_enabled",
  "activation_decision_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false`);
}

for (const correction of [
  "common_navigation",
  "contact_submissions_nav",
  "article_navigation",
  "static_sign_in_join_placeholder",
  "dropdown_select_guard",
  "article_reference_block",
  "image_credit_block"
]) {
  if (!registry.corrections.includes(correction)) fail(`Missing correction: ${correction}`);
}

if (!preview.summary.nav_all_have_submissions) fail("All checked public pages must include Submissions navigation");
if (!preview.summary.nav_all_have_dashboard) fail("All checked public pages must include Dashboard navigation");
if (!preview.summary.nav_all_have_signin_join) fail("All checked public pages must include static Sign in / Join placeholder");
if (!preview.summary.articles_all_have_reference_block) fail("All article pages must include reference verification block");
if (!preview.summary.articles_all_have_image_credit_block) fail("All article pages must include image credit block");
if (!preview.summary.dropdown_guard_present_all_checked_files) fail("Dropdown guard must be present on checked public files");

for (const falseField of [
  "backend_activation_performed",
  "api_route_created",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "frontend_deployment_performed"
]) {
  if (apply.summary[falseField] !== false) fail(`Apply summary ${falseField} must be false`);
  if (preview.summary[falseField] !== false) fail(`Preview summary ${falseField} must be false`);
}

if (apply.summary.file_deletion_performed !== false) fail("HF01 must not delete files");
if (apply.summary.file_move_performed !== false) fail("HF01 must not move files");

for (const blocked of registry.blocked_capabilities) {
  if (!apply.blocked_capabilities.includes(blocked)) fail(`Apply result missing blocked capability: ${blocked}`);
  if (!preview.blocked_capabilities.includes(blocked)) fail(`Preview missing blocked capability: ${blocked}`);
}

if (registry.recommended_next_stage?.module_id !== "HQ00") fail("HF01 must recommend HQ00");
if (registry.recommended_next_stage?.deployment_allowed !== false) fail("HQ00 deployment_allowed must be false");
if (registry.recommended_next_stage?.activation_decision_allowed !== false) fail("HQ00 activation decision must be false");

for (const scriptName of ["apply:hf01", "generate:hf01", "validate:hf01", "validate:homepage", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of [
  "Navigation Correction Rule",
  "Dropdown Interaction Correction Rule",
  "Reference-Link Display Rule",
  "Image Credit Display Rule",
  "Verified Reference-Link Integrity",
  "Explicit Exclusions",
  "HF01 does not"
]) {
  if (!docText.includes(phrase)) fail(`HF01 document missing phrase: ${phrase}`);
}

pass("HF01 registry is present.");
pass("HF01 document is present.");
pass("HF01 apply result and preview are present.");
pass("Common navigation is applied across checked public pages.");
pass("Submissions, Dashboard, and static Sign in / Join placeholder are present in navigation.");
pass("Dropdown/select guard is present.");
pass("Article reference block is present without invented links.");
pass("Image credit block is present without invented credits.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("HF01 is targeted static frontend correction and safe to commit.");
