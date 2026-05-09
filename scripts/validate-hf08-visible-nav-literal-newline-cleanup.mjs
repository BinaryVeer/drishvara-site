import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf08-visible-nav-literal-newline-cleanup-patch.json");
const docPath = path.join(root, "docs", "quality", "HF08_VISIBLE_NAV_LITERAL_NEWLINE_CLEANUP_PATCH.md");
const applyPath = path.join(root, "data", "quality", "hf08-visible-nav-literal-newline-cleanup-apply-result.json");
const previewPath = path.join(root, "data", "quality", "hf08-visible-nav-literal-newline-cleanup-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ HF08 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, applyPath, previewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing HF08 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const apply = JSON.parse(fs.readFileSync(applyPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "HF08") fail("module_id must be HF08");
if (apply.module_id !== "HF08") fail("apply result module_id must be HF08");
if (preview.module_id !== "HF08") fail("preview module_id must be HF08");
if (preview.preview_only !== true) fail("HF08 preview must be preview-only");

if (registry.limited_static_frontend_mutation_enabled !== true) {
  fail("HF08 must enable only limited static frontend mutation");
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
  if (registry[flag] !== false) fail(`${flag} must remain false in HF08`);
}

for (const correction of [
  "force_visible_hf07_navigation",
  "remove_literal_backslash_n_text_nodes",
  "preserve_timezone_selector",
  "preserve_visible_en_hindi_toggle",
  "preserve_static_signin_join_placeholder",
  "preserve_dropdown_responsiveness",
  "keep_backend_supabase_auth_api_disabled"
]) {
  if (!registry.corrections.includes(correction)) fail(`Missing correction: ${correction}`);
}

if (!preview.summary.all_samples_have_hf08_style) fail("All sample files must have HF08 visible-nav style");
if (!preview.summary.all_samples_have_hf08_script) fail("All sample files must have HF08 literal-newline cleanup script");
if (!preview.summary.all_samples_have_hf07_header) fail("All sample files must retain HF07 header");
if (!preview.summary.all_samples_have_hf07_nav) fail("All sample files must retain HF07 nav marker");
if (!preview.summary.all_samples_have_hf07_dropdown_style) fail("All sample files must retain HF07 dropdown style");
if (!preview.summary.all_samples_have_timezone) fail("All sample files must retain timezone selector");
if (!preview.summary.all_samples_have_language_toggle) fail("All sample files must retain EN/Hindi language toggle");
if (!preview.summary.all_samples_have_auth_placeholder) fail("All sample files must preserve auth placeholder");
if (!preview.summary.all_samples_have_required_nav_labels) fail("All sample files must preserve required nav labels");
if (!preview.summary.literal_backslash_n_removed_outside_script_style) fail("Literal backslash-n must be removed outside script/style");

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

if (apply.summary.file_deletion_performed !== false) fail("HF08 must not delete files");
if (apply.summary.file_move_performed !== false) fail("HF08 must not move files");

for (const file of apply.modified_files || []) {
  if (file.startsWith("archive/")) fail(`HF08 must not modify archive files: ${file}`);
  if (file.includes("backup")) fail(`HF08 must not modify backup files: ${file}`);
  if (!file.endsWith(".html")) fail(`HF08 applier must modify only HTML files: ${file}`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!apply.blocked_capabilities.includes(blocked)) fail(`Apply missing blocked capability: ${blocked}`);
  if (!preview.blocked_capabilities.includes(blocked)) fail(`Preview missing blocked capability: ${blocked}`);
}

if (registry.recommended_next_stage?.module_id !== "LV04") {
  fail("HF08 recommended next stage must be LV04");
}

for (const scriptName of ["apply:hf08", "generate:hf08", "validate:hf08", "validate:homepage", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of [
  "Correction Scope",
  "Explicit Exclusions",
  "Acceptance Criteria"
]) {
  if (!docText.includes(phrase)) fail(`HF08 document missing phrase: ${phrase}`);
}

pass("HF08 registry is present.");
pass("HF08 document is present.");
pass("HF08 apply result and preview are present.");
pass("HF08 visible navigation override is applied across sample public pages.");
pass("HF07 header/nav, timezone and EN/Hindi controls are preserved.");
pass("Literal backslash-n text is removed outside script/style blocks.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("LV04 is recorded as the recommended manual live recheck stage.");
pass("HF08 is visible-nav/literal-newline cleanup and safe to commit.");
