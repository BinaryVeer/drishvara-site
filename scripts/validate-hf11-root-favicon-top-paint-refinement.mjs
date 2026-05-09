import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "data", "quality", "hf11-root-favicon-top-paint-refinement-patch.json");
const docPath = path.join(root, "docs", "quality", "HF11_ROOT_FAVICON_TOP_PAINT_REFINEMENT_PATCH.md");
const applyPath = path.join(root, "data", "quality", "hf11-root-favicon-top-paint-refinement-apply-result.json");
const previewPath = path.join(root, "data", "quality", "hf11-root-favicon-top-paint-refinement-preview.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ HF11 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, applyPath, previewPath, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing HF11 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const apply = JSON.parse(fs.readFileSync(applyPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "HF11") fail("module_id must be HF11");
if (apply.module_id !== "HF11") fail("apply result module_id must be HF11");
if (preview.module_id !== "HF11") fail("preview module_id must be HF11");
if (preview.preview_only !== true) fail("HF11 preview must be preview-only");

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
  if (registry[flag] !== false) fail(`${flag} must remain false in HF11`);
}

if (!preview.summary.root_favicon_exists) fail("Root favicon.svg must exist");
if (!preview.summary.asset_favicon_exists) fail("Asset favicon must exist");
if (!preview.summary.all_samples_have_hf11_favicon) fail("All samples must have HF11 root favicon links");
if (!preview.summary.all_samples_have_hf11_top_paint) fail("All samples must have HF11 top paint refinement");
if (!preview.summary.all_samples_preserve_hf10_critical_paint) fail("HF10 critical paint must be preserved");
if (!preview.summary.all_samples_preserve_hf09_favicon) fail("HF09 favicon must be preserved");
if (!preview.summary.login_page_remains_static) fail("login.html must remain static");
if (!preview.summary.all_non_login_samples_preserve_hf07_header_nav) fail("HF07 header/nav must be preserved");
if (!preview.summary.all_samples_have_top_band_refinement) fail("Top band refinement CSS must be present");

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

if (apply.summary.file_deletion_performed !== false) fail("HF11 must not delete files");
if (apply.summary.file_move_performed !== false) fail("HF11 must not move files");

for (const file of apply.modified_files || []) {
  if (file.startsWith("archive/")) fail(`HF11 must not modify archive files: ${file}`);
  if (file.includes("backup")) fail(`HF11 must not modify backup files: ${file}`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!apply.blocked_capabilities.includes(blocked)) fail(`Apply missing blocked capability: ${blocked}`);
  if (!preview.blocked_capabilities.includes(blocked)) fail(`Preview missing blocked capability: ${blocked}`);
}

if (registry.recommended_next_stage?.module_id !== "LV04") {
  fail("HF11 recommended next stage must be LV04");
}

for (const scriptName of ["apply:hf11", "generate:hf11", "validate:hf11", "validate:homepage", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of ["Correction Scope", "Explicit Exclusions", "Acceptance Criteria"]) {
  if (!docText.includes(phrase)) fail(`HF11 document missing phrase: ${phrase}`);
}

pass("HF11 registry is present.");
pass("HF11 document is present.");
pass("HF11 apply result and preview are present.");
pass("Root favicon.svg fallback is created and linked.");
pass("Top paint band refinement is present.");
pass("HF10, HF09, and HF07 markers are preserved.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("LV04 is recorded as the recommended manual live recheck stage.");
pass("HF11 is root favicon/top paint refinement and safe to commit.");
