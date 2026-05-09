import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf13-login-header-favicon-top-band-refinement-patch.json");
const docPath = path.join(root, "docs", "quality", "HF13_LOGIN_HEADER_FAVICON_TOP_BAND_REFINEMENT_PATCH.md");
const applyPath = path.join(root, "data", "quality", "hf13-login-header-favicon-top-band-refinement-apply-result.json");
const previewPath = path.join(root, "data", "quality", "hf13-login-header-favicon-top-band-refinement-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ HF13 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, applyPath, previewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing HF13 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const apply = JSON.parse(fs.readFileSync(applyPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "HF13") fail("module_id must be HF13");
if (apply.module_id !== "HF13") fail("apply result module_id must be HF13");
if (preview.module_id !== "HF13") fail("preview module_id must be HF13");
if (preview.preview_only !== true) fail("HF13 preview must be preview-only");

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
  "credential_collection_enabled",
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
  if (registry[flag] !== false) fail(`${flag} must remain false in HF13`);
}

if (!preview.summary.favicon_ico_exists) fail("favicon.ico must exist");
if (!preview.summary.favicon_svg_exists) fail("favicon.svg must exist");
if (!preview.summary.apple_touch_icon_exists) fail("apple-touch-icon.png must exist");
if (!preview.summary.asset_favicon_exists) fail("assets/drishvara-favicon.svg must exist");
if (!preview.summary.all_samples_have_hf13_favicon) fail("HF13 favicon links must be present");
if (!preview.summary.all_samples_have_top_band_neutralisation) fail("Top band neutralisation must be present");
if (!preview.summary.login_header_visibility_present) fail("Login header visibility style must be present");
if (!preview.summary.all_samples_preserve_hf12_safe_select) fail("HF12 safe select system must be preserved");
if (!preview.summary.login_page_remains_static) fail("login.html must remain static");
if (!preview.summary.all_non_login_samples_preserve_hf07_header_nav) fail("HF07 header/nav must be preserved on non-login pages");
if (preview.summary.dropdown_logic_changed !== false) fail("HF13 must not change dropdown logic");

for (const falseField of [
  "backend_activation_performed",
  "api_route_created",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "credential_collection_enabled",
  "frontend_deployment_performed"
]) {
  if (apply.summary[falseField] !== false) fail(`Apply summary ${falseField} must be false`);
  if (preview.summary[falseField] !== false) fail(`Preview summary ${falseField} must be false`);
}

if (apply.summary.file_deletion_performed !== false) fail("HF13 must not delete files");
if (apply.summary.file_move_performed !== false) fail("HF13 must not move files");

for (const file of apply.modified_files || []) {
  if (file.startsWith("archive/")) fail(`HF13 must not modify archive files: ${file}`);
  if (file.includes("backup")) fail(`HF13 must not modify backup files: ${file}`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!apply.blocked_capabilities.includes(blocked)) fail(`Apply missing blocked capability: ${blocked}`);
  if (!preview.blocked_capabilities.includes(blocked)) fail(`Preview missing blocked capability: ${blocked}`);
}

for (const scriptName of ["apply:hf13", "generate:hf13", "validate:hf13", "validate:homepage", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Correction Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`HF13 document missing phrase: ${phrase}`);
}

pass("HF13 registry is present.");
pass("HF13 document is present.");
pass("HF13 apply result and preview are present.");
pass("Login page header/menu visibility refinement is present.");
pass("Smooth favicon assets and links are present.");
pass("Top band neutralisation is present.");
pass("HF12 safe select system is preserved and dropdown logic is unchanged.");
pass("Static login page and HF07 header/nav are preserved.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("HF13 is safe to commit.");
