import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "hf05-targeted-header-dropdown-behavior-correction-patch.json");
const docPath = path.join(root, "docs", "quality", "HF05_TARGETED_HEADER_DROPDOWN_BEHAVIOR_CORRECTION_PATCH.md");
const applyPath = path.join(root, "data", "quality", "hf05-targeted-header-dropdown-behavior-correction-apply-result.json");
const previewPath = path.join(root, "data", "quality", "hf05-targeted-header-dropdown-behavior-correction-preview.json");
const hf04Path = path.join(root, "data", "quality", "hf04-followup-homepage-visual-interaction-correction-plan.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ HF05 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, applyPath, previewPath, hf04Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing HF05 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const apply = JSON.parse(fs.readFileSync(applyPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const hf04 = JSON.parse(fs.readFileSync(hf04Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "HF05") fail("module_id must be HF05");
if (apply.module_id !== "HF05") fail("apply result module_id must be HF05");
if (preview.module_id !== "HF05") fail("preview module_id must be HF05");
if (preview.preview_only !== true) fail("HF05 preview must be preview-only");

if (hf04.recommended_next_stage?.module_id !== "HF05") {
  fail("HF04 must recommend HF05 before HF05 proceeds");
}

if (registry.limited_static_frontend_mutation_enabled !== true) {
  fail("HF05 must enable only limited static frontend mutation");
}

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
  "seo_metadata_mutation_enabled",
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
  if (registry[flag] !== false) fail(`${flag} must remain false in HF05`);
}

for (const correction of [
  "remove_unsafe_dropdown_guard_scripts",
  "preserve_passive_dropdown_marker",
  "rebuild_homepage_header",
  "restore_visible_language_toggle",
  "restore_native_timezone_selectability",
  "preserve_static_signin_join_placeholder",
  "preserve_required_navigation_labels",
  "preserve_reference_and_image_credit_blocks",
  "keep_backend_supabase_auth_api_disabled"
]) {
  if (!registry.corrections.includes(correction)) fail(`Missing correction: ${correction}`);
}

for (const label of registry.required_nav_labels) {
  const status = preview.static_scan.required_nav_label_status.find((item) => item.label === label);
  if (!status || status.present !== true) fail(`Required nav label missing from index.html: ${label}`);
}

if (!preview.summary.hf05_header_complete) fail("HF05 header must be complete");
if (!preview.summary.hf05_script_present) fail("HF05 script marker must be present");
if (!preview.summary.native_dropdown_safety_present) fail("Native dropdown safety marker must be present");
if (!preview.summary.unsafe_hf01_dropdown_guard_script_removed_from_index) fail("Unsafe HF01 dropdown guard script must be removed from index");
if (!preview.summary.required_nav_labels_present) fail("Required nav labels must remain present");
if (!preview.summary.language_toggle_visible_markers_present) fail("Visible EN/Hindi toggle markers must be present");
if (!preview.summary.timezone_select_present) fail("Timezone select marker must be present");
if (!preview.summary.auth_placeholder_preserved) fail("Sign in / Join placeholder must be preserved");

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

if (apply.summary.file_deletion_performed !== false) fail("HF05 must not delete files");
if (apply.summary.file_move_performed !== false) fail("HF05 must not move files");

for (const file of apply.modified_files || []) {
  if (file.startsWith("archive/")) fail(`HF05 must not modify archive files: ${file}`);
  if (file.includes("backup")) fail(`HF05 must not modify backup files: ${file}`);
  if (!file.endsWith(".html")) fail(`HF05 modified non-html file through applier: ${file}`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!apply.blocked_capabilities.includes(blocked)) fail(`Apply missing blocked capability: ${blocked}`);
  if (!preview.blocked_capabilities.includes(blocked)) fail(`Preview missing blocked capability: ${blocked}`);
}

if (registry.recommended_next_stage?.module_id !== "HQ02") {
  fail("HF05 recommended next stage must be HQ02");
}
if (registry.recommended_next_stage?.auth_allowed !== false) fail("HQ02 auth_allowed must be false");
if (registry.recommended_next_stage?.deployment_allowed !== false) fail("HQ02 deployment_allowed must be false");
if (registry.recommended_next_stage?.activation_decision_allowed !== false) fail("HQ02 activation decision must be false");

for (const scriptName of ["apply:hf05", "generate:hf05", "validate:hf05", "validate:homepage", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of [
  "Allowed Mutation",
  "Correction Strategy",
  "Dropdown Freeze Correction",
  "Header Reconstruction",
  "Language Toggle Boundary",
  "Auth Boundary",
  "Explicit Exclusions",
  "HF05 does not"
]) {
  if (!docText.includes(phrase)) fail(`HF05 document missing phrase: ${phrase}`);
}

pass("HF05 registry is present.");
pass("HF05 document is present.");
pass("HF05 apply result and preview are present.");
pass("Unsafe dropdown guard scripts are removed/replaced with passive safety.");
pass("Homepage header is rebuilt with required navigation labels.");
pass("Visible EN/Hindi language toggle is present.");
pass("Timezone select marker is present.");
pass("Sign in / Join remains static placeholder only.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("HQ02 is recorded as the recommended post-HF05 QA stage.");
pass("HF05 is targeted header/dropdown behavior correction and safe to commit.");
