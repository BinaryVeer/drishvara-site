import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf07-unified-responsive-header-dropdown-system-patch.json");
const docPath = path.join(root, "docs", "quality", "HF07_UNIFIED_RESPONSIVE_HEADER_DROPDOWN_SYSTEM_PATCH.md");
const applyPath = path.join(root, "data", "quality", "hf07-unified-responsive-header-dropdown-system-apply-result.json");
const previewPath = path.join(root, "data", "quality", "hf07-unified-responsive-header-dropdown-system-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ HF07 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, applyPath, previewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing HF07 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const apply = JSON.parse(fs.readFileSync(applyPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "HF07") fail("module_id must be HF07");
if (apply.module_id !== "HF07") fail("apply result module_id must be HF07");
if (preview.module_id !== "HF07") fail("preview module_id must be HF07");
if (preview.preview_only !== true) fail("HF07 preview must be preview-only");

if (registry.limited_static_frontend_mutation_enabled !== true) {
  fail("HF07 must enable only limited static frontend mutation");
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
  "file_deletion_enabled",
  "file_move_enabled",
  "archive_cleanup_enabled",
  "backup_cleanup_enabled",
  "frontend_deployment_enabled",
  "backend_deployment_enabled",
  "activation_decision_enabled"
]) {
  if (registry[flag] !== false) fail(`${flag} must remain false in HF07`);
}

for (const correction of [
  "record_homepage_header_parallelism_issue",
  "standardize_header_across_public_pages",
  "make_dropdowns_responsive_across_public_pages",
  "preserve_timezone_selector",
  "preserve_visible_en_hindi_toggle",
  "hide_legacy_duplicate_nav_layers",
  "preserve_static_signin_join_placeholder",
  "preserve_reference_and_image_credit_blocks",
  "keep_backend_supabase_auth_api_disabled"
]) {
  if (!registry.corrections.includes(correction)) fail(`Missing correction: ${correction}`);
}

if (!preview.summary.all_samples_have_hf07_header) fail("All sample files must have HF07 header");
if (!preview.summary.all_samples_have_hf07_nav) fail("All sample files must have HF07 nav");
if (!preview.summary.all_samples_have_responsive_dropdown_style) fail("All sample files must have responsive dropdown style");
if (!preview.summary.all_samples_have_hf07_script) fail("All sample files must have HF07 script");
if (!preview.summary.all_samples_have_timezone) fail("All sample files must have timezone selector");
if (!preview.summary.all_samples_have_language_toggle) fail("All sample files must have EN/Hindi language toggle");
if (!preview.summary.all_samples_have_auth_placeholder) fail("All sample files must preserve auth placeholder");
if (!preview.summary.all_samples_have_required_nav_labels) fail("All sample files must preserve required nav labels");
if (!preview.summary.nested_article_links_correct) fail("Nested article links must use correct relative paths");

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

if (apply.summary.file_deletion_performed !== false) fail("HF07 must not delete files");
if (apply.summary.file_move_performed !== false) fail("HF07 must not move files");

for (const file of apply.modified_files || []) {
  if (file.startsWith("archive/")) fail(`HF07 must not modify archive files: ${file}`);
  if (file.includes("backup")) fail(`HF07 must not modify backup files: ${file}`);
  if (!file.endsWith(".html")) fail(`HF07 applier must modify only HTML files: ${file}`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!apply.blocked_capabilities.includes(blocked)) fail(`Apply missing blocked capability: ${blocked}`);
  if (!preview.blocked_capabilities.includes(blocked)) fail(`Preview missing blocked capability: ${blocked}`);
}

if (registry.recommended_next_stage?.module_id !== "LV04") {
  fail("HF07 recommended next stage must be LV04");
}

for (const scriptName of ["apply:hf07", "generate:hf07", "validate:hf07", "validate:homepage", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of [
  "Recorded UI Findings",
  "Correction Strategy",
  "Header Standard",
  "Dropdown Standard",
  "Explicit Exclusions"
]) {
  if (!docText.includes(phrase)) fail(`HF07 document missing phrase: ${phrase}`);
}

pass("HF07 registry is present.");
pass("HF07 document is present.");
pass("HF07 apply result and preview are present.");
pass("Unified header is applied across sample public pages.");
pass("Responsive dropdown style is applied across sample public pages.");
pass("Timezone selector and EN/Hindi toggle are preserved.");
pass("Nested article links are corrected with relative paths.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("LV04 is recorded as the recommended manual live recheck stage.");
pass("HF07 is unified responsive header/dropdown correction and safe to commit.");
