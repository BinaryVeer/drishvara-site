import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf09-smooth-nav-signin-favicon-patch.json");
const docPath = path.join(root, "docs", "quality", "HF09_SMOOTH_NAV_SIGNIN_FAVICON_PATCH.md");
const applyPath = path.join(root, "data", "quality", "hf09-smooth-nav-signin-favicon-apply-result.json");
const previewPath = path.join(root, "data", "quality", "hf09-smooth-nav-signin-favicon-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ HF09 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, applyPath, previewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing HF09 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const apply = JSON.parse(fs.readFileSync(applyPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "HF09") fail("module_id must be HF09");
if (apply.module_id !== "HF09") fail("apply result module_id must be HF09");
if (preview.module_id !== "HF09") fail("preview module_id must be HF09");
if (preview.preview_only !== true) fail("HF09 preview must be preview-only");

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
  if (registry[flag] !== false) fail(`${flag} must remain false in HF09`);
}

if (!preview.summary.favicon_svg_exists) fail("Drishvara favicon SVG must exist");
if (!preview.summary.login_page_exists) fail("login.html must exist");
if (!preview.summary.all_samples_have_favicon_link) fail("All samples must have favicon link");
if (!preview.summary.all_non_login_samples_have_flicker_guard) fail("All non-login samples must have flicker guard");
if (!preview.summary.all_non_login_samples_have_correct_signin_href) fail("Sign in / Join links must point to login page");
if (!preview.summary.login_page_static_marker_present) fail("Login page must include HF09 static marker");
if (!preview.summary.login_page_auth_not_active_text_present) fail("Login page must clearly state auth is not active");
if (!preview.summary.all_non_login_samples_preserve_hf07_header_nav) fail("HF07 header/nav must be preserved");
if (!preview.summary.all_non_login_samples_preserve_timezone) fail("Timezone selector must be preserved");
if (!preview.summary.all_non_login_samples_preserve_language_toggle) fail("Language toggle must be preserved");
if (!preview.summary.literal_backslash_n_removed_outside_script_style) fail("Literal backslash-n must be removed outside script/style");

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

if (apply.summary.file_deletion_performed !== false) fail("HF09 must not delete files");
if (apply.summary.file_move_performed !== false) fail("HF09 must not move files");

for (const file of apply.modified_files || []) {
  if (file.startsWith("archive/")) fail(`HF09 must not modify archive files: ${file}`);
  if (file.includes("backup")) fail(`HF09 must not modify backup files: ${file}`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!apply.blocked_capabilities.includes(blocked)) fail(`Apply missing blocked capability: ${blocked}`);
  if (!preview.blocked_capabilities.includes(blocked)) fail(`Preview missing blocked capability: ${blocked}`);
}

if (registry.recommended_next_stage?.module_id !== "LV04") {
  fail("HF09 recommended next stage must be LV04");
}

for (const scriptName of ["apply:hf09", "generate:hf09", "validate:hf09", "validate:homepage", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of [
  "Correction Scope",
  "Sign in / Join Boundary",
  "Explicit Exclusions",
  "Acceptance Criteria"
]) {
  if (!docText.includes(phrase)) fail(`HF09 document missing phrase: ${phrase}`);
}

pass("HF09 registry is present.");
pass("HF09 document is present.");
pass("HF09 apply result and preview are present.");
pass("Drishvara favicon SVG is created and linked.");
pass("Static Sign in / Join page is created without Auth activation.");
pass("Sign in / Join links point to login.html with correct relative paths.");
pass("Early flicker guard is present.");
pass("HF07 header/nav, timezone, and EN/Hindi controls are preserved.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("LV04 is recorded as the recommended manual live recheck stage.");
pass("HF09 is smooth-nav/signin/favicon static correction and safe to commit.");
