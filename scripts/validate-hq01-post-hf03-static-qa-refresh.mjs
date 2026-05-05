import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const registryPath = path.join(root, "data", "quality", "hq01-post-hf03-static-qa-refresh.json");
const docPath = path.join(root, "docs", "quality", "HQ01_POST_HF03_STATIC_QA_REFRESH.md");
const previewPath = path.join(root, "data", "quality", "hq01-post-hf03-static-qa-refresh-preview.json");
const hf03Path = path.join(root, "data", "quality", "hf03-targeted-homepage-header-interaction-stabilization-patch.json");
const packagePath = path.join(root, "package.json");

function fail(message) {
  console.error(`❌ HQ01 validation failed: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const requiredPath of [registryPath, docPath, previewPath, hf03Path, packagePath]) {
  if (!fs.existsSync(requiredPath)) fail(`Missing HQ01 required artifact/dependency: ${requiredPath}`);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
const hf03 = JSON.parse(fs.readFileSync(hf03Path, "utf8"));
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const docText = fs.readFileSync(docPath, "utf8");

if (registry.module_id !== "HQ01") fail("module_id must be HQ01");
if (preview.module_id !== "HQ01") fail("preview module_id must be HQ01");
if (preview.preview_only !== true) fail("HQ01 preview must be preview-only");

if (hf03.recommended_next_stage?.module_id !== "HQ01") {
  fail("HF03 must recommend HQ01 before HQ01 proceeds");
}

for (const dep of ["HF03", "HF02", "LV02", "HQ00", "HF01"]) {
  if (!registry.depends_on.includes(dep)) fail(`HQ01 must depend on ${dep}`);
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
  "homepage_mutation_enabled",
  "page_mutation_enabled",
  "asset_mutation_enabled",
  "css_mutation_enabled",
  "javascript_mutation_enabled",
  "seo_metadata_mutation_enabled",
  "sitemap_mutation_enabled",
  "language_runtime_mutation_enabled",
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
  if (registry[flag] !== false) fail(`${flag} must remain false in HQ01`);
}

for (const area of [
  "hf03_header_stabilizer_marker",
  "hf03_interaction_stabilizer_marker",
  "homepage_navigation_preservation",
  "submissions_dashboard_preservation",
  "signin_join_placeholder_preservation",
  "dropdown_guard_preservation",
  "select_timezone_control_presence",
  "decorative_pointer_safety_presence",
  "language_toggle_manual_boundary",
  "backend_activation_boundary"
]) {
  if (!registry.qa_areas.includes(area)) fail(`Missing HQ01 QA area: ${area}`);
}

for (const label of ["Home", "About", "Insights", "Submissions", "Dashboard", "Contact", "Sign in / Join"]) {
  if (!registry.required_nav_labels.includes(label)) fail(`Missing required nav label: ${label}`);
}

for (const field of registry.preview_required_fields) {
  if (!(field in preview)) fail(`HQ01 preview missing field: ${field}`);
}

if (!preview.summary.index_exists) fail("index.html must exist");
if (!preview.summary.hf03_markers_present) fail("HF03 style/script markers must be present");
if (!preview.summary.required_nav_labels_present) fail("Required nav labels must remain present");
if (!preview.summary.submissions_present) fail("Submissions must remain present");
if (!preview.summary.dashboard_present) fail("Dashboard must remain present");
if (!preview.summary.signin_join_placeholder_present) fail("Sign in / Join placeholder must remain present");
if (!preview.summary.dropdown_guard_preserved) fail("HF01 dropdown guard must be preserved");
if (!preview.summary.select_controls_present) fail("Select/timezone controls should remain present for manual live check");
if (!preview.summary.homepage_stabilization_reference_present) fail("HF03 homepage stabilization reference must be present");
if (!preview.summary.decorative_pointer_safety_present) fail("HF03 decorative pointer-safety logic must be present");
if (!preview.summary.qa_static_missing_assets_zero) fail("QA static missing assets must remain zero");
if (!preview.summary.qa_static_missing_links_zero) fail("QA static missing links must remain zero");

if (preview.summary.mutation_performed_count !== 0) fail("HQ01 mutation count must be zero");
if (preview.summary.activation_performed_count !== 0) fail("HQ01 activation count must be zero");

for (const falseField of [
  "backend_activation_enabled",
  "api_route_enabled",
  "supabase_enabled",
  "auth_enabled",
  "real_login_enabled",
  "real_signup_enabled",
  "user_account_collection_enabled",
  "public_dynamic_output_enabled",
  "subscriber_output_enabled",
  "frontend_deployment_enabled",
  "backend_deployment_enabled"
]) {
  if (preview.summary[falseField] !== false) fail(`HQ01 preview ${falseField} must be false`);
}

for (const blocked of registry.blocked_capabilities) {
  if (!preview.blocked_capabilities.includes(blocked)) {
    fail(`HQ01 preview missing blocked capability: ${blocked}`);
  }
}

if (registry.recommended_next_stage?.module_id !== "LV03") {
  fail("HQ01 recommended next stage must be LV03");
}
if (registry.recommended_next_stage?.runtime_allowed !== false) fail("LV03 runtime_allowed must be false");
if (registry.recommended_next_stage?.auth_allowed !== false) fail("LV03 auth_allowed must be false");
if (registry.recommended_next_stage?.deployment_allowed !== false) fail("LV03 deployment_allowed must be false");
if (registry.recommended_next_stage?.activation_decision_allowed !== false) fail("LV03 activation decision must be false");

for (const scriptName of ["generate:hq01", "validate:hq01", "validate:homepage", "validate:project"]) {
  if (!pkg.scripts?.[scriptName]) fail(`Missing package script: ${scriptName}`);
}

for (const phrase of [
  "HQ01 QA Scope",
  "Header QA Requirement",
  "Interaction QA Requirement",
  "Navigation Preservation Requirement",
  "Dropdown and Timezone Boundary",
  "Language Toggle Boundary",
  "Activation Boundary",
  "Recommended Next Stage",
  "Explicit Exclusions",
  "HQ01 does not"
]) {
  if (!docText.includes(phrase)) fail(`HQ01 document missing phrase: ${phrase}`);
}

pass("HQ01 registry is present.");
pass("HQ01 document is present.");
pass("HQ01 post-HF03 static QA preview is present and marked preview-only.");
pass("HF03 evidence is read.");
pass("HF03 header and interaction markers are present.");
pass("Required homepage navigation labels are preserved.");
pass("Dropdown guard and Sign in / Join static placeholder are preserved.");
pass("QA static missing assets and links remain zero.");
pass("Runtime/backend/Supabase/Auth/API/public/subscriber activation remains no-go.");
pass("LV03 is recorded as the recommended manual live recheck stage.");
pass("HQ01 is post-HF03 static QA refresh only and safe to commit.");
