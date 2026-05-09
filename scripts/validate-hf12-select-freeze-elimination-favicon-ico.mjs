import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf12-select-freeze-elimination-favicon-ico-patch.json");
const docPath = path.join(root, "docs", "quality", "HF12_SELECT_FREEZE_ELIMINATION_FAVICON_ICO_PATCH.md");
const applyPath = path.join(root, "data", "quality", "hf12-select-freeze-elimination-favicon-ico-apply-result.json");
const previewPath = path.join(root, "data", "quality", "hf12-select-freeze-elimination-favicon-ico-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ HF12 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, applyPath, previewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing HF12 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const apply = JSON.parse(fs.readFileSync(applyPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "HF12") fail("module_id must be HF12");
if (apply.module_id !== "HF12") fail("apply result module_id must be HF12");
if (preview.module_id !== "HF12") fail("preview module_id must be HF12");
if (preview.preview_only !== true) fail("HF12 preview must be preview-only");

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
  if (registry[flag] !== false) fail(`${flag} must remain false in HF12`);
}

if (!preview.summary.favicon_ico_exists) fail("favicon.ico must exist");
if (!preview.summary.favicon_svg_exists) fail("favicon.svg must exist");
if (!preview.summary.apple_touch_icon_exists) fail("apple-touch-icon.png must exist");
if (!preview.summary.all_samples_have_hf12_select_style) fail("All samples must have HF12 select style");
if (!preview.summary.all_samples_have_hf12_select_script) fail("All samples must have HF12 select script");
if (!preview.summary.all_samples_have_hf12_favicon_links) fail("All samples must have HF12 favicon links");
if (!preview.summary.all_non_login_samples_preserve_hf07_header_nav) fail("HF07 header/nav must be preserved");
if (!preview.summary.login_page_remains_static) fail("login.html must remain static");

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

if (apply.summary.file_deletion_performed !== false) fail("HF12 must not delete files");
if (apply.summary.file_move_performed !== false) fail("HF12 must not move files");

for (const file of apply.modified_files || []) {
  if (file.startsWith("archive/")) fail(`HF12 must not modify archive files: ${file}`);
  if (file.includes("backup")) fail(`HF12 must not modify backup files: ${file}`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!apply.blocked_capabilities.includes(blocked)) fail(`Apply missing blocked capability: ${blocked}`);
  if (!preview.blocked_capabilities.includes(blocked)) fail(`Preview missing blocked capability: ${blocked}`);
}

for (const scriptName of ["apply:hf12", "generate:hf12", "validate:hf12", "validate:homepage", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Correction Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`HF12 document missing phrase: ${phrase}`);
}

pass("HF12 registry is present.");
pass("HF12 document is present.");
pass("HF12 apply result and preview are present.");
pass("Safe custom select system is applied across checked public pages.");
pass("favicon.ico, favicon.svg, and apple-touch-icon.png are present.");
pass("HF07 header/nav and static login page are preserved.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("LV04 is recorded as the recommended manual live recheck stage.");
pass("HF12 is select-freeze elimination and favicon ICO fallback patch and safe to commit.");
