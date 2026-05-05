import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "hf03-targeted-homepage-header-interaction-stabilization-patch.json");
const docPath = path.join(root, "docs", "quality", "HF03_TARGETED_HOMEPAGE_HEADER_INTERACTION_STABILIZATION_PATCH.md");
const applyPath = path.join(root, "data", "quality", "hf03-homepage-header-interaction-stabilization-apply-result.json");
const previewPath = path.join(root, "data", "quality", "hf03-homepage-header-interaction-stabilization-preview.json");
const hf02Path = path.join(root, "data", "quality", "hf02-homepage-header-layout-interaction-stabilization-fix-plan.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ HF03 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, applyPath, previewPath, hf02Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing HF03 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const apply = JSON.parse(fs.readFileSync(applyPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const hf02 = JSON.parse(fs.readFileSync(hf02Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "HF03") fail("module_id must be HF03");
if (apply.module_id !== "HF03") fail("apply result module_id must be HF03");
if (preview.module_id !== "HF03") fail("preview module_id must be HF03");
if (preview.preview_only !== true) fail("HF03 preview must be preview-only");

if (hf02.recommended_next_stage?.module_id !== "HF03") {
  fail("HF02 must recommend HF03 before HF03 proceeds");
}

if (registry.limited_homepage_static_mutation_enabled !== true) {
  fail("HF03 must enable only limited homepage static mutation");
}

if (!Array.isArray(registry.allowed_mutation_targets) || registry.allowed_mutation_targets.length !== 1 || registry.allowed_mutation_targets[0] !== "index.html") {
  fail("HF03 must allow mutation only on index.html");
}

for (const file of apply.modified_files || []) {
  if (file !== "index.html") fail(`HF03 modified unexpected file: ${file}`);
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
  if (registry[flag] !== false) fail(`${flag} must remain false in HF03`);
}

for (const correction of [
  "homepage_header_layout_stabilizer",
  "homepage_navigation_alignment",
  "timezone_select_control_stabilizer",
  "decorative_layer_pointer_safety",
  "account_placeholder_click_guard",
  "dropdown_select_usability_preservation",
  "language_toggle_protection_boundary"
]) {
  if (!registry.corrections.includes(correction)) fail(`Missing correction: ${correction}`);
}

for (const label of registry.required_nav_labels) {
  const status = preview.static_scan.required_nav_label_status.find((item) => item.label === label);
  if (!status || status.present !== true) fail(`Required nav label missing from index.html: ${label}`);
}

if (!preview.summary.index_only_patch) fail("HF03 must be index-only patch");
if (!preview.summary.style_marker_present) fail("HF03 style marker must be present");
if (!preview.summary.script_marker_present) fail("HF03 script marker must be present");
if (!preview.summary.required_nav_labels_present) fail("Required nav labels must remain present");
if (!preview.summary.dropdown_guard_preserved) fail("HF01 dropdown guard must be preserved");
if (!preview.summary.auth_placeholder_preserved) fail("Auth placeholder marker must be preserved");
if (!preview.summary.homepage_stabilization_present) fail("Homepage stabilization class/script reference must be present");

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

if (apply.summary.file_deletion_performed !== false) fail("HF03 must not delete files");
if (apply.summary.file_move_performed !== false) fail("HF03 must not move files");

for (const blocked of registry.blocked_capabilities) {
  if (!apply.blocked_capabilities.includes(blocked)) fail(`Apply missing blocked capability: ${blocked}`);
  if (!preview.blocked_capabilities.includes(blocked)) fail(`Preview missing blocked capability: ${blocked}`);
}

if (registry.recommended_next_stage?.module_id !== "HQ01") {
  fail("HF03 recommended next stage must be HQ01");
}
if (registry.recommended_next_stage?.auth_allowed !== false) fail("HQ01 auth_allowed must be false");
if (registry.recommended_next_stage?.deployment_allowed !== false) fail("HQ01 deployment_allowed must be false");
if (registry.recommended_next_stage?.activation_decision_allowed !== false) fail("HQ01 activation decision must be false");

for (const scriptName of ["apply:hf03", "generate:hf03", "validate:hf03", "validate:homepage", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of [
  "Allowed Mutation",
  "Header Stabilization Target",
  "Interaction Stabilization Target",
  "Language Toggle Protection",
  "Sign in / Join Boundary",
  "Post-Fix Verification",
  "Explicit Exclusions",
  "HF03 does not"
]) {
  if (!docText.includes(phrase)) fail(`HF03 document missing phrase: ${phrase}`);
}

pass("HF03 registry is present.");
pass("HF03 document is present.");
pass("HF03 apply result and preview are present.");
pass("HF03 is limited to index.html.");
pass("HF03 header and interaction stabilizer markers are present.");
pass("Required homepage navigation labels remain present.");
pass("Dropdown guard and Sign in / Join placeholder are preserved.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("HQ01 is recorded as the recommended post-HF03 QA stage.");
pass("HF03 is targeted homepage stabilization and safe to commit.");
