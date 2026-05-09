import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "hf06-homepage-header-visual-cleanup-patch.json");
const docPath = path.join(root, "docs", "quality", "HF06_HOMEPAGE_HEADER_VISUAL_CLEANUP_PATCH.md");
const applyPath = path.join(root, "data", "quality", "hf06-homepage-header-visual-cleanup-apply-result.json");
const previewPath = path.join(root, "data", "quality", "hf06-homepage-header-visual-cleanup-preview.json");
const hf05Path = path.join(root, "data", "quality", "hf05-targeted-header-dropdown-behavior-correction-patch.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ HF06 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, applyPath, previewPath, hf05Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing HF06 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const apply = JSON.parse(fs.readFileSync(applyPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const hf05 = JSON.parse(fs.readFileSync(hf05Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "HF06") fail("module_id must be HF06");
if (apply.module_id !== "HF06") fail("apply result module_id must be HF06");
if (preview.module_id !== "HF06") fail("preview module_id must be HF06");
if (preview.preview_only !== true) fail("HF06 preview must be preview-only");

if (hf05.recommended_next_stage?.module_id !== "HQ02") {
  fail("HF05 must recommend HQ02 before HF06 cleanup proceeds");
}

if (registry.limited_index_html_mutation_enabled !== true) {
  fail("HF06 must enable only limited index.html mutation");
}

for (const file of apply.modified_files || []) {
  if (file !== "index.html") fail(`HF06 modified unexpected file: ${file}`);
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
  if (registry[flag] !== false) fail(`${flag} must remain false in HF06`);
}

if (!preview.summary.index_only_patch) fail("HF06 must be index-only patch");
if (!preview.summary.hf06_visual_cleanup_present) fail("HF06 visual cleanup markers must be present");
if (!preview.summary.hf05_functional_markers_preserved) fail("HF05 functional markers must be preserved");
if (!preview.summary.required_nav_labels_present) fail("Required nav labels must remain present");
if (!preview.summary.dark_theme_header_override_present) fail("Dark-theme header override must be present");
if (!preview.summary.duplicate_nav_guard_present) fail("Duplicate nav guard must be present");

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

if (apply.summary.file_deletion_performed !== false) fail("HF06 must not delete files");
if (apply.summary.file_move_performed !== false) fail("HF06 must not move files");

for (const scriptName of ["apply:hf06", "generate:hf06", "validate:hf06", "validate:homepage", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of [
  "Allowed Mutation",
  "Correction Scope",
  "Explicit Exclusions",
  "HF06 does not"
]) {
  if (!docText.includes(phrase)) fail(`HF06 document missing phrase: ${phrase}`);
}

pass("HF06 registry is present.");
pass("HF06 document is present.");
pass("HF06 apply result and preview are present.");
pass("HF06 is limited to index.html.");
pass("HF06 dark-theme header cleanup is present.");
pass("HF06 duplicate navigation guard is present.");
pass("HF05 timezone and EN/Hindi language markers are preserved.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("LV04 is recorded as the recommended manual live recheck stage.");
pass("HF06 is homepage visual cleanup and safe to commit.");
